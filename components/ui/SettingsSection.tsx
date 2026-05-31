import { Children, type ReactNode } from "react";

type SettingsSectionProps = {
  title: string;
  children: ReactNode;
};

export function SettingsSection({ title, children }: SettingsSectionProps) {
  const rows = Children.toArray(children);

  return (
    <section className="tt-card" style={{ padding: "var(--space-4) var(--space-6) var(--space-2)" }}>
      <h2 className="tt-section-title" style={{ marginTop: "var(--space-2)" }}>
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
