import { describe, it, expect, beforeEach } from "vitest";
import { loadSettings, saveSettings, DEFAULT_SETTINGS } from "@/lib/storage/storage";

beforeEach(() => localStorage.clear());

describe("settings storage", () => {
  it("returns defaults when nothing stored", () => {
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });
  it("round-trips saved settings", () => {
    const next = { ...DEFAULT_SETTINGS, mode: "words" as const, wordCount: 50 };
    saveSettings(next);
    expect(loadSettings()).toEqual(next);
  });
  it("falls back to defaults on corrupt data", () => {
    localStorage.setItem("thaitype:settings", "{not json");
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });
  it("falls back to defaults on version mismatch", () => {
    localStorage.setItem("thaitype:settings", JSON.stringify({ v: 999, data: {} }));
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });
});
