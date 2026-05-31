import { DEFAULT_SETTINGS, SCHEMA_VERSION, type Settings } from "./schema";

const KEY = "thaitype:settings";
export { DEFAULT_SETTINGS };

export function loadSettings(): Settings {
  if (typeof localStorage === "undefined") return DEFAULT_SETTINGS;
  const raw = localStorage.getItem(KEY);
  if (!raw) return DEFAULT_SETTINGS;
  try {
    const parsed = JSON.parse(raw) as { v: number; data: Partial<Settings> };
    // Forward-compatible: accept any known version <= current and merge defaults for
    // missing fields (v1 -> v2 migration just fills the new settings with defaults).
    if (typeof parsed.v !== "number" || parsed.v > SCHEMA_VERSION || typeof parsed.data !== "object" || parsed.data === null) {
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...parsed.data };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(s: Settings): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify({ v: SCHEMA_VERSION, data: s }));
}
