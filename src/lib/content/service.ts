// Mirrors src/data/service.ts, sourced from content/service/*.json. Group
// and item order follows filename order (numeric-prefix filenames to
// control it). `servicePullQuote` isn't part of the Tina schema (no content
// exists for it yet) so it stays a plain constant, same as before.

import { readCollection } from './_fs';
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

interface RawServiceItem {
  role: string;
  detail?: string | null;
}

interface RawServiceGroup {
  label: string;
  icon?: string | null;
  items?: (RawServiceItem | null)[] | null;
  subGroups?: ({ label: string; items?: (RawServiceItem | null)[] | null } | null)[] | null;
}

function mapItems(items?: (RawServiceItem | null)[] | null): ServiceItem[] {
  return (items ?? [])
    .filter((i): i is RawServiceItem => !!i)
    .map((i) => ({ role: i.role, detail: i.detail ?? undefined }));
}

export function getServiceGroups(): ServiceGroup[] {
  return readCollection<RawServiceGroup>('service').map(({ id, data }) => ({
    id,
    label: data.label,
    icon: (data.icon ?? 'building') as IconName,
    items: mapItems(data.items),
    subGroups: data.subGroups?.length
      ? data.subGroups
          .filter((s): s is NonNullable<typeof s> => !!s)
          .map((s) => ({ label: s.label, items: mapItems(s.items) }))
      : undefined,
  }));
}

export const servicePullQuote = '';
