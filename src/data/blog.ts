// Adding a post: copy an entry below and change the fields. `slug` becomes
// the URL (/blog/<slug>) — never change it once a post is public, that
// breaks every existing link to it. `draft: true` keeps a post out of the
// production build while still visible in `npm run dev`. No layout, route or
// navigation change is needed: the listing page, archive, category filter,
// year grouping, home-page strip and post pages all read from this array.

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
  /** ISO date, YYYY-MM-DD. */
  date: string;
  category: BlogCategory;
  /** One or two sentences. Used on cards, the archive and link previews. */
  excerpt: string;
  /** Optional lead image, e.g. '/images/blog/first-post.jpg'. */
  image?: string;
  imageAlt?: string;
  body: BlogBlock[];
  /** Hidden from the production build. Visible in `npm run dev`. */
  draft?: boolean;
};

// No real posts yet — the entries below are `draft` templates, one per
// category, and never appear on the deployed site. Delete unused ones.

export const posts: BlogPost[] = [
  {
    slug: 'how-this-blog-works',
    title: 'How this blog works',
    date: '2026-01-01',
    category: 'Reflections',
    excerpt:
      'A template post. It explains how to add writing to this site and disappears the moment you publish something real.',
    draft: true,
    body: [
      {
        type: 'p',
        text: 'This post only appears while the site is running locally. It is here so the blog has something to show before the first real piece is written.',
      },
      { type: 'h', text: 'Adding a post' },
      {
        type: 'p',
        text: 'Open src/data/blog.ts, copy this entry, and change the fields. The listing page, the archive, the category filters and the individual post page all update by themselves.',
      },
      {
        type: 'list',
        items: [
          'slug becomes the web address: /blog/your-slug',
          'date is written as YYYY-MM-DD',
          'category is one of Teaching, Research, Analytics, Technology, Travel or Reflections',
          'remove draft: true when the post is ready to go live',
        ],
      },
      {
        type: 'quote',
        text: 'Adding post 2, 3, 10 or 50 should not require changing the page structure — and it does not.',
      },
      {
        type: 'p',
        text: 'Readers reply through the contact form rather than a public comment thread, so a link to it sits at the end of every post.',
      },
    ],
  },
  {
    slug: 'teaching-notes-template',
    title: '[Draft] A note from the classroom',
    date: '2026-01-01',
    category: 'Teaching',
    excerpt:
      'A ready starting point for a Teaching post — a class, a case discussion, something a student asked that stuck with you.',
    draft: true,
    body: [
      {
        type: 'p',
        text: 'Replace this paragraph with the real piece — what happened in class, what a student asked, or what changed how you teach something.',
      },
    ],
  },
  {
    slug: 'research-notes-template',
    title: '[Draft] Behind a paper',
    date: '2026-01-01',
    category: 'Research',
    excerpt:
      'A ready starting point for a Research post — the story behind a paper, a finding that surprised you, or work in progress.',
    draft: true,
    body: [
      {
        type: 'p',
        text: 'Replace this paragraph with the real piece — what the research is about, why it matters, or what did not make it into the paper itself.',
      },
    ],
  },
  {
    slug: 'analytics-notes-template',
    title: '[Draft] A note on analytics',
    date: '2026-01-01',
    category: 'Analytics',
    excerpt:
      'A ready starting point for an Analytics post — a method, a tool, or a way of looking at data worth writing down.',
    draft: true,
    body: [
      {
        type: 'p',
        text: 'Replace this paragraph with the real piece — a technique, a dataset, or a way of thinking about analytics worth sharing.',
      },
    ],
  },
  {
    slug: 'technology-notes-template',
    title: '[Draft] A note on technology',
    date: '2026-01-01',
    category: 'Technology',
    excerpt:
      'A ready starting point for a Technology post — a tool, a platform shift, or something worth flagging for the field.',
    draft: true,
    body: [
      {
        type: 'p',
        text: 'Replace this paragraph with the real piece — the technology, why it is relevant, and what it changes.',
      },
    ],
  },
  {
    slug: 'travel-notes-template',
    title: '[Draft] Notes from a trip',
    date: '2026-01-01',
    category: 'Travel',
    excerpt:
      'A ready starting point for a Travel post — a conference, a field trip, or a place worth writing about.',
    draft: true,
    body: [
      {
        type: 'p',
        text: 'Replace this paragraph with the real piece — where the trip was, what it was for, and what stood out.',
      },
    ],
  },
];

const isProd = process.env.NODE_ENV === 'production';

export const visiblePosts: BlogPost[] = posts
  .filter((p) => !(isProd && p.draft))
  .sort((a, b) => (a.date < b.date ? 1 : -1));

export const postCategories: BlogCategory[] = Array.from(
  new Set(visiblePosts.map((p) => p.category))
).sort();

export function postBySlug(slug: string): BlogPost | undefined {
  return visiblePosts.find((p) => p.slug === slug);
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
