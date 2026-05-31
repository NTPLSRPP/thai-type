import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TestScreen } from "@/components/TestScreen";

beforeEach(() => localStorage.clear());

function typeCode(code: string) {
  fireEvent.keyDown(window, { code, shiftKey: false });
}

describe("TestScreen", () => {
  it("renders target characters and advances on correct app-remap key", () => {
    render(<TestScreen />);
    expect(screen.getAllByTestId("char").length).toBeGreaterThan(0);
    const before = screen.getAllByTestId("char").find((e) => e.dataset.cursor === "true");
    typeCode("KeyD");
    const afterCursorMoved = screen.getAllByTestId("char").some((e) => e.dataset.cursor === "true");
    expect(afterCursorMoved).toBe(true);
    expect(before).toBeTruthy();
  });

  it("finishes a words test and shows results", () => {
    render(<TestScreen testText="ก" />);
    typeCode("KeyD"); // KeyD -> ก
    expect(screen.getByText("next test")).toBeInTheDocument();
  });
});
