/**
 * Guard against component CSS referencing design tokens that do not exist.
 *
 * An unresolvable `var()` makes the whole declaration invalid at computed-value
 * time, so the property silently falls back to its initial value: a `box-shadow`
 * becomes `none`, a `color` becomes inherited black. Nothing warns - a missing
 * custom property is legal CSS, and the build-time fallback pass only knows real
 * tokens, so it cannot inject a fallback for a name that was never published.
 *
 * That is how #641 happened: `d40590400` deleted the `--shadow-outline*` ring
 * family from the tokens and left 129 declarations in 32 components pointing at
 * it. Every one of them computed to `none` for five months, including the
 * high-contrast "contrast area" ring, and no test failed.
 *
 * What this checks: every `var(--x)` in the component CSS whose name is NOT a
 * component token (`--mds-*`, `--private-*`) must be defined by the emitted
 * token layer (design-tokens dist, styles dist, the hand-written globals) or in
 * the component sheets themselves.
 */

import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { PROJECT_DIR } from './meta';

const REPO = join(PROJECT_DIR, '../..');
const COMPONENTS = join(PROJECT_DIR, 'src');
/* where the token layer is emitted, in the order a consumer loads it. Tailwind's
 * own default theme counts: `--ease-in-out`, `--radius` and `--drop-shadow-*` are
 * published by it, not by us, and a sheet that uses them resolves fine. */
const TOKEN_SOURCES = [
  'projects/design-tokens/dist/css',
  'projects/styles/dist/css',
  'projects/styles/dist/tailwind',
  'projects/styles/css',
  'node_modules/tailwindcss/theme.css',
];
/* names a component owns, or that come from the runtime rather than a token */
const OWN = /^--(mds|private|magma-pref|tw|swiper|storybook)-/;

const walk = (dir: string, ext: RegExp): string[] => {
  let out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out = out.concat(walk(p, ext));
    else if (ext.test(p)) out.push(p);
  }
  return out;
};

const defined = new Set<string>();
for (const rel of TOKEN_SOURCES) {
  const at = join(REPO, rel);
  let files: string[];
  try {
    files = statSync(at).isDirectory() ? walk(at, /\.css$/) : [at];
  } catch {
    console.error(`missing token source: ${rel} - run the design-tokens and styles builds first`);
    process.exit(2);
  }
  for (const f of files) {
    for (const m of readFileSync(f, 'utf8').matchAll(/(--[\w-]+)\s*:/g)) defined.add(m[1]);
    /* an @property block declares a name too */
    for (const m of readFileSync(f, 'utf8').matchAll(/@property\s+(--[\w-]+)/g)) defined.add(m[1]);
  }
}

const componentCss = walk(COMPONENTS, /\.css$/);
for (const f of componentCss) {
  for (const m of readFileSync(f, 'utf8').matchAll(/(--[\w-]+)\s*:/g)) defined.add(m[1]);
}

type Hit = { file: string; name: string; count: number };
const dangling = new Map<string, Hit>();
for (const f of componentCss) {
  const css = readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  for (const m of css.matchAll(/var\(\s*(--[\w-]+)/g)) {
    const name = m[1];
    if (OWN.test(name) || defined.has(name)) continue;
    const key = `${name}|${f}`;
    const hit = dangling.get(key) ?? { file: relative(REPO, f), name, count: 0 };
    hit.count += 1;
    dangling.set(key, hit);
  }
}

/* Baseline, same idea as the contrast gate: record what is already dangling so the
 * guard starts protecting immediately, and only NEW breakage fails. Refresh with
 * `npm run check.tokens -- --update-baseline` once a known one is fixed. */
const BASELINE_FILE = join(PROJECT_DIR, 'dangling-tokens-baseline.json');
const baseline: string[] = existsSync(BASELINE_FILE)
  ? (JSON.parse(readFileSync(BASELINE_FILE, 'utf8')) as { known: string[] }).known
  : [];
const names = [...new Set([...dangling.values()].map((h) => h.name))].sort();

if (process.argv.includes('--update-baseline')) {
  writeFileSync(BASELINE_FILE, `${JSON.stringify({ known: names }, null, 2)}\n`);
  console.log(`baseline updated: ${names.length} known dangling token(s)`);
  process.exit(0);
}

const fresh = [...dangling.values()].filter((h) => !baseline.includes(h.name));
const stale = baseline.filter((n) => !names.includes(n));
if (stale.length) {
  console.error(`baseline has ${stale.length} stale entry/entries - fixed, so remove them:`);
  for (const n of stale) console.error(`  ${n}`);
  process.exit(1);
}
if (fresh.length === 0) {
  const known = names.length;
  console.log(
    `OK - ${componentCss.length} component sheets, no NEW dangling token` +
      (known ? ` (${known} baselined: ${names.join(', ')})` : ', every var() resolves'),
  );
  process.exit(0);
}
dangling.clear();
for (const h of fresh) dangling.set(`${h.name}|${h.file}`, h);

const byName = new Map<string, Hit[]>();
for (const h of dangling.values()) byName.set(h.name, [...(byName.get(h.name) ?? []), h]);
const total = [...dangling.values()].reduce((a, h) => a + h.count, 0);
console.error(
  `DANGLING TOKENS: ${total} declaration(s) reference ${byName.size} token(s) that no layer defines.`,
);
console.error('Each one computes to the property initial value - silently.\n');
for (const [name, hits] of [...byName.entries()].sort((a, b) => b[1].length - a[1].length)) {
  const n = hits.reduce((a, h) => a + h.count, 0);
  console.error(`  ${name}  (${n} in ${hits.length} file${hits.length > 1 ? 's' : ''})`);
  for (const h of hits.slice(0, 5)) console.error(`      ${h.file}`);
  if (hits.length > 5) console.error(`      ... and ${hits.length - 5} more`);
}
process.exit(1);
