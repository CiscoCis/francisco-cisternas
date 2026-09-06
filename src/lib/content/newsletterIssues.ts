// Client-safe type — the fs-reading fetcher lives in newsletterIssues.server.ts.

import type { Block } from './blocks';

export interface NewsletterIssue {
  slug: string;
  title: string;
  date: string;
  body: Block[];
  draft?: boolean;
}

export function issueBySlug(items: NewsletterIssue[], slug: string): NewsletterIssue | undefined {
  return items.find((i) => i.slug === slug);
}
