"use client";
import { use, useEffect } from "react";
import { notFound } from "next/navigation";
import { Page } from "@/components/Page";
import { SubLessonRunner } from "@/components/SubLessonRunner";
import { useLessonProgress } from "@/stores/lessonProgressStore";
import { TOTAL_SUBLESSONS } from "@/lib/curriculum/chapters";

export default function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  useEffect(() => {
    useLessonProgress.getState().reload();
  }, []);
  // Reject non-positive-integer / out-of-range ids (rejects 007, 7e0, whitespace, abc).
  if (!/^[1-9]\d*$/.test(id) || Number(id) > TOTAL_SUBLESSONS) notFound();
  return (
    <Page>
      <SubLessonRunner id={Number(id)} />
    </Page>
  );
}
