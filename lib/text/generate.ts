import { THAI_WORDS } from "./thaiWords";

export function generateWords(count: number, rng: () => number = Math.random): string {
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(rng() * THAI_WORDS.length) % THAI_WORDS.length;
    out.push(THAI_WORDS[idx]);
  }
  return out.join(" ");
}
