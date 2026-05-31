import type { Theme } from "@/lib/theme/types";

export function ThemePreview({ theme }: { theme: Theme }) {
  return (
    <div
      style={{
        padding: 20,
        borderRadius: 10,
        background: theme.vars["--bg"],
        fontFamily: theme.vars["--font"],
        border: `1px solid color-mix(in oklab, ${theme.vars["--text"]} 35%, transparent)`,
      }}
    >
      <div style={{ fontSize: 22 }}>
        <span style={{ color: theme.vars["--text-typed"] }}>สวัส</span>
        <span style={{ color: theme.vars["--text"] }}>ดีครับ</span>
        <span style={{ borderLeft: `2px solid ${theme.vars["--caret"]}` }} />
      </div>
      <div style={{ marginTop: 10, color: theme.vars["--accent"], fontSize: 14 }}>78 wpm · 96%</div>
    </div>
  );
}
