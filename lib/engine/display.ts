import type { CharCell } from "./types";

const seg = new Intl.Segmenter("th", { granularity: "grapheme" });

export interface ClusterGroup {
  cells: CharCell[];
  indices: number[];
}

export function groupClusters(cells: CharCell[], originalText: string): ClusterGroup[] {
  const groups: ClusterGroup[] = [];
  let i = 0;
  for (const { segment } of seg.segment(originalText)) {
    const len = Array.from(segment).length; // code points in this grapheme
    const slice = cells.slice(i, i + len);
    const indices = slice.map((_, k) => i + k);
    groups.push({ cells: slice, indices });
    i += len;
  }
  return groups;
}
