import type { Keystroke } from "@/lib/engine/types";
import type { WpmPoint } from "./types";

const round = (n: number) => Math.round(n * 100) / 100;

export function wpmSeries(strokes: Keystroke[], bucketMs = 1000): WpmPoint[] {
  if (strokes.length === 0) return [];
  const sorted = [...strokes].sort((a, b) => a.t - b.t);
  const lastT = sorted[sorted.length - 1].t;
  const points: WpmPoint[] = [];
  for (let b = bucketMs; b <= lastT + bucketMs - 1; b += bucketMs) {
    const cutoff = Math.min(b, lastT);
    const correct = sorted.filter((s) => s.t <= cutoff && s.correct).length;
    const minutes = cutoff / 60000;
    const wpm = minutes > 0 ? round(correct / 5 / minutes) : 0;
    points.push({ t: round(cutoff / 1000), wpm });
  }
  return points;
}
