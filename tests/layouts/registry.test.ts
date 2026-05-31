import { describe, it, expect } from "vitest";
import { LAYOUTS, getLayout, layoutList } from "@/lib/layouts/registry";

describe("layout registry", () => {
  it("contains all three layouts", () => {
    expect(Object.keys(LAYOUTS).sort()).toEqual(["kedmanee", "manoonchai", "pattachote"]);
  });
  it("getLayout returns the requested layout", () => {
    expect(getLayout("pattachote").id).toBe("pattachote");
  });
  it("layoutList exposes id + name for UI", () => {
    const ids = layoutList().map((l) => l.id).sort();
    expect(ids).toEqual(["kedmanee", "manoonchai", "pattachote"]);
    expect(layoutList().every((l) => typeof l.name === "string" && l.name.length > 0)).toBe(true);
  });
  it("every layout maps the home-row letter codes", () => {
    const home = ["KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyK", "KeyL"];
    for (const layout of Object.values(LAYOUTS)) {
      for (const code of home) {
        expect(layout.keys[code], `${layout.id} missing ${code}`).toBeDefined();
        expect(layout.keys[code].normal.length).toBeGreaterThan(0);
      }
    }
  });
});
