export function StatsBar({
  wpm,
  accuracy,
  timeLeft,
}: {
  wpm: number;
  accuracy: number;
  timeLeft: number | null;
}) {
  return (
    <div style={{ display: "flex", gap: 24, color: "var(--accent)", fontSize: 20 }}>
      <span>{wpm} wpm</span>
      <span>{accuracy}%</span>
      {timeLeft !== null && <span>{timeLeft}s</span>}
    </div>
  );
}
