import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
vi.mock("@/lib/storage/imageStore", () => ({
  putImage: vi.fn(async () => {}),
  getImage: vi.fn(),
  deleteImage: vi.fn(),
}));
import { ThemeEditor } from "@/components/ThemeEditor";

beforeEach(() => localStorage.clear());

describe("ThemeEditor", () => {
  it("calls onSave with an edited theme", () => {
    const onSave = vi.fn();
    render(<ThemeEditor onSave={onSave} onCancel={() => {}} />);
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: "My Theme" } });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave.mock.calls[0][0].name).toBe("My Theme");
  });
  it("renders a color input for the accent var", () => {
    render(<ThemeEditor onSave={() => {}} onCancel={() => {}} />);
    // exact label = the color swatch input (separate from "Accent value" text input)
    expect(screen.getByLabelText("Accent")).toBeInTheDocument();
  });
});
