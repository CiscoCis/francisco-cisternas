// Types and pure helpers only — safe to import from client components. The
// fs-reading fetcher lives in media.server.ts.

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

/** Same rule as the old nav.ts: an item counts once it has a link, or always in dev. */
export function hasMedia(items: MediaItem[]): boolean {
  const isProd = process.env.NODE_ENV === 'production';
  return items.some((m) => m.url || !isProd);
}
