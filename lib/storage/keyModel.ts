import type { Keystroke } from "@/lib/engine/types";

export const KEY_MODEL_KEY = "thaitype:keymodel";
const VERSION = 1;

export interface CharStat {
  correct: number;
  incorrect: number;
}
export type KeyModel = Record<string, CharStat>;

export function loadKeyModel(): KeyModel {
  if (typeof localStorage === "undefined") return {};
  const raw = localStorage.getItem(KEY_MODEL_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as { v: number; data: KeyModel };
    if (parsed.v !== VERSION || typeof parsed.data !== "object" || parsed.data === null) return {};
    return parsed.data;
  } catch {
    return {};
  }
}

export function saveKeyModel(model: KeyModel): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(KEY_MODEL_KEY, JSON.stringify({ v: VERSION, data: model }));
}

export function recordKeystrokes(strokes: Keystroke[]): KeyModel {
  const model = loadKeyModel();
  for (const s of strokes) {
    const key = s.expected;
    if (!key || key === " ") continue;
    const stat = model[key] ?? { correct: 0, incorrect: 0 };
    if (s.correct) stat.correct += 1;
    else stat.incorrect += 1;
    model[key] = stat;
  }
  saveKeyModel(model);
  return model;
}
