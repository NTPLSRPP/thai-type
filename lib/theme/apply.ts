import type { Theme } from "./types";

export function applyTheme(theme: Theme, root: HTMLElement): void {
  for (const [k, v] of Object.entries(theme.vars)) root.style.setProperty(k, v);
}
