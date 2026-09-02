// Types and the default order only — safe to import from client
// components. The fs-reading fetcher lives in siteSettings.server.ts.

export type SectionKey =
  | 'about'
  | 'research'
  | 'teaching'
  | 'service'
  | 'media'
  | 'videos'
  | 'writing'
  | 'beyond'
  | 'recommendations'
  | 'stayConnected'
  | 'contact';

/** Today's order — also what a fresh site starts with before any edit. */
export const DEFAULT_SECTION_ORDER: SectionKey[] = [
  'about',
  'research',
  'teaching',
  'service',
  'media',
  'videos',
  'writing',
  'beyond',
  'recommendations',
  'stayConnected',
  'contact',
];
