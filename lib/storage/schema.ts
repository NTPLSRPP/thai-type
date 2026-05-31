import type { LayoutId } from "@/lib/layouts/registry";

// Bumped to 2: added the rich Monkeytype-style settings block. loadSettings merges
// DEFAULT_SETTINGS over stored data, so v1 payloads gain the new fields with defaults.
export const SCHEMA_VERSION = 2;

export type TestMode = "time" | "words";
export type InputMode = "app-remap" | "os-native";
export type StopOnError = "off" | "letter";
export type CaretStyle = "off" | "line" | "block" | "underline";
export type PageWidth = "narrow" | "normal" | "wide";
export type TimerStyle = "text" | "bar";
export type QuickRestart = "off" | "tab" | "esc";
export type KeyboardSize = "small" | "medium" | "large";

export interface Settings {
  // test
  mode: TestMode;
  duration: number;
  wordCount: number;
  inputMode: InputMode;
  layoutId: LayoutId;

  // behavior / input
  stopOnError: StopOnError; // "letter" = must fix before advancing
  noBackspace: boolean; // confidence mode — backspace disabled
  blindMode: boolean; // hide per-character correctness while typing
  quickRestart: QuickRestart; // key that restarts the test

  // appearance
  caretStyle: CaretStyle;
  smoothCaret: boolean;
  liveSpeed: boolean; // show live wpm
  liveAccuracy: boolean; // show live accuracy
  fontSize: number; // typing text px
  typingFont: string; // CSS font stack for the typing area
  pageWidth: PageWidth;
  timerStyle: TimerStyle; // time-mode progress display

  // on-screen keyboard
  showKeyboard: boolean;
  keyboardSize: KeyboardSize;
  showShiftLegend: boolean;
  fingerColors: boolean;
  nextKeyHint: boolean;
  heatmap: boolean;
  showHands: boolean; // hand/finger guide for the next key

  // sound
  clickSound: boolean;
  errorSound: boolean;
  soundVolume: number; // 0..1
}

export const DEFAULT_SETTINGS: Settings = {
  mode: "time",
  duration: 30,
  wordCount: 25,
  inputMode: "app-remap",
  layoutId: "kedmanee",

  stopOnError: "off",
  noBackspace: false,
  blindMode: false,
  quickRestart: "esc", // Esc avoids hijacking Tab focus traversal by default



  caretStyle: "line",
  smoothCaret: true,
  liveSpeed: true,
  liveAccuracy: true,
  fontSize: 28,
  typingFont: "ui-monospace, 'JetBrains Mono', 'Cascadia Code', monospace",
  pageWidth: "normal",
  timerStyle: "text",

  showKeyboard: true,
  keyboardSize: "medium",
  showShiftLegend: true,
  fingerColors: true,
  nextKeyHint: true,
  heatmap: true,
  showHands: true,

  clickSound: false,
  errorSound: false,
  soundVolume: 0.5,
};
