import type { Keystroke } from "@/lib/engine/types";
import { netWpm, round2 } from "@/lib/engine/metrics";
import type { WpmPoint } from "./types";

export function wpmSeries(strokes: Keystroke[], bucketMs = 1000): WpmPoint[] {
  if (strokes.length === 0) return [];
  const sorted = [...strokes].sort((a, b) => a.t - b.t);
  const lastT = sorted[sorted.length - 1].t;
  const points: WpmPoint[] = [];
  for (let b = bucketMs; b <= lastT + bucketMs - 1; b += bucketMs) {
    const cutoff = Math.min(b, lastT);
    const correct = sorted.filter((s) => s.t <= cutoff && s.correct).length;
    points.push({ t: round2(cutoff / 1000), wpm: netWpm(correct, cutoff) });
  }
  return points;
}
