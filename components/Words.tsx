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
  // NOTE: no letter-spacing and no layout-affecting borders on the character spans.
  // Thai combining vowels/tone marks must shape onto their base consonant; any inserted
  // horizontal space (letter-spacing or a left border) before a mark detaches it. The
  // caret is drawn with box-shadow so it never adds layout width.
  return (
    <div style={{ fontSize, lineHeight: 2, fontFamily, overflowWrap: "break-word" }}>
      {groups.map((g, gi) => (
        // inline-block = atomic cluster: wraps BETWEEN clusters (no overflow), never breaks
        // a base consonant from its combining marks; whiteSpace:pre keeps the space cluster's width.
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
              transition: smoothCaret
                ? "color var(--dur-fast) var(--ease), box-shadow var(--dur-fast) var(--ease)"
                : undefined,
            };
            const showCaret = isCursor && caretStyle !== "off";
            if (showCaret && caretStyle === "line") style.boxShadow = "inset 2px 0 0 0 var(--caret)";
            if (showCaret && caretStyle === "underline") style.boxShadow = "inset 0 -2px 0 0 var(--caret)";
            if (showCaret && caretStyle === "block") {
              style.background = "var(--caret)";
              style.color = "var(--bg)";
            }
            // caret "off" keeps a faint cue so the cursor is never lost (esp. with blind mode).
            if (isCursor && caretStyle === "off") {
              style.boxShadow = "inset 0 -2px 0 0 color-mix(in oklab, var(--caret) 30%, transparent)";
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
