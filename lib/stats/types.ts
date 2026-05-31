export interface SessionResult {
  at: number; // epoch ms, supplied by the caller (never read from a clock in pure code)
  mode: "time" | "words";
  amount: number; // seconds (time mode) or word count (words mode)
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  correct: number;
  incorrect: number;
  layoutId: string;
}

export interface Aggregates {
  totalTests: number;
  bestWpm: number;
  avgWpm: number;
  avgAccuracy: number;
}

export interface WpmPoint {
  t: number; // seconds since test start
  wpm: number;
}
