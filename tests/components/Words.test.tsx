import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Words } from "@/components/Words";
import { buildCells } from "@/lib/engine/compare";

describe("Words", () => {
  it("renders one element per grapheme with state classes", () => {
    const cells = buildCells("กา");
    render(<Words cells={cells} cursor={0} />);
    const chars = screen.getAllByTestId("char");
    expect(chars).toHaveLength(2);
    expect(chars[0].className).toContain("untyped");
  });
  it("marks the cursor position", () => {
    const cells = buildCells("กา");
    render(<Words cells={cells} cursor={1} />);
    expect(screen.getAllByTestId("char")[1].dataset.cursor).toBe("true");
  });
});
