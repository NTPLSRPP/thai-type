import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
vi.mock("@/lib/storage/imageStore", () => ({
  getImage: vi.fn(async () => undefined),
  putImage: vi.fn(),
  deleteImage: vi.fn(),
}));
import SettingsPage from "@/app/settings/page";
import { useSettings } from "@/stores/settingsStore";

beforeEach(() => {
  localStorage.clear();
  useSettings.getState().reset();
});

describe("SettingsPage", () => {
  it("selects the block caret style", () => {
    render(<SettingsPage />);
    fireEvent.click(screen.getByTestId("seg-block"));
    expect(useSettings.getState().caretStyle).toBe("block");
  });

  it("enables confidence mode (noBackspace)", () => {
    render(<SettingsPage />);
    expect(useSettings.getState().noBackspace).toBe(false);
    // confidence mode is the toggle in the row titled "confidence mode"
    const row = screen.getByText("confidence mode").closest("div")!.parentElement!;
    const toggle = row.querySelector('[data-testid="toggle"]') as HTMLElement;
    fireEvent.click(toggle);
    expect(useSettings.getState().noBackspace).toBe(true);
  });

  it("restores defaults on reset", () => {
    render(<SettingsPage />);
    fireEvent.click(screen.getByTestId("seg-block"));
    expect(useSettings.getState().caretStyle).toBe("block");
    fireEvent.click(screen.getByTestId("reset-settings"));
    expect(useSettings.getState().caretStyle).toBe("line");
  });
});
