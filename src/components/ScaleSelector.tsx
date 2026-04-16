import { SCALES } from "../data/scales";

interface ScaleSelectorProps {
  root: number | null;
  scaleName: string | null;
  onRootChange: (root: number | null) => void;
  onScaleChange: (name: string | null) => void;
}

const NOTE_OPTIONS = [
  { label: "C", value: 0 }, { label: "C# / Db", value: 1 },
  { label: "D", value: 2 }, { label: "D# / Eb", value: 3 },
  { label: "E", value: 4 }, { label: "F", value: 5 },
  { label: "F# / Gb", value: 6 }, { label: "G", value: 7 },
  { label: "G# / Ab", value: 8 }, { label: "A", value: 9 },
  { label: "A# / Bb", value: 10 }, { label: "B", value: 11 },
];

const SELECT_CLS = "bg-bg-elevated text-text-primary border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-accent-blue cursor-pointer";

export function ScaleSelector({ root, scaleName, onRootChange, onScaleChange }: ScaleSelectorProps) {
  return (
    <div className="flex gap-3 flex-wrap">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-text-muted uppercase tracking-wider">Root</label>
        <select
          className={SELECT_CLS}
          value={root ?? ""}
          onChange={(e) => onRootChange(e.target.value === "" ? null : parseInt(e.target.value))}
        >
          <option value="">Off</option>
          {NOTE_OPTIONS.map(({ label, value }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-text-muted uppercase tracking-wider">Scale</label>
        <select
          className={SELECT_CLS}
          value={scaleName ?? ""}
          onChange={(e) => onScaleChange(e.target.value || null)}
        >
          <option value="">—</option>
          {SCALES.map((s) => (
            <option key={s.name} value={s.name}>{s.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
