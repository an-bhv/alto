import { useRef } from "react";

export interface ScaleHighlight {
  root: number;     // root MIDI pitch class (0–11)
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
}

const WHITE_W = 40;
const BLACK_W = 26;
const WHITE_H = 150;
const BLACK_H = 96;

// X offset for black keys (in units of white key width)
const BLACK_OFFSET = [-1, 0.67, -1, 1.67, -1, -1, 3.63, -1, 4.63, -1, 5.63, -1];

const KB_LABELS: Record<number, string> = {
  48: "Z", 49: "S", 50: "X", 51: "D", 52: "C", 53: "V", 54: "G",
  55: "B", 56: "H", 57: "N", 58: "J", 59: "M",
  60: "Q", 61: "2", 62: "W", 63: "3", 64: "E", 65: "R", 66: "5",
  67: "T", 68: "6", 69: "Y", 70: "7", 71: "U", 72: "I",
};

const NOTE_NAMES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];

function isBlack(midi: number) {
  return [1, 3, 6, 8, 10].includes(midi % 12);
}

function buildKeys(startMidi: number, endMidi: number) {
  const whites: number[] = [];
  const blacks: number[] = [];
  for (let m = startMidi; m <= endMidi; m++) {
    if (isBlack(m)) blacks.push(m);
    else whites.push(m);
  }
  return { whites, blacks };
}

function whiteIndexOf(midi: number, startMidi: number): number {
  let count = 0;
  for (let m = startMidi; m < midi; m++) {
    if (!isBlack(m)) count++;
  }
  return count;
}

export function Piano({
  startMidi = 48,
  endMidi = 72,
  activeNotes = new Set(),
  scaleHighlight = null,
  onNoteOn,
  onNoteOff,
  showKeyboardLabels = true,
}: PianoProps) {
  const { whites, blacks } = buildKeys(startMidi, endMidi);
  const totalWidth = whites.length * WHITE_W;
  const svgHeight = WHITE_H + 4;
  const touchActive = useRef(new Map<number, number>()); // touchId → midi

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

  function keyFill(midi: number, white: boolean): string {
    if (activeNotes.has(midi)) return white ? "#4a90d9" : "#2471a3";
    const sc = scaleClass(midi);
    if (sc === "root") return white ? "#2ecc71" : "#1a8c3a";
    if (sc === "note") return white ? "#a9cce3" : "#1a4f6e";
    return white ? "#e8e8e8" : "#222";
  }

  function textColor(midi: number, white: boolean): string {
    if (activeNotes.has(midi)) return "#fff";
    const sc = scaleClass(midi);
    if (sc === "root") return "#fff";
    if (sc === "note") return white ? "#1a4f6e" : "#a9cce3";
    return white ? "#999" : "#666";
  }

  return (
    <div className="overflow-x-auto select-none">
      <svg
        width={totalWidth}
        height={svgHeight}
        style={{ display: "block", cursor: "pointer" }}
      >
        {/* White keys */}
        {whites.map((midi) => {
          const wi = whiteIndexOf(midi, startMidi);
          const x = wi * WHITE_W;
          const fill = keyFill(midi, true);
          const tc = textColor(midi, true);
          const deg = degreeName(midi);
          const kb = KB_LABELS[midi];

          return (
            <g key={midi}
              onMouseDown={(e) => { e.preventDefault(); onNoteOn?.(midi); }}
              onMouseUp={() => onNoteOff?.(midi)}
              onMouseLeave={(e) => { if (e.buttons & 1) onNoteOff?.(midi); }}
              onTouchStart={(e) => { e.preventDefault(); onNoteOn?.(midi); }}
              onTouchEnd={(e) => { e.preventDefault(); onNoteOff?.(midi); }}
            >
              <rect x={x + 0.5} y={0.5} width={WHITE_W - 1} height={WHITE_H - 1} rx={3}
                fill={fill} stroke="#bbb" strokeWidth={0.8} />
              {/* Degree badge */}
              {deg && (
                <text x={x + WHITE_W / 2} y={16} textAnchor="middle" fontSize={9}
                  fontWeight={700} fill={tc}>{deg}</text>
              )}
              {/* Note name at bottom */}
              <text x={x + WHITE_W / 2} y={WHITE_H - 20} textAnchor="middle"
                fontSize={8} fill={tc}>{noteLabel(midi)}</text>
              {/* Keyboard shortcut */}
              {showKeyboardLabels && kb && (
                <text x={x + WHITE_W / 2} y={WHITE_H - 8} textAnchor="middle"
                  fontSize={8} fontWeight={600} fill={tc}>{kb}</text>
              )}
            </g>
          );
        })}

        {/* Black keys (on top) */}
        {blacks.map((midi) => {
          const pc = midi % 12;
          const octaveStart = midi - pc; // C of this octave
          const octaveWhites = whiteIndexOf(octaveStart, startMidi);
          const x = (octaveWhites + BLACK_OFFSET[pc]) * WHITE_W - BLACK_W / 2;
          const fill = keyFill(midi, false);
          const tc = textColor(midi, false);
          const deg = degreeName(midi);
          const kb = KB_LABELS[midi];

          return (
            <g key={midi}
              onMouseDown={(e) => { e.preventDefault(); onNoteOn?.(midi); }}
              onMouseUp={() => onNoteOff?.(midi)}
              onMouseLeave={(e) => { if (e.buttons & 1) onNoteOff?.(midi); }}
              onTouchStart={(e) => { e.preventDefault(); onNoteOn?.(midi); }}
              onTouchEnd={(e) => { e.preventDefault(); onNoteOff?.(midi); }}
            >
              <rect x={x + 0.5} y={0.5} width={BLACK_W - 1} height={BLACK_H - 1} rx={3}
                fill={fill} stroke="#000" strokeWidth={0.8} />
              {deg && (
                <text x={x + BLACK_W / 2} y={16} textAnchor="middle" fontSize={8}
                  fontWeight={700} fill={tc}>{deg}</text>
              )}
              {showKeyboardLabels && kb && (
                <text x={x + BLACK_W / 2} y={BLACK_H - 8} textAnchor="middle"
                  fontSize={7} fontWeight={600} fill={tc}>{kb}</text>
              )}
            </g>
          );
        })}
      </svg>
      <div ref={(_el) => { touchActive.current; }} />
    </div>
  );
}
