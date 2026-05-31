import { KEYBOARD_ROWS } from "@/lib/layouts/geometry";
import { findKeyForChar } from "@/lib/layouts/reverse";
import type { Layout } from "@/lib/layouts/types";
import type { KeyboardSize } from "@/lib/storage/schema";

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

interface SizeSpec {
  key: number; // key width/height base (square-ish)
  height: number;
  font: number; // char font size — shift legend uses the SAME size
  gap: number;
  space: number; // spacebar width
  radius: number;
}

const SIZES: Record<KeyboardSize, SizeSpec> = {
  small: { key: 38, height: 44, font: 14, gap: 5, space: 300, radius: 7 },
  medium: { key: 50, height: 58, font: 18, gap: 7, space: 420, radius: 9 },
  large: { key: 64, height: 74, font: 24, gap: 9, space: 560, radius: 11 },
};

interface KeyboardProps {
  layout: Layout;
  nextChar: string | null;
  errorCounts: Map<string, number>;
  size?: KeyboardSize;
  showShiftLegend?: boolean;
  fingerColors?: boolean;
  nextKeyHint?: boolean;
  heatmap?: boolean;
}

export function Keyboard({
  layout,
  nextChar,
  errorCounts,
  size = "medium",
  showShiftLegend = true,
  fingerColors = true,
  nextKeyHint = true,
  heatmap = true,
}: KeyboardProps) {
  const nextKey = nextKeyHint && nextChar ? findKeyForChar(layout, nextChar) : null;
  const maxErr = Math.max(1, ...Array.from(errorCounts.values()));
  const sz = SIZES[size] ?? SIZES.medium;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: sz.gap,
        alignItems: "center",
        marginTop: "var(--space-8)",
      }}
    >
      {KEYBOARD_ROWS.map((row, ri) => (
        <div key={ri} style={{ display: "flex", gap: sz.gap }}>
          {row.map((code) => {
            const def = layout.keys[code];
            const isNext = nextKey?.code === code;
            const errs = heatmap && def ? (errorCounts.get(def.normal) ?? 0) : 0;
            const heat = errs / maxErr;
            const isSpace = code === "Space";
            const showShift = showShiftLegend && !!def && !isSpace && !!def.shift && def.shift !== def.normal;
            const fingerColor =
              fingerColors && def ? (FINGER_COLOR[def.finger] ?? "var(--hairline)") : "var(--hairline)";
            return (
              <div
                key={code}
                data-testid={`key-${code}`}
                data-next={isNext ? "true" : "false"}
                style={{
                  width: isSpace ? sz.space : sz.key,
                  height: sz.height,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  padding: isSpace ? 0 : `${Math.round(sz.font * 0.2)}px`,
                  borderRadius: sz.radius,
                  // keycap depth: subtle top-lit gradient + heat tint
                  background:
                    errs > 0
                      ? `rgba(202,71,84,${0.18 + heat * 0.5})`
                      : "linear-gradient(180deg, var(--surface-2), var(--surface))",
                  borderTopWidth: isNext ? 2 : 1,
                  borderLeftWidth: isNext ? 2 : 1,
                  borderRightWidth: isNext ? 2 : 1,
                  borderBottomWidth: Math.max(3, Math.round(sz.height * 0.07)),
                  borderStyle: "solid",
                  borderTopColor: isNext ? "var(--accent)" : "var(--hairline)",
                  borderLeftColor: isNext ? "var(--accent)" : "var(--hairline)",
                  borderRightColor: isNext ? "var(--accent)" : "var(--hairline)",
                  borderBottomColor: fingerColor,
                  boxShadow: isNext
                    ? "0 0 16px var(--accent), 0 4px 10px rgba(0,0,0,0.35)"
                    : "0 2px 4px rgba(0,0,0,0.25)",
                  transform: isNext ? "translateY(-3px)" : "none",
                  transition: "transform var(--dur-fast) var(--ease), box-shadow var(--dur-fast) var(--ease)",
                }}
              >
                {/* shift legend — SAME font size as the normal character, muted color */}
                <span
                  style={{
                    fontSize: sz.font,
                    lineHeight: 1,
                    color: "var(--text-muted)",
                    minHeight: showShift ? undefined : 0,
                    visibility: showShift ? "visible" : "hidden",
                  }}
                >
                  {showShift ? def!.shift : " "}
                </span>
                <span style={{ fontSize: sz.font, lineHeight: 1, color: "var(--text-typed)", fontWeight: 600 }}>
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
