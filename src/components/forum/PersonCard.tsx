import Link from 'next/link';
import type { ForumPerson } from '@/lib/content/people';
import { asset } from '@/lib/asset';
import { Icon } from '../Icons';
// Reuses the blog PostCard's stylesheet for the shared card shell.
import styles from '../PostCard.module.css';

export default function PersonCard({ person }: { person: ForumPerson }) {
  return (
    <article className={`card card--link ${styles.card}`} style={{ ['--tint' as string]: 'var(--blue)' }}>
      <span className="card-tint" aria-hidden="true" />
      {person.photo && (
        <div className={styles.media}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset(person.photo)} alt="" loading="lazy" className={styles.image} />
        </div>
      )}
      <div className={styles.body}>
        <div className={styles.top}>
          {person.featured && <span className="chip chip--quiet">Featured</span>}
          {person.programme && <span className="chip chip--accent">{person.programme}</span>}
        </div>

        <h3 className={styles.title}>
          <Link href={`/forum/people/${person.slug}`}>
            <span className={styles.hit} aria-hidden="true" />
            {person.name}
          </Link>
        </h3>

        <p className={styles.excerpt}>
          {[person.role, person.organisation].filter(Boolean).join(', ') || person.location}
        </p>

        <p className={styles.foot}>
          <span>{person.location}</span>
          <span className={styles.read}>
            View
            <Icon name="arrow" size={15} />
          </span>
        </p>
      </div>
    </article>
  );
}
