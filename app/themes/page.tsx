import { ThemeStudio } from "@/components/ThemeStudio";
import { Page } from "@/components/Page";

export default function ThemesPage() {
  return (
    <Page>
      <h1 style={{ color: "var(--accent)", fontSize: 22, marginBottom: "var(--space-6)" }}>themes</h1>
      <ThemeStudio />
    </Page>
  );
}
