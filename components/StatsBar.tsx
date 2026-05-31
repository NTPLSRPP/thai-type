interface StatsBarProps {
  wpm: number;
  accuracy: number;
  timeLeft: number | null;
  showWpm?: boolean;
  showAcc?: boolean;
  timerStyle?: "text" | "bar";
  duration?: number; // for bar fill (seconds)
}

export function StatsBar({
  wpm,
  accuracy,
  timeLeft,
  showWpm = true,
  showAcc = true,
  timerStyle = "text",
  duration,
}: StatsBarProps) {
  const showBar = timerStyle === "bar" && timeLeft !== null && !!duration;
  return (
    <div style={{ display: "flex", gap: "var(--space-6)", alignItems: "center", color: "var(--accent)", fontSize: 20, minHeight: 28 }}>
      {showWpm && <span style={{ fontVariantNumeric: "tabular-nums" }}>{wpm} wpm</span>}
      {showAcc && <span style={{ fontVariantNumeric: "tabular-nums" }}>{accuracy}%</span>}
      {timeLeft !== null && timerStyle === "text" && (
        <span style={{ fontVariantNumeric: "tabular-nums" }}>{timeLeft}s</span>
      )}
      {showBar && (
        <span
          aria-label={`${timeLeft}s left`}
          style={{ flex: 1, height: 6, borderRadius: 999, background: "var(--surface-2)", overflow: "hidden", maxWidth: 320 }}
        >
          <span
            style={{
              display: "block",
              height: "100%",
              width: `${Math.max(0, Math.min(100, (timeLeft! / duration!) * 100))}%`,
              background: "var(--accent)",
              transition: "width 1s linear",
            }}
          />
        </span>
      )}
    </div>
  );
}
