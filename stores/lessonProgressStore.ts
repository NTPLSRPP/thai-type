import { create } from "zustand";
import { loadLessonProgress, recordRep, clearLessonProgress, type RepMap } from "@/lib/storage/lessonProgress";

interface LessonProgressState {
  reps: RepMap;
  record(id: number): number; // returns new rep count for that id
  clear(): void;
  reload(): void;
}

// Seeded empty (server-safe); the lessons UI reloads from storage on mount.
export const useLessonProgress = create<LessonProgressState>((set) => ({
  reps: {},
  record(id) {
    const next = recordRep(id);
    set({ reps: { ...next } });
    return next[id];
  },
  clear() {
    clearLessonProgress();
    set({ reps: {} });
  },
  reload() {
    set({ reps: loadLessonProgress() });
  },
}));
