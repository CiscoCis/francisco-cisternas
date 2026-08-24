// Server-only: reads content/awards/*.json off disk. Import this only from
// Server Components — see awards.ts for the client-safe type. Display order
// follows filename order (see _fs.ts) since award recency isn't a clean
// sortable field — name files with a numeric prefix to control it.

import { readCollection } from './_fs';
import type { Award } from './awards';

interface RawAward {
  name: string;
  organisation?: string | null;
  year?: string | null;
  note?: string | null;
}

export function getAwards(): Award[] {
  return readCollection<RawAward>('awards').map(({ id, data }) => ({
    id,
    name: data.name,
    organisation: data.organisation ?? undefined,
    year: data.year ?? undefined,
    note: data.note ?? undefined,
  }));
}
