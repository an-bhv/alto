/**
 * Alto Saxophone transposition (Eb instrument).
 *
 * When an alto sax plays written C4, the concert (sounding) pitch is Eb3.
 * Concert MIDI = written MIDI - 9
 * Written MIDI = concert MIDI + 9
 */

export type SaxType = "alto" | "tenor" | "soprano" | "baritone";

const TRANSPOSITION_OFFSETS: Record<SaxType, number> = {
  alto: -9,      // Eb: written - 9 = concert
  tenor: -14,    // Bb: written - 14 = concert
  soprano: -2,   // Bb: written - 2 = concert
  baritone: -21, // Eb: written - 21 = concert
};

export function concertToWritten(concertMidi: number, sax: SaxType = "alto"): number {
  return concertMidi - TRANSPOSITION_OFFSETS[sax];
}

export function writtenToConcert(writtenMidi: number, sax: SaxType = "alto"): number {
  return writtenMidi + TRANSPOSITION_OFFSETS[sax];
}

/** Written note range for alto sax: Bb3 (MIDI 58) to F#6 (MIDI 90) */
export const ALTO_WRITTEN_RANGE = { low: 58, high: 90 };

/** Concert pitch range for alto sax: Db3 (MIDI 49) to A5 (MIDI 81) */
export const ALTO_CONCERT_RANGE = { low: 49, high: 81 };
