// Types and the pull-quote constant — safe to import from client
// components. The fs-reading fetcher lives in service.server.ts.

import type { IconName } from '@/components/Icons';

export interface ServiceItem {
  role: string;
  detail?: string;
}

export interface ServiceGroup {
  id: string;
  label: string;
  icon: IconName;
  items: ServiceItem[];
  subGroups?: { label: string; items: ServiceItem[] }[];
}

// Not part of the Tina schema (no content exists for it yet), so it stays a
// plain constant, same as before.
export const servicePullQuote = '';
