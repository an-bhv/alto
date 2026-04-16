import { useState, useRef, useCallback } from "react";
import { AudioEngine } from "../audio/AudioEngine";
import { PitchDetector } from "../audio/PitchDetector";
import { frequencyToNoteInfo } from "../utils/musicTheory";
import { concertToWritten } from "../data/transposition";
import { midiToNoteName, midiToOctave, type NoteInfo } from "../data/notes";

export interface PitchData {
  frequency: number;
  concertNote: NoteInfo;
  writtenNote: NoteInfo;
  confidence: number;
}

const HISTORY_SIZE = 300; // ~5 seconds at 60fps

export function usePitchDetection() {
  const [pitchData, setPitchData] = useState<PitchData | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [history, setHistory] = useState<PitchData[]>([]);

  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const detectorRef = useRef<PitchDetector | null>(null);
  const rafRef = useRef<number>(0);
  const bufferRef = useRef<Float32Array | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const historyRef = useRef<PitchData[]>([]);

  const loop = useCallback(() => {
    if (!analyserRef.current || !bufferRef.current || !detectorRef.current) return;
    rafRef.current = requestAnimationFrame(loop);

    analyserRef.current.getFloatTimeDomainData(bufferRef.current);
    const result = detectorRef.current.detect(bufferRef.current);

    if (!result) {
      // Silence — clear after delay
      if (!silenceTimerRef.current) {
        silenceTimerRef.current = setTimeout(() => {
          setPitchData(null);
        }, 300);
      }
      return;
    }

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    const concertNote = frequencyToNoteInfo(result.frequency);
    const writtenMidi = concertToWritten(concertNote.midi);
    const writtenNote: NoteInfo = {
      name: midiToNoteName(writtenMidi),
      octave: midiToOctave(writtenMidi),
      midi: writtenMidi,
      cents: concertNote.cents,
    };

    const data: PitchData = {
      frequency: result.frequency,
      concertNote,
      writtenNote,
      confidence: result.confidence,
    };

    setPitchData(data);

    // Update history ring buffer
    historyRef.current = [...historyRef.current.slice(-(HISTORY_SIZE - 1)), data];
    setHistory(historyRef.current);
  }, []);

  const startListening = useCallback(async () => {
    const engine = AudioEngine.getInstance();
    const ctx = engine.getContext();
    const stream = await engine.requestMicrophone();

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 8192; // bufferSize * 2 for 4096 time-domain samples
    analyser.smoothingTimeConstant = 0;

    const source = ctx.createMediaStreamSource(stream);
    source.connect(analyser);
    // Do NOT connect analyser to destination (no feedback)

    analyserRef.current = analyser;
    sourceRef.current = source;
    detectorRef.current = new PitchDetector(ctx.sampleRate, 4096, 0.15);
    bufferRef.current = new Float32Array(4096);
    historyRef.current = [];

    setIsListening(true);
    setPitchData(null);
    setHistory([]);
    rafRef.current = requestAnimationFrame(loop);
  }, [loop]);

  const stopListening = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    analyserRef.current = null;
    AudioEngine.getInstance().releaseMicrophone();
    setIsListening(false);
    setPitchData(null);
  }, []);

  return { pitchData, isListening, startListening, stopListening, history };
}
