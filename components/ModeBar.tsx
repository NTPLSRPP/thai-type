"use client";
import { useSettings } from "@/stores/settingsStore";

export function ModeBar() {
  const { mode, duration, wordCount, setMode, setDuration, setWordCount } = useSettings();
  const Btn = ({
    active,
    onClick,
    children,
  }: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      style={{
        background: "transparent",
        border: "none",
        cursor: "pointer",
        color: active ? "var(--accent)" : "var(--text)",
      }}
    >
      {children}
    </button>
  );
  return (
    <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
      <Btn active={mode === "time"} onClick={() => setMode("time")}>time</Btn>
      <Btn active={mode === "words"} onClick={() => setMode("words")}>words</Btn>
      <span style={{ opacity: 0.3 }}>|</span>
      {mode === "time"
        ? [15, 30, 60, 120].map((s) => (
            <Btn key={s} active={duration === s} onClick={() => setDuration(s)}>{s}</Btn>
          ))
        : [10, 25, 50, 100].map((n) => (
            <Btn key={n} active={wordCount === n} onClick={() => setWordCount(n)}>{n}</Btn>
          ))}
    </div>
  );
}
