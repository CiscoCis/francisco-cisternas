// Types and pure helpers only — safe to import from client components. The
// fs-reading fetcher lives in blog.server.ts.

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
