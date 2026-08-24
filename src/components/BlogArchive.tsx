'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { BlogPost } from '@/data/blog';
import PostCard from './PostCard';
import { Icon } from './Icons';
import styles from './BlogArchive.module.css';

/*
 * The archive listing: category filter, year grouping, live count.
 *
 * Every control is derived from the posts passed in — there is no list of
 * categories or years to maintain anywhere.
 */

const ALL = 'All';

export default function BlogArchive({ posts }: { posts: BlogPost[] }) {
  const [category, setCategory] = useState<string>(ALL);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    posts.forEach((p) => counts.set(p.category, (counts.get(p.category) ?? 0) + 1));
    return [
      { label: ALL, count: posts.length },
      ...Array.from(counts, ([label, count]) => ({ label, count })).sort((a, b) =>
        a.label.localeCompare(b.label)
      ),
    ];
  }, [posts]);

  const shown = useMemo(
    () => (category === ALL ? posts : posts.filter((p) => p.category === category)),
    [posts, category]
  );

  /* Group by year, newest first. `posts` arrives pre-sorted. */
  const byYear = useMemo(() => {
    const groups: { year: string; items: BlogPost[] }[] = [];
    shown.forEach((p) => {
      const year = p.date.slice(0, 4);
      const last = groups[groups.length - 1];
      if (last && last.year === year) last.items.push(p);
      else groups.push({ year, items: [p] });
    });
    return groups;
  }, [shown]);

  return (
    <div className={`section ${styles.section}`}>
      <div className="container">
        <p className={styles.crumb}>
          <Link href="/">
            <Icon name="chevron" size={15} className={styles.back} />
            Back to the site
          </Link>
        </p>

        <header className={styles.head}>
          <p className="eyebrow">Blog</p>
          <h1 className="display display--page">Notes and writing</h1>
          <p className={styles.lede}>
            Shorter pieces on teaching, research, analytics and whatever else is
            worth writing down.
          </p>
        </header>

        {posts.length === 0 ? (
          <div className={`panel ${styles.empty}`}>
            <h2 className={styles.emptyTitle}>Nothing published yet</h2>
            <p className={styles.emptyText}>
              The first posts are still being written.{' '}
              <Link href="/#contact">Get in touch</Link> if there is something
              you would like to read about.
            </p>
          </div>
        ) : (
          <>
            <div className={styles.filters} role="group" aria-label="Filter by category">
              {categories.map((c) => (
                <button
                  key={c.label}
                  type="button"
                  className={`${styles.filter} ${
                    category === c.label ? styles.filterOn : ''
                  }`}
                  aria-pressed={category === c.label}
                  onClick={() => setCategory(c.label)}
                >
                  {c.label !== ALL && <Icon name="tag" size={14} />}
                  {c.label}
                  <span className={styles.count}>{c.count}</span>
                </button>
              ))}
            </div>

            <p className={styles.result} role="status">
              {shown.length} {shown.length === 1 ? 'post' : 'posts'}
              {category !== ALL && ` in ${category}`}
            </p>

            {byYear.map((group) => (
              <section key={group.year} className={styles.yearBlock}>
                <h2 className={styles.year}>
                  <span>{group.year}</span>
                </h2>
                <ul className={styles.grid}>
                  {group.items.map((p) => (
                    <li key={p.slug}>
                      <PostCard post={p} />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
