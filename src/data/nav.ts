// Nav structure, built server-side (in layout.tsx, where content can be
// read off disk) and passed down as a prop — Header/Footer are client
// components, and reading content files isn't available in a client
// bundle. "Home" isn't listed — the wordmark in the header is the home
// link.
//
// Order follows the same `sectionOrder` the homepage itself renders from
// (src/lib/content/siteSettings.ts) — one source of truth, so the nav can
// never drift out of sync with the order sections actually appear in.

import type { SectionKey } from '@/lib/content/siteSettings';

export type NavItem = { id: string; label: string };

const LABELS: Record<SectionKey, string> = {
  about: 'About',
  research: 'Research',
  teaching: 'Teaching',
  service: 'Service',
  media: 'Media & Stories',
  videos: 'Videos',
  writing: 'Blog',
  beyond: 'Beyond Work',
  recommendations: 'Recommendations',
  contact: 'Contact',
};

export function buildNav(
  order: SectionKey[],
  hasMedia: boolean,
  hasVideos: boolean,
  hasRecommendations: boolean
): NavItem[] {
  return order
    .filter((key) => {
      if (key === 'media') return hasMedia;
      if (key === 'videos') return hasVideos;
      if (key === 'recommendations') return hasRecommendations;
      return true;
    })
    .map((key) => ({ id: key, label: LABELS[key] }));
}
