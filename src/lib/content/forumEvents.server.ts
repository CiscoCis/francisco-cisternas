// Server-only: reads content/forum-events/*.json off disk. Import this only
// from Server Components — see forumEvents.ts for client-safe types and
// helpers.

import { readCollection } from './_fs';
import type { ForumEvent, ForumEventKind } from './forumEvents';

interface RawForumEvent {
  slug: string;
  title: string;
  kind?: ForumEventKind | null;
  date: string;
  time?: string | null;
  location?: string | null;
  description?: string | null;
  featured?: boolean | null;
  draft?: boolean | null;
}

function toForumEvent(data: RawForumEvent): ForumEvent {
  return {
    slug: data.slug,
    title: data.title,
    kind: data.kind ?? undefined,
    date: data.date,
    time: data.time ?? undefined,
    location: data.location ?? undefined,
    description: data.description ?? undefined,
    featured: data.featured ?? undefined,
    draft: data.draft ?? undefined,
  };
}

const isProd = process.env.NODE_ENV === 'production';

export function getVisibleForumEvents(): ForumEvent[] {
  return readCollection<RawForumEvent>('forum-events')
    .filter(({ data }) => !(isProd && data.draft))
    .map(({ data }) => toForumEvent(data));
}
