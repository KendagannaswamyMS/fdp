class SoundController {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  playBeep(frequency = 440, duration = 0.15, type: OscillatorType = 'sine') {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio context might be restricted before user gesture
    }
  }

  playLabAlert() {
    this.playBeep(587.33, 0.15, 'sine'); // D5
    setTimeout(() => this.playBeep(880, 0.35, 'triangle'), 160); // A5
  }

  playPensDown() {
    this.playBeep(880, 0.2, 'square');
    setTimeout(() => this.playBeep(659.25, 0.2, 'square'), 220);
    setTimeout(() => this.playBeep(440, 0.5, 'sawtooth'), 440);
  }

  playSuccess() {
    this.playBeep(523.25, 0.1, 'sine'); // C5
    setTimeout(() => this.playBeep(659.25, 0.1, 'sine'), 100); // E5
    setTimeout(() => this.playBeep(783.99, 0.25, 'sine'), 200); // G5
  }
}

export const soundFx = new SoundController();
