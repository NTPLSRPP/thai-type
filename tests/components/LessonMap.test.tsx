import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { LessonMap } from "@/components/LessonMap";
import { useProgress } from "@/stores/progressStore";

beforeEach(() => {
  localStorage.clear();
  useProgress.getState().reload();
});

describe("LessonMap", () => {
  it("renders all units with the first unlocked and the second locked", () => {
    render(<LessonMap />);
    expect(screen.getByText("Home Row — Left")).toBeInTheDocument();
    expect(screen.getByTestId("unit-home-right").dataset.locked).toBe("true");
  });
  it("unlocks the second unit after the first is completed", () => {
    useProgress.getState().complete("home-left");
    render(<LessonMap />);
    expect(screen.getByTestId("unit-home-right").dataset.locked).toBe("false");
    expect(screen.getByTestId("unit-home-left").dataset.completed).toBe("true");
  });
});
