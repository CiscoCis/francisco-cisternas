import {
  programmes,
  teachingReach,
  teachingRecognition,
} from '@/data/teaching';
import type { TeachingStory } from '@/lib/content/teachingStories';
import Photo from '../Photo';
import Reveal from '../Reveal';
import TriangleField from '../TriangleField';
import TeachingLife from '../TeachingLife';
import { Icon } from '../Icons';
import styles from './Teaching.module.css';

export default function Teaching({ teachingStories }: { teachingStories: TeachingStory[] }) {
  return (
    <section
      id="teaching"
      className={`section section--tint ${styles.section}`}
      aria-labelledby="teaching-h"
    >
      <TriangleField variant="quiet" className={`triangles ${styles.tri}`} />

      {/* ---------- hero ---------- */}
      <div className={styles.hero}>
        <Reveal variant="group" className={styles.heroText}>
          <span className={styles.rule} aria-hidden="true" />
          <h2 id="teaching-h" className="display display--page">
            Teaching
          </h2>
          <p className={styles.heroLede}>
            I teach quantitative marketing, digital marketing, marketing
            research and analytics across MBA, EMBA, MSc, undergraduate and PhD
            programmes.
          </p>
        </Reveal>

        <Reveal variant="image" className={styles.heroMedia}>
          <Photo
            name="teaching"
            small="teaching-sm"
            alt="Francisco Cisternas writing an optimisation model on a whiteboard"
            width={1600}
            height={1066}
            sizes="(max-width: 900px) 100vw, 52vw"
            className={styles.heroImg}
          />
        </Reveal>

      </div>

      <div className="container">
        {/* ---------- overview ---------- */}
        <div className={styles.block}>
          <h3 className={`display display--sub ${styles.blockTitle}`}>
            Teaching Overview
          </h3>
          <span className={styles.rule} aria-hidden="true" />
          <p className={styles.blockNote}>Courses taught at CUHK Business School.</p>

          <Reveal variant="group" className={styles.programmes}>
            {programmes.map((p) => (
              <div key={p.id} className={styles.programme}>
                <span className="icon-disc">
                  <Icon name={p.icon} />
                </span>
                <div>
                  <h4>{p.label}</h4>
                  <ul>
                    {p.courses.map((c) => (
                      <li key={c.name}>
                        <span className={styles.bullet} aria-hidden="true" />
                        <span>
                          {c.name}
                          <em> — {c.years}</em>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </Reveal>
        </div>

        {/* ---------- resources + reach ---------- */}
        <div className={styles.reachBlock}>
          <h3 className={`display display--sub ${styles.blockTitle}`}>
            Teaching Reach
          </h3>
          <span className={styles.rule} aria-hidden="true" />
          <p className={styles.reachIntro}>
            Teaching in other institutions across{' '}
            <strong>{teachingReach.countries.join(', ')}</strong>.
          </p>

          <div className={styles.topicGrid}>
            <div className={styles.topicGroup}>
              <p className="label-caps">At Business Schools</p>
              <ul>
                {teachingReach.businessSchoolTopics.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>

            <div className={styles.topicGroup}>
              <p className="label-caps">At Engineering Schools</p>
              <ul>
                {teachingReach.engineeringSchoolTopics.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ---------- recognition ---------- */}
        <div className={styles.recognition}>
          <div className={styles.recHead}>
            <span className="icon-disc">
              <Icon name="trophy" />
            </span>
            <h3 className={`display display--sub ${styles.recTitle}`}>
              Teaching Recognition
            </h3>
            <span className={styles.recRule} aria-hidden="true" />
          </div>
          <ul className={styles.recList}>
            {teachingRecognition.map((r) => (
              <li key={r.name}>
                <Icon name="star" size={17} />
                <span>
                  <strong>{r.name}</strong>
                  <em>{r.detail}</em>
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* ---------- teaching life (change requirements §6.2) ---------- */}
        <TeachingLife stories={teachingStories} />
      </div>
    </section>
  );
}
