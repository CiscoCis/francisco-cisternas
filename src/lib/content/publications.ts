// Mirrors src/data/publications.ts field-for-field, sourced from Tina's
// content/publications/*.json instead of a literal array. See _fs.ts for why
// this reads the filesystem directly rather than Tina's GraphQL client.

import { readCollection } from './_fs';

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

interface RawPublication {
  title: string;
  category: PublicationCategory;
  authors?: string | null;
  venue?: string | null;
  year?: number | null;
  status?: string | null;
  detail?: string | null;
  doi?: string | null;
  url?: string | null;
  pdf?: string | null;
  abstract?: string | null;
  keywords?: (string | null)[] | null;
  image?: string | null;
  imageAlt?: string | null;
  featured?: boolean | null;
}

/** All publications, grouped by category — same shape as the old `publications` export. */
export function getPublications(): Record<PublicationCategory, Publication[]> {
  const result: Record<PublicationCategory, Publication[]> = {
    published: [],
    'under-review': [],
    books: [],
    working: [],
  };

  for (const { id, data } of readCollection<RawPublication>('publications')) {
    if (!(data.category in result)) continue;
    result[data.category].push({
      id,
      title: data.title,
      authors: data.authors ?? '',
      venue: data.venue ?? '',
      year: data.year ?? null,
      status: data.status ?? undefined,
      detail: data.detail ?? undefined,
      doi: data.doi ?? undefined,
      url: data.url ?? undefined,
      pdf: data.pdf ?? undefined,
      abstract: data.abstract ?? undefined,
      keywords: data.keywords?.filter((k): k is string => !!k) ?? undefined,
      image: data.image ?? undefined,
      imageAlt: data.imageAlt ?? undefined,
      featured: data.featured ?? undefined,
    });
  }

  return result;
}

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
