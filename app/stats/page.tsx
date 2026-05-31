"use client";
import { useEffect } from "react";
import { NavBar } from "@/components/NavBar";
import { StatsDashboard } from "@/components/StatsDashboard";
import { useStats } from "@/stores/statsStore";
import { useKeyModel } from "@/stores/keyModelStore";

export default function StatsPage() {
  useEffect(() => {
    useStats.getState().reload();
    useKeyModel.getState().reload();
  }, []);
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "8vh 24px" }}>
      <NavBar />
      <h1 style={{ color: "var(--accent)", fontSize: 22, marginBottom: 24 }}>stats</h1>
      <StatsDashboard />
    </main>
  );
}
