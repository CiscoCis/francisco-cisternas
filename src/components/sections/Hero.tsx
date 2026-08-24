import { profile, cvVersions } from '@/data/profile';
import TriangleField from '../TriangleField';
import Photo from '../Photo';
import Reveal from '../Reveal';
import Parallax from '../Parallax';
import { Icon, IconName } from '../Icons';
import styles from './Hero.module.css';

/*
 * Home.
 *
 * Change requirements §3: the person leads. The only thing above the name is
 * a line describing the work itself — teaching, research, analytics,
 * technology — and none of it is tied to a title or an employer. The
 * institution appears once, further down, as a link out to the official
 * profile rather than a reproduction of it.
 *
 * Quick links are limited to destinations that actually exist. The email
 * address is deliberately absent (§10 — the contact form is the route in),
 * and the CV button only renders once a file has been supplied (§11).
 */

const links: {
  label: string;
  href: string;
  icon: IconName;
  external?: boolean;
  size?: number;
}[] = [
  {
    label: 'ORCID',
    href: profile.contact.orcidUrl,
    icon: 'orcid',
    external: true,
    /* The ORCID mark is a ring, so it reads smaller than the others
       at a matched size — give it a couple of extra pixels. */
    size: 25,
  },
  {
    label: 'University profile',
    href: profile.contact.profileUrl,
    icon: 'user',
    external: true,
  },
];

export default function Hero() {
  const cv = cvVersions.find((v) => v.href);

  return (
    <section id="home" className={styles.section} aria-labelledby="hero-h">
      {/* Layer 1 — the painterly coffee wash, furthest back. */}

      <div className={styles.hero}>
        {/* The portrait is the LCP element, so it paints at full opacity
            rather than fading in — only the text and the network move. */}
        <div className={styles.photoCol}>
          <Photo
            name="portrait-full"
            small="portrait-full-sm"
            alt={profile.name}
            width={1000}
            height={1501}
            priority
            sizes="(max-width: 900px) 78vw, 38vw"
            className={styles.portrait}
          />
        </div>

        <Reveal variant="group" className={styles.textCol}>
          <p className={styles.disciplines}>
            {profile.disciplines.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </p>

          <h1 id="hero-h" className={`display display--hero ${styles.name}`}>
            Francisco
            <br />
            Cisternas
          </h1>

          <p className={styles.intro}>{profile.heroIntro}</p>

          <div className={styles.actions}>
            <a href="#research" className="btn">
              See the research
              <Icon name="arrow" size={17} />
            </a>
            <a href="#contact" className="btn btn--ghost">
              Get in touch
            </a>
            {cv && (
              <a href={cv.href} className="btn btn--ghost" download>
                <Icon name="download" size={17} />
                Download CV
              </a>
            )}
          </div>

          <ul className={styles.links}>
            {links.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  {...(l.external
                    ? { target: '_blank', rel: 'noopener noreferrer' }
                    : {})}
                >
                  <Icon name={l.icon} size={l.size ?? 21} />
                  <span>{l.label}</span>
                  {l.external && (
                    <Icon name="external" size={14} className={styles.extIcon} />
                  )}
                </a>
              </li>
            ))}
          </ul>
        </Reveal>

        {/* Layer 2 — the triangle field, drifting slowly against the
            scroll so the composition keeps re-crossing itself. */}
        <Parallax className={`triangles ${styles.network}`} distance={30}>
          <TriangleField variant="hero" />
        </Parallax>
      </div>

      <p className={styles.scroll} aria-hidden="true">
        <span>SCROLL TO EXPLORE</span>
        <Icon name="chevron" size={18} />
      </p>
    </section>
  );
}
