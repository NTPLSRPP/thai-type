import { describe, it, expect } from "vitest";
import { weakCharWeights } from "@/lib/curriculum/adaptive";
import type { KeyModel } from "@/lib/storage/keyModel";

describe("weakCharWeights", () => {
  it("gives a higher weight to chars with a higher error rate", () => {
    const model: KeyModel = {
      "ก": { correct: 90, incorrect: 10 }, // 10% error
      "ด": { correct: 50, incorrect: 50 }, // 50% error
    };
    const w = weakCharWeights(model, ["ก", "ด"]);
    expect(w.get("ด")!).toBeGreaterThan(w.get("ก")!);
  });
  it("gives unseen chars a baseline weight (>=1)", () => {
    const w = weakCharWeights({}, ["ก"]);
    expect(w.get("ก")!).toBeGreaterThanOrEqual(1);
  });
  it("returns a weight for every requested char", () => {
    const w = weakCharWeights({ "ก": { correct: 1, incorrect: 0 } }, ["ก", "ด", "ฟ"]);
    expect([...w.keys()].sort()).toEqual(["ก", "ด", "ฟ"].sort());
  });
});
