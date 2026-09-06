import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { opportunityBySlug } from '@/lib/content/opportunities';
import { getVisibleOpportunities } from '@/lib/content/opportunities.server';
import { Icon } from '@/components/Icons';
import styles from '../../people/[slug]/person.module.css';
import own from './opportunity.module.css';

type Params = { slug: string };

const PLACEHOLDER_SLUG = 'no-opportunities-yet';

export function generateStaticParams(): Params[] {
  const items = getVisibleOpportunities();
  if (!items.length) return [{ slug: PLACEHOLDER_SLUG }];
  return items.map((o) => ({ slug: o.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = opportunityBySlug(getVisibleOpportunities(), slug);
  if (!item) return { title: 'Opportunities', robots: { index: false, follow: false } };
  return { title: item.title, description: item.description };
}

export default async function OpportunityPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const item = opportunityBySlug(getVisibleOpportunities(), slug);

  if (!item) {
    if (slug !== PLACEHOLDER_SLUG) notFound();
    return (
      <div className={`section ${styles.section}`}>
        <div className="container">
          <p className={styles.crumb}>
            <Link href="/forum/opportunities">
              <Icon name="chevron" size={15} className={styles.back} />
              All opportunities
            </Link>
          </p>
          <h1 className="display display--page">Nothing posted yet</h1>
        </div>
      </div>
    );
  }

  return (
    <div className={`section ${styles.section}`}>
      <div className="container">
        <p className={styles.crumb}>
          <Link href="/forum/opportunities">
            <Icon name="chevron" size={15} className={styles.back} />
            All opportunities
          </Link>
        </p>

        <div className={`panel ${styles.card} ${own.card}`}>
          <div className={own.badges}>
            {item.type && <span className="chip chip--accent">{item.type}</span>}
            {item.featured && <span className="chip chip--quiet">Featured</span>}
          </div>

          <h1 className={styles.name}>{item.title}</h1>
          <p className={styles.roleLine}>
            {[item.organisation, item.location].filter(Boolean).join(' · ')}
          </p>
          {item.deadline && <p className={styles.location}>Deadline: {item.deadline}</p>}
          {item.relevantFor && <p className={styles.programme}>Relevant for: {item.relevantFor}</p>}

          {item.description && <p className={styles.intro}>{item.description}</p>}

          <a
            className={`btn-primary ${own.apply}`}
            href={item.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Apply / learn more
            <Icon name="external" size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}
