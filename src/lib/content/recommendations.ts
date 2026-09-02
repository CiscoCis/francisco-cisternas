// Types and pure helpers only — safe to import from client components. The
// fs-reading fetcher lives in recommendations.server.ts.

export type RecommendationCategory =
  | 'Person'
  | 'Website'
  | 'Article'
  | 'Blog post'
  | 'Other resource';

export interface Recommendation {
  id: string;
  title: string;
  category: RecommendationCategory;
  description?: string;
  url: string;
}

/** True once at least one recommendation actually has a link to send visitors to. */
export function hasRecommendations(items: Recommendation[]): boolean {
  return items.some((r) => Boolean(r.url));
}
