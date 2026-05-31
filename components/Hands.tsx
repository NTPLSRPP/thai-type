import type { HandFinger } from "@/lib/layouts/fingers";

export interface Tip {
  x: number;
  y: number;
  w: number;
  h: number;
}
export type Tips = Partial<Record<HandFinger, Tip>>;

const LEFT_IDS: HandFinger[] = ["left-pinky", "left-ring", "left-middle", "left-index"];
const RIGHT_IDS: HandFinger[] = ["right-index", "right-middle", "right-ring", "right-pinky"];

function FingerStroke({
  id,
  tip,
  palmX,
  palmY,
  on,
}: {
  id: HandFinger;
  tip: Tip;
  palmX: number;
  palmY: number;
  on: boolean;
}) {
  const tipY = tip.y + tip.h * 0.42; // pad sits on the key
  // knuckle fans slightly out from palm center toward the tip
  const baseX = palmX + (tip.x - palmX) * 0.28;
  const baseY = palmY - tip.h * 0.4;
  const width = Math.max(10, tip.w * 0.62);
  return (
    <g data-testid={`finger-${id}`} data-active={on ? "true" : "false"} style={{ transition: "all var(--dur) var(--ease)" }}>
      <line
        x1={baseX}
        y1={baseY}
        x2={tip.x}
        y2={tipY}
        stroke={on ? "var(--accent)" : "var(--hand)"}
        strokeWidth={width}
        strokeLinecap="round"
        style={{ filter: on ? "drop-shadow(0 0 10px var(--accent))" : undefined }}
      />
      {/* fingertip pad on the key */}
      <circle
        cx={tip.x}
        cy={tipY}
        r={width * 0.55}
        fill={on ? "var(--accent)" : "var(--hand-tip)"}
        stroke={on ? "var(--text-typed)" : "var(--hand-edge)"}
        strokeWidth={on ? 2 : 1}
      />
    </g>
  );
}

function Hand({ ids, tips, thumb, active }: { ids: HandFinger[]; tips: Tips; thumb?: Tip; active: HandFinger | null }) {
  const present = ids.map((id) => ({ id, tip: tips[id] })).filter((f): f is { id: HandFinger; tip: Tip } => !!f.tip);
  if (present.length === 0) return null;
  const xs = present.map((f) => f.tip.x);
  const ys = present.map((f) => f.tip.y);
  const palmX = xs.reduce((a, b) => a + b, 0) / xs.length;
  const keyH = present[0].tip.h;
  const palmY = Math.max(...ys) + keyH * 2.4;
  const palmRx = (Math.max(...xs) - Math.min(...xs)) / 2 + keyH * 0.9;
  const palmRy = keyH * 1.1;
  const thumbOn = active === "thumb";

  return (
    <g>
      {/* palm */}
      <ellipse cx={palmX} cy={palmY} rx={palmRx} ry={palmRy} fill="var(--hand)" />
      {/* thumb toward the space bar */}
      {thumb && (
        <line
          data-testid="finger-thumb"
          data-active={thumbOn ? "true" : "false"}
          x1={palmX + (thumb.x - palmX) * 0.4}
          y1={palmY - keyH * 0.2}
          x2={thumb.x}
          y2={thumb.y + thumb.h * 0.5}
          stroke={thumbOn ? "var(--accent)" : "var(--hand)"}
          strokeWidth={Math.max(12, present[0].tip.w * 0.7)}
          strokeLinecap="round"
          style={{ filter: thumbOn ? "drop-shadow(0 0 10px var(--accent))" : undefined }}
        />
      )}
      {present.map((f) => (
        <FingerStroke key={f.id} id={f.id} tip={f.tip} palmX={palmX} palmY={palmY} on={f.id === active} />
      ))}
    </g>
  );
}

export function Hands({ tips, activeFinger }: { tips: Tips; activeFinger: HandFinger | null }) {
  const hasTips = Object.keys(tips).length > 0;
  if (!hasTips) return null;

  // theme-aware translucent hand tone so the keys remain visible underneath
  const vars = {
    "--hand": "color-mix(in oklab, var(--text-typed) 22%, transparent)",
    "--hand-tip": "color-mix(in oklab, var(--text-typed) 34%, transparent)",
    "--hand-edge": "color-mix(in oklab, var(--text-typed) 45%, transparent)",
  } as React.CSSProperties;

  // left thumb sits on the left side of the space bar, right thumb on the right side
  const space = tips.thumb;
  const leftThumb = space ? { ...space, x: space.x - space.w * 0.22 } : undefined;
  const rightThumb = space ? { ...space, x: space.x + space.w * 0.22 } : undefined;

  return (
    <svg
      data-testid="hands"
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible", pointerEvents: "none", zIndex: 3, ...vars }}
    >
      <Hand ids={LEFT_IDS} tips={tips} thumb={leftThumb} active={activeFinger} />
      <Hand ids={RIGHT_IDS} tips={tips} thumb={rightThumb} active={activeFinger} />
    </svg>
  );
}
