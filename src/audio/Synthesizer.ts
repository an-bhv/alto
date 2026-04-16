/**
 * Piano-like synthesizer using Web Audio API.
 * Multi-harmonic sine oscillators with ADSR envelope and key-click noise.
 */
export class Synthesizer {
  private ctx: AudioContext;
  private masterGain: GainNode;
  private activeNotes = new Map<
    number,
    { oscillators: OscillatorNode[]; gain: GainNode }
  >();

  constructor(ctx: AudioContext) {
    this.ctx = ctx;
    this.masterGain = ctx.createGain();
    this.masterGain.gain.value = 0.65;
    this.masterGain.connect(ctx.destination);
  }

  setVolume(vol: number): void {
    this.masterGain.gain.value = vol;
  }

  noteOn(midi: number): void {
    if (this.activeNotes.has(midi)) return;

    const freq = 440 * Math.pow(2, (midi - 69) / 12);
    const now = this.ctx.currentTime;

    const noteGain = this.ctx.createGain();
    noteGain.gain.setValueAtTime(0, now);
    noteGain.gain.linearRampToValueAtTime(0.55, now + 0.004);
    noteGain.gain.setTargetAtTime(0.18, now + 0.004, 0.18);
    noteGain.connect(this.masterGain);

    // Multi-harmonic oscillators with slight inharmonicity
    const harmonicGains = [0.8, 0.28, 0.14, 0.07, 0.03, 0.015];
    const oscillators = harmonicGains.map((amp, i) => {
      const h = i + 1;
      const inh = 1 + 0.00012 * h * h; // slight stretch
      const osc = this.ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq * h * inh;
      const hGain = this.ctx.createGain();
      hGain.gain.value = amp;
      osc.connect(hGain).connect(noteGain);
      osc.start(now);
      return osc;
    });

    // Key-click noise burst
    const noiseLen = Math.floor(this.ctx.sampleRate * 0.025);
    const noiseBuf = this.ctx.createBuffer(1, noiseLen, this.ctx.sampleRate);
    const noiseData = noiseBuf.getChannelData(0);
    for (let i = 0; i < noiseLen; i++) {
      noiseData[i] = Math.random() * 2 - 1;
    }
    const noiseSrc = this.ctx.createBufferSource();
    noiseSrc.buffer = noiseBuf;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.04, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);
    noiseSrc.connect(noiseGain).connect(noteGain);
    noiseSrc.start(now);

    this.activeNotes.set(midi, { oscillators, gain: noteGain });
  }

  noteOff(midi: number): void {
    const note = this.activeNotes.get(midi);
    if (!note) return;

    const now = this.ctx.currentTime;
    note.gain.gain.cancelScheduledValues(now);
    note.gain.gain.setValueAtTime(note.gain.gain.value, now);
    note.gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
    note.oscillators.forEach((osc) => osc.stop(now + 1.3));
    this.activeNotes.delete(midi);
  }

  stopAll(): void {
    for (const midi of this.activeNotes.keys()) {
      this.noteOff(midi);
    }
  }
}
