import type { Keystroke } from "./types";

// Map of expected-character -> number of times it was typed incorrectly.
export function errorCountsByChar(strokes: Keystroke[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const s of strokes) {
    if (!s.correct) counts.set(s.expected, (counts.get(s.expected) ?? 0) + 1);
  }
  return counts;
}
