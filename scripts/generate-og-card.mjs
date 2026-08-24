/**
 * Generates public/images/og-card.jpg — the 1200×630 link-preview card shown
 * when the site is shared on LinkedIn, X, WhatsApp, Slack, iMessage, etc.
 *
 * Rendered in a real browser so it uses the site's actual fonts and the same
 * network motif, rather than being drawn by hand in an image editor. Re-run it
 * whenever the name, title or headshot changes:
 *
 *     npm install --no-save playwright
 *     node scripts/generate-og-card.mjs
 *
 * Playwright is NOT a dependency of the site — it is only needed to regenerate
 * this one file, and the generated PNG is committed.
 */
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const b64 = (p) => readFileSync(join(root, p)).toString('base64');

/*
 * Change requirements §3: the card leads with the person. No honorific, no
 * job title, no institutional lockup — the same identity the site itself
 * presents, so a change of role does not date every link preview ever
 * shared.
 */
const NAME_LINE_1 = 'Francisco';
const NAME_LINE_2 = 'Cisternas';
const TITLE = 'Teaching · Research · Analytics';
const SUBTITLE =
  'Modelling how people move between digital and physical channels';
const TOPICS = [
  'Mobile Marketing',
  'Channels Management',
  'Demand Optimization',
  'Sustainability',
  'Health Marketing',
];

/* ---- decorative network, same language as DigitalNetworkGraphic --------- */
function prng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function networkSvg(w, h, seed) {
  const rand = prng(seed);
  const r2 = (n) => Math.round(n * 100) / 100;
  let out = '';

  // flowing analytical curves
  for (let i = 0; i < 7; i++) {
    const t = i / 6;
    const y0 = h * 0.24 + t * h * 0.5;
    const amp = 70 - t * 22;
    const d = rand() * 22 - 11;
    out += `<path d="M -60 ${r2(y0 + d)} C ${r2(w * 0.2)} ${r2(y0 - amp + d)}, ${r2(w * 0.38)} ${r2(y0 + amp + d)}, ${r2(w * 0.58)} ${r2(y0 + d * 0.4)} S ${r2(w * 0.84)} ${r2(y0 - amp * 1.2 + d)}, ${w + 60} ${r2(y0 - amp * 0.5 + d)}" fill="none" stroke="#ffffff" stroke-opacity="${(0.16 - t * 0.015).toFixed(3)}" stroke-width="${(1.1 - t * 0.4).toFixed(2)}" stroke-linecap="round"/>`;
  }

  // sparse nodes + mesh
  const nodes = Array.from({ length: 30 }, () => ({
    x: r2(30 + rand() * (w - 60)),
    y: r2(24 + rand() * (h - 48)),
    copper: rand() > 0.8,
    r: r2(1.8 + rand() * 2.4),
  }));
  nodes.forEach((n, i) => {
    nodes
      .map((m, j) => ({ j, d: Math.sqrt((m.x - n.x) ** 2 + (m.y - n.y) ** 2) }))
      .filter((c) => c.j > i && c.d < 190)
      .sort((a, b) => a.d - b.d)
      .slice(0, 2)
      .forEach((c) => {
        out += `<line x1="${n.x}" y1="${n.y}" x2="${nodes[c.j].x}" y2="${nodes[c.j].y}" stroke="#ffffff" stroke-opacity="${Math.max(0.05, 0.22 - c.d / 1400).toFixed(3)}" stroke-width="0.8"/>`;
      });
  });

  // tiny data clusters
  for (let c = 0; c < 6; c++) {
    const cx = 60 + rand() * (w - 120);
    const cy = 40 + rand() * (h - 80);
    for (let k = 0; k < 18; k++) {
      const a = rand() * Math.PI * 2;
      const rad = rand() * 46;
      out += `<circle cx="${r2(cx + Math.cos(a) * rad)}" cy="${r2(cy + Math.sin(a) * rad * 0.7)}" r="${r2(0.7 + rand() * 0.8)}" fill="${rand() > 0.86 ? '#b96a45' : '#ffffff'}" fill-opacity="${(0.14 + rand() * 0.3).toFixed(3)}"/>`;
    }
  }

  nodes.forEach((n) => {
    out += `<circle cx="${n.x}" cy="${n.y}" r="${n.r}" fill="${n.copper ? '#d0332b' : '#14459b'}" fill-opacity="${n.copper ? 0.5 : 0.28}"/>`;
  });

  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">${out}</svg>`;
}

const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>
@font-face{font-family:Display;src:url(data:font/woff2;base64,${b64('src/app/fonts/playfair-display-latin-400-normal.woff2')}) format('woff2');font-weight:400}
@font-face{font-family:Display;src:url(data:font/woff2;base64,${b64('src/app/fonts/playfair-display-latin-500-normal.woff2')}) format('woff2');font-weight:500}
@font-face{font-family:Body;src:url(data:font/woff2;base64,${b64('src/app/fonts/lato-latin-400-normal.woff2')}) format('woff2');font-weight:400}
@font-face{font-family:Body;src:url(data:font/woff2;base64,${b64('src/app/fonts/lato-latin-700-normal.woff2')}) format('woff2');font-weight:700}
*{margin:0;padding:0;box-sizing:border-box}
/* White, editorial and calm — the same visual language as the site:
   white paper and translucent stacked triangles. */
body{width:1200px;height:630px;overflow:hidden;font-family:Body,sans-serif;background:#ffffff}
.card{position:relative;width:1200px;height:630px;display:flex;align-items:center;overflow:hidden}
.net{position:absolute;inset:0;z-index:1;opacity:.5;
  -webkit-mask-image:radial-gradient(ellipse 74% 86% at 76% 46%,#000 0%,#000 38%,transparent 100%)}
.left{position:relative;z-index:3;padding:0 0 0 78px;width:690px}
.eyebrow{display:flex;align-items:center;gap:14px;font-size:14px;font-weight:700;
  letter-spacing:.22em;text-transform:uppercase;color:#c22b24}
.eyebrow::before{content:'';width:0;height:0;border-left:6px solid transparent;
  border-right:6px solid transparent;border-bottom:11px solid #d0332b}
.eyebrow::after{content:'';width:54px;height:1px;background:#d0332b}
h1{font-family:Display,serif;font-weight:400;font-size:88px;line-height:1.0;color:#111a2b;
  margin-top:24px;letter-spacing:-.018em}
.rule{width:58px;height:1px;background:#d0332b;margin-top:26px}
.subtitle{font-size:19.5px;font-weight:400;color:#3a465c;margin-top:24px;max-width:540px;line-height:1.55}
.topics{display:flex;flex-wrap:wrap;gap:8px;margin-top:26px;max-width:600px}
.topics span{font-size:13.5px;color:#5f6a82;border:1px solid #e7eaf1;background:rgba(255,255,255,.7);
  border-radius:100px;padding:6px 15px}
.right{position:relative;z-index:3;margin-left:auto;padding-right:78px}
.shot{width:326px;height:326px;border-radius:14px;object-fit:cover;
  box-shadow:0 24px 60px rgba(20,69,155,.18);border:1px solid rgba(255,255,255,.9)}
/* one blue hairline down the left edge */
.edge{position:absolute;left:0;top:0;bottom:0;width:5px;z-index:5;background:#14459b}
/* stacked translucent triangles, mirroring the site's hero */
.tri{position:absolute;z-index:2;right:-40px;top:-60px}
</style></head>
<body><div class="card">
  <svg class="tri" width="760" height="720" viewBox="0 0 760 720" xmlns="http://www.w3.org/2000/svg">
    <g style="mix-blend-mode:multiply">
      <polygon points="380,60 660,520 100,520" fill="#c3d3ec" fill-opacity=".62"/>
      <polygon points="530,170 780,660 280,660" fill="#c8e6e4" fill-opacity=".5"/>
      <polygon points="250,230 500,720 0,720" fill="#f0cfcd" fill-opacity=".44"/>
      <polygon points="600,20 780,380 420,380" fill="#cfe9f3" fill-opacity=".46"/>
    </g>
    <g fill="none" stroke-width="1">
      <polygon points="380,60 660,520 100,520" stroke="#14459b" stroke-opacity=".2"/>
      <polygon points="530,170 780,660 280,660" stroke="#0e9f9a" stroke-opacity=".22"/>
      <polygon points="250,230 500,720 0,720" stroke="#d0332b" stroke-opacity=".16"/>
      <polygon points="600,20 780,380 420,380" stroke="#2bb3d6" stroke-opacity=".24"/>
    </g>
    <circle cx="380" cy="60" r="4" fill="#14459b" fill-opacity=".8"/>
    <circle cx="530" cy="170" r="3.4" fill="#0e9f9a" fill-opacity=".8"/>
    <circle cx="250" cy="230" r="3.4" fill="#d0332b" fill-opacity=".8"/>
    <circle cx="600" cy="20" r="3" fill="#2bb3d6" fill-opacity=".8"/>
  </svg>
  <div class="net">${networkSvg(1200, 630, 4821)}</div>
  <div class="edge"></div>
  <div class="left">
    <div class="eyebrow">${TITLE}</div>
    <h1>${NAME_LINE_1}<br>${NAME_LINE_2}</h1>
    <div class="rule"></div>
    <div class="subtitle">${SUBTITLE}</div>
    <div class="topics">${TOPICS.map((t) => `<span>${t}</span>`).join('')}</div>
  </div>
  <div class="right">
    <img class="shot" src="data:image/jpeg;base64,${b64('public/images/headshot.jpg')}" alt="">
  </div>
</div></body></html>`;

const tmp = join(mkdtempSync(join(tmpdir(), 'og-')), 'card.html');
writeFileSync(tmp, html);

const browser = await chromium.launch(
  process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}
);
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
});
await page.goto('file://' + tmp);
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(400);
await page.screenshot({
  path: join(root, 'public/images/og-card.jpg'),
  type: 'jpeg',
  quality: 90,
});
await browser.close();
console.log('wrote public/images/og-card.jpg (1200×630)');
