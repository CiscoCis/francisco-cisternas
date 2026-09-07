'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { matchesPersonQuery, type ForumPerson } from '@/lib/content/people';
import PersonCard from './PersonCard';
import JoinDirectoryForm from './JoinDirectoryForm';
import { Icon } from '../Icons';
import styles from '../BlogArchive.module.css';
import own from './ArchiveExtras.module.css';

export default function PeopleDirectory({ items }: { items: ForumPerson[] }) {
  const [query, setQuery] = useState('');

  const shown = useMemo(
    () => items.filter((p) => matchesPersonQuery(p, query)),
    [items, query]
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
          <h1 className="display display--page">People</h1>
          <p className={styles.lede}>
            Students, alumni and collaborators who&apos;ve agreed to be listed here —
            search by name, role, organisation, location or interest.
          </p>
        </header>

        {items.length === 0 ? (
          <div className={`panel ${styles.empty}`}>
            <h2 className={styles.emptyTitle}>Nobody listed yet</h2>
            <p className={styles.emptyText}>
              The directory is just getting started — check back soon, or ask
              to be the first one listed below.
            </p>
          </div>
        ) : (
          <>
            <input
              className={`field ${own.search}`}
              placeholder="Search people…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search people"
            />

            <p className={styles.result} role="status">
              {shown.length} {shown.length === 1 ? 'person' : 'people'}
            </p>

            <ul className={`${styles.grid} ${own.grid}`}>
              {shown.map((p) => (
                <li key={p.slug}>
                  <PersonCard person={p} />
                </li>
              ))}
            </ul>
          </>
        )}

        <div className={`panel ${own.suggestPanel}`}>
          <JoinDirectoryForm />
        </div>
      </div>
    </div>
  );
}
