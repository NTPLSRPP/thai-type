import { create } from "zustand";
import { loadHistory, recordSession, clearHistory } from "@/lib/storage/history";
import type { SessionResult } from "@/lib/stats/types";

interface StatsState {
  sessions: SessionResult[];
  record(session: SessionResult): void;
  clear(): void;
  reload(): void;
}

// Seeded empty (server-safe); the stats page reloads from storage on mount.
export const useStats = create<StatsState>((set) => ({
  sessions: [],
  record(session) {
    const next = recordSession(session);
    set({ sessions: [...next] });
  },
  clear() {
    clearHistory();
    set({ sessions: [] });
  },
  reload() {
    set({ sessions: loadHistory() });
  },
}));
