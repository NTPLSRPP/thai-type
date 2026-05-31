"use client";
import { useSettings } from "@/stores/settingsStore";
import { layoutList } from "@/lib/layouts/registry";

export function LayoutBar() {
  const { layoutId, inputMode, setLayout, setInputMode } = useSettings();
  return (
    <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 16, fontSize: 14 }}>
      {layoutList().map((l) => (
        <button
          key={l.id}
          onClick={() => setLayout(l.id)}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: layoutId === l.id ? "var(--accent)" : "var(--text)",
          }}
        >
          {l.name}
        </button>
      ))}
      <span style={{ opacity: 0.3 }}>|</span>
      <button
        onClick={() => setInputMode(inputMode === "app-remap" ? "os-native" : "app-remap")}
        style={{
          background: "transparent",
          border: "1px solid var(--text)",
          borderRadius: 4,
          cursor: "pointer",
          color: "var(--text)",
          padding: "2px 8px",
        }}
      >
        {inputMode === "app-remap" ? "app remap" : "os layout"}
      </button>
    </div>
  );
}
