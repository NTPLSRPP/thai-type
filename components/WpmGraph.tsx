import type { WpmPoint } from "@/lib/stats/types";

interface WpmGraphProps {
  points: WpmPoint[];
  width?: number;
  height?: number;
  xLabel?: string;
}

export function WpmGraph({ points, width = 600, height = 180, xLabel }: WpmGraphProps) {
  if (points.length === 0) {
    return <div style={{ color: "var(--text-typed)", fontSize: 13 }}>No data yet.</div>;
  }
  const pad = 24;
  const maxWpm = Math.max(...points.map((p) => p.wpm), 1);
  const maxT = Math.max(...points.map((p) => p.t), 1);
  const x = (t: number) => pad + (t / maxT) * (width - pad * 2);
  const y = (wpm: number) => height - pad - (wpm / maxWpm) * (height - pad * 2);
  const coords = points.map((p) => `${x(p.t).toFixed(1)},${y(p.wpm).toFixed(1)}`).join(" ");
  const baseY = y(0);

  return (
    <svg
      data-testid="wpm-graph"
      width="100%"
      viewBox={`0 0 ${width} ${height}`}
      style={{ maxWidth: width }}
      role="img"
      aria-label="words per minute over time"
    >
      {/* zero baseline */}
      <line
        x1={pad}
        y1={baseY}
        x2={width - pad}
        y2={baseY}
        stroke="color-mix(in oklab, var(--text) 40%, transparent)"
        strokeWidth={1}
      />
      <polyline
        data-testid="wpm-line"
        points={coords}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <text x={pad} y={pad - 8} fill="var(--text-typed)" fontSize={11}>
        {maxWpm} wpm
      </text>
      <text x={pad} y={baseY + 14} fill="var(--text)" fontSize={10}>
        0
      </text>
      {xLabel && (
        <text x={width - pad} y={baseY + 14} fill="var(--text)" fontSize={10} textAnchor="end">
          {xLabel}
        </text>
      )}
    </svg>
  );
}
