import { profile, journey, cvVersions } from '@/data/profile';
import SectionHeader from '../SectionHeader';
import Reveal from '../Reveal';
import TriangleField from '../TriangleField';
import { Icon } from '../Icons';
import styles from './About.module.css';

/* The rail runs blue → cyan → teal; the stop markers walk the same ramp. */
const STOP_TINTS = ['var(--blue)', 'var(--cyan)', 'var(--teal)'];

export default function About() {
  const cvs = cvVersions.filter((v) => v.href);

  return (
    <section
      id="about"
      className="section section--tint"
      aria-labelledby="about-h"
    >
      <TriangleField variant="section" className={`triangles ${styles.tri}`} />

      <div className="container">
        <SectionHeader
          id="about"
          title="About"
          lede="Chile to Pittsburgh to Hong Kong — engineering, then marketing, with data running through all of it."
        />

        <Reveal variant="group" className={styles.grid}>
          {/* ---------- biography ---------- */}
          <div>
            <h3 className="block-heading">Biography</h3>
            <span className="block-rule" aria-hidden="true" />
            <p className={styles.bio}>{profile.biography}</p>
          </div>

          {/* ---------- roles + CV ---------- */}
          <div className={styles.side}>
            <h3 className="block-heading">Current roles</h3>
            <span className="block-rule" aria-hidden="true" />

            <ul className={styles.positions}>
              <li>
                <span className={styles.dot} aria-hidden="true" />
                {profile.title} of Marketing, {profile.school},{' '}
                {profile.university}
              </li>
              {profile.otherPositions.map((p) => (
                <li key={p}>
                  <span className={styles.dot} aria-hidden="true" />
                  {p}
                </li>
              ))}
            </ul>

            <a
              className={`link-arrow ${styles.profileLink}`}
              href={profile.contact.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Official university profile
              <Icon name="external" size={15} />
            </a>

            {cvs.length > 0 && (
              <div className={styles.cv}>
                <p className={styles.rolesLabel}>Curriculum vitae</p>
                <div className={styles.cvRow}>
                  {cvs.map((v) => (
                    <a
                      key={v.label}
                      href={v.href}
                      download
                      className="btn btn--ghost"
                      title={v.description}
                    >
                      <Icon name="download" size={17} />
                      {v.label}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Reveal>

        {/* ---------- career journey ----------
            One line running Chile → international journey → Hong Kong. The
            rail runs blue through cyan to teal, and each stop is a small
            triangle in its own colour along the way. */}
        <div className={styles.journeyWrap}>
          <Reveal>
            <h3 className="block-heading">The route here</h3>
            <span className="block-rule" aria-hidden="true" />
          </Reveal>

          {/* The rail sits OUTSIDE the stagger group: inside it, the
              group's own opacity/transform rules would overwrite the
              draw animation. The wrapper is a no-op reveal whose only job
              is to hand the rail its `is-in` class at the right moment. */}
          <Reveal variant="trigger" className={styles.journeyRel}>
            <span className={`draw-line ${styles.rail}`} aria-hidden="true" />

            <Reveal variant="group" as="ol" className={styles.journey}>
              {journey.map((stop, i) => (
                <li
                  key={stop.place}
                  style={{ ['--stop' as string]: STOP_TINTS[i % STOP_TINTS.length] }}
                >
                  <span className={styles.marker} aria-hidden="true" />
                  <p className={styles.period}>{stop.period}</p>
                  <h4 className={styles.place}>{stop.place}</h4>
                  <p className={styles.where}>{stop.where}</p>
                  <p className={styles.note}>{stop.note}</p>
                </li>
              ))}
            </Reveal>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
