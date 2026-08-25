# From static site to a git-based CMS: full setup log

This document is a complete, step-by-step account of how this project went
from "a Next.js site that only ran on localhost" to "a deployed site on
GitHub Pages, fully editable through TinaCMS by a non-technical user, with
no code involved." It covers every batch of work, every command run, every
error hit, and why each fix was made — written so a developer with no other
context could reproduce the whole thing, or understand why any given piece
exists.

It's organized in the same order the work actually happened. Skip to the
section you need; each one is self-contained enough to follow on its own,
but later sections assume earlier ones are done.

## Table of contents

1. [Starting point and goals](#1-starting-point-and-goals)
2. [Architecture decisions made up front](#2-architecture-decisions-made-up-front)
3. [Batch A — first deployment to GitHub Pages](#3-batch-a--first-deployment-to-github-pages)
4. [Batch B — installing TinaCMS and defining the schema](#4-batch-b--installing-tinacms-and-defining-the-schema)
5. [Batch C — the content mapper layer](#5-batch-c--the-content-mapper-layer)
6. [Batch D — seeding content and wiring components](#6-batch-d--seeding-content-and-wiring-components)
7. [Batch E — connecting TinaCloud](#7-batch-e--connecting-tinacloud)
8. [Post-launch: adding a sort index](#8-post-launch-adding-a-sort-index)
9. [How to add a new content type later](#9-how-to-add-a-new-content-type-later)
10. [Full error log, quick reference](#10-full-error-log-quick-reference)
11. [File inventory](#11-file-inventory)
12. [Verification checklist](#12-verification-checklist)

---

## 1. Starting point and goals

**Starting state:** a Next.js 16 (App Router) site with all content
hardcoded as literal TypeScript arrays in `src/data/*.ts` — publications,
grants, awards, talks, keynotes, service entries, teaching-life stories,
media mentions, and blog posts. The site had never been deployed: no git
repository existed, and `next.config.js` was missing entirely despite the
rest of the project (a deploy workflow, an `asset()` helper) assuming a
static export existed.

**Goal:** let a non-technical site owner (a university professor) edit
every one of those eight content types himself, through a web UI, with
zero code changes and zero involvement from a developer after the initial
setup — while never changing the site's visual design or behavior.

**Why this order:** get a real, deployed baseline working first (Batch A),
*then* layer CMS complexity on top of it. If something breaks later, it's
obvious which layer broke it, instead of debugging a deploy and a CMS
integration simultaneously.

---

## 2. Architecture decisions made up front

A few decisions shaped everything that follows. Understanding *why* these
were made will save you from "fixing" them back to a more conventional
setup that would actually break things here.

### 2.1 Static export (`output: 'export'`), not a Node server

GitHub Pages only serves static files — there's no server to run Next.js
on. So the whole site builds to a flat `out/` directory of HTML/CSS/JS at
build time (`next build`), and that directory is what gets published.

Consequence: **any page that needs data must have that data available at
_build_ time**, not request time. There is no API route, no
`getServerSideProps` equivalent, nothing that runs after the build
finishes. This is the single most important constraint behind decision 2.2.

### 2.2 Content is read directly off disk, not through Tina's GraphQL client

TinaCMS's standard pattern is: content lives in git as Markdown/JSON, and
your app queries it through a generated GraphQL client
(`tina/__generated__/client.ts`) that talks to either a local dev server
(`tinacms dev`) or TinaCloud's hosted content API in production.

That pattern needs a *live GraphQL endpoint reachable at build time*. For
a statically-exported site built in GitHub Actions, that would mean the CI
build depends on TinaCloud being up and reachable — a new, external point
of failure for something as basic as "does the site build."

Since Tina's content is just JSON files sitting in the repo
(`content/<collection>/*.json`), and the build already has full filesystem
access to the repo it's building, **the simpler and more robust choice is
to read those files directly with `fs.readFileSync`**, bypassing Tina's
GraphQL layer for the site's own rendering entirely. Tina's GraphQL API
and the generated client are still used, but only for one thing: building
the `/admin` editor UI (Batch B/E below). The site's pages never call it.

This has a second benefit that mattered later (see [7.7](#77-error-remote-schema-check-failing-in-ci-err_cloud_check_failed)):
since the site doesn't depend on TinaCloud at runtime, TinaCloud being
briefly out of sync (e.g. still re-indexing a just-pushed schema change)
can never break the *site*, only the admin editor build step — and even
that was worked around.

### 2.3 Filenames are document identity; no custom `id` field

Tina auto-generates its own internal document identity from
`_sys.filename` — the JSON file's name without extension. Defining a
custom field literally named `id` in a Tina collection schema conflicts
with this and fails validation (see [4.4](#44-error-field-can-only-be-defined-once-for-id)).

So every collection's JSON files are named after what used to be that
item's `id` in the old `src/data/*.ts` arrays (e.g.
`content/publications/pub-basket-2025.json`), and the content-reading code
derives the app's `id` field from the filename, not from a stored field.
Where the *order* items appear in also matters (see 6.2), filenames carry
a numeric prefix too (`01-`, `02-`, ...) so plain alphabetical directory
listing produces the right order without needing an explicit "sort order"
field the professor would have to maintain.

### 2.4 Client-safe vs. server-only content modules

This one wasn't planned — it was forced by a real build failure (see
[5.3](#53-error-nodefs-leaking-into-the-client-bundle)) — but it's a rule for all
future content-related code: **anything a `'use client'` component
imports must never transitively import `node:fs`**, even if the specific
function used doesn't call it. Every content type therefore has two
files: `src/lib/content/<name>.ts` (types + pure helpers, safe anywhere)
and `src/lib/content/<name>.server.ts` (the actual `fs.readFileSync` call,
Server-Components-only).

---

## 3. Batch A — first deployment to GitHub Pages

### 3.1 Fix the missing static-export config

The project had a GitHub Actions deploy workflow and a `src/lib/asset.ts`
helper that both assumed `output: 'export'` and a configurable base path,
but no `next.config.js` existed at all — so `next build` was producing a
normal server build, not a static `out/` directory.

Created `next.config.js`:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: process.env.BASE_PATH || '',
  assetPrefix: process.env.BASE_PATH || '',
  env: {
    NEXT_PUBLIC_BASE_PATH: process.env.BASE_PATH || '',
  },
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
```

- `output: 'export'` — produces the static `out/` directory `next build`
  needs to emit for GitHub Pages.
- `basePath`/`assetPrefix` read from `BASE_PATH`, an env var the deploy
  workflow computes (see 3.4) — needed because a project site
  (`github.com/<owner>/<repo>`) is served at
  `https://<owner>.github.io/<repo>/`, not the domain root, so every
  internal link/asset needs that `/repo` prefix baked in at build time.
- `env.NEXT_PUBLIC_BASE_PATH` mirrors the same value into a
  `NEXT_PUBLIC_*` var so client-side code (`src/lib/asset.ts`) can read it
  too — `basePath`/`assetPrefix` only affect Next's own routing/asset
  URLs, not arbitrary `<img src>` strings built from data.
- `images: { unoptimized: true }` — Next's image optimization API needs a
  running server; static export has none, so this disables it and serves
  images as-is.

**Verify:** `npm run build` should now produce an `out/` directory. Serve
it directly with any static file server (no `next dev`, no Node) and
confirm the site loads and matches what you'd seen in dev.

### 3.2 Create the GitHub repository

Created empty (no README/`.gitignore`/license at creation, so pushing
existing history doesn't conflict) under the owner's account.

### 3.3 First push

```
git init
git add -A
git commit -m "Initial commit: personal academic website"
git remote add origin https://github.com/<owner>/<repo>.git
git push -u origin main
```

#### Error: `remote: Permission to <owner>/<repo>.git denied to <pusher>` (403)

The account doing the push (via the CLI's stored git credentials) wasn't
the repo owner and had no write access yet.

**Fix:** the repo owner added the pushing account as a collaborator
(GitHub repo → Settings → Collaborators → Add people), then accepted the
invite. Push succeeded afterward with no other changes needed.

### 3.4 Turn on GitHub Pages

Repo → **Settings → Pages → Build and deployment → Source: "GitHub
Actions"**. This is the one step that has to be a manual click — there's
no API-only way to flip a repo's Pages source that doesn't require repo
admin permission through the UI (a REST call could do it too, but the
setting is one-time so the UI is simpler).

The already-present workflow (`.github/workflows/deploy.yml`) computes
`BASE_PATH` automatically based on repo name:

```yaml
- name: Work out the base path and site URL
  id: base
  run: |
    REPO="${GITHUB_REPOSITORY#*/}"
    OWNER="${GITHUB_REPOSITORY%%/*}"
    if [ "$REPO" = "${OWNER,,}.github.io" ]; then
      echo "path=" >> "$GITHUB_OUTPUT"
      echo "url=https://${OWNER,,}.github.io" >> "$GITHUB_OUTPUT"
    else
      echo "path=/$REPO" >> "$GITHUB_OUTPUT"
      echo "url=https://${OWNER,,}.github.io/$REPO" >> "$GITHUB_OUTPUT"
    fi
```

A repo literally named `<owner>.github.io` is a GitHub "user site" and is
served at the domain root with no base path; any other repo name is a
"project site" served under `/repo-name/`.

### 3.5 Verify

Push to `main` → Actions tab shows the workflow running → once green,
visit the computed URL (shown in the workflow's `deploy` job summary, or
`https://<owner>.github.io/<repo>/`) and confirm the live site matches
localhost.

### 3.6 Removing an accidental AI co-author trail

*(Context specific to this project, included because the fix generalizes:
how to scrub commit metadata after the fact.)*

An early commit's message included a `Co-Authored-By:` trailer naming an
AI tool. If you don't want that in your history for any reason:

```
git commit --amend   # edit the message, remove the trailer line
git push --force-with-lease
```

`--force-with-lease` (not plain `--force`) refuses to overwrite if someone
else pushed to the branch since your last fetch — safer on a
single-collaborator repo, still worth using out of habit. This only
works cleanly if it's the *most recent* commit and nobody else has based
work on it yet; rewriting older history requires an interactive rebase
and is riskier on a shared branch.

Note: GitHub's Contributors *sidebar widget* can lag behind a force-pushed
history rewrite for a while (it's a cached graph, not computed live) —
verify the actual state with the API instead of trusting the widget
immediately:

```
curl -H "Authorization: Bearer <token>" \
  https://api.github.com/repos/<owner>/<repo>/commits
```

---

## 4. Batch B — installing TinaCMS and defining the schema

### 4.1 Install

```
npm install tinacms @tinacms/cli
```

At the time of writing: `tinacms@^3.12.1`, `@tinacms/cli@^2.6.1`.

### 4.2 Why TinaCMS

Requirements were: git-backed (content lives as files in the same repo,
no separate database to manage or pay for), works with a static export,
free to start, and gives a real login (not a shared password) once
connected to TinaCloud. Tina's local-filesystem mode also means **you can
build and test the entire schema and editing UI with zero account
sign-up** — TinaCloud (Batch E) is only needed for the final, real,
remote login; everything through Batch D works purely locally.

### 4.3 The schema — `tina/config.ts`

One collection per content type, each with `path: 'content/<type>'`,
`format: 'json'`. All eight:

| Collection name | `path`                   | Maps to (old) |
|---|---|---|
| `publication`   | `content/publications`   | `src/data/publications.ts` |
| `grant`         | `content/grants`         | `src/data/grants.ts` |
| `award`         | `content/awards`         | `src/data/awards.ts` |
| `talk`          | `content/talks`          | `src/data/conferences.ts` (talks half) |
| `keynote`       | `content/keynotes`       | `src/data/conferences.ts` (keynotes half) |
| `serviceGroup`  | `content/service`        | `src/data/service.ts` |
| `teachingStory` | `content/teachingStories`| `src/data/teachingStories.ts` |
| `mediaStory`    | `content/media`          | `src/data/media.ts` |
| `post`          | `content/blog`           | `src/data/blog.ts` |

Every field name matches the corresponding TypeScript interface field
name exactly — that mapping is what makes the content-reading layer
(Batch C) a mechanical translation instead of something clever.

Two schema-wide settings used on every collection:

```ts
{
  name: 'publication',
  label: 'Publications',
  path: 'content/publications',
  format: 'json',
  ui: { router: () => undefined },
  fields: [ /* ... */ ],
}
```

`ui: { router: () => undefined }` disables Tina's "visual editing" router
(which would otherwise try to deep-link each document to a page URL for
live-preview editing). This site doesn't use visual editing, so every
collection opts out.

Top-level config:

```ts
export default defineConfig({
  branch: process.env.TINA_BRANCH || process.env.HEAD || 'main',
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID || undefined,
  token: process.env.TINA_TOKEN || undefined,
  build: {
    publicFolder: 'public',
    outputFolder: 'admin',
    basePath: process.env.BASE_PATH?.replace(/^\//, '') || undefined,
  },
  media: {
    tina: { publicFolder: 'public', mediaRoot: 'images' },
  },
  schema: { collections: [ /* the 8 above */ ] },
});
```

`clientId`/`token` are `undefined` until Batch E — this is fine, local
editing works without them.

The blog `post` collection's `body` field is the one non-trivial part: a
Tina **"blocks" field** (a list of typed sub-documents, Tina's
page-builder pattern), one template per paragraph/heading/quote/list/image
type:

```ts
const blogBlockTemplates = [
  { name: 'p', label: 'Paragraph', fields: [
    { type: 'string', name: 'text', label: 'Text', ui: { component: 'textarea' } },
  ]},
  { name: 'h', label: 'Sub-heading', fields: [
    { type: 'string', name: 'text', label: 'Text' },
  ]},
  { name: 'quote', label: 'Pull quote', fields: [
    { type: 'string', name: 'text', label: 'Text', ui: { component: 'textarea' } },
  ]},
  { name: 'list', label: 'Bulleted list', fields: [
    { type: 'string', name: 'items', label: 'Items', list: true },
  ]},
  { name: 'image', label: 'Image', fields: [
    { type: 'image', name: 'src', label: 'Image', uploadDir: () => 'blog' },
    { type: 'string', name: 'alt', label: 'Alt text' },
    { type: 'string', name: 'caption', label: 'Caption' },
  ]},
];
// ...
{ type: 'object', name: 'body', label: 'Body', list: true, templates: blogBlockTemplates }
```

Each block is stored on disk as `{ "_template": "p", "text": "..." }` —
that `_template` key naming (not `type`, not `__typename`) is a Tina
internal convention confirmed by reading
`node_modules/@tinacms/schema-tools/dist/index.js` directly, not assumed
from memory/docs (Tina's public docs don't spell this out clearly, and it
matters a lot for Batch C's parsing code).

Image fields use `uploadDir: () => '<subfolder>'` to match the site's
existing per-section image convention (`research`, `teaching-life`,
`blog`).

### 4.4 Error: "Field can only be defined once" for `id`

Every collection initially had an explicit `id` field (to preserve the
old data's string ids). Tina rejected the schema: its own auto-generated
document identity is also internally named `id`, and a custom field with
that name collides.

**Fix:** removed the `id` field from every collection. Document identity
comes from the filename instead (see [2.3](#23-filenames-are-document-identity-no-custom-id-field)) — no schema
field needed at all.

### 4.5 Error: `ui: { router: () => null }` — TypeScript error

The installed `@tinacms/schema-tools` type for a router function expects
a return type that doesn't include `null`.

**Fix:** `() => undefined` instead of `() => null`. Read from the actual
`.d.ts` file in `node_modules` to confirm the expected type rather than
guessing — SaaS-adjacent libraries like this change their type surface
across versions often enough that memorized signatures go stale.

### 4.6 `package.json` scripts (as of Batch B, before Batch E)

```json
"dev": "tinacms dev -c \"next dev\"",
"build": "next build",
"dev:next-only": "next dev",
"build:tina": "tinacms build && next build"
```

`build` stays plain `next build` deliberately — `tinacms build` needs
TinaCloud credentials that don't exist until Batch E, and CI runs `build`
on every push (including all of Batches B–D), so keeping it unaffected
means the live site is never blocked by anything Tina-related until
you're actually ready to connect TinaCloud. `build:tina` is added ahead
of time as an inert, unused script, ready to be wired into CI later.

### 4.7 `.gitignore` additions

```
tina/__generated__
public/admin
```

Both are build output regenerated on every `tinacms dev`/`tinacms build`
run — no reason to commit them.

### 4.8 Local verification

```
npm run dev
```

opens `/admin` locally with zero account needed (filesystem mode). Verify
by actually creating and saving a real test document through each
collection's form — confirms field-name mapping is correct, `required`
validation works, and the saved JSON shape matches what Batch C's
parsing code will expect. Delete the test content afterward
(`content/<collection>/<test-file>.json`) before committing anything.

---

## 5. Batch C — the content mapper layer

**Goal of this batch specifically:** build `src/lib/content/*.ts` files
that read the JSON in `content/<type>/`, and return data in the *exact*
same shape (field names, optionality, derived helper functions) as the
original `src/data/*.ts` arrays did — so that wiring components to use
them (Batch D) is a mechanical, low-risk swap, not a rewrite.

### 5.1 The shared filesystem helper — `src/lib/content/_fs.ts`

```ts
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
```

Notes:
- `.sort()` on the filename list means directory order = alphabetical
  filename order — this is why ordering-sensitive collections use
  numeric-prefixed filenames (`01-...`, `02-...`; see 6.2).
- Returns `[]` for a collection with no directory yet, rather than
  throwing — lets every `get*()` function work even before any content
  has been seeded for that type.
- `id` comes from the filename (minus `.json`), never from a field inside
  the JSON — see [2.3](#23-filenames-are-document-identity-no-custom-id-field).

### 5.2 One mapper module per collection (first pass — see 5.3 for the fix)

The first version put everything for a collection — types, pure derived
helpers (`yearsFor`, `citationFor`, etc.), *and* the `fs`-reading
`get*()` fetcher function — in one file, e.g. `src/lib/content/publications.ts`:

```ts
export interface Publication { /* ... */ }
export const CATEGORY_LABELS = { /* ... */ };
export function yearsFor(list: Publication[]): number[] { /* pure */ }
export function citationFor(p: Publication): string { /* pure */ }
export function getPublications(): Record<PublicationCategory, Publication[]> {
  // uses readCollection() from _fs.ts
}
```

This looked fine and passed `npm run typecheck` and `npm run build`
cleanly. It broke at the next step.

### 5.3 Error: `node:fs` leaking into the client bundle

Wiring a `'use client'` component (`ResearchPublications.tsx`) to import
`yearsFor` and `citationFor` from that same file — functions that never
call `fs` themselves — caused `next build` (Turbopack) to fail with:

```
FATAL: An unexpected Turbopack error occurred.
Caused by:
- the chunking context (unknown) does not support external modules (request: node:fs)
```

**Root cause:** ES module bundling includes a file's *entire* top-level
import graph when anything from that file is imported, regardless of
which specific export is actually used. `publications.ts` had
`import { readCollection } from './_fs'` at the top (used only by
`getPublications`), and `_fs.ts` imports `node:fs`. A browser bundle has
no `node:fs` to link against, so the build fails outright — this isn't a
tree-shaking quality issue that a smarter bundler config would fix; it's
a hard requirement that server-only and client-safe code must live in
physically separate files.

**Fix:** split every collection's mapper into two files:

- `src/lib/content/<name>.ts` — types and pure functions only. Never
  imports `_fs.ts`. Safe for both Server and Client Components.
- `src/lib/content/<name>.server.ts` — the `get*()` fetcher, imports
  `readCollection` from `_fs.ts` and types from `./<name>`. **Only ever
  imported from Server Components** (`page.tsx`, `layout.tsx`, and the
  two `app/blog/**/page.tsx` files).

Example, `publications.ts` (client-safe):

```ts
export type PublicationCategory = 'published' | 'under-review' | 'books' | 'working';
export interface Publication { /* ... */ }
export const CATEGORY_LABELS: Record<PublicationCategory, string> = { /* ... */ };
export function yearsFor(list: Publication[]): number[] { /* ... */ }
export function citationFor(p: Publication): string { /* ... */ }
```

`publications.server.ts` (server-only):

```ts
import { readCollection } from './_fs';
import type { Publication, PublicationCategory } from './publications';

export function getPublications(): Record<PublicationCategory, Publication[]> {
  // reads content/publications/*.json via readCollection(), maps to Publication[]
}
```

This split was applied to all eight collections. **Rule going forward:**
any new content-reading code must follow this same split — a "just this
once, it's a small function" exception will reproduce the exact same
build failure.

### 5.4 Full list of client-safe / server-only pairs

| Client-safe (`*.ts`) | Server-only (`*.server.ts`) |
|---|---|
| `publications.ts` — `Publication`, `PublicationCategory`, `CATEGORY_LABELS`, `yearsFor`, `citationFor` | `publications.server.ts` — `getPublications()` |
| `grants.ts` — `Grant` | `grants.server.ts` — `getGrants()` |
| `awards.ts` — `Award` | `awards.server.ts` — `getAwards()` |
| `conferences.ts` — `Talk`, `Keynote`, `talkYears` | `conferences.server.ts` — `getTalks()`, `getKeynotes()` |
| `service.ts` — `ServiceItem`, `ServiceGroup`, `servicePullQuote` | `service.server.ts` — `getServiceGroups()` |
| `teachingStories.ts` — `TeachingStory` | `teachingStories.server.ts` — `getVisibleTeachingStories()` |
| `media.ts` — `MediaCategory`, `MediaItem`, `hasMedia` | `media.server.ts` — `getMediaItems()` |
| `blog.ts` — `BlogBlock`, `BlogCategory`, `BlogPost`, `postCategories`, `postBySlug`, `formatPostDate` | `blog.server.ts` — `getVisiblePosts()` |

### 5.5 Data-shape translations worth knowing about

A few fields don't map 1:1 from Tina's stored JSON to the app's types;
the `.server.ts` fetchers do this translation:

- **Blog body blocks**: stored as `{ "_template": "p", "text": "..." }`;
  translated to the app's `{ type: "p", text: "..." }` discriminated
  union via a `blockFromRaw()` switch on `_template`.
- **Teaching-story `story`**: the Tina field is a single textarea string
  ("leave a blank line between paragraphs"); the app type wants
  `string[]` (one entry per paragraph). Split with:
  ```ts
  story.split(/\r?\n\s*\r?\n/).map((p) => p.trim()).filter(Boolean)
  ```
- **`talkYears`**: originally a stored/derived constant
  (`[...new Set(talks.map(t => t.year))]`); now a plain function computed
  over whatever `Talk[]` array is passed in, since there's no longer a
  single static array to compute it from once at module load.

### 5.6 Verification

Since these are plain synchronous functions (not React components), the
fastest way to check them is a throwaway script run with `npx tsx`
against temporary sample JSON files dropped into `content/`, checking the
printed output shape matches expectations, then deleting the sample files
before committing. (`tsx` isn't a project dependency — `npx --yes tsx
script.ts` fetches it on demand for one-off runs.)

---

## 6. Batch D — seeding content and wiring components

Two separate things happen in this batch: **(a)** convert every existing
`src/data/*.ts` literal array into real `content/<type>/*.json` files,
and **(b)** change every component that used to `import` from
`src/data/*.ts` to receive that data as a **prop** instead, fetched once
in the nearest Server Component ancestor.

### 6.1 One-time seed script

Rather than hand-transcribing ~90 records (a serious transcription-error
risk), a temporary script imported the *existing* `src/data/*.ts` arrays
(still present at this point) and wrote out one JSON file per record:

```ts
// _seed-content.ts (deleted after running once)
import fs from 'node:fs';
import path from 'node:path';
import { publications } from './src/data/publications';
// ...import the other 7 arrays...

function write(collection: string, filename: string, data: unknown) {
  const dir = path.join(process.cwd(), 'content', collection);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${filename}.json`), JSON.stringify(data, null, 2) + '\n', 'utf8');
}

for (const category of Object.keys(publications)) {
  for (const p of publications[category]) {
    const { id, ...rest } = p;           // id becomes the filename, not a field
    write('publications', id, { ...rest, category });
  }
}
// ... same pattern for the other 7 collections ...
```

Run once with `npx --yes tsx _seed-content.ts`, then deleted. Blog body
blocks were converted from `{ type, ...rest }` to `{ _template: type,
...rest }` in the same pass (matching 4.3's storage convention).

**Every original `id`/`slug` was preserved exactly** (as the filename),
so the very first time the professor opened the admin, it showed exactly
today's content, not an empty CMS.

### 6.2 Filename ordering convention

Where display order matters and *isn't* otherwise derivable from a field
(e.g. a `year`), filenames get a two-digit numeric prefix so
`readCollection()`'s alphabetical directory listing reproduces the
original array order:

- **Awards** — no clean sortable field (`year` is free text like
  `"2020/21, 2021/22"`); prefixed `01-...` through `09-...`.
- **Keynotes** — same reasoning; prefixed `01-...` through `04-...`.
- **Service groups** — display order (Department, Faculty, College &
  University, External) is meaningful; prefixed `01-...` through
  `04-...`.
- **Media items** — display order matters, no date field to sort by;
  prefixed `01-...` through `03-...`.
- **Grants** — awarded and in-preparation grants share one folder
  (`content/grants/`), split at read time by a `status` field; each
  group is numbered independently within that shared folder (so both
  `01-g-crf-covid.json` and `01-g-prep-probiotics.json` exist — the
  prefix only needs to be unique combined with the rest of the filename,
  not globally sequential).
- **Publications** and **talks** were *not* given numeric prefixes: the
  UI already sorts/groups them by an explicit field (`featured` for
  publications, `year` for talks), so filename order is irrelevant to
  what's displayed.

### 6.3 Component rewiring pattern

Before, every section component imported its data directly:

```ts
// before
import { serviceGroups, servicePullQuote } from '@/data/service';
export default function Service() {
  const [active, setActive] = useState(serviceGroups[0].id);
  // ...
}
```

After, the component takes it as a prop, and only the pure/type-only
import remains:

```ts
// after
import type { ServiceGroup } from '@/lib/content/service';
import { servicePullQuote } from '@/lib/content/service';
export default function Service({ serviceGroups }: { serviceGroups: ServiceGroup[] }) {
  const [active, setActive] = useState(serviceGroups[0]?.id);
  if (!group) return null;   // defensive: content can now be emptied by an editor
  // ...
}
```

The one Server Component that ties it all together, `src/app/page.tsx`:

```tsx
import { getPublications } from '@/lib/content/publications.server';
import { getGrants } from '@/lib/content/grants.server';
import { getAwards } from '@/lib/content/awards.server';
import { getTalks, getKeynotes } from '@/lib/content/conferences.server';
import { getServiceGroups } from '@/lib/content/service.server';
import { getVisibleTeachingStories } from '@/lib/content/teachingStories.server';
import { getMediaItems } from '@/lib/content/media.server';
import { getVisiblePosts } from '@/lib/content/blog.server';

export default function Page() {
  const { awardedGrants, inPreparationGrants } = getGrants();
  return (
    <main id="main">
      <Hero />
      <About />
      <ResearchPublications
        publications={getPublications()}
        awardedGrants={awardedGrants}
        inPreparationGrants={inPreparationGrants}
        awards={getAwards()}
        talks={getTalks()}
        keynotes={getKeynotes()}
      />
      <Teaching teachingStories={getVisibleTeachingStories()} />
      <Service serviceGroups={getServiceGroups()} />
      <Media items={getMediaItems()} />
      <Writing posts={getVisiblePosts()} />
      <BeyondWork />
      <Contact />
    </main>
  );
}
```

Note this is a plain synchronous function component, not `async` — the
`get*()` calls are synchronous `fs.readFileSync` reads, so no `await`
is needed anywhere in this data-fetching path.

A special case: **nav structure**. The site nav conditionally shows a
"Media & Stories" link only if there's publishable media content
(`hasMedia()`). The old `src/data/nav.ts` computed this once at module
load by importing `mediaItems` directly — which no longer works, since
`Header.tsx` (a client component) can't import anything that touches
`fs` (rule from 2.4). Fix: `nav.ts` now just exports a pure
`buildNav(hasMedia: boolean): NavItem[]` function; `layout.tsx` (a Server
Component) calls `getMediaItems()` + `hasMedia()` and passes the
resulting `nav` array down as a prop to both `Header` and `Footer`.

### 6.4 Deleting the old data files

Once every consumer was switched to the new mapper layer, the eight
original `src/data/*.ts` files (`publications.ts`, `grants.ts`,
`awards.ts`, `conferences.ts`, `service.ts`, `teachingStories.ts`,
`media.ts`, `blog.ts`) had zero remaining imports anywhere in `src/` —
confirmed with a repo-wide grep before deleting — and were deleted.
`src/data/profile.ts`, `interests.ts`, `teaching.ts` were left alone;
they're out of this migration's scope (not Tina-managed content).

### 6.5 A supporting script that also needed repointing

`scripts/check-figures.mjs` (catches publication images that are missing
or case-mismatched — a real recurring issue: Windows/macOS are
case-insensitive filesystems, the deployed Linux server isn't) used to
regex-scrape `image:` values out of `src/data/publications.ts`'s source
text. Repointed to read the same values out of
`content/publications/*.json` directly:

```js
const files = readdirSync(contentDir).filter((f) => f.endsWith('.json'));
const expected = files
  .map((f) => JSON.parse(readFileSync(join(contentDir, f), 'utf8')).image)
  .filter((image) => typeof image === 'string' && image.startsWith('/images/research/'))
  .map((image) => basename(image));
```

### 6.6 Verification

1. `npm run typecheck` and `npm run build` clean.
2. Serve the `out/` directory with a plain static file server (no `next
   dev`) — this is the real static-export output, not a dev-server
   approximation.
3. Headless-browser pass over every rewired section: publications
   (category counts, featured-first ordering), grants (awarded vs.
   in-preparation), awards (order), talks (year filter dropdown options,
   grouping), keynotes, service tabs (order, sub-groups), teaching life,
   media cards, the blog index, and an individual blog post page —
   checking rendered text against the known source values, and checking
   for zero console/page errors.
4. Push, wait for the Actions run, confirm `conclusion: success`, then
   re-run the same headless-browser checks against the *live* URL, not
   just localhost — confirms the static export genuinely matches what
   was verified locally.

---

## 7. Batch E — connecting TinaCloud

This is the only batch that requires manual, interactive steps on
tina.io that can't be scripted — a real account and a real GitHub App
authorization are involved. Below is both what a human needs to click,
and what a developer needs to configure to match.

### 7.1 Create a TinaCloud account and project

1. Go to `app.tina.io`, sign up (email/password or "Continue with
   GitHub" both work).
2. Accept the Terms of Service / Privacy Policy, complete registration.
3. **"Are you a developer?"** — cosmetic onboarding question, doesn't
   affect setup; skip it.
4. Choose **"I have an existing project"** / **"Import an Existing
   Project"**.
5. **Git Authoring** step — choose **"Act as self"** rather than "Act as
   bot": this makes every edit saved through the admin show up as a real
   git commit authored by the actual logged-in GitHub identity, not a
   generic shared bot account. Click **"Authorize with GitHub"**.
6. **Co-authoring** step — leave this **disabled**. It would add a
   redundant `Co-authored-by:` trailer using the *same* identity already
   set as the primary author in step 5; it only earns its keep in "Act as
   bot" mode, where individual editors need a way to still be
   attributed despite a shared bot being the primary author.
7. **Connect GitHub** → **Authenticate GitHub** (may open a popup; don't
   block popups for this site).
8. **Install the TinaCloud GitHub App**: choose **"Only select
   repositories"**, pick the specific repo, confirm the requested
   permissions (read metadata; read/write code, pull requests, and
   repository webhooks — this is exactly what's needed for the editor to
   commit content back), click **Install**.
9. **Choose your repo** → select it from the list. (If it's not listed:
   the GitHub App wasn't authorized for that account/org — there's a
   **"Configure your TinaCloud permissions on GitHub"** link on this
   screen that reopens the authorization flow.)
10. **Project Configuration**:
    - **Project Name**: whatever's meaningful; shown to users logging in.
    - **Site URL(s)**: comma-separated list of **bare origins only** —
      *"Only the URL origin is needed, not the path to any specific
      pages."* See [7.4](#74-error-cors-error-on-a-billing-check-endpoint) for what goes wrong if you
      include a path or a stray trailing character here.
    - **"Use a separate content repo"**: leave off — content stays in
      the same repo as the code.
    - **Advanced Settings → Path to Tina Folder**: leave blank if
      `tina/config.ts` is at the repo root (it is, for this project).
    - Click **Create Project**.
11. The project Overview page now shows a **Client ID** (a UUID, public/
    safe to share) and a **Site URLs** section.
12. Go to the **Tokens** tab. TinaCloud auto-creates two tokens on
    project creation: **"Content (Readonly)"** and **"Search"**. Use the
    **Content (Readonly)** token's value — that's what the site's
    `TINA_TOKEN` env var expects. (No need to click "New Token" unless
    you want a differently-scoped one.)

### 7.2 Wire the Client ID and Token into the project

Two places need both values:

**A. Local `.env.local`** (gitignored, never committed):
```
NEXT_PUBLIC_TINA_CLIENT_ID=<the Client ID from the Overview page>
TINA_TOKEN=<the Content (Readonly) token from the Tokens tab>
```

**B. GitHub Actions repo config** — `NEXT_PUBLIC_TINA_CLIENT_ID` is
public (it ends up embedded in the built admin's JS bundle regardless),
so it's a **repository variable**. `TINA_TOKEN` is a credential and
should never be readable back once set, so it's a **repository secret**.

Setting a repo *variable* via the API is a plain authenticated POST:

```
curl -X POST -H "Authorization: Bearer <a token with repo write access>" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/<owner>/<repo>/actions/variables \
  -d '{"name":"TINA_CLIENT_ID","value":"<client id>"}'
```

Setting a repo *secret* requires client-side encryption first — GitHub
never accepts a plaintext secret value over the API, even over HTTPS.
The process:

1. Fetch the repo's current public key:
   ```
   curl -H "Authorization: Bearer <token>" -H "Accept: application/vnd.github+json" \
     https://api.github.com/repos/<owner>/<repo>/actions/secrets/public-key
   ```
   Returns `{ "key_id": "...", "key": "<base64>" }`.
2. Encrypt the secret value with that key using **libsodium's sealed-box
   encryption** (`crypto_box_seal`) — this is GitHub's documented
   requirement, not an arbitrary choice; plain AES or anything else
   won't be accepted. In Node, using the `libsodium-wrappers` package:
   ```js
   const sodium = require('libsodium-wrappers');
   await sodium.ready;
   const binkey = sodium.from_base64(keyB64, sodium.base64_variants.ORIGINAL);
   const binsec = sodium.from_string(secretValue);
   const encBytes = sodium.crypto_box_seal(binsec, binkey);
   const encB64 = sodium.to_base64(encBytes, sodium.base64_variants.ORIGINAL);
   ```
3. PUT the encrypted value:
   ```
   curl -X PUT -H "Authorization: Bearer <token>" -H "Accept: application/vnd.github+json" \
     https://api.github.com/repos/<owner>/<repo>/actions/secrets/TINA_TOKEN \
     -d "{\"encrypted_value\":\"<encB64>\",\"key_id\":\"<key_id>\"}"
   ```
   `201` = created, `204` = updated an existing secret.

**On losing track of the token later:** GitHub secrets are genuinely
write-only — nobody, including whoever set it, can read the value back
via the UI or API afterward. This isn't a problem in practice, though:
the *actual* durable copy of the token lives on TinaCloud's own Tokens
page indefinitely (unlike GitHub's one-way secret store), so it can
always be re-copied from there, or a fresh token generated in seconds and
the GitHub secret updated to match.

### 7.3 Update the deploy workflow

Swap the build step from `npm run build` to `npm run build:tina`, and
pass both values through as env vars:

```yaml
- run: npm run build:tina
  env:
    BASE_PATH: ${{ vars.SITE_URL && '' || steps.base.outputs.path }}
    SITE_URL: ${{ vars.SITE_URL || steps.base.outputs.url }}
    NEXT_PUBLIC_CONTACT_ENDPOINT: ${{ vars.CONTACT_ENDPOINT }}
    NEXT_PUBLIC_TINA_CLIENT_ID: ${{ vars.TINA_CLIENT_ID }}
    TINA_TOKEN: ${{ secrets.TINA_TOKEN }}
```

And update `package.json`'s `build:tina` script so it also works for a
human running it locally without manually exporting env vars first —
`tinacms build` (the CLI) does **not** auto-load `.env.local` the way
Next's own `next dev`/`next build` do; that's Next-specific behavior, not
something the standalone Tina CLI replicates. Fixed with the
`dotenv-cli` package:

```
npm install --save-dev dotenv-cli
```

```json
"build:tina": "dotenv -e .env.local -- tinacms build --skip-cloud-checks && next build"
```

(the `--skip-cloud-checks` flag is explained in 7.7 below; ignore it for
now and assume plain `tinacms build && next build` while reading 7.4–7.6,
since that's what was actually running at the time those were hit.)

`dotenv -e .env.local -- <command>` loads that file into the environment
then runs `<command>`; in CI, where `.env.local` doesn't exist,
`dotenv-cli` just logs a harmless warning and runs the command with
whatever's already in the environment (i.e. the workflow's own `env:`
block) — so the same script line works correctly in both places without
an `if` branch.

### 7.4 Error: CORS error on a billing-check endpoint

After the first successful `build:tina` deploy, `/admin` on the live site
loaded and showed a real "Log in" button — but the browser console showed:

```
Access to fetch at 'https://identity.tinajs.io/v2/apps/<clientId>/billing/state'
from origin 'https://<owner>.github.io' has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

**First hypothesis (wrong path):** the configured Site URL included a
path (`https://<owner>.github.io/<repo>`) when the field explicitly asks
for an origin only ("not the path to any specific pages") — a browser's
actual `Origin` header on a CORS preflight is always just the scheme +
host + port, never a path, so a literal-string allowlist entry that
includes a path would never match. Corrected the Site URL to the bare
origin and re-tested — **error persisted, unchanged.**

A follow-up attempt introduced a **typo**: an accidental trailing period
before the slash (`https://<owner>.github.io./`) — also fixed, also
didn't change the outcome.

**Conclusion:** this specific `identity.tinajs.io/.../billing/state`
endpoint's CORS behavior is unrelated to the project's configured Site
URLs — it's an auxiliary "check my plan/quota" call for a UI badge, not
part of the authentication flow, and its failure doesn't block login.
**The real test is whether "Log in" actually works — not whether this one
console error is present.** Once verified via an actual interactive
GitHub OAuth login (see 7.5), the login and the full editor loaded and
worked normally with this error still showing in the console. Left as a
known, harmless cosmetic warning; not something under this project's
control to fix.

**Lesson for future debugging:** don't assume every console error blocks
functionality, and don't keep re-tuning a config value that's already
correct just because an error persists — test the actual user-facing
behavior directly once a plausible fix has been tried and didn't help.

### 7.5 Verifying the login flow actually works

This can't be automated/scripted end-to-end: it requires an interactive
GitHub OAuth consent screen tied to a real, already-authenticated browser
session. Verified manually: visited `https://<owner>.github.io/<repo>/admin/`,
clicked "Log in", completed GitHub's popup sign-in, and confirmed landing
in the real content editor — sidebar listing all 8 collections plus
Media Manager, with the live homepage rendering behind the editing
overlay.

### 7.6 Verifying a real save round-trip

Opened one existing document (Teaching Life → an existing entry) and
clicked Save with a change, then confirmed on the git side:

```
curl -H "Authorization: Bearer <token>" \
  https://api.github.com/repos/<owner>/<repo>/commits?per_page=3
```

Confirmed: a new commit landed, message `"TinaCMS content update"`,
**author was the real logged-in GitHub identity** (not a bot, not any
third-party tool) — matching the "Act as self" choice from 7.1 step 5 —
and the triggered Actions run for that push completed with
`conclusion: success`.

### 7.7 Error: remote-schema check failing in CI (`ERR_CLOUD_CHECK_FAILED`)

After a later schema change (adding a sort index — see section 8), the
push's CI build failed:

```
The local Tina schema doesn't match the remote Tina schema. Please push
up your changes to GitHub to update your remote tina schema.
Additional info:
    Branch: main, Client ID: ...
    Last indexed at: Mon, 24 Aug 2026 21:55:09 GMT
errorCode: 'ERR_CLOUD_CHECK_FAILED'
```

**Root cause:** by default (without `--local` or `--skip-cloud-checks`),
`tinacms build` performs a live round-trip to TinaCloud that compares the
schema being built against what TinaCloud has *already indexed* from the
most recent push. TinaCloud re-indexes asynchronously after each push
(via its GitHub App webhook) — this normally takes well under a minute,
but the GitHub Actions workflow triggered by the same push can start
running *before* that indexing finishes, since both are reacting to the
same push event independently and there's no ordering guarantee between
them. The "Last indexed at" timestamp in the error was the *previous*
commit's time, confirming indexing genuinely hadn't caught up yet.

**Why this matters architecturally:** per [2.2](#22-content-is-read-directly-off-disk-not-through-tinas-graphql-client), this
site's own pages never query TinaCloud's content API at runtime — every
page reads `content/*.json` straight off disk at build time. The
schema-match check exists to protect people who *do* query that API at
runtime (making sure the API's understanding of the schema matches what
the client expects); it isn't protecting anything for this project's
actual data flow, so failing a deploy because of it is pure downside with
no corresponding safety benefit here.

**Fix:** add `--skip-cloud-checks` to the `tinacms build` invocation,
permanently, in both the local script and (implicitly, since it's the
same script) CI:

```json
"build:tina": "dotenv -e .env.local -- tinacms build --skip-cloud-checks && next build"
```

Verified this flag produces a **functionally identical** admin bundle
(same generated `API url`, same three output files listed in the CLI's
own success summary) as the checked build — it only removes the
network round-trip and its associated wait/race, not any actual
generated output.

This eliminates the race condition for good, for any future schema
change — not just a one-time retry.

---

## 8. Post-launch: adding a sort index

A real request that came up after launch: the Publications collection in
the admin shows a flat, alphabetically-sorted list of every publication
regardless of category, and the professor wanted a way to group/sort by
category (Published / Under Review / Books & Chapters / Working Papers)
within that view.

Two options exist:
1. **Add a sort index on the existing `category` field** (small,
   non-disruptive) — adds a new choice to the admin's existing "Sort by"
   dropdown; no content moves, no other code changes.
2. **Split into 4 separate collections** (bigger) — each category
   becomes its own item in the sidebar (like Talks vs. Keynotes already
   are), at the cost of migrating all existing files into new folders
   and updating the content-reading code to merge four sources back into
   one `Record<PublicationCategory, Publication[]>` shape.

Option 1 was chosen. Confirmed the schema mechanism by reading the
installed type definitions directly rather than guessing:

```ts
// node_modules/@tinacms/schema-tools/dist/types/index.d.ts
interface BaseCollection {
  // ...
  indexes?: IndexType[];
  // ...
}
type IndexType = {
  name: string;
  fields: { name: string }[];
};
```

Applied to the `publication` collection in `tina/config.ts`:

```ts
{
  name: 'publication',
  label: 'Publications',
  path: 'content/publications',
  format: 'json',
  ui: { router: () => undefined },
  indexes: [{ name: 'ByCategory', fields: [{ name: 'category' }] }],
  fields: [ /* unchanged */ ],
}
```

One line. Verified with `tinacms build --skip-cloud-checks` locally
before pushing (a schema-only change is exactly the kind of change that
would otherwise hit 7.7's race condition on the very next deploy — this
was in fact how 7.7 was discovered, on the *first* attempt to push this
exact change, before the `--skip-cloud-checks` fix existed yet).

After deploying, the new sort option needs TinaCloud's own backend
indexing to catch up (separately from the site's own deploy, which is
immediate) before it appears/functions in the live admin UI — typically
under a minute, but worth knowing as a source of "why isn't it there
yet" if checked immediately after a schema-change push.

---

## 9. How to add a new content type later

Following the pattern established above, adding a ninth content type
(say, "Press Releases") means:

1. **Schema** — add a new collection to `tina/config.ts` (`fields`
   matching whatever shape you want; no `id` field, per 2.3).
2. **Mapper pair** — `src/lib/content/pressReleases.ts` (types + any pure
   helpers) and `src/lib/content/pressReleases.server.ts` (a
   `getPressReleases()` function using `readCollection('pressReleases')`
   from `_fs.ts`). Never let the server file's imports leak into the
   client-safe file, per 2.4/5.3.
3. **Component** — build or adapt a component that takes the data as a
   **prop**, not an import.
4. **Wire it up** — call `getPressReleases()` in `src/app/page.tsx` (or
   wherever it's rendered) and pass the result down as a prop.
5. **Seed or start empty** — either hand-write a first JSON file into
   `content/pressReleases/`, or just let the professor create the first
   one through the admin — Tina's "Add File" flow handles that with no
   pre-existing content required.
6. **Verify**: `npm run typecheck`, `npm run build`, then
   `npm run build:tina` locally (confirms the schema change is valid —
   use `--skip-cloud-checks` if testing immediately after a push, per
   7.7) before pushing for real.

---

## 10. Full error log, quick reference

| # | Error | Root cause | Fix |
|---|---|---|---|
| 1 | `next build` never produces `out/` | `next.config.js` missing entirely | Create it with `output: 'export'` |
| 2 | `git push` → 403 Permission denied | Pushing account had no write access to the repo | Add as a collaborator, accept invite |
| 3 | AI co-author trailer in commit history | Commit message included a `Co-Authored-By:` line | `git commit --amend`, then `git push --force-with-lease` |
| 4 | Tina schema: "Field can only be defined once" for `id` | Custom `id` field collides with Tina's own auto-generated document identity | Remove the field; use the filename as identity instead |
| 5 | TS error on `ui: { router: () => null }` | Installed type expects a different return type | Use `() => undefined` |
| 6 | `FATAL: ... does not support external modules (request: node:fs)` | A client component imported from a module whose *unrelated* top-level import touched `node:fs` | Split every content module into a client-safe file and a `*.server.ts` file |
| 7 | CORS error on `identity.tinajs.io/.../billing/state` | Unrelated to Site URL config; an auxiliary quota-badge call that doesn't affect login | Confirmed non-blocking by testing the real login flow; left as-is |
| 8 | `ERR_CLOUD_CHECK_FAILED` — "local Tina schema doesn't match remote" | CI's `tinacms build` ran before TinaCloud finished asynchronously re-indexing a just-pushed schema change | Add `--skip-cloud-checks` permanently — this project's pages never query TinaCloud's API at runtime, so the check protects nothing here |

---

## 11. File inventory

**Added:**
- `next.config.js`
- `tina/config.ts` (schema for all 8 collections)
- `src/lib/content/_fs.ts` + 8×(`<name>.ts` + `<name>.server.ts`) pairs
- `content/<collection>/*.json` — ~90 seeded content files across 8 collections
- `.env.local` (gitignored — `NEXT_PUBLIC_CONTACT_ENDPOINT`, `NEXT_PUBLIC_TINA_CLIENT_ID`, `TINA_TOKEN`)

**Modified:**
- `package.json` — added `tinacms`/`@tinacms/cli`/`dotenv-cli`; `dev`, `build:tina` scripts
- `.gitignore` — added `tina/__generated__`, `public/admin`
- `.github/workflows/deploy.yml` — build step now `npm run build:tina` with Tina env vars
- `src/app/layout.tsx` — computes `nav` via `buildNav(hasMedia(getMediaItems()))`, passes to `Header`/`Footer`
- `src/app/page.tsx` — fetches all content via `.server.ts` modules, passes as props
- `src/app/blog/page.tsx`, `src/app/blog/[slug]/page.tsx` — same pattern for blog
- `src/data/nav.ts` — `NAV` constant → pure `buildNav(hasMedia: boolean)` function
- Every section/leaf component that used to import from `src/data/*.ts` for one of the 8 migrated types — now takes that data as a prop (`ResearchPublications`, `Talks`, `Service`, `Teaching`, `TeachingLife`, `Media`, `Writing`, `PublicationItem`, `PostCard`, `BlogArchive`, `Header`, `Footer`)
- `scripts/check-figures.mjs` — reads `content/publications/*.json` instead of parsing `src/data/publications.ts`'s source text

**Deleted:**
- `src/data/publications.ts`, `grants.ts`, `awards.ts`, `conferences.ts`, `service.ts`, `teachingStories.ts`, `media.ts`, `blog.ts` — fully superseded, zero remaining imports before deletion

---

## 12. Verification checklist

Use this after *any* change to the schema, the mapper layer, or a
component wired to it:

- [ ] `npm run typecheck` — clean
- [ ] `npm run build` — clean, same route list as before
- [ ] `npm run build:tina` (locally, with `.env.local` populated) — clean, admin bundle regenerated
- [ ] Serve the real `out/` directory statically (not `next dev`) and spot-check the changed section renders correctly with zero console errors
- [ ] Push, wait for the Actions run, confirm `conclusion: success`
- [ ] Re-check the *live* URL (not just localhost) for the same section
- [ ] If the schema changed: log into `/admin` on the live site and confirm the collection/field/sort change actually appears (may take up to ~a minute after deploy for TinaCloud's own indexing to catch up, separately from the site deploy itself)
- [ ] If testing a save: confirm via the GitHub API that the resulting commit is authored by the real editor identity, not a bot, and that the triggered deploy also succeeds
