// Mirrors src/data/teachingStories.ts, sourced from
// content/teachingStories/*.json. The Tina field is a single textarea
// ("leave a blank line between paragraphs") where the app type wants an
// array of paragraphs, so `story` is split on blank lines here.

import { readCollection } from './_fs';

export type TeachingStory = {
  id: string;
  title: string;
  context?: string;
  summary: string;
  story: string[];
  photo?: string;
  photoAlt?: string;
  draft?: boolean;
};

interface RawTeachingStory {
  title: string;
  context?: string | null;
  summary?: string | null;
  story?: string | null;
  photo?: string | null;
  photoAlt?: string | null;
  draft?: boolean | null;
}

function splitParagraphs(story?: string | null): string[] {
  if (!story) return [];
  return story
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

const isProd = process.env.NODE_ENV === 'production';

/** All teaching stories not hidden by the production draft filter. */
export function getVisibleTeachingStories(): TeachingStory[] {
  return readCollection<RawTeachingStory>('teachingStories')
    .filter(({ data }) => !(isProd && data.draft))
    .map(({ id, data }) => ({
      id,
      title: data.title,
      context: data.context ?? undefined,
      summary: data.summary ?? '',
      story: splitParagraphs(data.story),
      photo: data.photo ?? undefined,
      photoAlt: data.photoAlt ?? undefined,
      draft: data.draft ?? undefined,
    }));
}
