class SoundEngine {
  private ctx: AudioContext | null = null;
  private enabled = true;
  private lastPulseTime = 0;

  public setEnabled(value: boolean) {
    this.enabled = value;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  private getContext(): AudioContext | null {
    if (!this.enabled) return null;
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume = 0.08,
    delay = 0,
    endFreq?: number
  ) {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
    }

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.03);
  }

  public playDepartureChime() {
    this.playTone(392, 0.16, 'triangle', 0.07, 0);
    this.playTone(523.25, 0.24, 'triangle', 0.07, 0.1);
  }

  public playArrivalBell() {
    // Soft luminous two-tone railway chime
    this.playTone(659.25, 0.35, 'sine', 0.09, 0);
    this.playTone(523.25, 0.45, 'sine', 0.08, 0.16);
    this.playTone(783.99, 0.55, 'triangle', 0.05, 0.32);
  }

  public playDoorSlide() {
    this.playTone(220, 0.18, 'sine', 0.04, 0, 340);
  }

  public playDiscoveryChime() {
    this.playTone(587.33, 0.14, 'sine', 0.07, 0);
    this.playTone(880, 0.24, 'triangle', 0.06, 0.08);
  }

  public playBadgeFanfare() {
    this.playTone(523.25, 0.18, 'triangle', 0.08, 0);
    this.playTone(659.25, 0.18, 'triangle', 0.08, 0.1);
    this.playTone(783.99, 0.22, 'triangle', 0.08, 0.2);
    this.playTone(1046.5, 0.48, 'sine', 0.09, 0.32);
  }

  public playTrackPulse(speedFactor: number) {
    if (!this.enabled || speedFactor < 0.15) return;
    const nowMs = performance.now();
    const interval = Math.max(190, 420 - speedFactor * 200);
    if (nowMs - this.lastPulseTime < interval) return;
    this.lastPulseTime = nowMs;
    this.playTone(130 + speedFactor * 35, 0.07, 'sine', 0.022 * speedFactor, 0, 95);
  }
}

export const soundEngine = new SoundEngine();
