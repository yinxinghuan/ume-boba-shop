/**
 * Game sound effects using Web Audio API.
 * No external audio files needed - all sounds are synthesized.
 */

let audioCtx: AudioContext | null = null;

const getAudioCtx = (): AudioContext => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

/** Ensure AudioContext is resumed (required after user gesture on mobile) */
export const resumeAudio = (): void => {
  const ctx = getAudioCtx();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
};

/** Whack hit sound - punchy pop */
export const playWhackSound = (): void => {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;

    // Impact thump
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);

    // Click snap
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(800, now);
    osc2.frequency.exponentialRampToValueAtTime(200, now + 0.05);
    gain2.gain.setValueAtTime(0.2, now);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
    osc2.connect(gain2).connect(ctx.destination);
    osc2.start(now);
    osc2.stop(now + 0.05);
  } catch {
    // ignore
  }
};

/** Ghost hit sound - spooky descending tone */
export const playGhostSound = (): void => {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;

    // Eerie descending tone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.4);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);

    // Wobble overlay
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(400, now);
    osc2.frequency.exponentialRampToValueAtTime(100, now + 0.35);
    gain2.gain.setValueAtTime(0.15, now);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    osc2.connect(gain2).connect(ctx.destination);
    osc2.start(now);
    osc2.stop(now + 0.35);
  } catch {
    // ignore
  }
};

/** Mole popup sound - quick boing */
export const playPopupSound = (): void => {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(500, now + 0.06);
    osc.frequency.exponentialRampToValueAtTime(350, now + 0.12);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  } catch {
    // ignore
  }
};

/** Game start sound - ascending cheerful jingle */
export const playStartSound = (): void => {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;

    const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const t = now + i * 0.1;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.25, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.2);
    });
  } catch {
    // ignore
  }
};

/** Game over sound - descending tones */
export const playGameOverSound = (): void => {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;

    const notes = [784, 659, 523, 392]; // G5 E5 C5 G4
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const t = now + i * 0.15;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.2, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.3);
    });
  } catch {
    // ignore
  }
};

/** Combo sound - quick rising ding */
export const playComboSound = (comboCount: number): void => {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;

    // Pitch rises with combo
    const baseFreq = 800 + Math.min(comboCount, 10) * 80;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.3, now + 0.08);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  } catch {
    // ignore
  }
};
