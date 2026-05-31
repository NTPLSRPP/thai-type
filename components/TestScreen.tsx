"use client";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useSettings } from "@/stores/settingsStore";
import { useKeyModel } from "@/stores/keyModelStore";
import { useTheme } from "@/stores/themeStore";
import { useStats } from "@/stores/statsStore";
import { createEngine, type TypingEngine } from "@/lib/engine/engine";
import { computeMetrics, type Metrics } from "@/lib/engine/metrics";
import { errorCountsByChar } from "@/lib/engine/keyStats";
import { wpmSeries } from "@/lib/stats/wpmSeries";
import { resolveKey } from "@/lib/layouts/resolve";
import { getLayout } from "@/lib/layouts/registry";
import { generateWords } from "@/lib/text/generate";
import type { EngineSnapshot } from "@/lib/engine/types";
import { Words } from "./Words";
import { StatsBar } from "./StatsBar";
import { Results } from "./Results";
import { ModeBar } from "./ModeBar";
import { LayoutBar } from "./LayoutBar";
import { Keyboard } from "./Keyboard";

const CONTROL_KEYS = new Set([
  "Shift",
  "Backspace",
  "Enter",
  "Tab",
  "Alt",
  "Control",
  "Meta",
  "CapsLock",
  "Dead",
  "Escape",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
]);

export function TestScreen({ testText }: { testText?: string }) {
  const { mode, duration, wordCount, layoutId, inputMode } = useSettings();
  const layout = getLayout(layoutId);
  const recordModel = useKeyModel((s) => s.record);
  const recordSession = useStats((s) => s.record);
  const caretStyle = useTheme((s) => s.activeTheme()?.caretStyle ?? "line");
  const [target, setTarget] = useState(testText ?? "");
  const [snap, setSnap] = useState<EngineSnapshot | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const engineRef = useRef<TypingEngine | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const newTarget = useCallback(() => {
    if (testText) return testText;
    const count = mode === "words" ? wordCount : 60;
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

  // Persist a finished free-test session (not test-override runs). Date.now() is fine here:
  // this is a browser component, not pure code.
  const persistSession = useCallback(
    (m: Metrics) => {
      if (testText) return;
      recordSession({
        at: Date.now(),
        mode,
        amount: mode === "time" ? duration : wordCount,
        wpm: m.wpm,
        rawWpm: m.rawWpm,
        accuracy: m.accuracy,
        consistency: m.consistency,
        correct: m.correct,
        incorrect: m.incorrect,
        layoutId,
      });
    },
    [testText, mode, duration, wordCount, layoutId, recordSession],
  );

  const finishNow = useCallback(() => {
    const e = engineRef.current;
    if (!e || e.snapshot().finished) return; // idempotent: never record a finish twice
    e.finish();
    const s = e.snapshot();
    setSnap(s);
    recordModel(s.keystrokes);
    const m = computeMetrics(
      s.keystrokes,
      mode === "time" && !testText
        ? duration * 1000
        : s.keystrokes.length
          ? s.keystrokes[s.keystrokes.length - 1].t
          : 0,
    );
    setMetrics(m);
    persistSession(m);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [mode, duration, testText, recordModel, persistSession]);

  useEffect(() => {
    if (mode !== "time" || testText || !snap || snap.finished) return;
    if (snap.startedAt === null) return;
    // Pure updater: only decrements. The finish is fired by a separate effect so it
    // runs exactly once (Strict-Mode double-invokes updaters; side effects belong outside).
    timerRef.current = setInterval(() => {
      setTimeLeft((tl) => (tl === null ? tl : Math.max(0, tl - 1)));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [mode, testText, snap?.startedAt, snap?.finished, snap]);

  // Finish exactly once when the countdown reaches zero.
  useEffect(() => {
    if (mode !== "time" || testText || metrics) return;
    if (timeLeft === 0 && engineRef.current) finishNow();
  }, [timeLeft, mode, testText, metrics, finishNow]);

  useEffect(() => {
    function onKey(ev: KeyboardEvent) {
      const e = engineRef.current;
      if (!e || metrics) return;
      if (ev.code === "Backspace" || ev.key === "Backspace") {
        ev.preventDefault();
        e.back();
        setSnap(e.snapshot());
        return;
      }
      let char: string | null;
      if (inputMode === "os-native") {
        // OS already produced the Thai character; accept printable single graphemes only.
        char = CONTROL_KEYS.has(ev.key) || ev.key.length === 0 ? null : ev.key;
        if (char !== null && Array.from(char).length > 1) char = null;
      } else {
        char = resolveKey(layout, ev.code, ev.shiftKey);
      }
      if (char === null) return;
      ev.preventDefault();
      e.press(char);
      const s = e.snapshot();
      setSnap(s);
      if (s.finished) {
        recordModel(s.keystrokes);
        const elapsed = s.keystrokes.length ? s.keystrokes[s.keystrokes.length - 1].t : 0;
        const m = computeMetrics(s.keystrokes, elapsed);
        setMetrics(m);
        persistSession(m);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [metrics, inputMode, layout, recordModel, persistSession]);

  const liveWpm = useMemo(() => {
    if (!snap || !snap.startedAt) return 0;
    const elapsed = snap.keystrokes.length ? snap.keystrokes[snap.keystrokes.length - 1].t : 1;
    return computeMetrics(snap.keystrokes, elapsed).wpm;
  }, [snap]);
  const liveAcc = useMemo(() => (snap ? computeMetrics(snap.keystrokes, 1).accuracy : 0), [snap]);

  const nextChar =
    snap && !snap.finished && snap.cursor < snap.cells.length ? snap.cells[snap.cursor].target : null;
  const errorCounts = useMemo(
    () => (snap ? errorCountsByChar(snap.keystrokes) : new Map<string, number>()),
    [snap],
  );
  const series = useMemo(() => (snap ? wpmSeries(snap.keystrokes) : []), [snap]);

  if (metrics) {
    return (
      <div>
        <Results metrics={metrics} onRestart={start} series={series} />
        <Keyboard layout={layout} nextChar={null} errorCounts={errorCounts} />
      </div>
    );
  }

  return (
    <div>
      {!testText && (
        <>
          <LayoutBar />
          <ModeBar />
        </>
      )}
      <StatsBar wpm={liveWpm} accuracy={liveAcc} timeLeft={timeLeft} />
      <div style={{ marginTop: 24 }}>
        {snap && <Words cells={snap.cells} cursor={snap.cursor} text={target} caretStyle={caretStyle} />}
      </div>
      <Keyboard
        layout={layout}
        nextChar={inputMode === "app-remap" ? nextChar : null}
        errorCounts={errorCounts}
      />
    </div>
  );
}
