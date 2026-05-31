import { create } from "zustand";
import type { EngineSnapshot } from "@/lib/engine/types";

interface SessionState {
  snap: EngineSnapshot | null;
  setSnap(s: EngineSnapshot): void;
  reset(): void;
}

export const useSession = create<SessionState>((set) => ({
  snap: null,
  setSnap(s) { set({ snap: s }); },
  reset() { set({ snap: null }); },
}));
