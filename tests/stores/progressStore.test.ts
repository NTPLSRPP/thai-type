import { describe, it, expect, beforeEach } from "vitest";
import { useProgress } from "@/stores/progressStore";

beforeEach(() => {
  localStorage.clear();
  useProgress.getState().reload();
});

describe("progressStore", () => {
  it("complete() persists and updates state", () => {
    useProgress.getState().complete("home-left");
    expect(useProgress.getState().completed).toContain("home-left");
    const raw = JSON.parse(localStorage.getItem("thaitype:progress")!);
    expect(raw.data.completed).toContain("home-left");
  });
});
