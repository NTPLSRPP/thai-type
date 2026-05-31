import type { ReactNode } from "react";

type SettingRowProps = {
  title: string;
  description?: string;
  htmlFor?: string;
  children: ReactNode;
};

export function SettingRow({
  title,
  description,
  htmlFor,
  children,
}: SettingRowProps) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "var(--space-4)",
        padding: "var(--space-4) 0",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-1)",
          minWidth: 0,
          flex: "1 1 200px",
        }}
      >
        <label
          htmlFor={htmlFor}
          style={{
            fontSize: 16,
            color: "var(--text-typed)",
            lineHeight: 1.3,
          }}
        >
          {title}
        </label>
        {description ? (
          <span
            style={{
              fontSize: 13,
              color: "var(--text-muted)",
              lineHeight: 1.4,
            }}
          >
            {description}
          </span>
        ) : null}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        {children}
      </div>
    </div>
  );
}
