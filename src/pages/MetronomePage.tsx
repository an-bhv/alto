import { useState, useRef } from "react";
import { useMetronome } from "../hooks/useMetronome";

const TIME_SIGNATURES = [2, 3, 4, 5, 6, 7];
const SUBDIVISIONS = [
  { label: "♩", value: 1 },
  { label: "♩♩", value: 2 },
  { label: "♩♩♩", value: 3 },
  { label: "♬", value: 4 },
];

export function MetronomePage() {
  const { state, setBpm, setBeatsPerMeasure, setSubdivision, toggle, tapTempo } = useMetronome();
  const [editingBpm, setEditingBpm] = useState(false);
  const [bpmInput, setBpmInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function startEdit() {
    setBpmInput(String(state.bpm));
    setEditingBpm(true);
    setTimeout(() => inputRef.current?.select(), 10);
  }

  function commitEdit() {
    const v = parseInt(bpmInput);
    if (!isNaN(v)) setBpm(v);
    setEditingBpm(false);
  }

  const beats = Array.from({ length: state.beatsPerMeasure }, (_, i) => i);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 px-8">
      <h1 className="text-xs text-text-muted uppercase tracking-widest">Metronome</h1>

      {/* BPM display */}
      <div className="text-center">
        {editingBpm ? (
          <input
            ref={inputRef}
            value={bpmInput}
            onChange={(e) => setBpmInput(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") setEditingBpm(false); }}
            className="text-7xl font-bold w-48 text-center bg-transparent text-text-primary outline-none border-b-2 border-accent-blue tabular-nums"
            type="number"
            min={30}
            max={300}
          />
        ) : (
          <div
            className="text-7xl font-bold text-text-primary cursor-pointer hover:text-accent-blue transition-colors tabular-nums"
            onClick={startEdit}
            title="Click to edit BPM"
          >
            {state.bpm}
          </div>
        )}
        <div className="text-text-muted text-sm mt-1">BPM</div>
      </div>

      {/* BPM slider */}
      <div className="w-64">
        <input
          type="range"
          min={30}
          max={300}
          value={state.bpm}
          onChange={(e) => setBpm(parseInt(e.target.value))}
          className="w-full accent-accent-blue"
        />
        <div className="flex justify-between text-xs text-text-muted mt-1">
          <span>30</span><span>300</span>
        </div>
      </div>

      {/* Beat indicator */}
      <div className="flex gap-3">
        {beats.map((i) => (
          <div
            key={i}
            className={[
              "w-8 h-8 rounded-full transition-all duration-75",
              state.isPlaying && i === state.currentBeat
                ? i === 0
                  ? "bg-accent-green scale-125"
                  : "bg-accent-blue scale-110"
                : "bg-bg-elevated",
            ].join(" ")}
          />
        ))}
      </div>

      {/* Controls row */}
      <div className="flex gap-6 flex-wrap justify-center">
        {/* Time signature */}
        <div className="flex flex-col gap-2">
          <span className="text-xs text-text-muted uppercase tracking-wider text-center">Time</span>
          <div className="flex gap-1">
            {TIME_SIGNATURES.map((ts) => (
              <button
                key={ts}
                onClick={() => setBeatsPerMeasure(ts)}
                className={[
                  "w-8 h-8 rounded text-xs font-mono transition-colors",
                  state.beatsPerMeasure === ts
                    ? "bg-accent-blue text-white"
                    : "bg-bg-elevated text-text-muted hover:text-text-primary",
                ].join(" ")}
              >
                {ts}/4
              </button>
            ))}
          </div>
        </div>

        {/* Subdivisions */}
        <div className="flex flex-col gap-2">
          <span className="text-xs text-text-muted uppercase tracking-wider text-center">Subdivisions</span>
          <div className="flex gap-1">
            {SUBDIVISIONS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setSubdivision(value)}
                className={[
                  "px-3 h-8 rounded text-xs transition-colors",
                  state.subdivision === value
                    ? "bg-accent-blue text-white"
                    : "bg-bg-elevated text-text-muted hover:text-text-primary",
                ].join(" ")}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tap tempo + play/stop */}
      <div className="flex gap-4">
        <button
          onClick={tapTempo}
          className="px-8 py-3 rounded-lg bg-bg-elevated text-text-primary hover:bg-bg-elevated hover:text-white border border-border text-sm font-medium transition-colors"
        >
          Tap Tempo
        </button>
        <button
          onClick={toggle}
          className={[
            "px-10 py-3 rounded-lg font-semibold text-sm transition-colors",
            state.isPlaying
              ? "bg-accent-red hover:bg-red-600 text-white"
              : "bg-accent-blue hover:bg-blue-500 text-white",
          ].join(" ")}
        >
          {state.isPlaying ? "Stop" : "Start"}
        </button>
      </div>
    </div>
  );
}
