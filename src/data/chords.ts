export interface ChordDefinition {
  name: string;
  intervals: number[];
}

export const CHORDS: ChordDefinition[] = [
  { name: "Major",     intervals: [0, 4, 7] },
  { name: "Minor",     intervals: [0, 3, 7] },
  { name: "Dim",       intervals: [0, 3, 6] },
  { name: "Aug",       intervals: [0, 4, 8] },
  { name: "Sus2",      intervals: [0, 2, 7] },
  { name: "Sus4",      intervals: [0, 5, 7] },
  { name: "Dom7",      intervals: [0, 4, 7, 10] },
  { name: "Maj7",      intervals: [0, 4, 7, 11] },
  { name: "Min7",      intervals: [0, 3, 7, 10] },
  { name: "Dim7",      intervals: [0, 3, 6, 9] },
  { name: "Half-dim7", intervals: [0, 3, 6, 10] },
];

export const INTERVAL_NAMES = [
  "Unison", "Minor 2nd", "Major 2nd", "Minor 3rd", "Major 3rd",
  "Perfect 4th", "Tritone", "Perfect 5th", "Minor 6th", "Major 6th",
  "Minor 7th", "Major 7th", "Octave",
];

export function detectChord(midiNotes: number[]): string | null {
  const sorted = [...midiNotes].sort((a, b) => a - b);
  for (let r = 0; r < sorted.length; r++) {
    const root = sorted[r] % 12;
    const intervals = sorted
      .map((m) => ((m % 12) - root + 12) % 12)
      .sort((a, b) => a - b)
      .filter((v, i, a) => a.indexOf(v) === i);

    for (const chord of CHORDS) {
      if (
        chord.intervals.length === intervals.length &&
        chord.intervals.every((v, i) => v === intervals[i])
      ) {
        const NOTE_NAMES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
        const rootName = NOTE_NAMES[root];
        const inv = r === 0 ? "" : " (inv)";
        return `${rootName} ${chord.name}${inv}`;
      }
    }
  }
  return null;
}
