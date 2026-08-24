'use client';

import { useState } from 'react';
import type { TeachingStory } from '@/lib/content/teachingStories';
import { asset } from '@/lib/asset';
import { Icon } from './Icons';
import styles from './TeachingLife.module.css';

/*
 * Teaching Life — change requirements §6.2.
 *
 * Deliberately not a gallery: every card pairs a photograph with a piece of
 * writing, and opens to the fuller account. The photograph is the hook; the
 * story is the point.
 *
 * The stories have to come from Francisco — see the note in
 * src/data/teachingStories.ts. Until they arrive this renders nothing on the
 * production site rather than filling the space with invented memories.
 */

export default function TeachingLife({ stories }: { stories: TeachingStory[] }) {
  const [open, setOpen] = useState<string | null>(null);

  if (!stories.length) return null;

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <span className="icon-disc">
          <Icon name="users" />
        </span>
        <div>
          <h3 className={`display display--sub ${styles.title}`}>
            Teaching Life
          </h3>
          <p className={styles.lede}>
            The part that does not fit in a course catalogue — field trips,
            classes that went sideways, and the students who made them
            memorable.
          </p>
        </div>
      </div>

      <ul className={styles.grid}>
        {stories.map((s) => {
          const isOpen = open === s.id;
          return (
            <li
              key={s.id}
              className={`card ${styles.item}`}
              style={{ ['--tint' as string]: 'var(--blue)' }}
            >
              <span className="card-tint" aria-hidden="true" />
              <div className={styles.media}>
                {s.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={asset(s.photo)}
                    alt={s.photoAlt ?? s.title}
                    loading="lazy"
                    className={styles.photo}
                  />
                ) : (
                  <span className={styles.glyph} aria-hidden="true">
                    <Icon name="cap" />
                  </span>
                )}
              </div>

              <div className={styles.body}>
                {s.context && <span className="chip chip--quiet">{s.context}</span>}
                <h4 className={styles.storyTitle}>{s.title}</h4>
                <p className={styles.summary}>{s.summary}</p>

                {s.draft && (
                  <span className={`pending ${styles.draft}`}>
                    Story &amp; photo needed
                  </span>
                )}

                <button
                  type="button"
                  className={styles.toggle}
                  aria-expanded={isOpen}
                  aria-controls={`story-${s.id}`}
                  onClick={() => setOpen(isOpen ? null : s.id)}
                >
                  <Icon name={isOpen ? 'minus' : 'plus'} size={16} />
                  {isOpen ? 'Show less' : 'Read the story'}
                </button>

                <div
                  id={`story-${s.id}`}
                  className={styles.story}
                  hidden={!isOpen}
                >
                  {s.story.map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
