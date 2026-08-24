# Publication figures

**Put the image files in THIS folder.** Not the project root, not next to
`package.json` — only files under `public/` are served by the site, and
`public/images/research/…` is where the data points.

Run this at any time to see what is present, missing or misnamed:

```bash
npm run check:figures
```

## The six expected here

| File | Publication |
|---|---|
| `Basket.png` | Basket-Enhanced Heterogeneous Hypergraph (IEEE ICASSP 2025) |
| `Cultural.png` | Cultural and generational factors… (Cell Reports 2024) |
| `sustainable_food.png` | The future of sustainable food consumption in China (2022) |
| `salmon.png` | Optimizing Salmon Farm Cage Net Management (JORS 2013) |
| `Mathprog.png` | Mathematical Programming… breeding nets (JSE 2009) |
| `airplane.png` | Revenue Management in an Airline (JSE 2006) |

## Filenames are case-sensitive

They are **not** case-sensitive on Windows, but they **are** on the Linux
server that hosts the published site. `Basket.png` and `basket.png` are the
same file on your machine and two different files once deployed — which is
why a figure can work locally and vanish after publishing.

Copy them across exactly as spelled above, capitals included.
`npm run check:figures` flags a case mismatch specifically and tells you
what to rename.

## If a file is missing

Nothing breaks. The card detects the failed load and falls back to its
text-only layout, exactly as it looks for a paper with no figure. In
`npm run dev` the browser console also names the exact file it wanted.

## Format

Landscape, at least 1400px wide, PNG or JPG. Figures are shown with
`object-fit: contain`, so nothing is ever cropped: whatever aspect ratio
they are, the whole figure is visible, letterboxed onto a pale tint. The
full-size version appears in the abstract dialog.

## Which papers have what

Four papers have a figure, an abstract and an article link, so their cards
offer an "Abstract" button that opens the dialog.

`airplane.png` (JSE 2006) is a **figure only** — no abstract or link was
supplied for that paper, so neither control is offered on its card. Send
them and they drop into `src/data/publications.ts` alongside the image.

## Licensing

Check the licence before using a figure from a published paper. Many
journals hold copyright in the typeset version even where the author holds
it in the accepted manuscript.
