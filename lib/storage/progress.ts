import { orderedUnits } from "@/lib/curriculum/units";

export const PROGRESS_KEY = "thaitype:progress";
const VERSION = 1;

export interface Progress {
  completed: string[];
}

export function loadProgress(): Progress {
  if (typeof localStorage === "undefined") return { completed: [] };
  const raw = localStorage.getItem(PROGRESS_KEY);
  if (!raw) return { completed: [] };
  try {
    const parsed = JSON.parse(raw) as { v: number; data: Progress };
    if (parsed.v !== VERSION || !Array.isArray(parsed.data?.completed)) return { completed: [] };
    return parsed.data;
  } catch {
    return { completed: [] };
  }
}

export function saveProgress(p: Progress): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify({ v: VERSION, data: p }));
}

export function markComplete(unitId: string): Progress {
  const p = loadProgress();
  if (!p.completed.includes(unitId)) p.completed.push(unitId);
  saveProgress(p);
  return p;
}

export function isUnlocked(unitId: string, completed: string[]): boolean {
  const ordered = orderedUnits();
  const i = ordered.findIndex((u) => u.id === unitId);
  if (i <= 0) return true; // first unit (or unknown) is open
  return completed.includes(ordered[i - 1].id);
}
