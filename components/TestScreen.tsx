"use client";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useSettings } from "@/stores/settingsStore";
import { useKeyModel } from "@/stores/keyModelStore";
import { createEngine, type TypingEngine } from "@/lib/engine/engine";
import { computeMetrics, type Metrics } from "@/lib/engine/metrics";
import { errorCountsByChar } from "@/lib/engine/keyStats";
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

  const finishNow = useCallback(() => {
    const e = engineRef.current;
    if (!e) return;
    e.finish();
    const s = e.snapshot();
    setSnap(s);
    recordModel(s.keystrokes);
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
  }, [mode, duration, testText, recordModel]);

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
        setMetrics(computeMetrics(s.keystrokes, elapsed));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [metrics, inputMode, layout, recordModel]);

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

  if (metrics) {
    return (
      <div>
        <Results metrics={metrics} onRestart={start} />
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
        {snap && <Words cells={snap.cells} cursor={snap.cursor} text={target} />}
      </div>
      <Keyboard
        layout={layout}
        nextChar={inputMode === "app-remap" ? nextChar : null}
        errorCounts={errorCounts}
      />
    </div>
  );
}
