/**
 * Procedural Web Audio API Sound Synthesizer & Haptic Engine
 * Lightweight, zero-external-assets sound system designed for mobile devices.
 */

class SoundService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;
  private isEngineRunning: boolean = false;

  constructor() {
    const savedMute = localStorage.getItem('turbo_racer_muted');
    if (savedMute !== null) {
      this.isMuted = savedMute === 'true';
    }
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    localStorage.setItem('turbo_racer_muted', String(muted));
    if (muted && this.engineGain) {
      this.engineGain.gain.setValueAtTime(0, this.ctx?.currentTime || 0);
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public startEngine() {
    if (this.isEngineRunning) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(45, this.ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(260, this.ctx.currentTime);

      gain.gain.setValueAtTime(this.isMuted ? 0 : 0.08, this.ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();

      this.engineOsc = osc;
      this.engineGain = gain;
      this.engineFilter = filter;
      this.isEngineRunning = true;
    } catch {
      // Audio might be blocked until user gesture
    }
  }

  public updateEnginePitch(speedRatio: number, isBoosting: boolean) {
    if (!this.isEngineRunning || !this.ctx || !this.engineOsc || !this.engineFilter || !this.engineGain) return;

    if (this.isMuted) {
      this.engineGain.gain.setValueAtTime(0, this.ctx.currentTime);
      return;
    }

    try {
      const targetFreq = 45 + speedRatio * 180 + (isBoosting ? 60 : 0);
      const targetFilter = 240 + speedRatio * 900 + (isBoosting ? 400 : 0);
      const targetGain = 0.04 + speedRatio * 0.08 + (isBoosting ? 0.05 : 0);

      const t = this.ctx.currentTime;
      this.engineOsc.frequency.setTargetAtTime(targetFreq, t, 0.05);
      this.engineFilter.frequency.setTargetAtTime(targetFilter, t, 0.05);
      this.engineGain.gain.setTargetAtTime(targetGain, t, 0.05);
    } catch {
      // Ignore audio parameter sync errors
    }
  }

  public stopEngine() {
    if (!this.isEngineRunning) return;
    try {
      if (this.engineOsc) {
        this.engineOsc.stop();
        this.engineOsc.disconnect();
      }
      this.engineOsc = null;
      this.engineGain = null;
      this.engineFilter = null;
    } catch {
      // Ignore cleanup error
    }
    this.isEngineRunning = false;
  }

  public playTireScreech() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(650, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(750, this.ctx.currentTime + 0.15);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);
      filter.Q.setValueAtTime(3, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    } catch {
      // Ignore audio error
    }
  }

  public playNearMiss() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(780, this.ctx.currentTime + 0.18);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.22);
    } catch {
      // Ignore
    }
  }

  public playCoin() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(987.77, t); // B5
      osc2.frequency.setValueAtTime(1318.51, t + 0.08); // E6

      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(t);
      osc1.stop(t + 0.08);
      osc2.start(t + 0.08);
      osc2.stop(t + 0.25);

      this.triggerHaptic(20);
    } catch {
      // Ignore
    }
  }

  public playNitro() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, t);
      osc.frequency.exponentialRampToValueAtTime(420, t + 0.3);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, t);
      filter.frequency.exponentialRampToValueAtTime(1200, t + 0.3);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.35);

      this.triggerHaptic([30, 40, 50]);
    } catch {
      // Ignore
    }
  }

  public playCrash() {
    this.stopEngine();
    this.triggerHaptic([100, 50, 150]);

    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.6;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Generate punchy white noise with decay
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.12));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, t);
      filter.frequency.linearRampToValueAtTime(80, t + 0.5);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.55);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(t);
    } catch {
      // Ignore
    }
  }

  public playClick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, t);
      osc.frequency.exponentialRampToValueAtTime(200, t + 0.05);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.05);
      this.triggerHaptic(15);
    } catch {
      // Ignore
    }
  }

  public triggerHaptic(pattern: number | number[]) {
    try {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    } catch {
      // Vibration not permitted or supported
    }
  }
}

export const sound = new SoundService();
