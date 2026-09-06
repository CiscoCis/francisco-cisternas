// Server-only: reads content/forum-newsletter/*.json off disk. Import this
// only from Server Components — see newsletterIssues.ts for the client-safe
// type.

import { readCollection } from './_fs';
import { blocksFromRaw, type RawBlock } from './blocks.server';
import type { NewsletterIssue } from './newsletterIssues';

interface RawIssue {
  slug: string;
  title: string;
  date: string;
  body?: (RawBlock | null)[] | null;
  draft?: boolean | null;
}

const isProd = process.env.NODE_ENV === 'production';

/** Newest first. */
export function getPublishedIssues(): NewsletterIssue[] {
  return readCollection<RawIssue>('forum-newsletter')
    .filter(({ data }) => !(isProd && data.draft))
    .map(({ data }) => ({
      slug: data.slug,
      title: data.title,
      date: data.date,
      body: blocksFromRaw(data.body),
      draft: data.draft ?? undefined,
    }))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}
