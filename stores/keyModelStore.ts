import { create } from "zustand";
import { loadKeyModel, recordKeystrokes, type KeyModel } from "@/lib/storage/keyModel";
import type { Keystroke } from "@/lib/engine/types";

interface KeyModelState {
  model: KeyModel;
  record(strokes: Keystroke[]): void;
  reload(): void;
}

export const useKeyModel = create<KeyModelState>((set) => ({
  model: loadKeyModel(),
  record(strokes) {
    const model = recordKeystrokes(strokes);
    set({ model: { ...model } });
  },
  reload() {
    set({ model: loadKeyModel() });
  },
}));
