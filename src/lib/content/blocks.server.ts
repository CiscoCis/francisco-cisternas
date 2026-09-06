// Server-only: converts Tina's raw block-field shape ({ _template, ...fields })
// into the app's `{ type, ... }` discriminated union — shared by every Forum
// content type built on the same block-editor templates (see blockTemplates
// in tina/config.ts). Mirrors blog.server.ts's blockFromRaw exactly.

import type { Block } from './blocks';

export interface RawBlock {
  _template: 'p' | 'h' | 'quote' | 'list' | 'image';
  text?: string | null;
  items?: (string | null)[] | null;
  src?: string | null;
  alt?: string | null;
  caption?: string | null;
}

function blockFromRaw(b: RawBlock): Block | null {
  switch (b._template) {
    case 'p':
      return { type: 'p', text: b.text ?? '' };
    case 'h':
      return { type: 'h', text: b.text ?? '' };
    case 'quote':
      return { type: 'quote', text: b.text ?? '' };
    case 'list':
      return { type: 'list', items: (b.items ?? []).filter((i): i is string => !!i) };
    case 'image':
      return b.src
        ? { type: 'image', src: b.src, alt: b.alt ?? '', caption: b.caption ?? undefined }
        : null;
    default:
      return null;
  }
}

export function blocksFromRaw(raw: (RawBlock | null)[] | null | undefined): Block[] {
  return (raw ?? [])
    .filter((b): b is RawBlock => !!b)
    .map(blockFromRaw)
    .filter((b): b is Block => !!b);
}
