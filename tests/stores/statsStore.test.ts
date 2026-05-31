import { describe, it, expect, beforeEach } from "vitest";
import { useStats } from "@/stores/statsStore";
import type { SessionResult } from "@/lib/stats/types";

beforeEach(() => {
  localStorage.clear();
  useStats.getState().reload();
});

const sample: SessionResult = {
  at: 1,
  mode: "time",
  amount: 30,
  wpm: 55,
  rawWpm: 60,
  accuracy: 96,
  consistency: 80,
  correct: 10,
  incorrect: 1,
  layoutId: "kedmanee",
};

describe("statsStore", () => {
  it("starts empty", () => {
    expect(useStats.getState().sessions).toEqual([]);
  });
  it("record() persists and updates state", () => {
    useStats.getState().record(sample);
    expect(useStats.getState().sessions).toHaveLength(1);
    expect(JSON.parse(localStorage.getItem("thaitype:history")!).data).toHaveLength(1);
  });
  it("clear() empties history", () => {
    useStats.getState().record(sample);
    useStats.getState().clear();
    expect(useStats.getState().sessions).toEqual([]);
  });
});
