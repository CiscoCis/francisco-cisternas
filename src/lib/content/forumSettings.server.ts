// Server-only: reads content/forum-settings/*.json off disk (a singleton,
// same pattern as siteSettings.server.ts). Import this only from Server
// Components — see forumSettings.ts for the client-safe type and defaults.

import { readCollection } from './_fs';
import type { ForumSettings } from './forumSettings';
import { DEFAULT_FORUM_SETTINGS } from './forumSettings';

interface RawForumSettings {
  introTitle?: string | null;
  introLede?: string | null;
  guidelinesBody?: string | null;
}

export function getForumSettings(): ForumSettings {
  const doc = readCollection<RawForumSettings>('forum-settings')[0]?.data;
  return {
    introTitle: doc?.introTitle || DEFAULT_FORUM_SETTINGS.introTitle,
    introLede: doc?.introLede || DEFAULT_FORUM_SETTINGS.introLede,
    guidelinesBody: doc?.guidelinesBody || DEFAULT_FORUM_SETTINGS.guidelinesBody,
  };
}
