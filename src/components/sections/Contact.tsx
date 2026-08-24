import { profile } from '@/data/profile';
import ContactForm from '../ContactForm';
import TriangleField from '../TriangleField';
import Reveal from '../Reveal';
import { Icon, IconName } from '../Icons';
import styles from './Contact.module.css';

/*
 * Contact — change requirements §10.
 *
 * What is deliberately NOT here any more:
 *   • office hours   — removed
 *   • phone number   — removed
 *   • the office address — removed
 *   • the university email as a prominent, copy-and-paste address — the
 *     form is the route in. The address still exists in the data file and
 *     is used as the mailto fallback when no form endpoint is configured,
 *     but it is not published on the page, so it cannot go stale in public
 *     or be scraped off it.
 *
 * What replaces them is the form itself, plus a short honest note about
 * what kinds of message are welcome and roughly how long a reply takes.
 */

const TOPIC_ICONS: IconName[] = ['mobile', 'database', 'chart', 'leaf', 'heart'];

const WELCOME = [
  'Research collaborations and joint projects',
  'Speaking, panels and guest lectures',
  'Media and press enquiries',
  'Questions from students about courses and programmes',
];

export default function Contact() {
  const c = profile.contact;

  return (
    <section
      id="contact"
      className={`section ${styles.section}`}
      aria-labelledby="contact-h"
    >
      <TriangleField variant="section" className={`triangles ${styles.tri}`} />

      <div className={`container ${styles.inner}`}>
        <Reveal variant="group" as="header" className={styles.head}>
          <span className={styles.rule} aria-hidden="true" />
          <h2 id="contact-h" className="display display--page">
            Get in touch
          </h2>
          <p className={styles.lede}>
            The form below is the best way to reach me — it comes straight to
            my inbox, wherever I happen to be working.
          </p>
        </Reveal>

        <Reveal variant="group" className={styles.grid}>
          {/* ---------- what to write about ---------- */}
          <div className={`panel ${styles.card}`}>
            <div className={styles.block}>
              <h3 className={styles.blockTitle}>Do get in touch about</h3>
              <ul className={styles.welcome}>
                {WELCOME.map((w) => (
                  <li key={w}>
                    <span className={styles.tick} aria-hidden="true">
                      <Icon name="check" size={13} />
                    </span>
                    {w}
                  </li>
                ))}
              </ul>
            </div>

            <hr className="divider" />

            <div className={styles.block}>
              <h3 className={styles.blockTitle}>Research interests</h3>
              <ul className={styles.interests}>
                {profile.researchTopics.map((t, i) => (
                  <li key={t}>
                    <Icon name={TOPIC_ICONS[i]} size={21} />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <hr className="divider" />

            <div className={styles.block}>
              <h3 className={styles.blockTitle}>Elsewhere</h3>
              <p className={styles.profileLinks}>
                <a href={c.profileUrl} target="_blank" rel="noopener noreferrer">
                  <Icon name="user" size={16} />
                  University profile
                  <Icon name="external" size={12} />
                </a>
                <a href={c.orcidUrl} target="_blank" rel="noopener noreferrer">
                  <Icon name="orcid" size={17} />
                  ORCID
                  <Icon name="external" size={12} />
                </a>
              </p>
              <p className={styles.orcid}>ORCID iD: {c.orcid}</p>
            </div>
          </div>

          {/* ---------- form ---------- */}
          <div className={`panel ${styles.card} ${styles.formCard}`}>
            <ContactForm />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
