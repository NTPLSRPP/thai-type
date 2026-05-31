import { describe, it, expect } from "vitest";
import { playClick, playError } from "@/lib/sound/sound";

// jsdom has no AudioContext, so these assertions verify the SSR/no-AudioContext
// guard: each call must return without throwing.
describe("sound", () => {
  it("exports playClick and playError as functions", () => {
    expect(typeof playClick).toBe("function");
    expect(typeof playError).toBe("function");
  });

  it("playClick(0.5) does not throw without AudioContext", () => {
    expect(() => playClick(0.5)).not.toThrow();
  });

  it("playError(0.5) does not throw without AudioContext", () => {
    expect(() => playError(0.5)).not.toThrow();
  });

  it("playClick(0) is a no-op and does not throw", () => {
    expect(() => playClick(0)).not.toThrow();
  });
});
