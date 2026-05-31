import { round2 } from "@/lib/engine/metrics";
import type { Aggregates, SessionResult } from "./types";

export function computeAggregates(sessions: SessionResult[]): Aggregates {
  if (sessions.length === 0) return { totalTests: 0, bestWpm: 0, avgWpm: 0, avgAccuracy: 0 };
  const totalTests = sessions.length;
  const bestWpm = Math.max(...sessions.map((s) => s.wpm));
  const avgWpm = round2(sessions.reduce((sum, s) => sum + s.wpm, 0) / totalTests);
  const avgAccuracy = round2(sessions.reduce((sum, s) => sum + s.accuracy, 0) / totalTests);
  return { totalTests, bestWpm, avgWpm, avgAccuracy };
}
