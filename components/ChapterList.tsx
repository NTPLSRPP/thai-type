"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { CHAPTERS, REPS_TO_COMPLETE, type SubLesson } from "@/lib/curriculum/chapters";
import { useLessonProgress } from "@/stores/lessonProgressStore";

export function ChapterList() {
  const storeReps = useLessonProgress((s) => s.reps);
  const [open, setOpen] = useState<Record<number, boolean>>({ 0: true });
  // First client render must match SSR (empty progress); reveal stored reps after mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const reps = mounted ? storeReps : {};

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {CHAPTERS.map((ch) => {
        const doneCount = ch.subLessons.filter((s) => (reps[s.id] ?? 0) >= REPS_TO_COMPLETE).length;
        const isOpen = !!open[ch.index];
        return (
          <section
            key={ch.index}
            style={{ border: "1px solid color-mix(in oklab, var(--text) 30%, transparent)", borderRadius: 10, overflow: "hidden" }}
          >
            <button
              onClick={() => setOpen((o) => ({ ...o, [ch.index]: !o[ch.index] }))}
              aria-expanded={isOpen}
              className="chapter-toggle"
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                padding: "14px 16px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "var(--text-typed)",
                font: "inherit",
                textAlign: "left",
              }}
            >
              <span style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: "var(--accent)",
                    color: "var(--bg)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    flexShrink: 0,
                  }}
                >
                  {ch.index + 1}
                </span>
                <span style={{ fontSize: 15 }}>{ch.title}</span>
              </span>
              <span style={{ fontSize: 12, color: "var(--text-typed)", whiteSpace: "nowrap" }}>
                {doneCount}/{ch.subLessons.length} · {isOpen ? "▾" : "▸"}
              </span>
            </button>

            {isOpen && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))",
                  gap: 8,
                  padding: "0 16px 16px",
                }}
              >
                {ch.subLessons.map((s) => (
                  <SubLessonCell key={s.id} sub={s} reps={reps[s.id] ?? 0} />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

function SubLessonCell({ sub, reps }: { sub: SubLesson; reps: number }) {
  const complete = reps >= REPS_TO_COMPLETE;
  return (
    <Link
      href={`/lessons/${sub.id}`}
      data-testid={`sub-${sub.id}`}
      data-complete={complete ? "true" : "false"}
      className="sublesson-cell"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 8,
        padding: "8px 10px",
        borderRadius: 6,
        border: "1px solid color-mix(in oklab, var(--text) 25%, transparent)",
        textDecoration: "none",
        color: "var(--text-typed)",
        fontSize: 13,
      }}
    >
      <span style={{ color: "var(--text-typed)" }}>{sub.subIndex + 1}</span>
      <span style={{ color: complete ? "var(--accent)" : "var(--text-typed)" }}>
        {complete ? "✓" : `${reps}/${REPS_TO_COMPLETE}`}
      </span>
    </Link>
  );
}
