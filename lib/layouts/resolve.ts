import type { Layout } from "./types";

export function resolveKey(layout: Layout, code: string, shift: boolean): string | null {
  const def = layout.keys[code];
  if (!def) return null;
  return shift ? def.shift : def.normal;
}
