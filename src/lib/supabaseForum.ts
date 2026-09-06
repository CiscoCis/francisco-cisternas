'use client';

// Thin, dependency-free client for the handful of public Supabase views the
// Forum reads directly from the browser (see scripts/supabase-forum-schema.sql
// for the views themselves and why this is safe: the anon key below is
// designed to be public, and every view it reads exposes only already-public
// columns — no emails, no unpublished rows). No @supabase/supabase-js
// dependency needed for reads this simple; writes never happen from here at
// all — see StayConnectedForm.tsx-style forms posting to scripts/forum-endpoint.gs
// instead, which holds the privileged service-role key server-side.

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

async function restGet<T>(path: string): Promise<T[]> {
  if (!supabaseConfigured) return [];
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
  if (!res.ok) return [];
  return (await res.json()) as T[];
}

export interface PublicComment {
  id: string;
  conversation_slug: string;
  author_name: string;
  body: string;
  created_at: string;
}

export function getPublicComments(slug: string): Promise<PublicComment[]> {
  return restGet<PublicComment>(
    `forum_comments_public?conversation_slug=eq.${encodeURIComponent(slug)}&order=created_at.asc`
  );
}

export interface ReactionCounts {
  conversation_slug: string;
  insightful: number;
  interesting: number;
  agree: number;
  curious: number;
}

export async function getReactionCounts(slug: string): Promise<ReactionCounts | null> {
  const rows = await restGet<ReactionCounts>(
    `forum_reaction_counts?conversation_slug=eq.${encodeURIComponent(slug)}`
  );
  return rows[0] ?? null;
}

export async function getRsvpCount(slug: string): Promise<number> {
  const rows = await restGet<{ event_slug: string; count: number }>(
    `forum_event_rsvp_counts?event_slug=eq.${encodeURIComponent(slug)}`
  );
  return rows[0]?.count ?? 0;
}
