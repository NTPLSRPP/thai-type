import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toggle } from "@/components/ui/Toggle";
import { Segmented } from "@/components/ui/Segmented";
import { Slider } from "@/components/ui/Slider";
import { SettingRow } from "@/components/ui/SettingRow";

describe("Toggle", () => {
  it("calls onChange with the inverse of checked on click", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Toggle checked={false} onChange={onChange} />);

    await user.click(screen.getByRole("switch"));

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("inverts a checked toggle to false", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Toggle checked onChange={onChange} />);

    await user.click(screen.getByRole("switch"));

    expect(onChange).toHaveBeenCalledWith(false);
  });

  it("exposes aria-checked reflecting its state", () => {
    render(<Toggle checked onChange={vi.fn()} />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  });
});

describe("Segmented", () => {
  const options = [
    { value: "a", label: "Alpha" },
    { value: "b", label: "Bravo" },
  ];

  it("calls onChange with the clicked option value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Segmented value="a" options={options} onChange={onChange} ariaLabel="choices" />,
    );

    await user.click(screen.getByTestId("seg-b"));

    expect(onChange).toHaveBeenCalledWith("b");
  });
});

describe("Slider", () => {
  it("calls onChange with the numeric value on change", () => {
    const onChange = vi.fn();
    render(<Slider value={20} min={0} max={100} onChange={onChange} />);

    fireEvent.change(screen.getByTestId("slider"), { target: { value: "55" } });

    expect(onChange).toHaveBeenCalledWith(55);
  });
});

describe("SettingRow", () => {
  it("renders its title and children", () => {
    render(
      <SettingRow title="Sound on type" htmlFor="snd">
        <span data-testid="row-control">control</span>
      </SettingRow>,
    );

    expect(screen.getByText("Sound on type")).toBeInTheDocument();
    expect(screen.getByTestId("row-control")).toHaveTextContent("control");
  });
});
