import { useState, useRef, useCallback } from "react";
import { Piano, type ScaleHighlight } from "../components/Piano";
import { ScaleSelector } from "../components/ScaleSelector";
import { useKeyboardPiano } from "../hooks/useKeyboardPiano";
import { AudioEngine } from "../audio/AudioEngine";
import { Synthesizer } from "../audio/Synthesizer";
import { SCALES } from "../data/scales";
import { detectChord, INTERVAL_NAMES } from "../data/chords";

const NOTE_NAMES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];

export function PianoPage() {
  const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());
  const [scaleRoot, setScaleRoot] = useState<number | null>(null);
  const [scaleName, setScaleName] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.65);
  const synthRef = useRef<Synthesizer | null>(null);

  function getSynth(): Synthesizer {
    if (!synthRef.current) {
      const ctx = AudioEngine.getInstance().getContext();
      synthRef.current = new Synthesizer(ctx);
    }
    return synthRef.current;
  }

  const noteOn = useCallback((midi: number) => {
    const synth = getSynth();
    synth.setVolume(volume);
    synth.noteOn(midi);
    setActiveNotes((prev) => new Set([...prev, midi]));
  }, [volume]);

  const noteOff = useCallback((midi: number) => {
    getSynth().noteOff(midi);
    setActiveNotes((prev) => {
      const next = new Set(prev);
      next.delete(midi);
      return next;
    });
  }, []);

  useKeyboardPiano(noteOn, noteOff);

  // Build scale highlight
  const scaleHighlight: ScaleHighlight | null = (() => {
    if (scaleRoot === null || !scaleName) return null;
    const def = SCALES.find((s) => s.name === scaleName);
    if (!def) return null;
    return { root: scaleRoot, intervals: def.intervals, degreeNames: def.degreeNames };
  })();

  // Harmony detection
  const notes = [...activeNotes].sort((a, b) => a - b);
  let harmonyLabel = "";
  if (notes.length === 1) {
    const pc = notes[0] % 12;
    const oct = Math.floor(notes[0] / 12) - 1;
    harmonyLabel = `${NOTE_NAMES[pc]}${oct}`;
  } else if (notes.length === 2) {
    const interval = Math.abs(notes[1] - notes[0]);
    harmonyLabel = INTERVAL_NAMES[Math.min(interval, 12)] ?? "";
  } else if (notes.length >= 3) {
    harmonyLabel = detectChord(notes) ?? "";
  }

  const noteLabels = notes.map((m) => {
    const pc = m % 12;
    const oct = Math.floor(m / 12) - 1;
    return `${NOTE_NAMES[pc]}${oct}`;
  });

  return (
    <div className="flex flex-col h-full px-6 py-5 gap-5">
      <h1 className="text-xs text-text-muted uppercase tracking-widest">Keyboard</h1>

      {/* Note + harmony display */}
      <div className="text-center min-h-[56px]">
        <div className="text-2xl font-bold text-text-primary">
          {noteLabels.length > 0 ? noteLabels.join("  +  ") : <span className="text-text-muted">—</span>}
        </div>
        <div className="text-accent-blue text-sm mt-1">{harmonyLabel}</div>
      </div>

      {/* Piano */}
      <div className="flex justify-center">
        <Piano
          startMidi={48}
          endMidi={72}
          activeNotes={activeNotes}
          scaleHighlight={scaleHighlight}
          onNoteOn={noteOn}
          onNoteOff={noteOff}
          showKeyboardLabels
        />
      </div>

      {/* Controls */}
      <div className="flex items-end gap-6 flex-wrap">
        <ScaleSelector
          root={scaleRoot}
          scaleName={scaleName}
          onRootChange={setScaleRoot}
          onScaleChange={setScaleName}
        />

        <div className="flex flex-col gap-1">
          <label className="text-xs text-text-muted uppercase tracking-wider">Volume</label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              setVolume(v);
              synthRef.current?.setVolume(v);
            }}
            className="w-28 accent-accent-blue"
          />
        </div>
      </div>

      {/* Keyboard guide */}
      <div className="text-xs text-text-muted mt-auto leading-relaxed">
        <span className="text-text-secondary">Lower (C3–B3):</span>{" "}
        white — Z X C V B N M &nbsp;·&nbsp; black — S D G H J
        &nbsp;&nbsp;
        <span className="text-text-secondary">Upper (C4–C5):</span>{" "}
        white — Q W E R T Y U I &nbsp;·&nbsp; black — 2 3 5 6 7
      </div>
    </div>
  );
}
