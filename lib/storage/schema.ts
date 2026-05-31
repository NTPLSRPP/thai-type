import type { LayoutId } from "@/lib/layouts/registry";

export const SCHEMA_VERSION = 1;

export type TestMode = "time" | "words";
export type InputMode = "app-remap" | "os-native";

export interface Settings {
  mode: TestMode;
  duration: number;
  wordCount: number;
  inputMode: InputMode;
  layoutId: LayoutId;
}

export const DEFAULT_SETTINGS: Settings = {
  mode: "time",
  duration: 30,
  wordCount: 25,
  inputMode: "app-remap",
  layoutId: "kedmanee",
};
