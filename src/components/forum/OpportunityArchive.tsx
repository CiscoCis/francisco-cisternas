'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { opportunityTypes, type Opportunity } from '@/lib/content/opportunities';
import OpportunityCard from './OpportunityCard';
import SuggestOpportunityForm from './SuggestOpportunityForm';
import { Icon } from '../Icons';
import styles from '../BlogArchive.module.css';
import own from './ArchiveExtras.module.css';

const ALL = 'All';

export default function OpportunityArchive({ items }: { items: Opportunity[] }) {
  const [type, setType] = useState<string>(ALL);

  const types = useMemo(() => {
    const counts = new Map<string, number>();
    items.forEach((o) => {
      if (!o.type) return;
      counts.set(o.type, (counts.get(o.type) ?? 0) + 1);
    });
    return [
      { label: ALL, count: items.length },
      ...Array.from(counts, ([label, count]) => ({ label, count })).sort((a, b) =>
        a.label.localeCompare(b.label)
      ),
    ];
  }, [items]);

  const shown = useMemo(
    () => (type === ALL ? items : items.filter((o) => o.type === type)),
    [items, type]
  );

  return (
    <div className={`section ${styles.section}`}>
      <div className="container">
        <p className={styles.crumb}>
          <Link href="/forum">
            <Icon name="chevron" size={15} className={styles.back} />
            Forum home
          </Link>
        </p>

        <header className={styles.head}>
          <p className="eyebrow">Forum</p>
          <h1 className="display display--page">Opportunities</h1>
          <p className={styles.lede}>
            Jobs, internships, research collaborations and more — curated by
            the professor, or suggested by the community for review.
          </p>
        </header>

        {items.length === 0 ? (
          <div className={`panel ${styles.empty}`}>
            <h2 className={styles.emptyTitle}>Nothing posted yet</h2>
            <p className={styles.emptyText}>
              Check back soon, or suggest one yourself below.
            </p>
          </div>
        ) : (
          <>
            {types.length > 1 && (
              <div className={styles.filters} role="group" aria-label="Filter by type">
                {types.map((t) => (
                  <button
                    key={t.label}
                    type="button"
                    className={`${styles.filter} ${type === t.label ? styles.filterOn : ''}`}
                    aria-pressed={type === t.label}
                    onClick={() => setType(t.label)}
                  >
                    {t.label}
                    <span className={styles.count}>{t.count}</span>
                  </button>
                ))}
              </div>
            )}

            <p className={styles.result} role="status">
              {shown.length} {shown.length === 1 ? 'opportunity' : 'opportunities'}
            </p>

            <ul className={`${styles.grid} ${own.grid}`}>
              {shown.map((o) => (
                <li key={o.slug}>
                  <OpportunityCard opportunity={o} />
                </li>
              ))}
            </ul>
          </>
        )}

        <div className={`panel ${own.suggestPanel}`}>
          <SuggestOpportunityForm />
        </div>
      </div>
    </div>
  );
}
