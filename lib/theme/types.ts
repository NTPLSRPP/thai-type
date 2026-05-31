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
