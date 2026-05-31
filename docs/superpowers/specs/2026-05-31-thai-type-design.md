# thai-type — Design Spec

**Date:** 2026-05-31
**Status:** Approved (design phase)

> **⚠️ Partially superseded (2026-06-01).** The lessons subsystem described below as a
> *generated-drill + adaptive unit* system was replaced by the real **typingth.com**
> curriculum: 20 chapters / 84 fixed-text sub-lessons (`lib/curriculum/typingth.ts` →
> `chapters.ts`), 3 reps to complete each, persisted via `lib/storage/lessonProgress.ts`
> + `stores/lessonProgressStore.ts`, UI in `components/ChapterList.tsx` +
> `SubLessonRunner.tsx`, route `app/lessons/[id]`. The modules `units.ts`, `drills.ts`,
> `adaptive.ts`, `lib/storage/progress.ts`, `stores/progressStore.ts`, `LessonMap.tsx`,
> `LessonRunner.tsx`, and route `lessons/[unit]` no longer exist. Sections 3 (Curriculum)
> and the `/lessons/[unit]` route row below are historical. Engine, layouts, themes, stats,
> and the free test are still accurate.

A Thai touch-typing trainer combining a structured lesson curriculum with a Monkeytype-style free typing test. Fully customizable theming (including image/anime themes). Three Thai keyboard layouts. Local-only persistence, no backend.

## Goals

- Teach Thai touch typing from scratch via a progressive curriculum.
- Provide a polished, Monkeytype-style free typing test with rich stats.
- Support three layouts — **Kedmanee**, **Pattachote**, **Manoonchai** — including practicing a layout the user has **not** installed in their OS.
- Fully customizable theme system: presets + custom editor + image backgrounds + import/export.

## Non-Goals (YAGNI)

- No user accounts, login, cloud sync, leaderboards, or multiplayer in this version.
- No mobile-native app (responsive web only).
- The `lib/storage/` layer is kept swappable so accounts can be added later without rewrites, but accounts are out of scope now.

## Tech Stack

- **Next.js (App Router) + TypeScript**, client-heavy SPA-style.
- **Zustand** for client state.
- **CSS custom properties** for design tokens / theming (themes are sets of CSS-var values → near-zero runtime cost).
- **`Intl.Segmenter`** for grapheme-aware text comparison.
- **localStorage** for settings, progress, stats; **IndexedDB** (via `idb-keyval` or equivalent) for theme background images.

## Architecture

Client-only. No server data. Routes:

| Route | Purpose |
|-------|---------|
| `/` | Free typing test (default surface) |
| `/lessons` | Curriculum overview / unit map |
| `/lessons/[unit]` | A single lesson/drill |
| `/results` | Post-test results (also rendered inline) |
| `/themes` | Theme studio |
| `/stats` | History, graphs, per-key heatmap |
| `/settings` | Layout, input mode, test defaults, misc |

State stores (Zustand): `settingsStore`, `statsStore`, `themeStore`, `sessionStore`.

## Module Layout

```
lib/engine/      typing comparison, metrics, event emission
lib/layouts/     layout JSON + loader
lib/curriculum/  unit definitions, drill generator, adaptive engine
lib/theme/       theme schema, preset pack, serialize/deserialize, CSS-var applier
lib/storage/     localStorage + IndexedDB wrappers (swappable interface)
stores/          zustand stores
components/       TestScreen, Keyboard, Caret, Results, ThemeStudio, StatsCharts, ...
app/             routes
```

Each `lib/*` module is framework-free and unit-testable in isolation. Components consume stores + engine via well-defined interfaces.

## 1. Typing Engine

Pure TS, no React. Responsibilities:

- Receive raw key input, resolve it to a Thai character (see input modes), compare against the target text, emit events (`correct`, `incorrect`, `complete`, `extra`, `back`).
- **Grapheme-aware comparison.** Thai combines a base consonant/vowel with tone marks (่ ้ ๊ ๋) and above/below vowels (ั ิ ี ึ ื ุ ู). Comparison must operate on grapheme clusters (`Intl.Segmenter('th', {granularity:'grapheme'})`), not raw code points, so a base + tone mark is judged as one unit and the caret advances correctly.
- Track per-keystroke timing, per-key correctness, and error positions for metrics and the adaptive engine.

### Input Modes

1. **App-remap (default).** The app reads `event.code` (+ shift state) and maps it to a Thai character via the active layout JSON. This lets the user practice **any** of the three layouts without installing it in the OS. The app calls `preventDefault()` and drives its own character stream.
2. **OS-native.** The user has a real Thai OS layout active; the app reads `event.key` directly and only compares. For users who type Thai natively and want WYSIWYG behavior.

Mode is a setting. Both modes feed the same comparison core.

## 2. Layouts as Data

Three files: `layouts/kedmanee.json`, `layouts/pattachote.json`, `layouts/manoonchai.json`.

Each maps physical key → characters and metadata:

```
{
  "id": "kedmanee",
  "name": "Kedmanee",
  "keys": {
    "KeyA": { "normal": "ฟ", "shift": "ฤ", "finger": "left-pinky", "row": "home" },
    ...
  }
}
```

`finger` + `row` drive on-screen keyboard finger-zone coloring and the next-key hint highlight.

## 3. Curriculum

**Fixed path + adaptive drills**, per layout.

- **Fixed ordered units** (JSON definitions): home row → adjacent reaches → tone marks → numbers/symbols → common words → sentences. Units unlock progressively.
- **Generated drills:** procedurally built from a Thai syllable/char model, biased toward the keys a unit introduces. Plus a **small curated set** of real words / quotes / sentences per layout for polish.
- **Adaptive engine:** reads the per-key error/speed model from `statsStore` and weights the user's weakest keys into generated drills (keybr-style). Used both inside lessons and as a standalone "weak keys" drill mode.

Content strategy: generated drills + a curated set keeps authoring cost low across three layouts while staying high-quality.

## 4. Test Modes & Metrics

**Modes:** time (15 / 30 / 60 / 120 s), words (10 / 25 / 50 / 100), quote, custom text.

**Metrics:**

- WPM: word defined as **5 graphemes** (standard convention), computed from correct input.
- Raw WPM, accuracy %, consistency, character counts (correct / incorrect / extra / missed).
- **Error heatmap** projected onto the on-screen keyboard.
- **WPM-over-time graph** for the session.
- Per-session **history** persisted; feeds `/stats` and the adaptive engine.

## 5. Theme Studio (full)

A theme is a JSON object:

```
{
  "id": "...",
  "name": "...",
  "vars": { "--bg": "...", "--text": "...", "--accent": "...", "--caret": "...", ... },
  "font": "...",
  "caretStyle": "block | line | underline",
  "sound": "off | <clickset>",
  "background": { "imageRef": "<indexeddb-key>", "blur": 8, "overlayOpacity": 0.45 } | null
}
```

- **Preset pack (~12–15):** minimal dark *(default)*, minimal light, terminal, editorial, plus several anime / vaporwave / pastel image-based themes — so the app looks great on first run.
- **Editor:** edit every color, pick a Thai font, choose caret style, optionally upload a **background image** (stored in IndexedDB) with **blur + overlay opacity** controls so the typing text stays readable over busy art.
- **Import / export:** serialize a theme to JSON and to a short shareable code; importing validates against the schema before applying.
- **Applier:** writes the theme's `vars` to `:root` as CSS custom properties; the whole UI reacts via tokens.

## 6. Persistence

- `lib/storage/` exposes a typed interface (`get`, `set`, namespaced keys) with two backends: localStorage (settings, progress, stats history, theme metadata) and IndexedDB (theme background image blobs).
- Interface is backend-agnostic so a future remote/account backend can be slotted in.
- All reads validated/migrated on load (schema version field) to survive format changes.

## 7. Error Handling & Edge Cases

- Corrupt/old localStorage data → validate on read, fall back to defaults, never crash.
- Missing IndexedDB image (cleared storage) → theme falls back to solid background.
- Imported theme JSON validated against schema; invalid imports rejected with a clear message.
- `Intl.Segmenter` is widely supported in modern browsers; assume available (document minimum browser support in README).

## 8. Testing

- **Unit:** engine comparison (esp. combining tone marks / above-below vowels), metrics (WPM/accuracy/consistency), layout maps, drill generator + adaptive weighting, theme serialize/deserialize + CSS-var applier, storage wrappers.
- **Component:** TestScreen render + input flow, Keyboard next-key highlight + heatmap.
- **E2E:** complete a lesson unit; run a timed test end-to-end; switch active layout; create, export, re-import, and apply a custom theme (incl. image background).
- **Visual regression:** breakpoints 320 / 768 / 1024 / 1440, light + dark presets.
- Target ≥ 80% coverage on `lib/*`.

## Open Questions / Deferred

- Exact curated word/quote sets per layout — author during implementation.
- Sound pack contents — optional, can ship later behind the existing `sound` field.
