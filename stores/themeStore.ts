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
  updateCustom(theme: Theme): void;
  deleteCustom(id: string): void;
  reload(): void;
}

export const useTheme = create<ThemeState>((set, get) => ({
  activeId: loadActiveId() ?? "minimal-dark",
  customs: loadCustomThemes(),
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
  updateCustom(theme) {
    const customs = get().customs.map((t) => (t.id === theme.id ? theme : t));
    set({ customs });
    saveCustomThemes(customs);
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
