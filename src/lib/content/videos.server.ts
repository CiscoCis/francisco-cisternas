// Server-only: reads content/videos/*.json off disk. Import this only from
// Server Components — see videos.ts for the client-safe types and helpers.

import { readCollection } from './_fs';
import type { Video } from './videos';

interface RawVideo {
  title: string;
  description?: string | null;
  url: string;
  thumbnail?: string | null;
  category?: string | null;
  date?: string | null;
  draft?: boolean | null;
}

const isProd = process.env.NODE_ENV === 'production';

/** Non-draft (in production) videos. */
export function getVisibleVideos(): Video[] {
  return readCollection<RawVideo>('videos')
    .filter(({ data }) => !(isProd && data.draft))
    .map(({ id, data }) => ({
      id,
      title: data.title,
      description: data.description ?? undefined,
      url: data.url,
      thumbnail: data.thumbnail ?? undefined,
      category: data.category ?? undefined,
      date: data.date ?? undefined,
    }));
}
