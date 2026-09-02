import type { Recommendation } from '@/lib/content/recommendations';
import { hasRecommendations } from '@/lib/content/recommendations';
import SectionHeader from '../SectionHeader';
import TriangleField from '../TriangleField';
import Reveal from '../Reveal';
import { Icon } from '../Icons';
import styles from './Recommendations.module.css';

/*
 * Recommendations — people, sites, articles and other resources Francisco
 * wants visitors to know about. Managed through TinaCMS (content/
 * recommendations/*.json) exactly like Media & Stories, whose card design
 * this deliberately reuses rather than inventing a new visual pattern.
 *
 * Each card links straight to the external resource — nothing about the
 * recommended person/site/article is reproduced here beyond a short note
 * on why it's worth a visit.
 */

const TINT: Record<string, string> = {
  Person: 'var(--blue)',
  Website: 'var(--cyan)',
  Article: 'var(--teal)',
  'Blog post': 'var(--teal)',
  'Other resource': 'var(--red)',
};

export default function Recommendations({ items: allItems }: { items: Recommendation[] }) {
  const items = allItems.filter((r) => r.url);
  if (!hasRecommendations(items)) return null;

  return (
    <section
      id="recommendations"
      className="section"
      aria-labelledby="recommendations-h"
    >
      <TriangleField variant="quiet" className={`triangles ${styles.tri}`} />

      <div className="container">
        <SectionHeader
          id="recommendations"
          eyebrow="Recommendations"
          title="People, sites and ideas worth your time"
          lede="A short list of people, websites, articles and other resources Francisco thinks are worth a visit."
        />

        <Reveal variant="group" as="ul" className={styles.grid}>
          {items.map((r) => (
            <li
              key={r.id}
              className="card card--link"
              style={{ ['--tint' as string]: TINT[r.category] ?? 'var(--blue)' }}
            >
              <span className="card-tint" aria-hidden="true" />
              <a
                className={styles.body}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className={styles.top}>
                  <span className="chip chip--accent">{r.category}</span>
                </div>

                <h3 className={styles.title}>{r.title}</h3>
                {r.description && <p className={styles.desc}>{r.description}</p>}

                <span className={styles.visit}>
                  Visit
                  <Icon name="arrow" size={16} />
                </span>
              </a>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
