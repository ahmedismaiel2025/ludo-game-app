// Synthesized Web Audio API sound generator with Crowd Applause, Cheering & Multiple Sound Packs for Ludo

export type SoundPack = 'stadium' | 'classic' | 'digital' | 'cartoon';

class AudioManager {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  public volume: number = 0.85;
  public soundPack: SoundPack = 'stadium';

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const savedPack = localStorage.getItem('ludo_sound_pack') as SoundPack | null;
        if (savedPack && ['stadium', 'classic', 'digital', 'cartoon'].includes(savedPack)) {
          this.soundPack = savedPack;
        }
        const savedVol = localStorage.getItem('ludo_volume');
        if (savedVol !== null) {
          this.volume = parseFloat(savedVol);
        }
      } catch {
        // ignore
      }
    }
  }

  public setSoundPack(pack: SoundPack) {
    this.soundPack = pack;
    try {
      localStorage.setItem('ludo_sound_pack', pack);
    } catch {
      // ignore
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    try {
      localStorage.setItem('ludo_volume', this.volume.toString());
    } catch {
      // ignore
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  /**
   * Arabic Voice Text-to-Speech synthesizer for Voice Chat / Taunts
   */
  public speakVoice(text: string, voiceIndex: number = 0) {
    if (this.isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.volume = this.volume;

      const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith('ar'));
      if (voices.length > 0) {
        utterance.voice = voices[voiceIndex % voices.length];
      }

      utterance.rate = 1.05;
      utterance.pitch = 1.0 + (voiceIndex % 3) * 0.15;
      window.speechSynthesis.speak(utterance);
    } catch {
      // ignore speech errors
    }
  }

  /**
   * Synthesize realistic crowd applause using randomized filtered noise bursts
   */
  public playCrowdApplause(duration: number = 2.5, intensity: number = 0.8) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const ctx = this.ctx;
    const now = ctx.currentTime;
    const masterVol = this.volume;

    // 1. Synthesize multiple individual handclaps layered together
    const clapCount = Math.floor(duration * 45 * intensity);
    for (let i = 0; i < clapCount; i++) {
      const startTime = now + (Math.random() * (duration * 0.9));
      const clapLen = 0.02 + Math.random() * 0.035;

      // Noise buffer for individual clap
      const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * clapLen));
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let s = 0; s < bufferSize; s++) {
        output[s] = (Math.random() * 2 - 1) * Math.exp(-s / (bufferSize * 0.3));
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      // Bandpass filter centered at handclap resonant frequency (~900Hz - 2000Hz)
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(900 + Math.random() * 1100, startTime);
      filter.Q.setValueAtTime(2.2 + Math.random() * 1.5, startTime);

      const gain = ctx.createGain();
      const clapVol = (0.08 + Math.random() * 0.12) * intensity * masterVol;
      gain.gain.setValueAtTime(clapVol, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + clapLen);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start(startTime);
      whiteNoise.stop(startTime + clapLen);
    }

    // 2. Synthesize background crowd roar / cheering body
    const roarBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate);
    const roarData = roarBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let s = 0; s < roarData.length; s++) {
      const white = Math.random() * 2 - 1;
      roarData[s] = (lastOut + 0.02 * white) / 1.02; // Pink noise approx
      lastOut = roarData[s];
    }

    const roarSource = ctx.createBufferSource();
    roarSource.buffer = roarBuffer;

    const roarFilter = ctx.createBiquadFilter();
    roarFilter.type = 'bandpass';
    roarFilter.frequency.setValueAtTime(500, now);
    roarFilter.frequency.linearRampToValueAtTime(800, now + duration * 0.4);
    roarFilter.frequency.linearRampToValueAtTime(450, now + duration);
    roarFilter.Q.setValueAtTime(1.8, now);

    const roarGain = ctx.createGain();
    roarGain.gain.setValueAtTime(0.001, now);
    roarGain.gain.linearRampToValueAtTime(0.25 * intensity * masterVol, now + 0.3);
    roarGain.gain.setValueAtTime(0.25 * intensity * masterVol, now + duration * 0.7);
    roarGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    roarSource.connect(roarFilter);
    roarFilter.connect(roarGain);
    roarGain.connect(ctx.destination);

    roarSource.start(now);
    roarSource.stop(now + duration);

    // 3. Harmonious crowd cheer "Woooo!" vocal formants
    [440, 554, 659].forEach((baseFreq, idx) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now + 0.1);
      osc.frequency.linearRampToValueAtTime(baseFreq * 1.15, now + 0.6);
      osc.frequency.linearRampToValueAtTime(baseFreq * 0.95, now + duration * 0.85);

      oscGain.gain.setValueAtTime(0.001, now);
      oscGain.gain.linearRampToValueAtTime(0.04 * intensity * masterVol, now + 0.3 + idx * 0.05);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.9);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    });
  }

  public playDiceRoll() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const ctx = this.ctx;
    const now = ctx.currentTime;
    const vol = this.volume;

    if (this.soundPack === 'digital') {
      // High-tech laser rattle
      for (let i = 0; i < 5; i++) {
        const time = now + i * 0.04;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800 + i * 150, time);
        osc.frequency.exponentialRampToValueAtTime(200, time + 0.03);
        gain.gain.setValueAtTime(0.2 * vol, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + 0.03);
      }
      return;
    }

    if (this.soundPack === 'cartoon') {
      // Bouncy bubble roll
      for (let i = 0; i < 4; i++) {
        const time = now + i * 0.06;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300 + i * 80, time);
        osc.frequency.exponentialRampToValueAtTime(600, time + 0.05);
        gain.gain.setValueAtTime(0.25 * vol, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + 0.05);
      }
      return;
    }

    // Classic / Stadium: rattling dice clicks
    for (let i = 0; i < 6; i++) {
      const time = now + i * 0.05 + Math.random() * 0.02;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180 + Math.random() * 120, time);
      osc.frequency.exponentialRampToValueAtTime(80, time + 0.04);

      gain.gain.setValueAtTime(0.25 * vol, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + 0.04);
    }
  }

  public playPieceStep() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const ctx = this.ctx;
    const now = ctx.currentTime;
    const vol = this.volume;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (this.soundPack === 'digital') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.exponentialRampToValueAtTime(950, now + 0.06);
    } else if (this.soundPack === 'cartoon') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.linearRampToValueAtTime(700, now + 0.05);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(580, now + 0.08);
    }

    gain.gain.setValueAtTime(0.2 * vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  /**
   * Capture sound: Impact thud + whistle + enthusiastic crowd cheer & claps!
   */
  public playCapture() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const ctx = this.ctx;
    const now = ctx.currentTime;
    const vol = this.volume;

    // Impact thud
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = this.soundPack === 'digital' ? 'sawtooth' : 'triangle';
    osc1.frequency.setValueAtTime(320, now);
    osc1.frequency.exponentialRampToValueAtTime(35, now + 0.28);

    gain1.gain.setValueAtTime(0.4 * vol, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.28);

    // Whistle back to base
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(750, now + 0.06);
    osc2.frequency.exponentialRampToValueAtTime(180, now + 0.38);

    gain2.gain.setValueAtTime(0.2 * vol, now + 0.06);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.start(now + 0.06);
    osc2.stop(now + 0.38);

    // Crowd applause and excitement reaction for successful strike/capture!
    this.playCrowdApplause(2.2, 0.9);
  }

  public playSafeStar() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const ctx = this.ctx;
    const now = ctx.currentTime;
    const vol = this.volume;

    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const time = now + i * 0.06;

      osc.type = this.soundPack === 'digital' ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.18 * vol, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + 0.2);
    });
  }

  /**
   * Home goal sound: Joyful triumph melody + grand crowd clapping and cheering!
   */
  public playHomeGoal() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const ctx = this.ctx;
    const now = ctx.currentTime;
    const vol = this.volume;

    // Triumphant chord fanfares
    [440, 554.37, 659.25, 880, 1108.73].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const time = now + i * 0.07;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.3 * vol, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + 0.45);
    });

    // Crowd cheering & clapping on reaching home!
    this.playCrowdApplause(3.0, 1.0);
  }

  /**
   * Victory sound: Grand melody + stadium horn + prolonged standing ovation crowd applause!
   */
  public playVictory() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const ctx = this.ctx;
    const now = ctx.currentTime;
    const vol = this.volume;

    const notes = [
      { f: 523.25, d: 0.15 },
      { f: 523.25, d: 0.15 },
      { f: 523.25, d: 0.15 },
      { f: 659.25, d: 0.35 },
      { f: 587.33, d: 0.15 },
      { f: 659.25, d: 0.15 },
      { f: 783.99, d: 0.8 },
      { f: 1046.5, d: 1.1 }
    ];

    let offset = 0;
    notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const time = now + offset;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, time);

      gain.gain.setValueAtTime(0.32 * vol, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + note.d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + note.d);

      offset += note.d * 0.85;
    });

    // Extended stadium crowd applause and celebration
    this.playCrowdApplause(4.5, 1.0);
  }

  /**
   * Stadium Arena Intro sound: Energetic crowd anticipation roar & intro sweep
   */
  public playArenaIntro() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const ctx = this.ctx;
    const now = ctx.currentTime;
    const vol = this.volume;

    // Gentle stadium fanfare chord
    [330, 440, 554, 660, 880].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.001, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.18 * vol, now + idx * 0.08 + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + 2.2);
    });

    this.playCrowdApplause(3.5, 0.85);
  }

  public playTurnNotice() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const ctx = this.ctx;
    const now = ctx.currentTime;
    const vol = this.volume;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.12);

    gain.gain.setValueAtTime(0.15 * vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  public vibrate(pattern: number | number[] = 40) {
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignore if vibration disallowed by browser policy
      }
    }
  }
}

export const soundManager = new AudioManager();

