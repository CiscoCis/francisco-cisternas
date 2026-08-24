# Francisco Cisternas — personal website

A personal professional site: person first, employer-independent, built to be
added to rather than rebuilt.

Single scrolling home page plus a real `/blog` section. All factual content
comes from CV 2026c, the approved biography, and the change-requirements
document.

---

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript + React 19 |
| Styling | CSS Modules + a token-based design system (`src/app/globals.css`) |
| Fonts | Playfair Display + Lato, self-hosted woff2 (latin subset, 196 KB) |
| Illustration | `DigitalNetworkGraphic` — pure SVG/CSS, no raster assets |
| Output | Static export (`out/`) — no Node runtime required to host |

No UI framework, no animation library, no icon package. Total third-party
runtime dependencies: React and Next only.

---

## Design system — "Refracted"

A white, editorial page layered with translucent triangular geometry.
Triangles stack and cross one another; where they overlap, `multiply`
blending deepens the colour the way layered glass would. Hairline edges and
small vertex dots turn the geometry into something that reads as a plotted
network — structure, measurement, data.

Chile is present as the blue and the red, held back from flag saturation so
they read as a considered palette rather than a national theme. Colour never
arrives as a large field — only as translucent geometry, hairlines and small
marks.

| Role | Token | Hex |
|---|---|---|
| Links, active states, filled buttons | `--blue` | `#14459B` |
| Section labels and single accent marks | `--red` | `#D0332B` |
| Analytics, methods, metrics | `--teal` | `#0E9F9A` |
| Secondary data, gradient ends | `--cyan` | `#2BB3D6` |
| Display headings and body copy | `--ink` | `#111A2B` |
| The page | `--bg` | `#FFFFFF` |
| Alternating band | `--bg-warm` | `#FAFBFD` |

Two colours have a darker text-safe step, because the spec value does not
clear 4.5:1 on white at body size: `--red-600` `#C22B24` (5.7:1) and
`--teal-700` `#0B7F7B` (4.8:1). Cyan is never used for small text.

The component stylesheets were written against an older `--brand-*` /
`--accent-*` naming. Rather than churn every file, both families are
re-pointed at the top of `globals.css`, so there is exactly one place where
"which colour does this role use" is decided.

### The triangle motif, repeated at every scale

| | |
|---|---|
| `TriangleField` | The background composition — three or four stacked triangles at low fill opacity with full-strength hairlines and vertex dots. Variants: `hero`, `section`, `quiet`. |
| `.card-tint` | A large tinted triangle bleeding out of each card's top-right, clipped by the card. `--tint` sets its colour per card — blue for media, teal for publications, cyan for posts. |
| `.eyebrow::before` | A small red triangle ahead of every section label. |
| `.marker` | Each career-timeline stop, coloured along a blue → cyan → teal ramp. |
| `icon.svg` | The favicon: an outlined triangle with a solid red one inside it. |

### Glass

Glassmorphism is used on the navigation, the cards, the panels and the
floating chips — `backdrop-filter: blur() saturate()` with a hairline border
and a glossy white edge raked across the top-left corner. The point is that
the triangle field stays faintly visible *through* the surfaces above it.
Browsers without `backdrop-filter` get an opaque surface instead of a
washed-out one.

### Motion

| | |
|---|---|
| Navigation | A floating glass bar below the top of the viewport; almost transparent at the top of the page, gaining opacity, blur and shadow as you scroll. |
| Triangle field | Three drift lanes at 34–44s, tiny distances, opposite directions — the composition keeps re-crossing itself. |
| Section reveals | Headings rise ~22px while fading in; grid children follow on a stagger. Reveals fire once, then stop observing. |
| Career timeline | The blue→cyan→teal rail draws itself left-to-right over 1.5s as the section arrives; the stops fade in behind it. |
| Cards | Rise 3px, border warms, the corner triangle opens slightly, and a slow band of light sweeps across the glass. |
| Buttons | Rise 2px with a shine crossing once, and the arrow travels 4px. |
| Images | Settle from `scale(1.02)` behind a soft clip rather than zooming. |
| Parallax | The hero triangle field drifts ~30px against the scroll. |
| Easing | `cubic-bezier(0.16, 0.84, 0.44, 1)` — starts softly, accelerates, settles. Never linear. |
| Scrolling | Never hijacked, never slowed. Smoothness comes from rAF-coalesced measurement and compositor-only properties. |

Content never depends on animation to be readable: the hidden state lives
behind `html.js-reveal`, which only exists once JavaScript has run, and
`prefers-reduced-motion` disables every drift, parallax, sheen and travel,
leaving plain fades.

**A performance note worth keeping.** An earlier version of the background
drew painterly washes as SVG paths roughened with `feTurbulence` +
`feDisplacementMap` + a wide `feGaussianBlur`. Rasterising those filters
full-width starved the main thread badly enough that the mobile navigation
drawer dropped its open transition on tall viewports. Everything decorative
is now plain polygons and gradients, which composite on the GPU. If you add
background art later, avoid runtime SVG filters over large areas.

---

## Requirements

**Node 20.9 or newer** (Node 22 LTS recommended), which comes with npm 10+.
Check with `node -v`.

On macOS, `brew install node@22` or the LTS installer from nodejs.org. If your
shell prompt starts with `(base)` you are in a conda environment, which may be
supplying an old Node — run `conda deactivate` first.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static site written to ./out
npm run typecheck
```

Deploy by copying the contents of `out/` to any static host. A GitHub Pages
workflow is included and works out the base path by itself.

---

## Project structure

```
src/
  app/
    layout.tsx        metadata, JSON-LD, fonts, header + footer
    page.tsx          the home page, section by section
    blog/
      page.tsx        /blog — the archive
      [slug]/         /blog/<slug> — one page per post, generated
    globals.css       design tokens + shared UI
  components/
    Header.tsx              glass nav, scroll-spy, mobile drawer
    Reveal.tsx              scroll-reveal wrapper (IntersectionObserver)
    Parallax.tsx            slow scroll drift, rAF-coalesced
    TriangleField.tsx       the translucent triangle layer
    Modal.tsx               the glass dialog (portal, focus trap, Escape)
    Footer.tsx
    Talks.tsx               talks + keynotes (lives inside Research)
    TeachingLife.tsx        photo + story cards
    BlogArchive.tsx         listing, category filter, year groups
    PostCard.tsx
    PublicationItem.tsx     one publication card
    ContactForm.tsx
    sections/               Hero, About, ResearchPublications, Teaching,
                            Service, Media, Writing, BeyondWork, Contact
  data/                 <-- edit these to update the site
    profile.ts        identity, biography, education, journey, CV, nav
    publications.ts   published / under review / books / working papers
    blog.ts           blog posts
    media.ts          external interviews, profiles, features
    interests.ts      Beyond Work
    teachingStories.ts Teaching Life
    teaching.ts       programmes, reach, resources, recognition
    grants.ts  awards.ts  service.ts  conferences.ts
public/
  images/             photographs, plus per-folder notes on what goes where
  docs/               downloadable files (see docs/README.md)
scripts/
  google-sheets-endpoint.gs   the contact-form backend, ready to paste
  generate-og-card.mjs        regenerates the link-preview image
```

**To update content, edit only the files in `src/data/`.** Every list,
filter, count, year group and route is derived from them.

### Adding a blog post

Add one object to the array in `src/data/blog.ts`. That is the whole
procedure — the listing, the archive, the category filters, the year
grouping and the post's own page all follow. Post 2, 3, 10 and 50 need no
structural change. Set `draft: true` while writing: drafts show in
`npm run dev` and never reach the production build.

---

## Contact form → Google Sheet

Messages are posted to a Google Apps Script Web App, which appends a row to a
Google Sheet (`timestamp, name, email, subject, message, status, page`) and
optionally emails a notification.

The script, with step-by-step setup instructions, is in
`scripts/google-sheets-endpoint.gs`. Once deployed, set:

```
NEXT_PUBLIC_CONTACT_ENDPOINT=https://script.google.com/macros/s/…/exec
```

in `.env.local` for local work, and as a repository variable named
`CONTACT_ENDPOINT` for the deployed site.

The destination email address and the sheet both live in the Apps Script,
not in this code, so changing either takes two minutes and no redeploy.

**Until an endpoint is configured**, the form does not pretend to send. It
composes the message into the visitor's own mail client and says so plainly
above the button.

---

## What is still waiting on real material

These are deliberately left in a safe state rather than faked. Every one of
them is a data edit, not a code change.

1. **Media & Stories URLs** — the three features were named but no links were
   supplied. A card with no URL is visible in `npm run dev` with a "link
   needed" badge and is dropped from the production build. Paste the URL into
   `src/data/media.ts` and the card goes live.
2. **Blog posts** — none supplied. The blog ships with one draft template
   post that explains how to add real ones; it never reaches production.
3. **Teaching Life stories** — the Singapore field trip is stubbed with its
   title only. The stories are Francisco's memories; writing them for him
   would mean inventing them. See `src/data/teachingStories.ts`.
4. **Beyond Work photographs** — the interests were supplied, the photos were
   not. Cards fall back to a typographic treatment. See
   `public/images/beyond/README.md`.
5. **Publication links and abstracts** — the `doi`, `url`, `pdf`, `abstract`
   and `image` fields exist on every publication and each renders its own
   control only when filled. None were in the CV, so most cards currently
   show only "Cite".
7. **CV PDFs** — not supplied, so no download button renders. See
   `public/docs/README.md`.
8. **Google Scholar** — no profile URL supplied; the link is omitted.
9. **Comprehensive teaching history** — the site shows what CV 2026c
   contains. §6.1 asks for the fuller record, including teaching outside
   CUHK beyond the country and subject lists already present.
10. **Contact form endpoint** — see above.

---

## Accessibility & performance notes

- Semantic landmarks, skip link, single `h1` per page, no skipped levels.
- All tabs use `role="tablist"/"tab"/"tabpanel"` with roving `tabindex`.
- Colour contrast checked programmatically against WCAG AA across the home
  page and the blog; the neutral ramp was darkened where it fell short.
- Visible focus rings; `prefers-reduced-motion` disables smooth scroll,
  parallax, reveal travel and image motion, leaving plain fades.
- The mobile drawer uses `inert` while closed, so it animates open without
  ever being focusable or reachable by a screen reader when shut.
- Touch targets ≥ 44px on coarse pointers and narrow viewports.
- No horizontal overflow from 320px to 2560px, including landscape phones.
- Images lazy-loaded except the hero; fonts local with `display: swap`.
- No render-blocking third-party requests.
