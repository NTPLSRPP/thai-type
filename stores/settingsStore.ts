import { create } from "zustand";
import { loadSettings, saveSettings, DEFAULT_SETTINGS } from "@/lib/storage/storage";
import type { Settings, TestMode, InputMode } from "@/lib/storage/schema";
import type { LayoutId } from "@/lib/layouts/registry";

interface SettingsActions {
  update(patch: Partial<Settings>): void;
  reset(): void;
  reload(): void;
  setMode(m: TestMode): void;
  setDuration(s: number): void;
  setWordCount(n: number): void;
  setLayout(id: LayoutId): void;
  setInputMode(m: InputMode): void;
}

type SettingsState = Settings & SettingsActions;

// Persist only the Settings fields (never the action functions).
function snapshot(s: Settings): Settings {
  const src = s as unknown as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(DEFAULT_SETTINGS)) {
    out[key] = src[key];
  }
  return out as unknown as Settings;
}

// Seed with deterministic defaults so the first client render matches the SSR HTML.
// ThemeProvider calls reload() on mount to hydrate persisted settings.
export const useSettings = create<SettingsState>((set, get) => ({
  ...DEFAULT_SETTINGS,
  update(patch) {
    set(patch);
    saveSettings(snapshot(get()));
  },
  reset() {
    set({ ...DEFAULT_SETTINGS });
    saveSettings(DEFAULT_SETTINGS);
  },
  reload() {
    set({ ...loadSettings() });
  },
  setMode(m) {
    get().update({ mode: m });
  },
  setDuration(s) {
    get().update({ duration: s });
  },
  setWordCount(n) {
    get().update({ wordCount: n });
  },
  setLayout(id) {
    get().update({ layoutId: id });
  },
  setInputMode(m) {
    get().update({ inputMode: m });
  },
}));
