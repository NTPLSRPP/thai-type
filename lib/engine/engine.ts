import { buildCells, applyInput } from "./compare";
import type { EngineSnapshot } from "./types";

export interface TypingEngine {
  press(cluster: string, advanceOnError?: boolean): void;
  back(): void;
  finish(): void;
  snapshot(): EngineSnapshot;
}

export function createEngine(target: string, clock: () => number = () => performance.now()): TypingEngine {
  let cells = buildCells(target);
  let cursor = 0;
  let startedAt: number | null = null;
  let finished = false;
  const keystrokes: EngineSnapshot["keystrokes"] = [];

  // advanceOnError=true (default): always advance (normal mode).
  // advanceOnError=false (stop-on-error "letter"): a wrong key is recorded as an error
  // but the cursor stays put until the correct character is typed.
  function press(cluster: string, advanceOnError = true) {
    if (finished || cursor >= cells.length) return;
    const t = clock();
    if (startedAt === null) startedAt = t;
    const expected = cells[cursor].target;
    const correct = expected === cluster;
    keystrokes.push({ expected, actual: cluster, correct, t: t - startedAt });
    if (correct || advanceOnError) {
      const res = applyInput(cells, cursor, cluster);
      cells = res.cells;
      cursor = res.cursor;
      if (cursor >= cells.length) finished = true;
    }
  }

  // Step back one position to fix a mistype. Resets the cell to untyped and clears
  // the finished flag so the user can retype. Keystroke history is kept intact so
  // accuracy still reflects the original error (Monkeytype-style).
  function back() {
    if (cursor === 0) return;
    cursor -= 1;
    cells = cells.map((c, i) => (i === cursor ? { ...c, typed: null, state: "untyped" } : c));
    finished = false;
  }

  function finish() { finished = true; }

  function snapshot(): EngineSnapshot {
    return { cells, cursor, keystrokes: [...keystrokes], startedAt, finished };
  }

  return { press, back, finish, snapshot };
}
