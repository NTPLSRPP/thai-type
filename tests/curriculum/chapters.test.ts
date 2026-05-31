import { describe, it, expect } from "vitest";
import {
  CHAPTERS,
  ALL_SUBLESSONS,
  TOTAL_SUBLESSONS,
  getSubLesson,
  nextSubLessonId,
  REPS_TO_COMPLETE,
} from "@/lib/curriculum/chapters";

describe("chapters", () => {
  it("has 20 chapters and 84 sub-lessons", () => {
    expect(CHAPTERS.length).toBe(20);
    expect(TOTAL_SUBLESSONS).toBe(84);
  });
  it("assigns contiguous 1-based ids", () => {
    expect(ALL_SUBLESSONS.map((s) => s.id)).toEqual(Array.from({ length: 84 }, (_, i) => i + 1));
  });
  it("chapter 1 first sub-lesson is the ดดด drill", () => {
    const first = getSubLesson(1);
    expect(first?.chapterIndex).toBe(0);
    expect(first?.text.startsWith("ดดด")).toBe(true);
  });
  it("nextSubLessonId walks ids and returns null at the end", () => {
    expect(nextSubLessonId(1)).toBe(2);
    expect(nextSubLessonId(84)).toBeNull();
  });
  it("requires 3 reps to complete a sub-lesson", () => {
    expect(REPS_TO_COMPLETE).toBe(3);
  });
});
