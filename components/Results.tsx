import type { Metrics } from "@/lib/engine/metrics";
import type { WpmPoint } from "@/lib/stats/types";
import { WpmGraph } from "./WpmGraph";

export function Results({
  metrics,
  onRestart,
  series = [],
}: {
  metrics: Metrics;
  onRestart: () => void;
  series?: WpmPoint[];
}) {
  const Stat = ({ label, value }: { label: string; value: string }) => (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 40, color: "var(--accent)" }}>{value}</div>
      <div style={{ fontSize: 13 }}>{label}</div>
    </div>
  );
  return (
    <div>
      <div style={{ display: "flex", gap: 40, marginBottom: 24 }}>
        <Stat label="wpm" value={`${metrics.wpm}`} />
        <Stat label="accuracy" value={`${metrics.accuracy}%`} />
        <Stat label="consistency" value={`${metrics.consistency}%`} />
        <Stat label="raw" value={`${metrics.rawWpm}`} />
      </div>
      {series.length > 0 && (
        <div style={{ margin: "8px 0 24px" }}>
          <WpmGraph points={series} />
        </div>
      )}
      <button
        onClick={onRestart}
        style={{
          background: "transparent",
          color: "var(--text)",
          border: "1px solid var(--text)",
          padding: "8px 16px",
          cursor: "pointer",
        }}
      >
        next test
      </button>
    </div>
  );
}
