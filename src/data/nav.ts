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

// `href`, when present, marks a real separate route (e.g. the Forum) rather
// than a same-page section anchor — Header.tsx renders these two cases
// differently (a plain navigation link vs. the scroll-and-hash behavior
// every homepage section uses).
export type NavItem = { id: string; label: string; href?: string };

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
  const items: NavItem[] = order
    .filter((key) => {
      if (key === 'media') return hasMedia;
      if (key === 'videos') return hasVideos;
      if (key === 'recommendations') return hasRecommendations;
      return true;
    })
    .map((key) => ({ id: key, label: LABELS[key] }));

  // The Forum is a separate route tree, not a homepage section, so it isn't
  // part of `order`/`SectionKey` — it's spliced in here, right before
  // Contact, rather than appended at the very end.
  const contactIdx = items.findIndex((i) => i.id === 'contact');
  const forumItem: NavItem = { id: 'forum', label: 'Forum', href: '/forum' };
  const insertAt = contactIdx === -1 ? items.length : contactIdx;
  items.splice(insertAt, 0, forumItem);

  return items;
}
