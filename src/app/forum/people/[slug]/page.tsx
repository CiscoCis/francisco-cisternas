import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { personBySlug } from '@/lib/content/people';
import { getVisiblePeople } from '@/lib/content/people.server';
import { asset } from '@/lib/asset';
import { Icon } from '@/components/Icons';
import IntroductionRequestForm from '@/components/forum/IntroductionRequestForm';
import styles from './person.module.css';

type Params = { slug: string };

const PLACEHOLDER_SLUG = 'no-people-yet';

export function generateStaticParams(): Params[] {
  const items = getVisiblePeople();
  if (!items.length) return [{ slug: PLACEHOLDER_SLUG }];
  return items.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const person = personBySlug(getVisiblePeople(), slug);
  if (!person) return { title: 'People', robots: { index: false, follow: false } };
  return { title: person.name, description: person.intro };
}

export default async function PersonPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const person = personBySlug(getVisiblePeople(), slug);

  if (!person) {
    if (slug !== PLACEHOLDER_SLUG) notFound();
    return (
      <div className={`section ${styles.section}`}>
        <div className="container">
          <p className={styles.crumb}>
            <Link href="/forum/people">
              <Icon name="chevron" size={15} className={styles.back} />
              All people
            </Link>
          </p>
          <h1 className="display display--page">Nobody listed yet</h1>
        </div>
      </div>
    );
  }

  return (
    <div className={`section ${styles.section}`}>
      <div className="container">
        <p className={styles.crumb}>
          <Link href="/forum/people">
            <Icon name="chevron" size={15} className={styles.back} />
            All people
          </Link>
        </p>

        <div className={styles.grid}>
          <div className={`panel ${styles.card}`}>
            {person.photo && (
              <div className={styles.photoWrap}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={asset(person.photo)} alt="" className={styles.photo} />
              </div>
            )}

            <h1 className={styles.name}>{person.name}</h1>
            <p className={styles.roleLine}>
              {[person.role, person.organisation].filter(Boolean).join(', ')}
            </p>
            {person.location && <p className={styles.location}>{person.location}</p>}
            {(person.programme || person.graduationYear) && (
              <p className={styles.programme}>
                {[person.programme, person.graduationYear].filter(Boolean).join(' · ')}
              </p>
            )}

            {person.intro && <p className={styles.intro}>{person.intro}</p>}

            {person.expertiseTags.length > 0 && (
              <div className={styles.tagBlock}>
                <p className={styles.tagLabel}>Expertise</p>
                <div className={styles.tags}>
                  {person.expertiseTags.map((t) => (
                    <span key={t} className="chip chip--accent">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {person.canHelpWith.length > 0 && (
              <div className={styles.tagBlock}>
                <p className={styles.tagLabel}>Can help with</p>
                <div className={styles.tags}>
                  {person.canHelpWith.map((t) => (
                    <span key={t} className="chip chip--data">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {person.interestedIn.length > 0 && (
              <div className={styles.tagBlock}>
                <p className={styles.tagLabel}>Interested in</p>
                <div className={styles.tags}>
                  {person.interestedIn.map((t) => (
                    <span key={t} className="chip chip--quiet">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {person.linkedinUrl && (
              <a
                className={`link-arrow ${styles.linkedin}`}
                href={person.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="linkedin" size={16} />
                LinkedIn
                <Icon name="external" size={12} />
              </a>
            )}
          </div>

          <div className={`panel ${styles.card}`}>
            <IntroductionRequestForm targetSlug={person.slug} targetName={person.name} />
          </div>
        </div>
      </div>
    </div>
  );
}
