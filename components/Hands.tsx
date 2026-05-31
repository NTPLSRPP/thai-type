import { FINGER_COLOR, type HandFinger } from "@/lib/layouts/fingers";

interface FingerSpec {
  id: HandFinger;
  cx: number;
  len: number;
}

// fingers point up; palm sits at the bottom. Outer finger (pinky) toward the outer edge.
const LEFT: FingerSpec[] = [
  { id: "left-pinky", cx: 20, len: 42 },
  { id: "left-ring", cx: 44, len: 62 },
  { id: "left-middle", cx: 68, len: 74 },
  { id: "left-index", cx: 92, len: 60 },
];
const RIGHT: FingerSpec[] = [
  { id: "right-index", cx: 38, len: 60 },
  { id: "right-middle", cx: 62, len: 74 },
  { id: "right-ring", cx: 86, len: 62 },
  { id: "right-pinky", cx: 110, len: 42 },
];

const PALM_TOP = 112;

function fill(id: HandFinger, active: HandFinger | null): string {
  if (id === active) return FINGER_COLOR[id];
  return `color-mix(in oklab, ${FINGER_COLOR[id]} 28%, transparent)`;
}

function Hand({ fingers, thumbCx, thumbDir, active }: { fingers: FingerSpec[]; thumbCx: number; thumbDir: 1 | -1; active: HandFinger | null }) {
  const thumbActive = active === "thumb";
  return (
    <svg width="130" height="160" viewBox="0 0 130 160" aria-hidden="true">
      {/* palm */}
      <rect x={10} y={PALM_TOP} width={110} height={42} rx={18} fill="var(--surface-2)" stroke="var(--hairline)" />
      {/* thumb */}
      <g transform={`rotate(${thumbDir * 38} ${thumbCx} ${PALM_TOP + 8})`}>
        <rect
          data-testid="finger-thumb"
          data-active={thumbActive ? "true" : "false"}
          x={thumbCx - 9}
          y={PALM_TOP - 18}
          width={18}
          height={40}
          rx={9}
          fill={fill("thumb", active)}
          stroke={thumbActive ? "var(--text-typed)" : "transparent"}
          strokeWidth={2}
        />
      </g>
      {/* fingers */}
      {fingers.map((f) => {
        const on = f.id === active;
        return (
          <rect
            key={f.id}
            data-testid={`finger-${f.id}`}
            data-active={on ? "true" : "false"}
            x={f.cx - 9}
            y={PALM_TOP - f.len}
            width={18}
            height={f.len + 24}
            rx={9}
            fill={fill(f.id, active)}
            stroke={on ? "var(--text-typed)" : "transparent"}
            strokeWidth={2}
            style={{ filter: on ? "drop-shadow(0 0 8px var(--accent))" : undefined }}
          />
        );
      })}
    </svg>
  );
}

export function Hands({ activeFinger }: { activeFinger: HandFinger | null }) {
  return (
    <div
      data-testid="hands"
      style={{ display: "flex", gap: "var(--space-8)", justifyContent: "center", marginTop: "var(--space-6)" }}
    >
      <Hand fingers={LEFT} thumbCx={112} thumbDir={1} active={activeFinger} />
      <Hand fingers={RIGHT} thumbCx={18} thumbDir={-1} active={activeFinger} />
    </div>
  );
}
