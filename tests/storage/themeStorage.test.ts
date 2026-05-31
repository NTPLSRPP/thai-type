import { describe, it, expect, beforeEach } from "vitest";
import {
  loadCustomThemes, saveCustomThemes, loadActiveId, saveActiveId, THEMES_KEY,
} from "@/lib/storage/themeStorage";
import type { Theme } from "@/lib/theme/types";

beforeEach(() => localStorage.clear());

const sample: Theme = {
  id: "custom-1", name: "Mine", caretStyle: "line", sound: "off", background: null,
  vars: { "--bg": "#000", "--text": "#777", "--text-typed": "#fff", "--accent": "#0f0", "--caret": "#0f0", "--font": "monospace" },
};

describe("theme storage", () => {
  it("returns [] and null when empty", () => {
    expect(loadCustomThemes()).toEqual([]);
    expect(loadActiveId()).toBeNull();
  });
  it("round-trips custom themes", () => {
    saveCustomThemes([sample]);
    expect(loadCustomThemes()).toEqual([sample]);
  });
  it("round-trips the active id", () => {
    saveActiveId("ocean");
    expect(loadActiveId()).toBe("ocean");
  });
  it("falls back to [] on corrupt data", () => {
    localStorage.setItem(THEMES_KEY, "{bad");
    expect(loadCustomThemes()).toEqual([]);
  });
});
