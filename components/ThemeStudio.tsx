"use client";
import { useMemo, useState } from "react";
import { useTheme } from "@/stores/themeStore";
import type { Theme } from "@/lib/theme/types";
import { PRESETS } from "@/lib/theme/presets";
import { exportThemeCode, importThemeCode } from "@/lib/theme/serialize";
import { ThemeEditor } from "./ThemeEditor";

export function ThemeStudio() {
  const activeId = useTheme((s) => s.activeId);
  const customs = useTheme((s) => s.customs);
  const setActive = useTheme((s) => s.setActive);
  const addCustom = useTheme((s) => s.addCustom);
  const deleteCustom = useTheme((s) => s.deleteCustom);
  const [editing, setEditing] = useState(false);
  const [importText, setImportText] = useState("");

  const builtin = useMemo(() => PRESETS, []);

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

  function Card({ t }: { t: Theme }) {
    const isActive = t.id === activeId;
    return (
      <div
        data-testid={`theme-card-${t.id}`}
        data-active={isActive ? "true" : "false"}
        className="theme-card"
        role="button"
        tabIndex={0}
        aria-pressed={isActive}
        aria-label={`Use ${t.name} theme`}
        onClick={() => setActive(t.id)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setActive(t.id);
          }
        }}
      >
        <div style={{ padding: 14, background: t.vars["--bg"], fontFamily: t.vars["--font"] }}>
          <div style={{ fontSize: 18 }}>
            <span style={{ color: t.vars["--text-typed"] }}>สวัส</span>
            <span style={{ color: t.vars["--text"] }}>ดี</span>
            <span
              style={{
                display: "inline-block",
                width: 2,
                height: "1em",
                verticalAlign: "text-bottom",
                background: t.vars["--caret"],
                marginLeft: 1,
              }}
            />
          </div>
          <div style={{ fontSize: 12, color: t.vars["--accent"], marginTop: 6 }}>78 wpm · 96%</div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "8px 10px",
            fontSize: 13,
            background: t.vars["--bg"],
            color: t.vars["--text-typed"],
          }}
        >
          <span>{t.name}</span>
          {!t.builtin && (
            <span style={{ display: "flex", gap: 8 }}>
              <button
                aria-label={`export ${t.name}`}
                className="tt-icon-btn"
                style={{ color: t.vars["--text"] }}
                onClick={(e) => {
                  e.stopPropagation();
                  void navigator.clipboard?.writeText(exportThemeCode(t));
                }}
              >
                ⤴
              </button>
              <button
                aria-label={`delete ${t.name}`}
                className="tt-icon-btn"
                style={{ color: t.vars["--error"] }}
                onClick={(e) => {
                  e.stopPropagation();
                  deleteCustom(t.id);
                }}
              >
                ×
              </button>
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <button onClick={() => setEditing(true)} className="tt-btn">
          new theme
        </button>
        <input
          aria-label="import code"
          placeholder="paste theme code"
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          className="tt-input"
          style={{ flex: 1 }}
        />
        <button
          onClick={() => {
            const t = importThemeCode(importText.trim());
            if (t) {
              addCustom(t);
              setImportText("");
            }
          }}
          className="tt-btn"
        >
          import
        </button>
      </div>

      <Section title="Built-in">
        {builtin.map((t) => (
          <Card key={t.id} t={t} />
        ))}
      </Section>

      {customs.length > 0 && (
        <Section title="Your themes">
          {customs.map((t) => (
            <Card key={t.id} t={t} />
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 28 }}>
      <h2
        style={{
          fontSize: 12,
          textTransform: "uppercase",
          letterSpacing: 2,
          color: "var(--text)",
          marginBottom: 12,
        }}
      >
        {title}
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 14 }}>
        {children}
      </div>
    </section>
  );
}
