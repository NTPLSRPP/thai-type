import { groupClusters } from "@/lib/engine/display";
import type { CharCell } from "@/lib/engine/types";
import type { CaretStyle } from "@/lib/theme/types";

interface WordsProps {
  cells: CharCell[];
  cursor: number;
  text: string;
  caretStyle?: CaretStyle;
}

export function Words({ cells, cursor, text, caretStyle = "line" }: WordsProps) {
  const groups = groupClusters(cells, text);
  return (
    <div style={{ fontSize: 28, lineHeight: 1.8, letterSpacing: 1 }}>
      {groups.map((g, gi) => (
        <span key={gi} data-testid="cluster" style={{ display: "inline-block", whiteSpace: "pre" }}>
          {g.cells.map((c, k) => {
            const idx = g.indices[k];
            const isCursor = idx === cursor;
            const base: React.CSSProperties = {
              color:
                c.state === "correct"
                  ? "var(--text-typed)"
                  : c.state === "incorrect"
                    ? "var(--error)"
                    : "var(--text)",
            };
            if (isCursor && caretStyle === "line") base.borderLeft = "2px solid var(--caret)";
            else base.borderLeft = "2px solid transparent";
            if (isCursor && caretStyle === "underline") base.borderBottom = "2px solid var(--caret)";
            if (isCursor && caretStyle === "block") {
              base.background = "var(--caret)";
              base.color = "var(--bg)";
            }
            return (
              <span
                key={idx}
                data-testid="char"
                data-cursor={isCursor ? "true" : "false"}
                data-caret={isCursor ? caretStyle : "none"}
                className={c.state}
                style={base}
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
