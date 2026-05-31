import type { Keystroke } from "./types";

export const CHARS_PER_WORD = 5;

// Round to 2 decimals. Shared by all WPM/accuracy math so the definition lives in one place.
export const round2 = (n: number) => Math.round(n * 100) / 100;

// Net WPM = (correct chars / 5) per minute. Single source of truth for the WPM formula.
export function netWpm(correctChars: number, elapsedMs: number): number {
  const minutes = elapsedMs > 0 ? elapsedMs / 60000 : 0;
  return minutes > 0 ? round2(correctChars / CHARS_PER_WORD / minutes) : 0;
}

export interface Metrics {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  correct: number;
  incorrect: number;
}

export function computeMetrics(strokes: Keystroke[], elapsedMs: number): Metrics {
  const total = strokes.length;
  if (total === 0) return { wpm: 0, rawWpm: 0, accuracy: 0, consistency: 0, correct: 0, incorrect: 0 };
  const correct = strokes.filter((s) => s.correct).length;
  const incorrect = total - correct;
  const wpm = netWpm(correct, elapsedMs);
  const rawWpm = netWpm(total, elapsedMs);
  const accuracy = round2((correct / total) * 100);

  const sorted = [...strokes].sort((a, b) => a.t - b.t);
  const intervals: number[] = [];
  for (let i = 1; i < sorted.length; i++) intervals.push(sorted[i].t - sorted[i - 1].t);
  const consistency = intervals.length ? consistencyFrom(intervals) : 0;

  return { wpm, rawWpm, accuracy, consistency, correct, incorrect };
}

function consistencyFrom(intervals: number[]): number {
  const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  if (mean === 0) return 0;
  const variance = intervals.reduce((a, b) => a + (b - mean) ** 2, 0) / intervals.length;
  const cv = Math.sqrt(variance) / mean;
  return Math.max(0, Math.min(100, round2((1 - cv) * 100)));
}
