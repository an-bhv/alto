import type { MetronomeState } from "../hooks/useMetronome";

interface MetronomeWidgetProps {
  state: MetronomeState;
  onToggle: () => void;
  onTap: () => void;
}

export function MetronomeWidget({ state, onToggle, onTap }: MetronomeWidgetProps) {
  return (
    <div className="flex flex-col items-center gap-1 mt-auto pb-2">
      <div className="text-xs text-text-muted tabular-nums">{state.bpm}</div>
      <button
        onClick={onToggle}
        className={[
          "w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-xs",
          state.isPlaying
            ? "bg-accent-green text-white"
            : "text-text-muted hover:bg-bg-elevated hover:text-text-primary",
        ].join(" ")}
        title={state.isPlaying ? "Stop metronome" : "Start metronome"}
      >
        {state.isPlaying ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M5 4l15 8-15 8V4z" />
          </svg>
        )}
      </button>
      <button
        onClick={onTap}
        className="text-text-muted hover:text-text-primary text-xs leading-none py-0.5"
        title="Tap tempo"
      >
        tap
      </button>
    </div>
  );
}
