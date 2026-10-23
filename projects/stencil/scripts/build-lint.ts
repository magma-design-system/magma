/*
  Ships the consumer lint (projects/lint, #1102) and the MCP server (#1107) inside this
  package, so they arrive with the components and always match their version: compiles their
  sources into dist/lint, marks that folder as ES modules with its own package.json, since
  this package is not one, and copies the icon the server shows its clients.
  package.json exports it as ./eslint, ./stylelint, ./stylelint/recommended,
  ./stylelint/strict and ./lint (the core). Runs at the end of the build, after the clean
  step has emptied dist.
*/
import { execFileSync } from 'child_process';
import { chmodSync, copyFileSync, existsSync, writeFileSync } from 'fs';
import { createRequire } from 'module';
import { resolve } from 'path';
import { DIST_DIR, PROJECT_DIR } from './meta';

const LINT_DIR = resolve(PROJECT_DIR, '../lint');
const OUT_DIR = resolve(DIST_DIR, 'lint');

const tsc = createRequire(resolve(PROJECT_DIR, 'package.json')).resolve('typescript/bin/tsc');
execFileSync(
  process.execPath,
  [tsc, '-p', resolve(LINT_DIR, 'tsconfig.build.json'), '--outDir', OUT_DIR],
  { stdio: 'inherit' },
);
writeFileSync(resolve(OUT_DIR, 'package.json'), `${JSON.stringify({ type: 'module' }, null, 2)}\n`);
// the magma-mcp bin of package.json: executable, as tsc does not make it
chmodSync(resolve(OUT_DIR, 'mcp/cli.js'), 0o755);

// the icon the MCP server shows its clients: the Magma mark, from the build of identity
const ICON = resolve(PROJECT_DIR, '../identity/dist/internal/magma-design-system/logo-magma.svg');
if (!existsSync(ICON))
  throw new Error(`${ICON} is missing: build identity first (nx run identity:build)`);
copyFileSync(ICON, resolve(OUT_DIR, 'mcp/icon.svg'));
console.info(`Consumer lint and MCP server compiled into ${OUT_DIR}`);
