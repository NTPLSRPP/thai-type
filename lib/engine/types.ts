export type CharState = "untyped" | "correct" | "incorrect";

export interface CharCell {
  target: string;     // one grapheme cluster
  typed: string | null;
  state: CharState;
}

export interface Keystroke {
  expected: string;
  actual: string;
  correct: boolean;
  t: number;          // ms since test start
}

export interface EngineSnapshot {
  cells: CharCell[];
  cursor: number;     // index into cells
  keystrokes: Keystroke[];
  startedAt: number | null;
  finished: boolean;
}
