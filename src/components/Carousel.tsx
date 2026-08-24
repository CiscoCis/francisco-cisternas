'use client';

import {
  Children,
  ElementType,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Icon } from './Icons';
import styles from './Carousel.module.css';

/*
 * A small hand-rolled carousel: a horizontally scrolling, scroll-snapping
 * track with prev/next buttons layered on top. No slider dependency — the
 * project has none, and this is the one pattern (Beyond Work, the homepage
 * blog strip) that needs it.
 *
 * Content is never dependent on the buttons: with JavaScript off, or on a
 * touch device, the track is still a plain scrollable list a visitor can
 * swipe through.
 */

interface Props {
  children: ReactNode;
  /** Tag for the scrollable track — 'ul' when children are <li> slides. */
  as?: ElementType;
  className?: string;
  /** Accessible name for the scrollable region, e.g. "Beyond Work". */
  label: string;
}

export default function Carousel({
  children,
  as: Tag = 'ul',
  className = '',
  label,
}: Props) {
  const trackRef = useRef<HTMLElement | null>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const updateEdges = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateEdges();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateEdges, { passive: true });
    window.addEventListener('resize', updateEdges);
    return () => {
      el.removeEventListener('scroll', updateEdges);
      window.removeEventListener('resize', updateEdges);
    };
  }, [updateEdges]);

  const scrollBy = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({
      left: el.clientWidth * 0.86 * dir,
      behavior: reduce ? 'auto' : 'smooth',
    });
  };

  const count = Children.count(children);

  return (
    <div className={styles.wrap}>
      <Tag
        ref={trackRef}
        className={`${styles.track} ${className}`}
        role="region"
        aria-label={label}
        tabIndex={0}
      >
        {children}
      </Tag>

      {count > 1 && (
        <div className={styles.controls}>
          <button
            type="button"
            className={styles.navBtn}
            onClick={() => scrollBy(-1)}
            disabled={atStart}
            aria-label={`Previous — ${label}`}
          >
            <Icon name="chevron" size={16} className={styles.prevIcon} />
          </button>
          <button
            type="button"
            className={styles.navBtn}
            onClick={() => scrollBy(1)}
            disabled={atEnd}
            aria-label={`Next — ${label}`}
          >
            <Icon name="chevron" size={16} className={styles.nextIcon} />
          </button>
        </div>
      )}
    </div>
  );
}
