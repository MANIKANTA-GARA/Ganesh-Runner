// SoundManager.js - Procedural Web Audio API Sound & Devotional Music Engine
export class SoundManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.musicEnabled = true;
    this.sfxEnabled = true;
    this.isPlayingMusic = false;
    this.tempo = 112; // BPM
    this.speedMultiplier = 1.0;
    this.isDivineMode = false;
    this.beatTimer = null;
    this.currentStep = 0;
    this.musicGain = null;
    this.sfxGain = null;
    this.masterGain = null;
    this.droneOscillators = [];

    // Pentatonic scale (Raga Bhoopali / Mohanam notes in Hz: Sa, Re, Ga, Pa, Dha)
    this.scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.65, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.9, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.startAmbientTanpura();
    } catch (e) {
      console.warn("Web Audio not supported or blocked", e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMusicEnabled(val) {
    this.musicEnabled = val;
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(val ? 0.65 : 0.0, this.ctx.currentTime, 0.05);
    }
  }

  setSfxEnabled(val) {
    this.sfxEnabled = val;
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setTargetAtTime(val ? 0.9 : 0.0, this.ctx.currentTime, 0.05);
    }
  }

  // --- Procedural Tanpura Drone ---
  startAmbientTanpura() {
    if (!this.ctx) return;
    const freqs = [130.81, 196.00, 261.63]; // C3, G3, C4
    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq + (idx === 1 ? 0.8 : -0.5), this.ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320 + idx * 80, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      osc.start();
      this.droneOscillators.push({ osc, gain });
    });
  }

  // --- Festive Running Music Loop (Dhol, Tasha, Manjira & Flute) ---
  startRunningMusic() {
    this.init();
    this.resume();
    this.isPlayingMusic = true;
    this.currentStep = 0;
    this.scheduleNextBeat();
  }

  stopMusic() {
    this.isPlayingMusic = false;
    if (this.beatTimer) {
      clearTimeout(this.beatTimer);
      this.beatTimer = null;
    }
  }

  setRunSpeed(speedRatio) {
    // Dynamically increase tempo as player runs faster
    this.speedMultiplier = Math.max(1.0, Math.min(1.85, speedRatio));
  }

  setDivineMode(active) {
    this.isDivineMode = active;
    if (active) {
      this.playTempleBell(220, 3.5);
      this.playDivineGong();
    }
  }

  scheduleNextBeat() {
    if (!this.isPlayingMusic || !this.ctx) return;

    const baseBpm = this.isDivineMode ? 148 : 116;
    const currentBpm = baseBpm * this.speedMultiplier;
    const stepDuration = 60 / currentBpm / 4; // 16th notes

    const now = this.ctx.currentTime;
    const step = this.currentStep % 16;

    // Dhol Pattern (Festival rhythm)
    if (step === 0 || step === 6 || step === 10) {
      this.synthDhol(now, 1.0, 65);
    }
    if (step === 3 || step === 8 || step === 14) {
      this.synthDhol(now, 0.7, 85); // Rim/slap
    }

    // Tasha rolls (Snappy festive cutter percussion)
    if (this.isDivineMode || step % 2 === 0 || (step >= 12 && step <= 15)) {
      this.synthTasha(now, step === 0 || step === 8 ? 0.9 : 0.5);
    }

    // Manjira (Cymbals) on offbeats
    if (step === 4 || step === 12 || (this.isDivineMode && step % 4 === 2)) {
      this.synthManjira(now, 0.6);
    }

    // Flute (Bansuri) Devotional Riff
    if (step % 4 === 0) {
      const noteIdx = (Math.floor(this.currentStep / 4) + (this.isDivineMode ? 3 : 0)) % this.scale.length;
      const freq = this.scale[noteIdx];
      this.synthFlute(now, freq, stepDuration * 3.8);
    }

    this.currentStep++;
    const delayMs = stepDuration * 1000;
    this.beatTimer = setTimeout(() => this.scheduleNextBeat(), delayMs);
  }

  // --- Synthesizers ---
  synthDhol(time, intensity = 1.0, basePitch = 65) {
    if (!this.musicEnabled) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(basePitch * 1.6, time);
    osc.frequency.exponentialRampToValueAtTime(basePitch * 0.7, time + 0.18);

    gain.gain.setValueAtTime(0.8 * intensity, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(time);
    osc.stop(time + 0.26);
  }

  synthTasha(time, volume = 0.6) {
    if (!this.musicEnabled) return;
    const bufferSize = this.ctx.sampleRate * 0.05;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1800, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume * 0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.06);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    noise.start(time);
  }

  synthManjira(time, volume = 0.5) {
    if (!this.musicEnabled) return;
    const freqs = [3800, 4420, 5200, 6800];
    freqs.forEach(f => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, time);

      gain.gain.setValueAtTime(volume * 0.08, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.start(time);
      osc.stop(time + 0.45);
    });
  }

  synthFlute(time, freq, duration) {
    if (!this.musicEnabled) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const vibrato = this.ctx.createOscillator();
    const vibratoGain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    // Subtle breath vibrato
    vibrato.frequency.setValueAtTime(5.5, time);
    vibratoGain.gain.setValueAtTime(freq * 0.015, time);
    vibrato.connect(osc.frequency);
    vibrato.start(time);
    vibrato.stop(time + duration);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(0.18, time + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  // --- Sound Effects (SFX) ---
  playTempleBell(freq = 440, decay = 3.0) {
    if (!this.sfxEnabled) return;
    this.init();
    this.resume();
    const harmonics = [1, 1.41, 1.83, 2.76, 4.07];
    harmonics.forEach((h, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * h, this.ctx.currentTime);

      const amp = 0.3 / (idx + 1);
      gain.gain.setValueAtTime(amp, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + decay);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start();
      osc.stop(this.ctx.currentTime + decay + 0.1);
    });
  }

  playDivineGong() {
    this.playTempleBell(180, 4.5);
  }

  playCoinCollect() {
    if (!this.sfxEnabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [987.77, 1318.51]; // B5 -> E6 sparkling chime
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + idx * 0.045;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.05, t + 0.12);

      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.18);
    });
  }

  playModakCollect() {
    if (!this.sfxEnabled || !this.ctx) return;
    const pitches = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio
    pitches.forEach((p, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = this.ctx.currentTime + i * 0.04;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(p, t);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.3);
    });
  }

  playDiyaCollect() {
    if (!this.sfxEnabled || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(640, t + 0.15);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, t);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.32);
  }

  playFlowerCollect() {
    if (!this.sfxEnabled || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(1174, t + 0.12);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.22);
  }

  playJump() {
    if (!this.sfxEnabled || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(580, t + 0.22);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.26);
  }

  playLanding() {
    if (!this.sfxEnabled || !this.ctx) return;
    this.synthDhol(this.ctx.currentTime, 0.4, 80);
  }

  playSlide() {
    if (!this.sfxEnabled || !this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 0.35;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(650, this.ctx.currentTime);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    noise.start();
  }

  playLaneChange() {
    if (!this.sfxEnabled || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(350, t);
    osc.frequency.exponentialRampToValueAtTime(240, t + 0.1);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.13);
  }

  playShieldActivate() {
    if (!this.sfxEnabled || !this.ctx) return;
    this.playTempleBell(587, 2.0);
  }

  playShieldBreak() {
    if (!this.sfxEnabled || !this.ctx) return;
    this.playTempleBell(880, 0.8);
  }

  playMushikaDash() {
    if (!this.sfxEnabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(720, t + 0.6);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.75);
  }

  playTrunkPower() {
    if (!this.sfxEnabled || !this.ctx) return;
    // Synthesize majestic elephant trumpet roar & energy blast
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const mod = this.ctx.createOscillator();
    const modGain = this.ctx.createGain();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(280, t);
    osc.frequency.linearRampToValueAtTime(450, t + 0.35);
    osc.frequency.linearRampToValueAtTime(200, t + 0.6);

    mod.frequency.setValueAtTime(45, t);
    modGain.gain.setValueAtTime(80, t);
    mod.connect(osc.frequency);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    mod.start(t);
    osc.start(t);
    mod.stop(t + 0.7);
    osc.stop(t + 0.7);
  }

  playCollision() {
    if (!this.sfxEnabled || !this.ctx) return;
    this.synthDhol(this.ctx.currentTime, 1.2, 45);
  }

  playDamruPulse() {
    if (!this.sfxEnabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    [0, 0.12].forEach(offset => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, t + offset);
      osc.frequency.exponentialRampToValueAtTime(140, t + offset + 0.08);

      gain.gain.setValueAtTime(0.35, t + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.1);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t + offset);
      osc.stop(t + offset + 0.11);
    });
  }

  playAutoHorn() {
    if (!this.sfxEnabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    [440, 520].forEach(f => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, t);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.24);
    });
  }

  playTrainHorn() {
    if (!this.sfxEnabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    // Classic Nathan K3LA / Indian Railways WAP-7 chord: D#4 (311Hz), F#4 (370Hz), A#4 (466Hz)
    const notes = [311.13, 370.0, 466.16];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq + (idx === 1 ? 1.2 : -1.0), t);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(freq * 1.5, t);
      filter.Q.setValueAtTime(3.0, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.28, t + 0.08);
      gain.gain.setValueAtTime(0.25, t + 0.45);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.85);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.9);
    });
  }

  playHighScore() {
    if (!this.sfxEnabled || !this.ctx) return;
    const chords = [523.25, 659.25, 783.99, 1046.5];
    chords.forEach((note, i) => {
      setTimeout(() => this.playTempleBell(note, 2.5), i * 150);
    });
  }
}
