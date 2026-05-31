import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Words } from "@/components/Words";
import { buildCells } from "@/lib/engine/compare";

describe("Words", () => {
  it("renders one element per code point with state classes", () => {
    const cells = buildCells("กา"); // 2 code points
    render(<Words cells={cells} cursor={0} text="กา" />);
    const chars = screen.getAllByTestId("char");
    expect(chars).toHaveLength(2);
    expect(chars[0].className).toContain("untyped");
  });
  it("marks the cursor position", () => {
    const cells = buildCells("กา");
    render(<Words cells={cells} cursor={1} text="กา" />);
    expect(screen.getAllByTestId("char")[1].dataset.cursor).toBe("true");
  });
  it("groups combining marks into clusters", () => {
    const cells = buildCells("ก้า"); // 3 code points, 2 clusters
    render(<Words cells={cells} cursor={0} text="ก้า" />);
    expect(screen.getAllByTestId("char")).toHaveLength(3);
    expect(screen.getAllByTestId("cluster")).toHaveLength(2);
  });
});
