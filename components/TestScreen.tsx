"use client";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useSettings } from "@/stores/settingsStore";
import { createEngine, type TypingEngine } from "@/lib/engine/engine";
import { computeMetrics, type Metrics } from "@/lib/engine/metrics";
import { resolveKey } from "@/lib/layouts/resolve";
import { kedmanee } from "@/lib/layouts/kedmanee";
import { generateWords } from "@/lib/text/generate";
import type { EngineSnapshot } from "@/lib/engine/types";
import { Words } from "./Words";
import { StatsBar } from "./StatsBar";
import { Results } from "./Results";
import { ModeBar } from "./ModeBar";

export function TestScreen({ testText }: { testText?: string }) {
  const { mode, duration, wordCount } = useSettings();
  const [, setTarget] = useState(testText ?? "");
  const [snap, setSnap] = useState<EngineSnapshot | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const engineRef = useRef<TypingEngine | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const newTarget = useCallback(() => {
    if (testText) return testText;
    const count = mode === "words" ? wordCount : 60; // time mode: long buffer
    return generateWords(count);
  }, [testText, mode, wordCount]);

  const start = useCallback(() => {
    const t = newTarget();
    setTarget(t);
    engineRef.current = createEngine(t, () => performance.now());
    setSnap(engineRef.current.snapshot());
    setMetrics(null);
    setTimeLeft(mode === "time" && !testText ? duration : null);
  }, [newTarget, mode, duration, testText]);

  useEffect(() => {
    start();
  }, [start]);

  const finishNow = useCallback(() => {
    const e = engineRef.current;
    if (!e) return;
    e.finish();
    const s = e.snapshot();
    setSnap(s);
    setMetrics(
      computeMetrics(
        s.keystrokes,
        mode === "time" && !testText
          ? duration * 1000
          : s.keystrokes.length
            ? s.keystrokes[s.keystrokes.length - 1].t
            : 0,
      ),
    );
    if (timerRef.current) clearInterval(timerRef.current);
  }, [mode, duration, testText]);

  // time-mode countdown — starts on first keystroke
  useEffect(() => {
    if (mode !== "time" || testText || !snap || snap.finished) return;
    if (snap.startedAt === null) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((tl) => {
        if (tl === null) return tl;
        if (tl <= 1) {
          finishNow();
          return 0;
        }
        return tl - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [mode, testText, snap?.startedAt, snap?.finished, finishNow, snap]);

  useEffect(() => {
    function onKey(ev: KeyboardEvent) {
      const e = engineRef.current;
      if (!e || metrics) return;
      const cluster = resolveKey(kedmanee, ev.code, ev.shiftKey);
      if (cluster === null) return;
      ev.preventDefault();
      e.press(cluster);
      const s = e.snapshot();
      setSnap(s);
      if (s.finished) {
        const elapsed = s.keystrokes.length ? s.keystrokes[s.keystrokes.length - 1].t : 0;
        setMetrics(computeMetrics(s.keystrokes, elapsed));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [metrics]);

  const liveWpm = useMemo(() => {
    if (!snap || !snap.startedAt) return 0;
    const elapsed = snap.keystrokes.length ? snap.keystrokes[snap.keystrokes.length - 1].t : 1;
    return computeMetrics(snap.keystrokes, elapsed).wpm;
  }, [snap]);
  const liveAcc = useMemo(() => (snap ? computeMetrics(snap.keystrokes, 1).accuracy : 0), [snap]);

  if (metrics) return <Results metrics={metrics} onRestart={start} />;

  return (
    <div>
      {!testText && <ModeBar />}
      <StatsBar wpm={liveWpm} accuracy={liveAcc} timeLeft={timeLeft} />
      <div style={{ marginTop: 24 }}>{snap && <Words cells={snap.cells} cursor={snap.cursor} />}</div>
    </div>
  );
}
