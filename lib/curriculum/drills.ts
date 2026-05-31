import type { Layout } from "@/lib/layouts/types";

export function charsForCodes(codes: string[], layout: Layout): string[] {
  const out: string[] = [];
  for (const code of codes) {
    const def = layout.keys[code];
    if (def && def.normal !== " " && def.normal.length > 0) out.push(def.normal);
  }
  return out;
}

interface DrillOpts {
  codes: string[];
  layout: Layout;
  groups?: number; // number of pseudo-word chunks
  groupLen?: [number, number]; // [min, max] chars per chunk
  weights?: Map<string, number>; // char -> relative weight (>=0)
  rng?: () => number;
}

export function generateDrill(opts: DrillOpts): string {
  const { codes, layout, groups = 8, groupLen = [2, 4], weights, rng = Math.random } = opts;
  const chars = charsForCodes(codes, layout);
  if (chars.length === 0) return "";

  const weighted = buildWeightedPool(chars, weights);
  const [minLen, maxLen] = groupLen;
  const chunks: string[] = [];
  for (let g = 0; g < groups; g++) {
    const len = minLen + Math.floor(rng() * (maxLen - minLen + 1));
    let chunk = "";
    for (let i = 0; i < len; i++) {
      chunk += weighted[Math.floor(rng() * weighted.length) % weighted.length];
    }
    chunks.push(chunk);
  }
  return chunks.join(" ");
}

// Expand chars into a flat pool where higher-weight chars appear more often.
function buildWeightedPool(chars: string[], weights?: Map<string, number>): string[] {
  if (!weights) return chars;
  const pool: string[] = [];
  for (const ch of chars) {
    const w = Math.max(1, Math.round(weights.get(ch) ?? 1));
    for (let i = 0; i < w; i++) pool.push(ch);
  }
  return pool.length ? pool : chars;
}
