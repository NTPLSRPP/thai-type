# Plan 2 — Layouts + On-screen Keyboard

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Pattachote + Manoonchai layouts, a layout selector, an on-screen keyboard with finger-zone coloring + next-key hint + error heatmap, and an OS-native input mode toggle — on top of a corrected char-level input model.

**Architecture:** A foundational engine fix changes comparison from grapheme-cluster units to single characters (correct for char-by-char Thai input), while display groups characters back into clusters so combining marks render attached. Layouts become a registry of three; the keyboard renders a fixed physical geometry and looks up the active layout. The TestScreen drives either app-remap or OS-native input.

**Tech Stack:** Next.js 16, TypeScript, Zustand, Vitest + @testing-library/react, Playwright. Builds on Plan 1.

**Prerequisite:** Plan 1 complete and green (28 unit tests, build, e2e).

---

## Why the engine changes first (read before starting)

Plan 1 built `cells` from grapheme clusters and compared a single typed character against a whole cluster. For non-combining text (`กา`) that worked. For combining text (`ก้า` = ก + ้ + า, displayed as 2 clusters) the user presses 3 keys but there are 2 cells — every combining sequence mis-scores. Correct model:

- **Comparison/cursor = one cell per Unicode code point** (each keystroke maps to one character).
- **Display = group code points into grapheme clusters** so a base consonant and its tone/vowel marks render in one box, each sub-character colored by its own state.

Tasks 1–3 implement this and update the `Words` renderer. This re-opens Plan 1 files (`lib/engine/compare.ts`, `lib/engine/types.ts`, `components/Words.tsx`) intentionally.

---

## File Structure

```
lib/engine/
  compare.ts        MODIFY: buildCells uses code points, not clusters
  display.ts        NEW: group cells into clusters for rendering
  keyStats.ts       NEW: per-character error counts from keystrokes
lib/layouts/
  kedmanee.ts       (exists)
  pattachote.ts     NEW
  manoonchai.ts     NEW
  geometry.ts       NEW: physical key rows (KeyboardEvent.code order)
  registry.ts       NEW: id -> Layout, list of layouts
  reverse.ts        NEW: find code(+shift) that produces a char
lib/storage/
  schema.ts         MODIFY: layoutId union of three
stores/
  settingsStore.ts  MODIFY: add setLayout, setInputMode
components/
  Words.tsx         MODIFY: render via display clusters
  Keyboard.tsx      NEW: on-screen keyboard
  LayoutBar.tsx     NEW: layout + input-mode controls
  TestScreen.tsx    MODIFY: active layout, os-native input, render Keyboard
e2e/
  layout-switch.spec.ts  NEW
```

---

## WAVE 0 (sequential — engine model fix, do first)

### Task 1: Char-level cells

**Files:**
- Modify: `lib/engine/compare.ts`
- Test: `tests/engine/compare.test.ts` (modify)

- [ ] **Step 1: Update the test to assert code-point cells**

Replace the `buildCells` test block in `tests/engine/compare.test.ts` with:

```ts
describe("buildCells", () => {
  it("creates one cell per code point (not per cluster)", () => {
    // ก้า = ก, ้, า -> three cells
    const cells = buildCells("ก้า");
    expect(cells.map((c) => c.target)).toEqual(["ก", "้", "า"]);
    expect(cells.every((c) => c.state === "untyped")).toBe(true);
  });
});
```

Keep the existing `applyInput` describe block unchanged.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/engine/compare.test.ts`
Expected: FAIL — `buildCells("ก้า")` currently returns `["ก้","า"]`.

- [ ] **Step 3: Update `buildCells`**

In `lib/engine/compare.ts`, replace the `toGraphemes` import usage in `buildCells` with a code-point split. New file contents:

```ts
import type { CharCell } from "./types";

export function buildCells(target: string): CharCell[] {
  // One cell per Unicode code point. Array.from splits by code point.
  return Array.from(target).map((ch) => ({ target: ch, typed: null, state: "untyped" }));
}

export function applyInput(
  cells: CharCell[],
  cursor: number,
  typedChar: string,
): { cells: CharCell[]; cursor: number } {
  if (cursor >= cells.length) return { cells, cursor };
  const correct = typedChar === cells[cursor].target;
  const next = cells.map((c, i) =>
    i === cursor ? { ...c, typed: typedChar, state: correct ? "correct" : "incorrect" } : c,
  );
  return { cells: next as CharCell[], cursor: cursor + 1 };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/engine/compare.test.ts`
Expected: PASS.

- [ ] **Step 5: Run the engine + component suites to catch fallout**

Run: `npx vitest run tests/engine/ tests/components/`
Expected: PASS. `engine.test.ts` uses `"กา"`/`"ก"` (no combining) so cursor counts are unchanged. `TestScreen.test.tsx` uses `testText="ก"` (single code point) — still one cell.

- [ ] **Step 6: Commit**

```bash
git add lib/engine/compare.ts tests/engine/compare.test.ts
git commit -m "fix(engine): compare per code point, not per grapheme cluster"
```

---

### Task 2: Display clustering

**Files:**
- Create: `lib/engine/display.ts`
- Test: `tests/engine/display.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { buildCells } from "@/lib/engine/compare";
import { groupClusters } from "@/lib/engine/display";

describe("groupClusters", () => {
  it("groups base + combining marks into one cluster, preserving cell indices", () => {
    const cells = buildCells("ก้า"); // ก, ้, า
    const groups = groupClusters(cells, "ก้า");
    // "ก้" is one grapheme (ก + ้), "า" is another
    expect(groups).toHaveLength(2);
    expect(groups[0].cells.map((c) => c.target)).toEqual(["ก", "้"]);
    expect(groups[0].indices).toEqual([0, 1]);
    expect(groups[1].cells.map((c) => c.target)).toEqual(["า"]);
    expect(groups[1].indices).toEqual([2]);
  });
  it("treats ascii as one cell per group", () => {
    const cells = buildCells("ab");
    const groups = groupClusters(cells, "ab");
    expect(groups).toHaveLength(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/engine/display.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

```ts
import type { CharCell } from "./types";

const seg = new Intl.Segmenter("th", { granularity: "grapheme" });

export interface ClusterGroup {
  cells: CharCell[];
  indices: number[];
}

export function groupClusters(cells: CharCell[], originalText: string): ClusterGroup[] {
  const groups: ClusterGroup[] = [];
  let i = 0;
  for (const { segment } of seg.segment(originalText)) {
    const len = Array.from(segment).length; // code points in this grapheme
    const slice = cells.slice(i, i + len);
    const indices = slice.map((_, k) => i + k);
    groups.push({ cells: slice, indices });
    i += len;
  }
  return groups;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/engine/display.test.ts`
Expected: PASS. If the segmenter groups `ก้า` differently in this Node version, adjust expected arrays to match `Array.from(seg.segment("ก้า"))` actual output (note it in your summary) — the ascii test stays authoritative.

- [ ] **Step 5: Commit**

```bash
git add lib/engine/display.ts tests/engine/display.test.ts
git commit -m "feat(engine): display clustering for combining marks"
```

---

### Task 3: Words renders by cluster

**Files:**
- Modify: `components/Words.tsx`
- Test: `tests/components/Words.test.tsx` (modify)

- [ ] **Step 1: Update the test**

Replace `tests/components/Words.test.tsx` with:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Words } from "@/components/Words";
import { buildCells } from "@/lib/engine/compare";

describe("Words", () => {
  it("renders one element per code point with state classes", () => {
    const cells = buildCells("กา"); // 2 code points
    render(<Words cells={cells} cursor={0} text="กา" />);
    const chars = screen.getAllByTestId("char");
    expect(chars).toHaveLength(2);
    expect(chars[0].className).toContain("untyped");
  });
  it("marks the cursor position", () => {
    const cells = buildCells("กา");
    render(<Words cells={cells} cursor={1} text="กา" />);
    expect(screen.getAllByTestId("char")[1].dataset.cursor).toBe("true");
  });
  it("groups combining marks into clusters", () => {
    const cells = buildCells("ก้า"); // 3 code points, 2 clusters
    render(<Words cells={cells} cursor={0} text="ก้า" />);
    expect(screen.getAllByTestId("char")).toHaveLength(3);
    expect(screen.getAllByTestId("cluster")).toHaveLength(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/Words.test.tsx`
Expected: FAIL — `Words` does not accept `text` and renders no `cluster` testids.

- [ ] **Step 3: Update `components/Words.tsx`**

```tsx
import { groupClusters } from "@/lib/engine/display";
import type { CharCell } from "@/lib/engine/types";

interface WordsProps {
  cells: CharCell[];
  cursor: number;
  text: string;
}

export function Words({ cells, cursor, text }: WordsProps) {
  const groups = groupClusters(cells, text);
  return (
    <div style={{ fontSize: 28, lineHeight: 1.8, letterSpacing: 1 }}>
      {groups.map((g, gi) => (
        <span key={gi} data-testid="cluster" style={{ display: "inline-block", whiteSpace: "pre" }}>
          {g.cells.map((c, k) => {
            const idx = g.indices[k];
            return (
              <span
                key={idx}
                data-testid="char"
                data-cursor={idx === cursor ? "true" : "false"}
                className={c.state}
                style={{
                  color:
                    c.state === "correct"
                      ? "var(--text-typed)"
                      : c.state === "incorrect"
                        ? "var(--error)"
                        : "var(--text)",
                  borderLeft: idx === cursor ? "2px solid var(--caret)" : "2px solid transparent",
                }}
              >
                {c.target}
              </span>
            );
          })}
        </span>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/components/Words.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add components/Words.tsx tests/components/Words.test.tsx
git commit -m "feat(ui): Words renders code points grouped into clusters"
```

> NOTE: `TestScreen` still calls `<Words cells cursor />` without `text`. That is fixed in Task 11 (Wave 2). Until then `TestScreen.test.tsx` may type-error on build; do NOT run `npm run build` until Wave 2. Unit tests for TestScreen still pass because the old call renders (TS is not enforced by vitest). The Wave 2 integration closes this.

---

## WAVE 1 (parallel — three disjoint domains)

These three tasks touch non-overlapping directories and can run concurrently. Each owns its files, runs its own tests, and does NOT git commit (coordinator commits after review).

### Task 4 (Agent A): Layouts — Pattachote, Manoonchai, geometry, registry, reverse

**Files:**
- Create: `lib/layouts/pattachote.ts`, `lib/layouts/manoonchai.ts`, `lib/layouts/geometry.ts`, `lib/layouts/registry.ts`, `lib/layouts/reverse.ts`
- Test: `tests/layouts/registry.test.ts`, `tests/layouts/reverse.test.ts`

**Data accuracy requirement:** Do NOT guess the Pattachote and Manoonchai key maps. Use WebSearch/WebFetch to find authoritative mappings and transcribe them completely for the alphanumeric block:

- Pattachote (ปัตตโชติ): standard Thai Pattachote layout. Authoritative references: Wikipedia "Thai keyboard layouts" (Pattachote section); the Thai Pattachote chart. Map every `KeyboardEvent.code` in the geometry below (number row through bottom row) to its `normal` and `shift` Thai characters.
- Manoonchai (มนูญชัย): community ergonomic layout. Authoritative reference: the official Manoonchai project (manoonchai.com / its GitHub repo `Manoonchai/Manoonchai`), which publishes the full mapping. Transcribe it for the same code set.

For each `KeyDef`, set `finger` and `row` consistently with the physical position (use the same finger-assignment scheme as `kedmanee.ts`: a key in a given column gets the same finger regardless of layout, because finger assignment is positional, not character-based). Reuse Kedmanee's finger/row per-code assignments — only `normal`/`shift` differ between layouts.

- [ ] **Step 1: Write the failing tests**

`tests/layouts/registry.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { LAYOUTS, getLayout, layoutList } from "@/lib/layouts/registry";

describe("layout registry", () => {
  it("contains all three layouts", () => {
    expect(Object.keys(LAYOUTS).sort()).toEqual(["kedmanee", "manoonchai", "pattachote"]);
  });
  it("getLayout returns the requested layout", () => {
    expect(getLayout("pattachote").id).toBe("pattachote");
  });
  it("layoutList exposes id + name for UI", () => {
    const ids = layoutList().map((l) => l.id).sort();
    expect(ids).toEqual(["kedmanee", "manoonchai", "pattachote"]);
    expect(layoutList().every((l) => typeof l.name === "string" && l.name.length > 0)).toBe(true);
  });
  it("every layout maps the home-row letter codes", () => {
    const home = ["KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyK", "KeyL"];
    for (const layout of Object.values(LAYOUTS)) {
      for (const code of home) {
        expect(layout.keys[code], `${layout.id} missing ${code}`).toBeDefined();
        expect(layout.keys[code].normal.length).toBeGreaterThan(0);
      }
    }
  });
});
```

`tests/layouts/reverse.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { findKeyForChar } from "@/lib/layouts/reverse";
import { kedmanee } from "@/lib/layouts/kedmanee";

describe("findKeyForChar", () => {
  it("finds the code for a normal char", () => {
    expect(findKeyForChar(kedmanee, "ก")).toEqual({ code: "KeyD", shift: false });
  });
  it("finds the code + shift for a shifted char", () => {
    expect(findKeyForChar(kedmanee, "ฤ")).toEqual({ code: "KeyA", shift: true });
  });
  it("returns null for an unmapped char", () => {
    expect(findKeyForChar(kedmanee, "Z")).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/layouts/`
Expected: FAIL — modules not found (existing `resolve.test.ts` still passes).

- [ ] **Step 3: Implement `geometry.ts`**

```ts
// Physical key rows in KeyboardEvent.code order (ANSI). Used to render the on-screen keyboard.
export const KEYBOARD_ROWS: string[][] = [
  ["Backquote", "Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7", "Digit8", "Digit9", "Digit0", "Minus", "Equal"],
  ["KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU", "KeyI", "KeyO", "KeyP", "BracketLeft", "BracketRight", "Backslash"],
  ["KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyK", "KeyL", "Semicolon", "Quote"],
  ["KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM", "Comma", "Period", "Slash"],
  ["Space"],
];
```

- [ ] **Step 4: Implement `pattachote.ts` and `manoonchai.ts`**

Use the same `Layout` type as `kedmanee.ts` (`import type { Layout } from "./types";`). Produce COMPLETE, source-verified maps covering every code in `KEYBOARD_ROWS` (except `Space`, which maps to `" "`). Match `kedmanee.ts`'s `finger`/`row` per code. Export `export const pattachote: Layout = {...}` and `export const manoonchai: Layout = {...}`.

The home-row anchor that the registry test enforces: each layout must define KeyA..KeyL + Semicolon + Quote with non-empty `normal`. Include the number row and remaining letters too for the keyboard to render fully.

- [ ] **Step 5: Implement `registry.ts`**

```ts
import type { Layout } from "./types";
import { kedmanee } from "./kedmanee";
import { pattachote } from "./pattachote";
import { manoonchai } from "./manoonchai";

export type LayoutId = "kedmanee" | "pattachote" | "manoonchai";

export const LAYOUTS: Record<LayoutId, Layout> = { kedmanee, pattachote, manoonchai };

export function getLayout(id: LayoutId): Layout {
  return LAYOUTS[id];
}

export function layoutList(): { id: LayoutId; name: string }[] {
  return (Object.keys(LAYOUTS) as LayoutId[]).map((id) => ({ id, name: LAYOUTS[id].name }));
}
```

- [ ] **Step 6: Implement `reverse.ts`**

```ts
import type { Layout } from "./types";

export function findKeyForChar(layout: Layout, char: string): { code: string; shift: boolean } | null {
  for (const [code, def] of Object.entries(layout.keys)) {
    if (def.normal === char) return { code, shift: false };
  }
  for (const [code, def] of Object.entries(layout.keys)) {
    if (def.shift === char) return { code, shift: true };
  }
  return null;
}
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `npx vitest run tests/layouts/`
Expected: PASS (resolve 3 + registry 4 + reverse 3 = 10).

- [ ] **Step 8: Type-check the layout files**

Run: `npx tsc --noEmit`
Expected: no errors in `lib/layouts/`.

Return summary: files created, pass count, and the SOURCES you used for Pattachote + Manoonchai (URLs), plus any code that has no mapping in a source (leave it out rather than invent).

### Task 5 (Agent B): Per-character key stats

**Files:**
- Create: `lib/engine/keyStats.ts`
- Test: `tests/engine/keyStats.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { errorCountsByChar } from "@/lib/engine/keyStats";
import type { Keystroke } from "@/lib/engine/types";

function ks(expected: string, actual: string, t: number): Keystroke {
  return { expected, actual, correct: expected === actual, t };
}

describe("errorCountsByChar", () => {
  it("counts incorrect keystrokes keyed by expected char", () => {
    const strokes = [ks("ก", "ก", 1), ks("า", "ก", 2), ks("า", "ก", 3)];
    const counts = errorCountsByChar(strokes);
    expect(counts.get("า")).toBe(2);
    expect(counts.has("ก")).toBe(false);
  });
  it("returns an empty map for no strokes", () => {
    expect(errorCountsByChar([]).size).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/engine/keyStats.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

```ts
import type { Keystroke } from "./types";

// Map of expected-character -> number of times it was typed incorrectly.
export function errorCountsByChar(strokes: Keystroke[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const s of strokes) {
    if (!s.correct) counts.set(s.expected, (counts.get(s.expected) ?? 0) + 1);
  }
  return counts;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/engine/keyStats.test.ts`
Expected: PASS (2 tests).

Return summary: file created, pass count. Do NOT touch any other file. Do NOT commit.

### Task 6 (Agent C): Settings schema + store (layout + input mode)

**Files:**
- Modify: `lib/storage/schema.ts`, `stores/settingsStore.ts`
- Test: `tests/storage/storage.test.ts` (extend), `tests/stores/settingsStore.test.ts` (extend)

- [ ] **Step 1: Update `lib/storage/schema.ts`**

Change `layoutId` to a three-way union and import the `LayoutId` type. New contents:

```ts
import type { LayoutId } from "@/lib/layouts/registry";

export const SCHEMA_VERSION = 1;

export type TestMode = "time" | "words";
export type InputMode = "app-remap" | "os-native";

export interface Settings {
  mode: TestMode;
  duration: number;
  wordCount: number;
  inputMode: InputMode;
  layoutId: LayoutId;
}

export const DEFAULT_SETTINGS: Settings = {
  mode: "time",
  duration: 30,
  wordCount: 25,
  inputMode: "app-remap",
  layoutId: "kedmanee",
};
```

- [ ] **Step 2: Extend the storage test**

Add to `tests/storage/storage.test.ts` inside the existing `describe`:

```ts
  it("round-trips layout + input mode", () => {
    const next = { ...DEFAULT_SETTINGS, layoutId: "manoonchai" as const, inputMode: "os-native" as const };
    saveSettings(next);
    expect(loadSettings()).toEqual(next);
  });
```

- [ ] **Step 3: Run storage test (expect pass — schema already supports it)**

Run: `npx vitest run tests/storage/`
Expected: PASS (5 tests). If `LayoutId` import breaks resolution, confirm the alias works (it does in vitest config).

- [ ] **Step 4: Update the store test**

Add to `tests/stores/settingsStore.test.ts`:

```ts
  it("setLayout and setInputMode persist", () => {
    useSettings.getState().setLayout("pattachote");
    useSettings.getState().setInputMode("os-native");
    expect(useSettings.getState().layoutId).toBe("pattachote");
    expect(useSettings.getState().inputMode).toBe("os-native");
    const raw = JSON.parse(localStorage.getItem("thaitype:settings")!);
    expect(raw.data.layoutId).toBe("pattachote");
    expect(raw.data.inputMode).toBe("os-native");
  });
```

- [ ] **Step 5: Run store test to verify it fails**

Run: `npx vitest run tests/stores/`
Expected: FAIL — `setLayout`/`setInputMode` do not exist.

- [ ] **Step 6: Update `stores/settingsStore.ts`**

```ts
import { create } from "zustand";
import { loadSettings, saveSettings } from "@/lib/storage/storage";
import type { Settings, TestMode, InputMode } from "@/lib/storage/schema";
import type { LayoutId } from "@/lib/layouts/registry";

interface SettingsState extends Settings {
  setMode(m: TestMode): void;
  setDuration(s: number): void;
  setWordCount(n: number): void;
  setLayout(id: LayoutId): void;
  setInputMode(m: InputMode): void;
}

export const useSettings = create<SettingsState>((set, get) => ({
  ...loadSettings(),
  setMode(m) { set({ mode: m }); saveSettings(snapshot(get())); },
  setDuration(s) { set({ duration: s }); saveSettings(snapshot(get())); },
  setWordCount(n) { set({ wordCount: n }); saveSettings(snapshot(get())); },
  setLayout(id) { set({ layoutId: id }); saveSettings(snapshot(get())); },
  setInputMode(m) { set({ inputMode: m }); saveSettings(snapshot(get())); },
}));

function snapshot(s: Settings): Settings {
  return {
    mode: s.mode,
    duration: s.duration,
    wordCount: s.wordCount,
    inputMode: s.inputMode,
    layoutId: s.layoutId,
  };
}
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `npx vitest run tests/storage/ tests/stores/`
Expected: PASS (5 + 2 = 7).

Return summary: files changed, pass count. Do NOT touch files outside `lib/storage/` and `stores/`. Do NOT commit.

---

## WAVE 2 (sequential — integration, coordinator)

### Task 7: Keyboard component

**Files:**
- Create: `components/Keyboard.tsx`
- Test: `tests/components/Keyboard.test.tsx`

`Keyboard` renders `KEYBOARD_ROWS`, shows each code's `normal` char from the active layout, colors by finger zone, highlights the next key (reverse-lookup of the next target char), and tints keys by error count (heatmap).

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Keyboard } from "@/components/Keyboard";
import { kedmanee } from "@/lib/layouts/kedmanee";

describe("Keyboard", () => {
  it("renders a key per geometry code with the layout char", () => {
    render(<Keyboard layout={kedmanee} nextChar={null} errorCounts={new Map()} />);
    // KeyD -> ก in kedmanee
    const keyD = screen.getByTestId("key-KeyD");
    expect(keyD.textContent).toContain("ก");
  });
  it("marks the next key when nextChar resolves", () => {
    render(<Keyboard layout={kedmanee} nextChar="ก" errorCounts={new Map()} />);
    expect(screen.getByTestId("key-KeyD").dataset.next).toBe("true");
  });
  it("does not mark any next key when nextChar is null", () => {
    render(<Keyboard layout={kedmanee} nextChar={null} errorCounts={new Map()} />);
    expect(screen.getByTestId("key-KeyD").dataset.next).toBe("false");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/Keyboard.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `components/Keyboard.tsx`**

```tsx
import { KEYBOARD_ROWS } from "@/lib/layouts/geometry";
import { findKeyForChar } from "@/lib/layouts/reverse";
import type { Layout } from "@/lib/layouts/types";

const FINGER_COLOR: Record<string, string> = {
  "left-pinky": "#5b8def",
  "left-ring": "#43b581",
  "left-middle": "#e2b714",
  "left-index": "#e67e22",
  "right-index": "#e74c3c",
  "right-middle": "#9b59b6",
  "right-ring": "#1abc9c",
  "right-pinky": "#3498db",
};

interface KeyboardProps {
  layout: Layout;
  nextChar: string | null;
  errorCounts: Map<string, number>;
}

export function Keyboard({ layout, nextChar, errorCounts }: KeyboardProps) {
  const nextKey = nextChar ? findKeyForChar(layout, nextChar) : null;
  const maxErr = Math.max(1, ...Array.from(errorCounts.values()));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center", marginTop: 32 }}>
      {KEYBOARD_ROWS.map((row, ri) => (
        <div key={ri} style={{ display: "flex", gap: 6 }}>
          {row.map((code) => {
            const def = layout.keys[code];
            const isNext = nextKey?.code === code;
            const errs = def ? (errorCounts.get(def.normal) ?? 0) : 0;
            const heat = errs / maxErr; // 0..1
            const isSpace = code === "Space";
            return (
              <div
                key={code}
                data-testid={`key-${code}`}
                data-next={isNext ? "true" : "false"}
                style={{
                  width: isSpace ? 280 : 38,
                  height: 38,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 6,
                  fontSize: 14,
                  color: "var(--text-typed)",
                  background: errs > 0 ? `rgba(202,71,84,${0.15 + heat * 0.55})` : "var(--bg)",
                  border: isNext ? "2px solid var(--accent)" : "1px solid #3a3c3f",
                  borderBottom: def ? `3px solid ${FINGER_COLOR[def.finger] ?? "#3a3c3f"}` : "1px solid #3a3c3f",
                  boxShadow: isNext ? "0 0 12px var(--accent)" : "none",
                  transform: isNext ? "translateY(-2px)" : "none",
                  transition: "transform 120ms, box-shadow 120ms",
                }}
              >
                {def && !isSpace ? def.normal : ""}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/components/Keyboard.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add components/Keyboard.tsx tests/components/Keyboard.test.tsx
git commit -m "feat(ui): on-screen keyboard with finger zones, next-key hint, heatmap"
```

---

### Task 8: LayoutBar control

**Files:**
- Create: `components/LayoutBar.tsx`
- Test: `tests/components/LayoutBar.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LayoutBar } from "@/components/LayoutBar";
import { useSettings } from "@/stores/settingsStore";

beforeEach(() => localStorage.clear());

describe("LayoutBar", () => {
  it("renders all three layouts and switches on click", () => {
    render(<LayoutBar />);
    fireEvent.click(screen.getByText("Pattachote"));
    expect(useSettings.getState().layoutId).toBe("pattachote");
  });
  it("toggles input mode", () => {
    render(<LayoutBar />);
    fireEvent.click(screen.getByText(/os layout/i));
    expect(useSettings.getState().inputMode).toBe("os-native");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/LayoutBar.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `components/LayoutBar.tsx`**

```tsx
"use client";
import { useSettings } from "@/stores/settingsStore";
import { layoutList } from "@/lib/layouts/registry";

export function LayoutBar() {
  const { layoutId, inputMode, setLayout, setInputMode } = useSettings();
  return (
    <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 16, fontSize: 14 }}>
      {layoutList().map((l) => (
        <button
          key={l.id}
          onClick={() => setLayout(l.id)}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: layoutId === l.id ? "var(--accent)" : "var(--text)",
          }}
        >
          {l.name}
        </button>
      ))}
      <span style={{ opacity: 0.3 }}>|</span>
      <button
        onClick={() => setInputMode(inputMode === "app-remap" ? "os-native" : "app-remap")}
        style={{ background: "transparent", border: "1px solid var(--text)", borderRadius: 4, cursor: "pointer", color: "var(--text)", padding: "2px 8px" }}
      >
        {inputMode === "app-remap" ? "app remap" : "os layout"}
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/components/LayoutBar.test.tsx`
Expected: PASS (2 tests). The toggle button label is "app remap" by default; clicking switches to os-native and the label becomes "os layout". The second test clicks the button (matched by its default `/os layout/i`? No — default label is "app remap"). FIX the test matcher: the button initially reads "app remap"; match it by role instead. Use:

```tsx
  it("toggles input mode", () => {
    render(<LayoutBar />);
    fireEvent.click(screen.getByRole("button", { name: /app remap/i }));
    expect(useSettings.getState().inputMode).toBe("os-native");
  });
```

Apply that corrected test, then run again — Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/LayoutBar.tsx tests/components/LayoutBar.test.tsx
git commit -m "feat(ui): layout + input-mode selector"
```

---

### Task 9: TestScreen integration

**Files:**
- Modify: `components/TestScreen.tsx`
- Test: `tests/components/TestScreen.test.tsx` (extend)

Wire: active layout from settings; app-remap vs os-native input; render `LayoutBar` + `Keyboard`; pass `text` to `Words`; compute `nextChar` (target char at cursor) + `errorCounts`.

- [ ] **Step 1: Extend the test**

Replace `tests/components/TestScreen.test.tsx` with:

```tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TestScreen } from "@/components/TestScreen";
import { useSettings } from "@/stores/settingsStore";

beforeEach(() => localStorage.clear());

function typeCode(code: string) {
  fireEvent.keyDown(window, { code, shiftKey: false });
}
function typeKey(key: string) {
  fireEvent.keyDown(window, { key });
}

describe("TestScreen", () => {
  it("renders target characters and advances on correct app-remap key", () => {
    render(<TestScreen />);
    expect(screen.getAllByTestId("char").length).toBeGreaterThan(0);
    typeCode("KeyD");
    expect(screen.getAllByTestId("char").some((e) => e.dataset.cursor === "true")).toBe(true);
  });

  it("finishes a words test and shows results (app-remap)", () => {
    render(<TestScreen testText="ก" />);
    typeCode("KeyD"); // KeyD -> ก in kedmanee
    expect(screen.getByText("next test")).toBeInTheDocument();
  });

  it("renders the on-screen keyboard", () => {
    render(<TestScreen testText="ก" />);
    expect(screen.getByTestId("key-KeyD")).toBeInTheDocument();
  });

  it("accepts os-native input when inputMode is os-native", () => {
    useSettings.getState().setInputMode("os-native");
    render(<TestScreen testText="ก" />);
    typeKey("ก"); // OS already produced the Thai char
    expect(screen.getByText("next test")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/TestScreen.test.tsx`
Expected: FAIL — no `key-KeyD`, os-native path not handled.

- [ ] **Step 3: Update `components/TestScreen.tsx`**

```tsx
"use client";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useSettings } from "@/stores/settingsStore";
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

export function TestScreen({ testText }: { testText?: string }) {
  const { mode, duration, wordCount, layoutId, inputMode } = useSettings();
  const layout = getLayout(layoutId);
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
        // OS already produced the Thai character; accept single-grapheme keys only.
        char = ev.key.length === 1 || (ev.key.length > 0 && ev.key !== "Dead" && /\p{L}|\p{M}/u.test(ev.key) && ev.key.length <= 2) ? ev.key : null;
        if (ev.key === "Shift" || ev.key === "Backspace" || ev.key === "Enter" || ev.key === "Tab" || ev.key === "Alt" || ev.key === "Control" || ev.key === "Meta" || ev.key === "CapsLock" || ev.key === "Dead") char = null;
      } else {
        char = resolveKey(layout, ev.code, ev.shiftKey);
      }
      if (char === null) return;
      ev.preventDefault();
      e.press(char);
      const s = e.snapshot();
      setSnap(s);
      if (s.finished) {
        const elapsed = s.keystrokes.length ? s.keystrokes[s.keystrokes.length - 1].t : 0;
        setMetrics(computeMetrics(s.keystrokes, elapsed));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [metrics, inputMode, layout]);

  const liveWpm = useMemo(() => {
    if (!snap || !snap.startedAt) return 0;
    const elapsed = snap.keystrokes.length ? snap.keystrokes[snap.keystrokes.length - 1].t : 1;
    return computeMetrics(snap.keystrokes, elapsed).wpm;
  }, [snap]);
  const liveAcc = useMemo(() => (snap ? computeMetrics(snap.keystrokes, 1).accuracy : 0), [snap]);

  const nextChar = snap && !snap.finished && snap.cursor < snap.cells.length ? snap.cells[snap.cursor].target : null;
  const errorCounts = useMemo(() => (snap ? errorCountsByChar(snap.keystrokes) : new Map<string, number>()), [snap]);

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
      <div style={{ marginTop: 24 }}>{snap && <Words cells={snap.cells} cursor={snap.cursor} text={target} />}</div>
      <Keyboard layout={layout} nextChar={inputMode === "app-remap" ? nextChar : null} errorCounts={errorCounts} />
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/components/TestScreen.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Run the full unit suite**

Run: `npm run test`
Expected: all pass (engine, layouts, text, storage, theme, stores, components).

- [ ] **Step 6: Commit**

```bash
git add components/TestScreen.tsx tests/components/TestScreen.test.tsx
git commit -m "feat(ui): TestScreen — active layout, os-native input, keyboard + heatmap"
```

---

### Task 10: Build + E2E layout switch

**Files:**
- Create: `e2e/layout-switch.spec.ts`

- [ ] **Step 1: Write the E2E test**

```ts
import { test, expect } from "@playwright/test";

test("switches layout and shows on-screen keyboard", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("key-KeyD")).toBeVisible();
  const kedChar = await page.getByTestId("key-KeyD").textContent();
  await page.getByText("Pattachote", { exact: true }).click();
  // KeyD shows a different character under Pattachote
  await expect(page.getByTestId("key-KeyD")).not.toHaveText(kedChar ?? "");
});

test("runs a words test in app-remap mode", async ({ page }) => {
  await page.goto("/");
  await page.getByText("words", { exact: true }).click();
  await page.getByText("10", { exact: true }).click();
  for (let i = 0; i < 400; i++) {
    await page.keyboard.press("KeyD");
    if (await page.getByText("next test").isVisible().catch(() => false)) break;
  }
  await expect(page.getByText("next test")).toBeVisible();
});
```

> If Pattachote happens to map `KeyD` to the same character as Kedmanee (unlikely but possible), change the asserted key in the first test to one that differs between the two layouts, based on the data Agent A produced.

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: success, no type errors. (This is the first build since Wave 0 — the `Words` `text` prop is now supplied by TestScreen, so the Task 3 NOTE is resolved.)

- [ ] **Step 3: Run E2E**

Run: `npm run e2e`
Expected: all e2e specs pass (Plan 1 `test-run` + Plan 2 `layout-switch`).

- [ ] **Step 4: Commit**

```bash
git add e2e/layout-switch.spec.ts
git commit -m "test(e2e): layout switch + on-screen keyboard"
```

---

## Self-Review Notes

- **Spec coverage (Plan 2 scope):** three layouts (Task 4) ✓; layout selector (Task 8) ✓; on-screen keyboard with finger zones + next-key hint + error heatmap (Tasks 7, 9) ✓; OS-native input mode (Tasks 6, 9) ✓; combining-mark correctness via char-level compare + cluster display (Tasks 1–3) ✓.
- **Engine model change is intentional and sequenced first** so Wave 1/2 build on the corrected contract. The Task 3 NOTE documents the temporary `Words` call-site gap, closed in Task 9; build is deferred to Task 10.
- **Parallel safety:** Wave 1 agents own disjoint dirs — A: `lib/layouts/` (+ its tests); B: `lib/engine/keyStats.ts` (+ its test, a NEW file, no overlap with Wave 0's edits to compare/display); C: `lib/storage/schema.ts` + `stores/settingsStore.ts` (+ their tests). No file is written by two agents. Shared *type* contracts (`LayoutId`, `Layout`, `Keystroke`) are defined in one place and only imported elsewhere.
- **Type consistency:** `findKeyForChar` → `{code, shift}`; `errorCountsByChar` → `Map<string, number>`; `getLayout(LayoutId)`; `Keyboard` props `{layout, nextChar, errorCounts}`; `Words` props `{cells, cursor, text}`. Names used identically across tasks.
- **Data integrity:** Pattachote/Manoonchai maps are fetched from authoritative sources by Agent A, not invented; the registry test enforces presence of home-row keys, and Agent A reports its sources.
- **Deferred to later plans:** curriculum/adaptive (Plan 3); theme studio (Plan 4); stats history + wpm graph (Plan 5). Backspace/word-skip behavior is out of scope here.
```
