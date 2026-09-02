// Server-only: reads content/guestbook/*.json off disk. Import this only
// from Server Components — see guestbook.ts for the client-safe types.

import { readCollection } from './_fs';
import type { GuestbookMessage } from './guestbook';

interface RawGuestbookMessage {
  displayName?: string | null;
  programme?: string | null;
  graduationYear?: string | null;
  message: string;
  submittedAt?: string | null;
  draft?: boolean | null;
}

const isProd = process.env.NODE_ENV === 'production';

/** Published (non-draft, in production) Stay Connected messages, newest file first. */
export function getGuestbookMessages(): GuestbookMessage[] {
  return readCollection<RawGuestbookMessage>('guestbook')
    .filter(({ data }) => !(isProd && data.draft))
    .map(({ id, data }) => ({
      id,
      displayName: data.displayName?.trim() || 'Anonymous',
      programme: data.programme ?? undefined,
      graduationYear: data.graduationYear ?? undefined,
      message: data.message,
      submittedAt: data.submittedAt ?? undefined,
    }))
    .reverse();
}
