// Client-safe types and pure helpers — the fs-reading fetcher lives in
// forumEvents.server.ts. Named forumEvents (not events) to avoid any
// confusion with a browser Event.

export type ForumEventKind =
  | 'Professor talk'
  | 'Guest talk'
  | 'Alumni event'
  | 'Networking gathering'
  | 'Virtual community session'
  | 'Research discussion'
  | 'Industry panel'
  | 'Office-hour session';

export interface ForumEvent {
  slug: string;
  title: string;
  kind?: ForumEventKind;
  date: string;
  time?: string;
  location?: string;
  description?: string;
  featured?: boolean;
  draft?: boolean;
}

export function forumEventBySlug(items: ForumEvent[], slug: string): ForumEvent | undefined {
  return items.find((e) => e.slug === slug);
}

const todayIso = () => new Date().toISOString().slice(0, 10);

export function upcomingForumEvents(items: ForumEvent[]): ForumEvent[] {
  const today = todayIso();
  return items.filter((e) => e.date >= today).sort((a, b) => (a.date < b.date ? -1 : 1));
}

export function pastForumEvents(items: ForumEvent[]): ForumEvent[] {
  const today = todayIso();
  return items.filter((e) => e.date < today).sort((a, b) => (a.date < b.date ? 1 : -1));
}
