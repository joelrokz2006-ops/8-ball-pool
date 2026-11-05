/**
 * Billiards Procedural Audio Synthesizer
 * Uses Web Audio API to create authentic acoustics:
 * - Phenolic resin ball-to-ball collisions with velocity-responsive resonance
 * - Wooden cue tip thwack with leather strike noise
 * - Rubber cushion dampened thud
 * - Pocket drop leather thunk and roll
 * - Foul indicator
 * - Victory fanfare
 * - Subtle ambient lounge atmosphere
 */

class AudioManager {
  constructor() {
    this.ctx = null;
    this.sfxVolume = 0.8;
    this.musicVolume = 0.5;
    this.muted = false;
    this.ambientNode = null;
    this.isMusicPlaying = false;
  }

  init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setSFXVolume(val) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
  }

  setMusicVolume(val) {
    this.musicVolume = Math.max(0, Math.min(1, val));
    if (this.ambientGain) {
      this.ambientGain.gain.setValueAtTime(this.musicVolume * 0.15, this.ctx.currentTime);
    }
  }

  setMuted(muted) {
    this.muted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 1, this.ctx.currentTime);
    }
  }

  ensureContext() {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Ball-to-ball impact: sharp high-frequency transient + decaying bell-like resonant ring
  playBallClack(speed = 10) {
    if (this.muted || this.sfxVolume <= 0) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const normalized = Math.min(1, Math.max(0.08, speed / 40));
    const volume = this.sfxVolume * (0.2 + normalized * 0.8);
    const now = ctx.currentTime;

    // High transient click
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'triangle';
    // Pitch varies slightly with impact force
    osc1.frequency.setValueAtTime(1400 + normalized * 300, now);
    osc1.frequency.exponentialRampToValueAtTime(800, now + 0.04);

    gain1.gain.setValueAtTime(volume * 0.9, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.05);

    // Resonant phenolic body ring
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(2600 + Math.random() * 200, now);
    gain2.gain.setValueAtTime(volume * 0.35, now);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.start(now);
    osc2.stop(now + 0.085);
  }

  // Cue strike: punchy low-mid wood impact + leather chalk snap
  playCueHit(power = 0.5) {
    if (this.muted || this.sfxVolume <= 0) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const norm = Math.min(1, Math.max(0.1, power));
    const volume = this.sfxVolume * (0.3 + norm * 0.7);
    const now = ctx.currentTime;

    // Low wooden punch
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(280 + norm * 80, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.08);

    gain.gain.setValueAtTime(volume * 0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);

    // Leather tip snap (filtered white noise burst)
    const bufferSize = ctx.sampleRate * 0.03;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2200;
    filter.Q.value = 2;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(volume * 0.5, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noise.start(now);
  }

  // Cushion rebound: soft rubber dampening thud
  playCushion(speed = 10) {
    if (this.muted || this.sfxVolume <= 0) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const norm = Math.min(1, Math.max(0.1, speed / 30));
    const volume = this.sfxVolume * (0.2 + norm * 0.6);
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140 + norm * 40, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.1);

    gain.gain.setValueAtTime(volume * 0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  // Pocket drop: hollow cup thunk followed by roll
  playPocket() {
    if (this.muted || this.sfxVolume <= 0) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const volume = this.sfxVolume * 0.85;
    const now = ctx.currentTime;

    // Deep drop thud
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(190, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.18);

    gain.gain.setValueAtTime(volume * 0.9, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.21);

    // Leather rattle
    setTimeout(() => {
      if (this.muted) return;
      const rattleNow = ctx.currentTime;
      const rattleOsc = ctx.createOscillator();
      const rattleGain = ctx.createGain();
      rattleOsc.type = 'sine';
      rattleOsc.frequency.setValueAtTime(320, rattleNow);
      rattleOsc.frequency.exponentialRampToValueAtTime(120, rattleNow + 0.12);

      rattleGain.gain.setValueAtTime(volume * 0.4, rattleNow);
      rattleGain.gain.exponentialRampToValueAtTime(0.001, rattleNow + 0.13);

      rattleOsc.connect(rattleGain);
      rattleGain.connect(ctx.destination);
      rattleOsc.start(rattleNow);
      rattleOsc.stop(rattleNow + 0.14);
    }, 70);
  }

  // Foul tone
  playFoul() {
    if (this.muted || this.sfxVolume <= 0) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.setValueAtTime(196, now + 0.12);

    gain.gain.setValueAtTime(this.sfxVolume * 0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.36);
  }

  // Win fanfare: uplifting golden chord progression
  playWin() {
    if (this.muted || this.sfxVolume <= 0) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const chords = [
      [261.63, 329.63, 392.00], // C major
      [329.63, 392.00, 493.88], // E minor
      [349.23, 440.00, 523.25], // F major
      [392.00, 493.88, 587.33, 783.99] // G major / C octave
    ];

    chords.forEach((chord, step) => {
      const startTime = ctx.currentTime + step * 0.18;
      chord.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.25, startTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.52);
      });
    });
  }

  // Tactical UI click
  playClick() {
    if (this.muted || this.sfxVolume <= 0) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.025);

    gain.gain.setValueAtTime(this.sfxVolume * 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.026);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.03);
  }

  // Authentic chalking cue tip sound: frictional textured noise burst
  playChalk() {
    if (this.muted || this.sfxVolume <= 0) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const volume = this.sfxVolume * 0.45;
    const now = ctx.currentTime;

    // Filtered noise with 2 quick scrubbing motions
    [0, 0.09].forEach((offset) => {
      const bufferSize = ctx.sampleRate * 0.06;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 3400;
      filter.Q.value = 3.5;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volume, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.058);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now + offset);
    });
  }

  // Crowd cheer / applause on great pots and tournament victories
  playCheer() {
    if (this.muted || this.sfxVolume <= 0) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const duration = 1.4;
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize;
      const envelope = Math.sin(t * Math.PI) * (1 - 0.3 * t);
      data[i] = (Math.random() * 2 - 1) * envelope * 0.4;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1800, now);
    filter.frequency.linearRampToValueAtTime(1200, now + duration);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.5, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
  }

  // Combo sound
  playCombo(level = 1) {
    if (this.muted || this.sfxVolume <= 0) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const baseFreq = 440 * Math.pow(1.15, level);
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.15);

    gain.gain.setValueAtTime(this.sfxVolume * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.21);
  }

  // Purchase sound (clean cash register / coin chime)
  playPurchase() {
    if (this.muted || this.sfxVolume <= 0) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    [987.77, 1318.51].forEach((freq, idx) => {
      const t = ctx.currentTime + idx * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(this.sfxVolume * 0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.26);
    });
  }

  // Ambient pool club lounge music loop (soft generative jazz Rhodes chords)
  startAmbientMusic() {
    if (this.isMusicPlaying) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    this.isMusicPlaying = true;
    this.ambientGain = ctx.createGain();
    this.ambientGain.gain.setValueAtTime(this.musicVolume * 0.12, ctx.currentTime);
    this.ambientGain.connect(ctx.destination);

    const progressions = [
      [220.00, 261.63, 329.63, 392.00], // Am7
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [196.00, 246.94, 293.66, 349.23], // G7
      [261.63, 329.63, 392.00, 493.88]  // Cmaj7
    ];

    let chordIdx = 0;
    this.ambientTimer = setInterval(() => {
      if (!this.isMusicPlaying || this.muted || this.musicVolume <= 0) return;
      const chord = progressions[chordIdx % progressions.length];
      chordIdx++;
      const now = ctx.currentTime;

      chord.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const chordGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq * 0.5; // gentle octave

        const noteTime = now + i * 0.03;
        chordGain.gain.setValueAtTime(0, noteTime);
        chordGain.gain.linearRampToValueAtTime(this.musicVolume * 0.08, noteTime + 0.5);
        chordGain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 3.8);

        osc.connect(chordGain);
        chordGain.connect(this.ambientGain);

        osc.start(noteTime);
        osc.stop(noteTime + 4.0);
      });
    }, 4000);
  }

  stopAmbientMusic() {
    this.isMusicPlaying = false;
    if (this.ambientTimer) {
      clearInterval(this.ambientTimer);
      this.ambientTimer = null;
    }
  }
}

export const audioManager = new AudioManager();
