// Built from the content rather than hard-coded, so a nav item can never point
// at a section that didn't render (e.g. Media & Stories only appears once
// src/data/media.ts has a publishable item). "Home" isn't listed — the
// wordmark in the header is the home link.

import { mediaItems } from './media';

const isProd = process.env.NODE_ENV === 'production';

export const hasMedia = mediaItems.some((m) => m.url || !isProd);

export type NavItem = { id: string; label: string };

export const NAV: NavItem[] = [
  { id: 'about', label: 'About' },
  { id: 'research', label: 'Research' },
  { id: 'teaching', label: 'Teaching' },
  { id: 'service', label: 'Service' },
  ...(hasMedia ? [{ id: 'media', label: 'Media & Stories' }] : []),
  { id: 'writing', label: 'Blog' },
  { id: 'beyond', label: 'Beyond Work' },
  { id: 'contact', label: 'Contact' },
];
