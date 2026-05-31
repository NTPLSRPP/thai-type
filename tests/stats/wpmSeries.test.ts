import { describe, it, expect } from "vitest";
import { wpmSeries } from "@/lib/stats/wpmSeries";
import type { Keystroke } from "@/lib/engine/types";

function ks(t: number, correct = true): Keystroke {
  return { expected: "ก", actual: correct ? "ก" : "ข", correct, t };
}

describe("wpmSeries", () => {
  it("returns [] for no keystrokes", () => {
    expect(wpmSeries([])).toEqual([]);
  });
  it("samples cumulative wpm per bucket", () => {
    // 10 correct strokes evenly across 10s, bucket 1000ms.
    const strokes = Array.from({ length: 10 }, (_, i) => ks((i + 1) * 1000));
    const series = wpmSeries(strokes, 1000);
    expect(series.length).toBe(10);
    // last point: 10 correct chars over 10s => (10/5)/(10/60) = 12 wpm
    expect(series[series.length - 1]).toEqual({ t: 10, wpm: 12 });
  });
  it("counts only correct strokes toward wpm", () => {
    const strokes = [ks(1000, true), ks(1000, false)];
    const series = wpmSeries(strokes, 1000);
    // at t=1s, 1 correct char => (1/5)/(1/60) = 12 wpm
    expect(series[0]).toEqual({ t: 1, wpm: 12 });
  });
});
