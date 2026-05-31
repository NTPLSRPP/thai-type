# thai-type

A Thai touch-typing trainer in the spirit of Monkeytype — structured lessons, multiple keyboard layouts, live stats, and a deep set of customization and theming options. Built for learning the Thai keyboard from the home row up.

> Live development app. Everything runs client-side; progress and settings persist in the browser (no backend, no account).

## Features

- **Typing engine** — character-level (code point) comparison with cluster-aware display via `Intl.Segmenter`, so Thai combining marks render attached to their base consonant while still being graded per keystroke.
- **Lessons** — the full [typingth.com](https://www.typingth.com) curriculum flattened into chapters → sub-lessons; each sub-lesson is repeated 3× to complete. Jump to any lesson, <kbd>space</kbd> for next, <kbd>r</kbd> to redo.
- **Test mode** — time and word-count modes with a live WPM / accuracy readout, à la Monkeytype.
- **Layouts** — Kedmanee, Pattachote, and Manoonchai, with correct per-key finger zones.
- **On-screen keyboard** — full MacBook-style key field, shift legends, finger-zone coloring, next-key hint, and an error heatmap. Three sizes.
- **Themes** — 14 built-in presets plus user-created themes (custom palette, caret, and uploaded background image stored in IndexedDB).
- **Settings** — stop-on-error, no-backspace, blind mode, caret style, smooth caret, font + size, page width, sounds, and more — persisted to `localStorage` with schema-versioned migration.

## Tech stack

- **Next.js 16** (App Router, Turbopack) · **React 19** · **TypeScript**
- **Zustand** for state · `localStorage` + **IndexedDB** (`idb-keyval`) for persistence
- **Vitest** + **@testing-library/react** (unit/component) · **Playwright** (e2e)
- Fonts via `next/font` (Inter for UI, Noto Sans Thai for typing)

## Getting started

Requires Node 20+ (developed on Node 22).

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm test` | Unit + component tests (Vitest) |
| `npm run test:watch` | Vitest watch mode |
| `npm run e2e` | Playwright end-to-end tests |

## Project layout

```
app/            routes: / (test), /lessons, /lessons/[id], /themes, /stats, /settings
components/     UI — Keyboard, Words, SubLessonRunner, TestScreen, SettingsPanel, …
lib/
  engine/       typing engine, metrics, per-key stats
  layouts/      Kedmanee / Pattachote / Manoonchai + key→char resolution
  curriculum/   typingth chapters and sub-lessons
  theme/        presets, theme types, applier
  storage/      settings schema, versioned persistence
stores/         Zustand stores (settings, stats, key model, lesson progress)
tests/          Vitest unit + component tests
e2e/            Playwright specs
```

## Testing

```bash
npm test     # Vitest — engine, layouts, curriculum, stores, components
npm run e2e  # Playwright — lessons, layout switching, theming, stats flows
```

## Notes

- The bundled wallpaper art (`public/themes/`) and one remote wallpaper URL are third-party images used for the Hatsune Miku / Chisa preset themes; replace them with your own assets for redistribution.
- This is not the Next.js you may know — it targets Next 16; check `node_modules/next/dist/docs/` for version-specific APIs before changing framework code.
