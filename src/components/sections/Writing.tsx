import Link from 'next/link';
import { visiblePosts } from '@/data/blog';
import SectionHeader from '../SectionHeader';
import Reveal from '../Reveal';
import TriangleField from '../TriangleField';
import Carousel from '../Carousel';
import PostCard from '../PostCard';
import { Icon } from '../Icons';
import styles from './Writing.module.css';

/*
 * Blog strip on the home page — change requirements §8.
 *
 * Shows the most recent posts as a carousel and points at the full archive
 * at /blog. Everything is derived from src/data/blog.ts: adding post 2, 3,
 * 10 or 50 changes nothing here.
 *
 * With no posts published the section states that plainly rather than
 * padding itself out. It is the honest reading of an empty array, and it
 * disappears the moment the first post goes live.
 */

export default function Writing() {
  const latest = visiblePosts.slice(0, 6);

  return (
    <section id="writing" className="section" aria-labelledby="writing-h">
      <TriangleField variant="quiet" className={`triangles ${styles.tri}`} />

      <div className="container">
        <SectionHeader
          id="writing"
          eyebrow="Blog"
          title="Notes and writing"
          lede="Shorter pieces on teaching, research, analytics and whatever else is worth writing down."
        />

        {latest.length > 0 ? (
          <>
            <Reveal variant="item">
              <Carousel as="ul" className={styles.grid} label="Latest posts">
                {latest.map((p) => (
                  <li key={p.slug} className={styles.slide}>
                    <PostCard post={p} />
                  </li>
                ))}
              </Carousel>
            </Reveal>

            {visiblePosts.length > latest.length && (
              <p className={styles.more}>
                <Link href="/blog" className="link-arrow">
                  All posts
                  <Icon name="arrow" size={16} />
                </Link>
              </p>
            )}
          </>
        ) : (
          <Reveal className={`panel ${styles.empty}`}>
            <span className={styles.emptyIcon} aria-hidden="true">
              <Icon name="pen" size={24} />
            </span>
            <div>
              <h3 className={styles.emptyTitle}>Nothing published yet</h3>
              <p className={styles.emptyText}>
                The first posts are still being written. In the meantime, the{' '}
                <a href="#contact">contact form</a> reaches me directly.
              </p>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
