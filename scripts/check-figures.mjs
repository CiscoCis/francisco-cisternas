/**
 * Reports which publication figures are present, missing, or misnamed.
 *
 *     npm run check:figures
 *
 * Why this exists: a figure that does not load is hidden rather than shown
 * broken, which is right for visitors but means a typo in a filename fails
 * silently for whoever is maintaining the site. This turns that silence
 * into a list.
 *
 * It also catches the single most common cause — case. Windows treats
 * `Basket.png` and `basket.png` as the same file; the Linux box serving the
 * deployed site does not. A figure that works locally and vanishes once
 * published is almost always this.
 */
import { readdirSync, existsSync, readFileSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'public/images/research');
const contentDir = join(root, 'content/publications');

/* Read the expected paths straight out of the content files, so this can
   never drift from what the site actually asks for. */
const files = existsSync(contentDir)
  ? readdirSync(contentDir).filter((f) => f.endsWith('.json'))
  : [];
const expected = files
  .map((f) => JSON.parse(readFileSync(join(contentDir, f), 'utf8')).image)
  .filter((image) => typeof image === 'string' && image.startsWith('/images/research/'))
  .map((image) => basename(image));

if (!expected.length) {
  console.log('No publication figures are referenced in content/publications/.');
  process.exit(0);
}

const present = existsSync(dir)
  ? readdirSync(dir).filter((f) => !f.endsWith('.md'))
  : [];
const lower = new Map(present.map((f) => [f.toLowerCase(), f]));

const ok = [];
const wrongCase = [];
const missing = [];

for (const want of expected) {
  if (present.includes(want)) ok.push(want);
  else if (lower.has(want.toLowerCase()))
    wrongCase.push([lower.get(want.toLowerCase()), want]);
  else missing.push(want);
}

const extra = present.filter(
  (f) => !expected.some((w) => w.toLowerCase() === f.toLowerCase())
);

const line = '─'.repeat(64);
console.log(`\n${line}\n  Publication figures — public/images/research/\n${line}`);

if (ok.length) console.log(`\n  ✓ Found (${ok.length})\n${ok.map((f) => `      ${f}`).join('\n')}`);

if (wrongCase.length) {
  console.log(`\n  ! Wrong case (${wrongCase.length}) — these will work on Windows and`);
  console.log('    break on the deployed site. Rename them:');
  wrongCase.forEach(([have, want]) => console.log(`      ${have}  →  ${want}`));
}

if (missing.length) {
  console.log(`\n  ✗ Missing (${missing.length})`);
  missing.forEach((f) => console.log(`      ${f}`));
  console.log('\n    Copy these into public/images/research/. Anywhere else in');
  console.log('    the project will not work — only files under public/ are served.');
}

if (extra.length) {
  console.log(`\n  · Present but unused (${extra.length})`);
  extra.forEach((f) => console.log(`      ${f}`));
  console.log('\n    Not an error — set `image` on a publication to use one.');
}

if (!missing.length && !wrongCase.length) {
  console.log('\n  Every referenced figure is in place.\n');
} else {
  console.log('');
}
