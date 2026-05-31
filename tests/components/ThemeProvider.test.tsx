import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
vi.mock("@/lib/storage/imageStore", () => ({
  getImage: vi.fn(async () => undefined),
  putImage: vi.fn(),
  deleteImage: vi.fn(),
}));
import { ThemeProvider } from "@/components/ThemeProvider";
import { useTheme } from "@/stores/themeStore";

beforeEach(() => {
  localStorage.clear();
  useTheme.getState().reload();
  document.documentElement.style.cssText = "";
});

describe("ThemeProvider", () => {
  it("applies the active theme vars to :root", () => {
    useTheme.getState().setActive("terminal");
    render(
      <ThemeProvider>
        <div />
      </ThemeProvider>,
    );
    expect(document.documentElement.style.getPropertyValue("--accent")).toBe("#39ff8a");
  });
  it("renders its children", () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <div data-testid="kid" />
      </ThemeProvider>,
    );
    expect(getByTestId("kid")).toBeInTheDocument();
  });
});
