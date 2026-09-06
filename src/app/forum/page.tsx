import type { Metadata } from 'next';
import { getVisibleConversations } from '@/lib/content/conversations.server';
import { getVisiblePeople } from '@/lib/content/people.server';
import { getVisibleOpportunities } from '@/lib/content/opportunities.server';
import { getVisibleForumEvents } from '@/lib/content/forumEvents.server';
import { getForumSettings } from '@/lib/content/forumSettings.server';
import ForumHome from '@/components/forum/ForumHome';

export const metadata: Metadata = {
  title: 'Forum',
  description: 'Conversations, people, opportunities and events — a place to stay connected.',
};

export default function ForumPage() {
  const settings = getForumSettings();
  return (
    <ForumHome
      introTitle={settings.introTitle}
      introLede={settings.introLede}
      conversations={getVisibleConversations()}
      people={getVisiblePeople()}
      opportunities={getVisibleOpportunities()}
      events={getVisibleForumEvents()}
    />
  );
}
