import { describe, it, expect, beforeEach } from "vitest";
import { loadProgress, markComplete, isUnlocked, PROGRESS_KEY } from "@/lib/storage/progress";

beforeEach(() => localStorage.clear());

describe("progress storage", () => {
  it("starts empty", () => {
    expect(loadProgress()).toEqual({ completed: [] });
  });
  it("marks a unit complete (idempotent)", () => {
    markComplete("home-left");
    markComplete("home-left");
    expect(loadProgress().completed).toEqual(["home-left"]);
  });
  it("unlocks the first unit unconditionally", () => {
    expect(isUnlocked("home-left", [])).toBe(true);
  });
  it("locks a later unit until the previous one is complete", () => {
    expect(isUnlocked("home-right", [])).toBe(false);
    expect(isUnlocked("home-right", ["home-left"])).toBe(true);
  });
  it("falls back to empty on corrupt data", () => {
    localStorage.setItem(PROGRESS_KEY, "nope");
    expect(loadProgress()).toEqual({ completed: [] });
  });
});
