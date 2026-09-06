// Server-only: reads content/forum-people/*.json off disk. Import this only
// from Server Components — see people.ts for client-safe types and helpers.

import { readCollection } from './_fs';
import type { ForumPerson } from './people';

interface RawPerson {
  slug: string;
  name: string;
  photo?: string | null;
  role?: string | null;
  organisation?: string | null;
  location?: string | null;
  programme?: string | null;
  graduationYear?: string | null;
  intro?: string | null;
  expertiseTags?: (string | null)[] | null;
  canHelpWith?: (string | null)[] | null;
  interestedIn?: (string | null)[] | null;
  linkedinUrl?: string | null;
  featured?: boolean | null;
  draft?: boolean | null;
}

function toPerson(data: RawPerson): ForumPerson {
  return {
    slug: data.slug,
    name: data.name,
    photo: data.photo ?? undefined,
    role: data.role ?? undefined,
    organisation: data.organisation ?? undefined,
    location: data.location ?? undefined,
    programme: data.programme ?? undefined,
    graduationYear: data.graduationYear ?? undefined,
    intro: data.intro ?? undefined,
    expertiseTags: (data.expertiseTags ?? []).filter((t): t is string => !!t),
    canHelpWith: (data.canHelpWith ?? []).filter((t): t is string => !!t),
    interestedIn: (data.interestedIn ?? []).filter((t): t is string => !!t),
    linkedinUrl: data.linkedinUrl ?? undefined,
    featured: data.featured ?? undefined,
    draft: data.draft ?? undefined,
  };
}

const isProd = process.env.NODE_ENV === 'production';

export function getVisiblePeople(): ForumPerson[] {
  return readCollection<RawPerson>('forum-people')
    .filter(({ data }) => !(isProd && data.draft))
    .map(({ data }) => toPerson(data))
    .sort((a, b) => a.name.localeCompare(b.name));
}
