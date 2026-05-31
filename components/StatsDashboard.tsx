"use client";
import { useMemo, useState } from "react";
import { useStats } from "@/stores/statsStore";
import { useKeyModel } from "@/stores/keyModelStore";
import { useSettings } from "@/stores/settingsStore";
import { getLayout } from "@/lib/layouts/registry";
import { computeAggregates } from "@/lib/stats/aggregates";
import { WpmGraph } from "./WpmGraph";
import { Keyboard } from "./Keyboard";
import { StatCard } from "./StatCard";
import type { WpmPoint } from "@/lib/stats/types";

const heading: React.CSSProperties = {
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: 2,
  color: "var(--text-typed)",
};

export function StatsDashboard() {
  const sessions = useStats((s) => s.sessions);
  const clear = useStats((s) => s.clear);
  const model = useKeyModel((s) => s.model);
  const layoutId = useSettings((s) => s.layoutId);
  const layout = getLayout(layoutId);
  const [confirming, setConfirming] = useState(false);

  const agg = useMemo(() => computeAggregates(sessions), [sessions]);

  const trend: WpmPoint[] = useMemo(
    () => sessions.slice(-30).map((s, i) => ({ t: i + 1, wpm: s.wpm })),
    [sessions],
  );

  const errorCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const [ch, stat] of Object.entries(model)) if (stat.incorrect > 0) m.set(ch, stat.incorrect);
    return m;
  }, [model]);

  if (sessions.length === 0) {
    return (
      <p style={{ color: "var(--text-typed)" }}>No tests yet. Finish a test to see your stats.</p>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 40, marginBottom: 28 }}>
        <StatCard testId="agg-bestWpm" label="best wpm" value={`${agg.bestWpm}`} valueSize={32} labelSize={12} />
        <StatCard testId="agg-avgWpm" label="avg wpm" value={`${agg.avgWpm}`} valueSize={32} labelSize={12} />
        <StatCard testId="agg-avgAccuracy" label="avg acc" value={`${agg.avgAccuracy}%`} valueSize={32} labelSize={12} />
        <StatCard testId="agg-totalTests" label="tests" value={`${agg.totalTests}`} valueSize={32} labelSize={12} />
      </div>

      <h2 style={heading}>wpm trend</h2>
      <WpmGraph points={trend} xLabel="test #" />

      <h2 style={{ ...heading, marginTop: 24 }}>error heatmap</h2>
      <Keyboard layout={layout} nextChar={null} errorCounts={errorCounts} />

      <div style={{ marginTop: 24 }}>
        {confirming ? (
          <span style={{ display: "flex", gap: 12 }}>
            <button
              onClick={() => {
                clear();
                setConfirming(false);
              }}
              className="tt-btn"
              style={{ color: "var(--error)", borderColor: "var(--error)" }}
            >
              really clear?
            </button>
            <button onClick={() => setConfirming(false)} className="tt-btn">
              cancel
            </button>
          </span>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="tt-btn"
            style={{ color: "var(--error)", borderColor: "var(--error)" }}
          >
            clear history
          </button>
        )}
      </div>
    </div>
  );
}
