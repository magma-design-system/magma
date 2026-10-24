/*
  Ships the consumer lint (projects/lint, #1102) and the MCP server (#1107) inside this
  package, so they arrive with the components and always match their version: compiles their
  sources into dist/lint, marks that folder as ES modules with its own package.json, since
  this package is not one, copies the icon the server shows its clients and writes its tools
  as data (mcp/tools.json, the answer of tools/list) for the documentation site, which reads
  the packages and never runs the server (#1127).
  package.json exports it as ./eslint, ./stylelint, ./stylelint/recommended,
  ./stylelint/strict, ./lint (the core) and ./dist/lint/mcp/tools.json. Runs at the end of
  the build, after the clean step has emptied dist.
*/
import { execFileSync } from 'child_process';
import { chmodSync, copyFileSync, existsSync, writeFileSync } from 'fs';
import { createRequire } from 'module';
import { resolve } from 'path';
import { pathToFileURL } from 'url';
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

// the tools of the server as data, from the compiled server itself: one source for both
import(pathToFileURL(resolve(OUT_DIR, 'mcp/server.js')).href)
  .then(({ toolsList }: { toolsList: (context: object) => { tools: unknown[] } }) => {
    const list = toolsList({ root: PROJECT_DIR, settings: {} });
    writeFileSync(resolve(OUT_DIR, 'mcp/tools.json'), `${JSON.stringify(list, null, 2)}\n`);
    console.info(
      `Consumer lint and MCP server compiled into ${OUT_DIR}, ${list.tools.length} tools in mcp/tools.json`,
    );
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
