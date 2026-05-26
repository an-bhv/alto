/**
 * Computer keyboard → MIDI map, laid out like onlinepianist.com.
 *
 *                2  3     5  6  7     9  0
 *              Q  W  E  R  T  Y  U  I  O  P
 *                          S  D  F     H  J     L  ;  '
 *                        Z  X  C  V  B  N  M  ,  .  /
 *
 * Top row (Q–P) covers C3–E4, with middle C on I.
 * Bottom row (Z–/) covers F4–A5.
 * Number-row keys are the blacks above the top row; home-row keys are the blacks
 * above the bottom row.
 */

export const KEYBOARD_TO_MIDI: Record<string, number> = {
  // Top-row whites: C3–E4
  q: 48, w: 50, e: 52, r: 53, t: 55, y: 57, u: 59,
  i: 60, o: 62, p: 64,
  // Number-row blacks for the top row
  "2": 49, "3": 51, "5": 54, "6": 56, "7": 58,
  "9": 61, "0": 63,

  // Bottom-row whites: F4–A5
  z: 65, x: 67, c: 69, v: 71,
  b: 72, n: 74, m: 76,
  ",": 77, ".": 79, "/": 81,
  // Home-row blacks for the bottom row
  s: 66, d: 68, f: 70,
  h: 73, j: 75,
  l: 78, ";": 80, "'": 82,
};

/** MIDI range covered by the keyboard mapping (C3 through A#5). */
export const KEYBOARD_RANGE = { low: 48, high: 82 };
