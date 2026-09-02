'use client';

import { useState } from 'react';
import type { MediaItem } from '@/lib/content/media';
import SectionHeader from '../SectionHeader';
import TriangleField from '../TriangleField';
import Reveal from '../Reveal';
import { Icon } from '../Icons';
import styles from './Media.module.css';

/*
 * Media & Stories — change requirements §9.
 *
 * Each card shows a clamped preview of the description with a "Read more"
 * toggle to expand it in place, rather than the whole card being a single
 * link — that keeps cards visually consistent regardless of description
 * length, and lets a visitor read the full summary without immediately
 * leaving the page. Visiting the original article is still a separate,
 * explicit "Read the story" link at the bottom of the card, same as before.
 *
 * Items whose URL has not been supplied are shown while developing, marked
 * as needing a link, and dropped from the production build. If nothing is
 * publishable the whole section disappears rather than rendering an empty
 * shell.
 */

const isProd = process.env.NODE_ENV === 'production';

/* Each category carries its own triangle tint, so a row of cards reads as
   a set rather than three copies of the same object. */
const TINT: Record<string, string> = {
  'Career story': 'var(--blue)',
  'Alumni profile': 'var(--red)',
  'Research feature': 'var(--teal)',
  Profile: 'var(--blue)',
  Interview: 'var(--cyan)',
};

const READ_MORE_THRESHOLD = 160;

function MediaCard({ item: m }: { item: MediaItem }) {
  const [expanded, setExpanded] = useState(false);
  const linked = Boolean(m.url);
  const isLong = (m.description?.length ?? 0) > READ_MORE_THRESHOLD;

  return (
    <li
      className={`card ${linked ? 'card--link' : ''}`}
      style={{ ['--tint' as string]: TINT[m.category] ?? 'var(--blue)' }}
    >
      <span className="card-tint" aria-hidden="true" />
      <div className={styles.body}>
        <div className={styles.top}>
          <span className="chip chip--accent">{m.category}</span>
          {m.language && m.language !== 'English' && (
            <span className="chip chip--quiet">{m.language}</span>
          )}
        </div>

        <h3 className={styles.title}>{m.title}</h3>

        <div className={styles.descWrap}>
          <p className={`${styles.desc} ${expanded ? '' : styles.descClamped}`}>{m.description}</p>
          {isLong && (
            <button
              type="button"
              className={styles.readMore}
              onClick={() => setExpanded((e) => !e)}
              aria-expanded={expanded}
            >
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>

        <p className={styles.source}>
          <Icon name="newspaper" size={16} />
          <span>{m.source}</span>
          {m.date && <span className={styles.date}>{m.date}</span>}
        </p>

        {linked ? (
          <a href={m.url} target="_blank" rel="noopener noreferrer" className={styles.read}>
            Read the story
            <Icon name="arrow" size={16} />
          </a>
        ) : (
          <span className="pending">Link needed</span>
        )}
      </div>
    </li>
  );
}

export default function Media({ items: allItems }: { items: MediaItem[] }) {
  const items = allItems.filter((m) => m.url || !isProd);
  if (!items.length) return null;

  return (
    <section
      id="media"
      className="section section--tint"
      aria-labelledby="media-h"
    >
      <TriangleField variant="section" className={`triangles ${styles.tri}`} />

      <div className="container">
        <SectionHeader
          id="media"
          eyebrow="Media & Stories"
          title="Written about elsewhere"
          lede="A short, curated set of interviews, profiles and research features published by others. Each card links to the original."
        />

        <Reveal variant="group" as="ul" className={styles.grid}>
          {items.map((m) => (
            <MediaCard key={m.id} item={m} />
          ))}
        </Reveal>
      </div>
    </section>
  );
}
