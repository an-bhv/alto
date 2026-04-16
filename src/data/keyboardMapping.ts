/**
 * Maps computer keyboard keys to MIDI note numbers.
 * Lower octave (C3–B3): Z through M row + S/D/G/H/J for sharps
 * Upper octave (C4–C5): Q through I row + 2/3/5/6/7 for sharps
 */

export const KEYBOARD_TO_MIDI: Record<string, number> = {
  // Lower octave: C3 = 48
  z: 48,  // C3
  s: 49,  // C#3
  x: 50,  // D3
  d: 51,  // D#3
  c: 52,  // E3
  v: 53,  // F3
  g: 54,  // F#3
  b: 55,  // G3
  h: 56,  // G#3
  n: 57,  // A3
  j: 58,  // A#3
  m: 59,  // B3

  // Upper octave: C4 = 60
  q: 60,  // C4
  "2": 61, // C#4
  w: 62,  // D4
  "3": 63, // D#4
  e: 64,  // E4
  r: 65,  // F4
  "5": 66, // F#4
  t: 67,  // G4
  "6": 68, // G#4
  y: 69,  // A4
  "7": 70, // A#4
  u: 71,  // B4
  i: 72,  // C5
};

/** MIDI range covered by the keyboard mapping */
export const KEYBOARD_RANGE = { low: 48, high: 72 };
