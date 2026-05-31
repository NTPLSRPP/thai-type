// Tiny WebAudio sound module for typing feedback.
//
// SSR/jsdom-safe: every entry point bails out before touching the Web Audio
// API when `window` or the `AudioContext` constructor is unavailable, and all
// audio work is wrapped in try/catch so a blocked or suspended context can
// never throw into the caller.

type AudioContextConstructor = new () => AudioContext;

interface WebkitWindow {
  AudioContext?: AudioContextConstructor;
  webkitAudioContext?: AudioContextConstructor;
}

// Click: a quick high blip.
const CLICK_FREQUENCY_HZ = 1200;
const CLICK_DURATION_S = 0.04;

// Error: a lower, slightly longer tone.
const ERROR_FREQUENCY_HZ = 200;
const ERROR_DURATION_S = 0.12;

// Keep the envelope quiet — this is background feedback, not a foreground sound.
const PEAK_GAIN = 0.15;

// Lazily-created shared context, reused across every call.
let sharedContext: AudioContext | null = null;

function getAudioContextConstructor(): AudioContextConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as WebkitWindow;
  return w.AudioContext ?? w.webkitAudioContext ?? null;
}

function getContext(): AudioContext | null {
  if (sharedContext) return sharedContext;
  const Ctor = getAudioContextConstructor();
  if (!Ctor) return null;
  try {
    sharedContext = new Ctor();
    return sharedContext;
  } catch {
    return null;
  }
}

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

function playTone(frequencyHz: number, durationS: number, volume: number): void {
  const level = clamp01(volume);
  if (level <= 0) return;

  const ctx = getContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.frequency.value = frequencyHz;
    oscillator.connect(gain);
    gain.connect(ctx.destination);

    // Short attack to the scaled peak, then exponential decay to silence.
    const peak = PEAK_GAIN * level;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(peak, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationS);

    oscillator.start(now);
    oscillator.stop(now + durationS);
  } catch {
    // A blocked, suspended, or otherwise unhappy context must never throw.
  }
}

// Short, soft key click.
export function playClick(volume: number): void {
  playTone(CLICK_FREQUENCY_HZ, CLICK_DURATION_S, volume);
}

// Lower, brief error tone.
export function playError(volume: number): void {
  playTone(ERROR_FREQUENCY_HZ, ERROR_DURATION_S, volume);
}
