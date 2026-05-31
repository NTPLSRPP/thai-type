# Plan 4 — Theme Studio

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A full theme system — bundled preset pack (gradient/atmosphere, incl. vaporwave/pastel/neon), a custom theme editor (every color, Thai font, caret style, sound, uploaded background image with blur + overlay), import/export as JSON + short code, persisted locally (metadata in localStorage, image blobs in IndexedDB), applied app-wide.

**Architecture:** A theme is a JSON object of CSS-variable values plus caret/sound/background fields. A client `ThemeProvider` writes the active theme's vars onto `:root` and renders an optional background-image layer (blurred, with a readable overlay) sourced from IndexedDB. Preset themes use CSS gradients (zero bundled image assets); user "anime" themes come from uploading a wallpaper in the editor. Theme metadata persists in localStorage; image blobs persist in IndexedDB via `idb-keyval`.

**Tech Stack:** Next.js 16, TypeScript, Zustand, `idb-keyval`, Vitest + @testing-library/react, Playwright. Builds on Plans 1–3.

**Prerequisite:** Plans 1–3 complete and green (77 unit tests, build, 5 e2e).

---

## File Structure

```
lib/theme/
  types.ts          NEW: Theme, ThemeBackground, CaretStyle, SoundId
  minimalDark.ts    MODIFY: conform to full Theme shape
  apply.ts          MODIFY: still writes vars (unchanged behavior, new import path)
  presets.ts        NEW: PRESETS (~12) gradient/atmosphere themes
  serialize.ts      NEW: export/import theme <-> JSON + short code, validate
  fonts.ts          NEW: Thai font picker options (font stacks, no web download)
lib/storage/
  imageStore.ts     NEW: IndexedDB blob store (idb-keyval)
  themeStorage.ts   NEW: persist custom themes + active id (localStorage)
stores/
  themeStore.ts     NEW: active theme, presets+customs, actions
components/
  ThemeProvider.tsx NEW: applies vars + background layer (client)
  ThemeStudio.tsx   NEW: theme grid + import/export + entry to editor
  ThemeEditor.tsx   NEW: edit a draft theme
  ThemePreview.tsx  NEW: live mini preview of a theme
  Words.tsx         MODIFY: caretStyle prop (line|block|underline)
  NavBar.tsx        MODIFY: add "themes" link
  TestScreen.tsx    MODIFY: pass active caretStyle to Words
  LessonRunner.tsx  MODIFY: pass active caretStyle to Words
app/
  layout.tsx        MODIFY: wrap children in ThemeProvider
  themes/page.tsx   NEW: theme studio route
e2e/
  theme.spec.ts     NEW: switch preset + create custom theme
```

---

## WAVE 0 (sequential — schema + deps, coordinator, do first)

### Task 0: Dependency + theme types

**Files:**
- Create: `lib/theme/types.ts`
- Modify: `lib/theme/minimalDark.ts`, `lib/theme/apply.ts`, `tests/theme/apply.test.ts`

- [ ] **Step 1: Install idb-keyval**

```bash
npm i idb-keyval
```

- [ ] **Step 2: Create `lib/theme/types.ts`**

```ts
export type CaretStyle = "line" | "block" | "underline";
export type SoundId = "off" | "click";

export interface ThemeBackground {
  imageRef: string; // IndexedDB key
  blur: number; // px
  overlayOpacity: number; // 0..1, overlay uses --bg so text stays readable
}

export interface Theme {
  id: string;
  name: string;
  vars: Record<string, string>; // CSS custom properties incl. --bg, --text, --accent, --font, ...
  caretStyle: CaretStyle;
  sound: SoundId;
  background: ThemeBackground | null;
  builtin?: boolean;
}
```

- [ ] **Step 3: Conform `lib/theme/minimalDark.ts`**

```ts
import type { Theme } from "./types";

export type { Theme } from "./types";

export const minimalDark: Theme = {
  id: "minimal-dark",
  name: "Minimal Dark",
  builtin: true,
  caretStyle: "line",
  sound: "off",
  background: null,
  vars: {
    "--bg": "#2c2e31",
    "--text": "#646669",
    "--text-typed": "#d1d0c5",
    "--accent": "#e2b714",
    "--error": "#ca4754",
    "--caret": "#e2b714",
    "--font": "'JetBrains Mono', ui-monospace, monospace",
  },
};
```

- [ ] **Step 4: Update `lib/theme/apply.ts`** (import from types; behavior unchanged)

```ts
import type { Theme } from "./types";

export function applyTheme(theme: Theme, root: HTMLElement): void {
  for (const [k, v] of Object.entries(theme.vars)) root.style.setProperty(k, v);
}
```

- [ ] **Step 5: Update `tests/theme/apply.test.ts`** import (minimalDark still exports the same object)

The existing test imports `{ minimalDark }` from `@/lib/theme/minimalDark` and `{ applyTheme }` from `@/lib/theme/apply`. Those still exist. Run it:

Run: `npx vitest run tests/theme/apply.test.ts`
Expected: PASS (1 test) — `minimalDark.vars["--bg"]` and `--accent` unchanged.

- [ ] **Step 6: Full suite sanity + commit**

Run: `npm run test` → all pass (no behavior change, only added fields).
```bash
git add lib/theme package.json package-lock.json tests/theme/apply.test.ts
git commit -m "feat(theme): full Theme schema + idb-keyval dep"
```

---

## WAVE 1 (parallel — five disjoint leaf modules; run via Workflow)

Each module owns its own NEW files + tests, imports only the `Theme` type (and `idb-keyval`), has no cross-dependency on the others, runs its own tests, does NOT git commit.

### Task 1: Preset pack

**Files:** Create `lib/theme/presets.ts`, `tests/theme/presets.test.ts`

Presets are gradient/atmosphere themes — `--bg` may be a CSS gradient. No image assets. All `builtin: true`, `background: null`.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { PRESETS, presetById } from "@/lib/theme/presets";

describe("presets", () => {
  it("ships at least 12 builtin presets including minimal-dark", () => {
    expect(PRESETS.length).toBeGreaterThanOrEqual(12);
    expect(PRESETS.some((p) => p.id === "minimal-dark")).toBe(true);
    expect(PRESETS.every((p) => p.builtin === true)).toBe(true);
  });
  it("every preset defines the core vars + caret + sound", () => {
    for (const p of PRESETS) {
      for (const v of ["--bg", "--text", "--text-typed", "--accent", "--error", "--caret", "--font"]) {
        expect(p.vars[v], `${p.id} missing ${v}`).toBeTruthy();
      }
      expect(["line", "block", "underline"]).toContain(p.caretStyle);
      expect(["off", "click"]).toContain(p.sound);
    }
  });
  it("presetById finds and misses correctly", () => {
    expect(presetById("minimal-dark")?.id).toBe("minimal-dark");
    expect(presetById("nope")).toBeUndefined();
  });
  it("ids are unique", () => {
    expect(new Set(PRESETS.map((p) => p.id)).size).toBe(PRESETS.length);
  });
});
```

- [ ] **Step 2: Run → fail.** `npx vitest run tests/theme/presets.test.ts` (module not found).

- [ ] **Step 3: Implement `lib/theme/presets.ts`**

Import `minimalDark` and build the rest. Provide ~12 distinct, intentional themes (light + dark + gradient). Example skeleton — fill all entries with real, harmonious colors (use this structure; the test enforces vars + count + uniqueness):

```ts
import type { Theme } from "./types";
import { minimalDark } from "./minimalDark";

const MONO = "'JetBrains Mono', ui-monospace, monospace";
const SANS_TH = "'Noto Sans Thai', 'Sarabun', system-ui, sans-serif";

function t(
  id: string,
  name: string,
  vars: Record<string, string>,
  caretStyle: Theme["caretStyle"] = "line",
): Theme {
  return { id, name, builtin: true, caretStyle, sound: "off", background: null, vars };
}

export const PRESETS: Theme[] = [
  minimalDark,
  t("minimal-light", "Minimal Light", {
    "--bg": "#eaeaea", "--text": "#9b9b9b", "--text-typed": "#1a1a1a",
    "--accent": "#2b7fff", "--error": "#d33", "--caret": "#2b7fff", "--font": MONO,
  }),
  t("terminal", "Terminal", {
    "--bg": "#0a0e12", "--text": "#2f6b4f", "--text-typed": "#39ff8a",
    "--accent": "#39ff8a", "--error": "#ff5555", "--caret": "#39ff8a", "--font": MONO,
  }, "block"),
  t("editorial", "Editorial", {
    "--bg": "#f4efe6", "--text": "#8a7f6d", "--text-typed": "#2b2520",
    "--accent": "#c0492b", "--error": "#b3261e", "--caret": "#c0492b", "--font": SANS_TH,
  }, "underline"),
  t("vaporwave", "Vaporwave", {
    "--bg": "linear-gradient(135deg,#2b1055,#7597de)", "--text": "#b39ddb", "--text-typed": "#fff0f5",
    "--accent": "#ff71ce", "--error": "#ff3860", "--caret": "#01cdfe", "--font": MONO,
  }),
  t("pastel", "Pastel", {
    "--bg": "linear-gradient(135deg,#fde2e4,#e2ece9)", "--text": "#a59aab", "--text-typed": "#5b5266",
    "--accent": "#ff8fab", "--error": "#e5616b", "--caret": "#ff8fab", "--font": SANS_TH,
  }),
  t("sunset", "Sunset", {
    "--bg": "linear-gradient(135deg,#ff7e5f,#feb47b)", "--text": "#7a4a3a", "--text-typed": "#2b1a12",
    "--accent": "#c0392b", "--error": "#922b21", "--caret": "#c0392b", "--font": SANS_TH,
  }),
  t("neon", "Neon", {
    "--bg": "#0d0221", "--text": "#5a3a8a", "--text-typed": "#e0aaff",
    "--accent": "#c77dff", "--error": "#ff2965", "--caret": "#c77dff", "--font": MONO,
  }, "block"),
  t("forest", "Forest", {
    "--bg": "#10241b", "--text": "#5c7a6a", "--text-typed": "#cfe8d8",
    "--accent": "#7bd389", "--error": "#e07a5f", "--caret": "#7bd389", "--font": SANS_TH,
  }),
  t("ocean", "Ocean", {
    "--bg": "linear-gradient(135deg,#0f2027,#203a43,#2c5364)", "--text": "#5e8a9a", "--text-typed": "#d6f1ff",
    "--accent": "#48cae4", "--error": "#ef476f", "--caret": "#48cae4", "--font": MONO,
  }),
  t("mocha", "Mocha", {
    "--bg": "#1e1e2e", "--text": "#6c7086", "--text-typed": "#cdd6f4",
    "--accent": "#f5c2e7", "--error": "#f38ba8", "--caret": "#f5c2e7", "--font": MONO,
  }),
  t("paper", "Paper", {
    "--bg": "#fbf7f0", "--text": "#b8ae9e", "--text-typed": "#3a3530",
    "--accent": "#e09f3e", "--error": "#9e2a2b", "--caret": "#e09f3e", "--font": SANS_TH,
  }, "underline"),
];

export function presetById(id: string): Theme | undefined {
  return PRESETS.find((p) => p.id === id);
}
```

- [ ] **Step 4: Run → pass (4 tests).**

### Task 2: Serialize / import-export

**Files:** Create `lib/theme/serialize.ts`, `tests/theme/serialize.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { exportThemeJSON, exportThemeCode, importThemeJSON, importThemeCode } from "@/lib/theme/serialize";
import { minimalDark } from "@/lib/theme/minimalDark";

describe("theme serialize", () => {
  it("round-trips JSON", () => {
    const json = exportThemeJSON(minimalDark);
    const back = importThemeJSON(json);
    expect(back?.vars["--accent"]).toBe(minimalDark.vars["--accent"]);
    expect(back?.caretStyle).toBe(minimalDark.caretStyle);
  });
  it("round-trips a short code", () => {
    const code = exportThemeCode(minimalDark);
    const back = importThemeCode(code);
    expect(back?.name).toBe(minimalDark.name);
  });
  it("strips builtin and assigns a fresh id on import", () => {
    const back = importThemeJSON(exportThemeJSON(minimalDark));
    expect(back?.builtin).toBeUndefined();
    expect(back?.id).not.toBe(minimalDark.id);
  });
  it("rejects invalid input", () => {
    expect(importThemeJSON("{garbage")).toBeNull();
    expect(importThemeJSON(JSON.stringify({ name: "x" }))).toBeNull(); // missing vars
    expect(importThemeCode("not-base64!!")).toBeNull();
  });
});
```

- [ ] **Step 2: Run → fail.**

- [ ] **Step 3: Implement `lib/theme/serialize.ts`**

```ts
import type { CaretStyle, SoundId, Theme } from "./types";

const CARETS: CaretStyle[] = ["line", "block", "underline"];
const SOUNDS: SoundId[] = ["off", "click"];

let counter = 0;
function freshId(): string {
  counter += 1;
  return `custom-${counter}-${exportCounterSeed()}`;
}
// deterministic-enough unique seed without Date.now/Math.random in hot path
function exportCounterSeed(): string {
  return counter.toString(36) + (counter * 2654435761 % 1000000).toString(36);
}

export function validateTheme(obj: unknown): Theme | null {
  if (typeof obj !== "object" || obj === null) return null;
  const o = obj as Record<string, unknown>;
  if (typeof o.name !== "string" || typeof o.vars !== "object" || o.vars === null) return null;
  const vars = o.vars as Record<string, unknown>;
  for (const v of ["--bg", "--text", "--text-typed", "--accent", "--caret", "--font"]) {
    if (typeof vars[v] !== "string") return null;
  }
  const caretStyle = CARETS.includes(o.caretStyle as CaretStyle) ? (o.caretStyle as CaretStyle) : "line";
  const sound = SOUNDS.includes(o.sound as SoundId) ? (o.sound as SoundId) : "off";
  return {
    id: freshId(),
    name: o.name,
    vars: { ...(vars as Record<string, string>) },
    caretStyle,
    sound,
    background: null, // imported themes drop image refs (blob not portable via code)
  };
}

export function exportThemeJSON(theme: Theme): string {
  const { id: _id, builtin: _b, background: _bg, ...rest } = theme;
  return JSON.stringify(rest, null, 2);
}

export function importThemeJSON(json: string): Theme | null {
  try {
    return validateTheme(JSON.parse(json));
  } catch {
    return null;
  }
}

export function exportThemeCode(theme: Theme): string {
  return typeof btoa !== "undefined"
    ? btoa(unescape(encodeURIComponent(exportThemeJSON(theme))))
    : Buffer.from(exportThemeJSON(theme), "utf-8").toString("base64");
}

export function importThemeCode(code: string): Theme | null {
  try {
    const json =
      typeof atob !== "undefined"
        ? decodeURIComponent(escape(atob(code)))
        : Buffer.from(code, "base64").toString("utf-8");
    return importThemeJSON(json);
  } catch {
    return null;
  }
}
```

- [ ] **Step 4: Run → pass (4 tests).** If `importThemeCode("not-base64!!")` does not throw in this runtime (lenient atob), assert on the parsed result being null instead — adjust the test to feed a code that decodes to non-JSON, e.g. `btoa("garbage")`, and expect null.

### Task 3: Font options

**Files:** Create `lib/theme/fonts.ts`, `tests/theme/fonts.test.ts`

No web-font download — picker offers stacks of fonts users already have (Thai OS fonts + mono). Web-font loading deferred.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { FONT_OPTIONS } from "@/lib/theme/fonts";

describe("font options", () => {
  it("offers several Thai-capable font stacks", () => {
    expect(FONT_OPTIONS.length).toBeGreaterThanOrEqual(4);
    for (const f of FONT_OPTIONS) {
      expect(typeof f.label).toBe("string");
      expect(f.stack.length).toBeGreaterThan(0);
    }
  });
  it("includes the default monospace stack", () => {
    expect(FONT_OPTIONS.some((f) => f.stack.includes("JetBrains Mono"))).toBe(true);
  });
});
```

- [ ] **Step 2: Run → fail.**

- [ ] **Step 3: Implement `lib/theme/fonts.ts`**

```ts
export interface FontOption {
  label: string;
  stack: string;
}

export const FONT_OPTIONS: FontOption[] = [
  { label: "Mono (default)", stack: "'JetBrains Mono', ui-monospace, monospace" },
  { label: "Sarabun", stack: "'Sarabun', system-ui, sans-serif" },
  { label: "Noto Sans Thai", stack: "'Noto Sans Thai', system-ui, sans-serif" },
  { label: "Leelawadee / Thonburi", stack: "'Leelawadee UI', 'Thonburi', system-ui, sans-serif" },
  { label: "System", stack: "system-ui, -apple-system, sans-serif" },
];
```

- [ ] **Step 4: Run → pass (2 tests).**

### Task 4: IndexedDB image store

**Files:** Create `lib/storage/imageStore.ts`, `tests/storage/imageStore.test.ts`

jsdom has no IndexedDB, so the test mocks `idb-keyval` with an in-memory map.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const mem = new Map<string, unknown>();
vi.mock("idb-keyval", () => ({
  get: vi.fn(async (k: string) => mem.get(k)),
  set: vi.fn(async (k: string, v: unknown) => void mem.set(k, v)),
  del: vi.fn(async (k: string) => void mem.delete(k)),
}));

import { putImage, getImage, deleteImage } from "@/lib/storage/imageStore";

beforeEach(() => mem.clear());

describe("imageStore", () => {
  it("stores and retrieves a blob under an image key", async () => {
    const blob = new Blob(["x"], { type: "image/png" });
    await putImage("abc", blob);
    expect(await getImage("abc")).toBe(blob);
  });
  it("returns undefined for a missing key", async () => {
    expect(await getImage("missing")).toBeUndefined();
  });
  it("deletes a stored blob", async () => {
    await putImage("abc", new Blob(["x"]));
    await deleteImage("abc");
    expect(await getImage("abc")).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run → fail.**

- [ ] **Step 3: Implement `lib/storage/imageStore.ts`**

```ts
import { get, set, del } from "idb-keyval";

const PREFIX = "thaitype:img:";

export async function putImage(id: string, blob: Blob): Promise<void> {
  await set(PREFIX + id, blob);
}

export async function getImage(id: string): Promise<Blob | undefined> {
  return (await get(PREFIX + id)) as Blob | undefined;
}

export async function deleteImage(id: string): Promise<void> {
  await del(PREFIX + id);
}
```

- [ ] **Step 4: Run → pass (3 tests).**

### Task 5: Theme metadata storage

**Files:** Create `lib/storage/themeStorage.ts`, `tests/storage/themeStorage.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, beforeEach } from "vitest";
import {
  loadCustomThemes, saveCustomThemes, loadActiveId, saveActiveId, THEMES_KEY,
} from "@/lib/storage/themeStorage";
import type { Theme } from "@/lib/theme/types";

beforeEach(() => localStorage.clear());

const sample: Theme = {
  id: "custom-1", name: "Mine", caretStyle: "line", sound: "off", background: null,
  vars: { "--bg": "#000", "--text": "#777", "--text-typed": "#fff", "--accent": "#0f0", "--caret": "#0f0", "--font": "monospace" },
};

describe("theme storage", () => {
  it("returns [] and null when empty", () => {
    expect(loadCustomThemes()).toEqual([]);
    expect(loadActiveId()).toBeNull();
  });
  it("round-trips custom themes", () => {
    saveCustomThemes([sample]);
    expect(loadCustomThemes()).toEqual([sample]);
  });
  it("round-trips the active id", () => {
    saveActiveId("ocean");
    expect(loadActiveId()).toBe("ocean");
  });
  it("falls back to [] on corrupt data", () => {
    localStorage.setItem(THEMES_KEY, "{bad");
    expect(loadCustomThemes()).toEqual([]);
  });
});
```

- [ ] **Step 2: Run → fail.**

- [ ] **Step 3: Implement `lib/storage/themeStorage.ts`**

```ts
import type { Theme } from "@/lib/theme/types";

export const THEMES_KEY = "thaitype:themes";
export const ACTIVE_KEY = "thaitype:activetheme";
const VERSION = 1;

export function loadCustomThemes(): Theme[] {
  if (typeof localStorage === "undefined") return [];
  const raw = localStorage.getItem(THEMES_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as { v: number; data: Theme[] };
    if (parsed.v !== VERSION || !Array.isArray(parsed.data)) return [];
    return parsed.data;
  } catch {
    return [];
  }
}

export function saveCustomThemes(themes: Theme[]): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(THEMES_KEY, JSON.stringify({ v: VERSION, data: themes }));
}

export function loadActiveId(): string | null {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem(ACTIVE_KEY);
}

export function saveActiveId(id: string): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(ACTIVE_KEY, id);
}
```

- [ ] **Step 4: Run → pass (4 tests).**

---

## WAVE 2 (sequential — store, provider, editor, routes, wiring; coordinator)

### Task 6: themeStore

**Files:** Create `stores/themeStore.ts`, `tests/stores/themeStore.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { useTheme } from "@/stores/themeStore";
import type { Theme } from "@/lib/theme/types";

beforeEach(() => {
  localStorage.clear();
  useTheme.getState().reload();
});

const draft: Theme = {
  id: "tmp", name: "Mine", caretStyle: "block", sound: "off", background: null,
  vars: { "--bg": "#000", "--text": "#777", "--text-typed": "#fff", "--accent": "#0f0", "--caret": "#0f0", "--font": "monospace" },
};

describe("themeStore", () => {
  it("defaults active to minimal-dark and lists presets", () => {
    expect(useTheme.getState().activeId).toBe("minimal-dark");
    expect(useTheme.getState().allThemes().length).toBeGreaterThanOrEqual(12);
  });
  it("setActive persists", () => {
    useTheme.getState().setActive("ocean");
    expect(useTheme.getState().activeId).toBe("ocean");
    expect(localStorage.getItem("thaitype:activetheme")).toBe("ocean");
  });
  it("addCustom stores a theme with a fresh id and returns it", () => {
    const created = useTheme.getState().addCustom(draft);
    expect(created.id).not.toBe("tmp");
    expect(useTheme.getState().customs.some((t) => t.id === created.id)).toBe(true);
  });
  it("deleteCustom removes it", () => {
    const created = useTheme.getState().addCustom(draft);
    useTheme.getState().deleteCustom(created.id);
    expect(useTheme.getState().customs.some((t) => t.id === created.id)).toBe(false);
  });
  it("activeTheme() resolves preset or custom", () => {
    useTheme.getState().setActive("terminal");
    expect(useTheme.getState().activeTheme()?.id).toBe("terminal");
  });
});
```

- [ ] **Step 2: Run → fail.**

- [ ] **Step 3: Implement `stores/themeStore.ts`**

```ts
import { create } from "zustand";
import type { Theme } from "@/lib/theme/types";
import { PRESETS, presetById } from "@/lib/theme/presets";
import { loadCustomThemes, saveCustomThemes, loadActiveId, saveActiveId } from "@/lib/storage/themeStorage";

let idSeq = 0;
function freshId(): string {
  idSeq += 1;
  return `custom-${idSeq}-${(idSeq * 2654435761 % 1_000_000).toString(36)}`;
}

interface ThemeState {
  activeId: string;
  customs: Theme[];
  allThemes(): Theme[];
  activeTheme(): Theme | undefined;
  setActive(id: string): void;
  addCustom(draft: Theme): Theme;
  updateCustom(theme: Theme): void;
  deleteCustom(id: string): void;
  reload(): void;
}

export const useTheme = create<ThemeState>((set, get) => ({
  activeId: loadActiveId() ?? "minimal-dark",
  customs: loadCustomThemes(),
  allThemes() {
    return [...PRESETS, ...get().customs];
  },
  activeTheme() {
    const id = get().activeId;
    return presetById(id) ?? get().customs.find((t) => t.id === id);
  },
  setActive(id) {
    set({ activeId: id });
    saveActiveId(id);
  },
  addCustom(draft) {
    const theme: Theme = { ...draft, id: freshId(), builtin: false };
    const customs = [...get().customs, theme];
    set({ customs });
    saveCustomThemes(customs);
    return theme;
  },
  updateCustom(theme) {
    const customs = get().customs.map((t) => (t.id === theme.id ? theme : t));
    set({ customs });
    saveCustomThemes(customs);
  },
  deleteCustom(id) {
    const customs = get().customs.filter((t) => t.id !== id);
    set({ customs });
    saveCustomThemes(customs);
    if (get().activeId === id) get().setActive("minimal-dark");
  },
  reload() {
    set({ activeId: loadActiveId() ?? "minimal-dark", customs: loadCustomThemes() });
  },
}));
```

- [ ] **Step 4: Run → pass (5 tests).**

- [ ] **Step 5: Commit (Wave 1 + Wave 2 store)**

```bash
git add lib/theme/presets.ts lib/theme/serialize.ts lib/theme/fonts.ts lib/storage/imageStore.ts lib/storage/themeStorage.ts stores/themeStore.ts tests/theme/presets.test.ts tests/theme/serialize.test.ts tests/theme/fonts.test.ts tests/storage/imageStore.test.ts tests/storage/themeStorage.test.ts tests/stores/themeStore.test.ts
git commit -m "feat(theme): presets, serialize, fonts, image store, theme storage, theme store"
```

### Task 7: Words caret styles

**Files:** Modify `components/Words.tsx`, `tests/components/Words.test.tsx`

- [ ] **Step 1: Extend the test** — add to the existing `describe("Words")`:

```tsx
  it("renders a block caret at the cursor when caretStyle=block", () => {
    const cells = buildCells("กา");
    render(<Words cells={cells} cursor={0} text="กา" caretStyle="block" />);
    const cur = screen.getAllByTestId("char")[0];
    expect(cur.dataset.caret).toBe("block");
  });
  it("defaults to line caret", () => {
    const cells = buildCells("กา");
    render(<Words cells={cells} cursor={0} text="กา" />);
    expect(screen.getAllByTestId("char")[0].dataset.caret).toBe("line");
  });
```

- [ ] **Step 2: Run → fail** (no `data-caret`).

- [ ] **Step 3: Update `components/Words.tsx`** — add `caretStyle` prop and a `data-caret` attribute + style per cursor cell:

```tsx
import { groupClusters } from "@/lib/engine/display";
import type { CharCell } from "@/lib/engine/types";
import type { CaretStyle } from "@/lib/theme/types";

interface WordsProps {
  cells: CharCell[];
  cursor: number;
  text: string;
  caretStyle?: CaretStyle;
}

export function Words({ cells, cursor, text, caretStyle = "line" }: WordsProps) {
  const groups = groupClusters(cells, text);
  return (
    <div style={{ fontSize: 28, lineHeight: 1.8, letterSpacing: 1 }}>
      {groups.map((g, gi) => (
        <span key={gi} data-testid="cluster" style={{ display: "inline-block", whiteSpace: "pre" }}>
          {g.cells.map((c, k) => {
            const idx = g.indices[k];
            const isCursor = idx === cursor;
            const base: React.CSSProperties = {
              color:
                c.state === "correct"
                  ? "var(--text-typed)"
                  : c.state === "incorrect"
                    ? "var(--error)"
                    : "var(--text)",
            };
            if (isCursor && caretStyle === "line") base.borderLeft = "2px solid var(--caret)";
            else base.borderLeft = "2px solid transparent";
            if (isCursor && caretStyle === "underline") base.borderBottom = "2px solid var(--caret)";
            if (isCursor && caretStyle === "block") {
              base.background = "var(--caret)";
              base.color = "var(--bg)";
            }
            return (
              <span
                key={idx}
                data-testid="char"
                data-cursor={isCursor ? "true" : "false"}
                data-caret={isCursor ? caretStyle : "none"}
                className={c.state}
                style={base}
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

- [ ] **Step 4: Run → pass.** Existing Words tests still pass (`data-caret` defaults to "line" at cursor, "none" elsewhere).

### Task 8: ThemeProvider

**Files:** Create `components/ThemeProvider.tsx`, `tests/components/ThemeProvider.test.tsx`

Applies active theme vars to `:root` on mount + change; renders a blurred background layer with a readable overlay when the active theme has an uploaded image. Image blob → object URL via `imageStore`; URL revoked on change/unmount.

- [ ] **Step 1: Write the failing test** (mock imageStore; jsdom lacks createObjectURL)

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
vi.mock("@/lib/storage/imageStore", () => ({
  getImage: vi.fn(async () => undefined),
  putImage: vi.fn(),
  deleteImage: vi.fn(),
}));
import { ThemeProvider } from "@/components/ThemeProvider";
import { useTheme } from "@/stores/themeStore";

beforeEach(() => {
  localStorage.clear();
  useTheme.getState().reload();
  document.documentElement.style.cssText = "";
});

describe("ThemeProvider", () => {
  it("applies the active theme vars to :root", () => {
    useTheme.getState().setActive("terminal");
    render(<ThemeProvider><div /></ThemeProvider>);
    expect(document.documentElement.style.getPropertyValue("--accent")).toBe("#39ff8a");
  });
  it("renders its children", () => {
    const { getByTestId } = render(<ThemeProvider><div data-testid="kid" /></ThemeProvider>);
    expect(getByTestId("kid")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run → fail.**

- [ ] **Step 3: Implement `components/ThemeProvider.tsx`**

```tsx
"use client";
import { useEffect, useState } from "react";
import { useTheme } from "@/stores/themeStore";
import { applyTheme } from "@/lib/theme/apply";
import { getImage } from "@/lib/storage/imageStore";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const activeTheme = useTheme((s) => s.activeTheme);
  const activeId = useTheme((s) => s.activeId);
  const customs = useTheme((s) => s.customs);
  const theme = activeTheme();
  const [bgUrl, setBgUrl] = useState<string | null>(null);

  useEffect(() => {
    if (theme) applyTheme(theme, document.documentElement);
  }, [theme, activeId, customs]);

  useEffect(() => {
    let url: string | null = null;
    let cancelled = false;
    const ref = theme?.background?.imageRef;
    if (ref) {
      getImage(ref).then((blob) => {
        if (cancelled || !blob || typeof URL.createObjectURL !== "function") return;
        url = URL.createObjectURL(blob);
        setBgUrl(url);
      });
    } else {
      setBgUrl(null);
    }
    return () => {
      cancelled = true;
      if (url && typeof URL.revokeObjectURL === "function") URL.revokeObjectURL(url);
    };
  }, [theme?.background?.imageRef, activeId]);

  const bg = theme?.background;
  return (
    <>
      {bgUrl && bg && (
        <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: -1 }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${bgUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: `blur(${bg.blur}px)`,
              transform: "scale(1.1)",
            }}
          />
          <div style={{ position: "absolute", inset: 0, background: "var(--bg)", opacity: bg.overlayOpacity }} />
        </div>
      )}
      {children}
    </>
  );
}
```

- [ ] **Step 4: Run → pass (2 tests).**

### Task 9: ThemePreview + ThemeEditor

**Files:** Create `components/ThemePreview.tsx`, `components/ThemeEditor.tsx`, `tests/components/ThemeEditor.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
vi.mock("@/lib/storage/imageStore", () => ({ putImage: vi.fn(async () => {}), getImage: vi.fn(), deleteImage: vi.fn() }));
import { ThemeEditor } from "@/components/ThemeEditor";

beforeEach(() => localStorage.clear());

describe("ThemeEditor", () => {
  it("calls onSave with an edited theme", () => {
    const onSave = vi.fn();
    render(<ThemeEditor onSave={onSave} onCancel={() => {}} />);
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: "My Theme" } });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave.mock.calls[0][0].name).toBe("My Theme");
  });
  it("renders a color input for the accent var", () => {
    render(<ThemeEditor onSave={() => {}} onCancel={() => {}} />);
    expect(screen.getByLabelText(/accent/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run → fail.**

- [ ] **Step 3: Implement `components/ThemePreview.tsx`**

```tsx
import type { Theme } from "@/lib/theme/types";

export function ThemePreview({ theme }: { theme: Theme }) {
  return (
    <div
      style={{
        padding: 20,
        borderRadius: 10,
        background: theme.vars["--bg"],
        fontFamily: theme.vars["--font"],
        border: "1px solid #3a3c3f",
      }}
    >
      <div style={{ fontSize: 22 }}>
        <span style={{ color: theme.vars["--text-typed"] }}>สวัส</span>
        <span style={{ color: theme.vars["--text"] }}>ดีครับ</span>
        <span style={{ borderLeft: `2px solid ${theme.vars["--caret"]}` }} />
      </div>
      <div style={{ marginTop: 10, color: theme.vars["--accent"], fontSize: 14 }}>78 wpm · 96%</div>
    </div>
  );
}
```

- [ ] **Step 4: Implement `components/ThemeEditor.tsx`**

```tsx
"use client";
import { useState } from "react";
import type { Theme } from "@/lib/theme/types";
import { minimalDark } from "@/lib/theme/minimalDark";
import { FONT_OPTIONS } from "@/lib/theme/fonts";
import { putImage } from "@/lib/storage/imageStore";
import { ThemePreview } from "./ThemePreview";

const COLOR_VARS: { key: string; label: string }[] = [
  { key: "--bg", label: "Background" },
  { key: "--text", label: "Text" },
  { key: "--text-typed", label: "Typed text" },
  { key: "--accent", label: "Accent" },
  { key: "--error", label: "Error" },
  { key: "--caret", label: "Caret" },
];

let imgSeq = 0;

export function ThemeEditor({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Theme;
  onSave: (theme: Theme) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<Theme>(
    initial ?? { ...minimalDark, id: "draft", name: "My Theme", builtin: false, vars: { ...minimalDark.vars } },
  );

  const setVar = (k: string, v: string) => setDraft((d) => ({ ...d, vars: { ...d.vars, [k]: v } }));

  const onUpload = async (file: File) => {
    imgSeq += 1;
    const ref = `up-${imgSeq}-${file.size}`;
    await putImage(ref, file);
    setDraft((d) => ({ ...d, background: { imageRef: ref, blur: 6, overlayOpacity: 0.5 } }));
  };

  // hex inputs require solid colors; gradients in presets render but are edited as raw text for --bg
  const isHex = (v: string) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <label style={lbl}>
          Name
          <input
            aria-label="name"
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            style={inp}
          />
        </label>

        {COLOR_VARS.map((c) => (
          <label key={c.key} style={lbl}>
            {c.label}
            <span style={{ display: "flex", gap: 8 }}>
              {isHex(draft.vars[c.key] ?? "") && (
                <input
                  type="color"
                  aria-label={c.label}
                  value={draft.vars[c.key]}
                  onChange={(e) => setVar(c.key, e.target.value)}
                />
              )}
              <input
                aria-label={`${c.label} value`}
                value={draft.vars[c.key] ?? ""}
                onChange={(e) => setVar(c.key, e.target.value)}
                style={inp}
              />
            </span>
          </label>
        ))}

        <label style={lbl}>
          Font
          <select
            aria-label="font"
            value={draft.vars["--font"]}
            onChange={(e) => setVar("--font", e.target.value)}
            style={inp}
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f.label} value={f.stack}>{f.label}</option>
            ))}
          </select>
        </label>

        <label style={lbl}>
          Caret
          <select
            aria-label="caret"
            value={draft.caretStyle}
            onChange={(e) => setDraft((d) => ({ ...d, caretStyle: e.target.value as Theme["caretStyle"] }))}
            style={inp}
          >
            <option value="line">Line</option>
            <option value="block">Block</option>
            <option value="underline">Underline</option>
          </select>
        </label>

        <label style={lbl}>
          Background image
          <input
            type="file"
            aria-label="background image"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
          />
        </label>

        {draft.background && (
          <>
            <label style={lbl}>
              Blur {draft.background.blur}px
              <input
                type="range" min={0} max={20} value={draft.background.blur}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, background: { ...d.background!, blur: Number(e.target.value) } }))
                }
              />
            </label>
            <label style={lbl}>
              Overlay {Math.round(draft.background.overlayOpacity * 100)}%
              <input
                type="range" min={0} max={100} value={draft.background.overlayOpacity * 100}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    background: { ...d.background!, overlayOpacity: Number(e.target.value) / 100 },
                  }))
                }
              />
            </label>
          </>
        )}

        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <button onClick={() => onSave(draft)} style={btn}>save</button>
          <button onClick={onCancel} style={btn}>cancel</button>
        </div>
      </div>

      <div>
        <ThemePreview theme={draft} />
      </div>
    </div>
  );
}

const lbl: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: "var(--text)" };
const inp: React.CSSProperties = { background: "var(--bg)", color: "var(--text-typed)", border: "1px solid #3a3c3f", borderRadius: 4, padding: "4px 8px" };
const btn: React.CSSProperties = { background: "transparent", color: "var(--text)", border: "1px solid var(--text)", padding: "8px 16px", cursor: "pointer" };
```

- [ ] **Step 5: Run → pass (2 tests).**

### Task 10: ThemeStudio

**Files:** Create `components/ThemeStudio.tsx`, `tests/components/ThemeStudio.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
vi.mock("@/lib/storage/imageStore", () => ({ putImage: vi.fn(async () => {}), getImage: vi.fn(), deleteImage: vi.fn() }));
import { ThemeStudio } from "@/components/ThemeStudio";
import { useTheme } from "@/stores/themeStore";

beforeEach(() => {
  localStorage.clear();
  useTheme.getState().reload();
});

describe("ThemeStudio", () => {
  it("lists preset themes and activates one on click", () => {
    render(<ThemeStudio />);
    fireEvent.click(screen.getByTestId("theme-card-ocean"));
    expect(useTheme.getState().activeId).toBe("ocean");
  });
  it("creates a custom theme through the editor", () => {
    render(<ThemeStudio />);
    fireEvent.click(screen.getByRole("button", { name: /new theme/i }));
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: "Mine" } });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));
    expect(useTheme.getState().customs.some((t) => t.name === "Mine")).toBe(true);
  });
});
```

- [ ] **Step 2: Run → fail.**

- [ ] **Step 3: Implement `components/ThemeStudio.tsx`**

```tsx
"use client";
import { useState } from "react";
import { useTheme } from "@/stores/themeStore";
import type { Theme } from "@/lib/theme/types";
import { exportThemeCode, importThemeCode } from "@/lib/theme/serialize";
import { ThemeEditor } from "./ThemeEditor";

export function ThemeStudio() {
  const { allThemes, activeId, setActive, addCustom, deleteCustom } = useTheme();
  const [editing, setEditing] = useState(false);
  const [importText, setImportText] = useState("");

  if (editing) {
    return (
      <ThemeEditor
        onSave={(t) => {
          addCustom(t);
          setEditing(false);
        }}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <button onClick={() => setEditing(true)} style={btn}>new theme</button>
        <input
          aria-label="import code"
          placeholder="paste theme code"
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          style={{ ...inp, flex: 1 }}
        />
        <button
          onClick={() => {
            const t = importThemeCode(importText.trim());
            if (t) {
              addCustom(t);
              setImportText("");
            }
          }}
          style={btn}
        >
          import
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 14 }}>
        {allThemes().map((t: Theme) => (
          <div
            key={t.id}
            data-testid={`theme-card-${t.id}`}
            onClick={() => setActive(t.id)}
            style={{
              cursor: "pointer",
              borderRadius: 10,
              overflow: "hidden",
              border: t.id === activeId ? "2px solid var(--accent)" : "1px solid #3a3c3f",
            }}
          >
            <div style={{ height: 70, background: t.vars["--bg"] }}>
              <div style={{ padding: 10, color: t.vars["--accent"], fontFamily: t.vars["--font"] }}>ก ข ค</div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 10px", fontSize: 13 }}>
              <span>{t.name}</span>
              {!t.builtin && (
                <button
                  aria-label={`delete ${t.name}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteCustom(t.id);
                  }}
                  style={{ background: "none", border: "none", color: "var(--error)", cursor: "pointer" }}
                >
                  ×
                </button>
              )}
              {!t.builtin && (
                <button
                  aria-label={`export ${t.name}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    void navigator.clipboard?.writeText(exportThemeCode(t));
                  }}
                  style={{ background: "none", border: "none", color: "var(--text)", cursor: "pointer" }}
                >
                  ⤴
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const btn: React.CSSProperties = { background: "transparent", color: "var(--text)", border: "1px solid var(--text)", padding: "8px 16px", cursor: "pointer" };
const inp: React.CSSProperties = { background: "var(--bg)", color: "var(--text-typed)", border: "1px solid #3a3c3f", borderRadius: 4, padding: "4px 8px" };
```

- [ ] **Step 4: Run → pass (2 tests).**

### Task 11: Routes, layout, nav, caret wiring

**Files:** Create `app/themes/page.tsx`; modify `app/layout.tsx`, `components/NavBar.tsx`, `components/TestScreen.tsx`, `components/LessonRunner.tsx`

- [ ] **Step 1: Create `app/themes/page.tsx`**

```tsx
import { ThemeStudio } from "@/components/ThemeStudio";
import { NavBar } from "@/components/NavBar";

export default function ThemesPage() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "8vh 24px" }}>
      <NavBar />
      <h1 style={{ color: "var(--accent)", fontSize: 22, marginBottom: 24 }}>themes</h1>
      <ThemeStudio />
    </main>
  );
}
```

- [ ] **Step 2: Wrap `app/layout.tsx` with ThemeProvider**

```tsx
import "./globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "thai-type",
  description: "Thai touch typing trainer",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Add themes link in `components/NavBar.tsx`** — add after the lessons link:

```tsx
      <Link href="/themes" style={{ color: "var(--text)", textDecoration: "none" }}>
        themes
      </Link>
```

- [ ] **Step 4: Pass caret style in `components/TestScreen.tsx`**

Add import: `import { useTheme } from "@/stores/themeStore";`
Inside the component: `const caretStyle = useTheme((s) => s.activeTheme()?.caretStyle ?? "line");`
Change the `<Words .../>` call to include `caretStyle={caretStyle}`.

- [ ] **Step 5: Pass caret style in `components/LessonRunner.tsx`**

Same: import `useTheme`, read `caretStyle`, pass to `<Words ... caretStyle={caretStyle} />`.

- [ ] **Step 6: Full suite + build**

Run: `npm run test` → all pass.
Run: `npm run build` → success, no type errors. Confirm `/themes` route appears.

- [ ] **Step 7: Commit**

```bash
git add components/Words.tsx components/ThemeProvider.tsx components/ThemePreview.tsx components/ThemeEditor.tsx components/ThemeStudio.tsx components/NavBar.tsx components/TestScreen.tsx components/LessonRunner.tsx app/themes app/layout.tsx tests/components/Words.test.tsx tests/components/ThemeProvider.test.tsx tests/components/ThemeEditor.test.tsx tests/components/ThemeStudio.test.tsx
git commit -m "feat(theme): provider, studio, editor, preview, caret styles, routes + nav"
```

### Task 12: E2E

**Files:** Create `e2e/theme.spec.ts`

- [ ] **Step 1: Write the E2E test**

```ts
import { test, expect } from "@playwright/test";

test("switches to a preset theme and it applies", async ({ page }) => {
  await page.goto("/themes");
  await page.getByTestId("theme-card-terminal").click();
  // active card gets the accent border; :root --accent becomes terminal's green
  const accent = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue("--accent").trim(),
  );
  expect(accent).toBe("#39ff8a");
});

test("creates a custom theme via the editor", async ({ page }) => {
  await page.goto("/themes");
  await page.getByRole("button", { name: "new theme" }).click();
  await page.getByLabel("name").fill("E2E Theme");
  await page.getByRole("button", { name: "save" }).click();
  await expect(page.getByText("E2E Theme")).toBeVisible();
});
```

- [ ] **Step 2: Run E2E** — `npm run e2e` → all specs pass (Plans 1–4).

- [ ] **Step 3: Commit**

```bash
git add e2e/theme.spec.ts
git commit -m "test(e2e): theme switch + custom theme creation"
```

---

## Self-Review Notes

- **Spec coverage (Plan 4):** theme JSON schema with vars/caret/sound/background (Task 0) ✓; preset pack ≥12 incl. gradient/vaporwave/pastel/neon (Task 1) ✓; full applier + provider with image layer, blur, overlay (Tasks 0,8) ✓; custom editor — every color, Thai font picker, caret picker, bg upload + blur/overlay sliders (Task 9) ✓; import/export JSON + short code (Tasks 2,10) ✓; persistence localStorage (metadata) + IndexedDB (image blobs) (Tasks 4,5) ✓; applied app-wide via root layout (Task 11) ✓; caret styles in renderer (Task 7) ✓. "Anime theme" = user-uploaded wallpaper (editor bg upload) per the agreed approach; presets are CSS gradients (no bundled assets).
- **Parallel safety (Wave 1, Workflow):** five leaf modules — `presets.ts`, `serialize.ts`, `fonts.ts`, `imageStore.ts`, `themeStorage.ts` — own disjoint NEW files + tests, import only the `Theme` type (Wave 0) and `idb-keyval`. No cross-imports among them. No shared file written twice.
- **Type/method consistency:** `Theme`/`ThemeBackground`/`CaretStyle`/`SoundId` (Task 0); `PRESETS`/`presetById`; `exportThemeJSON`/`importThemeJSON`/`exportThemeCode`/`importThemeCode`/`validateTheme`; `putImage`/`getImage`/`deleteImage`; `loadCustomThemes`/`saveCustomThemes`/`loadActiveId`/`saveActiveId`; store `useTheme` with `activeId`/`customs`/`allThemes`/`activeTheme`/`setActive`/`addCustom`/`updateCustom`/`deleteCustom`/`reload`. `Words` gains optional `caretStyle`. Names identical across tasks.
- **jsdom limits handled:** IndexedDB mocked in `imageStore` + provider/editor/studio tests; `ThemeProvider` guards `URL.createObjectURL`/`revokeObjectURL` existence so it is SSR/jsdom-safe.
- **Deferred to Plan 5:** stats history, wpm-over-time graph, heatmap dashboard. Sound playback is modeled (`sound` field) but actual audio playback is left as a no-op hook for a later pass (field persists so it is forward-compatible).
```
