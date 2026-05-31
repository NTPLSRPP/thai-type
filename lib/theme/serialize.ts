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
