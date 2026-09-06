// Client-safe types and pure helpers — the fs-reading fetcher lives in
// conversations.server.ts.

import type { Block } from './blocks';

export type ConversationKind = 'Discussion' | 'Question of the Week' | 'Community Case';

export type ConversationCategory =
  | 'Professor Discussions'
  | 'Marketing'
  | 'Consumer Behaviour'
  | 'AI & Technology'
  | 'Research'
  | 'Careers'
  | 'Entrepreneurship'
  | 'General Ideas';

export interface Conversation {
  slug: string;
  title: string;
  kind: ConversationKind;
  category?: ConversationCategory;
  date: string;
  excerpt: string;
  body: Block[];
  /** Falls back to "Francisco Cisternas" in the UI when both are unset. */
  guestAuthorName?: string;
  guestAuthorUrl?: string;
  pinned?: boolean;
  featured?: boolean;
  locked?: boolean;
  draft?: boolean;
}

export function conversationBySlug(
  items: Conversation[],
  slug: string
): Conversation | undefined {
  return items.find((c) => c.slug === slug);
}

export function conversationCategories(items: Conversation[]): ConversationCategory[] {
  return Array.from(
    new Set(items.map((c) => c.category).filter((c): c is ConversationCategory => !!c))
  ).sort();
}

/** Pinned first, then newest first. */
export function sortConversations(items: Conversation[]): Conversation[] {
  return [...items].sort((a, b) => {
    if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1;
    return a.date < b.date ? 1 : -1;
  });
}
