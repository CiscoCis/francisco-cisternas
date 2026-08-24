// Types and pure helpers only — safe to import from client components. The
// fs-reading fetchers live in conferences.server.ts.

import type { IconName } from '@/components/Icons';

export interface Talk {
  id: string;
  year: number;
  event: string;
  kind?: string;
  paper?: string;
  date: string;
  location: string;
}

export interface Keynote {
  id: string;
  title: string;
  context: string;
  date?: string;
  location?: string;
  icon: Extract<IconName, 'podium' | 'globe' | 'leaf' | 'quote'>;
}

/** Distinct years present in a list of talks, newest first. */
export function talkYears(talks: Talk[]): number[] {
  return [...new Set(talks.map((t) => t.year))].sort((a, b) => b - a);
}
