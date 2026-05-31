import { create } from "zustand";
import { loadProgress, markComplete } from "@/lib/storage/progress";

interface ProgressState {
  completed: string[];
  complete(unitId: string): void;
  reload(): void;
}

export const useProgress = create<ProgressState>((set) => ({
  completed: loadProgress().completed,
  complete(unitId) {
    const p = markComplete(unitId);
    set({ completed: [...p.completed] });
  },
  reload() {
    set({ completed: loadProgress().completed });
  },
}));
