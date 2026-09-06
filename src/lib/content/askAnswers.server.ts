// Server-only: reads content/forum-answers/*.json off disk. Import this
// only from Server Components — see askAnswers.ts for the client-safe type.

import { readCollection } from './_fs';
import { blocksFromRaw, type RawBlock } from './blocks.server';
import type { AskAnswer } from './askAnswers';

interface RawAskAnswer {
  question: string;
  answerBody?: (RawBlock | null)[] | null;
  date: string;
  featured?: boolean | null;
  draft?: boolean | null;
}

const isProd = process.env.NODE_ENV === 'production';

/** Newest first. */
export function getPublishedAnswers(): AskAnswer[] {
  return readCollection<RawAskAnswer>('forum-answers')
    .filter(({ data }) => !(isProd && data.draft))
    .map(({ id, data }) => ({
      id,
      question: data.question,
      answerBody: blocksFromRaw(data.answerBody),
      date: data.date,
      featured: data.featured ?? undefined,
      draft: data.draft ?? undefined,
    }))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}
