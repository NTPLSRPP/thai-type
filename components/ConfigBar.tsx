"use client";
import Link from "next/link";
import { useSettings } from "@/stores/settingsStore";
import { layoutList } from "@/lib/layouts/registry";
import { Segmented } from "./ui/Segmented";
import type { TestMode } from "@/lib/storage/schema";

const TIMES = [15, 30, 60, 120];
const COUNTS = [10, 25, 50, 100];

export function ConfigBar() {
  const { mode, duration, wordCount, layoutId, setMode, setDuration, setWordCount, setLayout } = useSettings();

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "var(--space-3)",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-2) var(--space-3)",
        background: "var(--surface)",
        borderRadius: "var(--radius)",
        marginBottom: "var(--space-8)",
        fontSize: 13,
      }}
    >
      <Segmented<TestMode>
        ariaLabel="test mode"
        value={mode}
        onChange={(m) => setMode(m)}
        options={[
          { value: "time", label: "time" },
          { value: "words", label: "words" },
        ]}
      />
      <span style={{ width: 1, alignSelf: "stretch", background: "var(--hairline)" }} />
      {mode === "time" ? (
        <Segmented<string>
          ariaLabel="seconds"
          value={String(duration)}
          onChange={(v) => setDuration(Number(v))}
          options={TIMES.map((t) => ({ value: String(t), label: String(t) }))}
        />
      ) : (
        <Segmented<string>
          ariaLabel="word count"
          value={String(wordCount)}
          onChange={(v) => setWordCount(Number(v))}
          options={COUNTS.map((n) => ({ value: String(n), label: String(n) }))}
        />
      )}
      <span style={{ width: 1, alignSelf: "stretch", background: "var(--hairline)" }} />
      <Segmented<string>
        ariaLabel="keyboard layout"
        value={layoutId}
        onChange={(v) => setLayout(v as typeof layoutId)}
        options={layoutList().map((l) => ({ value: l.id, label: l.name }))}
      />
      <Link href="/settings" className="nav-link" aria-label="more settings" style={{ marginLeft: "auto" }}>
        more
      </Link>
    </div>
  );
}
