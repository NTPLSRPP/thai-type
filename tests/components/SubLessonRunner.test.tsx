import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
vi.mock("@/lib/storage/imageStore", () => ({
  getImage: vi.fn(async () => undefined),
  putImage: vi.fn(),
  deleteImage: vi.fn(),
}));
const pushMock = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: pushMock }) }));
import { SubLessonRunner } from "@/components/SubLessonRunner";
import { useLessonProgress } from "@/stores/lessonProgressStore";
import { useSettings } from "@/stores/settingsStore";

beforeEach(() => {
  localStorage.clear();
  pushMock.mockClear();
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

  it("on the complete screen, R redoes the lesson", () => {
    render(<SubLessonRunner id={1} textOverride="ก" />);
    pressKeyD();
    pressKeyD();
    pressKeyD(); // complete
    expect(screen.getByText(/lesson complete/i)).toBeInTheDocument();
    fireEvent.keyDown(window, { code: "KeyR" });
    expect(screen.queryByText(/lesson complete/i)).toBeNull(); // back to typing
    expect(screen.getByTestId("rep-indicator").textContent).toContain("1 / 3");
  });

  it("on the complete screen, Space navigates to the next lesson", () => {
    render(<SubLessonRunner id={1} textOverride="ก" />);
    pressKeyD();
    pressKeyD();
    pressKeyD(); // complete
    fireEvent.keyDown(window, { code: "Space" });
    expect(pushMock).toHaveBeenCalledWith("/lessons/2");
  });
});
