import type { Theme } from "./types"
import { minimalDark } from "./minimalDark"

const MONO = "'JetBrains Mono', ui-monospace, monospace"
const SANS_TH = "'Noto Sans Thai', 'Sarabun', system-ui, sans-serif"
// prefix bundled-asset URLs with the deploy base path (set for GitHub Pages)
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

function t(
  id: string,
  name: string,
  vars: Record<string, string>,
  caretStyle: Theme["caretStyle"] = "line",
): Theme {
  return {
    id,
    name,
    builtin: true,
    caretStyle,
    sound: "off",
    background: null,
    vars,
  }
}

export const PRESETS: Theme[] = [
  minimalDark,
  t("minimal-light", "Minimal Light", {
    "--bg": "#eaeaea",
    "--text": "#9b9b9b",
    "--text-typed": "#1a1a1a",
    "--accent": "#2b7fff",
    "--error": "#d33",
    "--caret": "#2b7fff",
    "--font": MONO,
  }),
  t(
    "terminal",
    "Terminal",
    {
      "--bg": "#0a0e12",
      "--text": "#2f6b4f",
      "--text-typed": "#39ff8a",
      "--accent": "#39ff8a",
      "--error": "#ff5555",
      "--caret": "#39ff8a",
      "--font": MONO,
    },
    "block",
  ),
  t(
    "editorial",
    "Editorial",
    {
      "--bg": "#f4efe6",
      "--text": "#8a7f6d",
      "--text-typed": "#2b2520",
      "--accent": "#c0492b",
      "--error": "#b3261e",
      "--caret": "#c0492b",
      "--font": SANS_TH,
    },
    "underline",
  ),
  t("vaporwave", "Vaporwave", {
    "--bg": "linear-gradient(135deg,#2b1055,#7597de)",
    "--text": "#b39ddb",
    "--text-typed": "#fff0f5",
    "--accent": "#ff71ce",
    "--error": "#ff3860",
    "--caret": "#01cdfe",
    "--font": MONO,
  }),
  t("pastel", "Pastel", {
    "--bg": "linear-gradient(135deg,#fde2e4,#e2ece9)",
    "--text": "#a59aab",
    "--text-typed": "#5b5266",
    "--accent": "#ff8fab",
    "--error": "#e5616b",
    "--caret": "#ff8fab",
    "--font": SANS_TH,
  }),
  t("sunset", "Sunset", {
    "--bg": "linear-gradient(135deg,#ff7e5f,#feb47b)",
    "--text": "#7a4a3a",
    "--text-typed": "#2b1a12",
    "--accent": "#c0392b",
    "--error": "#922b21",
    "--caret": "#c0392b",
    "--font": SANS_TH,
  }),
  t(
    "neon",
    "Neon",
    {
      "--bg": "#0d0221",
      "--text": "#5a3a8a",
      "--text-typed": "#e0aaff",
      "--accent": "#c77dff",
      "--error": "#ff2965",
      "--caret": "#c77dff",
      "--font": MONO,
    },
    "block",
  ),
  t("forest", "Forest", {
    "--bg": "#10241b",
    "--text": "#5c7a6a",
    "--text-typed": "#cfe8d8",
    "--accent": "#7bd389",
    "--error": "#e07a5f",
    "--caret": "#7bd389",
    "--font": SANS_TH,
  }),
  t("ocean", "Ocean", {
    "--bg": "linear-gradient(135deg,#0f2027,#203a43,#2c5364)",
    "--text": "#5e8a9a",
    "--text-typed": "#d6f1ff",
    "--accent": "#48cae4",
    "--error": "#ef476f",
    "--caret": "#48cae4",
    "--font": MONO,
  }),
  t("mocha", "Mocha", {
    "--bg": "#1e1e2e",
    "--text": "#6c7086",
    "--text-typed": "#cdd6f4",
    "--accent": "#f5c2e7",
    "--error": "#f38ba8",
    "--caret": "#f5c2e7",
    "--font": MONO,
  }),
  t(
    "paper",
    "Paper",
    {
      "--bg": "#fbf7f0",
      "--text": "#b8ae9e",
      "--text-typed": "#3a3530",
      "--accent": "#e09f3e",
      "--error": "#9e2a2b",
      "--caret": "#e09f3e",
      "--font": SANS_TH,
    },
    "underline",
  ),

  // ---- wallpaper themes (palette researched; image hotlinked, falls back to --bg gradient) ----
  // Hatsune Miku — signature teal #39C5BB + magenta-pink accents on dark teal.
  {
    id: "hatsune-miku",
    name: "Hatsune Miku",
    builtin: true,
    caretStyle: "line",
    sound: "off",
    background: {
      url: "https://w.wallhaven.cc/full/1p/wallhaven-1ppld1.jpg",
      blur: 1,
      overlayOpacity: 0.66,
    },
    vars: {
      "--bg": "#0c2024",
      "--text": "#5d8a86",
      "--text-typed": "#e9fffb",
      "--accent": "#39c5bb",
      "--error": "#ff5fa2",
      "--caret": "#39c5bb",
      "--font": MONO,
    },
  },
  // Chisa (Wuthering Waves) — black + crimson red with white, JK-uniform palette.
  {
    id: "chisa",
    name: "Chisa",
    builtin: true,
    caretStyle: "line",
    sound: "off",
    background: {
      url: `${BASE}/themes/chisa.jpg`,
      blur: 1,
      overlayOpacity: 0.7,
    },
    vars: {
      "--bg": "#140a0c",
      "--text": "#8a6f74",
      "--text-typed": "#f4ebed",
      "--accent": "#e23b4d",
      "--error": "#ff7a7a",
      "--caret": "#e23b4d",
      "--font": SANS_TH,
    },
  },
]

export function presetById(id: string): Theme | undefined {
  return PRESETS.find((p) => p.id === id)
}
