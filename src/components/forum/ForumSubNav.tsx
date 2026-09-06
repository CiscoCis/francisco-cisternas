'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './ForumSubNav.module.css';

const ITEMS = [
  { href: '/forum', label: 'Home' },
  { href: '/forum/conversations', label: 'Conversations' },
  { href: '/forum/people', label: 'People' },
  { href: '/forum/opportunities', label: 'Opportunities' },
  { href: '/forum/events', label: 'Events' },
  { href: '/forum/ask', label: 'Ask' },
  { href: '/forum/guidelines', label: 'Guidelines' },
];

export default function ForumSubNav() {
  const pathname = usePathname();

  return (
    <div className={styles.wrap}>
      <nav className={styles.scroller} aria-label="Forum">
        <ul>
          {ITEMS.map((item) => {
            const active =
              item.href === '/forum' ? pathname === '/forum' : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={active ? styles.active : undefined}
                  aria-current={active ? 'true' : undefined}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
