import Link from 'next/link';
import type { Opportunity } from '@/lib/content/opportunities';
import { Icon } from '../Icons';
import styles from '../PostCard.module.css';

export default function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  return (
    <article className={`card card--link ${styles.card}`} style={{ ['--tint' as string]: 'var(--teal)' }}>
      <span className="card-tint" aria-hidden="true" />
      <div className={styles.body}>
        <div className={styles.top}>
          {opportunity.featured && <span className="chip chip--quiet">Featured</span>}
          {opportunity.type && <span className="chip chip--accent">{opportunity.type}</span>}
          {opportunity.draft && <span className="pending">Draft</span>}
        </div>

        <h3 className={styles.title}>
          <Link href={`/forum/opportunities/${opportunity.slug}`}>
            <span className={styles.hit} aria-hidden="true" />
            {opportunity.title}
          </Link>
        </h3>

        <p className={styles.excerpt}>
          {[opportunity.organisation, opportunity.location].filter(Boolean).join(' · ')}
        </p>

        <p className={styles.foot}>
          <span>{opportunity.deadline ? `Deadline: ${opportunity.deadline}` : 'Open'}</span>
          <span className={styles.read}>
            View
            <Icon name="arrow" size={15} />
          </span>
        </p>
      </div>
    </article>
  );
}
