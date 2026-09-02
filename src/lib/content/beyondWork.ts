// Types and pure helpers only — safe to import from client components. The
// fs-reading fetcher lives in beyondWork.server.ts.

import type { IconName } from '@/components/Icons';

export interface BeyondWorkItem {
  id: string;
  label: string;
  icon: IconName;
  photo?: string;
  photoAlt?: string;
  note?: string;
}

export const beyondWorkLede =
  'Away from teaching and research — happiest on the court, by the water, or out on the trails, enjoying the outdoors, good company, and the easygoing moments in between.';
