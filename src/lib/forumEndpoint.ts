'use client';

// Shared submit helper for every Forum write (comment, reaction, RSVP,
// opportunity suggestion, introduction request, ask-a-question, newsletter
// signup) — all seven post to the one Apps Script Web App
// (scripts/forum-endpoint.gs), which holds the Supabase service-role key
// server-side and does the actual insert. Same text/plain-to-dodge-CORS-
// preflight trick already used by ContactForm.tsx and StayConnectedForm.tsx,
// since Apps Script Web Apps don't answer OPTIONS requests.

export const FORUM_ENDPOINT = process.env.NEXT_PUBLIC_FORUM_ENDPOINT ?? '';

export type ForumAction =
  | 'comment'
  | 'reaction'
  | 'rsvp'
  | 'opportunity-submission'
  | 'introduction-request'
  | 'ask-question'
  | 'newsletter-signup';

export async function postToForumEndpoint(
  action: ForumAction,
  payload: Record<string, unknown>
): Promise<boolean> {
  if (!FORUM_ENDPOINT) return false;
  try {
    const res = await fetch(FORUM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, ...payload }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
