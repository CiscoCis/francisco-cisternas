import { CSSProperties } from 'react';

// Translucent triangles, stacked and crossed, with hairline edges and small
// vertex points. `mix-blend-mode: multiply` deepens the crossings the way
// layered glass would. Every number is written out rather than generated,
// so server and browser render byte-identical markup.

export type FieldVariant = 'hero' | 'section' | 'quiet';

interface Tri {
  /** Three points, "x,y x,y x,y". */
  p: string;
  /** Fill colour. */
  f: string;
  /** Fill opacity. */
  o: number;
  /** Hairline colour. */
  s: string;
  /** Hairline opacity. */
  so: number;
  /** Drift animation lane — 0 disables. */
  lane?: 1 | 2 | 3;
}

// Each hue lifted most of the way to white so several can overlap without
// the page going dark.
const BLUE = '#c3d3ec';
const BLUE_PALE = '#dde7f6';
const RED = '#f0cfcd';
const TEAL = '#c8e6e4';
const CYAN = '#cfe9f3';

// Hairlines and vertex dots keep the full-strength hue — thin enough to
// afford it.
const S_BLUE = '#14459b';
const S_RED = '#d0332b';
const S_TEAL = '#0e9f9a';
const S_CYAN = '#2bb3d6';

const SETS: Record<FieldVariant, { vb: string; tris: Tri[]; dots: string[] }> = {
  // Biased to the upper right so the headline keeps a clear left column.
  hero: {
    vb: '0 0 1200 860',
    tris: [
      { p: '640,90 1080,600 200,600', f: BLUE, o: 0.62, s: S_BLUE, so: 0.2, lane: 1 },
      { p: '860,210 1240,790 480,790', f: TEAL, o: 0.5, s: S_TEAL, so: 0.22, lane: 2 },
      { p: '520,290 900,860 140,860', f: RED, o: 0.44, s: S_RED, so: 0.16, lane: 3 },
      { p: '980,40 1230,470 730,470', f: CYAN, o: 0.46, s: S_CYAN, so: 0.24, lane: 2 },
    ],
    dots: [
      '640,90,4,#14459b',
      '860,210,3.4,#0e9f9a',
      '520,290,3.4,#d0332b',
      '980,40,3,#2bb3d6',
      '1080,600,3,#14459b',
      '200,600,2.6,#14459b',
      '1240,790,2.6,#0e9f9a',
    ],
  },

  section: {
    vb: '0 0 900 640',
    tris: [
      { p: '300,40 660,520 -60,520', f: BLUE_PALE, o: 0.62, s: S_BLUE, so: 0.13, lane: 1 },
      { p: '520,170 840,640 200,640', f: TEAL, o: 0.36, s: S_TEAL, so: 0.13, lane: 3 },
    ],
    dots: ['300,40,3.4,#14459b', '520,170,3,#0e9f9a', '660,520,2.6,#2bb3d6'],
  },

  quiet: {
    vb: '0 0 720 520',
    tris: [
      { p: '240,30 540,430 -60,430', f: BLUE_PALE, o: 0.5, s: S_BLUE, so: 0.1, lane: 2 },
    ],
    dots: ['240,30,3,#14459b'],
  },
};

interface Props {
  variant?: FieldVariant;
  className?: string;
  style?: CSSProperties;
  /** Turn off the slow drift (e.g. behind dense content). */
  still?: boolean;
}

export default function TriangleField({
  variant = 'section',
  className,
  style,
  still = false,
}: Props) {
  const set = SETS[variant];

  return (
    <svg
      className={className}
      style={style}
      viewBox={set.vb}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      {/* Filled bodies. Multiply so the crossings deepen like glass. */}
      <g style={{ mixBlendMode: 'multiply' }}>
        {set.tris.map((t, i) => (
          <polygon
            key={`f${i}`}
            points={t.p}
            fill={t.f}
            fillOpacity={t.o}
            className={
              still || !t.lane ? undefined : `tri-drift tri-drift--${t.lane}`
            }
          />
        ))}
      </g>

      {/* Hairline edges — the wireframe layer that reads as measurement. */}
      <g fill="none" strokeWidth={1}>
        {set.tris.map((t, i) => (
          <polygon
            key={`s${i}`}
            points={t.p}
            stroke={t.s}
            strokeOpacity={t.so}
            className={
              still || !t.lane ? undefined : `tri-drift tri-drift--${t.lane}`
            }
          />
        ))}
      </g>

      {/* Vertices as data points. */}
      <g>
        {set.dots.map((d) => {
          const [x, y, r, c] = d.split(',');
          return <circle key={d} cx={x} cy={y} r={r} fill={c} fillOpacity={0.8} />;
        })}
      </g>
    </svg>
  );
}
