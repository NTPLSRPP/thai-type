"use client";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useSettings } from "@/stores/settingsStore";
import { useProgress } from "@/stores/progressStore";
import { useKeyModel } from "@/stores/keyModelStore";
import { useTheme } from "@/stores/themeStore";
import { getLayout } from "@/lib/layouts/registry";
import { getUnit, nextUnitId } from "@/lib/curriculum/units";
import { generateDrill, charsForCodes } from "@/lib/curriculum/drills";
import { weakCharWeights } from "@/lib/curriculum/adaptive";
import { generateWords } from "@/lib/text/generate";
import { resolveKey } from "@/lib/layouts/resolve";
import { errorCountsByChar } from "@/lib/engine/keyStats";
import { createEngine, type TypingEngine } from "@/lib/engine/engine";
import type { EngineSnapshot } from "@/lib/engine/types";
import { Words } from "./Words";
import { Keyboard } from "./Keyboard";

interface LessonRunnerProps {
  unitId: string;
  drillText?: string; // test override
}

export function LessonRunner({ unitId, drillText }: LessonRunnerProps) {
  const { layoutId } = useSettings();
  const layout = getLayout(layoutId);
  const complete = useProgress((s) => s.complete);
  const recordModel = useKeyModel((s) => s.record);
  const model = useKeyModel((s) => s.model);
  const caretStyle = useTheme((s) => s.activeTheme()?.caretStyle ?? "line");
  const unit = getUnit(unitId);

  const [target, setTarget] = useState("");
  const [snap, setSnap] = useState<EngineSnapshot | null>(null);
  const [done, setDone] = useState(false);
  const engineRef = useRef<TypingEngine | null>(null);

  const buildDrill = useCallback((): string => {
    if (drillText) return drillText;
    if (!unit) return "";
    if (unit.pool) return generateWords(12);
    const chars = charsForCodes(unit.keys, layout);
    const weights = weakCharWeights(model, chars);
    return generateDrill({ codes: unit.keys, layout, groups: 10, weights });
  }, [drillText, unit, layout, model]);

  const start = useCallback(() => {
    const t = buildDrill();
    setTarget(t);
    engineRef.current = createEngine(t, () => performance.now());
    setSnap(engineRef.current.snapshot());
    setDone(false);
  }, [buildDrill]);

  useEffect(() => {
    if (unit) start();
    // start once per unit; buildDrill identity changes with model but we only (re)start on mount/unit change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitId]);

  useEffect(() => {
    function onKey(ev: KeyboardEvent) {
      const e = engineRef.current;
      if (!e || done) return;
      if (ev.code === "Backspace" || ev.key === "Backspace") {
        ev.preventDefault();
        e.back();
        setSnap(e.snapshot());
        return;
      }
      const ch = resolveKey(layout, ev.code, ev.shiftKey);
      if (ch === null) return;
      ev.preventDefault();
      e.press(ch);
      const s = e.snapshot();
      setSnap(s);
      if (s.finished) {
        recordModel(s.keystrokes);
        complete(unitId);
        setDone(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [done, layout, unitId, complete, recordModel]);

  const nextChar =
    snap && !snap.finished && snap.cursor < snap.cells.length ? snap.cells[snap.cursor].target : null;
  const errorCounts = useMemo(
    () => (snap ? errorCountsByChar(snap.keystrokes) : new Map<string, number>()),
    [snap],
  );

  if (!unit) return <p style={{ color: "var(--text)" }}>Unknown lesson.</p>;

  if (done) {
    const next = nextUnitId(unitId);
    return (
      <div>
        <h2 style={{ color: "var(--accent)" }}>Lesson complete</h2>
        <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
          <button onClick={start} style={btn}>repeat</button>
          {next && (
            <Link href={`/lessons/${next}`} style={{ ...btn, textDecoration: "none" }}>
              next lesson →
            </Link>
          )}
          <Link href="/lessons" style={{ ...btn, textDecoration: "none" }}>
            all lessons
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ color: "var(--text-typed)", fontSize: 18 }}>{unit.name}</h2>
      <div style={{ marginTop: 24 }}>
        {snap && <Words cells={snap.cells} cursor={snap.cursor} text={target} caretStyle={caretStyle} />}
      </div>
      <Keyboard layout={layout} nextChar={nextChar} errorCounts={errorCounts} />
    </div>
  );
}

const btn: React.CSSProperties = {
  background: "transparent",
  color: "var(--text)",
  border: "1px solid var(--text)",
  padding: "8px 16px",
  cursor: "pointer",
};
