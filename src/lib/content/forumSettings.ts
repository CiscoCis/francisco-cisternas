// Client-safe type and defaults — the fs-reading fetcher lives in
// forumSettings.server.ts.

export interface ForumSettings {
  introTitle: string;
  introLede: string;
  guidelinesBody: string;
}

export const DEFAULT_FORUM_SETTINGS: ForumSettings = {
  introTitle: 'The Forum',
  introLede:
    'A place for students, alumni and collaborators to talk, share opportunities, and stay in touch — no account needed.',
  guidelinesBody:
    'Be thoughtful and constructive. This is a professional, academic space — keep discussion on-topic and respectful, and treat every contributor the way you would a colleague.',
};
