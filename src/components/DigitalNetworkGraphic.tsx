import { CSSProperties } from 'react';
import { NetworkIcon, NetworkIconName } from './Icons';

// Abstract digital-marketing / data-network illustration, drawn entirely in
// SVG. Everything is generated from a deterministic seeded PRNG so server
// and client render byte-identically (no hydration mismatch) while each
// variant still gets its own node positions, curve set, density and
// orientation.

export type NetworkVariant =
  | 'home'
  | 'research'
  | 'publications'
  | 'teaching'
  | 'service'
  | 'conference'
  | 'contact';

interface VariantSpec {
  /** Number of flowing analytical curves in the data-wave bundle. */
  waves: number;
  /** Number of sparse network nodes. */
  nodes: number;
  /** Number of tiny data-point clusters. */
  clusters: number;
  /** Overall opacity multiplier. */
  opacity: number;
  /** Horizontal mirror. */
  flip: boolean;
  /** Channel icons placed on the network, with normalised positions. */
  icons: { name: NetworkIconName; x: number; y: number; r: number }[];
  /** Direction the wave bundle sweeps. */
  waveTilt: number;
  seed: number;
}

const VARIANTS: Record<NetworkVariant, VariantSpec> = {
  home: {
    waves: 10,
    nodes: 52,
    clusters: 9,
    opacity: 1,
    flip: false,
    waveTilt: -12,
    seed: 1701,
    icons: [
      { name: 'chart', x: 0.5, y: 0.1, r: 30 },
      { name: 'users', x: 0.72, y: 0.2, r: 28 },
      { name: 'cart', x: 0.9, y: 0.36, r: 29 },
      { name: 'mobile', x: 0.62, y: 0.44, r: 27 },
      { name: 'database', x: 0.84, y: 0.6, r: 29 },
      { name: 'bank', x: 0.66, y: 0.76, r: 27 },
      { name: 'globe', x: 0.94, y: 0.86, r: 26 },
    ],
  },
  research: {
    waves: 8,
    nodes: 30,
    clusters: 6,
    opacity: 1,
    flip: false,
    waveTilt: -8,
    seed: 3312,
    icons: [
      { name: 'users', x: 0.68, y: 0.12, r: 28 },
      { name: 'mobile', x: 0.34, y: 0.3, r: 25 },
      { name: 'cart', x: 0.84, y: 0.38, r: 26 },
      { name: 'database', x: 0.29, y: 0.56, r: 27 },
      { name: 'bank', x: 0.72, y: 0.68, r: 25 },
      { name: 'chart', x: 0.55, y: 0.87, r: 24 },
    ],
  },
  publications: {
    waves: 5,
    nodes: 20,
    clusters: 4,
    opacity: 0.85,
    flip: false,
    waveTilt: -14,
    seed: 5504,
    icons: [
      { name: 'chart', x: 0.44, y: 0.26, r: 25 },
      { name: 'users', x: 0.78, y: 0.2, r: 26 },
      { name: 'book', x: 0.6, y: 0.62, r: 24 },
    ],
  },
  teaching: {
    waves: 5,
    nodes: 22,
    clusters: 4,
    opacity: 0.7,
    flip: true,
    waveTilt: 10,
    seed: 7126,
    icons: [],
  },
  service: {
    waves: 4,
    nodes: 18,
    clusters: 3,
    opacity: 0.6,
    flip: true,
    waveTilt: 6,
    seed: 9043,
    icons: [],
  },
  conference: {
    waves: 6,
    nodes: 24,
    clusters: 5,
    opacity: 0.9,
    flip: false,
    waveTilt: -6,
    seed: 2288,
    icons: [
      { name: 'users', x: 0.62, y: 0.14, r: 27 },
      { name: 'podium', x: 0.22, y: 0.33, r: 26 },
      { name: 'globe', x: 0.4, y: 0.63, r: 25 },
      { name: 'chart', x: 0.78, y: 0.52, r: 24 },
    ],
  },
  contact: {
    waves: 5,
    nodes: 34,
    clusters: 7,
    opacity: 0.95,
    flip: false,
    waveTilt: -4,
    seed: 6610,
    icons: [
      { name: 'at', x: 0.14, y: 0.34, r: 30 },
      { name: 'pin', x: 0.36, y: 0.66, r: 28 },
      { name: 'phone', x: 0.68, y: 0.32, r: 30 },
      { name: 'envelope', x: 0.92, y: 0.6, r: 29 },
    ],
  },
};

/** Mulberry32 — small, fast, fully deterministic. */
function prng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const W = 900;
const H = 620;

// Server and client must produce byte-identical attribute strings or React
// reports a hydration mismatch. Raw floats aren't safe for that — Node and
// the browser can differ in the final digit of a double (Math.hypot in
// particular has implementation-defined precision) — so every generated
// number is rounded to a fixed number of decimals before it reaches the DOM.
const r2 = (n: number) => Math.round(n * 100) / 100;
const r3 = (n: number) => Math.round(n * 1000) / 1000;

/** Exactly specified, unlike Math.hypot. */
const dist = (dx: number, dy: number) => Math.sqrt(dx * dx + dy * dy);

interface Props {
  variant: NetworkVariant;
  className?: string;
  style?: CSSProperties;
  /** Reduce density for small viewports. */
  compact?: boolean;
}

export default function DigitalNetworkGraphic({
  variant,
  className,
  style,
  compact = false,
}: Props) {
  const spec = VARIANTS[variant];
  const rand = prng(spec.seed);
  const density = compact ? 0.55 : 1;

  const uid = `net-${variant}`;

  /* --- flowing analytical curves (the data-wave bundle) ------------------ */
  const waveCount = Math.max(3, Math.round(spec.waves * density));
  const waves = Array.from({ length: waveCount }, (_, i) => {
    const t = i / Math.max(1, waveCount - 1);
    const y0 = 150 + t * 210;
    const amp = 78 - t * 26;
    const drift = rand() * 26 - 13;
    const d = [
      `M ${-60} ${r2(y0 + drift)}`,
      `C ${r2(W * 0.18)} ${r2(y0 - amp + drift)}, ${r2(W * 0.34)} ${r2(y0 + amp * 0.9 + drift)}, ${r2(W * 0.52)} ${r2(y0 + drift * 0.4)}`,
      `S ${r2(W * 0.82)} ${r2(y0 - amp * 1.15 + drift)}, ${W + 70} ${r2(y0 - amp * 0.5 + drift)}`,
    ].join(' ');
    return { d, o: r3(0.1 + (1 - t) * 0.22), w: r3(0.55 + (1 - t) * 0.35) };
  });

  /* --- sparse network nodes + their connecting lines --------------------- */
  const nodeCount = Math.round(spec.nodes * density);
  const nodes = Array.from({ length: nodeCount }, () => {
    const x = r2(40 + rand() * (W - 80));
    const y = r2(30 + rand() * (H - 60));
    const copper = rand() > 0.82; // occasional restrained copper node
    const r = r2(copper ? 2.6 + rand() * 1.4 : 2 + rand() * 2.6);
    return { x, y, r, copper, o: r3(0.28 + rand() * 0.45) };
  });

  // Connect each node to its two nearest neighbours — a sparse, believable mesh.
  const edges: { x1: number; y1: number; x2: number; y2: number; o: number }[] =
    [];
  nodes.forEach((n, i) => {
    const near = nodes
      .map((m, j) => ({ j, d: dist(m.x - n.x, m.y - n.y) }))
      .filter((c) => c.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 2);
    near.forEach((c) => {
      if (c.j > i && c.d < 240) {
        edges.push({
          x1: n.x,
          y1: n.y,
          x2: nodes[c.j].x,
          y2: nodes[c.j].y,
          o: r3(Math.max(0.05, 0.3 - c.d / 900)),
        });
      }
    });
  });

  /* --- clusters of tiny data points ------------------------------------- */
  const clusterCount = Math.round(spec.clusters * density);
  const dots: { x: number; y: number; r: number; o: number; copper: boolean }[] =
    [];
  for (let c = 0; c < clusterCount; c++) {
    const cx = 60 + rand() * (W - 120);
    const cy = 40 + rand() * (H - 80);
    const n = 12 + Math.floor(rand() * 16);
    for (let k = 0; k < n; k++) {
      const ang = rand() * Math.PI * 2;
      const rad = rand() * (26 + rand() * 40);
      dots.push({
        x: r2(cx + Math.cos(ang) * rad),
        y: r2(cy + Math.sin(ang) * rad * 0.72),
        r: r2(0.7 + rand() * 0.9),
        o: r3(0.16 + rand() * 0.34),
        copper: rand() > 0.88,
      });
    }
  }

  /* --- channel icons ----------------------------------------------------- */
  const icons = compact ? spec.icons.slice(0, 2) : spec.icons;

  /* Fade the illustration out towards its edges with a CSS mask rather than
     painting a white rectangle over it — so it dissolves correctly on the
     warm-tinted section bands as well as on plain white. */
  const fade =
    'radial-gradient(closest-side ellipse at 50% 46%, #000 0%, #000 54%, rgba(0,0,0,0) 100%)';

  return (
    <div
      className={className}
      style={{
        ...style,
        opacity: spec.opacity,
        WebkitMaskImage: fade,
        maskImage: fade,
      }}
      aria-hidden="true"
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height="100%"
        fill="none"
        role="presentation"
        focusable="false"
        preserveAspectRatio="xMidYMid meet"
        style={spec.flip ? { transform: 'scaleX(-1)' } : undefined}
      >
        <defs>
          <linearGradient id={`${uid}-wave`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#a08cc0" stopOpacity="0" />
            <stop offset="28%" stopColor="#563281" stopOpacity="1" />
            <stop offset="72%" stopColor="#44256b" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#a08cc0" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`${uid}-edge`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#44256b" />
            <stop offset="100%" stopColor="#a08cc0" />
          </linearGradient>
        </defs>

        {/* Data-wave bundle */}
        <g transform={`rotate(${spec.waveTilt} ${W / 2} ${H / 2})`}>
          {waves.map((w, i) => (
            <path
              key={i}
              d={w.d}
              stroke={`url(#${uid}-wave)`}
              strokeWidth={w.w}
              strokeOpacity={w.o}
              fill="none"
              strokeLinecap="round"
            />
          ))}
        </g>

        {/* Network mesh */}
        <g stroke={`url(#${uid}-edge)`} strokeWidth="0.6">
          {edges.map((e, i) => (
            <line
              key={i}
              x1={e.x1}
              y1={e.y1}
              x2={e.x2}
              y2={e.y2}
              strokeOpacity={e.o}
            />
          ))}
        </g>

        {/* Tiny data-point clusters */}
        <g>
          {dots.map((d, i) => (
            <circle
              key={i}
              cx={d.x}
              cy={d.y}
              r={d.r}
              fill={d.copper ? '#b8643d' : '#8b73ab'}
              fillOpacity={d.o}
            />
          ))}
        </g>

        {/* Sparse nodes */}
        <g>
          {nodes.map((n, i) => (
            <circle
              key={i}
              cx={n.x}
              cy={n.y}
              r={n.r}
              fill={n.copper ? '#b8643d' : '#17324d'}
              fillOpacity={n.o}
            />
          ))}
        </g>

        {/* Very light digital-marketing / channel icons */}
        <g>
          {icons.map((ic, i) => {
            const cx = r2(ic.x * W);
            const cy = r2(ic.y * H);
            const s = r2(ic.r * 0.85);
            return (
              <g key={i} transform={spec.flip ? `scale(-1,1) translate(${r2(-2 * cx)},0)` : undefined}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={ic.r}
                  fill="#ffffff"
                  fillOpacity="0.62"
                  stroke="#563281"
                  strokeOpacity="0.3"
                  strokeWidth="0.9"
                />
                <g
                  transform={`translate(${r2(cx - s / 2)} ${r2(cy - s / 2)}) scale(${r3(s / 24)})`}
                  stroke="#44256b"
                  strokeOpacity="0.55"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                >
                  <NetworkIcon name={ic.name} />
                </g>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
