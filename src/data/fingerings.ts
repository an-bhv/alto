/**
 * Alto Saxophone fingering chart data.
 * All notes are in WRITTEN pitch (what the saxophonist reads).
 * Range: Bb3 (written) to F#6 (written)
 *
 * Key identifiers:
 *  OCT        - Octave key (left thumb, back of neck)
 *  LH1        - Left hand index (B key)
 *  LH2        - Left hand middle (C key / A key)
 *  LH3        - Left hand ring (G key)
 *  BIS        - Bis Bb key (left index, front)
 *  FRONT_F    - Front F key (left index, side)
 *  SIDE_Bb    - Side Bb key (right index side)
 *  G_SHARP    - Left pinky G# (Ab) key
 *  C_SHARP_LO - Left pinky C# key (low)
 *  B_LO       - Left pinky B key (low)
 *  Bb_LO      - Left pinky Bb key (low)
 *  RH1        - Right hand index (F key)
 *  RH2        - Right hand middle (E key)
 *  RH3        - Right hand ring (D key)
 *  SIDE_E     - Right side E key
 *  SIDE_C     - Right side C key (also high Eb trill)
 *  LOW_C      - Right pinky low C key
 *  LOW_Eb     - Right pinky low Eb / Ta key
 *  PALM_D     - Left palm D key
 *  PALM_Eb    - Left palm Eb key
 *  PALM_F     - Left palm F key
 *  HIGH_F_SHARP - High F# key (upper stack)
 */

export type SaxKey =
  | "OCT"
  | "LH1"
  | "LH2"
  | "LH3"
  | "BIS"
  | "FRONT_F"
  | "SIDE_Bb"
  | "G_SHARP"
  | "C_SHARP_LO"
  | "B_LO"
  | "Bb_LO"
  | "RH1"
  | "RH2"
  | "RH3"
  | "SIDE_E"
  | "SIDE_C"
  | "LOW_C"
  | "LOW_Eb"
  | "PALM_D"
  | "PALM_Eb"
  | "PALM_F"
  | "HIGH_F_SHARP";

export interface Fingering {
  keys: SaxKey[];
  label: string;
  isAlternate?: boolean;
}

/** Written note label → fingerings. Keys: e.g. "Bb3", "C4", "F#5" */
export const FINGERINGS: Record<string, Fingering[]> = {
  // ── Low register (no octave key) ──────────────────────────────────────────
  Bb3: [
    { keys: ["LH1", "LH2", "LH3", "RH1", "RH2", "RH3", "LOW_C", "Bb_LO"], label: "standard" },
  ],
  B3: [
    { keys: ["LH1", "LH2", "LH3", "RH1", "RH2", "RH3", "LOW_C", "B_LO"], label: "standard" },
  ],
  C4: [
    { keys: ["LH1", "LH2", "LH3", "RH1", "RH2", "RH3", "LOW_C"], label: "standard" },
  ],
  "C#4": [
    { keys: ["LH1", "LH2", "LH3", "RH1", "RH2", "RH3", "LOW_C", "C_SHARP_LO"], label: "standard" },
  ],
  D4: [
    { keys: ["LH1", "LH2", "LH3", "RH1", "RH2", "RH3"], label: "standard" },
  ],
  Eb4: [
    { keys: ["LH1", "LH2", "LH3", "RH1", "RH2", "RH3", "LOW_Eb"], label: "standard" },
    { keys: ["LH1", "LH2", "LH3", "RH1", "RH2", "RH3", "SIDE_C"], label: "side Eb", isAlternate: true },
  ],
  E4: [
    { keys: ["LH1", "LH2", "LH3", "RH1", "RH2"], label: "standard" },
  ],
  F4: [
    { keys: ["LH1", "LH2", "LH3", "RH1"], label: "standard" },
  ],
  "F#4": [
    { keys: ["LH1", "LH2", "LH3", "RH2", "RH3"], label: "standard" },
  ],
  G4: [
    { keys: ["LH1", "LH2", "LH3"], label: "standard" },
  ],
  "G#4": [
    { keys: ["LH1", "LH2", "LH3", "G_SHARP"], label: "standard" },
  ],
  A4: [
    { keys: ["LH1", "LH2"], label: "standard" },
  ],
  Bb4: [
    { keys: ["LH1", "BIS"], label: "bis (standard)" },
    { keys: ["LH1", "LH2", "SIDE_Bb"], label: "side Bb", isAlternate: true },
    { keys: ["LH1", "LH3"], label: "1 and 3", isAlternate: true },
  ],
  B4: [
    { keys: ["LH1"], label: "standard" },
  ],
  C5: [
    { keys: ["LH2"], label: "standard" },
  ],
  "C#5": [
    { keys: [], label: "open (no keys)" },
    { keys: ["FRONT_F", "LH1", "LH2", "LH3"], label: "front F alt", isAlternate: true },
  ],

  // ── Second octave (octave key) ─────────────────────────────────────────────
  D5: [
    { keys: ["OCT", "LH1", "LH2", "LH3", "RH1", "RH2", "RH3"], label: "standard" },
  ],
  Eb5: [
    { keys: ["OCT", "LH1", "LH2", "LH3", "RH1", "RH2", "RH3", "LOW_Eb"], label: "standard" },
    { keys: ["OCT", "LH1", "LH2", "LH3", "RH1", "RH2", "RH3", "SIDE_C"], label: "side Eb", isAlternate: true },
  ],
  E5: [
    { keys: ["OCT", "LH1", "LH2", "LH3", "RH1", "RH2"], label: "standard" },
  ],
  F5: [
    { keys: ["OCT", "LH1", "LH2", "LH3", "RH1"], label: "standard" },
  ],
  "F#5": [
    { keys: ["OCT", "LH1", "LH2", "LH3", "RH2", "RH3"], label: "standard" },
  ],
  G5: [
    { keys: ["OCT", "LH1", "LH2", "LH3"], label: "standard" },
  ],
  "G#5": [
    { keys: ["OCT", "LH1", "LH2", "LH3", "G_SHARP"], label: "standard" },
  ],
  A5: [
    { keys: ["OCT", "LH1", "LH2"], label: "standard" },
  ],
  Bb5: [
    { keys: ["OCT", "LH1", "BIS"], label: "bis (standard)" },
    { keys: ["OCT", "LH1", "LH2", "SIDE_Bb"], label: "side Bb", isAlternate: true },
  ],
  B5: [
    { keys: ["OCT", "LH1"], label: "standard" },
  ],
  C6: [
    { keys: ["OCT", "LH2"], label: "standard" },
  ],
  "C#6": [
    { keys: ["OCT"], label: "octave only" },
  ],

  // ── Palm key register (high notes) ────────────────────────────────────────
  D6: [
    { keys: ["OCT", "PALM_D", "LH1", "LH2", "LH3"], label: "standard" },
  ],
  Eb6: [
    { keys: ["OCT", "PALM_D", "PALM_Eb", "LH1", "LH2", "LH3"], label: "standard" },
  ],
  E6: [
    { keys: ["OCT", "PALM_D", "PALM_Eb", "PALM_F", "LH1", "LH2", "LH3"], label: "standard" },
  ],
  F6: [
    { keys: ["OCT", "PALM_D", "PALM_Eb", "PALM_F", "LH1", "LH2", "LH3", "RH1"], label: "standard" },
  ],
  "F#6": [
    { keys: ["OCT", "HIGH_F_SHARP", "LH1", "LH2", "LH3", "PALM_D", "PALM_Eb", "PALM_F"], label: "standard" },
  ],
};

/** All written notes in chromatic order */
export const WRITTEN_NOTES_ORDERED = [
  "Bb3", "B3", "C4", "C#4", "D4", "Eb4", "E4", "F4", "F#4",
  "G4", "G#4", "A4", "Bb4", "B4", "C5", "C#5",
  "D5", "Eb5", "E5", "F5", "F#5", "G5", "G#5", "A5", "Bb5", "B5",
  "C6", "C#6", "D6", "Eb6", "E6", "F6", "F#6",
];

export function getFingeringForNote(note: string): Fingering[] | null {
  return FINGERINGS[note] ?? null;
}
