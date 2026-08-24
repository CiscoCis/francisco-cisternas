// Mirrors src/data/blog.ts, sourced from content/blog/*.json. Tina stores
// each block-field entry as { _template: 'p' | 'h' | 'quote' | 'list' |
// 'image', ...fields }; blockFromRaw below converts that into the app's
// existing `{ type, ... }` discriminated union so BlogPost consumers don't
// need to know Tina exists.

import { readCollection } from './_fs';

export type BlogBlock =
  | { type: 'p'; text: string }
  | { type: 'h'; text: string }
  | { type: 'quote'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'image'; src: string; alt: string; caption?: string };

export type BlogCategory =
  | 'Teaching'
  | 'Research'
  | 'Analytics'
  | 'Technology'
  | 'Travel'
  | 'Reflections';

export type BlogPost = {
  slug: string;
  title: string;
  date: string;
  category: BlogCategory;
  excerpt: string;
  image?: string;
  imageAlt?: string;
  body: BlogBlock[];
  draft?: boolean;
};

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

export function postCategories(posts: BlogPost[]): BlogCategory[] {
  return Array.from(new Set(posts.map((p) => p.category))).sort();
}

export function postBySlug(posts: BlogPost[], slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}

export function formatPostDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return `${d} ${months[m - 1]} ${y}`;
}
