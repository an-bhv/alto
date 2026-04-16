import { useState, useRef, useCallback, useEffect } from "react";
import { AudioEngine } from "../audio/AudioEngine";
import { MetronomeEngine } from "../audio/MetronomeEngine";

export interface MetronomeState {
  bpm: number;
  isPlaying: boolean;
  beatsPerMeasure: number;
  subdivision: number;
  currentBeat: number;
  currentSub: number;
}

export function useMetronome() {
  const engineRef = useRef<MetronomeEngine | null>(null);
  const [state, setState] = useState<MetronomeState>({
    bpm: 120,
    isPlaying: false,
    beatsPerMeasure: 4,
    subdivision: 1,
    currentBeat: 0,
    currentSub: 0,
  });

  const getEngine = useCallback(() => {
    if (!engineRef.current) {
      const ctx = AudioEngine.getInstance().getContext();
      engineRef.current = new MetronomeEngine(ctx);
      engineRef.current.onBeat = (beat, sub) => {
        setState((prev) => ({ ...prev, currentBeat: beat, currentSub: sub }));
      };
    }
    return engineRef.current;
  }, []);

  const setBpm = useCallback((bpm: number) => {
    const engine = getEngine();
    engine.setBpm(bpm);
    setState((prev) => ({ ...prev, bpm: engine.getBpm() }));
  }, [getEngine]);

  const setBeatsPerMeasure = useCallback((beats: number) => {
    const engine = getEngine();
    engine.setBeatsPerMeasure(beats);
    setState((prev) => ({ ...prev, beatsPerMeasure: beats }));
  }, [getEngine]);

  const setSubdivision = useCallback((sub: number) => {
    const engine = getEngine();
    engine.setSubdivision(sub);
    setState((prev) => ({ ...prev, subdivision: sub }));
  }, [getEngine]);

  const start = useCallback(() => {
    const engine = getEngine();
    engine.start();
    setState((prev) => ({ ...prev, isPlaying: true, currentBeat: 0, currentSub: 0 }));
  }, [getEngine]);

  const stop = useCallback(() => {
    const engine = getEngine();
    engine.stop();
    setState((prev) => ({ ...prev, isPlaying: false, currentBeat: 0, currentSub: 0 }));
  }, [getEngine]);

  const toggle = useCallback(() => {
    if (state.isPlaying) stop();
    else start();
  }, [state.isPlaying, start, stop]);

  const tapTempo = useCallback(() => {
    const now = performance.now();
    if (!tapTimesRef.current) tapTimesRef.current = [];
    tapTimesRef.current.push(now);
    // Keep last 8 taps
    if (tapTimesRef.current.length > 8) tapTimesRef.current.shift();
    // Need at least 2 taps
    if (tapTimesRef.current.length < 2) return;
    // Reset if gap > 2 seconds
    const taps = tapTimesRef.current;
    if (now - taps[taps.length - 2] > 2000) {
      tapTimesRef.current = [now];
      return;
    }
    // Average interval
    let totalInterval = 0;
    for (let i = 1; i < taps.length; i++) {
      totalInterval += taps[i] - taps[i - 1];
    }
    const avgMs = totalInterval / (taps.length - 1);
    const bpm = Math.round(60000 / avgMs);
    setBpm(bpm);
  }, [setBpm]);

  const tapTimesRef = useRef<number[] | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      engineRef.current?.stop();
    };
  }, []);

  return { state, setBpm, setBeatsPerMeasure, setSubdivision, start, stop, toggle, tapTempo };
}
