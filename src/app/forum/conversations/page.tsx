import type { Metadata } from 'next';
import { getVisibleConversations } from '@/lib/content/conversations.server';
import ConversationArchive from '@/components/forum/ConversationArchive';

export const metadata: Metadata = {
  title: 'Conversations',
  description: 'Discussions, questions of the week, and short business cases from the Forum.',
};

export default function ConversationsPage() {
  return <ConversationArchive items={getVisibleConversations()} />;
}
