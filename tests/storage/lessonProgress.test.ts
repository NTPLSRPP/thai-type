import { describe, it, expect, beforeEach } from "vitest";
import {
  loadLessonProgress,
  recordRep,
  isSubLessonComplete,
  clearLessonProgress,
  LESSON_PROGRESS_KEY,
} from "@/lib/storage/lessonProgress";

beforeEach(() => localStorage.clear());

describe("lesson progress storage", () => {
  it("starts empty", () => {
    expect(loadLessonProgress()).toEqual({});
  });
  it("increments reps and caps at 3", () => {
    recordRep(5);
    expect(loadLessonProgress()[5]).toBe(1);
    recordRep(5);
    recordRep(5);
    recordRep(5); // 4th — capped
    expect(loadLessonProgress()[5]).toBe(3);
  });
  it("isSubLessonComplete true only at 3 reps", () => {
    expect(isSubLessonComplete(5, { 5: 2 })).toBe(false);
    expect(isSubLessonComplete(5, { 5: 3 })).toBe(true);
    expect(isSubLessonComplete(9, {})).toBe(false);
  });
  it("clears progress", () => {
    recordRep(1);
    clearLessonProgress();
    expect(loadLessonProgress()).toEqual({});
  });
  it("falls back to empty on corrupt data", () => {
    localStorage.setItem(LESSON_PROGRESS_KEY, "{bad");
    expect(loadLessonProgress()).toEqual({});
  });
});
