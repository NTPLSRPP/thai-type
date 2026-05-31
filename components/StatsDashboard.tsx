"use client";
import { useMemo } from "react";
import { useStats } from "@/stores/statsStore";
import { useKeyModel } from "@/stores/keyModelStore";
import { useSettings } from "@/stores/settingsStore";
import { getLayout } from "@/lib/layouts/registry";
import { computeAggregates } from "@/lib/stats/aggregates";
import { WpmGraph } from "./WpmGraph";
import { Keyboard } from "./Keyboard";
import type { WpmPoint } from "@/lib/stats/types";

export function StatsDashboard() {
  const sessions = useStats((s) => s.sessions);
  const clear = useStats((s) => s.clear);
  const model = useKeyModel((s) => s.model);
  const layoutId = useSettings((s) => s.layoutId);
  const layout = getLayout(layoutId);

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
    return <p style={{ color: "var(--text)" }}>No tests yet. Finish a test to see your stats.</p>;
  }

  const Stat = ({ id, label, value }: { id: string; label: string; value: string }) => (
    <div data-testid={`agg-${id}`} style={{ textAlign: "center" }}>
      <div style={{ fontSize: 32, color: "var(--accent)" }}>{value}</div>
      <div style={{ fontSize: 12, color: "var(--text)" }}>{label}</div>
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", gap: 40, marginBottom: 28 }}>
        <Stat id="bestWpm" label="best wpm" value={`${agg.bestWpm}`} />
        <Stat id="avgWpm" label="avg wpm" value={`${agg.avgWpm}`} />
        <Stat id="avgAccuracy" label="avg acc" value={`${agg.avgAccuracy}%`} />
        <Stat id="totalTests" label="tests" value={`${agg.totalTests}`} />
      </div>

      <h2 style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, color: "var(--text)" }}>
        wpm trend
      </h2>
      <WpmGraph points={trend} />

      <h2
        style={{
          fontSize: 12,
          textTransform: "uppercase",
          letterSpacing: 2,
          color: "var(--text)",
          marginTop: 24,
        }}
      >
        error heatmap
      </h2>
      <Keyboard layout={layout} nextChar={null} errorCounts={errorCounts} />

      <button onClick={clear} className="tt-btn" style={{ marginTop: 24 }}>
        clear history
      </button>
    </div>
  );
}
