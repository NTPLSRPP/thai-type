import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TestScreen } from "@/components/TestScreen";
import { useSettings } from "@/stores/settingsStore";

beforeEach(() => {
  localStorage.clear();
  useSettings.getState().setInputMode("app-remap"); // reset shared store between tests
});

function typeCode(code: string) {
  fireEvent.keyDown(window, { code, shiftKey: false });
}
function typeKey(key: string) {
  fireEvent.keyDown(window, { key });
}

describe("TestScreen", () => {
  it("renders target characters and advances on correct app-remap key", () => {
    render(<TestScreen />);
    expect(screen.getAllByTestId("char").length).toBeGreaterThan(0);
    typeCode("KeyD");
    expect(screen.getAllByTestId("char").some((e) => e.dataset.cursor === "true")).toBe(true);
  });

  it("finishes a words test and shows results (app-remap)", () => {
    render(<TestScreen testText="ก" />);
    typeCode("KeyD"); // KeyD -> ก in kedmanee
    expect(screen.getByText("next test")).toBeInTheDocument();
  });

  it("renders the on-screen keyboard", () => {
    render(<TestScreen testText="ก" />);
    expect(screen.getByTestId("key-KeyD")).toBeInTheDocument();
  });

  it("accepts os-native input when inputMode is os-native", () => {
    useSettings.getState().setInputMode("os-native");
    render(<TestScreen testText="ก" />);
    typeKey("ก"); // OS already produced the Thai char
    expect(screen.getByText("next test")).toBeInTheDocument();
  });

  it("backspace steps the cursor back to fix a mistype", () => {
    render(<TestScreen testText="กา" />);
    typeCode("KeyF"); // KeyF -> ด, wrong at index 0, cursor -> 1
    expect(screen.getAllByTestId("char")[1].dataset.cursor).toBe("true");
    fireEvent.keyDown(window, { code: "Backspace", key: "Backspace" });
    const chars = screen.getAllByTestId("char");
    expect(chars[0].dataset.cursor).toBe("true"); // back at index 0
    expect(chars[0].className).toContain("untyped"); // reset
  });
});
