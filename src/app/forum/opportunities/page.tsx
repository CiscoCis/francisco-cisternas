import type { Metadata } from 'next';
import { getVisibleOpportunities } from '@/lib/content/opportunities.server';
import OpportunityArchive from '@/components/forum/OpportunityArchive';

export const metadata: Metadata = {
  title: 'Opportunities',
  description: 'Jobs, internships, research collaborations and more from the Forum.',
};

export default function OpportunitiesPage() {
  return <OpportunityArchive items={getVisibleOpportunities()} />;
}
