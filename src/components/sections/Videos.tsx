'use client';

import { useState } from 'react';
import type { Video } from '@/lib/content/videos';
import { parseVideoEmbed } from '@/lib/content/videos';
import { asset } from '@/lib/asset';
import SectionHeader from '../SectionHeader';
import TriangleField from '../TriangleField';
import Reveal from '../Reveal';
import { Icon } from '../Icons';
import styles from './Videos.module.css';

/*
 * Videos — talks/lectures hosted on YouTube or Vimeo, never as files in
 * this repo (git handles large binaries badly, and GitHub hard-blocks
 * anything over 100MB). Only a link is stored; parseVideoEmbed() turns it
 * into an embeddable player.
 *
 * Each card shows a thumbnail with a play button rather than an eager
 * <iframe>, so visiting the page never loads a third-party video player
 * that wasn't asked for — the same care already given to self-hosted
 * fonts and lazy-loaded images elsewhere on this site.
 */

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
    <li className={`card ${styles.card}`} style={{ ['--tint' as string]: 'var(--blue)' }}>
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
            <span className={styles.playBtn} aria-hidden="true">
              <Icon name="play" size={26} />
            </span>
          </button>
        )}
      </div>

      <div className={styles.body}>
        <h3 className={styles.title}>{video.title}</h3>
        {video.description && <p className={styles.desc}>{video.description}</p>}
        {video.date && <p className={styles.date}>{video.date}</p>}
      </div>
    </li>
  );
}

export default function Videos({ videos }: { videos: Video[] }) {
  const playable = videos.filter((v) => parseVideoEmbed(v.url));
  if (!playable.length) return null;

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

        <Reveal variant="group" as="ul" className={styles.grid}>
          {playable.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </Reveal>
      </div>
    </section>
  );
}
