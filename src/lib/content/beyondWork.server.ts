// Server-only: reads content/beyond/*.json off disk. Import this only from
// Server Components — see beyondWork.ts for the client-safe types.

import { readCollection } from './_fs';
import type { BeyondWorkItem } from './beyondWork';
import type { IconName } from '@/components/Icons';

interface RawInterest {
  label: string;
  icon?: IconName | null;
  photo?: string | null;
  photoAlt?: string | null;
  note?: string | null;
  draft?: boolean | null;
}

const isProd = process.env.NODE_ENV === 'production';

/** Non-draft (in production) Beyond Work items, in file order. */
export function getVisibleBeyondWork(): BeyondWorkItem[] {
  return readCollection<RawInterest>('beyond')
    .filter(({ data }) => !(isProd && data.draft))
    .map(({ id, data }) => ({
      id,
      label: data.label,
      icon: data.icon ?? 'tennis',
      photo: data.photo ?? undefined,
      photoAlt: data.photoAlt ?? undefined,
      note: data.note ?? undefined,
    }));
}
