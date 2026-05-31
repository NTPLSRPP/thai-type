import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LessonRunner } from "@/components/LessonRunner";
import { useProgress } from "@/stores/progressStore";

beforeEach(() => {
  localStorage.clear();
  useProgress.getState().reload();
});

describe("LessonRunner", () => {
  it("renders a drill and the keyboard for a unit", () => {
    render(<LessonRunner unitId="home-left" drillText="ก" />);
    expect(screen.getAllByTestId("char").length).toBeGreaterThan(0);
    expect(screen.getByTestId("key-KeyD")).toBeInTheDocument();
  });
  it("completes the unit when the drill is finished", () => {
    render(<LessonRunner unitId="home-left" drillText="ก" />);
    fireEvent.keyDown(window, { code: "KeyD", shiftKey: false }); // KeyD -> ก
    expect(screen.getByText(/complete/i)).toBeInTheDocument();
    expect(useProgress.getState().completed).toContain("home-left");
  });
  it("shows an unknown-unit message for a bad id", () => {
    render(<LessonRunner unitId="nope" />);
    expect(screen.getByText(/unknown lesson/i)).toBeInTheDocument();
  });
});
