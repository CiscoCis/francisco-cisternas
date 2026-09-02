// Server-only: reads content/media/*.json off disk. Import this only from
// Server Components — see media.ts for the client-safe types and hasMedia.

import { readCollection } from './_fs';
import type { MediaCategory, MediaItem } from './media';

interface RawMediaStory {
  title: string;
  category?: string | null;
  source?: string | null;
  date?: string | null;
  description?: string | null;
  url?: string | null;
  language?: string | null;
  draft?: boolean | null;
}

const isProd = process.env.NODE_ENV === 'production';

/** Non-draft (in production) media items. */
export function getMediaItems(): MediaItem[] {
  return readCollection<RawMediaStory>('media')
    .filter(({ data }) => !(isProd && data.draft))
    .map(({ id, data }) => ({
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
