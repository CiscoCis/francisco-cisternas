import { useEffect, useMemo, useState } from 'react';
import { COUNTRY_COORDS } from './countryCoords';

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
 */

interface CountryStat {
  country: string;
  count: number;
}

interface PageStat {
  path: string;
  count: number;
}

interface Summary {
  ok: boolean;
  total: number;
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

function useFetch<T>(url: string | null): { data: T | null; error: string | null; loading: boolean } {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(url));

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
  }, [url]);

  return { data, error, loading };
}

const MAP_WIDTH = 960;
const MAP_HEIGHT = 480;

function project(lat: number, lng: number): { x: number; y: number } {
  return {
    x: ((lng + 180) / 360) * MAP_WIDTH,
    y: ((90 - lat) / 180) * MAP_HEIGHT,
  };
}

function WorldMap({ byCountry }: { byCountry: CountryStat[] }) {
  const points = useMemo(() => {
    const max = Math.max(1, ...byCountry.map((c) => c.count));
    return byCountry
      .map((c) => {
        const coord = COUNTRY_COORDS[c.country.toUpperCase()];
        if (!coord) return null;
        const { x, y } = project(coord.lat, coord.lng);
        const intensity = c.count / max;
        return { ...coord, x, y, count: c.count, intensity };
      })
      .filter((p): p is NonNullable<typeof p> => p !== null);
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

  return (
    <svg
      viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
      style={{ width: '100%', height: 'auto', background: '#061224', borderRadius: 10 }}
    >
      <defs>
        <filter id="glow" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g stroke="#1c3a5e" strokeWidth={1} opacity={0.6}>
        {gridLines}
      </g>
      <line x1={0} y1={MAP_HEIGHT / 2} x2={MAP_WIDTH} y2={MAP_HEIGHT / 2} stroke="#2c5c8f" strokeWidth={1.5} />
      <line x1={MAP_WIDTH / 2} y1={0} x2={MAP_WIDTH / 2} y2={MAP_HEIGHT} stroke="#2c5c8f" strokeWidth={1.5} />

      {points.map((p) => {
        const radius = 4 + p.intensity * 14;
        const color = p.intensity > 0.6 ? '#ff6b57' : p.intensity > 0.25 ? '#2dd4bf' : '#4aa3ff';
        return (
          <g key={p.name} filter="url(#glow)">
            <circle cx={p.x} cy={p.y} r={radius} fill={color} opacity={0.85} />
            <circle cx={p.x} cy={p.y} r={2.5} fill="#fff" />
            <title>
              {p.name}: {p.count} visit{p.count === 1 ? '' : 's'}
            </title>
          </g>
        );
      })}
    </svg>
  );
}

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

export default function AnalyticsScreen({ endpoint, secret }: AnalyticsScreenProps) {
  const configured = Boolean(endpoint && secret);
  const summaryUrl = configured ? `${endpoint}?action=summary&secret=${encodeURIComponent(secret!)}` : null;
  const recentUrl = configured ? `${endpoint}?action=recent&secret=${encodeURIComponent(secret!)}` : null;

  const { data: summary, error: summaryError, loading: summaryLoading } = useFetch<Summary>(summaryUrl);
  const { data: recent, error: recentError } = useFetch<RecentResponse>(recentUrl);

  if (!configured) return <NotConfigured />;

  return (
    <div style={{ padding: 32, maxWidth: 1100, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 24 }}>Analytics</h1>

      {summaryError && (
        <p style={{ color: '#b91c1c', marginBottom: 16 }}>Couldn&apos;t load stats: {summaryError}</p>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(200px, 260px) 1fr',
          gap: 24,
          marginBottom: 32,
        }}
      >
        <div
          style={{
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 10,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <p style={{ fontSize: 13, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>
            Total views
          </p>
          <p style={{ fontSize: 44, fontWeight: 700, marginTop: 8 }}>
            {summaryLoading ? '…' : (summary?.total ?? 0).toLocaleString()}
          </p>
        </div>

        <div>
          <p style={{ fontSize: 13, color: '#6b7280', fontWeight: 600, marginBottom: 10, textTransform: 'uppercase' }}>
            Where visitors are from
          </p>
          <WorldMap byCountry={summary?.byCountry ?? []} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div>
          <h3 style={{ marginBottom: 12 }}>Most-viewed pages</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <tbody>
              {(summary?.topPages ?? []).map((p) => (
                <tr key={p.path} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '8px 4px' }}>{p.path}</td>
                  <td style={{ padding: '8px 4px', textAlign: 'right', color: '#6b7280' }}>{p.count}</td>
                </tr>
              ))}
              {summary && summary.topPages.length === 0 && (
                <tr>
                  <td style={{ padding: '8px 4px', color: '#9ca3af' }}>No data yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div>
          <h3 style={{ marginBottom: 4 }}>Recent visits</h3>
          <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 12 }}>
            {recent?.updatedAt
              ? `Last refreshed ${new Date(recent.updatedAt).toLocaleString()} — updates once a day`
              : 'Not refreshed yet — see setup step 6'}
          </p>
          {recentError && <p style={{ color: '#b91c1c' }}>Couldn&apos;t load recent visits: {recentError}</p>}
          <div style={{ maxHeight: 340, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: '#6b7280' }}>
                  <th style={{ padding: '6px 4px' }}>When</th>
                  <th style={{ padding: '6px 4px' }}>Country</th>
                  <th style={{ padding: '6px 4px' }}>Referrer</th>
                  <th style={{ padding: '6px 4px' }}>Page</th>
                </tr>
              </thead>
              <tbody>
                {(recent?.visits ?? []).map((v, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '6px 4px', whiteSpace: 'nowrap' }}>{v.when}</td>
                    <td style={{ padding: '6px 4px' }}>{v.country}</td>
                    <td style={{ padding: '6px 4px' }}>{v.referrer || '—'}</td>
                    <td style={{ padding: '6px 4px' }}>{v.page}</td>
                  </tr>
                ))}
                {recent && recent.visits.length === 0 && (
                  <tr>
                    <td style={{ padding: '6px 4px', color: '#9ca3af' }} colSpan={4}>
                      No visits recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
