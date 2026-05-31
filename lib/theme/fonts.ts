export interface FontOption {
  label: string;
  stack: string;
}

export const FONT_OPTIONS: FontOption[] = [
  { label: "Mono (default)", stack: "'JetBrains Mono', ui-monospace, monospace" },
  { label: "Sarabun", stack: "'Sarabun', system-ui, sans-serif" },
  { label: "Noto Sans Thai", stack: "'Noto Sans Thai', system-ui, sans-serif" },
  { label: "Leelawadee / Thonburi", stack: "'Leelawadee UI', 'Thonburi', system-ui, sans-serif" },
  { label: "System", stack: "system-ui, -apple-system, sans-serif" },
];
