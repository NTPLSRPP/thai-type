"use client";
import { useSettings } from "@/stores/settingsStore";
import { AppBar } from "./AppBar";

const WIDTHS: Record<string, string> = {
  narrow: "var(--page-narrow)",
  normal: "var(--page-normal)",
  wide: "var(--page-wide)",
};

export function Page({ children }: { children: React.ReactNode }) {
  const pageWidth = useSettings((s) => s.pageWidth);
  return (
    <main
      style={{
        maxWidth: WIDTHS[pageWidth] ?? WIDTHS.normal,
        margin: "0 auto",
        padding: "min(8vh, var(--space-12)) var(--space-6)",
        transition: "max-width var(--dur) var(--ease)",
      }}
    >
      <AppBar />
      {children}
    </main>
  );
}
