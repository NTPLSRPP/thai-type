import type { SessionResult } from "@/lib/stats/types";

export const HISTORY_KEY = "thaitype:history";
export const HISTORY_CAP = 200;
const VERSION = 1;

export function loadHistory(): SessionResult[] {
  if (typeof localStorage === "undefined") return [];
  const raw = localStorage.getItem(HISTORY_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as { v: number; data: SessionResult[] };
    if (parsed.v !== VERSION || !Array.isArray(parsed.data)) return [];
    return parsed.data;
  } catch {
    return [];
  }
}

function saveHistory(list: SessionResult[]): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(HISTORY_KEY, JSON.stringify({ v: VERSION, data: list }));
}

export function recordSession(session: SessionResult): SessionResult[] {
  const next = [...loadHistory(), session].slice(-HISTORY_CAP);
  saveHistory(next);
  return next;
}

export function clearHistory(): void {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(HISTORY_KEY);
}
