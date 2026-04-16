import type { NoteInfo } from "../data/notes";

interface NoteDisplayProps {
  writtenNote: NoteInfo | null;
  concertNote: NoteInfo | null;
  frequency: number | null;
  cents: number | null;
}

function centsClass(cents: number | null): string {
  if (cents === null) return "text-text-primary";
  const abs = Math.abs(cents);
  if (abs <= 10) return "text-accent-green";
  if (abs <= 25) return "text-accent-yellow";
  return "text-accent-red";
}

export function NoteDisplay({ writtenNote, concertNote, frequency, cents }: NoteDisplayProps) {
  const colorClass = centsClass(cents);

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Written note (large) */}
      <div className={`text-8xl font-bold leading-none tabular-nums transition-colors ${colorClass}`}>
        {writtenNote ? (
          <>
            {writtenNote.name}
            <span className="text-4xl text-text-secondary align-super ml-1">
              {writtenNote.octave}
            </span>
          </>
        ) : (
          <span className="text-text-muted">—</span>
        )}
      </div>

      {/* Concert pitch label */}
      <div className="text-sm text-text-muted h-5">
        {concertNote
          ? `concert ${concertNote.name}${concertNote.octave}`
          : ""}
      </div>

      {/* Frequency */}
      <div className="text-sm text-text-secondary tabular-nums h-5">
        {frequency ? `${frequency.toFixed(1)} Hz` : "— Hz"}
      </div>
    </div>
  );
}
