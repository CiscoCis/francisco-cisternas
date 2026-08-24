// Mirrors src/data/conferences.ts, sourced from content/talks/*.json and
// content/keynotes/*.json. Talks.tsx already groups and sorts talks by year
// itself, so this doesn't impose an extra sort — within-year order follows
// filename order (numeric-prefix filenames to control it).

import { readCollection } from './_fs';
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

/** Distinct years present in a list of talks, newest first. */
export function talkYears(talks: Talk[]): number[] {
  return [...new Set(talks.map((t) => t.year))].sort((a, b) => b - a);
}
