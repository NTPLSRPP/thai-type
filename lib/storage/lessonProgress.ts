import { REPS_TO_COMPLETE } from "@/lib/curriculum/chapters";

export const LESSON_PROGRESS_KEY = "thaitype:lessonprogress";
const VERSION = 1;

// sub-lesson id -> number of reps completed (capped at REPS_TO_COMPLETE)
export type RepMap = Record<number, number>;

export function loadLessonProgress(): RepMap {
  if (typeof localStorage === "undefined") return {};
  const raw = localStorage.getItem(LESSON_PROGRESS_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as { v: number; data: RepMap };
    if (parsed.v !== VERSION || typeof parsed.data !== "object" || parsed.data === null) return {};
    return parsed.data;
  } catch {
    return {};
  }
}

function save(map: RepMap): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(LESSON_PROGRESS_KEY, JSON.stringify({ v: VERSION, data: map }));
}

export function recordRep(id: number): RepMap {
  const map = loadLessonProgress();
  const next = Math.min(REPS_TO_COMPLETE, (map[id] ?? 0) + 1);
  const updated = { ...map, [id]: next };
  save(updated);
  return updated;
}

export function isSubLessonComplete(id: number, reps: RepMap): boolean {
  return (reps[id] ?? 0) >= REPS_TO_COMPLETE;
}

export function clearLessonProgress(): void {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(LESSON_PROGRESS_KEY);
}
