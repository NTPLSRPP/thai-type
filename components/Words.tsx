import { groupClusters } from "@/lib/engine/display";
import type { CharCell } from "@/lib/engine/types";
import type { CaretStyle } from "@/lib/storage/schema";

interface WordsProps {
  cells: CharCell[];
  cursor: number;
  text: string;
  caretStyle?: CaretStyle; // "off" | "line" | "block" | "underline"
  smoothCaret?: boolean;
  blind?: boolean; // hide per-character correctness (no red / typed color)
  fontSize?: number;
  fontFamily?: string;
}

export function Words({
  cells,
  cursor,
  text,
  caretStyle = "line",
  smoothCaret = true,
  blind = false,
  fontSize = 28,
  fontFamily,
}: WordsProps) {
  const groups = groupClusters(cells, text);
  return (
    <div style={{ fontSize, lineHeight: 1.8, letterSpacing: 1, fontFamily }}>
      {groups.map((g, gi) => (
        <span key={gi} data-testid="cluster" style={{ display: "inline-block", whiteSpace: "pre" }}>
          {g.cells.map((c, k) => {
            const idx = g.indices[k];
            const isCursor = idx === cursor;
            const baseColor = blind
              ? "var(--text)"
              : c.state === "correct"
                ? "var(--text-typed)"
                : c.state === "incorrect"
                  ? "var(--error)"
                  : "var(--text)";
            const style: React.CSSProperties = {
              color: baseColor,
              borderLeft: "2px solid transparent",
              transition: smoothCaret
                ? "background var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease)"
                : undefined,
            };
            const showCaret = isCursor && caretStyle !== "off";
            if (showCaret && caretStyle === "line") style.borderLeft = "2px solid var(--caret)";
            if (showCaret && caretStyle === "underline") style.borderBottom = "2px solid var(--caret)";
            if (showCaret && caretStyle === "block") {
              style.background = "var(--caret)";
              style.color = "var(--bg)";
            }
            // caret "off" keeps a faint cue so the cursor is never lost (esp. with blind mode).
            if (isCursor && caretStyle === "off") {
              style.borderBottom = "2px solid color-mix(in oklab, var(--caret) 30%, transparent)";
            }
            return (
              <span
                key={idx}
                data-testid="char"
                data-cursor={isCursor ? "true" : "false"}
                data-caret={isCursor ? caretStyle : "none"}
                className={c.state}
                style={style}
              >
                {c.target}
              </span>
            );
          })}
        </span>
      ))}
    </div>
  );
}
