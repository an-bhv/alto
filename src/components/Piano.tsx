import { KEYBOARD_TO_MIDI } from "../data/keyboardMapping";

export interface ScaleHighlight {
  root: number;
  intervals: number[];
  degreeNames: string[];
}

interface PianoProps {
  startMidi?: number;
  endMidi?: number;
  activeNotes?: Set<number>;
  scaleHighlight?: ScaleHighlight | null;
  onNoteOn?: (midi: number) => void;
  onNoteOff?: (midi: number) => void;
  showKeyboardLabels?: boolean;
  showNoteNames?: boolean;
}

const WHITE_W = 36;
const WHITE_H = 180;
const BLACK_W = 22;
const BLACK_H = 113;
const TOP_BAR_H = 5;
const BOTTOM_ROOM = 18;

const BLACK_OFFSET = [-1, 0.67, -1, 1.67, -1, -1, 3.63, -1, 4.63, -1, 5.63, -1];
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function isBlack(midi: number): boolean {
  return [1, 3, 6, 8, 10].includes(midi % 12);
}

function whiteIndexOf(midi: number, startMidi: number): number {
  let count = 0;
  for (let m = startMidi; m < midi; m++) {
    if (!isBlack(m)) count++;
  }
  return count;
}

const MIDI_TO_KB: Record<number, string> = (() => {
  const out: Record<number, string> = {};
  for (const [k, m] of Object.entries(KEYBOARD_TO_MIDI)) {
    out[m] = k.toUpperCase();
  }
  return out;
})();

export function Piano({
  startMidi = 48,
  endMidi = 72,
  activeNotes = new Set(),
  scaleHighlight = null,
  onNoteOn,
  onNoteOff,
  showKeyboardLabels = true,
  showNoteNames = false,
}: PianoProps) {
  const whites: number[] = [];
  const blacks: number[] = [];
  for (let m = startMidi; m <= endMidi; m++) {
    if (isBlack(m)) blacks.push(m);
    else whites.push(m);
  }

  const keyboardWidth = whites.length * WHITE_W;
  const svgHeight = TOP_BAR_H + WHITE_H + BOTTOM_ROOM;

  function scaleClass(midi: number): "root" | "note" | null {
    if (!scaleHighlight) return null;
    const pc = ((midi % 12) - scaleHighlight.root + 12) % 12;
    if (pc === 0) return "root";
    if (scaleHighlight.intervals.includes(pc)) return "note";
    return null;
  }

  function degreeName(midi: number): string {
    if (!scaleHighlight) return "";
    const pc = ((midi % 12) - scaleHighlight.root + 12) % 12;
    if (pc === 0) return "1";
    const idx = scaleHighlight.intervals.indexOf(pc);
    return idx >= 0 ? scaleHighlight.degreeNames[idx] : "";
  }

  function noteLabel(midi: number): string {
    const pc = midi % 12;
    const oct = Math.floor(midi / 12) - 1;
    return `${NOTE_NAMES[pc]}${oct}`;
  }

  function whiteFill(active: boolean, sc: "root" | "note" | null): string {
    if (active) return "url(#pk-white-active)";
    if (sc === "root") return "url(#pk-white-root)";
    if (sc === "note") return "url(#pk-white-scale)";
    return "url(#pk-white)";
  }

  function blackFill(active: boolean, sc: "root" | "note" | null): string {
    if (active) return "url(#pk-black-active)";
    if (sc === "root") return "url(#pk-black-root)";
    if (sc === "note") return "url(#pk-black-scale)";
    return "url(#pk-black)";
  }

  const middleC = 60 >= startMidi && 60 <= endMidi && !isBlack(60) ? 60 : null;

  return (
    <div className="select-none" style={{ overflowX: "auto" }}>
      <svg
        width={keyboardWidth}
        height={svgHeight}
        style={{ display: "block", cursor: "pointer" }}
      >
        <defs>
          <linearGradient id="pk-white" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#fdfdfd" />
            <stop offset="85%" stopColor="#f4f4f4" />
            <stop offset="100%" stopColor="#d4d4d4" />
          </linearGradient>
          <linearGradient id="pk-white-active" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#6aa9ff" />
            <stop offset="100%" stopColor="#3d7bc8" />
          </linearGradient>
          <linearGradient id="pk-white-root" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#5ad681" />
            <stop offset="100%" stopColor="#2b8c4e" />
          </linearGradient>
          <linearGradient id="pk-white-scale" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#d2e3f1" />
            <stop offset="100%" stopColor="#a9c6dd" />
          </linearGradient>

          <linearGradient id="pk-black" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#5a5a5a" />
            <stop offset="8%" stopColor="#2a2a2a" />
            <stop offset="85%" stopColor="#0f0f0f" />
            <stop offset="92%" stopColor="#2d2d2d" />
            <stop offset="100%" stopColor="#050505" />
          </linearGradient>
          <linearGradient id="pk-black-active" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#4f93dc" />
            <stop offset="100%" stopColor="#1e4b80" />
          </linearGradient>
          <linearGradient id="pk-black-root" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#3aa35c" />
            <stop offset="100%" stopColor="#155226" />
          </linearGradient>
          <linearGradient id="pk-black-scale" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#2f485e" />
            <stop offset="100%" stopColor="#152331" />
          </linearGradient>
        </defs>

        <rect x={0} y={0} width={keyboardWidth} height={TOP_BAR_H} fill="#c62828" />

        {whites.map((midi) => {
          const wi = whiteIndexOf(midi, startMidi);
          const x = wi * WHITE_W;
          const y = TOP_BAR_H;
          const sc = scaleClass(midi);
          const active = activeNotes.has(midi);
          const deg = degreeName(midi);
          const kb = MIDI_TO_KB[midi];
          const onColored = active || sc === "root";

          return (
            <g
              key={midi}
              onMouseDown={(e) => { e.preventDefault(); onNoteOn?.(midi); }}
              onMouseUp={() => onNoteOff?.(midi)}
              onMouseLeave={(e) => { if (e.buttons & 1) onNoteOff?.(midi); }}
              onTouchStart={(e) => { e.preventDefault(); onNoteOn?.(midi); }}
              onTouchEnd={(e) => { e.preventDefault(); onNoteOff?.(midi); }}
            >
              <rect
                x={x + 0.5}
                y={y}
                width={WHITE_W - 1}
                height={WHITE_H}
                rx={3}
                fill={whiteFill(active, sc)}
                stroke="#b2b2b2"
                strokeWidth={0.8}
              />
              {deg && (
                <text
                  x={x + WHITE_W / 2}
                  y={y + 16}
                  textAnchor="middle"
                  fontSize={10}
                  fontWeight={700}
                  fill={onColored ? "#fff" : "#1a4f6e"}
                >
                  {deg}
                </text>
              )}
              {showNoteNames && (
                <text
                  x={x + WHITE_W / 2}
                  y={y + WHITE_H - 30}
                  textAnchor="middle"
                  fontSize={8}
                  fill={onColored ? "#eaf2fb" : "#999"}
                >
                  {noteLabel(midi)}
                </text>
              )}
              {showKeyboardLabels && kb && (
                <g transform={`translate(${x + WHITE_W / 2}, ${y + WHITE_H - 16})`}>
                  <rect
                    x={-10}
                    y={-8}
                    width={20}
                    height={16}
                    rx={3}
                    fill="#e8e8e8"
                    stroke="#9e9e9e"
                    strokeWidth={0.6}
                  />
                  <text
                    y={3}
                    textAnchor="middle"
                    fontSize={10}
                    fontWeight={600}
                    fill="#333"
                  >
                    {kb}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {blacks.map((midi) => {
          const pc = midi % 12;
          const octaveC = midi - pc;
          const octaveWhiteStart = whiteIndexOf(octaveC, startMidi);
          const x = (octaveWhiteStart + BLACK_OFFSET[pc]) * WHITE_W - BLACK_W / 2;
          const y = TOP_BAR_H;
          const sc = scaleClass(midi);
          const active = activeNotes.has(midi);
          const deg = degreeName(midi);
          const kb = MIDI_TO_KB[midi];

          return (
            <g
              key={midi}
              onMouseDown={(e) => { e.preventDefault(); onNoteOn?.(midi); }}
              onMouseUp={() => onNoteOff?.(midi)}
              onMouseLeave={(e) => { if (e.buttons & 1) onNoteOff?.(midi); }}
              onTouchStart={(e) => { e.preventDefault(); onNoteOn?.(midi); }}
              onTouchEnd={(e) => { e.preventDefault(); onNoteOff?.(midi); }}
            >
              <rect
                x={x + 1}
                y={y + BLACK_H - 3}
                width={BLACK_W}
                height={5}
                rx={2}
                fill="#000"
                opacity={0.35}
              />
              <rect
                x={x}
                y={y}
                width={BLACK_W}
                height={BLACK_H}
                rx={3}
                fill={blackFill(active, sc)}
                stroke="#000"
                strokeWidth={0.6}
              />
              {deg && (
                <text
                  x={x + BLACK_W / 2}
                  y={y + 14}
                  textAnchor="middle"
                  fontSize={9}
                  fontWeight={700}
                  fill="#fff"
                >
                  {deg}
                </text>
              )}
              {showKeyboardLabels && kb && (
                <g transform={`translate(${x + BLACK_W / 2}, ${y + BLACK_H - 14})`}>
                  <rect
                    x={-8}
                    y={-7}
                    width={16}
                    height={14}
                    rx={3}
                    fill="#3a3a3a"
                    stroke="#555"
                    strokeWidth={0.5}
                  />
                  <text
                    y={3}
                    textAnchor="middle"
                    fontSize={9}
                    fontWeight={600}
                    fill="#e8e8e8"
                  >
                    {kb}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {middleC !== null && (() => {
          const wi = whiteIndexOf(middleC, startMidi);
          const cx = wi * WHITE_W + WHITE_W / 2;
          const cy = TOP_BAR_H + WHITE_H + 8;
          return <circle cx={cx} cy={cy} r={3.2} fill="#c62828" />;
        })()}
      </svg>
    </div>
  );
}
