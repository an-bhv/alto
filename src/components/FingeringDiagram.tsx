import type { SaxKey } from "../data/fingerings";

interface FingeringDiagramProps {
  pressedKeys: Set<SaxKey>;
  size?: "sm" | "md" | "lg";
}

const SIZE_MAP = { sm: 0.55, md: 0.85, lg: 1.1 };

const PRESSED = "#4a90d9";
const INACTIVE = "#2d2d4e";
const BORDER = "#3a3a5c";
const TEXT = "#888";

interface KeyProps {
  id: SaxKey;
  pressed: boolean;
  x: number;
  y: number;
  w: number;
  h: number;
  rx?: number;
  label?: string;
}

function RectKey({ id: _id, pressed, x, y, w, h, rx = 4, label }: KeyProps) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={rx}
        fill={pressed ? PRESSED : INACTIVE}
        stroke={BORDER}
        strokeWidth={1}
      />
      {pressed && (
        <rect x={x} y={y} width={w} height={h} rx={rx} fill="none" stroke="#74b9ff" strokeWidth={1.5} opacity={0.7} />
      )}
      {label && (
        <text x={x + w / 2} y={y + h / 2 + 3.5} textAnchor="middle" fontSize={7} fill={pressed ? "#fff" : TEXT}>
          {label}
        </text>
      )}
    </g>
  );
}

function CircleKey({ id: _id, pressed, x, y, w: r, label }: Omit<KeyProps, "h">) {
  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r={r}
        fill={pressed ? PRESSED : INACTIVE}
        stroke={BORDER}
        strokeWidth={1}
      />
      {pressed && (
        <circle cx={x} cy={y} r={r} fill="none" stroke="#74b9ff" strokeWidth={1.5} opacity={0.7} />
      )}
      {label && (
        <text x={x} y={y + 3.5} textAnchor="middle" fontSize={7} fill={pressed ? "#fff" : TEXT}>
          {label}
        </text>
      )}
    </g>
  );
}

export function FingeringDiagram({ pressedKeys, size = "md" }: FingeringDiagramProps) {
  const scale = SIZE_MAP[size];
  const W = 180;
  const H = 480;

  const p = (key: SaxKey) => pressedKeys.has(key);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={W * scale}
      height={H * scale}
      style={{ display: "block" }}
    >
      {/* Saxophone body outline */}
      <rect x={75} y={0} width={30} height={480} rx={6} fill="#1a1a2e" stroke={BORDER} strokeWidth={1} />

      {/* ── Octave key (thumb, back) ── */}
      <text x={90} y={22} textAnchor="middle" fontSize={8} fill={TEXT}>OCT</text>
      <RectKey id="OCT" pressed={p("OCT")} x={52} y={10} w={22} h={12} label="8va" />

      {/* ── Palm keys ── */}
      <text x={90} y={50} textAnchor="middle" fontSize={7} fill={TEXT}>palm</text>
      <RectKey id="PALM_D" pressed={p("PALM_D")} x={48} y={55} w={16} h={10} label="D" />
      <RectKey id="PALM_Eb" pressed={p("PALM_Eb")} x={67} y={55} w={16} h={10} label="Eb" />
      <RectKey id="PALM_F" pressed={p("PALM_F")} x={86} y={55} w={16} h={10} label="F" />
      <RectKey id="FRONT_F" pressed={p("FRONT_F")} x={106} y={55} w={16} h={10} label="fF" />

      {/* ── Left hand main keys ── */}
      {/* LH1 (index) */}
      <CircleKey id="LH1" pressed={p("LH1")} x={90} y={100} w={14} label="1" />
      {/* Bis key (side of LH1) */}
      <RectKey id="BIS" pressed={p("BIS")} x={110} y={93} w={18} h={9} label="Bis" />

      {/* LH2 (middle) */}
      <CircleKey id="LH2" pressed={p("LH2")} x={90} y={135} w={14} label="2" />
      {/* Side Bb */}
      <RectKey id="SIDE_Bb" pressed={p("SIDE_Bb")} x={110} y={129} w={18} h={9} label="Bb" />

      {/* LH3 (ring) */}
      <CircleKey id="LH3" pressed={p("LH3")} x={90} y={170} w={14} label="3" />

      {/* ── Left pinky table ── */}
      <text x={52} y={202} textAnchor="middle" fontSize={7} fill={TEXT}>L pinky</text>
      <RectKey id="G_SHARP" pressed={p("G_SHARP")} x={38} y={207} w={18} h={10} label="G#" />
      <RectKey id="C_SHARP_LO" pressed={p("C_SHARP_LO")} x={58} y={207} w={18} h={10} label="C#" />
      <RectKey id="B_LO" pressed={p("B_LO")} x={38} y={220} w={18} h={10} label="B" />
      <RectKey id="Bb_LO" pressed={p("Bb_LO")} x={58} y={220} w={18} h={10} label="Bb" />

      {/* ── Divider ── */}
      <line x1={60} y1={245} x2={120} y2={245} stroke={BORDER} strokeWidth={1} strokeDasharray="3,3" />

      {/* ── Right side keys ── */}
      <RectKey id="SIDE_E" pressed={p("SIDE_E")} x={110} y={255} w={18} h={9} label="E" />
      <RectKey id="SIDE_C" pressed={p("SIDE_C")} x={110} y={267} w={18} h={9} label="C" />

      {/* ── Right hand main keys ── */}
      {/* RH1 (index) */}
      <CircleKey id="RH1" pressed={p("RH1")} x={90} y={285} w={14} label="4" />

      {/* RH2 (middle) */}
      <CircleKey id="RH2" pressed={p("RH2")} x={90} y={320} w={14} label="5" />

      {/* RH3 (ring) */}
      <CircleKey id="RH3" pressed={p("RH3")} x={90} y={355} w={14} label="6" />

      {/* ── Right pinky table ── */}
      <text x={130} y={387} textAnchor="middle" fontSize={7} fill={TEXT}>R pinky</text>
      <RectKey id="LOW_Eb" pressed={p("LOW_Eb")} x={108} y={390} w={18} h={10} label="Eb" />
      <RectKey id="LOW_C" pressed={p("LOW_C")} x={128} y={390} w={18} h={10} label="C" />

      {/* ── High F# ── */}
      <RectKey id="HIGH_F_SHARP" pressed={p("HIGH_F_SHARP")} x={50} y={420} w={22} h={10} label="F#" />

      {/* Labels for tone holes */}
      <text x={68} y={104} textAnchor="end" fontSize={7} fill={TEXT}>LH1</text>
      <text x={68} y={139} textAnchor="end" fontSize={7} fill={TEXT}>LH2</text>
      <text x={68} y={174} textAnchor="end" fontSize={7} fill={TEXT}>LH3</text>
      <text x={68} y={289} textAnchor="end" fontSize={7} fill={TEXT}>RH1</text>
      <text x={68} y={324} textAnchor="end" fontSize={7} fill={TEXT}>RH2</text>
      <text x={68} y={359} textAnchor="end" fontSize={7} fill={TEXT}>RH3</text>
    </svg>
  );
}
