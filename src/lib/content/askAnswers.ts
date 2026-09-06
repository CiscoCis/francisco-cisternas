// Client-safe types and pure helpers — the fs-reading fetcher lives in
// askAnswers.server.ts.

import type { Block } from './blocks';

export interface AskAnswer {
  id: string;
  question: string;
  answerBody: Block[];
  date: string;
  featured?: boolean;
  draft?: boolean;
}
