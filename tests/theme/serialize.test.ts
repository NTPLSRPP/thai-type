import { describe, it, expect } from "vitest";
import { exportThemeJSON, exportThemeCode, importThemeJSON, importThemeCode } from "@/lib/theme/serialize";
import { minimalDark } from "@/lib/theme/minimalDark";

describe("theme serialize", () => {
  it("round-trips JSON", () => {
    const json = exportThemeJSON(minimalDark);
    const back = importThemeJSON(json);
    expect(back?.vars["--accent"]).toBe(minimalDark.vars["--accent"]);
    expect(back?.caretStyle).toBe(minimalDark.caretStyle);
  });
  it("round-trips a short code", () => {
    const code = exportThemeCode(minimalDark);
    const back = importThemeCode(code);
    expect(back?.name).toBe(minimalDark.name);
  });
  it("strips builtin and assigns a fresh id on import", () => {
    const back = importThemeJSON(exportThemeJSON(minimalDark));
    expect(back?.builtin).toBeUndefined();
    expect(back?.id).not.toBe(minimalDark.id);
  });
  it("rejects invalid input", () => {
    expect(importThemeJSON("{garbage")).toBeNull();
    expect(importThemeJSON(JSON.stringify({ name: "x" }))).toBeNull(); // missing vars
    expect(importThemeCode("not-base64!!")).toBeNull();
  });
});
