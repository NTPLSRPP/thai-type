import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LayoutBar } from "@/components/LayoutBar";
import { useSettings } from "@/stores/settingsStore";

beforeEach(() => localStorage.clear());

describe("LayoutBar", () => {
  it("renders all three layouts and switches on click", () => {
    render(<LayoutBar />);
    fireEvent.click(screen.getByText("Pattachote"));
    expect(useSettings.getState().layoutId).toBe("pattachote");
  });
  it("toggles input mode", () => {
    render(<LayoutBar />);
    fireEvent.click(screen.getByRole("button", { name: /app remap/i }));
    expect(useSettings.getState().inputMode).toBe("os-native");
  });
});
