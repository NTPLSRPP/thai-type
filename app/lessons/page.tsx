import { LessonMap } from "@/components/LessonMap";
import { NavBar } from "@/components/NavBar";

export default function LessonsPage() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "8vh 24px" }}>
      <NavBar />
      <h1 style={{ color: "var(--accent)", fontSize: 22, marginBottom: 24 }}>lessons</h1>
      <LessonMap />
    </main>
  );
}
