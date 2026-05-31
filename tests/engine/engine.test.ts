import { describe, it, expect } from "vitest";
import { createEngine } from "@/lib/engine/engine";

describe("createEngine", () => {
  it("advances cursor and records keystrokes", () => {
    let now = 0;
    const e = createEngine("กา", () => now);
    now = 1000; e.press("ก");
    now = 2000; e.press("า");
    const s = e.snapshot();
    expect(s.cursor).toBe(2);
    expect(s.finished).toBe(true);
    expect(s.keystrokes).toHaveLength(2);
    expect(s.keystrokes[0].correct).toBe(true);
  });
  it("sets startedAt on first press", () => {
    let now = 500;
    const e = createEngine("ก", () => now);
    expect(e.snapshot().startedAt).toBeNull();
    e.press("ก");
    expect(e.snapshot().startedAt).toBe(500);
  });
  it("ignores input after finish", () => {
    let now = 0;
    const e = createEngine("ก", () => now);
    e.press("ก");
    e.press("ข");
    expect(e.snapshot().keystrokes).toHaveLength(1);
  });
});
