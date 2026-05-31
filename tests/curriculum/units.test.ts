import { describe, it, expect } from "vitest";
import { UNITS, getUnit, orderedUnits, nextUnitId } from "@/lib/curriculum/units";

describe("curriculum units", () => {
  it("exposes an ordered, non-empty unit list", () => {
    expect(UNITS.length).toBeGreaterThanOrEqual(6);
    const orders = orderedUnits().map((u) => u.order);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
  });
  it("first unit is the left home row and is order 0", () => {
    const first = orderedUnits()[0];
    expect(first.order).toBe(0);
    expect(first.keys).toContain("KeyA");
  });
  it("getUnit returns a unit by id", () => {
    const first = orderedUnits()[0];
    expect(getUnit(first.id)?.id).toBe(first.id);
  });
  it("nextUnitId walks the order and returns null at the end", () => {
    const ordered = orderedUnits();
    expect(nextUnitId(ordered[0].id)).toBe(ordered[1].id);
    expect(nextUnitId(ordered[ordered.length - 1].id)).toBeNull();
  });
  it("every non-pool unit lists at least 3 key codes", () => {
    for (const u of UNITS) {
      if (!u.pool) expect(u.keys.length).toBeGreaterThanOrEqual(3);
    }
  });
});
