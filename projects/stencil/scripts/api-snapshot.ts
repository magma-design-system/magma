/**
 * Writes, or with --check verifies, magma.api.txt: the public API of magma as one sorted
 * line per member, reduced by scripts/api-snapshot-lib.ts from the docs JSON (the
 * components: props, events, methods, slots, parts, documented CSS custom properties,
 * states) and from the declarations of the package root (its exports and the members
 * they promise with `@public`), then the types they reference.
 *
 * The stencil build writes it, like src/components.d.ts, so a PR that changes the
 * contract consumers rely on shows it as a short diff of this file, and a PR that
 * leaves it untouched changes no public API (#843). CI runs --check against the
 * committed file, so a stale snapshot fails the build. Both fail on a root export the
 * snapshot cannot read, or a promise it cannot trust (rootApi).
 *
 * Needs the stencil build (dist/documentation.json, dist/types).
 *
 * Run from the stencil package dir:  npm run build.api-snapshot  |  npm run check.api-snapshot
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { PROJECT_DIR } from './meta';
import {
  diffSnapshot,
  ROOT_ENTRY,
  rootApi,
  snapshotFile,
  type ApiDocs,
  type ReadDeclaration,
} from './api-snapshot-lib';

const REPO = join(PROJECT_DIR, '../..');
const DOCS = join(PROJECT_DIR, 'dist/documentation.json');
const TYPES = join(PROJECT_DIR, 'dist/types');
const SNAPSHOT = join(PROJECT_DIR, 'magma.api.txt');
/* enough to see what changed, short enough to read in a CI log */
const SHOWN = 40;

for (const input of [DOCS, join(TYPES, ROOT_ENTRY)])
  if (!existsSync(input)) {
    console.error(`missing ${relative(REPO, input)} - run the stencil build first`);
    process.exit(2);
  }

const readDeclaration: ReadDeclaration = (path) => {
  const file = join(TYPES, path);
  return existsSync(file) ? readFileSync(file, 'utf8') : undefined;
};
const root = rootApi(readDeclaration);
if (root.errors.length) {
  console.error(`the exports of the package root (${relative(REPO, join(TYPES, ROOT_ENTRY))}):\n`);
  for (const error of root.errors) console.error(`  ${error}`);
  console.error('\nSee rootApi in scripts/api-snapshot-lib.ts for what the snapshot reads.');
  process.exit(1);
}

const built = snapshotFile(JSON.parse(readFileSync(DOCS, 'utf8')) as ApiDocs, root);
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
    ' If a line above is not a change you meant to make to the public API, fix the component or the export instead.',
);
process.exit(1);
