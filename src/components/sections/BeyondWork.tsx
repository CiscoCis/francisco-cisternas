import { interests, beyondWorkLede } from '@/data/interests';
import { asset } from '@/lib/asset';
import SectionHeader from '../SectionHeader';
import TriangleField from '../TriangleField';
import Reveal from '../Reveal';
import Carousel from '../Carousel';
import { Icon } from '../Icons';
import styles from './BeyondWork.module.css';

/*
 * Beyond Work — change requirements §7.
 *
 * A small carousel of the interests marked `feature` in
 * src/data/interests.ts, each with a short story (`note`) in Francisco's
 * own words. The interests themselves were supplied; the photographs and
 * stories were not — a card without a photo falls back to a typographic
 * treatment rather than a broken image or a stock substitute, and a card
 * without a note simply omits the sentence.
 */

export default function BeyondWork() {
  const featured = interests.filter((i) => i.feature);
  if (!featured.length) return null;

  return (
    <section
      id="beyond"
      className="section section--tint"
      aria-labelledby="beyond-h"
    >
      <TriangleField variant="quiet" className={`triangles ${styles.tri}`} />

      <div className="container">
        <SectionHeader
          id="beyond"
          eyebrow="Beyond Work"
          title="Off the clock"
          lede={beyondWorkLede}
        />

        <Reveal variant="item">
          <Carousel as="ul" className={styles.grid} label="Beyond work">
            {featured.map((i) => (
              <li
                key={i.id}
                className={`${styles.item} ${i.photo ? styles.hasPhoto : ''}`}
              >
                {/* The image block only exists when there is a real image.
                    Without one the card collapses to its caption row rather
                    than reserving space for a picture that is not there. */}
                {i.photo && (
                  <div className={styles.media}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={asset(i.photo)}
                      alt={i.photoAlt ?? i.label}
                      loading="lazy"
                      className={styles.photo}
                    />
                  </div>
                )}

                <div className={styles.caption}>
                  <span className={styles.icon} aria-hidden="true">
                    <Icon name={i.icon} size={18} />
                  </span>
                  <h3 className={styles.label}>{i.label}</h3>
                  {i.note && <p className={styles.note}>{i.note}</p>}
                </div>
              </li>
            ))}
          </Carousel>
        </Reveal>
      </div>
    </section>
  );
}
