import { describe, it, expect } from "vitest";
import { buildCells } from "@/lib/engine/compare";
import { groupClusters } from "@/lib/engine/display";

describe("groupClusters", () => {
  it("groups base + combining marks into one cluster, preserving cell indices", () => {
    const cells = buildCells("ก้า"); // ก, ้, า
    const groups = groupClusters(cells, "ก้า");
    expect(groups).toHaveLength(2);
    expect(groups[0].cells.map((c) => c.target)).toEqual(["ก", "้"]);
    expect(groups[0].indices).toEqual([0, 1]);
    expect(groups[1].cells.map((c) => c.target)).toEqual(["า"]);
    expect(groups[1].indices).toEqual([2]);
  });
  it("treats ascii as one cell per group", () => {
    const cells = buildCells("ab");
    const groups = groupClusters(cells, "ab");
    expect(groups).toHaveLength(2);
  });
});
