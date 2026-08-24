import { mediaItems } from '@/data/media';
import SectionHeader from '../SectionHeader';
import TriangleField from '../TriangleField';
import Reveal from '../Reveal';
import { Icon } from '../Icons';
import styles from './Media.module.css';

/*
 * Media & Stories — change requirements §9.
 *
 * Linked cards only. No article text is reproduced here; each card carries
 * enough to decide whether to click, and the click goes to the original
 * publisher.
 *
 * Items whose URL has not been supplied are shown while developing, marked
 * as needing a link, and dropped from the production build — see the note
 * at the top of src/data/media.ts. If nothing is publishable the whole
 * section disappears rather than rendering an empty shell.
 */

const isProd = process.env.NODE_ENV === 'production';

/* Each category carries its own triangle tint, so a row of cards reads as
   a set rather than three copies of the same object. */
const TINT: Record<string, string> = {
  'Career story': 'var(--blue)',
  'Alumni profile': 'var(--red)',
  'Research feature': 'var(--teal)',
  Profile: 'var(--blue)',
  Interview: 'var(--cyan)',
};

export default function Media() {
  const items = mediaItems.filter((m) => m.url || !isProd);
  if (!items.length) return null;

  return (
    <section
      id="media"
      className="section section--tint"
      aria-labelledby="media-h"
    >
      <TriangleField variant="section" className={`triangles ${styles.tri}`} />

      <div className="container">
        <SectionHeader
          id="media"
          eyebrow="Media & Stories"
          title="Written about elsewhere"
          lede="A short, curated set of interviews, profiles and research features published by others. Each card links to the original."
        />

        <Reveal variant="group" as="ul" className={styles.grid}>
          {items.map((m) => {
            const linked = Boolean(m.url);
            const Card = linked ? 'a' : 'div';

            return (
              <li
                key={m.id}
                className={`card ${linked ? 'card--link' : ''}`}
                style={{ ['--tint' as string]: TINT[m.category] ?? 'var(--blue)' }}
              >
                <span className="card-tint" aria-hidden="true" />
                <Card
                  className={styles.body}
                  {...(linked
                    ? {
                        href: m.url,
                        target: '_blank',
                        rel: 'noopener noreferrer',
                      }
                    : {})}
                >
                  <div className={styles.top}>
                    <span className="chip chip--accent">{m.category}</span>
                    {m.language && m.language !== 'English' && (
                      <span className="chip chip--quiet">{m.language}</span>
                    )}
                  </div>

                  <h3 className={styles.title}>{m.title}</h3>
                  <p className={styles.desc}>{m.description}</p>

                  <p className={styles.source}>
                    <Icon name="newspaper" size={16} />
                    <span>{m.source}</span>
                    {m.date && <span className={styles.date}>{m.date}</span>}
                  </p>

                  {linked ? (
                    <span className={styles.read}>
                      Read the story
                      <Icon name="arrow" size={16} />
                    </span>
                  ) : (
                    <span className="pending">Link needed</span>
                  )}
                </Card>
              </li>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
