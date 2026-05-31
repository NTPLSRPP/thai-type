import type { KeyModel } from "@/lib/storage/keyModel";

const BASE = 1;
const ERROR_SCALE = 6; // weight added at 100% error rate
const UNSEEN_WEIGHT = 3; // bias toward never-practiced chars

export function weakCharWeights(model: KeyModel, chars: string[]): Map<string, number> {
  const weights = new Map<string, number>();
  for (const ch of chars) {
    const stat = model[ch];
    if (!stat || stat.correct + stat.incorrect === 0) {
      weights.set(ch, UNSEEN_WEIGHT);
      continue;
    }
    const total = stat.correct + stat.incorrect;
    const errorRate = stat.incorrect / total;
    weights.set(ch, BASE + errorRate * ERROR_SCALE);
  }
  return weights;
}
