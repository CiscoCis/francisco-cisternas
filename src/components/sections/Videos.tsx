'use client';

import { useMemo, useState } from 'react';
import type { Video } from '@/lib/content/videos';
import { parseVideoEmbed, yearFromDate } from '@/lib/content/videos';
import { asset } from '@/lib/asset';
import SectionHeader from '../SectionHeader';
import TriangleField from '../TriangleField';
import Carousel from '../Carousel';
import { Icon } from '../Icons';
import styles from './Videos.module.css';

/*
 * Videos — talks/lectures hosted on YouTube or Vimeo, never as files in
 * this repo (git handles large binaries badly, and GitHub hard-blocks
 * anything over 100MB). Only a link is stored; parseVideoEmbed() turns it
 * into an embeddable player.
 *
 * A horizontally-scrolling carousel (the same hand-rolled one used by
 * Beyond Work and Writing) rather than a grid — this list is meant to stay
 * short and browsable at a glance, not paginated. Search + category live
 * above it because filtering a carousel by scrolling alone doesn't scale
 * once there's more than a handful of talks.
 *
 * Each card shows a thumbnail with a play button rather than an eager
 * <iframe>, so visiting the page never loads a third-party video player
 * that wasn't asked for — the same care already given to self-hosted
 * fonts and lazy-loaded images elsewhere on this site.
 */

type SortOption = 'newest' | 'oldest';

function VideoCard({ video }: { video: Video }) {
  const [playing, setPlaying] = useState(false);
  const embed = parseVideoEmbed(video.url);
  if (!embed) return null;

  const thumbnail = video.thumbnail
    ? asset(video.thumbnail)
    : embed.provider === 'youtube'
      ? embed.thumbnailUrl
      : undefined;

  return (
    <li className={styles.slide}>
      <div className={`card ${styles.card}`} style={{ ['--tint' as string]: 'var(--blue)' }}>
        <span className="card-tint" aria-hidden="true" />
        <div className={styles.frame}>
          {playing ? (
            <iframe
              src={`${embed.embedUrl}?autoplay=1`}
              title={video.title}
              className={styles.iframe}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <button
              type="button"
              className={styles.thumbButton}
              onClick={() => setPlaying(true)}
              aria-label={`Play ${video.title}`}
            >
              {thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={thumbnail} alt="" loading="lazy" className={styles.thumbImage} />
              ) : (
                <span className={styles.thumbFallback} aria-hidden="true" />
              )}
              {video.category && <span className={`chip chip--quiet ${styles.categoryChip}`}>{video.category}</span>}
              <span className={styles.playBtn} aria-hidden="true">
                <Icon name="play" size={24} />
              </span>
            </button>
          )}
        </div>

        <div className={styles.body}>
          <h3 className={styles.title}>{video.title}</h3>
          {video.description && <p className={styles.desc}>{video.description}</p>}
          {video.date && <p className={styles.date}>{video.date}</p>}
        </div>
      </div>
    </li>
  );
}

export default function Videos({ videos }: { videos: Video[] }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState<SortOption>('newest');

  const playable = useMemo(() => videos.filter((v) => parseVideoEmbed(v.url)), [videos]);

  const categories = useMemo(
    () => Array.from(new Set(playable.map((v) => v.category).filter((c): c is string => Boolean(c)))).sort(),
    [playable]
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matched = playable.filter((v) => {
      if (category !== 'all' && v.category !== category) return false;
      if (!q) return true;
      return [v.title, v.description ?? '', v.category ?? ''].join(' ').toLowerCase().includes(q);
    });
    const sorted = [...matched];
    sorted.sort((a, b) => {
      const ya = yearFromDate(a.date);
      const yb = yearFromDate(b.date);
      if (ya === null && yb === null) return 0;
      if (ya === null) return 1;
      if (yb === null) return -1;
      return sort === 'newest' ? yb - ya : ya - yb;
    });
    return sorted;
  }, [playable, query, category, sort]);

  if (!playable.length) return null;

  const showFilters = playable.length > 1;

  return (
    <section id="videos" className="section" aria-labelledby="videos-h">
      <TriangleField variant="quiet" className={`triangles ${styles.tri}`} />

      <div className="container">
        <SectionHeader
          id="videos"
          eyebrow="Videos"
          title="Talks and lectures on video"
          lede="A short set of recorded talks, lectures and interviews."
        />

        {showFilters && (
          <div className={styles.filterBar}>
            <div className={styles.search}>
              <Icon name="search" size={15} aria-hidden="true" />
              <label htmlFor="video-search" className="sr-only">
                Search videos
              </label>
              <input
                id="video-search"
                type="search"
                className={styles.searchInput}
                placeholder="Search videos…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            {categories.length > 0 && (
              <div className={styles.selectWrap}>
                <label htmlFor="video-category" className="sr-only">
                  Filter by category
                </label>
                <select
                  id="video-category"
                  className={styles.select}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="all">All categories</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <Icon name="chevron" size={14} aria-hidden="true" />
              </div>
            )}

            <div className={`${styles.selectWrap} ${styles.sortWrap}`}>
              <Icon name="sort" size={14} aria-hidden="true" />
              <label htmlFor="video-sort" className="sr-only">
                Sort videos
              </label>
              <select
                id="video-sort"
                className={styles.select}
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
              <Icon name="chevron" size={14} aria-hidden="true" />
            </div>
          </div>
        )}

        {results.length ? (
          <Carousel as="ul" className={styles.grid} label="Videos">
            {results.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </Carousel>
        ) : (
          <p className={styles.empty}>
            No videos match these filters.{' '}
            <button
              type="button"
              className={styles.reset}
              onClick={() => {
                setQuery('');
                setCategory('all');
              }}
            >
              Clear filters
            </button>
          </p>
        )}
      </div>
    </section>
  );
}
