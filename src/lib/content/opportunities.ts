// Client-safe types and pure helpers — the fs-reading fetcher lives in
// opportunities.server.ts.

export type OpportunityType =
  | 'Job'
  | 'Internship'
  | 'Research assistantship'
  | 'Research collaboration'
  | 'Conference'
  | 'Competition'
  | 'Entrepreneurial'
  | 'Industry project'
  | 'Community collaboration';

export interface Opportunity {
  slug: string;
  title: string;
  organisation?: string;
  type?: OpportunityType;
  location?: string;
  description?: string;
  deadline?: string;
  relevantFor?: string;
  applyUrl: string;
  featured?: boolean;
  draft?: boolean;
}

export function opportunityBySlug(items: Opportunity[], slug: string): Opportunity | undefined {
  return items.find((o) => o.slug === slug);
}

export function opportunityTypes(items: Opportunity[]): OpportunityType[] {
  return Array.from(new Set(items.map((o) => o.type).filter((t): t is OpportunityType => !!t))).sort();
}
