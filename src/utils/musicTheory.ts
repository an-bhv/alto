import { NOTE_NAMES_SHARP, type NoteInfo } from "../data/notes";

export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function frequencyToMidi(freq: number): number {
  return 12 * Math.log2(freq / 440) + 69;
}

export function frequencyToNoteInfo(freq: number): NoteInfo {
  const midiExact = frequencyToMidi(freq);
  const midi = Math.round(midiExact);
  const cents = Math.round((midiExact - midi) * 100);
  const noteIndex = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  const name = NOTE_NAMES_SHARP[noteIndex];
  return { name, octave, midi, cents };
}

export function centsColor(cents: number): "green" | "yellow" | "red" {
  const abs = Math.abs(cents);
  if (abs <= 10) return "green";
  if (abs <= 25) return "yellow";
  return "red";
}
