import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Keyboard } from "@/components/Keyboard";
import { kedmanee } from "@/lib/layouts/kedmanee";

describe("Keyboard", () => {
  it("renders a key per geometry code with the layout char", () => {
    render(<Keyboard layout={kedmanee} nextChar={null} errorCounts={new Map()} />);
    const keyD = screen.getByTestId("key-KeyD");
    expect(keyD.textContent).toContain("ก");
  });
  it("marks the next key when nextChar resolves", () => {
    render(<Keyboard layout={kedmanee} nextChar="ก" errorCounts={new Map()} />);
    expect(screen.getByTestId("key-KeyD").dataset.next).toBe("true");
  });
  it("does not mark any next key when nextChar is null", () => {
    render(<Keyboard layout={kedmanee} nextChar={null} errorCounts={new Map()} />);
    expect(screen.getByTestId("key-KeyD").dataset.next).toBe("false");
  });
});
