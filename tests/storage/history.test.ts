import { describe, it, expect, beforeEach } from "vitest";
import { loadHistory, recordSession, clearHistory, HISTORY_KEY, HISTORY_CAP } from "@/lib/storage/history";
import type { SessionResult } from "@/lib/stats/types";

beforeEach(() => localStorage.clear());

function s(at: number, wpm = 50): SessionResult {
  return { at, mode: "time", amount: 30, wpm, rawWpm: wpm, accuracy: 95, consistency: 80, correct: 1, incorrect: 0, layoutId: "kedmanee" };
}

describe("history storage", () => {
  it("starts empty", () => {
    expect(loadHistory()).toEqual([]);
  });
  it("appends sessions in order", () => {
    recordSession(s(1));
    recordSession(s(2));
    expect(loadHistory().map((x) => x.at)).toEqual([1, 2]);
  });
  it("caps history to the most recent HISTORY_CAP", () => {
    for (let i = 0; i < HISTORY_CAP + 5; i++) recordSession(s(i));
    const h = loadHistory();
    expect(h.length).toBe(HISTORY_CAP);
    expect(h[h.length - 1].at).toBe(HISTORY_CAP + 4); // newest kept
    expect(h[0].at).toBe(5); // oldest 5 dropped
  });
  it("clears history", () => {
    recordSession(s(1));
    clearHistory();
    expect(loadHistory()).toEqual([]);
  });
  it("falls back to [] on corrupt data", () => {
    localStorage.setItem(HISTORY_KEY, "{bad");
    expect(loadHistory()).toEqual([]);
  });
});
