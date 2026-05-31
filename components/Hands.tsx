import type { HandFinger } from "@/lib/layouts/fingers";

interface FingerSpec {
  id: HandFinger;
  baseX: number;
  len: number;
  rot: number; // fan angle (deg), rotated about the finger base
  w: number;
}

// One hand drawn fingers-up (as seen typing from the front), viewBox 0 0 200 250.
const BASE = 168;
const PALM_BOTTOM = 246;

// Left hand: pinky..index left->right, thumb on the right (inner).
const LEFT: { fingers: FingerSpec[]; thumb: FingerSpec } = {
  fingers: [
    { id: "left-pinky", baseX: 36, len: 78, rot: -15, w: 26 },
    { id: "left-ring", baseX: 74, len: 104, rot: -5, w: 28 },
    { id: "left-middle", baseX: 112, len: 114, rot: 4, w: 28 },
    { id: "left-index", baseX: 150, len: 100, rot: 14, w: 28 },
  ],
  thumb: { id: "thumb", baseX: 168, len: 76, rot: 62, w: 30 },
};

type HandShape = { fingers: FingerSpec[]; thumb: FingerSpec };

const RIGHT: HandShape = (() => {
  const mir = (s: FingerSpec): FingerSpec => ({ ...s, baseX: 200 - s.baseX, rot: -s.rot });
  const fingers = LEFT.fingers.map(mir).reverse();
  const ids: HandFinger[] = ["right-pinky", "right-ring", "right-middle", "right-index"];
  return { fingers: fingers.map((s, i) => ({ ...s, id: ids[i] })), thumb: { ...mir(LEFT.thumb), id: "thumb" } };
})();

function Finger({ f, active }: { f: FingerSpec; active: HandFinger | null }) {
  const on = f.id === active;
  return (
    <g transform={`rotate(${f.rot} ${f.baseX} ${BASE})`}>
      <rect
        data-testid={`finger-${f.id}`}
        data-active={on ? "true" : "false"}
        x={f.baseX - f.w / 2}
        y={BASE - f.len}
        width={f.w}
        height={f.len + 40}
        rx={f.w / 2}
        fill={on ? "var(--accent)" : "var(--hand)"}
        stroke={on ? "var(--text-typed)" : "var(--hand-edge)"}
        strokeWidth={on ? 2 : 1}
        style={{
          filter: on ? "drop-shadow(0 0 10px var(--accent))" : undefined,
          transform: on ? "translateY(-8px)" : undefined,
          transformBox: "fill-box",
          transition: "transform var(--dur) var(--ease)",
        }}
      />
    </g>
  );
}

function Hand({ spec, active }: { spec: HandShape; active: HandFinger | null }) {
  return (
    <svg viewBox="0 0 200 250" width="100%" height="100%" aria-hidden="true" style={{ display: "block" }}>
      <path
        d={`M 28 ${BASE - 6} Q 18 ${PALM_BOTTOM} 70 ${PALM_BOTTOM} L 150 ${PALM_BOTTOM} Q 188 ${PALM_BOTTOM} 176 ${BASE - 10} Z`}
        fill="var(--hand)"
        stroke="var(--hand-edge)"
        strokeWidth={1}
      />
      {spec.fingers.map((f) => (
        <Finger key={f.id} f={f} active={active} />
      ))}
      <Finger f={spec.thumb} active={active} />
    </svg>
  );
}

export function Hands({ activeFinger, overlay = false }: { activeFinger: HandFinger | null; overlay?: boolean }) {
  const vars = {
    "--hand": overlay
      ? "color-mix(in oklab, var(--text-typed) 20%, transparent)"
      : "color-mix(in oklab, var(--text-typed) 30%, var(--bg))",
    "--hand-edge": "color-mix(in oklab, var(--text-typed) 45%, transparent)",
  } as React.CSSProperties;

  const containerStyle: React.CSSProperties = overlay
    ? {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: "80%",
        display: "flex",
        justifyContent: "space-between",
        padding: "0 3%",
        pointerEvents: "none",
        zIndex: 2,
        ...vars,
      }
    : {
        display: "flex",
        justifyContent: "center",
        gap: "var(--space-8)",
        marginTop: "var(--space-6)",
        ...vars,
      };

  const handBox: React.CSSProperties = overlay ? { width: "33%", maxWidth: 300 } : { width: 150, height: 190 };

  return (
    <div data-testid="hands" style={containerStyle}>
      <div style={handBox}>
        <Hand spec={LEFT} active={activeFinger} />
      </div>
      <div style={handBox}>
        <Hand spec={RIGHT} active={activeFinger} />
      </div>
    </div>
  );
}
