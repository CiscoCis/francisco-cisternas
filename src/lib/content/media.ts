// Mirrors src/data/media.ts, sourced from content/media/*.json.

import { readCollection } from './_fs';

export type MediaCategory =
  | 'Profile'
  | 'Career story'
  | 'Research feature'
  | 'Interview'
  | 'Alumni profile';

export type MediaItem = {
  id: string;
  title: string;
  source: string;
  date: string;
  category: MediaCategory;
  description: string;
  url: string;
  language?: string;
};

interface RawMediaStory {
  title: string;
  category?: string | null;
  source?: string | null;
  date?: string | null;
  description?: string | null;
  url?: string | null;
  language?: string | null;
}

export function getMediaItems(): MediaItem[] {
  return readCollection<RawMediaStory>('media').map(({ id, data }) => ({
    id,
    title: data.title,
    source: data.source ?? '',
    date: data.date ?? '',
    category: (data.category ?? 'Profile') as MediaCategory,
    description: data.description ?? '',
    url: data.url ?? '',
    language: data.language ?? undefined,
  }));
}

/** Same rule as the old nav.ts: an item counts once it has a link, or always in dev. */
export function hasMedia(items: MediaItem[]): boolean {
  const isProd = process.env.NODE_ENV === 'production';
  return items.some((m) => m.url || !isProd);
}
