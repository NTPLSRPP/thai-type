export interface FontOption {
  label: string;
  stack: string;
}

// Only families that actually load are advertised as guaranteed. "Noto Sans Thai" is
// loaded via next/font (app/layout.tsx) and exposed as --font-noto-thai. The OS-dependent
// Thai faces are labelled so users know they fall back when not installed.
export const FONT_OPTIONS: FontOption[] = [
  { label: "Mono", stack: "ui-monospace, 'JetBrains Mono', 'Cascadia Code', monospace" },
  { label: "Noto Sans Thai", stack: "var(--font-noto-thai), system-ui, sans-serif" },
  { label: "Sarabun (if installed)", stack: "'Sarabun', var(--font-noto-thai), system-ui, sans-serif" },
  { label: "Leelawadee / Thonburi (if installed)", stack: "'Leelawadee UI', 'Thonburi', var(--font-noto-thai), system-ui, sans-serif" },
  { label: "System", stack: "system-ui, -apple-system, sans-serif" },
];
