import Link from 'next/link';
import { profile } from '@/data/profile';
import type { NavItem } from '@/data/nav';
import { Icon } from './Icons';
import styles from './Footer.module.css';

// Only verified information appears — no social accounts have been
// supplied, so none are fabricated.
//
// A plain <a> (unlike next/link) never gets `basePath` prefixed
// automatically, so this has to be added by hand — otherwise these links
// send a visitor on a GitHub Pages project site (served under /<repo>/)
// to the bare domain root, which 404s.
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export default function Footer({ nav }: { nav: NavItem[] }) {
  // Static export: keep this deterministic, update on rebuild.
  const year = 2026;

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <nav className={styles.nav} aria-label="Footer">
          <ul>
            {nav.map((item) => (
              <li key={item.id}>
                <a href={`${BASE_PATH}/#${item.id}`}>{item.label}</a>
              </li>
            ))}
            <li>
              <Link href="/blog">All posts</Link>
            </li>
          </ul>
        </nav>

        <div className={styles.base}>
          <p className={styles.credit}>
            © {year} {profile.name}
            <span className={styles.sep} aria-hidden="true" />
            <a
              className={styles.role}
              href={profile.contact.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {profile.school}
              <Icon name="external" size={12} />
            </a>
          </p>
          <a href="#home" className={styles.top}>
            Back to top
            <Icon name="arrow" size={15} className={styles.topArrow} />
          </a>
        </div>
      </div>
    </footer>
  );
}
