'use client';

import { useMemo, useState } from 'react';
import type { Video, VideoEmbed } from '@/lib/content/videos';
import { parseVideoEmbed, yearFromDate } from '@/lib/content/videos';
import { asset } from '@/lib/asset';
import SectionHeader from '../SectionHeader';
import TriangleField from '../TriangleField';
import Carousel from '../Carousel';
import Modal from '../Modal';
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
 * short and browsable at a glance, not paginated. Search, category and
 * sort live above it because filtering a carousel by scrolling alone
 * doesn't scale once there's more than a handful of talks.
 *
 * Playback opens in the site's shared Modal rather than swapping the
 * thumbnail in place. Some uploaders (TEDx talks in particular) disable
 * third-party embedding entirely — a raw <iframe src="…/embed/ID"> still
 * "loads" in that case, it just renders YouTube's own "Video unavailable"
 * page inside itself. That page is YouTube's own client-side UI, not a
 * network failure or a catchable error — it was confirmed, including
 * against the real YouTube IFrame Player API's onError event, that
 * nothing fires for this specific failure, so it can't be reliably
 * detected from outside. Rather than pretend otherwise, the "Watch on
 * YouTube/Vimeo" link sits directly under the player itself (not just in
 * the modal's footer), so there's always an immediately visible way to
 * actually watch a talk that won't embed, whether or not that shows up.
 */

type SortOption = 'newest' | 'oldest';

const READ_MORE_THRESHOLD = 140;

function VideoCard({ video, onOpen }: { video: Video; onOpen: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const embed = parseVideoEmbed(video.url);
  if (!embed) return null;

  const thumbnail = video.thumbnail
    ? asset(video.thumbnail)
    : embed.provider === 'youtube'
      ? embed.thumbnailUrl
      : undefined;

  const isLong = (video.description?.length ?? 0) > READ_MORE_THRESHOLD;

  return (
    <li className={styles.slide}>
      <div className={`card ${styles.card}`} style={{ ['--tint' as string]: 'var(--blue)' }}>
        <span className="card-tint" aria-hidden="true" />
        <div className={styles.frame}>
          <button
            type="button"
            className={styles.thumbButton}
            onClick={onOpen}
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
        </div>

        <div className={styles.body}>
          <h3 className={styles.title}>{video.title}</h3>
          {video.description && (
            <div className={styles.descWrap}>
              <p className={`${styles.desc} ${expanded ? '' : styles.descClamped}`}>{video.description}</p>
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
          )}
          {video.date && <p className={styles.date}>{video.date}</p>}
        </div>
      </div>
    </li>
  );
}

function VideoModal({ video, embed, onClose }: { video: Video | null; embed: VideoEmbed | null; onClose: () => void }) {
  return (
    <Modal
      open={Boolean(video && embed)}
      onClose={onClose}
      title={video?.title ?? ''}
      eyebrow={
        video && (video.category || video.date) ? (
          <>
            {video.category && <span>{video.category}</span>}
            {video.date && <em>{video.date}</em>}
          </>
        ) : undefined
      }
      footer={
        video && (
          <a className="btn" href={video.url} target="_blank" rel="noopener noreferrer">
            Watch on {embed?.provider === 'vimeo' ? 'Vimeo' : 'YouTube'}
            <Icon name="external" size={16} />
          </a>
        )
      }
    >
      {embed && (
        <>
          <div className={styles.modalFrame}>
            <iframe
              key={embed.embedUrl}
              src={`${embed.embedUrl}?autoplay=1`}
              title={video?.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <p className={styles.modalHint}>
            Video not playing?{' '}
            <a href={video?.url} target="_blank" rel="noopener noreferrer">
              Watch on {embed.provider === 'vimeo' ? 'Vimeo' : 'YouTube'} instead
              <Icon name="external" size={13} />
            </a>
          </p>
        </>
      )}
      {video?.description && <p className={styles.modalDesc}>{video.description}</p>}
    </Modal>
  );
}

export default function Videos({ videos }: { videos: Video[] }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState<SortOption>('newest');
  const [openVideo, setOpenVideo] = useState<Video | null>(null);

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

  const openEmbed = openVideo ? parseVideoEmbed(openVideo.url) : null;

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

        {results.length ? (
          <Carousel as="ul" className={styles.grid} label="Videos">
            {results.map((v) => (
              <VideoCard key={v.id} video={v} onOpen={() => setOpenVideo(v)} />
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

      <VideoModal video={openVideo} embed={openEmbed} onClose={() => setOpenVideo(null)} />
    </section>
  );
}
