import type { Metrics } from "@/lib/engine/metrics";
import type { WpmPoint } from "@/lib/stats/types";
import { WpmGraph } from "./WpmGraph";
import { StatCard } from "./StatCard";

export function Results({
  metrics,
  onRestart,
  series = [],
}: {
  metrics: Metrics;
  onRestart: () => void;
  series?: WpmPoint[];
}) {
  return (
    <div>
      <div style={{ display: "flex", gap: 40, marginBottom: 24 }}>
        <StatCard label="wpm" value={`${metrics.wpm}`} />
        <StatCard label="accuracy" value={`${metrics.accuracy}%`} />
        <StatCard label="consistency" value={`${metrics.consistency}%`} />
        <StatCard label="raw" value={`${metrics.rawWpm}`} />
      </div>
      {series.length > 0 && (
        <div style={{ margin: "8px 0 24px" }}>
          <WpmGraph points={series} />
        </div>
      )}
      <button onClick={onRestart} className="tt-btn tt-btn-primary">
        next test
      </button>
    </div>
  );
}
