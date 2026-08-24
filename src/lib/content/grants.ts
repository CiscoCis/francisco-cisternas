// Mirrors src/data/grants.ts, sourced from content/grants/*.json.

import { readCollection } from './_fs';

export interface Grant {
  id: string;
  title: string;
  agency: string;
  reference?: string;
  amount?: string;
  period?: string;
  role?: string;
}

interface RawGrant {
  title: string;
  status: 'awarded' | 'in-preparation';
  agency?: string | null;
  reference?: string | null;
  amount?: string | null;
  period?: string | null;
  role?: string | null;
}

/** Awarded and in-preparation grants, same shape as the old two exports. */
export function getGrants(): { awardedGrants: Grant[]; inPreparationGrants: Grant[] } {
  const awardedGrants: Grant[] = [];
  const inPreparationGrants: Grant[] = [];

  for (const { id, data } of readCollection<RawGrant>('grants')) {
    const grant: Grant = {
      id,
      title: data.title,
      agency: data.agency ?? '',
      reference: data.reference ?? undefined,
      amount: data.amount ?? undefined,
      period: data.period ?? undefined,
      role: data.role ?? undefined,
    };
    (data.status === 'in-preparation' ? inPreparationGrants : awardedGrants).push(grant);
  }

  return { awardedGrants, inPreparationGrants };
}
