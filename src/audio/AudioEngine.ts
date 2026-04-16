/**
 * Singleton AudioContext manager. All audio in the app flows through one context.
 */
let instance: AudioEngine | null = null;

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private micStream: MediaStream | null = null;

  static getInstance(): AudioEngine {
    if (!instance) instance = new AudioEngine();
    return instance;
  }

  getContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  async requestMicrophone(): Promise<MediaStream> {
    if (this.micStream) return this.micStream;
    this.micStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
      video: false,
    });
    return this.micStream;
  }

  releaseMicrophone(): void {
    if (this.micStream) {
      this.micStream.getTracks().forEach((t) => t.stop());
      this.micStream = null;
    }
  }

  get sampleRate(): number {
    return this.getContext().sampleRate;
  }
}
