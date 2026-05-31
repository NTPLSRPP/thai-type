import { create } from "zustand";
import type { Theme } from "@/lib/theme/types";
import { PRESETS, presetById } from "@/lib/theme/presets";
import {
  loadCustomThemes,
  saveCustomThemes,
  loadActiveId,
  saveActiveId,
} from "@/lib/storage/themeStorage";

let idSeq = 0;
function freshId(): string {
  idSeq += 1;
  return `custom-${idSeq}-${((idSeq * 2654435761) % 1_000_000).toString(36)}`;
}

interface ThemeState {
  activeId: string;
  customs: Theme[];
  allThemes(): Theme[];
  activeTheme(): Theme | undefined;
  setActive(id: string): void;
  addCustom(draft: Theme): Theme;
  deleteCustom(id: string): void;
  reload(): void;
}

// Seed with deterministic, server-safe defaults so the first client render matches
// the SSR HTML. ThemeProvider calls reload() on mount to hydrate from localStorage.
export const useTheme = create<ThemeState>((set, get) => ({
  activeId: "minimal-dark",
  customs: [],
  allThemes() {
    return [...PRESETS, ...get().customs];
  },
  activeTheme() {
    const id = get().activeId;
    return presetById(id) ?? get().customs.find((t) => t.id === id);
  },
  setActive(id) {
    set({ activeId: id });
    saveActiveId(id);
  },
  addCustom(draft) {
    const theme: Theme = { ...draft, id: freshId(), builtin: false };
    const customs = [...get().customs, theme];
    set({ customs });
    saveCustomThemes(customs);
    return theme;
  },
  deleteCustom(id) {
    const customs = get().customs.filter((t) => t.id !== id);
    set({ customs });
    saveCustomThemes(customs);
    if (get().activeId === id) get().setActive("minimal-dark");
  },
  reload() {
    set({ activeId: loadActiveId() ?? "minimal-dark", customs: loadCustomThemes() });
  },
}));
