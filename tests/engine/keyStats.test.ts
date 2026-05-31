import { describe, it, expect } from "vitest";
import { errorCountsByChar } from "@/lib/engine/keyStats";
import type { Keystroke } from "@/lib/engine/types";

function ks(expected: string, actual: string, t: number): Keystroke {
  return { expected, actual, correct: expected === actual, t };
}

describe("errorCountsByChar", () => {
  it("counts incorrect keystrokes keyed by expected char", () => {
    const strokes = [ks("ก", "ก", 1), ks("า", "ก", 2), ks("า", "ก", 3)];
    const counts = errorCountsByChar(strokes);
    expect(counts.get("า")).toBe(2);
    expect(counts.has("ก")).toBe(false);
  });
  it("returns an empty map for no strokes", () => {
    expect(errorCountsByChar([]).size).toBe(0);
  });
});
