import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Results } from "@/components/Results";

describe("Results", () => {
  it("shows wpm, accuracy, consistency", () => {
    render(
      <Results
        metrics={{ wpm: 60, rawWpm: 65, accuracy: 97, consistency: 80, correct: 100, incorrect: 3 }}
        onRestart={() => {}}
      />,
    );
    expect(screen.getByText("60")).toBeInTheDocument();
    expect(screen.getByText("97%")).toBeInTheDocument();
    expect(screen.getByText("80%")).toBeInTheDocument();
  });
});
