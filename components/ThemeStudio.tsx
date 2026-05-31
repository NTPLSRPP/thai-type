"use client";
import { useState } from "react";
import { useTheme } from "@/stores/themeStore";
import type { Theme } from "@/lib/theme/types";
import { exportThemeCode, importThemeCode } from "@/lib/theme/serialize";
import { ThemeEditor } from "./ThemeEditor";

export function ThemeStudio() {
  const { allThemes, activeId, setActive, addCustom, deleteCustom } = useTheme();
  const [editing, setEditing] = useState(false);
  const [importText, setImportText] = useState("");

  if (editing) {
    return (
      <ThemeEditor
        onSave={(t) => {
          addCustom(t);
          setEditing(false);
        }}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <button onClick={() => setEditing(true)} style={btn}>
          new theme
        </button>
        <input
          aria-label="import code"
          placeholder="paste theme code"
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          style={{ ...inp, flex: 1 }}
        />
        <button
          onClick={() => {
            const t = importThemeCode(importText.trim());
            if (t) {
              addCustom(t);
              setImportText("");
            }
          }}
          style={btn}
        >
          import
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 14 }}>
        {allThemes().map((t: Theme) => (
          <div
            key={t.id}
            data-testid={`theme-card-${t.id}`}
            onClick={() => setActive(t.id)}
            style={{
              cursor: "pointer",
              borderRadius: 10,
              overflow: "hidden",
              border: t.id === activeId ? "2px solid var(--accent)" : "1px solid #3a3c3f",
            }}
          >
            <div style={{ height: 70, background: t.vars["--bg"] }}>
              <div style={{ padding: 10, color: t.vars["--accent"], fontFamily: t.vars["--font"] }}>
                ก ข ค
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 10px",
                fontSize: 13,
              }}
            >
              <span>{t.name}</span>
              <span style={{ display: "flex", gap: 8 }}>
                {!t.builtin && (
                  <button
                    aria-label={`export ${t.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      void navigator.clipboard?.writeText(exportThemeCode(t));
                    }}
                    style={iconBtn("var(--text)")}
                  >
                    ⤴
                  </button>
                )}
                {!t.builtin && (
                  <button
                    aria-label={`delete ${t.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCustom(t.id);
                    }}
                    style={iconBtn("var(--error)")}
                  >
                    ×
                  </button>
                )}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const btn: React.CSSProperties = {
  background: "transparent",
  color: "var(--text)",
  border: "1px solid var(--text)",
  padding: "8px 16px",
  cursor: "pointer",
};
const inp: React.CSSProperties = {
  background: "var(--bg)",
  color: "var(--text-typed)",
  border: "1px solid #3a3c3f",
  borderRadius: 4,
  padding: "4px 8px",
};
const iconBtn = (color: string): React.CSSProperties => ({
  background: "none",
  border: "none",
  color,
  cursor: "pointer",
});
