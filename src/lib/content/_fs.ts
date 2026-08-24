// Reads Tina-managed content directly off disk (content/<collection>/*.json)
// instead of going through Tina's GraphQL client. That client only has a
// live endpoint to talk to once either `tinacms dev` is running (local) or
// TinaCloud is connected (production) — neither is guaranteed at static-export
// build time. Reading the same JSON files Tina writes works identically in
// `next dev`, in `next build`, and in CI, with no server dependency, and
// stays correct after TinaCloud is connected too: the professor's edits in
// the hosted admin commit straight back to these files via git, so by the
// time the site rebuilds they're already up to date on disk.
//
// A document's filename (without extension) is used as its `id` — no
// document carries an explicit `id` field, since Tina reserves that name for
// its own generated document identity. For collections where display order
// matters and isn't otherwise derivable from the content (e.g. year), name
// files with a numeric prefix (`01-...json`, `02-...json`) so directory
// order — which is what `readCollection` returns — matches the intended
// order.

import fs from 'node:fs';
import path from 'node:path';

const CONTENT_ROOT = path.join(process.cwd(), 'content');

export interface ContentDoc<T> {
  id: string;
  data: T;
}

export function readCollection<T>(collection: string): ContentDoc<T>[] {
  const dir = path.join(CONTENT_ROOT, collection);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((f) => ({
      id: f.replace(/\.json$/, ''),
      data: JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')) as T,
    }));
}
