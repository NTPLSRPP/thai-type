export const SCHEMA_VERSION = 1;

export type TestMode = "time" | "words";
export interface Settings {
  mode: TestMode;
  duration: number;   // seconds, for time mode
  wordCount: number;  // for words mode
  inputMode: "app-remap" | "os-native";
  layoutId: "kedmanee";
}

export const DEFAULT_SETTINGS: Settings = {
  mode: "time",
  duration: 30,
  wordCount: 25,
  inputMode: "app-remap",
  layoutId: "kedmanee",
};
