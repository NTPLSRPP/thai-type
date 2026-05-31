import type { CharCell } from "@/lib/engine/types";

export function Words({ cells, cursor }: { cells: CharCell[]; cursor: number }) {
  return (
    <div style={{ fontSize: 28, lineHeight: 1.8, letterSpacing: 1 }}>
      {cells.map((c, i) => (
        <span
          key={i}
          data-testid="char"
          data-cursor={i === cursor ? "true" : "false"}
          className={c.state}
          style={{
            color:
              c.state === "correct"
                ? "var(--text-typed)"
                : c.state === "incorrect"
                  ? "var(--error)"
                  : "var(--text)",
            borderLeft: i === cursor ? "2px solid var(--caret)" : "2px solid transparent",
          }}
        >
          {c.target}
        </span>
      ))}
    </div>
  );
}
