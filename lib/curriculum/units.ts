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
