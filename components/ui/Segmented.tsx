"use client";

type SegmentedOption<T extends string> = {
  value: T;
  label: string;
};

type SegmentedProps<T extends string> = {
  value: T;
  options: SegmentedOption<T>[];
  onChange: (v: T) => void;
  ariaLabel?: string;
};

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
}: SegmentedProps<T>) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      style={{
        display: "inline-flex",
        gap: "var(--space-1)",
        padding: "var(--space-1)",
        background: "var(--surface)",
        border: "1px solid var(--hairline)",
        borderRadius: "var(--radius-sm)",
      }}
    >
      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            data-testid={`seg-${opt.value}`}
            aria-pressed={isActive}
            onClick={() => onChange(opt.value)}
            style={{
              appearance: "none",
              border: "none",
              cursor: "pointer",
              font: "inherit",
              fontSize: 14,
              padding: "var(--space-1) var(--space-3)",
              borderRadius: "var(--radius-sm)",
              color: isActive ? "var(--accent)" : "var(--text)",
              background: isActive ? "var(--surface-2)" : "transparent",
              transition:
                "color var(--dur) var(--ease), background var(--dur) var(--ease)",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
