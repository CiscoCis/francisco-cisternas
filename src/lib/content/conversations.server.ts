// Server-only: reads content/forum-conversations/*.json off disk. Import
// this only from Server Components — see conversations.ts for client-safe
// types and helpers.

import { readCollection } from './_fs';
import { blocksFromRaw, type RawBlock } from './blocks.server';
import type { Conversation, ConversationCategory, ConversationKind } from './conversations';

interface RawConversation {
  slug: string;
  title: string;
  kind: ConversationKind;
  category?: ConversationCategory | null;
  date: string;
  excerpt?: string | null;
  body?: (RawBlock | null)[] | null;
  guestAuthorName?: string | null;
  guestAuthorUrl?: string | null;
  pinned?: boolean | null;
  featured?: boolean | null;
  locked?: boolean | null;
  draft?: boolean | null;
}

function toConversation(data: RawConversation): Conversation {
  return {
    slug: data.slug,
    title: data.title,
    kind: data.kind,
    category: data.category ?? undefined,
    date: data.date,
    excerpt: data.excerpt ?? '',
    body: blocksFromRaw(data.body),
    guestAuthorName: data.guestAuthorName ?? undefined,
    guestAuthorUrl: data.guestAuthorUrl ?? undefined,
    pinned: data.pinned ?? undefined,
    featured: data.featured ?? undefined,
    locked: data.locked ?? undefined,
    draft: data.draft ?? undefined,
  };
}

const isProd = process.env.NODE_ENV === 'production';

export function getVisibleConversations(): Conversation[] {
  return readCollection<RawConversation>('forum-conversations')
    .filter(({ data }) => !(isProd && data.draft))
    .map(({ data }) => toConversation(data))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}
