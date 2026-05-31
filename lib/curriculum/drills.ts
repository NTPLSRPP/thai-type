import type { Layout } from "@/lib/layouts/types";

export function charsForCodes(codes: string[], layout: Layout): string[] {
  const out: string[] = [];
  for (const code of codes) {
    const def = layout.keys[code];
    if (def && def.normal !== " " && def.normal.length > 0) out.push(def.normal);
  }
  return out;
}

// Thai combining marks (Unicode Mn): above vowel ั (0E31), below/above vowels ิ–ฺ
// (0E34–0E3A), tone marks + signs ็ ่ ้ ๊ ๋ ์ ํ ฺ (0E47–0E4E). These have zero width
// and stack on the preceding base consonant, so they must never appear in isolation
// or back-to-back in a drill.
export function isCombiningThai(ch: string): boolean {
  const c = ch.codePointAt(0) ?? 0;
  return c === 0x0e31 || (c >= 0x0e34 && c <= 0x0e3a) || (c >= 0x0e47 && c <= 0x0e4e);
}

interface DrillOpts {
  codes: string[];
  layout: Layout;
  groups?: number; // number of pseudo-word chunks
  groupLen?: [number, number]; // [min, max] base letters per chunk
  weights?: Map<string, number>; // char -> relative weight (>=0)
  rng?: () => number;
}

const MARK_PROBABILITY = 0.45;
const FALLBACK_BASE = "ก"; // hosts marks when a unit's key set is marks-only

export function generateDrill(opts: DrillOpts): string {
  const { codes, layout, groups = 8, groupLen = [2, 4], weights, rng = Math.random } = opts;
  const chars = charsForCodes(codes, layout);
  if (chars.length === 0) return "";

  const baseChars = chars.filter((c) => !isCombiningThai(c));
  const markChars = chars.filter((c) => isCombiningThai(c));
  const bases = buildWeightedPool(baseChars.length ? baseChars : [FALLBACK_BASE], weights);
  const marks = buildWeightedPool(markChars, weights);

  const pick = (pool: string[]) => pool[Math.floor(rng() * pool.length) % pool.length];

  const [minLen, maxLen] = groupLen;
  const chunks: string[] = [];
  for (let g = 0; g < groups; g++) {
    const len = minLen + Math.floor(rng() * (maxLen - minLen + 1));
    let chunk = "";
    for (let i = 0; i < len; i++) {
      chunk += pick(bases); // every syllable starts with a base — readable, never stacked
      if (marks.length > 0 && rng() < MARK_PROBABILITY) chunk += pick(marks);
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
