"use client";

type ToggleProps = {
  checked: boolean;
  onChange: (v: boolean) => void;
  id?: string;
};

const TRACK_WIDTH = 40;
const TRACK_HEIGHT = 22;
const KNOB_SIZE = 16;
const KNOB_INSET = (TRACK_HEIGHT - KNOB_SIZE) / 2;
const KNOB_TRAVEL = TRACK_WIDTH - KNOB_SIZE - KNOB_INSET * 2;

export function Toggle({ checked, onChange, id }: ToggleProps) {
  const handleToggle = () => onChange(!checked);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      data-testid="toggle"
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      style={{
        position: "relative",
        width: TRACK_WIDTH,
        height: TRACK_HEIGHT,
        flexShrink: 0,
        padding: 0,
        border: "1px solid var(--hairline)",
        borderRadius: 999,
        background: checked ? "var(--accent)" : "var(--surface-2)",
        cursor: "pointer",
        transition: "background var(--dur) var(--ease)",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          top: KNOB_INSET,
          left: KNOB_INSET,
          width: KNOB_SIZE,
          height: KNOB_SIZE,
          borderRadius: "50%",
          background: checked ? "var(--bg)" : "var(--text-typed)",
          transform: checked ? `translateX(${KNOB_TRAVEL}px)` : "translateX(0)",
          transition: "transform var(--dur) var(--ease), background var(--dur) var(--ease)",
        }}
      />
    </button>
  );
}
