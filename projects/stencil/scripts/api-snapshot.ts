/**
 * Writes, or with --check verifies, magma.api.txt: the public API of the components
 * as one sorted line per member (props, events, methods, slots, parts, documented CSS
 * custom properties, states and the types they reference), reduced from the docs JSON
 * by scripts/api-snapshot-lib.ts.
 *
 * The stencil build writes it, like src/components.d.ts, so a PR that changes the
 * contract consumers rely on shows it as a short diff of this file, and a PR that
 * leaves it untouched changes no component API (#843). CI runs --check against the
 * committed file, so a stale snapshot fails the build.
 *
 * Needs the stencil build (dist/documentation.json).
 *
 * Run from the stencil package dir:  npm run build.api-snapshot  |  npm run check.api-snapshot
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { PROJECT_DIR } from './meta';
import { diffSnapshot, snapshotFile, type ApiDocs } from './api-snapshot-lib';

const REPO = join(PROJECT_DIR, '../..');
const DOCS = join(PROJECT_DIR, 'dist/documentation.json');
const SNAPSHOT = join(PROJECT_DIR, 'magma.api.txt');
/* enough to see what changed, short enough to read in a CI log */
const SHOWN = 40;

if (!existsSync(DOCS)) {
  console.error(`missing ${relative(REPO, DOCS)} - run the stencil build first`);
  process.exit(2);
}

const built = snapshotFile(JSON.parse(readFileSync(DOCS, 'utf8')) as ApiDocs);
const lines = built.split('\n').length - 1;

if (!process.argv.includes('--check')) {
  writeFileSync(SNAPSHOT, built);
  console.log(`wrote ${relative(REPO, SNAPSHOT)} (${lines} lines)`);
  process.exit(0);
}

const committed = existsSync(SNAPSHOT) ? readFileSync(SNAPSHOT, 'utf8') : '';
if (committed === built) {
  console.log(`OK - ${relative(REPO, SNAPSHOT)} matches the built API (${lines} lines)`);
  process.exit(0);
}

const { removed, added } = diffSnapshot(committed, built);
const show = (sign: string, members: string[]) => {
  for (const line of members.slice(0, SHOWN)) console.error(`  ${sign} ${line}`);
  if (members.length > SHOWN) console.error(`  ${sign} ... ${members.length - SHOWN} more`);
};
console.error(`${relative(REPO, SNAPSHOT)} is stale, the built API differs:\n`);
show('-', removed);
show('+', added);
if (!removed.length && !added.length)
  console.error('  (same members, only the header or the order differ)');
console.error(
  '\nRun the stencil build (or nx run stencil:build.api-snapshot after it) and commit magma.api.txt.' +
    ' If a line above is not a change you meant to make to the public API, fix the component instead.',
);
process.exit(1);
