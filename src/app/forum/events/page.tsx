import type { Metadata } from 'next';
import { getVisibleForumEvents } from '@/lib/content/forumEvents.server';
import EventArchive from '@/components/forum/EventArchive';

export const metadata: Metadata = {
  title: 'Events',
  description: 'Talks, alumni gatherings and networking sessions from the Forum.',
};

export default function EventsPage() {
  return <EventArchive items={getVisibleForumEvents()} />;
}
