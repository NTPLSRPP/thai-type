"use client";
import { useEffect } from "react";
import { Page } from "@/components/Page";
import { ChapterList } from "@/components/ChapterList";
import { useLessonProgress } from "@/stores/lessonProgressStore";

export default function LessonsPage() {
  useEffect(() => {
    useLessonProgress.getState().reload();
  }, []);
  return (
    <Page>
      <h1 style={{ color: "var(--accent)", fontSize: 22, marginBottom: "var(--space-6)" }}>lessons</h1>
      <ChapterList />
    </Page>
  );
}
