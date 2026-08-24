'use client';

import { useMemo, useState } from 'react';
import { profile } from '@/data/profile';
import type { Publication, PublicationCategory } from '@/lib/content/publications';
import { CATEGORY_LABELS, yearsFor } from '@/lib/content/publications';
import type { Grant } from '@/lib/content/grants';
import type { Award } from '@/lib/content/awards';
import type { Talk, Keynote } from '@/lib/content/conferences';
import SectionHeader from '../SectionHeader';
import PublicationItem from '../PublicationItem';
import Talks from '../Talks';
import GlobeGraphic from '../GlobeGraphic';
import { Icon, IconName } from '../Icons';
import styles from './ResearchPublications.module.css';

type Panel = 'research' | 'publications' | 'grants' | 'awards' | 'talks';

const PANELS: { id: Panel; label: string; icon: IconName }[] = [
  { id: 'research', label: 'Research', icon: 'bulb' },
  { id: 'publications', label: 'Publications', icon: 'book' },
  { id: 'grants', label: 'Grants & Collaborations', icon: 'handshake' },
  { id: 'awards', label: 'Awards & Honors', icon: 'trophy' },
  { id: 'talks', label: 'Talks', icon: 'podium' },
];

const CATEGORIES: PublicationCategory[] = [
  'published',
  'under-review',
  'books',
  'working',
];

const TOPIC_ICONS: IconName[] = ['mobile', 'database', 'chart', 'leaf', 'heart'];

// One mark per methodology, in the same order as profile.methods.
const METHOD_ICONS: IconName[] = [
  'analytics',
  'structural',
  'ml',
  'distribution',
  'bayes',
  'optimize',
];

interface ResearchPublicationsProps {
  publications: Record<PublicationCategory, Publication[]>;
  awardedGrants: Grant[];
  inPreparationGrants: Grant[];
  awards: Award[];
  talks: Talk[];
  keynotes: Keynote[];
}

export default function ResearchPublications({
  publications,
  awardedGrants,
  inPreparationGrants,
  awards,
  talks,
  keynotes,
}: ResearchPublicationsProps) {
  const [panel, setPanel] = useState<Panel>('research');
  const [category, setCategory] = useState<PublicationCategory>('published');
  const [query, setQuery] = useState('');
  const [year, setYear] = useState<string>('all');

  const years = useMemo(() => yearsFor(publications[category]), [publications, category]);

  /* Category + search + year combine. */
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matched = publications[category].filter((p) => {
      if (year !== 'all' && String(p.year) !== year) return false;
      if (!q) return true;
      const haystack = [
        p.title,
        p.authors,
        p.venue,
        p.detail ?? '',
        p.status ?? '',
        p.year ? String(p.year) : '',
        ...(p.keywords ?? []),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
    /* Featured papers lead their category; the rest keep CV order. */
    return [...matched].sort(
      (a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured))
    );
  }, [publications, category, query, year]);

  const changeCategory = (c: PublicationCategory) => {
    setCategory(c);
    setYear('all'); // years differ per category
  };

  const totalInCategory = publications[category].length;

  return (
    <section
      id="research"
      className="section"
      aria-labelledby="research-h"
    >
      <div className="container">
        <SectionHeader
          id="research"
          eyebrow="Research & Publications"
          title="How digital and physical markets interact"
          lede="Papers, grants, awards and talks — searchable, filterable, and linked to the original wherever a link exists."
          accentRuleAbove
        />

        <div className={styles.panelTabs} role="tablist" aria-label="Research and publications">
          {PANELS.map((p) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              id={`rp-tab-${p.id}`}
              aria-selected={panel === p.id}
              aria-controls={`rp-panel-${p.id}`}
              tabIndex={panel === p.id ? 0 : -1}
              className={`${styles.panelTab} ${panel === p.id ? styles.panelTabActive : ''}`}
              onClick={() => setPanel(p.id)}
            >
              <Icon name={p.icon} size={21} />
              <span>{p.label}</span>
            </button>
          ))}
        </div>

        {/* Rendered unconditionally (visibility toggled via `hidden`) rather
            than mounted/unmounted like the other panels: the globe inside
            holds a live WebGL context, and tearing it down and recreating
            it on every tab switch was corrupting the sticky header's
            backdrop-filter compositing in Chrome. */}
        <div
          role="tabpanel"
          id="rp-panel-research"
          aria-labelledby="rp-tab-research"
          className={`tabpanel ${styles.researchPanel}`}
          hidden={panel !== 'research'}
        >
            <div className={styles.heroRow}>
              <div className={styles.heroText}>
                <h3 className={`display display--statement ${styles.statement}`}>
                  {profile.researchStatement}
                </h3>
                <p className={styles.subStatement}>
                  {profile.researchSubStatement}
                </p>
              </div>

              <div className={styles.globeCol}>
                <GlobeGraphic className={styles.globe} />
              </div>
            </div>

            <ol className={styles.topics}>
              {profile.researchTopics.map((t, i) => (
                <li key={t}>
                  <span className={styles.topicNum}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className={styles.topicIcon} aria-hidden="true">
                    <Icon name={TOPIC_ICONS[i]} size={26} />
                  </span>
                  <span className={styles.topicName}>{t}</span>
                </li>
              ))}
            </ol>

            <div className={styles.methods}>
              <p className="label-caps">Methods</p>
              <ul>
                {profile.methods.map((m, i) => (
                  <li key={m}>
                    <Icon
                      name={METHOD_ICONS[i]}
                      size={22}
                      className={styles.methodIcon}
                    />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              className={`link-arrow ${styles.explore}`}
              onClick={() => setPanel('publications')}
            >
              Explore Publications
              <Icon name="arrow" size={16} />
            </button>
        </div>

        {/* ================= PUBLICATIONS ================= */}
        {panel === 'publications' && (
          <div
            role="tabpanel"
            id="rp-panel-publications"
            aria-labelledby="rp-tab-publications"
            className="tabpanel"
          >
            <div className={styles.filterBar}>
              <div className="tabs" role="tablist" aria-label="Publication categories">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    role="tab"
                    aria-selected={category === c}
                    tabIndex={category === c ? 0 : -1}
                    className="tab"
                    onClick={() => changeCategory(c)}
                  >
                    {CATEGORY_LABELS[c]}
                    <span className={styles.count}>
                      {publications[c].length}
                    </span>
                  </button>
                ))}
              </div>

              <div className={styles.controls}>
                <div className={styles.search}>
                  <Icon name="search" size={16} aria-hidden="true" />
                  <label htmlFor="pub-search" className="sr-only">
                    Search publications
                  </label>
                  <input
                    id="pub-search"
                    type="search"
                    className={styles.searchInput}
                    placeholder="Search publications…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>

                <div className={styles.selectWrap}>
                  <label htmlFor="pub-year" className="sr-only">
                    Filter by year
                  </label>
                  <select
                    id="pub-year"
                    className={styles.select}
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
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
              </div>
            </div>

            <p className={styles.resultCount} role="status" aria-live="polite">
              Showing {results.length} of {totalInCategory} in{' '}
              {CATEGORY_LABELS[category]}
            </p>

            <div className={styles.pubList}>
              {results.length ? (
                results.map((p) => <PublicationItem key={p.id} pub={p} />)
              ) : (
                <p className={styles.empty}>
                  No publications match these filters.{' '}
                  <button
                    type="button"
                    className={styles.reset}
                    onClick={() => {
                      setQuery('');
                      setYear('all');
                    }}
                  >
                    Clear filters
                  </button>
                </p>
              )}
            </div>
          </div>
        )}

        {/* ================= GRANTS ================= */}
        {panel === 'grants' && (
          <div
            role="tabpanel"
            id="rp-panel-grants"
            aria-labelledby="rp-tab-grants"
            className="tabpanel"
          >
            <ul className={styles.grantList}>
              {awardedGrants.map((g) => (
                <li key={g.id} className={styles.grant}>
                  <div className={styles.grantMain}>
                    <h3>{g.title}</h3>
                    <p className={styles.grantAgency}>{g.agency}</p>
                    {g.reference && (
                      <p className={styles.grantRef}>{g.reference}</p>
                    )}
                  </div>
                  <dl className={styles.grantMeta}>
                    {g.amount && (
                      <div>
                        <dt>Amount</dt>
                        <dd>{g.amount}</dd>
                      </div>
                    )}
                    {g.period && (
                      <div>
                        <dt>Period</dt>
                        <dd>{g.period}</dd>
                      </div>
                    )}
                    {g.role && (
                      <div>
                        <dt>Role</dt>
                        <dd className={styles.grantRole}>{g.role}</dd>
                      </div>
                    )}
                  </dl>
                </li>
              ))}
            </ul>

            <div className={styles.prepBlock}>
              <p className="eyebrow eyebrow--brand">In preparation</p>
              <ul className={styles.prepList}>
                {inPreparationGrants.map((g) => (
                  <li key={g.id}>
                    <h3>{g.title}</h3>
                    <p>{g.agency}</p>
                    {(g.role || g.period) && (
                      <p className={styles.prepMeta}>
                        {[g.role, g.period].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* ================= AWARDS ================= */}
        {panel === 'awards' && (
          <div
            role="tabpanel"
            id="rp-panel-awards"
            aria-labelledby="rp-tab-awards"
            className="tabpanel"
          >
            <ul className={styles.awardList}>
              {awards.map((a) => (
                <li key={a.id}>
                  <span className={styles.awardYear}>{a.year ?? ''}</span>
                  <span className={styles.awardBody}>
                    <strong>{a.name}</strong>
                    {a.organisation && <em>{a.organisation}</em>}
                    {a.note && <span className={styles.awardNote}>{a.note}</span>}
                  </span>
                  <span className={styles.awardIcon} aria-hidden="true">
                    <Icon name="star" size={15} />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ================= TALKS ================= */}
        {panel === 'talks' && (
          <div
            role="tabpanel"
            id="rp-panel-talks"
            aria-labelledby="rp-tab-talks"
            className="tabpanel"
          >
            <Talks talks={talks} keynotes={keynotes} />
          </div>
        )}
      </div>
    </section>
  );
}
