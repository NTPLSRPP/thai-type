import type { Finger } from "./types";

export type HandFinger = Finger | "thumb";

// Shared finger-zone colors (used by the on-screen keyboard and the hands guide).
export const FINGER_COLOR: Record<HandFinger, string> = {
  "left-pinky": "#5b8def",
  "left-ring": "#43b581",
  "left-middle": "#e2b714",
  "left-index": "#e67e22",
  "right-index": "#e74c3c",
  "right-middle": "#9b59b6",
  "right-ring": "#1abc9c",
  "right-pinky": "#3498db",
  thumb: "#aab2bd",
};

// outer -> inner for each hand
export const LEFT_FINGERS: Finger[] = ["left-pinky", "left-ring", "left-middle", "left-index"];
export const RIGHT_FINGERS: Finger[] = ["right-index", "right-middle", "right-ring", "right-pinky"];
