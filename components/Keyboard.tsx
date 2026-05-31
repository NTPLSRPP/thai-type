import { findKeyForChar } from "@/lib/layouts/reverse";
import { FINGER_COLOR } from "@/lib/layouts/fingers";
import type { Layout } from "@/lib/layouts/types";
import type { KeyboardSize } from "@/lib/storage/schema";

// A full MacBook-style key. `code` keys are real typing keys (char comes from the layout);
// keys with only a `label` are decorative modifier keys (Tab, Shift, ⌘, …). `w` = width units.
interface KeyDesc {
  code?: string;
  label?: string;
  w?: number;
}

const ROWS: KeyDesc[][] = [
  [
    { code: "Backquote" }, { code: "Digit1" }, { code: "Digit2" }, { code: "Digit3" }, { code: "Digit4" },
    { code: "Digit5" }, { code: "Digit6" }, { code: "Digit7" }, { code: "Digit8" }, { code: "Digit9" },
    { code: "Digit0" }, { code: "Minus" }, { code: "Equal" }, { label: "⌫", w: 1.5 },
  ],
  [
    { label: "tab", w: 1.5 }, { code: "KeyQ" }, { code: "KeyW" }, { code: "KeyE" }, { code: "KeyR" },
    { code: "KeyT" }, { code: "KeyY" }, { code: "KeyU" }, { code: "KeyI" }, { code: "KeyO" }, { code: "KeyP" },
    { code: "BracketLeft" }, { code: "BracketRight" }, { code: "Backslash" },
  ],
  [
    { label: "⇪", w: 1.75 }, { code: "KeyA" }, { code: "KeyS" }, { code: "KeyD" }, { code: "KeyF" },
    { code: "KeyG" }, { code: "KeyH" }, { code: "KeyJ" }, { code: "KeyK" }, { code: "KeyL" },
    { code: "Semicolon" }, { code: "Quote" }, { label: "return", w: 1.75 },
  ],
  [
    { label: "⇧", w: 2.25 }, { code: "KeyZ" }, { code: "KeyX" }, { code: "KeyC" }, { code: "KeyV" },
    { code: "KeyB" }, { code: "KeyN" }, { code: "KeyM" }, { code: "Comma" }, { code: "Period" },
    { code: "Slash" }, { label: "⇧", w: 2.25 },
  ],
  [
    { label: "fn" }, { label: "⌃" }, { label: "⌥" }, { label: "⌘", w: 1.25 },
    { code: "Space", w: 6.25 },
    { label: "⌘", w: 1.25 }, { label: "⌥" }, { label: "arrows", w: 2 },
  ],
];

interface SizeSpec { unit: number; height: number; font: number; gap: number; radius: number; mod: number }
const SIZES: Record<KeyboardSize, SizeSpec> = {
  small: { unit: 34, height: 42, font: 13, gap: 5, radius: 7, mod: 10 },
  medium: { unit: 44, height: 52, font: 17, gap: 6, radius: 9, mod: 12 },
  large: { unit: 56, height: 66, font: 22, gap: 8, radius: 11, mod: 14 },
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

  const chicletBase: React.CSSProperties = {
    height: sz.height,
    borderRadius: sz.radius,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
    borderStyle: "solid",
    borderWidth: 1,
    borderBottomWidth: Math.max(3, Math.round(sz.height * 0.07)),
    borderTopColor: "var(--hairline)",
    borderLeftColor: "var(--hairline)",
    borderRightColor: "var(--hairline)",
    borderBottomColor: "var(--hairline)",
    flexShrink: 0,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: sz.gap, alignItems: "center", marginTop: "var(--space-8)" }}>
      {ROWS.map((row, ri) => (
        <div key={ri} style={{ display: "flex", gap: sz.gap }}>
          {row.map((k, ki) => {
            const width = sz.unit * (k.w ?? 1);

            // modifier (decorative) key
            if (!k.code) {
              if (k.label === "arrows") {
                return <ArrowCluster key={ki} sz={sz} base={chicletBase} />;
              }
              return (
                <div
                  key={ki}
                  aria-hidden="true"
                  style={{
                    ...chicletBase,
                    width,
                    background: "linear-gradient(180deg, var(--surface), color-mix(in oklab, var(--surface) 60%, var(--bg)))",
                    borderBottomColor: "var(--hairline)",
                    color: "var(--text-muted)",
                    fontSize: sz.mod,
                  }}
                >
                  {k.label}
                </div>
              );
            }

            // typing key
            const code = k.code;
            const def = layout.keys[code];
            const isNext = nextKey?.code === code;
            const errs = heatmap && def ? (errorCounts.get(def.normal) ?? 0) : 0;
            const heat = errs / maxErr;
            const isSpace = code === "Space";
            const showShift = showShiftLegend && !!def && !isSpace && !!def.shift && def.shift !== def.normal;
            const fingerColor = fingerColors && def ? (FINGER_COLOR[def.finger] ?? "var(--hairline)") : "var(--hairline)";
            return (
              <div
                key={ki}
                data-testid={`key-${code}`}
                data-next={isNext ? "true" : "false"}
                style={{
                  ...chicletBase,
                  width,
                  padding: isSpace ? 0 : `${Math.round(sz.font * 0.18)}px`,
                  gap: 2,
                  background:
                    errs > 0
                      ? `rgba(202,71,84,${0.18 + heat * 0.5})`
                      : "linear-gradient(180deg, var(--surface-2), var(--surface))",
                  borderTopColor: isNext ? "var(--accent)" : "var(--hairline)",
                  borderLeftColor: isNext ? "var(--accent)" : "var(--hairline)",
                  borderRightColor: isNext ? "var(--accent)" : "var(--hairline)",
                  borderBottomColor: fingerColor,
                  boxShadow: isNext
                    ? "0 0 16px var(--accent), 0 4px 10px rgba(0,0,0,0.4)"
                    : "0 2px 4px rgba(0,0,0,0.3)",
                  transform: isNext ? "translateY(-3px)" : "none",
                  transition: "transform var(--dur-fast) var(--ease), box-shadow var(--dur-fast) var(--ease)",
                }}
              >
                <span
                  style={{
                    fontSize: sz.font,
                    lineHeight: 1,
                    color: "var(--text-muted)",
                    visibility: showShift ? "visible" : "hidden",
                  }}
                >
                  {showShift ? def!.shift : " "}
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

// MacBook inverted-T arrow cluster: ◀ , (▲ over ▼) , ▶
function ArrowCluster({ sz, base }: { sz: SizeSpec; base: React.CSSProperties }) {
  const arrow: React.CSSProperties = {
    ...base,
    width: sz.unit,
    background: "linear-gradient(180deg, var(--surface), color-mix(in oklab, var(--surface) 60%, var(--bg)))",
    borderBottomColor: "var(--hairline)",
    color: "var(--text-muted)",
    fontSize: sz.mod,
  };
  const halfHeight = (sz.height - 2) / 2;
  const halfArrow: React.CSSProperties = { ...arrow, height: halfHeight, borderBottomWidth: 1 };
  return (
    <div style={{ display: "flex", gap: sz.gap }} aria-hidden="true">
      <div style={arrow}>◀</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2, justifyContent: "center" }}>
        <div style={halfArrow}>▲</div>
        <div style={halfArrow}>▼</div>
      </div>
      <div style={arrow}>▶</div>
    </div>
  );
}
