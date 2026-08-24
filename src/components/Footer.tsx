import Link from 'next/link';
import { profile } from '@/data/profile';
import { NAV } from '@/data/nav';
import { Icon } from './Icons';
import styles from './Footer.module.css';

// Only verified information appears — no social accounts have been
// supplied, so none are fabricated.
export default function Footer() {
  // Static export: keep this deterministic, update on rebuild.
  const year = 2026;

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <nav className={styles.nav} aria-label="Footer">
          <ul>
            {NAV.map((item) => (
              <li key={item.id}>
                <a href={`/#${item.id}`}>{item.label}</a>
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
