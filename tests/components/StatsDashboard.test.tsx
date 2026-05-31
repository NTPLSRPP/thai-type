import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
vi.mock("@/lib/storage/imageStore", () => ({
  getImage: vi.fn(async () => undefined),
  putImage: vi.fn(),
  deleteImage: vi.fn(),
}));
import { StatsDashboard } from "@/components/StatsDashboard";
import { useStats } from "@/stores/statsStore";
import { useKeyModel } from "@/stores/keyModelStore";

beforeEach(() => {
  localStorage.clear();
  useStats.getState().reload();
  useKeyModel.getState().reload();
});

describe("StatsDashboard", () => {
  it("shows an empty state when there is no history", () => {
    render(<StatsDashboard />);
    expect(screen.getByText(/no tests yet/i)).toBeInTheDocument();
  });
  it("shows aggregates after a session is recorded", () => {
    useStats.getState().record({
      at: 1,
      mode: "time",
      amount: 30,
      wpm: 70,
      rawWpm: 75,
      accuracy: 98,
      consistency: 85,
      correct: 10,
      incorrect: 1,
      layoutId: "kedmanee",
    });
    render(<StatsDashboard />);
    expect(screen.getByTestId("agg-bestWpm").textContent).toContain("70");
    expect(screen.getByTestId("agg-totalTests").textContent).toContain("1");
    expect(screen.getByTestId("key-KeyD")).toBeInTheDocument();
  });
});
