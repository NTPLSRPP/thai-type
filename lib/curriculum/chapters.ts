import { TYPINGTH_CHAPTERS } from "./typingth";

export const REPS_TO_COMPLETE = 3;

export interface SubLesson {
  id: number; // global 1-based id (matches typingth ?l=)
  chapterIndex: number;
  subIndex: number;
  text: string;
}

export interface Chapter {
  index: number;
  title: string;
  subLessons: SubLesson[];
}

const CHAPTERS_BUILT: Chapter[] = (() => {
  const chapters: Chapter[] = [];
  let id = 1;
  TYPINGTH_CHAPTERS.forEach((raw, ci) => {
    const subLessons: SubLesson[] = raw.subLessons.map((s, si) => ({
      id: id++,
      chapterIndex: ci,
      subIndex: si,
      text: s.text,
    }));
    chapters.push({ index: ci, title: raw.title, subLessons });
  });
  return chapters;
})();

export const CHAPTERS: Chapter[] = CHAPTERS_BUILT;
export const ALL_SUBLESSONS: SubLesson[] = CHAPTERS_BUILT.flatMap((c) => c.subLessons);
export const TOTAL_SUBLESSONS = ALL_SUBLESSONS.length;

export function getSubLesson(id: number): SubLesson | undefined {
  return ALL_SUBLESSONS.find((s) => s.id === id);
}

export function nextSubLessonId(id: number): number | null {
  const i = ALL_SUBLESSONS.findIndex((s) => s.id === id);
  if (i === -1 || i >= ALL_SUBLESSONS.length - 1) return null;
  return ALL_SUBLESSONS[i + 1].id;
}
