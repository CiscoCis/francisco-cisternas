'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { profile } from '@/data/profile';
import { NAV } from '@/data/nav';
import { Icon } from './Icons';
import styles from './Header.module.css';

// The wordmark doubles as the "Home" nav item, which is why the nav list
// itself starts at About. The site is one scrolling page plus a real /blog
// route, so nav links have to work from both: on the home page they scroll,
// from anywhere else they navigate to /#section and let the browser do the
// rest.

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  const [active, setActive] = useState<string>('home');
  // Kept in a ref so the scroll handler can compare without reading state
  // it doesn't depend on.
  const lastRef = useRef<string>('home');
  const [scrolled, setScrolled] = useState(false);
  // Separate from `scrolled` so the bar has three states, not two: almost
  // transparent at the very top, settling as you leave it.
  const [atTop, setAtTop] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!isHome) {
      setScrolled(true);
      setAtTop(false);
      return;
    }
    const sections = ['home', ...NAV.map((n) => n.id)]
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!sections.length) return;

    let frame = 0;

    const measure = () => {
      frame = 0;
      const y = window.scrollY;
      setScrolled(y > 12);
      setAtTop(y < 8);

      const probe = window.scrollY + window.innerHeight * 0.32;
      let current = sections[0].id;
      for (const s of sections) {
        if (s.offsetTop <= probe) current = s.id;
      }
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 4
      ) {
        current = sections[sections.length - 1].id;
      }
      // The URL update happens here, not inside the setActive updater: React
      // may run a state updater during render, and Next patches
      // history.replaceState to notify the App Router, so calling it from
      // inside the updater would update the Router while Header renders.
      if (current !== lastRef.current) {
        lastRef.current = current;
        const url = current === 'home' ? '/' : `#${current}`;
        if (window.location.hash !== url) {
          window.history.replaceState(null, '', url);
        }
        setActive(current);
      }
    };

    // Coalesce to one measurement per frame — reading offsetTop in the raw
    // scroll handler is what turns a smooth page into a janky one.
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [isHome]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const go = useCallback(
    (e: React.MouseEvent, id: string) => {
      setMenuOpen(false);
      if (!isHome) return; // let the /#id link navigate normally
      e.preventDefault();
      const el = document.getElementById(id);
      if (!el) return;
      const reduce = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;
      const top =
        el.getBoundingClientRect().top +
        window.scrollY -
        (parseInt(
          getComputedStyle(document.documentElement).getPropertyValue(
            '--header-h'
          )
        ) || 82);
      window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
      window.history.replaceState(null, '', id === 'home' ? '/' : `#${id}`);
    },
    [isHome]
  );

  const href = (id: string) => (isHome ? `#${id}` : `/#${id}`);

  // Split on the first space so the wordmark can carry a two-colour hover
  // treatment without hardcoding the name.
  const [wordmarkFirst, ...wordmarkRest] = profile.name.split(' ');
  const wordmarkLast = wordmarkRest.join(' ');

  const items = NAV.map((item) => ({
    ...item,
    isActive: isHome ? active === item.id : false,
  }));

  return (
    <header
      className={`${styles.header} ${atTop ? styles.atTop : ''} ${
        scrolled ? styles.scrolled : ''
      }`}
    >
      <div className={styles.bar}>
        <Link
          href={isHome ? '#home' : '/'}
          className={styles.logo}
          onClick={(e) => go(e, 'home')}
          aria-label={`${profile.name} — home`}
        >
          <span className={styles.wordmark}>
            <span className={styles.wordmarkFirst}>{wordmarkFirst}</span>
            {wordmarkLast && (
              <>
                {' '}
                <span className={styles.wordmarkLast}>{wordmarkLast}</span>
              </>
            )}
          </span>
        </Link>

        <nav className={styles.nav} aria-label="Primary">
          <ul>
            {items.map((item) => (
              <li key={item.id}>
                <a
                  href={href(item.id)}
                  onClick={(e) => go(e, item.id)}
                  className={item.isActive ? styles.active : undefined}
                  aria-current={item.isActive ? 'true' : undefined}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          className={styles.burger}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <Icon name={menuOpen ? 'close' : 'menu'} size={22} />
          <span className="sr-only">
            {menuOpen ? 'Close menu' : 'Open menu'}
          </span>
        </button>
      </div>

      <div
        id="mobile-nav"
        className={`${styles.drawer} ${menuOpen ? styles.drawerOpen : ''}`}
        // `inert` rather than `hidden`: the drawer must stay in the box tree
        // for its height to animate, but not be focusable while closed.
        inert={!menuOpen}
      >
        <nav aria-label="Primary — mobile">
          <ul>
            {items.map((item) => (
              <li key={item.id}>
                <a
                  href={href(item.id)}
                  onClick={(e) => go(e, item.id)}
                  className={item.isActive ? styles.active : undefined}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
