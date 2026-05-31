import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
vi.mock("@/lib/storage/imageStore", () => ({
  putImage: vi.fn(async () => {}),
  getImage: vi.fn(),
  deleteImage: vi.fn(),
}));
import { ThemeStudio } from "@/components/ThemeStudio";
import { useTheme } from "@/stores/themeStore";

beforeEach(() => {
  localStorage.clear();
  useTheme.getState().reload();
});

describe("ThemeStudio", () => {
  it("lists preset themes and activates one on click", () => {
    render(<ThemeStudio />);
    fireEvent.click(screen.getByTestId("theme-card-ocean"));
    expect(useTheme.getState().activeId).toBe("ocean");
  });
  it("creates a custom theme through the editor", () => {
    render(<ThemeStudio />);
    fireEvent.click(screen.getByRole("button", { name: /new theme/i }));
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: "Mine" } });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));
    expect(useTheme.getState().customs.some((t) => t.name === "Mine")).toBe(true);
  });
});
