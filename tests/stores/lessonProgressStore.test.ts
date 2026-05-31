import { describe, it, expect, beforeEach } from "vitest";
import { useLessonProgress } from "@/stores/lessonProgressStore";

beforeEach(() => {
  localStorage.clear();
  useLessonProgress.getState().reload();
});

describe("lessonProgressStore", () => {
  it("starts empty", () => {
    expect(useLessonProgress.getState().reps).toEqual({});
  });
  it("record() returns the new rep count and persists", () => {
    expect(useLessonProgress.getState().record(3)).toBe(1);
    expect(useLessonProgress.getState().record(3)).toBe(2);
    expect(useLessonProgress.getState().reps[3]).toBe(2);
    expect(JSON.parse(localStorage.getItem("thaitype:lessonprogress")!).data["3"]).toBe(2);
  });
  it("clear() empties progress", () => {
    useLessonProgress.getState().record(1);
    useLessonProgress.getState().clear();
    expect(useLessonProgress.getState().reps).toEqual({});
  });
});
