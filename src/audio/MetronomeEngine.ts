/**
 * Lookahead-scheduled metronome using Web Audio API.
 *
 * Uses setInterval (25ms) to schedule audio events 100ms into the future,
 * giving sample-accurate timing without relying on JS timer precision.
 */
export class MetronomeEngine {
  private ctx: AudioContext;
  private gain: GainNode;
  private bpm = 120;
  private beatsPerMeasure = 4;
  private subdivision = 1; // 1 = quarter, 2 = eighth, 3 = triplet, 4 = sixteenth

  private lookaheadMs = 25;
  private scheduleAheadSec = 0.1;
  private timerID: ReturnType<typeof setInterval> | null = null;
  private nextNoteTime = 0;
  private currentBeat = 0;
  private currentSub = 0;

  onBeat: ((beat: number, sub: number) => void) | null = null;

  constructor(ctx: AudioContext) {
    this.ctx = ctx;
    this.gain = ctx.createGain();
    this.gain.gain.value = 0.5;
    this.gain.connect(ctx.destination);
  }

  setBpm(bpm: number): void {
    this.bpm = Math.max(30, Math.min(300, bpm));
  }

  getBpm(): number {
    return this.bpm;
  }

  setBeatsPerMeasure(beats: number): void {
    this.beatsPerMeasure = beats;
  }

  getBeatsPerMeasure(): number {
    return this.beatsPerMeasure;
  }

  setSubdivision(sub: number): void {
    this.subdivision = sub;
  }

  getSubdivision(): number {
    return this.subdivision;
  }

  setVolume(vol: number): void {
    this.gain.gain.value = vol;
  }

  start(): void {
    if (this.timerID !== null) return;
    this.currentBeat = 0;
    this.currentSub = 0;
    this.nextNoteTime = this.ctx.currentTime;
    this.timerID = setInterval(() => this.scheduler(), this.lookaheadMs);
  }

  stop(): void {
    if (this.timerID !== null) {
      clearInterval(this.timerID);
      this.timerID = null;
    }
  }

  isPlaying(): boolean {
    return this.timerID !== null;
  }

  private scheduler(): void {
    while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadSec) {
      this.scheduleNote(this.nextNoteTime, this.currentBeat, this.currentSub);

      // Advance
      this.currentSub++;
      if (this.currentSub >= this.subdivision) {
        this.currentSub = 0;
        this.currentBeat = (this.currentBeat + 1) % this.beatsPerMeasure;
      }

      // Time per subdivision tick
      const secPerBeat = 60 / this.bpm;
      this.nextNoteTime += secPerBeat / this.subdivision;
    }
  }

  private scheduleNote(time: number, beat: number, sub: number): void {
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();

    if (sub === 0 && beat === 0) {
      // Downbeat — higher pitch, louder
      osc.frequency.value = 1000;
      oscGain.gain.setValueAtTime(0.6, time);
      oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
      osc.stop(time + 0.06);
    } else if (sub === 0) {
      // Beat
      osc.frequency.value = 800;
      oscGain.gain.setValueAtTime(0.4, time);
      oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
      osc.stop(time + 0.06);
    } else {
      // Subdivision tick — softer, shorter
      osc.frequency.value = 600;
      oscGain.gain.setValueAtTime(0.15, time);
      oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
      osc.stop(time + 0.04);
    }

    osc.connect(oscGain).connect(this.gain);
    osc.start(time);

    // Fire visual callback (will be slightly ahead of audio but close enough)
    if (this.onBeat) {
      const delayMs = Math.max(0, (time - this.ctx.currentTime) * 1000);
      setTimeout(() => this.onBeat?.(beat, sub), delayMs);
    }
  }
}
