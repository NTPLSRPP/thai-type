import { notFound } from "next/navigation";
import { Page } from "@/components/Page";
import { SubLessonRunner } from "@/components/SubLessonRunner";
import { ALL_SUBLESSONS, TOTAL_SUBLESSONS } from "@/lib/curriculum/chapters";

// Pre-render every sub-lesson so the route works under static export (GitHub Pages).
export function generateStaticParams() {
  return ALL_SUBLESSONS.map((s) => ({ id: String(s.id) }));
}

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Reject non-positive-integer / out-of-range ids (rejects 007, 7e0, whitespace, abc).
  if (!/^[1-9]\d*$/.test(id) || Number(id) > TOTAL_SUBLESSONS) notFound();
  return (
    <Page>
      <SubLessonRunner id={Number(id)} />
    </Page>
  );
}
