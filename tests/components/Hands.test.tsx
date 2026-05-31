import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Hands, type Tips } from "@/components/Hands";

const tip = (x: number) => ({ x, y: 100, w: 40, h: 40 });
const TIPS: Tips = {
  "left-pinky": tip(40),
  "left-ring": tip(80),
  "left-middle": tip(120),
  "left-index": tip(160),
  "right-index": tip(300),
  "right-middle": tip(340),
  "right-ring": tip(380),
  "right-pinky": tip(420),
  thumb: tip(240),
};

describe("Hands", () => {
  it("renders nothing without measured tips", () => {
    const { container } = render(<Hands tips={{}} activeFinger={null} />);
    expect(container.querySelector('[data-testid="hands"]')).toBeNull();
  });
  it("renders all ten fingers (8 + 2 thumbs) from tips", () => {
    render(<Hands tips={TIPS} activeFinger={null} />);
    expect(screen.getByTestId("finger-left-pinky")).toBeInTheDocument();
    expect(screen.getByTestId("finger-right-pinky")).toBeInTheDocument();
    expect(screen.getAllByTestId("finger-thumb")).toHaveLength(2);
  });
  it("marks the active finger and only that finger", () => {
    render(<Hands tips={TIPS} activeFinger="left-index" />);
    expect(screen.getByTestId("finger-left-index").dataset.active).toBe("true");
    expect(screen.getByTestId("finger-left-pinky").dataset.active).toBe("false");
  });
  it("activates both thumbs for thumb (space)", () => {
    render(<Hands tips={TIPS} activeFinger="thumb" />);
    for (const t of screen.getAllByTestId("finger-thumb")) expect(t.dataset.active).toBe("true");
  });
});
