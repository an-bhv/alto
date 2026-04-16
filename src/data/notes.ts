export const NOTE_NAMES_SHARP = [
  "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B",
] as const;

export const NOTE_NAMES_FLAT = [
  "C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B",
] as const;

export interface NoteInfo {
  name: string;
  octave: number;
  midi: number;
  cents: number;
}

/**
 * Returns note name using flats for Db, Eb, Gb, Ab, Bb and sharps for F#.
 * This matches standard saxophone sheet music conventions.
 */
export function midiToNoteName(midi: number): string {
  const index = ((midi % 12) + 12) % 12;
  // Use flats for sax-friendly keys, sharps for F#
  const DISPLAY_NAMES = [
    "C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B",
  ];
  return DISPLAY_NAMES[index];
}

export function midiToOctave(midi: number): number {
  return Math.floor(midi / 12) - 1;
}

export function noteLabel(midi: number): string {
  return `${midiToNoteName(midi)}${midiToOctave(midi)}`;
}
