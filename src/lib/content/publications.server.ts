// Server-only: reads content/publications/*.json off disk. Import this only
// from Server Components (page.tsx, layout.tsx) — see publications.ts for
// the client-safe types and pure helpers.

import { readCollection } from './_fs';
import type { Publication, PublicationCategory } from './publications';

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
