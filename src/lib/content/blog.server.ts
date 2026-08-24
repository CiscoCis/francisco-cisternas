// Server-only: reads content/blog/*.json off disk. Import this only from
// Server Components — see blog.ts for the client-safe types and helpers.
// Tina stores each block-field entry as { _template: 'p' | 'h' | 'quote' |
// 'list' | 'image', ...fields }; blockFromRaw converts that into the app's
// existing `{ type, ... }` discriminated union.

import { readCollection } from './_fs';
import type { BlogBlock, BlogCategory, BlogPost } from './blog';

interface RawBlock {
  _template: 'p' | 'h' | 'quote' | 'list' | 'image';
  text?: string | null;
  items?: (string | null)[] | null;
  src?: string | null;
  alt?: string | null;
  caption?: string | null;
}

interface RawPost {
  slug: string;
  title: string;
  date: string;
  category: BlogCategory;
  excerpt?: string | null;
  image?: string | null;
  imageAlt?: string | null;
  draft?: boolean | null;
  body?: (RawBlock | null)[] | null;
}

function blockFromRaw(b: RawBlock): BlogBlock | null {
  switch (b._template) {
    case 'p':
      return { type: 'p', text: b.text ?? '' };
    case 'h':
      return { type: 'h', text: b.text ?? '' };
    case 'quote':
      return { type: 'quote', text: b.text ?? '' };
    case 'list':
      return { type: 'list', items: (b.items ?? []).filter((i): i is string => !!i) };
    case 'image':
      return b.src
        ? { type: 'image', src: b.src, alt: b.alt ?? '', caption: b.caption ?? undefined }
        : null;
    default:
      return null;
  }
}

function toPost(data: RawPost): BlogPost {
  return {
    slug: data.slug,
    title: data.title,
    date: data.date,
    category: data.category,
    excerpt: data.excerpt ?? '',
    image: data.image ?? undefined,
    imageAlt: data.imageAlt ?? undefined,
    draft: data.draft ?? undefined,
    body: (data.body ?? [])
      .filter((b): b is RawBlock => !!b)
      .map(blockFromRaw)
      .filter((b): b is BlogBlock => !!b),
  };
}

const isProd = process.env.NODE_ENV === 'production';

/** Non-draft (in production) posts, newest first — same as the old `visiblePosts`. */
export function getVisiblePosts(): BlogPost[] {
  return readCollection<RawPost>('blog')
    .filter(({ data }) => !(isProd && data.draft))
    .map(({ data }) => toPost(data))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}
