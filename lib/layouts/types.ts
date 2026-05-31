export type Finger =
  | "left-pinky" | "left-ring" | "left-middle" | "left-index"
  | "right-index" | "right-middle" | "right-ring" | "right-pinky";

export interface KeyDef { normal: string; shift: string; finger: Finger; row: "number" | "top" | "home" | "bottom"; }
export interface Layout { id: string; name: string; keys: Record<string, KeyDef>; }
