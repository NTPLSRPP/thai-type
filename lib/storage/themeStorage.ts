import type { Theme } from "@/lib/theme/types";

export const THEMES_KEY = "thaitype:themes";
export const ACTIVE_KEY = "thaitype:activetheme";
const VERSION = 1;

export function loadCustomThemes(): Theme[] {
  if (typeof localStorage === "undefined") return [];
  const raw = localStorage.getItem(THEMES_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as { v: number; data: Theme[] };
    if (parsed.v !== VERSION || !Array.isArray(parsed.data)) return [];
    return parsed.data;
  } catch {
    return [];
  }
}

export function saveCustomThemes(themes: Theme[]): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(THEMES_KEY, JSON.stringify({ v: VERSION, data: themes }));
}

export function loadActiveId(): string | null {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem(ACTIVE_KEY);
}

export function saveActiveId(id: string): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(ACTIVE_KEY, id);
}
