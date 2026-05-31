import { groupClusters } from "@/lib/engine/display";
import type { CharCell } from "@/lib/engine/types";

interface WordsProps {
  cells: CharCell[];
  cursor: number;
  text: string;
}

export function Words({ cells, cursor, text }: WordsProps) {
  const groups = groupClusters(cells, text);
  return (
    <div style={{ fontSize: 28, lineHeight: 1.8, letterSpacing: 1 }}>
      {groups.map((g, gi) => (
        <span key={gi} data-testid="cluster" style={{ display: "inline-block", whiteSpace: "pre" }}>
          {g.cells.map((c, k) => {
            const idx = g.indices[k];
            return (
              <span
                key={idx}
                data-testid="char"
                data-cursor={idx === cursor ? "true" : "false"}
                className={c.state}
                style={{
                  color:
                    c.state === "correct"
                      ? "var(--text-typed)"
                      : c.state === "incorrect"
                        ? "var(--error)"
                        : "var(--text)",
                  borderLeft: idx === cursor ? "2px solid var(--caret)" : "2px solid transparent",
                }}
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
