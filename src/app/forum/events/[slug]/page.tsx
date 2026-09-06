import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { forumEventBySlug } from '@/lib/content/forumEvents';
import { getVisibleForumEvents } from '@/lib/content/forumEvents.server';
import { Icon } from '@/components/Icons';
import RsvpForm from '@/components/forum/RsvpForm';
import styles from '../../people/[slug]/person.module.css';

type Params = { slug: string };

const PLACEHOLDER_SLUG = 'no-events-yet';

export function generateStaticParams(): Params[] {
  const items = getVisibleForumEvents();
  if (!items.length) return [{ slug: PLACEHOLDER_SLUG }];
  return items.map((e) => ({ slug: e.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = forumEventBySlug(getVisibleForumEvents(), slug);
  if (!item) return { title: 'Events', robots: { index: false, follow: false } };
  return { title: item.title, description: item.description };
}

export default async function EventPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const item = forumEventBySlug(getVisibleForumEvents(), slug);

  if (!item) {
    if (slug !== PLACEHOLDER_SLUG) notFound();
    return (
      <div className={`section ${styles.section}`}>
        <div className="container">
          <p className={styles.crumb}>
            <Link href="/forum/events">
              <Icon name="chevron" size={15} className={styles.back} />
              All events
            </Link>
          </p>
          <h1 className="display display--page">Nothing scheduled yet</h1>
        </div>
      </div>
    );
  }

  return (
    <div className={`section ${styles.section}`}>
      <div className="container">
        <p className={styles.crumb}>
          <Link href="/forum/events">
            <Icon name="chevron" size={15} className={styles.back} />
            All events
          </Link>
        </p>

        <div className={styles.grid}>
          <div className={`panel ${styles.card}`}>
            {item.kind && (
              <div className={styles.tags}>
                <span className="chip chip--accent">{item.kind}</span>
              </div>
            )}
            <h1 className={styles.name}>{item.title}</h1>
            <p className={styles.roleLine}>{item.date}{item.time ? ` · ${item.time}` : ''}</p>
            {item.location && <p className={styles.location}>{item.location}</p>}
            {item.description && <p className={styles.intro}>{item.description}</p>}
          </div>

          <div className={`panel ${styles.card}`}>
            <RsvpForm slug={item.slug} />
          </div>
        </div>
      </div>
    </div>
  );
}
