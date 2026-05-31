"use client";

type SliderProps = {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  id?: string;
  ariaLabel?: string;
};

export function Slider({ value, min, max, step, onChange, id, ariaLabel }: SliderProps) {
  const range = max - min;
  const fraction = range > 0 ? (value - min) / range : 0;
  const percent = Math.min(100, Math.max(0, fraction * 100));

  return (
    <input
      id={id}
      type="range"
      data-testid="slider"
      aria-label={ariaLabel}
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="tt-slider"
      style={{
        width: "100%",
        minWidth: 140,
        accentColor: "var(--accent)",
        // Linear-gradient fill expresses progress without JS on browsers
        // that honor it; accentColor covers the native fallback.
        background: `linear-gradient(to right, var(--accent) ${percent}%, var(--surface-2) ${percent}%)`,
        height: 4,
        borderRadius: 999,
        cursor: "pointer",
      }}
    />
  );
}
