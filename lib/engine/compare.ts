import type { CharCell } from "./types";

export function buildCells(target: string): CharCell[] {
  // One cell per Unicode code point. Array.from splits by code point.
  return Array.from(target).map((ch) => ({ target: ch, typed: null, state: "untyped" }));
}

export function applyInput(
  cells: CharCell[],
  cursor: number,
  typedChar: string,
): { cells: CharCell[]; cursor: number } {
  if (cursor >= cells.length) return { cells, cursor };
  const correct = typedChar === cells[cursor].target;
  const next = cells.map((c, i) =>
    i === cursor ? { ...c, typed: typedChar, state: correct ? "correct" : "incorrect" } : c,
  );
  return { cells: next as CharCell[], cursor: cursor + 1 };
}
