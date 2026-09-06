import Link from 'next/link';
import { pastForumEvents, upcomingForumEvents, type ForumEvent } from '@/lib/content/forumEvents';
import EventCard from './EventCard';
import { Icon } from '../Icons';
import styles from '../BlogArchive.module.css';
import own from './ArchiveExtras.module.css';

export default function EventArchive({ items }: { items: ForumEvent[] }) {
  const upcoming = upcomingForumEvents(items);
  const past = pastForumEvents(items);

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
          <h1 className="display display--page">Events</h1>
          <p className={styles.lede}>
            Talks, alumni gatherings and networking sessions — RSVP with just
            a name and email, no account needed.
          </p>
        </header>

        {items.length === 0 ? (
          <div className={`panel ${styles.empty}`}>
            <h2 className={styles.emptyTitle}>Nothing scheduled yet</h2>
            <p className={styles.emptyText}>Check back soon for upcoming events.</p>
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <section className={styles.yearBlock}>
                <h2 className={styles.year}>
                  <span>Upcoming</span>
                </h2>
                <ul className={`${styles.grid} ${own.grid}`}>
                  {upcoming.map((e) => (
                    <li key={e.slug}>
                      <EventCard event={e} />
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {past.length > 0 && (
              <section className={styles.yearBlock}>
                <h2 className={styles.year}>
                  <span>Past</span>
                </h2>
                <ul className={`${styles.grid} ${own.grid}`}>
                  {past.map((e) => (
                    <li key={e.slug}>
                      <EventCard event={e} />
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
