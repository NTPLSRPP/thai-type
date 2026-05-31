"use client";
import { use, useEffect } from "react";
import { NavBar } from "@/components/NavBar";
import { SubLessonRunner } from "@/components/SubLessonRunner";
import { useLessonProgress } from "@/stores/lessonProgressStore";

export default function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  useEffect(() => {
    useLessonProgress.getState().reload();
  }, []);
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "8vh 24px" }}>
      <NavBar />
      <SubLessonRunner id={Number(id)} />
    </main>
  );
}
