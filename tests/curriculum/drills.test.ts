import { describe, it, expect } from "vitest";
import { generateDrill, charsForCodes } from "@/lib/curriculum/drills";
import { kedmanee } from "@/lib/layouts/kedmanee";

describe("charsForCodes", () => {
  it("resolves codes to their normal chars via the layout", () => {
    const chars = charsForCodes(["KeyD", "KeyF"], kedmanee); // ก, ด
    expect(chars).toEqual(["ก", "ด"]);
  });
  it("skips codes absent from the layout", () => {
    expect(charsForCodes(["KeyD", "F13"], kedmanee)).toEqual(["ก"]);
  });
});

describe("generateDrill", () => {
  it("produces the requested number of space-separated groups", () => {
    const out = generateDrill({ codes: ["KeyD", "KeyF", "KeyG"], layout: kedmanee, groups: 5, rng: () => 0 });
    expect(out.split(" ")).toHaveLength(5);
  });
  it("only uses characters from the resolved code set", () => {
    const allowed = new Set(charsForCodes(["KeyD", "KeyF"], kedmanee));
    const out = generateDrill({ codes: ["KeyD", "KeyF"], layout: kedmanee, groups: 4, rng: Math.random });
    for (const ch of out.replace(/ /g, "")) expect(allowed.has(ch)).toBe(true);
  });
  it("is deterministic for a fixed rng", () => {
    const a = generateDrill({ codes: ["KeyD", "KeyF", "KeyG"], layout: kedmanee, groups: 6, rng: seeded(1) });
    const b = generateDrill({ codes: ["KeyD", "KeyF", "KeyG"], layout: kedmanee, groups: 6, rng: seeded(1) });
    expect(a).toBe(b);
  });
});

// simple deterministic rng for tests
function seeded(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}
