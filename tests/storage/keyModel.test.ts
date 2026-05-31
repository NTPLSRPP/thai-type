import { describe, it, expect, beforeEach } from "vitest";
import { loadKeyModel, recordKeystrokes, KEY_MODEL_KEY } from "@/lib/storage/keyModel";
import type { Keystroke } from "@/lib/engine/types";

beforeEach(() => localStorage.clear());

function ks(expected: string, actual: string): Keystroke {
  return { expected, actual, correct: expected === actual, t: 0 };
}

describe("key model storage", () => {
  it("returns an empty model when nothing stored", () => {
    expect(loadKeyModel()).toEqual({});
  });
  it("merges keystrokes into per-char correct/incorrect counts", () => {
    recordKeystrokes([ks("ก", "ก"), ks("ก", "ด"), ks("ด", "ด")]);
    const m = loadKeyModel();
    expect(m["ก"]).toEqual({ correct: 1, incorrect: 1 });
    expect(m["ด"]).toEqual({ correct: 1, incorrect: 0 });
  });
  it("accumulates across multiple record calls", () => {
    recordKeystrokes([ks("ก", "ก")]);
    recordKeystrokes([ks("ก", "ก")]);
    expect(loadKeyModel()["ก"]).toEqual({ correct: 2, incorrect: 0 });
  });
  it("falls back to empty on corrupt data", () => {
    localStorage.setItem(KEY_MODEL_KEY, "{bad json");
    expect(loadKeyModel()).toEqual({});
  });
});
