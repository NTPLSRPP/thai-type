"use client";
import { useEffect } from "react";
import { Page } from "@/components/Page";
import { StatsDashboard } from "@/components/StatsDashboard";
import { useStats } from "@/stores/statsStore";
import { useKeyModel } from "@/stores/keyModelStore";

export default function StatsPage() {
  useEffect(() => {
    useStats.getState().reload();
    useKeyModel.getState().reload();
  }, []);
  return (
    <Page>
      <h1 style={{ color: "var(--accent)", fontSize: 22, marginBottom: "var(--space-6)" }}>stats</h1>
      <StatsDashboard />
    </Page>
  );
}
