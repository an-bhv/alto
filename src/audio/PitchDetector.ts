/**
 * YIN pitch detection algorithm.
 *
 * More accurate than basic autocorrelation for instruments with rich harmonics
 * like saxophone. Returns frequency and confidence (0–1).
 *
 * Reference: de Cheveigné & Kawahara, "YIN, a fundamental frequency estimator
 * for speech and music", JASA 2002.
 */
export class PitchDetector {
  private sampleRate: number;
  private threshold: number;
  private halfSize: number;

  constructor(sampleRate: number, bufferSize = 4096, threshold = 0.15) {
    this.sampleRate = sampleRate;
    this.threshold = threshold;
    this.halfSize = Math.floor(bufferSize / 2);
  }

  detect(buffer: Float32Array): { frequency: number; confidence: number } | null {
    // Step 1: Check signal level (RMS)
    let rmsSum = 0;
    for (let i = 0; i < buffer.length; i++) {
      rmsSum += buffer[i] * buffer[i];
    }
    const rms = Math.sqrt(rmsSum / buffer.length);
    if (rms < 0.01) return null; // silence

    // Step 2: Difference function
    const diff = new Float32Array(this.halfSize);
    for (let tau = 0; tau < this.halfSize; tau++) {
      let sum = 0;
      for (let i = 0; i < this.halfSize; i++) {
        const d = buffer[i] - buffer[i + tau];
        sum += d * d;
      }
      diff[tau] = sum;
    }

    // Step 3: Cumulative mean normalized difference function (CMND)
    const cmnd = new Float32Array(this.halfSize);
    cmnd[0] = 1;
    let runningSum = 0;
    for (let tau = 1; tau < this.halfSize; tau++) {
      runningSum += diff[tau];
      cmnd[tau] = diff[tau] / (runningSum / tau);
    }

    // Step 4: Absolute threshold — find first tau where cmnd dips below threshold
    let tau = 2;
    while (tau < this.halfSize) {
      if (cmnd[tau] < this.threshold) {
        // Find the local minimum
        while (tau + 1 < this.halfSize && cmnd[tau + 1] < cmnd[tau]) {
          tau++;
        }
        break;
      }
      tau++;
    }

    if (tau >= this.halfSize) return null; // no pitch found

    // Step 5: Parabolic interpolation for sub-sample accuracy
    let betterTau = tau;
    if (tau > 0 && tau < this.halfSize - 1) {
      const s0 = cmnd[tau - 1];
      const s1 = cmnd[tau];
      const s2 = cmnd[tau + 1];
      const denom = 2 * (2 * s1 - s0 - s2);
      if (denom !== 0) {
        betterTau = tau + (s0 - s2) / denom;
      }
    }

    const frequency = this.sampleRate / betterTau;
    const confidence = 1 - cmnd[tau];

    // Filter out unreasonable frequencies
    if (frequency < 60 || frequency > 1500) return null;

    return { frequency, confidence };
  }
}
