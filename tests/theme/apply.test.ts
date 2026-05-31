import { describe, it, expect } from "vitest";
import { applyTheme } from "@/lib/theme/apply";
import { minimalDark } from "@/lib/theme/minimalDark";

describe("applyTheme", () => {
  it("writes theme vars onto the root element style", () => {
    applyTheme(minimalDark, document.documentElement);
    expect(document.documentElement.style.getPropertyValue("--bg")).toBe(minimalDark.vars["--bg"]);
    expect(document.documentElement.style.getPropertyValue("--accent")).toBe(minimalDark.vars["--accent"]);
  });
});
