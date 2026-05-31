import type { Aggregates, SessionResult } from "./types";

const round = (n: number) => Math.round(n * 100) / 100;

export function computeAggregates(sessions: SessionResult[]): Aggregates {
  if (sessions.length === 0) return { totalTests: 0, bestWpm: 0, avgWpm: 0, avgAccuracy: 0 };
  const totalTests = sessions.length;
  const bestWpm = Math.max(...sessions.map((s) => s.wpm));
  const avgWpm = round(sessions.reduce((sum, s) => sum + s.wpm, 0) / totalTests);
  const avgAccuracy = round(sessions.reduce((sum, s) => sum + s.accuracy, 0) / totalTests);
  return { totalTests, bestWpm, avgWpm, avgAccuracy };
}
