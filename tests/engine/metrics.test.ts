import { describe, it, expect } from "vitest";
import { computeMetrics } from "@/lib/engine/metrics";
import type { Keystroke } from "@/lib/engine/types";

function ks(expected: string, actual: string, t: number): Keystroke {
  return { expected, actual, correct: expected === actual, t };
}

describe("computeMetrics", () => {
  it("computes wpm from correct chars over elapsed time", () => {
    // 10 correct chars over 60s = (10/5) / (60/60) = 2 wpm
    const strokes = Array.from({ length: 10 }, (_, i) => ks("ก", "ก", (i + 1) * 6000));
    const m = computeMetrics(strokes, 60000);
    expect(m.wpm).toBe(2);
    expect(m.accuracy).toBe(100);
  });
  it("accuracy reflects wrong keystrokes", () => {
    const strokes = [ks("ก", "ก", 1000), ks("า", "ข", 2000)];
    const m = computeMetrics(strokes, 2000);
    expect(m.accuracy).toBe(50);
  });
  it("returns zeros for no strokes", () => {
    const m = computeMetrics([], 0);
    expect(m).toMatchObject({ wpm: 0, accuracy: 0, consistency: 0 });
  });
});
