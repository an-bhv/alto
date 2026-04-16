interface CentsMeterProps {
  cents: number | null;
}

const COLOR = {
  green: "bg-accent-green",
  yellow: "bg-accent-yellow",
  red: "bg-accent-red",
};

function getColor(cents: number): keyof typeof COLOR {
  const abs = Math.abs(cents);
  if (abs <= 10) return "green";
  if (abs <= 25) return "yellow";
  return "red";
}

export function CentsMeter({ cents }: CentsMeterProps) {
  const active = cents !== null;
  const clamped = active ? Math.max(-50, Math.min(50, cents)) : 0;
  const color = active ? getColor(cents!) : "green";

  // Fill bar: extends from center (50%) toward the deviation
  const pct = 50 + clamped;
  const fillLeft = Math.min(50, pct);
  const fillWidth = Math.abs(pct - 50);

  const sign = cents !== null && cents > 0 ? "+" : "";
  const centsLabel = active ? `${sign}${cents} ¢` : "— ¢";

  return (
    <div className="w-full max-w-xs">
      <div className="flex justify-between text-xs text-text-muted mb-1.5">
        <span>♭ flat</span>
        <span>in tune</span>
        <span>sharp ♯</span>
      </div>

      <div className="relative h-4 bg-bg-elevated rounded-full overflow-hidden">
        {/* Fill bar */}
        {active && (
          <div
            className={`absolute top-0 h-full rounded-full transition-all duration-75 ${COLOR[color]}`}
            style={{ left: `${fillLeft}%`, width: `${fillWidth}%` }}
          />
        )}
        {/* Center line */}
        <div className="absolute top-0 left-1/2 w-0.5 h-full bg-white/40 -translate-x-1/2" />
      </div>

      <div className="text-center mt-1.5 text-sm text-text-secondary tabular-nums">
        {centsLabel}
      </div>
    </div>
  );
}
