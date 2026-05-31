export interface ThemeVars { [k: `--${string}`]: string; }
export interface Theme { id: string; name: string; vars: ThemeVars; }

export const minimalDark: Theme = {
  id: "minimal-dark",
  name: "Minimal Dark",
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
