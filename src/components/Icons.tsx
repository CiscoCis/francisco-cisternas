import { SVGProps } from 'react';

/* =========================================================================
   Icon set — thin 24×24 stroke icons, drawn to sit calmly beside serif type.
   Two exports:
     • NetworkIcon — bare paths, used inside the SVG network illustration
     • Icon        — a standalone <svg> for UI use
   ========================================================================= */

export type NetworkIconName =
  | 'mobile'
  | 'cart'
  | 'database'
  | 'bank'
  | 'chart'
  | 'users'
  | 'globe'
  | 'book'
  | 'podium'
  | 'at'
  | 'pin'
  | 'phone'
  | 'envelope';

export type IconName =
  | NetworkIconName
  | 'clock'
  | 'building'
  | 'briefcase'
  | 'cap'
  | 'trophy'
  | 'star'
  | 'search'
  | 'chevron'
  | 'arrow'
  | 'quote'
  | 'bulb'
  | 'handshake'
  | 'doc'
  | 'folder'
  | 'clipboard'
  | 'download'
  | 'send'
  | 'external'
  | 'orcid'
  | 'scholar'
  | 'leaf'
  | 'heart'
  | 'menu'
  | 'close'
  | 'mouse'
  | 'copy'
  | 'check'
  | 'calendar'
  | 'thesis'
  | 'user'
  | 'analytics'
  | 'structural'
  | 'ml'
  | 'distribution'
  | 'bayes'
  | 'optimize'
  /* Beyond Work */
  | 'tennis'
  | 'tableTennis'
  | 'hiking'
  | 'sailing'
  | 'windsurf'
  | 'diving'
  | 'football'
  | 'badminton'
  | 'dragonBoat'
  /* Writing, media, journey */
  | 'pen'
  | 'newspaper'
  | 'compass'
  | 'tag'
  | 'plus'
  | 'minus'
  | 'play';

/** Bare geometry (no <svg> wrapper) so it can be embedded in another SVG. */
export function NetworkIcon({ name }: { name: NetworkIconName }) {
  return <>{PATHS[name]}</>;
}

const PATHS: Record<IconName, React.ReactNode> = {
  /* Mobile marketing — a handset broadcasting, not a blank slab. */
  mobile: (
    <>
      <rect x="4" y="2.6" width="11" height="18.8" rx="2.2" />
      <path d="M7.6 18.6h3.8" />
      <path d="M7.6 6.4h3.8M7.6 9.4h2.2" />
      <path d="M17.4 8.2a4.6 4.6 0 0 1 0 7.6" />
      <path d="M19.9 5.4a8 8 0 0 1 0 13.2" />
    </>
  ),
  /* Retail / e-commerce. */
  cart: (
    <>
      <path d="M2.2 3.4h2.5l2.4 11.2h10" />
      <path d="M6 7.2h14.2l-1.8 6.4H7.3" />
      <path d="M12 8.6v3.6M10.2 10.4h3.6" />
      <circle cx="9.4" cy="19.2" r="1.5" />
      <circle cx="17.2" cy="19.2" r="1.5" />
    </>
  ),
  /* Channels / data — stacked stores with a live indicator. */
  database: (
    <>
      <ellipse cx="12" cy="5.4" rx="7.4" ry="3" />
      <path d="M4.6 5.4v6.1c0 1.7 3.3 3 7.4 3s7.4-1.3 7.4-3V5.4" />
      <path d="M4.6 11.5v6.1c0 1.7 3.3 3 7.4 3s7.4-1.3 7.4-3v-6.1" />
      <path d="M7.4 8.4h.01M7.4 14.6h.01" />
    </>
  ),
  /* Financial channels. */
  bank: (
    <>
      <path d="M2.8 9.6 12 3.8l9.2 5.8" />
      <path d="M5.4 10v8.2M9.8 10v8.2M14.2 10v8.2M18.6 10v8.2" />
      <path d="M2.8 20.6h18.4M4.2 18.2h15.6" />
    </>
  ),
  /* Demand optimisation — bars with a rising trend line through them. */
  chart: (
    <>
      <path d="M3.5 20.5h17" />
      <path d="M3.5 20.5V4" />
      <path d="M7.4 20.5v-4.6M11.6 20.5v-7.4M15.8 20.5v-3.2M20 20.5v-9.8" />
      <path d="m6.6 13.4 4.4-4.2 3.6 3.2 5.2-6" />
      <path d="M16.4 6.2h3.6v3.5" />
    </>
  ),
  /* Consumers — a small audience, weighted to the front figure. */
  users: (
    <>
      <circle cx="8.6" cy="8.4" r="3.1" />
      <path d="M2.8 19.8c0-3.1 2.6-5.3 5.8-5.3s5.8 2.2 5.8 5.3" />
      <circle cx="16.8" cy="7" r="2.3" />
      <path d="M16.4 12.4c2.6.2 4.8 2.1 4.8 5" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17" />
      <path d="M12 3.5c2.4 2.4 3.6 5.4 3.6 8.5s-1.2 6.1-3.6 8.5c-2.4-2.4-3.6-5.4-3.6-8.5S9.6 5.9 12 3.5Z" />
    </>
  ),
  book: (
    <>
      <path d="M4 4.5h6a3 3 0 0 1 3 3v12a2.4 2.4 0 0 0-2.4-2.4H4Z" />
      <path d="M20 4.5h-6a3 3 0 0 0-3 3v12a2.4 2.4 0 0 1 2.4-2.4H20Z" />
    </>
  ),
  /* Keynote lectern with a microphone. */
  podium: (
    <>
      <path d="M6.2 8.4h11.6l-2 11.2a1.6 1.6 0 0 1-1.6 1.3h-4.4a1.6 1.6 0 0 1-1.6-1.3Z" />
      <path d="M8.4 13.4h7.2" />
      <path d="M12 8.4V5.6" />
      <rect x="10.2" y="2" width="3.6" height="3.6" rx="1.8" />
    </>
  ),
  at: (
    <>
      <circle cx="12" cy="12" r="3.6" />
      <path d="M15.6 12v1.6a2.6 2.6 0 0 0 5.2 0V12a8.8 8.8 0 1 0-3.5 7" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s6.5-6 6.5-10.5a6.5 6.5 0 1 0-13 0C5.5 15 12 21 12 21Z" />
      <circle cx="12" cy="10.4" r="2.5" />
    </>
  ),
  phone: (
    <path d="M6.3 3.5h3l1.6 4-2 1.5a12 12 0 0 0 6.1 6.1l1.5-2 4 1.6v3a1.8 1.8 0 0 1-2 1.8A16.4 16.4 0 0 1 4.5 5.5a1.8 1.8 0 0 1 1.8-2Z" />
  ),
  envelope: (
    <>
      <rect x="2.8" y="5" width="18.4" height="14" rx="2" />
      <path d="m3.4 6.6 8.6 6.2 8.6-6.2" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5.3l3.4 2" />
    </>
  ),
  building: (
    <>
      <rect x="3.5" y="3.5" width="10" height="17" rx="1.4" />
      <path d="M13.5 9.5H20a.5.5 0 0 1 .5.5v10.5" />
      <path d="M6.6 7.5h3.8M6.6 11h3.8M6.6 14.5h3.8M16.4 13h1.6M16.4 16.5h1.6" />
      <path d="M2.5 20.5h19" />
    </>
  ),
  briefcase: (
    <>
      <rect x="2.8" y="7" width="18.4" height="13" rx="2" />
      <path d="M8.6 7V5.4A1.9 1.9 0 0 1 10.5 3.5h3a1.9 1.9 0 0 1 1.9 1.9V7" />
      <path d="M2.8 12.6h18.4" />
    </>
  ),
  cap: (
    <>
      <path d="m12 4 9.5 4.4L12 12.8 2.5 8.4 12 4Z" />
      <path d="M6.6 10.6v4.9c0 1.6 2.4 2.9 5.4 2.9s5.4-1.3 5.4-2.9v-4.9" />
      <path d="M20.4 9v5.4" />
    </>
  ),
  trophy: (
    <>
      <path d="M7.5 4h9v5.2a4.5 4.5 0 0 1-9 0Z" />
      <path d="M7.5 5.6H5a2.3 2.3 0 0 0 2.5 3.6M16.5 5.6H19a2.3 2.3 0 0 1-2.5 3.6" />
      <path d="M12 13.7V17M8.8 20.3h6.4M9.8 20.3c0-1.8 1-3.3 2.2-3.3s2.2 1.5 2.2 3.3" />
    </>
  ),
  star: (
    <path d="m12 3.6 2.5 5.3 5.6.8-4.1 4.1 1 5.7-5-2.8-5 2.8 1-5.7L3.9 9.7l5.6-.8Z" />
  ),
  search: (
    <>
      <circle cx="10.8" cy="10.8" r="6.4" />
      <path d="m15.6 15.6 4.2 4.2" />
    </>
  ),
  chevron: <path d="m6 9.5 6 6 6-6" />,
  arrow: (
    <>
      <path d="M4 12h15.5" />
      <path d="m13.8 6.2 5.8 5.8-5.8 5.8" />
    </>
  ),
  quote: (
    <path d="M9.5 6.5c-3 1-4.5 3.2-4.5 6.6V18h5.5v-5.4H7.6c0-2 .8-3.3 2.6-4Zm9 0c-3 1-4.5 3.2-4.5 6.6V18H19.5v-5.4h-2.9c0-2 .8-3.3 2.6-4Z" />
  ),
  /* Research idea. */
  bulb: (
    <>
      <path d="M9 16.8a6 6 0 1 1 6 0v1.4a1.4 1.4 0 0 1-1.4 1.4h-3.2A1.4 1.4 0 0 1 9 18.2Z" />
      <path d="M10.3 21.6h3.4" />
      <path d="M12 2.2V.9M4.6 6.1 3.5 5.4M19.4 6.1l1.1-.7" />
    </>
  ),
  handshake: (
    <>
      <path d="m3 11 3.6-3.6a2 2 0 0 1 2.8 0L12 10l2.6-2.6a2 2 0 0 1 2.8 0L21 11" />
      <path d="m8 13.5 2.5 2.5 1.5-1.5 2 2 1.5-1.5 2 2" />
      <path d="M3 11v3.5a2 2 0 0 0 2 2h1M21 11v3.5a2 2 0 0 1-2 2h-1" />
    </>
  ),
  doc: (
    <>
      <path d="M13.5 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9Z" />
      <path d="M13.5 3.5V9H19" />
      <path d="M8.5 13h7M8.5 16.5h4.5" />
    </>
  ),
  folder: (
    <path d="M3.5 6.5a2 2 0 0 1 2-2h3.2l2 2.4h7.8a2 2 0 0 1 2 2v9.6a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2Z" />
  ),
  clipboard: (
    <>
      <rect x="5" y="4.5" width="14" height="16" rx="2" />
      <path d="M9 4.5V3.4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1.1Z" />
      <path d="M8.8 11h6.4M8.8 14.6h4.4" />
    </>
  ),
  download: (
    <>
      <path d="M12 3.8v11" />
      <path d="m7.6 10.5 4.4 4.3 4.4-4.3" />
      <path d="M4.5 18.5h15" />
    </>
  ),
  send: <path d="M21 3.5 2.8 11.2l7 2.4 2.4 7L21 3.5Zm0 0-11.2 10.1" />,
  external: (
    <>
      <path d="M14 4.5h5.5V10" />
      <path d="M19.5 4.5 11 13" />
      <path d="M18 14.2v4.3a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6h4.3" />
    </>
  ),
  orcid: (
    <>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M9 8.6v7.4" />
      <path d="M12.4 16V8.6h2a3.7 3.7 0 0 1 0 7.4Z" />
      <circle cx="9" cy="6.3" r=".3" />
    </>
  ),
  scholar: (
    <>
      <path d="m12 3.4 9.3 4.5L12 12.4 2.7 7.9 12 3.4Z" />
      <path d="M6.5 10.2v4.4c0 1.7 2.5 3 5.5 3s5.5-1.3 5.5-3v-4.4" />
    </>
  ),
  /* Sustainability — leaf growing out of a measured base. */
  leaf: (
    <>
      <path d="M20.2 4.2c0 8.1-4.3 12.3-9.9 12.3a5.6 5.6 0 0 1-5.6-5.5c0-4.5 6.1-6.8 15.5-6.8Z" />
      <path d="M4.8 20.4c1.4-4.3 4.3-7.5 8.1-9.5" />
      <path d="M3.2 20.4h17.4" />
    </>
  ),
  /* Health marketing — heart with a pulse trace. */
  heart: (
    <>
      <path d="M12 20.4s-7.9-4.7-7.9-9.9a4.35 4.35 0 0 1 7.9-2.5 4.35 4.35 0 0 1 7.9 2.5c0 5.2-7.9 9.9-7.9 9.9Z" />
      <path d="M4.6 12.2h3.1l1.5-2.6 1.9 4.7 1.6-3 1 1.9h5.7" />
    </>
  ),
  menu: <path d="M3.5 7h17M3.5 12h17M3.5 17h17" />,
  close: <path d="m5.5 5.5 13 13M18.5 5.5l-13 13" />,
  mouse: (
    <>
      <rect x="8.5" y="2.8" width="7" height="12" rx="3.5" />
      <path d="M12 5.8v2.4" />
    </>
  ),
  copy: (
    <>
      <rect x="8.5" y="8.5" width="12" height="12" rx="2" />
      <path d="M15.5 8.5v-3a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3" />
    </>
  ),
  check: <path d="m4.5 12.5 5 5 10-11" />,
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 10h17M8.5 3v4M15.5 3v4" />
    </>
  ),
  /* A single person — profile pages. */
  user: (
    <>
      <circle cx="12" cy="8" r="3.8" />
      <path d="M4.6 20.4c0-4 3.3-6.6 7.4-6.6s7.4 2.6 7.4 6.6" />
    </>
  ),

  /* ---- methodology marks --------------------------------------------- */

  /* Data Analytics — a segmented ring being read. */
  analytics: (
    <>
      <path d="M12 3.6a8.4 8.4 0 1 0 8.4 8.4" />
      <path d="M12 3.6A8.4 8.4 0 0 1 20.4 12H12Z" />
      <circle cx="12" cy="12" r="2.6" />
    </>
  ),

  /* Structural Models — a specified structure of linked components. */
  structural: (
    <>
      <rect x="9" y="2.6" width="6" height="4.6" rx="1" />
      <rect x="2.6" y="16.8" width="6" height="4.6" rx="1" />
      <rect x="15.4" y="16.8" width="6" height="4.6" rx="1" />
      <path d="M12 7.2v4.4" />
      <path d="M5.6 16.8v-2.6h12.8v2.6" />
      <path d="M3.4 11.6h17.2" />
    </>
  ),

  /* Machine Learning — a small feed-forward network. */
  ml: (
    <>
      <circle cx="4.4" cy="6" r="1.9" />
      <circle cx="4.4" cy="18" r="1.9" />
      <circle cx="12" cy="12" r="1.9" />
      <circle cx="19.6" cy="7.4" r="1.9" />
      <circle cx="19.6" cy="16.6" r="1.9" />
      <path d="m6.1 6.9 4.3 3.9M6.1 17.1l4.3-3.9" />
      <path d="m13.7 11.1 4.2-2.5M13.7 12.9l4.2 2.5" />
    </>
  ),

  /* Statistical Models — observations with a fitted line through them. */
  distribution: (
    <>
      <path d="M3.4 3.4v17.2h17.2" />
      <path d="m6.2 17.4 12.4-9.6" />
      <circle cx="7.6" cy="14.4" r="1.15" />
      <circle cx="11.2" cy="14.9" r="1.15" />
      <circle cx="12.9" cy="10.6" r="1.15" />
      <circle cx="16.6" cy="10.9" r="1.15" />
      <circle cx="17.8" cy="6.9" r="1.15" />
    </>
  ),

  /* Bayesian Statistics — conditional probability as overlapping events. */
  bayes: (
    <>
      <circle cx="9" cy="12" r="6.4" />
      <circle cx="15" cy="12" r="6.4" />
      <path d="M12 6.6a6.4 6.4 0 0 0 0 10.8 6.4 6.4 0 0 0 0-10.8Z" strokeDasharray="2.2 2" />
    </>
  ),

  /* Mixed Integer Programming — a feasible region with its optimal vertex. */
  optimize: (
    <>
      <path d="M3.4 3.4v17.2h17.2" />
      <path d="M6.4 17.6V12l4.4-4.2 5.4 1.2 2.6 4.6-3.4 4H6.4Z" />
      <circle cx="10.8" cy="7.8" r="1.7" />
      <path d="M9.2 14.4h.01M13 15.4h.01M12.6 11.2h.01" />
    </>
  ),

  /* Doctoral research — a bound thesis with a seal. */
  thesis: (
    <>
      <path d="M5 3.4h9.6L19 7.8v9.4a1.8 1.8 0 0 1-1.8 1.8H5a1.8 1.8 0 0 1-1.8-1.8V5.2A1.8 1.8 0 0 1 5 3.4Z" />
      <path d="M14.2 3.4v4.2h4.4" />
      <path d="M6.6 9.6h5M6.6 12.6h3" />
      <circle cx="15.6" cy="16.4" r="3.2" />
      <path d="m14 19.2-.6 3 2.2-1.2 2.2 1.2-.6-3" />
    </>
  ),

  /* ---------- Beyond Work ------------------------------------------------
     Drawn as objects rather than figures: a racket reads instantly at
     22px, a running person does not. */

  /* Tennis — racket and ball. */
  tennis: (
    <>
      <ellipse cx="9.4" cy="8.6" rx="5.2" ry="6" transform="rotate(-32 9.4 8.6)" />
      <path d="M5.6 4.9c2.4 2 4.6 4.6 6.4 7.6M13.6 5.6c-2.6 1.4-5 3.6-6.8 6.2" />
      <path d="m12.6 13.4 3.6 5.2" />
      <circle cx="18.6" cy="20.4" r="2.1" />
    </>
  ),

  /* Table tennis — paddle and ball. */
  tableTennis: (
    <>
      <ellipse cx="10" cy="9" rx="5.6" ry="6.2" transform="rotate(-30 10 9)" />
      <path d="m12.8 13.9 3.4 5.4" />
      <circle cx="18.4" cy="7.4" r="2" />
    </>
  ),

  /* Hiking — a ridgeline with a summit marker. */
  hiking: (
    <>
      <path d="M2.4 19.4h19.2" />
      <path d="m3.6 19.4 5.6-9.2 3.4 5.2 2.4-3.6 5.4 7.6" />
      <path d="M9.2 10.2 7.4 7.4" />
      <circle cx="17" cy="5.4" r="2" />
      <path d="M17 7.4v3.6" />
    </>
  ),

  /* Sailing — a sloop under sail. */
  sailing: (
    <>
      <path d="M12 2.6v13" />
      <path d="M12 4.4c3 2.4 5 5.4 5.8 8.6H12" />
      <path d="M11 6.2c-2.2 2-3.8 4.4-4.6 6.8H11" />
      <path d="M2.6 17.2h18.8l-2.6 3.6a2 2 0 0 1-1.6.8H6.8a2 2 0 0 1-1.6-.8Z" />
    </>
  ),

  /* Windsurfing — board, mast and sail. */
  windsurf: (
    <>
      <path d="M13.4 3.2 6.6 14.2h6.8Z" />
      <path d="M13.4 3.2 13.4 14.2" />
      <path d="M13.4 14.2 17 17.6" />
      <path d="M2.6 19.6c1.8 0 1.8 1.4 3.6 1.4s1.8-1.4 3.6-1.4 1.8 1.4 3.6 1.4 1.8-1.4 3.6-1.4 1.8 1.4 3.6 1.4" />
      <path d="M4.8 17.6h13" />
    </>
  ),

  /* Diving — mask and snorkel. */
  diving: (
    <>
      <path d="M3.6 8.6h11.2v4.2a3 3 0 0 1-3 3h-1.3a1.6 1.6 0 0 1-1.5-1.1l-.6-1.8-.6 1.8a1.6 1.6 0 0 1-1.5 1.1H5a3 3 0 0 1-3-3V8.6h1.6Z" />
      <path d="M14.8 10.4h2.6a2 2 0 0 1 2 2v6.4a2.2 2.2 0 0 1-4.4 0" />
    </>
  ),

  /* Football — the classic panelled ball. */
  football: (
    <>
      <circle cx="12" cy="12" r="9.2" />
      <path d="m12 7.2 4 2.9-1.5 4.7h-5L8 10.1Z" />
      <path d="M12 2.8v4.4M19.6 9.4 16 10.1M17.4 19.3l-2.9-4.5M6.6 19.3l2.9-4.5M4.4 9.4 8 10.1" />
    </>
  ),

  /* Badminton — racket and shuttlecock. */
  badminton: (
    <>
      <ellipse cx="9" cy="7.6" rx="4.6" ry="6" transform="rotate(-25 9 7.6)" />
      <path d="M5.6 3.4c1.8 1.6 3.6 4 5 6.8" />
      <path d="M12.2 4c-1.6 1.4-3 3.4-4 5.6" />
      <path d="m11.6 12.4 3.2 5.4" />
      <path d="M17.2 15.4c1.6-.6 3-.2 3.8 1l-2.2 2.6c-1.4.4-2.8-.4-3-2Z" />
    </>
  ),

  /* Dragon boat — hull, prow post and cross-bench. */
  dragonBoat: (
    <>
      <path d="M2.4 15.6c2.8 2.4 6.2 3.6 9.6 3.6s6.8-1.2 9.6-3.6" />
      <path d="M3.6 15.6 5 10.8c.4-1.4 1.7-2.4 3.2-2.4h7.6c1.5 0 2.8 1 3.2 2.4l1.4 4.8" />
      <path d="M8.6 8.4V5.2c0-1 .8-1.8 1.8-1.8h1.2c1 0 1.8.8 1.8 1.8v3.2" />
      <path d="M6.4 12.2h11.2" />
    </>
  ),

  /* ---------- Writing, media, journey ------------------------------------ */

  /* Blog — a nib. */
  pen: (
    <>
      <path d="M4.4 19.6 3.2 20.8" />
      <path d="M6.4 17.6 16.8 7.2a2.6 2.6 0 0 1 3.7 3.7L10.1 21.3l-4.9 1.1 1.2-4.8Z" />
      <path d="m15.2 8.8 3.7 3.7" />
    </>
  ),

  /* Media & Stories — a folded newspaper. */
  newspaper: (
    <>
      <path d="M3.2 5.4h13.4v13.2a2 2 0 0 1-2 2H5.2a2 2 0 0 1-2-2Z" />
      <path d="M16.6 8.4h2.4a1.8 1.8 0 0 1 1.8 1.8v8.4a2 2 0 0 1-4 0" />
      <path d="M6 8.6h7.8M6 12h7.8M6 15.4h4.8" />
    </>
  ),

  /* Career journey — a compass rose. */
  compass: (
    <>
      <circle cx="12" cy="12" r="9.2" />
      <path d="m15.6 8.4-2 5.6-5.6 2 2-5.6Z" />
    </>
  ),

  /* Category tag. */
  tag: (
    <>
      <path d="M11.2 3.2H20a.8.8 0 0 1 .8.8v8.8a2 2 0 0 1-.6 1.4l-6.6 6.6a2 2 0 0 1-2.8 0l-7-7a2 2 0 0 1 0-2.8l6.6-6.6a2 2 0 0 1 1.4-.6Z" />
      <circle cx="16.6" cy="7.4" r="1.5" />
    </>
  ),

  plus: <path d="M12 5.2v13.6M5.2 12h13.6" />,
  minus: <path d="M5.2 12h13.6" />,

  /* Video play — a filled triangle in a ring, standard "play" shape. */
  play: (
    <>
      <circle cx="12" cy="12" r="9.2" />
      <path d="M10 8.2v7.6l6.2-3.8Z" fill="currentColor" stroke="none" />
    </>
  ),
};

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 20, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}

export default Icon;
