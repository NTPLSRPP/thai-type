import { KEYBOARD_ROWS } from "@/lib/layouts/geometry";
import { findKeyForChar } from "@/lib/layouts/reverse";
import type { Layout } from "@/lib/layouts/types";

const FINGER_COLOR: Record<string, string> = {
  "left-pinky": "#5b8def",
  "left-ring": "#43b581",
  "left-middle": "#e2b714",
  "left-index": "#e67e22",
  "right-index": "#e74c3c",
  "right-middle": "#9b59b6",
  "right-ring": "#1abc9c",
  "right-pinky": "#3498db",
};

interface KeyboardProps {
  layout: Layout;
  nextChar: string | null;
  errorCounts: Map<string, number>;
}

export function Keyboard({ layout, nextChar, errorCounts }: KeyboardProps) {
  const nextKey = nextChar ? findKeyForChar(layout, nextChar) : null;
  const maxErr = Math.max(1, ...Array.from(errorCounts.values()));

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        alignItems: "center",
        marginTop: 32,
      }}
    >
      {KEYBOARD_ROWS.map((row, ri) => (
        <div key={ri} style={{ display: "flex", gap: 6 }}>
          {row.map((code) => {
            const def = layout.keys[code];
            const isNext = nextKey?.code === code;
            const errs = def ? (errorCounts.get(def.normal) ?? 0) : 0;
            const heat = errs / maxErr;
            const isSpace = code === "Space";
            return (
              <div
                key={code}
                data-testid={`key-${code}`}
                data-next={isNext ? "true" : "false"}
                style={{
                  width: isSpace ? 280 : 38,
                  height: 38,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 6,
                  fontSize: 14,
                  color: "var(--text-typed)",
                  background: errs > 0 ? `rgba(202,71,84,${0.15 + heat * 0.55})` : "var(--bg)",
                  borderTopWidth: isNext ? 2 : 1,
                  borderLeftWidth: isNext ? 2 : 1,
                  borderRightWidth: isNext ? 2 : 1,
                  borderBottomWidth: 3,
                  borderStyle: "solid",
                  borderTopColor: isNext ? "var(--accent)" : "#3a3c3f",
                  borderLeftColor: isNext ? "var(--accent)" : "#3a3c3f",
                  borderRightColor: isNext ? "var(--accent)" : "#3a3c3f",
                  borderBottomColor: def ? (FINGER_COLOR[def.finger] ?? "#3a3c3f") : "#3a3c3f",
                  boxShadow: isNext ? "0 0 12px var(--accent)" : "none",
                  transform: isNext ? "translateY(-2px)" : "none",
                  transition: "transform 120ms, box-shadow 120ms",
                }}
              >
                {def && !isSpace ? def.normal : ""}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
