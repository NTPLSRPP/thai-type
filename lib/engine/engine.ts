import { buildCells, applyInput } from "./compare";
import type { EngineSnapshot } from "./types";

export interface TypingEngine {
  press(cluster: string): void;
  finish(): void;
  snapshot(): EngineSnapshot;
}

export function createEngine(target: string, clock: () => number = () => performance.now()): TypingEngine {
  let cells = buildCells(target);
  let cursor = 0;
  let startedAt: number | null = null;
  let finished = false;
  const keystrokes: EngineSnapshot["keystrokes"] = [];

  function press(cluster: string) {
    if (finished || cursor >= cells.length) return;
    const t = clock();
    if (startedAt === null) startedAt = t;
    const expected = cells[cursor].target;
    const res = applyInput(cells, cursor, cluster);
    cells = res.cells;
    cursor = res.cursor;
    keystrokes.push({ expected, actual: cluster, correct: expected === cluster, t: t - startedAt });
    if (cursor >= cells.length) finished = true;
  }

  function finish() { finished = true; }

  function snapshot(): EngineSnapshot {
    return { cells, cursor, keystrokes: [...keystrokes], startedAt, finished };
  }

  return { press, finish, snapshot };
}
