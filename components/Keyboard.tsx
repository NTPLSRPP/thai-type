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
  showShiftLegend?: boolean;
  fingerColors?: boolean;
  nextKeyHint?: boolean;
  heatmap?: boolean;
}

export function Keyboard({
  layout,
  nextChar,
  errorCounts,
  showShiftLegend = true,
  fingerColors = true,
  nextKeyHint = true,
  heatmap = true,
}: KeyboardProps) {
  const nextKey = nextKeyHint && nextChar ? findKeyForChar(layout, nextChar) : null;
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
            const errs = heatmap && def ? (errorCounts.get(def.normal) ?? 0) : 0;
            const heat = errs / maxErr;
            const isSpace = code === "Space";
            const showShift = showShiftLegend && !!def && !isSpace && !!def.shift && def.shift !== def.normal;
            const fingerColor = fingerColors && def ? (FINGER_COLOR[def.finger] ?? "var(--hairline)") : "var(--hairline)";
            return (
              <div
                key={code}
                data-testid={`key-${code}`}
                data-next={isNext ? "true" : "false"}
                style={{
                  width: isSpace ? 280 : 40,
                  height: 40,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "stretch",
                  justifyContent: "center",
                  padding: isSpace ? 0 : "2px 5px",
                  borderRadius: 6,
                  background: errs > 0 ? `rgba(202,71,84,${0.15 + heat * 0.55})` : "var(--bg)",
                  borderTopWidth: isNext ? 2 : 1,
                  borderLeftWidth: isNext ? 2 : 1,
                  borderRightWidth: isNext ? 2 : 1,
                  borderBottomWidth: 3,
                  borderStyle: "solid",
                  borderTopColor: isNext ? "var(--accent)" : "var(--hairline)",
                  borderLeftColor: isNext ? "var(--accent)" : "var(--hairline)",
                  borderRightColor: isNext ? "var(--accent)" : "var(--hairline)",
                  borderBottomColor: fingerColor,
                  boxShadow: isNext ? "0 0 12px var(--accent)" : "none",
                  transform: isNext ? "translateY(-2px)" : "none",
                  transition: "transform 120ms, box-shadow 120ms",
                }}
              >
                {/* shift legend, top — dim */}
                <span
                  style={{
                    fontSize: 9,
                    lineHeight: 1,
                    textAlign: "right",
                    color: "var(--text-muted)",
                    minHeight: 9,
                  }}
                >
                  {showShift ? def!.shift : ""}
                </span>
                {/* normal char, bottom — primary */}
                <span style={{ fontSize: 14, lineHeight: 1, textAlign: "center", color: "var(--text-typed)" }}>
                  {def && !isSpace ? def.normal : ""}
                </span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
