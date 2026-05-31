"use client";
import { useEffect, useRef, useState } from "react";
import { Keyboard } from "./Keyboard";
import { Hands, type Tips } from "./Hands";
import type { Layout } from "@/lib/layouts/types";
import type { KeyboardSize } from "@/lib/storage/schema";
import type { HandFinger } from "@/lib/layouts/fingers";

// which physical key each finger rests on (home row)
const HOME: [HandFinger, string][] = [
  ["left-pinky", "KeyA"],
  ["left-ring", "KeyS"],
  ["left-middle", "KeyD"],
  ["left-index", "KeyF"],
  ["right-index", "KeyJ"],
  ["right-middle", "KeyK"],
  ["right-ring", "KeyL"],
  ["right-pinky", "Semicolon"],
  ["thumb", "Space"],
];

interface Props {
  layout: Layout;
  nextChar: string | null;
  errorCounts: Map<string, number>;
  size?: KeyboardSize;
  showShiftLegend?: boolean;
  fingerColors?: boolean;
  nextKeyHint?: boolean;
  heatmap?: boolean;
  showKeyboard: boolean;
  showHands: boolean;
  activeFinger: HandFinger | null;
}

export function KeyboardWithHands({ showKeyboard, showHands, activeFinger, ...kb }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [tips, setTips] = useState<Tips>({});

  useEffect(() => {
    const wrap = ref.current;
    if (!wrap || !showKeyboard || !showHands) {
      setTips({});
      return;
    }
    const measure = () => {
      const wb = wrap.getBoundingClientRect();
      const next: Tips = {};
      for (const [finger, code] of HOME) {
        const el = wrap.querySelector(`[data-testid="key-${code}"]`) as HTMLElement | null;
        if (!el) continue;
        const r = el.getBoundingClientRect();
        next[finger] = { x: r.left - wb.left + r.width / 2, y: r.top - wb.top, w: r.width, h: r.height };
      }
      setTips(next);
    };
    measure();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    ro?.observe(wrap);
    window.addEventListener("resize", measure);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [showKeyboard, showHands, kb.size, kb.layout]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {showKeyboard && <Keyboard layout={kb.layout} nextChar={kb.nextChar} errorCounts={kb.errorCounts} size={kb.size} showShiftLegend={kb.showShiftLegend} fingerColors={kb.fingerColors} nextKeyHint={kb.nextKeyHint} heatmap={kb.heatmap} />}
      {showHands && showKeyboard && <Hands tips={tips} activeFinger={activeFinger} />}
    </div>
  );
}
