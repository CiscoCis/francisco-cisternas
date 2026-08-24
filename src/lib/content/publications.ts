// Types and pure helpers only — safe to import from client components.
// The fs-reading fetcher lives in publications.server.ts, split out because
// bundlers include a module's imports (here, node:fs via _fs.ts) even when
// only its type-safe exports are used, which breaks the client bundle.

export type PublicationCategory = 'published' | 'under-review' | 'books' | 'working';

export interface Publication {
  id: string;
  title: string;
  authors: string;
  venue: string;
  year: number | null;
  status?: string;
  detail?: string;
  doi?: string;
  url?: string;
  pdf?: string;
  abstract?: string;
  keywords?: string[];
  image?: string;
  imageAlt?: string;
  featured?: boolean;
}

export const CATEGORY_LABELS: Record<PublicationCategory, string> = {
  published: 'Published',
  'under-review': 'Under Review',
  books: 'Books & Chapters',
  working: 'Working Papers',
};

/** Years present in a given list, newest first. */
export function yearsFor(list: Publication[]): number[] {
  const set = new Set<number>();
  list.forEach((p) => {
    if (p.year !== null) set.add(p.year);
  });
  return [...set].sort((a, b) => b - a);
}

/** Plain-text citation for the copy control. */
export function citationFor(p: Publication): string {
  const bits: string[] = [];
  if (p.authors) bits.push(p.authors.replace(/\.$/, '') + '.');
  if (p.year) bits.push(`(${p.year}).`);
  bits.push(`“${p.title}”.`);
  if (p.venue) bits.push(`${p.venue}${p.detail ? ', ' + p.detail : ''}.`);
  else if (p.detail) bits.push(`${p.detail}.`);
  if (p.status) bits.push(`${p.status}.`);
  if (p.doi) bits.push(`DOI: ${p.doi}.`);
  return bits.join(' ').replace(/\s+/g, ' ').trim();
}
