import { describe, it, expect } from "vitest";
import { findKeyForChar } from "@/lib/layouts/reverse";
import { kedmanee } from "@/lib/layouts/kedmanee";

describe("findKeyForChar", () => {
  it("finds the code for a normal char", () => {
    expect(findKeyForChar(kedmanee, "ก")).toEqual({ code: "KeyD", shift: false });
  });
  it("finds the code + shift for a shifted char", () => {
    expect(findKeyForChar(kedmanee, "ฤ")).toEqual({ code: "KeyA", shift: true });
  });
  it("returns null for an unmapped char", () => {
    expect(findKeyForChar(kedmanee, "Z")).toBeNull();
  });
});
