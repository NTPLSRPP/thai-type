export interface LessonUnit {
  id: string;
  name: string;
  keys: string[]; // physical KeyboardEvent.code values
  order: number;
  pool?: boolean; // true => draw from the Thai word pool, not generated drills
}

export const UNITS: LessonUnit[] = [
  { id: "home-left", name: "Home Row — Left", order: 0, keys: ["KeyA", "KeyS", "KeyD", "KeyF", "KeyG"] },
  { id: "home-right", name: "Home Row — Right", order: 1, keys: ["KeyH", "KeyJ", "KeyK", "KeyL", "Semicolon"] },
  { id: "home-all", name: "Home Row — All", order: 2, keys: ["KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyK", "KeyL"] },
  { id: "top-row", name: "Top Row", order: 3, keys: ["KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU", "KeyI", "KeyO", "KeyP"] },
  { id: "bottom-row", name: "Bottom Row", order: 4, keys: ["KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM"] },
  { id: "all-letters", name: "All Letters", order: 5, keys: [
      "KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU", "KeyI", "KeyO", "KeyP",
      "KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyK", "KeyL",
      "KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM",
    ] },
  { id: "words", name: "Common Words", order: 6, keys: [], pool: true },

  // --- Appended lessons (order >= 7) ---
  // Inspired by the typingth.com Kedmanee progression (home row first, then per-finger
  // reinforcement, top/bottom rows, tone marks, numbers, and finally words/phrases) blended
  // with a standard Thai touch-typing curriculum. The site is JS-rendered, so the full
  // intermediate lesson list could not be scraped; this follows the confirmed shape
  // (home row -> ... -> complex sentences) plus the conventional finger/row/tone/number order.

  // Per-finger reinforcement, working outward from the strong fingers to the weak ones.
  { id: "index-fingers", name: "Index Fingers", order: 7, keys: ["KeyF", "KeyG", "KeyR", "KeyT", "KeyV", "KeyB", "KeyH", "KeyJ", "KeyU", "KeyM", "KeyN", "KeyY"] },
  { id: "middle-fingers", name: "Middle Fingers", order: 8, keys: ["KeyD", "KeyE", "KeyC", "KeyK", "KeyI", "Comma"] },
  { id: "ring-fingers", name: "Ring Fingers", order: 9, keys: ["KeyS", "KeyW", "KeyX", "KeyL", "KeyO", "Period"] },
  { id: "pinky-fingers", name: "Pinky Fingers", order: 10, keys: ["KeyA", "KeyQ", "KeyZ", "Semicolon", "KeyP", "Slash", "Quote"] },

  // Index-finger stretch keys — the reaches off the home position that beginners miss.
  { id: "index-stretch", name: "Index Stretch", order: 11, keys: ["KeyG", "KeyT", "KeyB", "KeyH", "KeyY", "KeyN"] },

  // Tone marks and above/below vowels. These are combining marks; the drill generator hosts
  // them on a base consonant and never stacks them, so they read as real syllables.
  { id: "tone-marks", name: "Tone Marks & Vowels", order: 12, keys: ["KeyH", "KeyJ", "KeyY", "KeyU", "KeyB", "KeyN"] },

  // Number row, including the Minus/Equal reaches at the right edge.
  { id: "number-row", name: "Number Row", order: 13, keys: [
      "Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7", "Digit8", "Digit9", "Digit0", "Minus", "Equal",
    ] },

  // Everything together: full keyboard including numbers and edge keys.
  { id: "full-keyboard", name: "Full Keyboard", order: 14, keys: [
      "Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7", "Digit8", "Digit9", "Digit0", "Minus", "Equal",
      "KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU", "KeyI", "KeyO", "KeyP", "BracketLeft", "BracketRight",
      "KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyK", "KeyL", "Semicolon", "Quote",
      "KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM", "Comma", "Period", "Slash",
    ] },

  // Word- and phrase-style practice drawing from the Thai word pool, like the `words` unit.
  { id: "phrases", name: "Words & Phrases", order: 15, keys: [], pool: true },
  { id: "sentences", name: "Sentences", order: 16, keys: [], pool: true },
];

const byOrder = (a: LessonUnit, b: LessonUnit) => a.order - b.order;

export function orderedUnits(): LessonUnit[] {
  return [...UNITS].sort(byOrder);
}

export function getUnit(id: string): LessonUnit | undefined {
  return UNITS.find((u) => u.id === id);
}

export function nextUnitId(id: string): string | null {
  const ordered = orderedUnits();
  const i = ordered.findIndex((u) => u.id === id);
  if (i === -1 || i === ordered.length - 1) return null;
  return ordered[i + 1].id;
}
