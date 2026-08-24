// Nav structure, built server-side (in layout.tsx, where the "does Media
// have anything to show" check can read content off disk) and passed down
// as a prop — Header is a client component, and reading content files isn't
// available in a client bundle. "Home" isn't listed — the wordmark in the
// header is the home link.

export type NavItem = { id: string; label: string };

export function buildNav(hasMedia: boolean): NavItem[] {
  return [
    { id: 'about', label: 'About' },
    { id: 'research', label: 'Research' },
    { id: 'teaching', label: 'Teaching' },
    { id: 'service', label: 'Service' },
    ...(hasMedia ? [{ id: 'media', label: 'Media & Stories' }] : []),
    { id: 'writing', label: 'Blog' },
    { id: 'beyond', label: 'Beyond Work' },
    { id: 'contact', label: 'Contact' },
  ];
}
