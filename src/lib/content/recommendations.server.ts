// Server-only: reads content/recommendations/*.json off disk. Import this
// only from Server Components — see recommendations.ts for the client-safe
// types and hasRecommendations.

import { readCollection } from './_fs';
import type { Recommendation, RecommendationCategory } from './recommendations';

interface RawRecommendation {
  title: string;
  category?: string | null;
  description?: string | null;
  url?: string | null;
  draft?: boolean | null;
}

const isProd = process.env.NODE_ENV === 'production';

/** Non-draft (in production) recommendations. */
export function getRecommendations(): Recommendation[] {
  return readCollection<RawRecommendation>('recommendations')
    .filter(({ data }) => !(isProd && data.draft))
    .map(({ id, data }) => ({
      id,
      title: data.title,
      category: (data.category ?? 'Other resource') as RecommendationCategory,
      description: data.description ?? undefined,
      url: data.url ?? '',
    }));
}
