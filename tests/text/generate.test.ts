import { describe, it, expect } from "vitest";
import { generateWords } from "@/lib/text/generate";
import { THAI_WORDS } from "@/lib/text/thaiWords";

describe("generateWords", () => {
  it("returns the requested number of space-joined words", () => {
    const out = generateWords(10, () => 0); // rng always 0 -> first word
    expect(out.split(" ")).toHaveLength(10);
  });
  it("only emits words from the pool", () => {
    const out = generateWords(5, Math.random);
    for (const w of out.split(" ")) expect(THAI_WORDS).toContain(w);
  });
});
