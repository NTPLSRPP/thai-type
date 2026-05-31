"use client";
import Link from "next/link";
import { orderedUnits } from "@/lib/curriculum/units";
import { isUnlocked } from "@/lib/storage/progress";
import { useProgress } from "@/stores/progressStore";

export function LessonMap() {
  const completed = useProgress((s) => s.completed);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {orderedUnits().map((u) => {
        const unlocked = isUnlocked(u.id, completed);
        const isComplete = completed.includes(u.id);
        const row = (
          <div
            data-testid={`unit-${u.id}`}
            data-locked={(!unlocked).toString()}
            data-completed={isComplete.toString()}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "12px 16px",
              borderRadius: 8,
              border: "1px solid #3a3c3f",
              color: unlocked ? "var(--text-typed)" : "var(--text)",
              opacity: unlocked ? 1 : 0.5,
            }}
          >
            <span>{u.name}</span>
            <span style={{ color: "var(--accent)" }}>{isComplete ? "✓" : unlocked ? "" : "🔒"}</span>
          </div>
        );
        return unlocked ? (
          <Link key={u.id} href={`/lessons/${u.id}`} style={{ textDecoration: "none" }}>
            {row}
          </Link>
        ) : (
          <div key={u.id}>{row}</div>
        );
      })}
    </div>
  );
}
