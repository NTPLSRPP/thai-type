import { toGraphemes } from "./segmenter";
import type { CharCell } from "./types";

export function buildCells(target: string): CharCell[] {
  return toGraphemes(target).map((g) => ({ target: g, typed: null, state: "untyped" }));
}

export function applyInput(
  cells: CharCell[],
  cursor: number,
  typedCluster: string,
): { cells: CharCell[]; cursor: number } {
  if (cursor >= cells.length) return { cells, cursor };
  const correct = typedCluster === cells[cursor].target;
  const next = cells.map((c, i) =>
    i === cursor ? { ...c, typed: typedCluster, state: correct ? "correct" : "incorrect" } : c,
  );
  return { cells: next as CharCell[], cursor: cursor + 1 };
}
