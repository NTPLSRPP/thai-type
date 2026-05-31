import type { WpmPoint } from "@/lib/stats/types";

interface WpmGraphProps {
  points: WpmPoint[];
  width?: number;
  height?: number;
}

export function WpmGraph({ points, width = 600, height = 180 }: WpmGraphProps) {
  if (points.length === 0) {
    return <div style={{ color: "var(--text)", fontSize: 13 }}>No data yet.</div>;
  }
  const pad = 24;
  const maxWpm = Math.max(...points.map((p) => p.wpm), 1);
  const maxT = Math.max(...points.map((p) => p.t), 1);
  const x = (t: number) => pad + (t / maxT) * (width - pad * 2);
  const y = (wpm: number) => height - pad - (wpm / maxWpm) * (height - pad * 2);
  const coords = points.map((p) => `${x(p.t).toFixed(1)},${y(p.wpm).toFixed(1)}`).join(" ");

  return (
    <svg
      data-testid="wpm-graph"
      width="100%"
      viewBox={`0 0 ${width} ${height}`}
      style={{ maxWidth: width }}
      role="img"
      aria-label="words per minute over time"
    >
      <polyline
        data-testid="wpm-line"
        points={coords}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <text x={pad} y={pad - 8} fill="var(--text)" fontSize={11}>
        {maxWpm} wpm
      </text>
    </svg>
  );
}
