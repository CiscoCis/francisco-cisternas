// Server-only: reads content/talks/*.json and content/keynotes/*.json off
// disk. Import this only from Server Components — see conferences.ts for
// the client-safe types and talkYears. Talks.tsx already groups and sorts
// talks by year itself, so within-year order here just follows filename
// order (numeric-prefix filenames to control it).

import { readCollection } from './_fs';
import type { Talk, Keynote } from './conferences';

interface RawTalk {
  event: string;
  year: number;
  kind?: string | null;
  paper?: string | null;
  date?: string | null;
  location?: string | null;
}

interface RawKeynote {
  title: string;
  context?: string | null;
  date?: string | null;
  location?: string | null;
  icon?: string | null;
}

export function getTalks(): Talk[] {
  return readCollection<RawTalk>('talks').map(({ id, data }) => ({
    id,
    year: data.year,
    event: data.event,
    kind: data.kind ?? undefined,
    paper: data.paper ?? undefined,
    date: data.date ?? '',
    location: data.location ?? '',
  }));
}

export function getKeynotes(): Keynote[] {
  return readCollection<RawKeynote>('keynotes').map(({ id, data }) => ({
    id,
    title: data.title,
    context: data.context ?? '',
    date: data.date ?? undefined,
    location: data.location ?? undefined,
    icon: (data.icon ?? 'podium') as Keynote['icon'],
  }));
}
