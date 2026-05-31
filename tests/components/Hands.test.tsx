import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Hands } from "@/components/Hands";

describe("Hands", () => {
  it("renders all ten fingers (8 + 2 thumbs)", () => {
    render(<Hands activeFinger={null} />);
    expect(screen.getByTestId("finger-left-pinky")).toBeInTheDocument();
    expect(screen.getByTestId("finger-right-pinky")).toBeInTheDocument();
    expect(screen.getAllByTestId("finger-thumb")).toHaveLength(2);
  });
  it("marks the active finger and only that finger", () => {
    render(<Hands activeFinger="left-index" />);
    expect(screen.getByTestId("finger-left-index").dataset.active).toBe("true");
    expect(screen.getByTestId("finger-left-pinky").dataset.active).toBe("false");
  });
  it("activates both thumbs for thumb (space)", () => {
    render(<Hands activeFinger="thumb" />);
    for (const t of screen.getAllByTestId("finger-thumb")) expect(t.dataset.active).toBe("true");
  });
});
