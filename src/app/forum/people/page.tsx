import type { Metadata } from 'next';
import { getVisiblePeople } from '@/lib/content/people.server';
import PeopleDirectory from '@/components/forum/PeopleDirectory';

export const metadata: Metadata = {
  title: 'People',
  description: 'Students, alumni and collaborators in the Forum directory.',
};

export default function PeoplePage() {
  return <PeopleDirectory items={getVisiblePeople()} />;
}
