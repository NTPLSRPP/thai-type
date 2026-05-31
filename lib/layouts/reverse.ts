import type { Layout } from "./types";

export function findKeyForChar(layout: Layout, char: string): { code: string; shift: boolean } | null {
  for (const [code, def] of Object.entries(layout.keys)) {
    if (def.normal === char) return { code, shift: false };
  }
  for (const [code, def] of Object.entries(layout.keys)) {
    if (def.shift === char) return { code, shift: true };
  }
  return null;
}
