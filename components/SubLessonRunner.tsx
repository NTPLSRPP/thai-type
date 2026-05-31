"use client";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useSettings } from "@/stores/settingsStore";
import { useKeyModel } from "@/stores/keyModelStore";
import { useLessonProgress } from "@/stores/lessonProgressStore";
import { getLayout } from "@/lib/layouts/registry";
import { getSubLesson, nextSubLessonId, CHAPTERS, REPS_TO_COMPLETE } from "@/lib/curriculum/chapters";
import { resolveKey } from "@/lib/layouts/resolve";
import { errorCountsByChar } from "@/lib/engine/keyStats";
import { playClick, playError } from "@/lib/sound/sound";
import { createEngine, type TypingEngine } from "@/lib/engine/engine";
import type { EngineSnapshot } from "@/lib/engine/types";
import { Words } from "./Words";
import { Keyboard } from "./Keyboard";

interface SubLessonRunnerProps {
  id: number;
  textOverride?: string; // test seam
}

export function SubLessonRunner({ id, textOverride }: SubLessonRunnerProps) {
  const settings = useSettings();
  const layout = getLayout(settings.layoutId);
  const recordModel = useKeyModel((s) => s.record);
  const recordRep = useLessonProgress((s) => s.record);

  const sub = getSubLesson(id);
  const text = textOverride ?? sub?.text ?? "";
  const chapter = sub ? CHAPTERS[sub.chapterIndex] : undefined;

  const [snap, setSnap] = useState<EngineSnapshot | null>(null);
  const [repsDone, setRepsDone] = useState(0);
  const [done, setDone] = useState(false);
  const engineRef = useRef<TypingEngine | null>(null);

  const start = useCallback(() => {
    if (!text) return;
    engineRef.current = createEngine(text, () => performance.now());
    setSnap(engineRef.current.snapshot());
    setDone(false);
  }, [text]);

  useEffect(() => {
    setRepsDone(0);
    start();
    // restart cleanly whenever the sub-lesson changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    function onKey(ev: KeyboardEvent) {
      const e = engineRef.current;
      if (!e || done) return;
      if (ev.code === "Backspace" || ev.key === "Backspace") {
        ev.preventDefault();
        if (settings.noBackspace) return;
        e.back();
        setSnap(e.snapshot());
        return;
      }
      const ch = resolveKey(layout, ev.code, ev.shiftKey);
      if (ch === null) return;
      ev.preventDefault();
      e.press(ch, settings.stopOnError !== "letter");
      const s = e.snapshot();
      setSnap(s);
      const last = s.keystrokes[s.keystrokes.length - 1];
      if (settings.clickSound) playClick(settings.soundVolume);
      if (settings.errorSound && last && !last.correct) playError(settings.soundVolume);
      if (s.finished) {
        recordModel(s.keystrokes);
        const n = recordRep(id);
        setRepsDone(n);
        if (n >= REPS_TO_COMPLETE) setDone(true);
        else start(); // next rep, same text
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    done, layout, id, recordModel, recordRep, start,
    settings.noBackspace, settings.stopOnError, settings.clickSound, settings.errorSound, settings.soundVolume,
  ]);

  const nextChar =
    snap && !snap.finished && snap.cursor < snap.cells.length ? snap.cells[snap.cursor].target : null;
  const errorCounts = useMemo(
    () => (snap ? errorCountsByChar(snap.keystrokes) : new Map<string, number>()),
    [snap],
  );

  if (!sub) return <p style={{ color: "var(--text-typed)" }}>Unknown lesson.</p>;

  const next = nextSubLessonId(id);
  // Session counter only — reps completed this sitting (not mixed with persisted total).
  const repInfo = done ? REPS_TO_COMPLETE : repsDone;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <h2 style={{ fontSize: 16, color: "var(--text-typed)" }}>{chapter?.title}</h2>
        <span data-testid="rep-indicator" style={{ fontSize: 13, color: "var(--accent)" }}>
          rep {Math.min(repInfo + (done ? 0 : 1), REPS_TO_COMPLETE)} / {REPS_TO_COMPLETE}
        </span>
      </div>

      {done ? (
        <div>
          <h3 style={{ color: "var(--accent)" }}>Lesson complete ✓</h3>
          <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
            <button
              onClick={() => {
                setRepsDone(0);
                start();
              }}
              className="tt-btn"
            >
              practice again
            </button>
            {next && (
              <Link href={`/lessons/${next}`} className="tt-btn" style={{ textDecoration: "none" }}>
                next lesson →
              </Link>
            )}
            <Link href="/lessons" className="tt-btn" style={{ textDecoration: "none" }}>
              all lessons
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div style={{ marginTop: "var(--space-6)" }}>
            {snap && (
              <Words
                cells={snap.cells}
                cursor={snap.cursor}
                text={text}
                caretStyle={settings.caretStyle}
                smoothCaret={settings.smoothCaret}
                blind={settings.blindMode}
                fontSize={settings.fontSize}
                fontFamily={settings.typingFont}
              />
            )}
          </div>
          {settings.showKeyboard && (
            <Keyboard
              layout={layout}
              nextChar={nextChar}
              errorCounts={errorCounts}
              showShiftLegend={settings.showShiftLegend}
              fingerColors={settings.fingerColors}
              nextKeyHint={settings.nextKeyHint}
              heatmap={settings.heatmap}
            />
          )}
        </>
      )}
    </div>
  );
}
