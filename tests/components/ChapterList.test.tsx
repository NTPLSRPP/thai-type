import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChapterList } from "@/components/ChapterList";
import { useLessonProgress } from "@/stores/lessonProgressStore";

beforeEach(() => {
  localStorage.clear();
  useLessonProgress.getState().reload();
});

describe("ChapterList", () => {
  it("renders chapter 1 and its first sub-lesson links to /lessons/1 (skip anywhere)", () => {
    render(<ChapterList />);
    expect(screen.getByText(/แป้นเหย้า/)).toBeInTheDocument();
    expect(screen.getByTestId("sub-1").getAttribute("href")).toBe("/lessons/1");
  });
  it("marks a sub-lesson complete after 3 reps", () => {
    useLessonProgress.getState().record(1);
    useLessonProgress.getState().record(1);
    useLessonProgress.getState().record(1);
    render(<ChapterList />);
    expect(screen.getByTestId("sub-1").dataset.complete).toBe("true");
  });
  it("collapses/expands a chapter", () => {
    render(<ChapterList />);
    // chapter 1 open by default -> sub-1 visible
    expect(screen.getByTestId("sub-1")).toBeInTheDocument();
    fireEvent.click(screen.getByText(/แป้นเหย้า/));
    expect(screen.queryByTestId("sub-1")).toBeNull();
  });
});
