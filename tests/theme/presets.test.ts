import { describe, it, expect } from "vitest";
import { PRESETS, presetById } from "@/lib/theme/presets";

describe("presets", () => {
  it("ships at least 12 builtin presets including minimal-dark", () => {
    expect(PRESETS.length).toBeGreaterThanOrEqual(12);
    expect(PRESETS.some((p) => p.id === "minimal-dark")).toBe(true);
    expect(PRESETS.every((p) => p.builtin === true)).toBe(true);
  });
  it("every preset defines the core vars + caret + sound", () => {
    for (const p of PRESETS) {
      for (const v of ["--bg", "--text", "--text-typed", "--accent", "--error", "--caret", "--font"]) {
        expect(p.vars[v], `${p.id} missing ${v}`).toBeTruthy();
      }
      expect(["line", "block", "underline"]).toContain(p.caretStyle);
      expect(["off", "click"]).toContain(p.sound);
    }
  });
  it("presetById finds and misses correctly", () => {
    expect(presetById("minimal-dark")?.id).toBe("minimal-dark");
    expect(presetById("nope")).toBeUndefined();
  });
  it("ids are unique", () => {
    expect(new Set(PRESETS.map((p) => p.id)).size).toBe(PRESETS.length);
  });
});
