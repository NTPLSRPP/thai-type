"use client";
import { useState } from "react";
import type { Theme } from "@/lib/theme/types";
import { minimalDark } from "@/lib/theme/minimalDark";
import { FONT_OPTIONS } from "@/lib/theme/fonts";
import { putImage } from "@/lib/storage/imageStore";
import { ThemePreview } from "./ThemePreview";

const COLOR_VARS: { key: string; label: string }[] = [
  { key: "--bg", label: "Background" },
  { key: "--text", label: "Text" },
  { key: "--text-typed", label: "Typed text" },
  { key: "--accent", label: "Accent" },
  { key: "--error", label: "Error" },
  { key: "--caret", label: "Caret" },
];

let imgSeq = 0;

export function ThemeEditor({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Theme;
  onSave: (theme: Theme) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<Theme>(
    initial ?? {
      ...minimalDark,
      id: "draft",
      name: "My Theme",
      builtin: false,
      vars: { ...minimalDark.vars },
    },
  );

  const setVar = (k: string, v: string) => setDraft((d) => ({ ...d, vars: { ...d.vars, [k]: v } }));

  const onUpload = async (file: File) => {
    imgSeq += 1;
    const ref = `up-${imgSeq}-${file.size}`;
    await putImage(ref, file);
    setDraft((d) => ({ ...d, background: { imageRef: ref, blur: 6, overlayOpacity: 0.5 } }));
  };

  const isHex = (v: string) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <label style={lbl}>
          Name
          <input
            aria-label="name"
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            style={inp}
          />
        </label>

        {COLOR_VARS.map((c) => (
          <label key={c.key} style={lbl}>
            {c.label}
            <span style={{ display: "flex", gap: 8 }}>
              {isHex(draft.vars[c.key] ?? "") && (
                <input
                  type="color"
                  aria-label={c.label}
                  value={draft.vars[c.key]}
                  onChange={(e) => setVar(c.key, e.target.value)}
                />
              )}
              <input
                aria-label={`${c.label} value`}
                value={draft.vars[c.key] ?? ""}
                onChange={(e) => setVar(c.key, e.target.value)}
                style={inp}
              />
            </span>
          </label>
        ))}

        <label style={lbl}>
          Font
          <select
            aria-label="font"
            value={draft.vars["--font"]}
            onChange={(e) => setVar("--font", e.target.value)}
            style={inp}
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f.label} value={f.stack}>
                {f.label}
              </option>
            ))}
          </select>
        </label>

        <label style={lbl}>
          Caret
          <select
            aria-label="caret"
            value={draft.caretStyle}
            onChange={(e) => setDraft((d) => ({ ...d, caretStyle: e.target.value as Theme["caretStyle"] }))}
            style={inp}
          >
            <option value="line">Line</option>
            <option value="block">Block</option>
            <option value="underline">Underline</option>
          </select>
        </label>

        <label style={lbl}>
          Background image
          <input
            type="file"
            aria-label="background image"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
          />
        </label>

        {draft.background && (
          <>
            <label style={lbl}>
              Blur {draft.background.blur}px
              <input
                type="range"
                min={0}
                max={20}
                value={draft.background.blur}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, background: { ...d.background!, blur: Number(e.target.value) } }))
                }
              />
            </label>
            <label style={lbl}>
              Overlay {Math.round(draft.background.overlayOpacity * 100)}%
              <input
                type="range"
                min={0}
                max={100}
                value={draft.background.overlayOpacity * 100}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    background: { ...d.background!, overlayOpacity: Number(e.target.value) / 100 },
                  }))
                }
              />
            </label>
          </>
        )}

        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <button onClick={() => onSave(draft)} style={btn}>
            save
          </button>
          <button onClick={onCancel} style={btn}>
            cancel
          </button>
        </div>
      </div>

      <div>
        <ThemePreview theme={draft} />
      </div>
    </div>
  );
}

const lbl: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
  fontSize: 13,
  color: "var(--text)",
};
const inp: React.CSSProperties = {
  background: "var(--bg)",
  color: "var(--text-typed)",
  border: "1px solid #3a3c3f",
  borderRadius: 4,
  padding: "4px 8px",
};
const btn: React.CSSProperties = {
  background: "transparent",
  color: "var(--text)",
  border: "1px solid var(--text)",
  padding: "8px 16px",
  cursor: "pointer",
};
