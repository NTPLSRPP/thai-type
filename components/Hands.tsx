import type { HandFinger } from "@/lib/layouts/fingers";

export interface Tip {
  x: number;
  y: number;
  w: number;
  h: number;
}
export type Tips = Partial<Record<HandFinger, Tip>>;

// outer -> inner for each hand
const LEFT_IDS: HandFinger[] = ["left-pinky", "left-ring", "left-middle", "left-index"];
const RIGHT_IDS: HandFinger[] = ["right-index", "right-middle", "right-ring", "right-pinky"];

// ---- tiny vector helpers ----
type Pt = { x: number; y: number };
const sub = (a: Pt, b: Pt): Pt => ({ x: a.x - b.x, y: a.y - b.y });
const add = (a: Pt, b: Pt): Pt => ({ x: a.x + b.x, y: a.y + b.y });
const mul = (a: Pt, s: number): Pt => ({ x: a.x * s, y: a.y * s });
const norm = (a: Pt): Pt => {
  const l = Math.hypot(a.x, a.y) || 1;
  return { x: a.x / l, y: a.y / l };
};
const perp = (a: Pt): Pt => ({ x: -a.y, y: a.x });
const lerp = (a: Pt, b: Pt, t: number): Pt => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
const ease = (t: number) => t * t * (3 - 2 * t);
const S = (p: Pt) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`;

// A tapered finger/thumb outline (wide rounded base -> narrower rounded tip), any orientation.
function fingerD(base: Pt, tip: Pt, baseHalf: number, tipHalf: number): string {
  const dir = norm(sub(tip, base));
  const pp = perp(dir);
  const N = 10;
  const M = 9;
  const pts: Pt[] = [];
  const edge = (t: number, side: number) => {
    const c = lerp(base, tip, t);
    const h = baseHalf + (tipHalf - baseHalf) * ease(t);
    return add(c, mul(pp, side * h));
  };
  for (let i = 0; i <= N; i++) pts.push(edge(i / N, -1)); // up left edge
  for (let i = 1; i < M; i++) {
    // round the tip: sweep from -pp around the front (+dir) to +pp
    const th = (Math.PI * i) / M;
    pts.push(add(tip, add(mul(pp, -tipHalf * Math.cos(th)), mul(dir, tipHalf * Math.sin(th)))));
  }
  for (let i = N; i >= 0; i--) pts.push(edge(i / N, 1)); // down right edge
  return `M${pts.map(S).join("L")}Z`;
}

// Rounded trapezoid palm (knuckle line on top, narrower wrist below).
function palmD(cx: number, topY: number, botY: number, topHalf: number, botHalf: number): string {
  const r = Math.min(topHalf, botHalf) * 0.5;
  const tlx = cx - topHalf;
  const trx = cx + topHalf;
  const blx = cx - botHalf;
  const brx = cx + botHalf;
  return [
    `M${tlx + r},${topY}`,
    `L${trx - r},${topY}`,
    `Q${trx},${topY} ${trx},${topY + r}`,
    `L${brx},${botY - r}`,
    `Q${brx},${botY} ${brx - r},${botY}`,
    `L${blx + r},${botY}`,
    `Q${blx},${botY} ${blx},${botY - r}`,
    `L${tlx},${topY + r}`,
    `Q${tlx},${topY} ${tlx + r},${topY}`,
    "Z",
  ].join(" ");
}

interface FingerGeom {
  id: HandFinger;
  d: string;
  tip: Pt;
  base: Pt;
}
interface Geom {
  palm: string;
  palmCenter: Pt;
  fingers: FingerGeom[];
  thumb?: Omit<FingerGeom, "id">;
  tendonW: number;
}

// innerSign: which way the thumb leans (+1 = thumb to the right of fingers, left hand).
function buildHand(ids: HandFinger[], tips: Tips, thumbTip: Tip | undefined, innerSign: number): Geom | null {
  const present = ids
    .map((id) => ({ id, tip: tips[id] }))
    .filter((f): f is { id: HandFinger; tip: Tip } => !!f.tip);
  if (present.length === 0) return null;

  const keyW = present[0].tip.w;
  const keyH = present[0].tip.h;
  const tipPts = present.map((f) => ({ x: f.tip.x, y: f.tip.y + f.tip.h * 0.45 }));
  const cx = tipPts.reduce((s, p) => s + p.x, 0) / tipPts.length;
  const maxTipY = Math.max(...tipPts.map((p) => p.y));
  const palmCenter: Pt = { x: cx + innerSign * keyW * 0.18, y: maxTipY + keyH * 3.4 };
  const palmRadius = keyH * 0.9;
  const baseHalf = keyW * 0.34;
  const tipHalf = keyW * 0.26;

  const fingers: FingerGeom[] = present.map((f, i) => {
    const tip = tipPts[i];
    const dir = norm(sub(tip, palmCenter));
    const base = add(palmCenter, mul(dir, palmRadius));
    return { id: f.id, tip, base, d: fingerD(base, tip, baseHalf, tipHalf) };
  });

  const basesX = fingers.map((f) => f.base.x);
  const topHalf = (Math.max(...basesX) - Math.min(...basesX)) / 2 + keyW * 0.55;
  const botHalf = topHalf * 0.72;
  const topY = Math.min(...fingers.map((f) => f.base.y)) - keyH * 0.15;
  const botY = palmCenter.y + keyH * 1.6;
  const palm = palmD(palmCenter.x, topY, botY, topHalf, botHalf);

  let thumb: Geom["thumb"];
  if (thumbTip) {
    const tip = { x: thumbTip.x, y: thumbTip.y + thumbTip.h * 0.4 };
    const base = { x: palmCenter.x + innerSign * topHalf * 0.55, y: palmCenter.y + keyH * 0.1 };
    thumb = { tip, base, d: fingerD(base, tip, keyW * 0.46, keyW * 0.32) };
  }

  return { palm, palmCenter, fingers, thumb, tendonW: keyW * 0.12 };
}

// The light-grey hand silhouette: one translucent union with a thin outline (no internal seams).
function HandShape({ geom }: { geom: Geom }) {
  return (
    <g style={{ opacity: 0.5, color: "var(--hand-edge)" }} filter="url(#handOutline)">
      <path d={geom.palm} fill="var(--hand-fill)" />
      {geom.fingers.map((f) => (
        <path key={f.id} d={f.d} fill="var(--hand-fill)" />
      ))}
      {geom.thumb && <path d={geom.thumb.d} fill="var(--hand-fill)" />}
    </g>
  );
}

// Active-finger cue: accent-tinted finger + a "tendon" sweeping from the tip into the palm.
function Highlight({ d, tip, base, palm, w }: { d: string; tip: Pt; base: Pt; palm: Pt; w: number }) {
  const tail = lerp(base, palm, 0.55);
  return (
    <g style={{ filter: "drop-shadow(0 0 5px var(--accent))" }}>
      <path d={d} fill="color-mix(in oklab, var(--accent) 18%, transparent)" stroke="var(--accent)" strokeWidth={2.6} />
      <path
        d={`M${S(tip)} Q${S(base)} ${S(tail)}`}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={w}
        strokeLinecap="round"
      />
    </g>
  );
}

function HandRender({ geom, active }: { geom: Geom; active: HandFinger | null }) {
  return (
    <>
      <HandShape geom={geom} />
      {geom.fingers.map((f) => (
        <g key={f.id} data-testid={`finger-${f.id}`} data-active={f.id === active ? "true" : "false"}>
          {f.id === active && (
            <Highlight d={f.d} tip={f.tip} base={f.base} palm={geom.palmCenter} w={geom.tendonW} />
          )}
        </g>
      ))}
      {geom.thumb && (
        <g data-testid="finger-thumb" data-active={active === "thumb" ? "true" : "false"}>
          {active === "thumb" && (
            <Highlight d={geom.thumb.d} tip={geom.thumb.tip} base={geom.thumb.base} palm={geom.palmCenter} w={geom.tendonW} />
          )}
        </g>
      )}
    </>
  );
}

export function Hands({ tips, activeFinger }: { tips: Tips; activeFinger: HandFinger | null }) {
  if (Object.keys(tips).length === 0) return null;

  const space = tips.thumb;
  const leftThumb = space ? { ...space, x: space.x - space.w * 0.18 } : undefined;
  const rightThumb = space ? { ...space, x: space.x + space.w * 0.18 } : undefined;
  const left = buildHand(LEFT_IDS, tips, leftThumb, +1);
  const right = buildHand(RIGHT_IDS, tips, rightThumb, -1);

  // theme-aware grey hand tone; union opacity lets the key legends show through
  const vars = {
    "--hand-fill": "color-mix(in oklab, var(--text-typed) 52%, var(--bg) 48%)",
    "--hand-edge": "color-mix(in oklab, var(--text-typed) 80%, var(--bg) 20%)",
  } as React.CSSProperties;

  return (
    <svg
      data-testid="hands"
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible", pointerEvents: "none", zIndex: 3, ...vars }}
    >
      <defs>
        <filter id="handOutline" x="-20%" y="-20%" width="140%" height="140%">
          <feMorphology in="SourceAlpha" operator="dilate" radius="2.2" result="d" />
          <feFlood floodColor="currentColor" result="c" />
          <feComposite in="c" in2="d" operator="in" result="o" />
          <feMerge>
            <feMergeNode in="o" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {left && <HandRender geom={left} active={activeFinger} />}
      {right && <HandRender geom={right} active={activeFinger} />}
    </svg>
  );
}
