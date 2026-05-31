import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { WpmGraph } from "@/components/WpmGraph";

describe("WpmGraph", () => {
  it("renders an svg polyline for points", () => {
    render(
      <WpmGraph
        points={[
          { t: 1, wpm: 20 },
          { t: 2, wpm: 40 },
          { t: 3, wpm: 30 },
        ]}
      />,
    );
    expect(screen.getByTestId("wpm-graph")).toBeInTheDocument();
    expect(screen.getByTestId("wpm-line").getAttribute("points")?.length).toBeGreaterThan(0);
  });
  it("renders an empty-state message for no points", () => {
    render(<WpmGraph points={[]} />);
    expect(screen.getByText(/no data/i)).toBeInTheDocument();
  });
});
