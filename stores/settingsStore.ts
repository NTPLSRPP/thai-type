import { create } from "zustand";
import { loadSettings, saveSettings } from "@/lib/storage/storage";
import type { Settings, TestMode } from "@/lib/storage/schema";

interface SettingsState extends Settings {
  setMode(m: TestMode): void;
  setDuration(s: number): void;
  setWordCount(n: number): void;
}

export const useSettings = create<SettingsState>((set, get) => ({
  ...loadSettings(),
  setMode(m) { set({ mode: m }); saveSettings(snapshot(get())); },
  setDuration(s) { set({ duration: s }); saveSettings(snapshot(get())); },
  setWordCount(n) { set({ wordCount: n }); saveSettings(snapshot(get())); },
}));

function snapshot(s: Settings): Settings {
  return {
    mode: s.mode,
    duration: s.duration,
    wordCount: s.wordCount,
    inputMode: s.inputMode,
    layoutId: s.layoutId,
  };
}
