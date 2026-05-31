"use client";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useSettings } from "@/stores/settingsStore";
import { useKeyModel } from "@/stores/keyModelStore";
import { useStats } from "@/stores/statsStore";
import { createEngine, type TypingEngine } from "@/lib/engine/engine";
import { computeMetrics, type Metrics } from "@/lib/engine/metrics";
import { errorCountsByChar } from "@/lib/engine/keyStats";
import { wpmSeries } from "@/lib/stats/wpmSeries";
import { resolveKey } from "@/lib/layouts/resolve";
import { findKeyForChar } from "@/lib/layouts/reverse";
import { getLayout } from "@/lib/layouts/registry";
import type { HandFinger } from "@/lib/layouts/fingers";
import { generateWords } from "@/lib/text/generate";
import { playClick, playError } from "@/lib/sound/sound";
import type { EngineSnapshot } from "@/lib/engine/types";
import { Words } from "./Words";
import { StatsBar } from "./StatsBar";
import { Results } from "./Results";
import { ConfigBar } from "./ConfigBar";
import { KeyboardWithHands } from "./KeyboardWithHands";

function fingerForChar(layout: ReturnType<typeof getLayout>, ch: string | null): HandFinger | null {
  if (!ch) return null;
  const k = findKeyForChar(layout, ch);
  if (!k) return null;
  return k.code === "Space" ? "thumb" : (layout.keys[k.code]?.finger ?? null);
}

const CONTROL_KEYS = new Set([
  "Shift", "Backspace", "Enter", "Tab", "Alt", "Control", "Meta", "CapsLock",
  "Dead", "Escape", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
]);

export function TestScreen({ testText }: { testText?: string }) {
  const s = useSettings();
  const { mode, duration, wordCount, layoutId, inputMode } = s;
  const layout = getLayout(layoutId);
  const recordModel = useKeyModel((st) => st.record);
  const recordSession = useStats((st) => st.record);

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

  const persistSession = useCallback(
    (m: Metrics) => {
      if (testText) return;
      recordSession({
        at: Date.now(), mode, amount: mode === "time" ? duration : wordCount,
        wpm: m.wpm, rawWpm: m.rawWpm, accuracy: m.accuracy, consistency: m.consistency,
        correct: m.correct, incorrect: m.incorrect, layoutId,
      });
    },
    [testText, mode, duration, wordCount, layoutId, recordSession],
  );

  const finishNow = useCallback(() => {
    const e = engineRef.current;
    if (!e || e.snapshot().finished) return;
    e.finish();
    const snapshot = e.snapshot();
    setSnap(snapshot);
    recordModel(snapshot.keystrokes);
    const m = computeMetrics(
      snapshot.keystrokes,
      mode === "time" && !testText
        ? duration * 1000
        : snapshot.keystrokes.length
          ? snapshot.keystrokes[snapshot.keystrokes.length - 1].t
          : 0,
    );
    setMetrics(m);
    persistSession(m);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [mode, duration, testText, recordModel, persistSession]);

  // Run only on the start/finish TRANSITIONS, not on every keystroke. Depending on the
  // whole `snap` object (which is replaced on every press) would tear down + recreate the
  // 1s interval each keystroke, so its first tick never lands for a real typist and the
  // countdown stalls. Depend on the derived booleans instead.
  const hasStarted = snap?.startedAt != null;
  const isFinished = snap?.finished ?? false;
  useEffect(() => {
    if (mode !== "time" || testText || !hasStarted || isFinished) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((tl) => (tl === null ? tl : Math.max(0, tl - 1)));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [mode, testText, hasStarted, isFinished]);

  useEffect(() => {
    if (mode !== "time" || testText || metrics) return;
    if (timeLeft === 0 && engineRef.current) finishNow();
  }, [timeLeft, mode, testText, metrics, finishNow]);

  const stopOnError = s.stopOnError;
  const noBackspace = s.noBackspace;
  const quickRestart = s.quickRestart;
  const clickSound = s.clickSound;
  const errorSound = s.errorSound;
  const soundVolume = s.soundVolume;

  useEffect(() => {
    function onKey(ev: KeyboardEvent) {
      // quick restart (works even from the results screen)
      if (quickRestart === "tab" && ev.key === "Tab") {
        // don't hijack Tab when focus is on interactive chrome (nav, config, buttons)
        const ae = document.activeElement as HTMLElement | null;
        const onControl =
          !!ae && ae !== document.body && /^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(ae.tagName);
        if (onControl) return;
        ev.preventDefault();
        start();
        return;
      }
      if (quickRestart === "esc" && ev.key === "Escape") {
        ev.preventDefault();
        start();
        return;
      }
      const e = engineRef.current;
      if (!e || metrics) return;

      if (ev.code === "Backspace" || ev.key === "Backspace") {
        if (noBackspace) {
          ev.preventDefault();
          return;
        }
        ev.preventDefault();
        e.back();
        setSnap(e.snapshot());
        return;
      }

      let char: string | null;
      if (inputMode === "os-native") {
        char = CONTROL_KEYS.has(ev.key) || ev.key.length === 0 ? null : ev.key;
        if (char !== null && Array.from(char).length > 1) char = null;
      } else {
        char = resolveKey(layout, ev.code, ev.shiftKey);
      }
      if (char === null) return;
      ev.preventDefault();
      e.press(char, stopOnError !== "letter");
      const snapshot = e.snapshot();
      setSnap(snapshot);
      const last = snapshot.keystrokes[snapshot.keystrokes.length - 1];
      if (clickSound) playClick(soundVolume);
      if (errorSound && last && !last.correct) playError(soundVolume);
      if (snapshot.finished) {
        recordModel(snapshot.keystrokes);
        const elapsed = snapshot.keystrokes.length ? snapshot.keystrokes[snapshot.keystrokes.length - 1].t : 0;
        const m = computeMetrics(snapshot.keystrokes, elapsed);
        setMetrics(m);
        persistSession(m);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [metrics, inputMode, layout, recordModel, persistSession, stopOnError, noBackspace, quickRestart, clickSound, errorSound, soundVolume, start]);

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
  const activeFinger = fingerForChar(layout, nextChar);

  const kbProps = {
    layout,
    errorCounts,
    size: s.keyboardSize,
    showShiftLegend: s.showShiftLegend,
    fingerColors: s.fingerColors,
    nextKeyHint: s.nextKeyHint,
    heatmap: s.heatmap,
    showKeyboard: s.showKeyboard,
  };

  if (metrics) {
    return (
      <div>
        <Results metrics={metrics} onRestart={start} series={series} />
        <KeyboardWithHands {...kbProps} nextChar={null} showHands={false} activeFinger={null} />
      </div>
    );
  }

  return (
    <div>
      {!testText && <ConfigBar />}
      <div className="tt-stage">
        <StatsBar
          wpm={liveWpm}
          accuracy={liveAcc}
          timeLeft={timeLeft}
          showWpm={s.liveSpeed}
          showAcc={s.liveAccuracy}
          timerStyle={s.timerStyle}
          duration={duration}
        />
        <div style={{ marginTop: "var(--space-6)" }}>
          {snap && (
            <Words
              cells={snap.cells}
              cursor={snap.cursor}
              text={target}
              caretStyle={s.caretStyle}
              smoothCaret={s.smoothCaret}
              blind={s.blindMode}
              fontSize={s.fontSize}
              fontFamily={s.typingFont}
            />
          )}
        </div>
      </div>
      <KeyboardWithHands
        {...kbProps}
        nextChar={inputMode === "app-remap" ? nextChar : null}
        showHands={s.showHands}
        activeFinger={activeFinger}
      />
    </div>
  );
}
