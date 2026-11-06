/*
  Ships the consumer lint (projects/lint, #1102) and the MCP server (projects/mcp, #1107, #1244)
  inside this package, so they arrive with the components and always match their version:
  - compiles the lint into dist/lint and the server into dist/mcp, each marked as ES modules
    with a package.json of its own, since this package is not one; the server imports the lint
    through the exports of this package (./lint, ./eslint, ./stylelint/*), and Node finds them
    from dist/mcp in the node_modules that holds the package;
  - copies the icon the server shows its clients and writes its tools as data (tools.json, the
    answer of tools/list) for the documentation site, which reads the packages and never runs
    the server (#1127).
  package.json exports ./eslint, ./stylelint, ./stylelint/recommended, ./stylelint/strict, ./lint
  (the core), ./dist/mcp/tools.json and, until the documentation site reads that one, the same
  file at ./dist/lint/mcp/tools.json. Runs at the end of the build, after the clean step has
  emptied dist, and after lint:build (an implicit dependency): the server is compiled against
  the declarations it writes in projects/lint/dist.
*/
import { execFileSync } from 'child_process';
import { chmodSync, copyFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { createRequire } from 'module';
import { resolve } from 'path';
import { pathToFileURL } from 'url';
import { DIST_DIR, PROJECT_DIR } from './meta';

const LINT_DIR = resolve(PROJECT_DIR, '../lint');
const MCP_DIR = resolve(PROJECT_DIR, '../mcp');
const LINT_OUT = resolve(DIST_DIR, 'lint');
const MCP_OUT = resolve(DIST_DIR, 'mcp');
/** Where the documentation site reads tools.json today; dropped once it reads dist/mcp. */
const LEGACY_TOOLS_DIR = resolve(LINT_OUT, 'mcp');

const tsc = createRequire(resolve(PROJECT_DIR, 'package.json')).resolve('typescript/bin/tsc');
const compile = (project: string, outDir: string) =>
  execFileSync(
    process.execPath,
    [tsc, '-p', resolve(project, 'tsconfig.build.json'), '--outDir', outDir],
    { stdio: 'inherit' },
  );
const esModules = (dir: string) =>
  writeFileSync(resolve(dir, 'package.json'), `${JSON.stringify({ type: 'module' }, null, 2)}\n`);

compile(LINT_DIR, LINT_OUT);
esModules(LINT_OUT);

const LINT_TYPES = resolve(LINT_DIR, 'dist/index.d.ts');
if (!existsSync(LINT_TYPES))
  throw new Error(`${LINT_TYPES} is missing: build lint first (nx run lint:build)`);
compile(MCP_DIR, MCP_OUT);
esModules(MCP_OUT);
// the magma-mcp bin of package.json: executable, as tsc does not make it
chmodSync(resolve(MCP_OUT, 'cli.js'), 0o755);

// the icon the MCP server shows its clients: the Magma mark, from the build of identity
const ICON = resolve(PROJECT_DIR, '../identity/dist/internal/magma-design-system/logo-magma.svg');
if (!existsSync(ICON))
  throw new Error(`${ICON} is missing: build identity first (nx run identity:build)`);
copyFileSync(ICON, resolve(MCP_OUT, 'icon.svg'));

// the tools of the server as data, from the compiled server itself: one source for both
import(pathToFileURL(resolve(MCP_OUT, 'server.js')).href)
  .then(({ toolsList }: { toolsList: (context: object) => { tools: unknown[] } }) => {
    const list = toolsList({ root: PROJECT_DIR, settings: {} });
    const json = `${JSON.stringify(list, null, 2)}\n`;
    writeFileSync(resolve(MCP_OUT, 'tools.json'), json);
    mkdirSync(LEGACY_TOOLS_DIR, { recursive: true });
    writeFileSync(resolve(LEGACY_TOOLS_DIR, 'tools.json'), json);
    console.info(
      `Consumer lint compiled into ${LINT_OUT}, MCP server into ${MCP_OUT}, ${list.tools.length} tools in tools.json`,
    );
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
