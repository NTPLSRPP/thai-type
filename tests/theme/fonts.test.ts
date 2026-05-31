import { describe, it, expect } from "vitest";
import { FONT_OPTIONS } from "@/lib/theme/fonts";

describe("font options", () => {
  it("offers several Thai-capable font stacks", () => {
    expect(FONT_OPTIONS.length).toBeGreaterThanOrEqual(4);
    for (const f of FONT_OPTIONS) {
      expect(typeof f.label).toBe("string");
      expect(f.stack.length).toBeGreaterThan(0);
    }
  });
  it("includes the default monospace stack", () => {
    expect(FONT_OPTIONS.some((f) => f.stack.includes("JetBrains Mono"))).toBe(true);
  });
});
