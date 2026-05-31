import { describe, it, expect } from "vitest";
import { buildCells, applyInput } from "@/lib/engine/compare";

describe("buildCells", () => {
  it("creates one cell per grapheme cluster", () => {
    const cells = buildCells("ก้า");
    expect(cells.map((c) => c.target)).toEqual(["ก้", "า"]);
    expect(cells.every((c) => c.state === "untyped")).toBe(true);
  });
});

describe("applyInput", () => {
  it("marks correct when typed cluster matches target", () => {
    const cells = buildCells("กา");
    const next = applyInput(cells, 0, "ก");
    expect(next.cells[0].state).toBe("correct");
    expect(next.cursor).toBe(1);
  });
  it("marks incorrect on mismatch but still advances", () => {
    const cells = buildCells("กา");
    const next = applyInput(cells, 0, "ข");
    expect(next.cells[0].state).toBe("incorrect");
    expect(next.cursor).toBe(1);
  });
});
