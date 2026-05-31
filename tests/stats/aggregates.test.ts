import { describe, it, expect } from "vitest";
import { computeAggregates } from "@/lib/stats/aggregates";
import type { SessionResult } from "@/lib/stats/types";

function s(wpm: number, accuracy: number): SessionResult {
  return { at: 0, mode: "time", amount: 30, wpm, rawWpm: wpm, accuracy, consistency: 80, correct: 1, incorrect: 0, layoutId: "kedmanee" };
}

describe("computeAggregates", () => {
  it("returns zeros for empty history", () => {
    expect(computeAggregates([])).toEqual({ totalTests: 0, bestWpm: 0, avgWpm: 0, avgAccuracy: 0 });
  });
  it("computes total, best, and averages", () => {
    const a = computeAggregates([s(40, 90), s(60, 100), s(50, 95)]);
    expect(a.totalTests).toBe(3);
    expect(a.bestWpm).toBe(60);
    expect(a.avgWpm).toBe(50);
    expect(a.avgAccuracy).toBe(95);
  });
});
