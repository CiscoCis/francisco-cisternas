import { useEffect, useMemo, useRef, useState } from 'react';
import { COUNTRY_COORDS } from './countryCoords';
import { WORLD_LAND_PATH } from './worldLandPath';

/*
 * The "Analytics" screen inside TinaCMS (Settings sidebar → DASHBOARD →
 * Analytics). Only reachable from inside the login-gated admin — this
 * file is never imported by the public Next.js site.
 *
 * All data comes from a Google Apps Script Web App
 * (scripts/analytics-dashboard-endpoint.gs), never directly from
 * GoatCounter — see that file's header comment for why: this screen's
 * own code ships as public static files, so a GoatCounter API token
 * embedded here would be readable by anyone, logged in or not. The Apps
 * Script holds that token server-side instead.
 *
 * The map shows one glowing marker per country GoatCounter reports
 * traffic from. GoatCounter only ever reports country-level location (by
 * design, for visitor privacy) — there is no finer-grained data to plot,
 * so a country centroid is as precise as this can honestly be.
 *
 * Self-contained on purpose: no imports beyond React and the local
 * coordinate table, no CSS framework -- this is bundled by Tina's own
 * (separate) bundler, not the main Next.js site's pipeline. Styling is
 * inline styles plus one injected <style> block for the handful of
 * things inline styles can't do (keyframes, :hover, a scrollbar).
 */

interface CountryStat {
  code: string;
  name: string;
  count: number;
}

interface PageStat {
  path: string;
  count: number;
}

interface DailyStat {
  day: string;
  count: number;
}

interface Summary {
  ok: boolean;
  total: number;
  daily: DailyStat[];
  byCountry: CountryStat[];
  topPages: PageStat[];
}

interface Visit {
  when: string;
  country: string;
  referrer: string;
  page: string;
}

interface RecentResponse {
  ok: boolean;
  updatedAt: string | null;
  visits: Visit[];
}

interface AnalyticsScreenProps {
  endpoint?: string;
  secret?: string;
}

/* ---------- palette ---------------------------------------------------- */

const COLORS = {
  bg: '#050b16',
  panel: 'linear-gradient(160deg, rgba(20,32,56,0.9), rgba(8,15,28,0.9))',
  border: 'rgba(148, 197, 255, 0.14)',
  text: '#e7edf7',
  muted: '#8ea0bd',
  faint: '#5b6c88',
  teal: '#2dd4bf',
  blue: '#4aa3ff',
  coral: '#ff6b57',
  violet: '#a78bfa',
  green: '#34d399',
};

function intensityColor(t: number): string {
  if (t > 0.66) return COLORS.coral;
  if (t > 0.33) return COLORS.teal;
  return COLORS.blue;
}

/* ---------- data fetching ------------------------------------------------ */

function useFetch<T>(url: string | null, reloadKey: number) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(url));
  const [loadedAt, setLoadedAt] = useState<number | null>(null);

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    setLoading(true);
    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (json.ok === false) throw new Error(json.error || 'request failed');
        setData(json);
        setError(null);
        setLoadedAt(Date.now());
      })
      .catch((err) => {
        if (!cancelled) setError(String(err.message || err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, reloadKey]);

  return { data, error, loading, loadedAt };
}

function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}

function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

function timeAgo(fromMs: number | null, now: number): string {
  if (!fromMs) return 'never';
  const s = Math.max(0, Math.floor((now - fromMs) / 1000));
  if (s < 5) return 'just now';
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}

function formatDay(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/* ---------- shared bits -------------------------------------------------- */

function RefreshIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      className={spinning ? 'gc-spin' : undefined}
    >
      <path d="M21 12a9 9 0 1 1-2.6-6.35" />
      <path d="M21 3v6h-6" />
    </svg>
  );
}

function Card({
  title,
  right,
  children,
  style,
}: {
  title?: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: COLORS.panel,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 16,
        padding: 20,
        boxShadow: '0 20px 40px -24px rgba(0,0,0,0.6)',
        ...style,
      }}
    >
      {(title || right) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          {title && (
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: COLORS.muted, margin: 0 }}>
              {title}
            </p>
          )}
          {right}
        </div>
      )}
      {children}
    </div>
  );
}

/* ---------- trend chart --------------------------------------------------- */

function TrendChart({ daily }: { daily: DailyStat[] }) {
  const width = 640;
  const height = 170;
  const pad = 20;
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const max = Math.max(1, ...daily.map((d) => d.count));
  const points = useMemo(
    () =>
      daily.map((d, i) => {
        const x = daily.length <= 1 ? pad : pad + (i / (daily.length - 1)) * (width - pad * 2);
        const y = height - pad - (d.count / max) * (height - pad * 2);
        return { x, y, ...d };
      }),
    [daily, max]
  );

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${height - pad} L ${points[0].x.toFixed(1)} ${height - pad} Z`
      : '';

  function handleMove(e: React.MouseEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg || points.length === 0) return;
    const rect = svg.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * width;
    let nearest = 0;
    let best = Infinity;
    points.forEach((p, i) => {
      const d = Math.abs(p.x - relX);
      if (d < best) {
        best = d;
        nearest = i;
      }
    });
    setHoverIdx(nearest);
  }

  const weekTotal = daily.reduce((sum, d) => sum + d.count, 0);
  const hovered = hoverIdx !== null ? points[hoverIdx] : null;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
        <span style={{ fontSize: 26, fontWeight: 700, color: COLORS.text }}>{weekTotal.toLocaleString()}</span>
        <span style={{ fontSize: 12, color: COLORS.muted }}>views in the last 7 days</span>
      </div>
      <div style={{ position: 'relative' }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: 'auto', display: 'block', cursor: points.length ? 'crosshair' : 'default' }}
          onMouseMove={handleMove}
          onMouseLeave={() => setHoverIdx(null)}
        >
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS.teal} stopOpacity={0.35} />
              <stop offset="100%" stopColor={COLORS.teal} stopOpacity={0} />
            </linearGradient>
          </defs>

          {[0.25, 0.5, 0.75].map((f) => (
            <line
              key={f}
              x1={pad}
              x2={width - pad}
              y1={pad + f * (height - pad * 2)}
              y2={pad + f * (height - pad * 2)}
              stroke="rgba(148,197,255,0.1)"
              strokeDasharray="4 4"
            />
          ))}

          {areaPath && <path d={areaPath} fill="url(#trendFill)" />}
          {linePath && <path d={linePath} fill="none" stroke={COLORS.teal} strokeWidth={2.2} strokeLinejoin="round" strokeLinecap="round" />}

          {hovered && (
            <g>
              <line x1={hovered.x} x2={hovered.x} y1={pad} y2={height - pad} stroke="rgba(232,240,255,0.25)" />
              <circle cx={hovered.x} cy={hovered.y} r={4.5} fill={COLORS.text} stroke={COLORS.teal} strokeWidth={2} />
            </g>
          )}

          {points.map((p) => (
            <circle key={p.day} cx={p.x} cy={p.y} r={9} fill="transparent" style={{ pointerEvents: 'none' }} />
          ))}
        </svg>

        {hovered && (
          <div
            className="gc-fade-in"
            style={{
              position: 'absolute',
              left: `${(hovered.x / width) * 100}%`,
              top: `${(hovered.y / height) * 100}%`,
              transform: 'translate(-50%, -135%)',
              background: '#0b1626',
              border: `1px solid ${COLORS.border}`,
              borderRadius: 8,
              padding: '6px 10px',
              fontSize: 12,
              color: COLORS.text,
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              boxShadow: '0 8px 20px rgba(0,0,0,0.45)',
            }}
          >
            <strong>{hovered.count.toLocaleString()}</strong> views · {formatDay(hovered.day)}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: COLORS.faint, marginTop: 4 }}>
        <span>{daily[0] ? formatDay(daily[0].day) : ''}</span>
        <span>{daily[daily.length - 1] ? formatDay(daily[daily.length - 1].day) : ''}</span>
      </div>
    </div>
  );
}

/* ---------- world map ---------------------------------------------------- */

const MAP_WIDTH = 960;
const MAP_HEIGHT = 480;

function project(lat: number, lng: number) {
  return { x: ((lng + 180) / 360) * MAP_WIDTH, y: ((90 - lat) / 180) * MAP_HEIGHT };
}

function WorldMap({
  byCountry,
  selected,
  hovered,
  onSelect,
  onHover,
}: {
  byCountry: CountryStat[];
  selected: string | null;
  hovered: string | null;
  onSelect: (code: string | null) => void;
  onHover: (code: string | null) => void;
}) {
  const points = useMemo(() => {
    const max = Math.max(1, ...byCountry.map((c) => c.count));
    return byCountry
      .map((c) => {
        const key = c.code.toUpperCase();
        const coord = COUNTRY_COORDS[key];
        if (!coord) return null;
        const { x, y } = project(coord.lat, coord.lng);
        return { code: key, name: c.name || coord.name, x, y, count: c.count, intensity: c.count / max };
      })
      .filter((p): p is NonNullable<typeof p> => p !== null)
      .sort((a, b) => a.count - b.count);
  }, [byCountry]);

  const gridLines: React.ReactNode[] = [];
  for (let lng = -180; lng <= 180; lng += 30) {
    const { x } = project(0, lng);
    gridLines.push(<line key={`v${lng}`} x1={x} y1={0} x2={x} y2={MAP_HEIGHT} />);
  }
  for (let lat = -90; lat <= 90; lat += 30) {
    const { y } = project(lat, 0);
    gridLines.push(<line key={`h${lat}`} x1={0} y1={y} x2={MAP_WIDTH} y2={y} />);
  }

  const active = points.find((p) => p.code === (hovered ?? selected)) ?? null;

  return (
    <div style={{ position: 'relative' }}>
      <svg
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        style={{ width: '100%', height: 'auto', display: 'block', background: 'radial-gradient(120% 140% at 30% 20%, #0d1f3a 0%, #05101f 70%)', borderRadius: 12 }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onSelect(null);
        }}
      >
        <defs>
          <filter id="gc-glow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g stroke="#173254" strokeWidth={1} opacity={0.45}>
          {gridLines}
        </g>

        {/* The actual continent outlines -- a simplified, public-domain
            (Natural Earth) coastline, projected with the exact same
            equirectangular math as project() above so it lines up with
            every marker plotted on top of it. See worldLandPath.ts. */}
        <path
          d={WORLD_LAND_PATH}
          fill="#12294a"
          stroke="#2c5c8f"
          strokeWidth={0.75}
          opacity={0.9}
        />

        <line x1={0} y1={MAP_HEIGHT / 2} x2={MAP_WIDTH} y2={MAP_HEIGHT / 2} stroke="#2c5c8f" strokeWidth={1} opacity={0.35} />
        <line x1={MAP_WIDTH / 2} y1={0} x2={MAP_WIDTH / 2} y2={MAP_HEIGHT} stroke="#2c5c8f" strokeWidth={1} opacity={0.35} />

        {points.map((p) => {
          const isActive = p.code === selected || p.code === hovered;
          const radius = 4 + p.intensity * 14;
          const color = intensityColor(p.intensity);
          return (
            <g
              key={p.code}
              filter="url(#gc-glow)"
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => onHover(p.code)}
              onMouseLeave={() => onHover(null)}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(selected === p.code ? null : p.code);
              }}
            >
              {isActive && <circle cx={p.x} cy={p.y} r={radius + 6} fill="none" stroke={color} strokeWidth={1.5} opacity={0.8} className="gc-pulse-ring" />}
              <circle cx={p.x} cy={p.y} r={radius} fill={color} opacity={isActive ? 1 : 0.8} />
              <circle cx={p.x} cy={p.y} r={2.5} fill="#fff" />
            </g>
          );
        })}
      </svg>

      {active && (
        <div
          className="gc-fade-in"
          style={{
            position: 'absolute',
            left: `${(active.x / MAP_WIDTH) * 100}%`,
            top: `${(active.y / MAP_HEIGHT) * 100}%`,
            transform: 'translate(-50%, -140%)',
            background: '#0b1626',
            border: `1px solid ${COLORS.border}`,
            borderRadius: 8,
            padding: '6px 10px',
            fontSize: 12,
            color: COLORS.text,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            boxShadow: '0 8px 20px rgba(0,0,0,0.45)',
          }}
        >
          <strong>{active.name}</strong> · {active.count.toLocaleString()} visit{active.count === 1 ? '' : 's'}
        </div>
      )}

      {points.length === 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: COLORS.faint,
            fontSize: 13,
          }}
        >
          No visits recorded yet
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 10, fontSize: 11, color: COLORS.muted }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS.blue, display: 'inline-block' }} /> Low
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS.teal, display: 'inline-block' }} /> Medium
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS.coral, display: 'inline-block' }} /> High
        </span>
      </div>
    </div>
  );
}

/* ---------- country list -------------------------------------------------- */

function CountryList({
  byCountry,
  selected,
  hovered,
  onSelect,
  onHover,
}: {
  byCountry: CountryStat[];
  selected: string | null;
  hovered: string | null;
  onSelect: (code: string | null) => void;
  onHover: (code: string | null) => void;
}) {
  const sorted = useMemo(() => [...byCountry].sort((a, b) => b.count - a.count), [byCountry]);
  const max = Math.max(1, ...sorted.map((c) => c.count));

  if (sorted.length === 0) {
    return <p style={{ color: COLORS.faint, fontSize: 13 }}>No data yet.</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto' }} className="gc-scroll">
      {sorted.map((c) => {
        const code = c.code.toUpperCase();
        const isActive = code === selected || code === hovered;
        const pct = (c.count / max) * 100;
        return (
          <div
            key={code || c.name}
            onMouseEnter={() => onHover(code)}
            onMouseLeave={() => onHover(null)}
            onClick={() => onSelect(selected === code ? null : code)}
            style={{
              cursor: 'pointer',
              padding: '6px 8px',
              borderRadius: 8,
              background: isActive ? 'rgba(148,197,255,0.1)' : 'transparent',
              transition: 'background 120ms ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: COLORS.text, marginBottom: 4 }}>
              <span>{c.name}</span>
              <span style={{ color: COLORS.muted }}>{c.count.toLocaleString()}</span>
            </div>
            <div style={{ height: 5, borderRadius: 3, background: 'rgba(148,197,255,0.08)', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${pct}%`,
                  background: intensityColor(c.count / max),
                  borderRadius: 3,
                  transition: 'width 500ms ease',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- top pages ------------------------------------------------------ */

function TopPages({ pages }: { pages: PageStat[] }) {
  const max = Math.max(1, ...pages.map((p) => p.count));
  if (pages.length === 0) return <p style={{ color: COLORS.faint, fontSize: 13 }}>No data yet.</p>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {pages.map((p) => (
        <div key={p.path}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: COLORS.text, marginBottom: 4 }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>{p.path}</span>
            <span style={{ color: COLORS.muted }}>{p.count.toLocaleString()}</span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: 'rgba(148,197,255,0.08)', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${(p.count / max) * 100}%`,
                background: `linear-gradient(90deg, ${COLORS.violet}, ${COLORS.blue})`,
                borderRadius: 3,
                transition: 'width 500ms ease',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- recent visits table -------------------------------------------- */

type SortKey = 'when' | 'country' | 'referrer' | 'page';

function RecentVisitsTable({ visits }: { visits: Visit[] }) {
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('when');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = visits;
    if (q) {
      rows = rows.filter((v) => [v.country, v.referrer, v.page].some((f) => (f || '').toLowerCase().includes(q)));
    }
    const sorted = [...rows].sort((a, b) => {
      const av = (a[sortKey] || '').toString();
      const bv = (b[sortKey] || '').toString();
      return av.localeCompare(bv);
    });
    if (sortDir === 'desc') sorted.reverse();
    return sorted;
  }, [visits, query, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  function Th({ label, k }: { label: string; k: SortKey }) {
    return (
      <th
        onClick={() => toggleSort(k)}
        style={{ padding: '6px 8px', cursor: 'pointer', userSelect: 'none', color: sortKey === k ? COLORS.text : COLORS.muted, whiteSpace: 'nowrap' }}
      >
        {label}
        {sortKey === k && <span style={{ marginLeft: 4, fontSize: 10 }}>{sortDir === 'asc' ? '▲' : '▼'}</span>}
      </th>
    );
  }

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Filter by country, referrer or page…"
        style={{
          width: '100%',
          boxSizing: 'border-box',
          background: 'rgba(148,197,255,0.06)',
          border: `1px solid ${COLORS.border}`,
          borderRadius: 8,
          padding: '7px 10px',
          fontSize: 13,
          color: COLORS.text,
          marginBottom: 10,
          outline: 'none',
        }}
      />
      <div style={{ maxHeight: 300, overflowY: 'auto' }} className="gc-scroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', position: 'sticky', top: 0, background: '#0d1a2e' }}>
              <Th label="When" k="when" />
              <Th label="Country" k="country" />
              <Th label="Referrer" k="referrer" />
              <Th label="Page" k="page" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((v, i) => (
              <tr key={i} className="gc-row" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                <td style={{ padding: '7px 8px', whiteSpace: 'nowrap', color: COLORS.muted }}>{v.when}</td>
                <td style={{ padding: '7px 8px', color: COLORS.text }}>{v.country}</td>
                <td style={{ padding: '7px 8px', color: COLORS.text }}>{v.referrer || '—'}</td>
                <td style={{ padding: '7px 8px', color: COLORS.text }}>{v.page}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: '10px 8px', color: COLORS.faint }}>
                  {visits.length === 0 ? 'No visits recorded yet.' : 'No visits match that filter.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- root ------------------------------------------------------------ */

function NotConfigured() {
  return (
    <div style={{ padding: 32, maxWidth: 560 }}>
      <h2 style={{ marginBottom: 12 }}>Analytics not configured yet</h2>
      <p style={{ color: '#666', lineHeight: 1.6 }}>
        This screen needs the analytics backend&apos;s URL and shared secret,
        set as <code>NEXT_PUBLIC_ANALYTICS_ENDPOINT</code> and{' '}
        <code>NEXT_PUBLIC_ANALYTICS_SECRET</code>. See the setup instructions
        at the top of <code>scripts/analytics-dashboard-endpoint.gs</code>.
      </p>
    </div>
  );
}

const GLOBAL_STYLE = `
  @keyframes gc-spin { to { transform: rotate(360deg); } }
  .gc-spin { animation: gc-spin 0.8s linear infinite; }

  @keyframes gc-pulse-ring {
    0% { opacity: 0.9; transform: scale(0.7); }
    100% { opacity: 0; transform: scale(1.6); }
  }
  .gc-pulse-ring { transform-origin: center; transform-box: fill-box; animation: gc-pulse-ring 1.6s ease-out infinite; }

  @keyframes gc-fade-in { from { opacity: 0; } to { opacity: 1; } }
  .gc-fade-in { animation: gc-fade-in 120ms ease-out; }

  @keyframes gc-blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.35; }
  }
  .gc-live-dot { animation: gc-blink 1.8s ease-in-out infinite; }

  .gc-row:hover { background: rgba(148,197,255,0.06); }

  .gc-refresh-btn:hover { background: rgba(148,197,255,0.14) !important; }

  .gc-scroll::-webkit-scrollbar { width: 8px; }
  .gc-scroll::-webkit-scrollbar-track { background: transparent; }
  .gc-scroll::-webkit-scrollbar-thumb { background: rgba(148,197,255,0.2); border-radius: 4px; }
`;

export default function AnalyticsScreen({ endpoint, secret }: AnalyticsScreenProps) {
  const configured = Boolean(endpoint && secret);
  const summaryUrl = configured ? `${endpoint}?action=summary&secret=${encodeURIComponent(secret!)}` : null;
  const recentUrl = configured ? `${endpoint}?action=recent&secret=${encodeURIComponent(secret!)}` : null;

  const [reloadKey, setReloadKey] = useState(0);
  const { data: summary, error: summaryError, loading: summaryLoading, loadedAt } = useFetch<Summary>(summaryUrl, reloadKey);
  const { data: recent, error: recentError } = useFetch<RecentResponse>(recentUrl, reloadKey);

  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  const now = useNow();
  const total = useCountUp(summary?.total ?? 0);

  // Gentle auto-refresh so the numbers stay live without the professor
  // having to remember to reload the tab.
  useEffect(() => {
    if (!configured) return;
    const id = setInterval(() => setReloadKey((k) => k + 1), 60_000);
    return () => clearInterval(id);
  }, [configured]);

  if (!configured) return <NotConfigured />;

  const isLoading = summaryLoading && !summary;

  return (
    // Tina's own fullscreen-screen wrapper is `position: absolute; height:
    // 100%; overflow: visible` inside an outer `overflow-y: auto` modal --
    // because that wrapper's own box never grows past one viewport, content
    // that overflows it via `overflow: visible` paints past its edge but
    // never registers in the outer container's scroll range, so it's simply
    // unreachable by scrolling, not just badly backgrounded. Fixed by making
    // this div its own scroll container: `position: absolute; inset: 0`
    // makes it fill that wrapper's fixed box exactly (its nearest
    // positioned ancestor), and `overflow-y: auto` then correctly computes
    // scroll range from its own (normal-flow) children, with its background
    // covering the full scrollable area the way `overflow: auto` always
    // does -- independent of whatever the ancestor chain does above it.
    <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', background: COLORS.bg, padding: 32 }}>
      <style>{GLOBAL_STYLE}</style>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, color: COLORS.text, fontSize: 26 }}>Analytics</h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: COLORS.muted, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="gc-live-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: COLORS.green, display: 'inline-block' }} />
              Updated {timeAgo(loadedAt, now)}
            </p>
          </div>
          <button
            className="gc-refresh-btn"
            onClick={() => setReloadKey((k) => k + 1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(148,197,255,0.08)',
              border: `1px solid ${COLORS.border}`,
              color: COLORS.text,
              borderRadius: 8,
              padding: '7px 12px',
              fontSize: 13,
              cursor: 'pointer',
              transition: 'background 120ms ease',
            }}
          >
            <RefreshIcon spinning={summaryLoading} />
            Refresh
          </button>
        </div>

        {summaryError && (
          <p style={{ color: COLORS.coral, marginBottom: 16, fontSize: 13 }}>Couldn&apos;t load stats: {summaryError}</p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 260px) 1fr', gap: 20, marginBottom: 20 }}>
          <Card title="Total views">
            <p style={{ fontSize: 46, fontWeight: 700, margin: 0, color: COLORS.text, fontVariantNumeric: 'tabular-nums' }}>
              {isLoading ? '···' : total.toLocaleString()}
            </p>
            <p style={{ fontSize: 12, color: COLORS.faint, margin: '6px 0 0' }}>all time</p>
          </Card>

          <Card title="Last 7 days">
            <TrendChart daily={summary?.daily ?? []} />
          </Card>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, marginBottom: 20 }}>
          <Card title="Where visitors are from">
            <WorldMap
              byCountry={summary?.byCountry ?? []}
              selected={selectedCountry}
              hovered={hoveredCountry}
              onSelect={setSelectedCountry}
              onHover={setHoveredCountry}
            />
          </Card>
          <Card title="By country">
            <CountryList
              byCountry={summary?.byCountry ?? []}
              selected={selectedCountry}
              hovered={hoveredCountry}
              onSelect={setSelectedCountry}
              onHover={setHoveredCountry}
            />
          </Card>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <Card title="Most-viewed pages">
            <TopPages pages={summary?.topPages ?? []} />
          </Card>

          <Card
            title="Recent visits"
            right={
              <span style={{ fontSize: 11, color: COLORS.faint }}>
                {recent?.updatedAt ? `Refreshed ${new Date(recent.updatedAt).toLocaleString()}` : 'Not refreshed yet'}
              </span>
            }
          >
            {recentError && <p style={{ color: COLORS.coral, fontSize: 13 }}>Couldn&apos;t load recent visits: {recentError}</p>}
            <RecentVisitsTable visits={recent?.visits ?? []} />
          </Card>
        </div>
      </div>
    </div>
  );
}
