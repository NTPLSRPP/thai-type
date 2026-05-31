import { Children, type ReactNode } from "react";

type SettingsSectionProps = {
  title: string;
  children: ReactNode;
};

export function SettingsSection({ title, children }: SettingsSectionProps) {
  const rows = Children.toArray(children);

  return (
    <section
      style={{
        background: "var(--surface)",
        border: "1px solid var(--hairline)",
        borderRadius: "var(--radius)",
        padding: "var(--space-3) var(--space-6)",
      }}
    >
      <h2
        style={{
          margin: 0,
          paddingTop: "var(--space-3)",
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--accent)",
        }}
      >
        {title}
      </h2>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {rows.map((row, index) => (
          <div
            key={index}
            style={{
              borderTop:
                index === 0 ? "none" : "1px solid var(--hairline)",
            }}
          >
            {row}
          </div>
        ))}
      </div>
    </section>
  );
}
