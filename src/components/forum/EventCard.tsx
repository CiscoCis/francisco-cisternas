import Link from 'next/link';
import type { ForumEvent } from '@/lib/content/forumEvents';
import { Icon } from '../Icons';
import styles from '../PostCard.module.css';

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return `${d} ${months[m - 1]} ${y}`;
}

export default function EventCard({ event }: { event: ForumEvent }) {
  return (
    <article className={`card card--link ${styles.card}`} style={{ ['--tint' as string]: 'var(--cyan)' }}>
      <span className="card-tint" aria-hidden="true" />
      <div className={styles.body}>
        <div className={styles.top}>
          {event.featured && <span className="chip chip--quiet">Featured</span>}
          {event.kind && <span className="chip chip--accent">{event.kind}</span>}
        </div>

        <h3 className={styles.title}>
          <Link href={`/forum/events/${event.slug}`}>
            <span className={styles.hit} aria-hidden="true" />
            {event.title}
          </Link>
        </h3>

        <p className={styles.excerpt}>{event.description}</p>

        <p className={styles.foot}>
          <span>
            <time dateTime={event.date}>{formatDate(event.date)}</time>
            {event.time && ` · ${event.time}`}
          </span>
          <span className={styles.read}>
            View
            <Icon name="arrow" size={15} />
          </span>
        </p>
      </div>
    </article>
  );
}
