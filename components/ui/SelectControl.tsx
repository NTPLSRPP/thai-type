"use client";

type SelectOption = {
  value: string;
  label: string;
};

type SelectControlProps = {
  value: string;
  options: SelectOption[];
  onChange: (v: string) => void;
  id?: string;
  ariaLabel?: string;
};

export function SelectControl({
  value,
  options,
  onChange,
  id,
  ariaLabel,
}: SelectControlProps) {
  return (
    <select
      id={id}
      className="tt-input"
      data-testid="select"
      aria-label={ariaLabel}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        cursor: "pointer",
        minWidth: 140,
      }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
