import { useState } from "react";
import { FingeringDiagram } from "./FingeringDiagram";
import { getFingeringForNote, type SaxKey } from "../data/fingerings";

interface FingeringChartProps {
  writtenNote: string | null;
  size?: "sm" | "md" | "lg";
  showAlternates?: boolean;
}

export function FingeringChart({ writtenNote, size = "md", showAlternates = true }: FingeringChartProps) {
  const [fingeringIndex, setFingeringIndex] = useState(0);

  const fingerings = writtenNote ? getFingeringForNote(writtenNote) : null;

  // Reset index when note changes
  const safeIndex = fingerings ? Math.min(fingeringIndex, fingerings.length - 1) : 0;
  const current = fingerings ? fingerings[safeIndex] : null;

  const pressedKeys: Set<SaxKey> = current
    ? new Set(current.keys as SaxKey[])
    : new Set();

  return (
    <div className="flex flex-col items-center gap-3">
      <FingeringDiagram pressedKeys={pressedKeys} size={size} />

      {/* Note label */}
      {writtenNote && (
        <div className="text-sm text-text-secondary">
          {writtenNote}
          {current && <span className="text-text-muted ml-2">— {current.label}</span>}
        </div>
      )}

      {/* Alternate fingering tabs */}
      {showAlternates && fingerings && fingerings.length > 1 && (
        <div className="flex gap-1">
          {fingerings.map((f, i) => (
            <button
              key={i}
              onClick={() => setFingeringIndex(i)}
              className={[
                "px-2 py-0.5 rounded text-xs transition-colors",
                i === safeIndex
                  ? "bg-accent-blue text-white"
                  : "bg-bg-elevated text-text-muted hover:text-text-primary",
              ].join(" ")}
            >
              {f.isAlternate ? `Alt ${i}` : "Std"}
            </button>
          ))}
        </div>
      )}

      {/* No fingering data */}
      {writtenNote && !fingerings && (
        <p className="text-xs text-text-muted">No fingering data</p>
      )}
    </div>
  );
}
