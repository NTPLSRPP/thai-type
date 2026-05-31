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
  it("back() steps the cursor back and resets that cell to untyped", () => {
    let now = 0;
    const e = createEngine("กา", () => now);
    now = 1000; e.press("ข"); // wrong at index 0
    expect(e.snapshot().cursor).toBe(1);
    expect(e.snapshot().cells[0].state).toBe("incorrect");
    e.back();
    const s = e.snapshot();
    expect(s.cursor).toBe(0);
    expect(s.cells[0].state).toBe("untyped");
    expect(s.cells[0].typed).toBeNull();
  });
  it("back() does nothing at the start", () => {
    const e = createEngine("กา", () => 0);
    e.back();
    expect(e.snapshot().cursor).toBe(0);
  });
  it("back() keeps the keystroke history (errors still counted) and allows retype", () => {
    let now = 0;
    const e = createEngine("ก", () => now);
    now = 1000; e.press("ข"); // wrong, finishes (len 1)
    e.back(); // un-finish, step back
    expect(e.snapshot().finished).toBe(false);
    now = 2000; e.press("ก"); // retype correct
    const s = e.snapshot();
    expect(s.finished).toBe(true);
    expect(s.keystrokes).toHaveLength(2); // both attempts recorded
    expect(s.cells[0].state).toBe("correct");
  });
});
