// Server-only: reads content/forum-opportunities/*.json off disk. Import
// this only from Server Components — see opportunities.ts for client-safe
// types and helpers.

import { readCollection } from './_fs';
import type { Opportunity, OpportunityType } from './opportunities';

interface RawOpportunity {
  slug: string;
  title: string;
  organisation?: string | null;
  type?: OpportunityType | null;
  location?: string | null;
  description?: string | null;
  deadline?: string | null;
  relevantFor?: string | null;
  applyUrl: string;
  featured?: boolean | null;
  draft?: boolean | null;
}

function toOpportunity(data: RawOpportunity): Opportunity {
  return {
    slug: data.slug,
    title: data.title,
    organisation: data.organisation ?? undefined,
    type: data.type ?? undefined,
    location: data.location ?? undefined,
    description: data.description ?? undefined,
    deadline: data.deadline ?? undefined,
    relevantFor: data.relevantFor ?? undefined,
    applyUrl: data.applyUrl,
    featured: data.featured ?? undefined,
    draft: data.draft ?? undefined,
  };
}

const isProd = process.env.NODE_ENV === 'production';

/** Featured first, then by deadline (soonest first) when both have one. */
export function getVisibleOpportunities(): Opportunity[] {
  return readCollection<RawOpportunity>('forum-opportunities')
    .filter(({ data }) => !(isProd && data.draft))
    .map(({ data }) => toOpportunity(data))
    .sort((a, b) => {
      if (!!a.featured !== !!b.featured) return a.featured ? -1 : 1;
      if (a.deadline && b.deadline) return a.deadline < b.deadline ? -1 : 1;
      return 0;
    });
}
