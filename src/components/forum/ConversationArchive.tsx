'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { conversationCategories, sortConversations, type Conversation } from '@/lib/content/conversations';
import ConversationCard from './ConversationCard';
import { Icon } from '../Icons';
// Reuses the blog archive's exact stylesheet — crumb/head/filters/grid/empty
// chrome, so the Forum's listing pages read as the same site as /blog.
import styles from '../BlogArchive.module.css';
import own from './ArchiveExtras.module.css';

const ALL = 'All';

export default function ConversationArchive({ items }: { items: Conversation[] }) {
  const [category, setCategory] = useState<string>(ALL);
  const sorted = useMemo(() => sortConversations(items), [items]);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    sorted.forEach((c) => {
      if (!c.category) return;
      counts.set(c.category, (counts.get(c.category) ?? 0) + 1);
    });
    return [
      { label: ALL, count: sorted.length },
      ...Array.from(counts, ([label, count]) => ({ label, count })).sort((a, b) =>
        a.label.localeCompare(b.label)
      ),
    ];
  }, [sorted]);

  const shown = useMemo(
    () => (category === ALL ? sorted : sorted.filter((c) => c.category === category)),
    [sorted, category]
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
          <h1 className="display display--page">Conversations</h1>
          <p className={styles.lede}>
            Discussions, questions of the week, and short business cases —
            professor-led, with room for you to weigh in.
          </p>
        </header>

        {items.length === 0 ? (
          <div className={`panel ${styles.empty}`}>
            <h2 className={styles.emptyTitle}>Nothing posted yet</h2>
            <p className={styles.emptyText}>
              The first conversation is on its way. Check back soon, or{' '}
              <Link href="/forum/ask">ask a question</Link> to get one started.
            </p>
          </div>
        ) : (
          <>
            {categories.length > 1 && (
              <div className={styles.filters} role="group" aria-label="Filter by category">
                {categories.map((c) => (
                  <button
                    key={c.label}
                    type="button"
                    className={`${styles.filter} ${category === c.label ? styles.filterOn : ''}`}
                    aria-pressed={category === c.label}
                    onClick={() => setCategory(c.label)}
                  >
                    {c.label !== ALL && <Icon name="tag" size={14} />}
                    {c.label}
                    <span className={styles.count}>{c.count}</span>
                  </button>
                ))}
              </div>
            )}

            <p className={styles.result} role="status">
              {shown.length} {shown.length === 1 ? 'conversation' : 'conversations'}
              {category !== ALL && ` in ${category}`}
            </p>

            <ul className={`${styles.grid} ${own.grid}`}>
              {shown.map((c) => (
                <li key={c.slug}>
                  <ConversationCard conversation={c} />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
