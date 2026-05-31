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
