# Plan 3 — Curriculum + Adaptive Drills

> **⚠️ SUPERSEDED (2026-06-01) — do not execute.** This plan's generated-drill + adaptive
> unit system (`units.ts`, `drills.ts`, `adaptive.ts`, `lib/storage/progress.ts`,
> `stores/progressStore.ts`, `LessonMap.tsx`, `LessonRunner.tsx`, route `lessons/[unit]`)
> was replaced by the real typingth.com curriculum. Live equivalents: `lib/curriculum/typingth.ts`
> + `chapters.ts`, `lib/storage/lessonProgress.ts`, `stores/lessonProgressStore.ts`,
> `components/ChapterList.tsx` + `SubLessonRunner.tsx`, route `app/lessons/[id]`. The per-key
> model + heatmap survive (`keyStats.ts`, stats dashboard). Kept as a historical record only.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A structured lesson curriculum (fixed progressive path) with procedurally generated drills, a keybr-style adaptive engine that weights the learner's weakest characters, cross-session per-character stats, lesson progress/unlocking, lesson UI + routes, and wiring so both lessons and the free test feed the adaptive model.

**Architecture:** Units are defined by physical key codes (layout-agnostic); the drill generator maps codes to Thai characters through the active layout, so one curriculum serves all three layouts. A persisted per-character model (correct/incorrect counts) accumulates across sessions; the adaptive engine derives weights from it to bias drill generation toward weak characters. Lesson progress (completed/unlocked units) persists separately. Lesson UI reuses the existing typing engine, `Words`, and `Keyboard`.

**Tech Stack:** Next.js 16, TypeScript, Zustand, Vitest + @testing-library/react, Playwright. Builds on Plans 1–2.

**Prerequisite:** Plans 1–2 complete and green (49 unit tests, build, 3 e2e).

---

## File Structure

```
lib/curriculum/
  units.ts          NEW: fixed unit definitions (by key code) + helpers
  drills.ts         NEW: generate drill text from codes + layout (+ weights)
  adaptive.ts       NEW: derive per-char weights from the key model
lib/storage/
  keyModel.ts       NEW: persisted per-char correct/incorrect, merge keystrokes
  progress.ts       NEW: persisted completed units + unlock logic
stores/
  keyModelStore.ts  NEW: reactive key model
  progressStore.ts  NEW: reactive progress
components/
  LessonMap.tsx     NEW: unit list with locked/unlocked/completed states
  LessonRunner.tsx  NEW: runs one unit's drill, records, completes
  NavBar.tsx        NEW: links between Test and Lessons
  TestScreen.tsx    MODIFY: record keystrokes into the key model on finish
app/
  page.tsx          MODIFY: add NavBar
  lessons/page.tsx        NEW: lesson map route
  lessons/[unit]/page.tsx NEW: single lesson route
e2e/
  lesson.spec.ts    NEW: complete a lesson unit
```

---

## WAVE 1 (parallel — two disjoint domains)

Tasks 1–3 (Agent A, `lib/curriculum/`) and Tasks 4–5 (Agent B, `lib/storage/`) touch non-overlapping directories. Run concurrently. Each owns its files, runs its own tests, does NOT git commit.

### Task 1 (Agent A): Curriculum units

**Files:**
- Create: `lib/curriculum/units.ts`
- Test: `tests/curriculum/units.test.ts`

Units are defined by physical `KeyboardEvent.code` sets so they apply to every layout. A special `pool` flag marks word/sentence units that draw from the Thai word pool instead of generated drills.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { UNITS, getUnit, orderedUnits, nextUnitId } from "@/lib/curriculum/units";

describe("curriculum units", () => {
  it("exposes an ordered, non-empty unit list", () => {
    expect(UNITS.length).toBeGreaterThanOrEqual(6);
    const orders = orderedUnits().map((u) => u.order);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
  });
  it("first unit is the left home row and is order 0", () => {
    const first = orderedUnits()[0];
    expect(first.order).toBe(0);
    expect(first.keys).toContain("KeyA");
  });
  it("getUnit returns a unit by id", () => {
    const first = orderedUnits()[0];
    expect(getUnit(first.id)?.id).toBe(first.id);
  });
  it("nextUnitId walks the order and returns null at the end", () => {
    const ordered = orderedUnits();
    expect(nextUnitId(ordered[0].id)).toBe(ordered[1].id);
    expect(nextUnitId(ordered[ordered.length - 1].id)).toBeNull();
  });
  it("every non-pool unit lists at least 3 key codes", () => {
    for (const u of UNITS) {
      if (!u.pool) expect(u.keys.length).toBeGreaterThanOrEqual(3);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/curriculum/units.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `lib/curriculum/units.ts`**

```ts
export interface LessonUnit {
  id: string;
  name: string;
  keys: string[]; // physical KeyboardEvent.code values
  order: number;
  pool?: boolean; // true => draw from the Thai word pool, not generated drills
}

export const UNITS: LessonUnit[] = [
  { id: "home-left", name: "Home Row — Left", order: 0, keys: ["KeyA", "KeyS", "KeyD", "KeyF", "KeyG"] },
  { id: "home-right", name: "Home Row — Right", order: 1, keys: ["KeyH", "KeyJ", "KeyK", "KeyL", "Semicolon"] },
  { id: "home-all", name: "Home Row — All", order: 2, keys: ["KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyK", "KeyL"] },
  { id: "top-row", name: "Top Row", order: 3, keys: ["KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU", "KeyI", "KeyO", "KeyP"] },
  { id: "bottom-row", name: "Bottom Row", order: 4, keys: ["KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM"] },
  { id: "all-letters", name: "All Letters", order: 5, keys: [
      "KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU", "KeyI", "KeyO", "KeyP",
      "KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyK", "KeyL",
      "KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM",
    ] },
  { id: "words", name: "Common Words", order: 6, keys: [], pool: true },
];

const byOrder = (a: LessonUnit, b: LessonUnit) => a.order - b.order;

export function orderedUnits(): LessonUnit[] {
  return [...UNITS].sort(byOrder);
}

export function getUnit(id: string): LessonUnit | undefined {
  return UNITS.find((u) => u.id === id);
}

export function nextUnitId(id: string): string | null {
  const ordered = orderedUnits();
  const i = ordered.findIndex((u) => u.id === id);
  if (i === -1 || i === ordered.length - 1) return null;
  return ordered[i + 1].id;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/curriculum/units.test.ts`
Expected: PASS (5 tests).

### Task 2 (Agent A): Drill generator

**Files:**
- Create: `lib/curriculum/drills.ts`
- Test: `tests/curriculum/drills.test.ts`

Generates pseudo-word drill text from a set of key codes resolved through a layout. Deterministic when given an `rng`. Optional `weights` (char → relative weight) bias selection toward weak characters.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { generateDrill, charsForCodes } from "@/lib/curriculum/drills";
import { kedmanee } from "@/lib/layouts/kedmanee";

describe("charsForCodes", () => {
  it("resolves codes to their normal chars via the layout", () => {
    const chars = charsForCodes(["KeyD", "KeyF"], kedmanee); // ก, ด
    expect(chars).toEqual(["ก", "ด"]);
  });
  it("skips codes absent from the layout", () => {
    expect(charsForCodes(["KeyD", "F13"], kedmanee)).toEqual(["ก"]);
  });
});

describe("generateDrill", () => {
  it("produces the requested number of space-separated groups", () => {
    const out = generateDrill({ codes: ["KeyD", "KeyF", "KeyG"], layout: kedmanee, groups: 5, rng: () => 0 });
    expect(out.split(" ")).toHaveLength(5);
  });
  it("only uses characters from the resolved code set", () => {
    const allowed = new Set(charsForCodes(["KeyD", "KeyF"], kedmanee));
    const out = generateDrill({ codes: ["KeyD", "KeyF"], layout: kedmanee, groups: 4, rng: Math.random });
    for (const ch of out.replace(/ /g, "")) expect(allowed.has(ch)).toBe(true);
  });
  it("is deterministic for a fixed rng", () => {
    const a = generateDrill({ codes: ["KeyD", "KeyF", "KeyG"], layout: kedmanee, groups: 6, rng: seeded(1) });
    const b = generateDrill({ codes: ["KeyD", "KeyF", "KeyG"], layout: kedmanee, groups: 6, rng: seeded(1) });
    expect(a).toBe(b);
  });
});

// simple deterministic rng for tests
function seeded(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/curriculum/drills.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `lib/curriculum/drills.ts`**

```ts
import type { Layout } from "@/lib/layouts/types";

export function charsForCodes(codes: string[], layout: Layout): string[] {
  const out: string[] = [];
  for (const code of codes) {
    const def = layout.keys[code];
    if (def && def.normal !== " " && def.normal.length > 0) out.push(def.normal);
  }
  return out;
}

interface DrillOpts {
  codes: string[];
  layout: Layout;
  groups?: number; // number of pseudo-word chunks
  groupLen?: [number, number]; // [min, max] chars per chunk
  weights?: Map<string, number>; // char -> relative weight (>=0)
  rng?: () => number;
}

export function generateDrill(opts: DrillOpts): string {
  const { codes, layout, groups = 8, groupLen = [2, 4], weights, rng = Math.random } = opts;
  const chars = charsForCodes(codes, layout);
  if (chars.length === 0) return "";

  const weighted = buildWeightedPool(chars, weights);
  const [minLen, maxLen] = groupLen;
  const chunks: string[] = [];
  for (let g = 0; g < groups; g++) {
    const len = minLen + Math.floor(rng() * (maxLen - minLen + 1));
    let chunk = "";
    for (let i = 0; i < len; i++) {
      chunk += weighted[Math.floor(rng() * weighted.length) % weighted.length];
    }
    chunks.push(chunk);
  }
  return chunks.join(" ");
}

// Expand chars into a flat pool where higher-weight chars appear more often.
function buildWeightedPool(chars: string[], weights?: Map<string, number>): string[] {
  if (!weights) return chars;
  const pool: string[] = [];
  for (const ch of chars) {
    const w = Math.max(1, Math.round(weights.get(ch) ?? 1));
    for (let i = 0; i < w; i++) pool.push(ch);
  }
  return pool.length ? pool : chars;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/curriculum/drills.test.ts`
Expected: PASS (5 tests).

### Task 3 (Agent A): Adaptive weighting

**Files:**
- Create: `lib/curriculum/adaptive.ts`
- Test: `tests/curriculum/adaptive.test.ts`

Derives a char→weight map from a key model (per-char correct/incorrect). Weak chars (high error rate, or few attempts) get higher weight so drills surface them more.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { weakCharWeights } from "@/lib/curriculum/adaptive";
import type { KeyModel } from "@/lib/storage/keyModel";

describe("weakCharWeights", () => {
  it("gives a higher weight to chars with a higher error rate", () => {
    const model: KeyModel = {
      "ก": { correct: 90, incorrect: 10 }, // 10% error
      "ด": { correct: 50, incorrect: 50 }, // 50% error
    };
    const w = weakCharWeights(model, ["ก", "ด"]);
    expect(w.get("ด")!).toBeGreaterThan(w.get("ก")!);
  });
  it("gives unseen chars a baseline weight (>=1)", () => {
    const w = weakCharWeights({}, ["ก"]);
    expect(w.get("ก")!).toBeGreaterThanOrEqual(1);
  });
  it("returns a weight for every requested char", () => {
    const w = weakCharWeights({ "ก": { correct: 1, incorrect: 0 } }, ["ก", "ด", "ฟ"]);
    expect([...w.keys()].sort()).toEqual(["ก", "ด", "ฟ"].sort());
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/curriculum/adaptive.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `lib/curriculum/adaptive.ts`**

```ts
import type { KeyModel } from "@/lib/storage/keyModel";

const BASE = 1;
const ERROR_SCALE = 6; // weight added at 100% error rate
const UNSEEN_WEIGHT = 3; // bias toward never-practiced chars

export function weakCharWeights(model: KeyModel, chars: string[]): Map<string, number> {
  const weights = new Map<string, number>();
  for (const ch of chars) {
    const stat = model[ch];
    if (!stat || stat.correct + stat.incorrect === 0) {
      weights.set(ch, UNSEEN_WEIGHT);
      continue;
    }
    const total = stat.correct + stat.incorrect;
    const errorRate = stat.incorrect / total;
    weights.set(ch, BASE + errorRate * ERROR_SCALE);
  }
  return weights;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/curriculum/adaptive.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5 (Agent A wrap-up): run the whole curriculum suite + type-check**

Run: `npx vitest run tests/curriculum/` → expect 13 passing.
Run: `npx tsc --noEmit` → no errors in `lib/curriculum/`. (NOTE: `adaptive.ts` imports `KeyModel` from `@/lib/storage/keyModel`, created by Agent B in parallel. Use `import type` so it is compile-time only; if `tsc` reports the module missing because Agent B has not finished, that is expected — report it and the coordinator re-checks after merge.)

Return: files created, pass counts, and whether `tsc` saw `keyModel`.

### Task 4 (Agent B): Persisted key model

**Files:**
- Create: `lib/storage/keyModel.ts`
- Test: `tests/storage/keyModel.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { loadKeyModel, recordKeystrokes, KEY_MODEL_KEY } from "@/lib/storage/keyModel";
import type { Keystroke } from "@/lib/engine/types";

beforeEach(() => localStorage.clear());

function ks(expected: string, actual: string): Keystroke {
  return { expected, actual, correct: expected === actual, t: 0 };
}

describe("key model storage", () => {
  it("returns an empty model when nothing stored", () => {
    expect(loadKeyModel()).toEqual({});
  });
  it("merges keystrokes into per-char correct/incorrect counts", () => {
    recordKeystrokes([ks("ก", "ก"), ks("ก", "ด"), ks("ด", "ด")]);
    const m = loadKeyModel();
    expect(m["ก"]).toEqual({ correct: 1, incorrect: 1 });
    expect(m["ด"]).toEqual({ correct: 1, incorrect: 0 });
  });
  it("accumulates across multiple record calls", () => {
    recordKeystrokes([ks("ก", "ก")]);
    recordKeystrokes([ks("ก", "ก")]);
    expect(loadKeyModel()["ก"]).toEqual({ correct: 2, incorrect: 0 });
  });
  it("falls back to empty on corrupt data", () => {
    localStorage.setItem(KEY_MODEL_KEY, "{bad json");
    expect(loadKeyModel()).toEqual({});
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/storage/keyModel.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `lib/storage/keyModel.ts`**

```ts
import type { Keystroke } from "@/lib/engine/types";

export const KEY_MODEL_KEY = "thaitype:keymodel";
const VERSION = 1;

export interface CharStat {
  correct: number;
  incorrect: number;
}
export type KeyModel = Record<string, CharStat>;

export function loadKeyModel(): KeyModel {
  if (typeof localStorage === "undefined") return {};
  const raw = localStorage.getItem(KEY_MODEL_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as { v: number; data: KeyModel };
    if (parsed.v !== VERSION || typeof parsed.data !== "object" || parsed.data === null) return {};
    return parsed.data;
  } catch {
    return {};
  }
}

export function saveKeyModel(model: KeyModel): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(KEY_MODEL_KEY, JSON.stringify({ v: VERSION, data: model }));
}

export function recordKeystrokes(strokes: Keystroke[]): KeyModel {
  const model = loadKeyModel();
  for (const s of strokes) {
    const key = s.expected;
    if (!key || key === " ") continue;
    const stat = model[key] ?? { correct: 0, incorrect: 0 };
    if (s.correct) stat.correct += 1;
    else stat.incorrect += 1;
    model[key] = stat;
  }
  saveKeyModel(model);
  return model;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/storage/keyModel.test.ts`
Expected: PASS (4 tests).

### Task 5 (Agent B): Persisted progress

**Files:**
- Create: `lib/storage/progress.ts`
- Test: `tests/storage/progress.test.ts`

Unlock rule: the first unit (lowest order) is always unlocked; a later unit unlocks once the immediately-preceding unit (by order) is completed.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { loadProgress, markComplete, isUnlocked, PROGRESS_KEY } from "@/lib/storage/progress";

beforeEach(() => localStorage.clear());

describe("progress storage", () => {
  it("starts empty", () => {
    expect(loadProgress()).toEqual({ completed: [] });
  });
  it("marks a unit complete (idempotent)", () => {
    markComplete("home-left");
    markComplete("home-left");
    expect(loadProgress().completed).toEqual(["home-left"]);
  });
  it("unlocks the first unit unconditionally", () => {
    expect(isUnlocked("home-left", [])).toBe(true);
  });
  it("locks a later unit until the previous one is complete", () => {
    expect(isUnlocked("home-right", [])).toBe(false);
    expect(isUnlocked("home-right", ["home-left"])).toBe(true);
  });
  it("falls back to empty on corrupt data", () => {
    localStorage.setItem(PROGRESS_KEY, "nope");
    expect(loadProgress()).toEqual({ completed: [] });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/storage/progress.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `lib/storage/progress.ts`**

```ts
import { orderedUnits } from "@/lib/curriculum/units";

export const PROGRESS_KEY = "thaitype:progress";
const VERSION = 1;

export interface Progress {
  completed: string[];
}

export function loadProgress(): Progress {
  if (typeof localStorage === "undefined") return { completed: [] };
  const raw = localStorage.getItem(PROGRESS_KEY);
  if (!raw) return { completed: [] };
  try {
    const parsed = JSON.parse(raw) as { v: number; data: Progress };
    if (parsed.v !== VERSION || !Array.isArray(parsed.data?.completed)) return { completed: [] };
    return parsed.data;
  } catch {
    return { completed: [] };
  }
}

export function saveProgress(p: Progress): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify({ v: VERSION, data: p }));
}

export function markComplete(unitId: string): Progress {
  const p = loadProgress();
  if (!p.completed.includes(unitId)) p.completed.push(unitId);
  saveProgress(p);
  return p;
}

export function isUnlocked(unitId: string, completed: string[]): boolean {
  const ordered = orderedUnits();
  const i = ordered.findIndex((u) => u.id === unitId);
  if (i <= 0) return true; // first unit (or unknown) is open
  return completed.includes(ordered[i - 1].id);
}
```

> NOTE: `progress.ts` imports `orderedUnits` from `@/lib/curriculum/units` (Agent A). This is a runtime import, not just a type. Agent B: implement and run your test — your `progress.test.ts` calls `isUnlocked` which needs `orderedUnits` at runtime. If Agent A has not yet created `units.ts`, your test will fail to resolve the import. Coordinate: if running truly in parallel and `units.ts` is missing, report it; the coordinator runs the merged suite. (In practice Agent A's Task 1 is small and usually lands first. If blocked, stub nothing — just report.)

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/storage/progress.test.ts`
Expected: PASS (5 tests). (Requires `lib/curriculum/units.ts` to exist.)

Return: files created, pass counts.

---

## WAVE 2 (sequential — stores, UI, routes, wiring, coordinator)

### Task 6: Stores

**Files:**
- Create: `stores/keyModelStore.ts`, `stores/progressStore.ts`
- Test: `tests/stores/progressStore.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { useProgress } from "@/stores/progressStore";

beforeEach(() => {
  localStorage.clear();
  useProgress.getState().reload();
});

describe("progressStore", () => {
  it("complete() persists and updates state", () => {
    useProgress.getState().complete("home-left");
    expect(useProgress.getState().completed).toContain("home-left");
    const raw = JSON.parse(localStorage.getItem("thaitype:progress")!);
    expect(raw.data.completed).toContain("home-left");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/stores/progressStore.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `stores/progressStore.ts`**

```ts
import { create } from "zustand";
import { loadProgress, markComplete } from "@/lib/storage/progress";

interface ProgressState {
  completed: string[];
  complete(unitId: string): void;
  reload(): void;
}

export const useProgress = create<ProgressState>((set) => ({
  completed: loadProgress().completed,
  complete(unitId) {
    const p = markComplete(unitId);
    set({ completed: [...p.completed] });
  },
  reload() {
    set({ completed: loadProgress().completed });
  },
}));
```

- [ ] **Step 4: Implement `stores/keyModelStore.ts`**

```ts
import { create } from "zustand";
import { loadKeyModel, recordKeystrokes, type KeyModel } from "@/lib/storage/keyModel";
import type { Keystroke } from "@/lib/engine/types";

interface KeyModelState {
  model: KeyModel;
  record(strokes: Keystroke[]): void;
  reload(): void;
}

export const useKeyModel = create<KeyModelState>((set) => ({
  model: loadKeyModel(),
  record(strokes) {
    const model = recordKeystrokes(strokes);
    set({ model: { ...model } });
  },
  reload() {
    set({ model: loadKeyModel() });
  },
}));
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/stores/progressStore.test.ts`
Expected: PASS (1 test).

- [ ] **Step 6: Commit Wave 1 + this step**

```bash
git add lib/curriculum tests/curriculum lib/storage/keyModel.ts lib/storage/progress.ts tests/storage/keyModel.test.ts tests/storage/progress.test.ts stores/keyModelStore.ts stores/progressStore.ts tests/stores/progressStore.test.ts
git commit -m "feat(curriculum): units, drills, adaptive weighting; persisted key model + progress; stores"
```

---

### Task 7: LessonRunner component

**Files:**
- Create: `components/LessonRunner.tsx`
- Test: `tests/components/LessonRunner.test.tsx`

Runs one unit: builds a drill (generated from unit keys via active layout + adaptive weights, OR a pooled words drill), creates an engine, accepts app-remap input, renders `Words` + `Keyboard`, and on completion records keystrokes into the key model, marks the unit complete, and shows a done state with a link to the next unit.

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LessonRunner } from "@/components/LessonRunner";
import { useProgress } from "@/stores/progressStore";

beforeEach(() => {
  localStorage.clear();
  useProgress.getState().reload();
});

describe("LessonRunner", () => {
  it("renders a drill and the keyboard for a unit", () => {
    render(<LessonRunner unitId="home-left" drillText="ก" />);
    expect(screen.getAllByTestId("char").length).toBeGreaterThan(0);
    expect(screen.getByTestId("key-KeyD")).toBeInTheDocument();
  });
  it("completes the unit when the drill is finished", () => {
    render(<LessonRunner unitId="home-left" drillText="ก" />);
    fireEvent.keyDown(window, { code: "KeyD", shiftKey: false }); // KeyD -> ก
    expect(screen.getByText(/complete/i)).toBeInTheDocument();
    expect(useProgress.getState().completed).toContain("home-left");
  });
  it("shows an unknown-unit message for a bad id", () => {
    render(<LessonRunner unitId="nope" />);
    expect(screen.getByText(/unknown lesson/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/LessonRunner.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `components/LessonRunner.tsx`**

```tsx
"use client";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useSettings } from "@/stores/settingsStore";
import { useProgress } from "@/stores/progressStore";
import { useKeyModel } from "@/stores/keyModelStore";
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
  const errorCounts = useMemo(() => (snap ? errorCountsByChar(snap.keystrokes) : new Map<string, number>()), [snap]);

  if (!unit) return <p style={{ color: "var(--text)" }}>Unknown lesson.</p>;

  if (done) {
    const next = nextUnitId(unitId);
    return (
      <div>
        <h2 style={{ color: "var(--accent)" }}>Lesson complete</h2>
        <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
          <button onClick={start} style={btn}>repeat</button>
          {next && <Link href={`/lessons/${next}`} style={{ ...btn, textDecoration: "none" }}>next lesson →</Link>}
          <Link href="/lessons" style={{ ...btn, textDecoration: "none" }}>all lessons</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ color: "var(--text-typed)", fontSize: 18 }}>{unit.name}</h2>
      <div style={{ marginTop: 24 }}>
        {snap && <Words cells={snap.cells} cursor={snap.cursor} text={target} />}
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/components/LessonRunner.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add components/LessonRunner.tsx tests/components/LessonRunner.test.tsx
git commit -m "feat(ui): LessonRunner — adaptive drill, records model, unlocks next"
```

---

### Task 8: LessonMap + NavBar

**Files:**
- Create: `components/LessonMap.tsx`, `components/NavBar.tsx`
- Test: `tests/components/LessonMap.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { LessonMap } from "@/components/LessonMap";
import { useProgress } from "@/stores/progressStore";

beforeEach(() => {
  localStorage.clear();
  useProgress.getState().reload();
});

describe("LessonMap", () => {
  it("renders all units with the first unlocked and the second locked", () => {
    render(<LessonMap />);
    // first unit link is enabled (an anchor), later one shows a lock marker
    expect(screen.getByText("Home Row — Left")).toBeInTheDocument();
    expect(screen.getByTestId("unit-home-right").dataset.locked).toBe("true");
  });
  it("unlocks the second unit after the first is completed", () => {
    useProgress.getState().complete("home-left");
    render(<LessonMap />);
    expect(screen.getByTestId("unit-home-right").dataset.locked).toBe("false");
    expect(screen.getByTestId("unit-home-left").dataset.completed).toBe("true");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/LessonMap.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `components/LessonMap.tsx`**

```tsx
"use client";
import Link from "next/link";
import { orderedUnits } from "@/lib/curriculum/units";
import { isUnlocked } from "@/lib/storage/progress";
import { useProgress } from "@/stores/progressStore";

export function LessonMap() {
  const completed = useProgress((s) => s.completed);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {orderedUnits().map((u) => {
        const unlocked = isUnlocked(u.id, completed);
        const isComplete = completed.includes(u.id);
        const row = (
          <div
            data-testid={`unit-${u.id}`}
            data-locked={(!unlocked).toString()}
            data-completed={isComplete.toString()}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "12px 16px",
              borderRadius: 8,
              border: "1px solid #3a3c3f",
              color: unlocked ? "var(--text-typed)" : "var(--text)",
              opacity: unlocked ? 1 : 0.5,
            }}
          >
            <span>{u.name}</span>
            <span style={{ color: "var(--accent)" }}>{isComplete ? "✓" : unlocked ? "" : "🔒"}</span>
          </div>
        );
        return unlocked ? (
          <Link key={u.id} href={`/lessons/${u.id}`} style={{ textDecoration: "none" }}>
            {row}
          </Link>
        ) : (
          <div key={u.id}>{row}</div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Implement `components/NavBar.tsx`**

```tsx
import Link from "next/link";

export function NavBar() {
  return (
    <nav style={{ display: "flex", gap: 20, marginBottom: 32, fontSize: 14 }}>
      <Link href="/" style={{ color: "var(--text)", textDecoration: "none" }}>test</Link>
      <Link href="/lessons" style={{ color: "var(--text)", textDecoration: "none" }}>lessons</Link>
    </nav>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/components/LessonMap.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add components/LessonMap.tsx components/NavBar.tsx tests/components/LessonMap.test.tsx
git commit -m "feat(ui): LessonMap with unlock/complete states + NavBar"
```

---

### Task 9: Routes + wire NavBar + feed model from free test

**Files:**
- Create: `app/lessons/page.tsx`, `app/lessons/[unit]/page.tsx`
- Modify: `app/page.tsx`, `components/TestScreen.tsx`

- [ ] **Step 1: Create `app/lessons/page.tsx`**

```tsx
import { LessonMap } from "@/components/LessonMap";
import { NavBar } from "@/components/NavBar";

export default function LessonsPage() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "8vh 24px" }}>
      <NavBar />
      <h1 style={{ color: "var(--accent)", fontSize: 22, marginBottom: 24 }}>lessons</h1>
      <LessonMap />
    </main>
  );
}
```

- [ ] **Step 2: Create `app/lessons/[unit]/page.tsx`**

Next 16 App Router: `params` is a Promise in async server components. Read the route guide if unsure: `node_modules/next/dist/docs/`. Implementation:

```tsx
import { LessonRunner } from "@/components/LessonRunner";
import { NavBar } from "@/components/NavBar";

export default async function LessonPage({ params }: { params: Promise<{ unit: string }> }) {
  const { unit } = await params;
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "8vh 24px" }}>
      <NavBar />
      <LessonRunner unitId={unit} />
    </main>
  );
}
```

- [ ] **Step 3: Add NavBar to `app/page.tsx`**

Replace the contents of `app/page.tsx` with:

```tsx
import { TestScreen } from "@/components/TestScreen";
import { NavBar } from "@/components/NavBar";

export default function Home() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "8vh 24px" }}>
      <NavBar />
      <h1 style={{ color: "var(--accent)", fontSize: 22, marginBottom: 32 }}>thai-type</h1>
      <TestScreen />
    </main>
  );
}
```

- [ ] **Step 4: Feed the key model from the free test**

In `components/TestScreen.tsx`, import the key-model store and record keystrokes whenever a test finishes (both the keydown-finish path and the time-mode `finishNow` path).

Add the import near the other store imports:

```tsx
import { useKeyModel } from "@/stores/keyModelStore";
```

Inside the `TestScreen` component, add (near the other store hooks):

```tsx
  const recordModel = useKeyModel((s) => s.record);
```

In `finishNow`, after `setSnap(s);` and before computing metrics, add:

```tsx
    recordModel(s.keystrokes);
```

In the keydown handler's finish branch (`if (s.finished) { ... }`), add `recordModel(s.keystrokes);` as the first line inside the block.

Add `recordModel` to that effect's dependency array (it becomes `[metrics, inputMode, layout, recordModel]`).

- [ ] **Step 5: Verify unit tests still pass**

Run: `npm run test`
Expected: all pass. (TestScreen tests don't assert model writes; recording is a side effect on a cleared localStorage.)

- [ ] **Step 6: Build**

Run: `npm run build`
Expected: success, no type errors. If `params` typing errors, confirm the `Promise<{unit:string}>` signature against the Next 16 docs in `node_modules/next/dist/docs/`.

- [ ] **Step 7: Commit**

```bash
git add app/lessons app/page.tsx components/TestScreen.tsx
git commit -m "feat(app): lessons routes, nav, free-test feeds adaptive key model"
```

---

### Task 10: E2E — complete a lesson

**Files:**
- Create: `e2e/lesson.spec.ts`

- [ ] **Step 1: Write the E2E test**

```ts
import { test, expect } from "@playwright/test";

test("navigates to lessons and completes the first unit", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "lessons" }).click();
  await expect(page).toHaveURL(/\/lessons$/);
  await page.getByText("Home Row — Left").click();
  await expect(page).toHaveURL(/\/lessons\/home-left$/);

  // type until the drill completes (home-left chars are reachable via their codes;
  // hammering the unit's codes in order will match generated chars eventually)
  const codes = ["KeyA", "KeyS", "KeyD", "KeyF", "KeyG"];
  for (let i = 0; i < 600; i++) {
    await page.keyboard.press(codes[i % codes.length]);
    if (await page.getByText(/lesson complete/i).isVisible().catch(() => false)) break;
  }
  await expect(page.getByText(/lesson complete/i)).toBeVisible();
});

test("first unit unlocks the second after completion", async ({ page }) => {
  await page.goto("/lessons");
  // after the previous test's run the state is per-context; this test re-completes within its own context
  await page.getByText("Home Row — Left").click();
  const codes = ["KeyA", "KeyS", "KeyD", "KeyF", "KeyG"];
  for (let i = 0; i < 600; i++) {
    await page.keyboard.press(codes[i % codes.length]);
    if (await page.getByText(/lesson complete/i).isVisible().catch(() => false)) break;
  }
  await page.getByRole("link", { name: "all lessons" }).click();
  await expect(page.getByTestId("unit-home-right")).toHaveAttribute("data-locked", "false");
});
```

> NOTE: a fresh browser context starts with empty localStorage, so the second unit begins locked. The drill is correct-input gated: pressing a key whose resolved char doesn't match the current target marks it incorrect and still advances the cursor, so cycling all five home-left codes guarantees completion within the loop budget. If completion is flaky, raise the loop bound.

- [ ] **Step 2: Run E2E**

Run: `npm run e2e`
Expected: all specs pass (Plan 1 + Plan 2 + Plan 3).

- [ ] **Step 3: Commit**

```bash
git add e2e/lesson.spec.ts
git commit -m "test(e2e): complete a lesson + verify unlock"
```

---

## Self-Review Notes

- **Spec coverage (Plan 3 scope):** fixed-path curriculum (Task 1) ✓; generated drills from a char model (Task 2) ✓; curated word units via the existing pool (units `pool` flag + Task 7) ✓; adaptive weak-key weighting (Task 3) wired into `LessonRunner` (Task 7) ✓; per-char model persisted across sessions (Task 4) fed by BOTH lessons (Task 7) and the free test (Task 9) ✓; progress + unlock (Task 5) with map UI (Task 8) ✓; routes `/lessons`, `/lessons/[unit]` (Task 9) ✓.
- **Parallel safety:** Wave 1 Agent A owns `lib/curriculum/` only; Agent B owns `lib/storage/keyModel.ts` + `lib/storage/progress.ts` only. Cross-references are one-directional: `adaptive.ts` imports the `KeyModel` *type* (compile-time) from B; `progress.ts` imports `orderedUnits` (runtime) from A. The plan flags both so the coordinator runs the merged suite. No file is written by two agents.
- **Type/method consistency:** `KeyModel`/`CharStat`, `recordKeystrokes`→merged model, `loadProgress`/`markComplete`/`isUnlocked`, `orderedUnits`/`getUnit`/`nextUnitId`, `generateDrill({codes,layout,groups,weights,rng})`, `charsForCodes(codes,layout)`, `weakCharWeights(model,chars)`. Store actions: `useProgress.complete/reload`, `useKeyModel.record/reload`. Names identical across tasks.
- **Layout-agnostic by design:** units reference key codes, not characters, so one curriculum serves all three layouts; the drill text is generated through the active layout.
- **Deferred to Plan 4/5:** theme studio (4); full stats history + wpm-over-time graph + per-key heatmap dashboard (5). This plan persists the per-char model (a prerequisite the stats dashboard will also read), but does not build the dashboard.
```
