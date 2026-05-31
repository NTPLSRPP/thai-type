import type { CaretStyle, SoundId, Theme } from "./types";

const CARETS: CaretStyle[] = ["line", "block", "underline"];
const SOUNDS: SoundId[] = ["off", "click"];

// Keys an imported theme is allowed to set. Anything else is dropped.
const ALLOWED_VARS = ["--bg", "--text", "--text-typed", "--accent", "--error", "--caret", "--font"];
const REQUIRED_VARS = ["--bg", "--text", "--text-typed", "--accent", "--caret", "--font"];
// Reject CSS values that can trigger an outbound request or escape the value context.
const UNSAFE_VALUE = /url\(|image-set\(|image\(|expression\(|@import|<\/?\w/i;

// id is intentionally empty: useTheme.addCustom is the sole authority that assigns the real id.
export function validateTheme(obj: unknown): Theme | null {
  if (typeof obj !== "object" || obj === null) return null;
  const o = obj as Record<string, unknown>;
  if (typeof o.name !== "string" || typeof o.vars !== "object" || o.vars === null) return null;
  const vars = o.vars as Record<string, unknown>;

  for (const k of REQUIRED_VARS) {
    if (typeof vars[k] !== "string") return null;
  }

  const outVars: Record<string, string> = {};
  for (const k of ALLOWED_VARS) {
    const v = vars[k];
    if (typeof v !== "string") continue;
    if (UNSAFE_VALUE.test(v)) return null;
    outVars[k] = v;
  }

  const caretStyle = CARETS.includes(o.caretStyle as CaretStyle) ? (o.caretStyle as CaretStyle) : "line";
  const sound = SOUNDS.includes(o.sound as SoundId) ? (o.sound as SoundId) : "off";
  return {
    id: "",
    name: o.name,
    vars: outVars,
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
