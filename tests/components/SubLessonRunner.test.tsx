import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
vi.mock("@/lib/storage/imageStore", () => ({
  getImage: vi.fn(async () => undefined),
  putImage: vi.fn(),
  deleteImage: vi.fn(),
}));
import { SubLessonRunner } from "@/components/SubLessonRunner";
import { useLessonProgress } from "@/stores/lessonProgressStore";
import { useSettings } from "@/stores/settingsStore";

beforeEach(() => {
  localStorage.clear();
  useLessonProgress.getState().reload();
  useSettings.getState().setInputMode("app-remap");
});

function pressKeyD() {
  fireEvent.keyDown(window, { code: "KeyD", shiftKey: false }); // KeyD -> ก
}

describe("SubLessonRunner", () => {
  it("renders the lesson text and keyboard", () => {
    render(<SubLessonRunner id={1} textOverride="ก" />);
    expect(screen.getAllByTestId("char").length).toBeGreaterThan(0);
    expect(screen.getByTestId("key-KeyD")).toBeInTheDocument();
  });

  it("requires 3 reps to complete; each finish counts one rep", () => {
    render(<SubLessonRunner id={1} textOverride="ก" />);
    pressKeyD(); // rep 1
    expect(screen.queryByText(/lesson complete/i)).toBeNull();
    pressKeyD(); // rep 2
    expect(screen.queryByText(/lesson complete/i)).toBeNull();
    pressKeyD(); // rep 3 -> complete
    expect(screen.getByText(/lesson complete/i)).toBeInTheDocument();
    expect(useLessonProgress.getState().reps[1]).toBe(3);
  });

  it("shows unknown lesson for a bad id", () => {
    render(<SubLessonRunner id={9999} />);
    expect(screen.getByText(/unknown lesson/i)).toBeInTheDocument();
  });
});
