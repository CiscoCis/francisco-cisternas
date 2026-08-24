'use client';

import { useMemo, useState } from 'react';
import type { Talk, Keynote } from '@/lib/content/conferences';
import { talkYears } from '@/lib/content/conferences';
import { Icon } from './Icons';
import styles from './Talks.module.css';

// Opens showing only the most recent years rather than the full back
// catalogue; the whole list is one click away, and the year filter still
// reaches any of it. The years, filter and grouping are all derived from
// src/data/conferences.ts, so adding future talks needs no change here.

type Tab = 'talks' | 'keynotes';

/** Years shown before the list has to be expanded. */
const RECENT_YEARS = 3;

export default function Talks({
  talks,
  keynotes,
}: {
  talks: Talk[];
  keynotes: Keynote[];
}) {
  const [tab, setTab] = useState<Tab>('talks');
  const [year, setYear] = useState<string>('all');
  const [showAll, setShowAll] = useState(false);

  const years = useMemo(() => talkYears(talks), [talks]);

  const filtered = useMemo(
    () =>
      year === 'all' ? talks : talks.filter((t) => String(t.year) === year),
    [talks, year]
  );

  const grouped = useMemo(() => {
    const map = new Map<number, typeof talks>();
    filtered.forEach((t) => {
      const arr = map.get(t.year) ?? [];
      arr.push(t);
      map.set(t.year, arr);
    });
    return [...map.entries()].sort((a, b) => b[0] - a[0]);
  }, [filtered]);

  const collapsed = year === 'all' && !showAll;
  const visible = collapsed ? grouped.slice(0, RECENT_YEARS) : grouped;
  const hiddenCount = collapsed
    ? grouped.slice(RECENT_YEARS).reduce((n, [, items]) => n + items.length, 0)
    : 0;

  return (
    <div className={styles.inner}>
      <div className={styles.controlBar}>
        <div className="tabs" role="tablist" aria-label="Presentation types">
          <button
            type="button"
            role="tab"
            className="tab"
            aria-selected={tab === 'talks'}
            tabIndex={tab === 'talks' ? 0 : -1}
            onClick={() => setTab('talks')}
          >
            Presentations &amp; Invited Talks
          </button>
          <button
            type="button"
            role="tab"
            className="tab"
            aria-selected={tab === 'keynotes'}
            tabIndex={tab === 'keynotes' ? 0 : -1}
            onClick={() => setTab('keynotes')}
          >
            Keynotes &amp; Distinguished Lectures
          </button>
        </div>

        {tab === 'talks' && (
          <div className={styles.selectWrap}>
            <label htmlFor="conf-year" className="sr-only">
              Filter presentations by year
            </label>
            <select
              id="conf-year"
              className={styles.select}
              value={year}
              onChange={(e) => {
                setYear(e.target.value);
                setShowAll(false);
              }}
            >
              <option value="all">All years</option>
              {years.map((y) => (
                <option key={y} value={String(y)}>
                  {y}
                </option>
              ))}
            </select>
            <Icon name="chevron" size={15} aria-hidden="true" />
          </div>
        )}
      </div>

      {tab === 'talks' && (
        <div className={`tabpanel ${styles.panel}`} role="tabpanel">
          {visible.length === 0 && (
            <p className={styles.empty}>No presentations for this year.</p>
          )}
          {visible.map(([y, items]) => (
            <div key={y} className={styles.yearBlock}>
              <div className={styles.yearCol}>
                <span className={styles.yearNum}>{y}</span>
                <span className={styles.yearRule} aria-hidden="true" />
              </div>
              <ul className={styles.talkList}>
                {items.map((t) => (
                  <li key={t.id}>
                    <span className={styles.dot} aria-hidden="true" />
                    <div className={styles.talkBody}>
                      <p className={styles.talkEvent}>
                        {t.kind && <em className={styles.kind}>{t.kind} </em>}
                        {t.event}
                      </p>
                      {t.paper && <p className={styles.paper}>{t.paper}</p>}
                    </div>
                    <p className={styles.talkDate}>{t.date}</p>
                    <p className={styles.talkLoc}>{t.location}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {hiddenCount > 0 && (
            <p className={styles.moreWrap}>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => setShowAll(true)}
              >
                Show {hiddenCount} earlier presentations
                <Icon name="chevron" size={15} />
              </button>
            </p>
          )}

          {showAll && year === 'all' && grouped.length > RECENT_YEARS && (
            <p className={styles.moreWrap}>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => setShowAll(false)}
              >
                Show recent only
              </button>
            </p>
          )}
        </div>
      )}

      {tab === 'keynotes' && (
        <div className={`tabpanel ${styles.panel}`} role="tabpanel">
          <ul className={styles.keynoteList}>
            {keynotes.map((k) => (
              <li key={k.id}>
                <span className="icon-disc">
                  <Icon name={k.icon} />
                </span>
                <div>
                  <h3>{k.title}</h3>
                  {k.context && <p className={styles.kContext}>{k.context}</p>}
                </div>
                <p className={styles.kMeta}>
                  {k.date && <span>{k.date}</span>}
                  {k.location && <span>{k.location}</span>}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
