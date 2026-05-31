import { create } from "zustand";
import { loadSettings, saveSettings } from "@/lib/storage/storage";
import type { Settings, TestMode, InputMode } from "@/lib/storage/schema";
import type { LayoutId } from "@/lib/layouts/registry";

interface SettingsState extends Settings {
  setMode(m: TestMode): void;
  setDuration(s: number): void;
  setWordCount(n: number): void;
  setLayout(id: LayoutId): void;
  setInputMode(m: InputMode): void;
}

export const useSettings = create<SettingsState>((set, get) => ({
  ...loadSettings(),
  setMode(m) { set({ mode: m }); saveSettings(snapshot(get())); },
  setDuration(s) { set({ duration: s }); saveSettings(snapshot(get())); },
  setWordCount(n) { set({ wordCount: n }); saveSettings(snapshot(get())); },
  setLayout(id) { set({ layoutId: id }); saveSettings(snapshot(get())); },
  setInputMode(m) { set({ inputMode: m }); saveSettings(snapshot(get())); },
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
