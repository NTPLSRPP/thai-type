import { LessonRunner } from "@/components/LessonRunner";
import { NavBar } from "@/components/NavBar";

export default async function LessonPage({ params }: { params: Promise<{ unit: string }> }) {
  const { unit } = await params;
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "8vh 24px" }}>
      <NavBar />
      <LessonRunner unitId={unit} />
    </main>
  );
}
