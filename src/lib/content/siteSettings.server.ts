// Server-only: reads content/settings/*.json off disk. Import this only
// from Server Components — see siteSettings.ts for the client-safe type
// and default order.

import { readCollection } from './_fs';
import type { SectionKey } from './siteSettings';
import { DEFAULT_SECTION_ORDER } from './siteSettings';

interface RawSiteSettings {
  sectionOrder?: (string | null)[] | null;
}

const KNOWN: readonly string[] = DEFAULT_SECTION_ORDER;

/**
 * Reads the homepage section order, normalized so an editing mistake can
 * never silently remove a section from the page: unrecognized values and
 * duplicates are dropped, and any known section missing from the stored
 * list is appended at the end (its default position) rather than omitted.
 * Reordering is fully flexible; this field can't accidentally delete a
 * section from the page.
 */
export function getSectionOrder(): SectionKey[] {
  const docs = readCollection<RawSiteSettings>('settings');
  const stored = (docs[0]?.data.sectionOrder ?? []).filter((s): s is string => !!s);

  const seen = new Set<string>();
  const cleaned: SectionKey[] = [];
  for (const key of stored) {
    if (KNOWN.includes(key) && !seen.has(key)) {
      seen.add(key);
      cleaned.push(key as SectionKey);
    }
  }
  for (const key of DEFAULT_SECTION_ORDER) {
    if (!seen.has(key)) cleaned.push(key);
  }
  return cleaned;
}
