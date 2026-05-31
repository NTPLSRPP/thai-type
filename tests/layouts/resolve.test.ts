import { describe, it, expect } from "vitest";
import { resolveKey } from "@/lib/layouts/resolve";
import { kedmanee } from "@/lib/layouts/kedmanee";

describe("resolveKey", () => {
  it("maps a code to its normal char", () => {
    expect(resolveKey(kedmanee, "KeyA", false)).toBe("ฟ");
  });
  it("maps a code to its shift char", () => {
    expect(resolveKey(kedmanee, "KeyA", true)).toBe("ฤ");
  });
  it("returns null for unmapped codes", () => {
    expect(resolveKey(kedmanee, "F5", false)).toBeNull();
  });
});
