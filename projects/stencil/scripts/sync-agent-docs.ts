/**
 * Generates the agent-facing install docs shipped inside the three Magma
 * entry-point packages (magma, magma-react, magma-angular).
 *
 * Single source of truth: docs/agents/ in the monorepo. This script copies the
 * relevant install track plus the shared fragments (one topic per file, see
 * SHARED_FRAGMENTS) into each package, rewrites the repo-internal links so they
 * resolve inside node_modules (rewriteGuideLinks), generates the component
 * catalogue linking each component's own docs, and emits a version-stamped AGENTS.md
 * entry point: the detect-then-ask install procedure plus a routing table, so an agent
 * reads only the fragment it needs.
 *
 * The per-component docs the catalogue links (dist/collection/components/<tag>/) are
 * written after the stencil build by scripts/component-docs.ts.
 *
 * Do not hand-edit the generated files; edit docs/agents/ and re-run this.
 *
 * Run from the stencil package dir:  npm run sync.agent-docs
 */
import fs from 'fs';
import path from 'path';
import { COMPONENT_DOCS_DIR, SHARED_FRAGMENTS, rewriteGuideLinks, toAscii } from './agent-docs-lib';

// cwd is the stencil package dir when run via npm script.
const STENCIL_DIR = process.cwd();
const SOURCE_DIR = path.resolve(STENCIL_DIR, '../../docs/agents');
const COMPONENTS_DIR = path.resolve(STENCIL_DIR, 'src/components');

interface Target {
  /** package dir relative to the stencil package */
  pkgDir: string;
  /** track file in docs/agents to ship as agents/install.md */
  track: string;
  /** human label for the detected framework */
  framework: string;
  /** the wrapper package the consumer installs */
  wrapperPkg: string;
  /** one-line registration reminder */
  register: string;
}

const TARGETS: Target[] = [
  {
    pkgDir: '.',
    track: 'web-components.md',
    framework: 'none (plain HTML / vanilla JS, or any framework via custom elements)',
    wrapperPkg: '@maggioli-design-system/magma',
    register:
      "the defineCustomElement* functions from '@maggioli-design-system/magma/components' (tree-shakeable), or defineCustomElements() from '@maggioli-design-system/magma/loader' to register everything at once",
  },
  {
    pkgDir: '../stencil-react',
    track: 'react.md',
    framework: 'React / Next.js',
    wrapperPkg: '@maggioli-design-system/magma-react',
    register:
      "import the Mds* components from '@maggioli-design-system/magma-react' (no defineCustomElements needed)",
  },
  {
    pkgDir: '../stencil-angular/magma-angular',
    track: 'angular.md',
    framework: 'Angular (>= 20)',
    wrapperPkg: '@maggioli-design-system/magma-angular',
    register:
      "import the standalone Mds* components from '@maggioli-design-system/magma-angular' (they self-register; MagmaModule.forRoot() is deprecated and a no-op)",
  },
];

const BANNER = [
  '<!--',
  '  GENERATED FILE - do not edit by hand.',
  '  Source of truth: docs/agents/ in the magma monorepo.',
  '  Regenerate with: npm run sync.agent-docs (from the stencil package).',
  '-->',
  '',
].join('\n');

function buildAgentsMd(target: Target, version: string): string {
  return `${BANNER}# ${target.wrapperPkg} - agent install guide

> Version ${version}. You (the agent) are installing Magma into THIS project. Do not
> assume the setup - detect it from the project, then ask the user only for what you
> cannot infer. The detailed steps live in [\`agents/install.md\`](agents/install.md)
> (this target) and [\`agents/assets.md\`](agents/assets.md) (shared styles, fonts,
> icons). This package targets: **${target.framework}**.

## Step 1 - detect (read, do not ask)

Inspect the consumer project before asking anything:

| What | Where to look |
| ---- | ------------- |
| Framework | \`package.json\` deps: \`@angular/core\` -> Angular, \`react\`/\`next\` -> React, else vanilla |
| Magma wrapper installed | presence of \`magma-angular\` / \`magma-react\` / \`magma\` in deps |
| Bundler / static dir | \`angular.json\` (Angular CLI assets), \`vite.config.*\`, \`next.config.*\` (\`public/\`), webpack |
| Tailwind + version | \`tailwindcss\` in deps: v4 -> the CSS imports, v3 -> the JS preset (see agents/assets.md) |
| SSR | \`@angular/ssr\` / Angular Universal, or Next App Router |
| Compatible versions | derive from the installed \`@maggioli-design-system/magma\` major (see matrix in install.md) |
| Editor | a \`.vscode/\` folder -> VS Code; nothing -> ask (step 2) |

## Step 2 - ask only the gaps

Ask the user only what detection left undecided. Typical questions:

1. **Icons**: which sets does the app use, and how should they be served? Every slug must
   be served at \`<mdsIconSvgPath><slug>.svg\`, and each set comes from its own package:
   Magma ships only \`mgg/\` (\`@maggioli-design-system/svg-icons\`), while \`mi/\` and
   \`mdi/\` come from \`@material-icons/svg\` and \`@mdi/svg\`, and none of them is a
   dependency of this package. The routes are in agents/assets.md section 3: **iconsauce**,
   what Magma uses (it reads the sources and writes only the icons they name), or a copy
   script that serves the files in the slug layout. Copying the \`svg-icons\` folder as it
   is renders nothing: its files are not under \`mgg/\`.
2. **Static assets path**: where are static files served from? This sets \`mdsIconSvgPath\`
   and the SVG copy destination.
3. **Dark mode / preferences**: needed? If yes, wire the preference classes and components.
4. Confirm the version row if the installed major is ambiguous.
5. **Editor**: VS Code? It gets token and class autocomplete through two files in
   \`.vscode/\` (agents/assets.md section 5); for another editor only the token file applies.

## Step 3 - execute

1. Install packages and the shared assets - see [\`agents/install.md\`](agents/install.md).
2. Wire styles in the exact cascade-layer order - see [\`agents/assets.md\`](agents/assets.md).
3. Serve every icon slug the app uses at the static path, with the route from step 2, and
   set \`mdsIconSvgPath\`.
4. Register components: ${target.register}.
5. Set up editor autocomplete - see [\`agents/assets.md\`](agents/assets.md) section 5: MERGE the
   keys into \`.vscode/settings.json\` and \`.vscode/extensions.json\`, never overwrite them.
6. Set up the lint - see [\`agents/lint.md\`](agents/lint.md): the ESLint and Stylelint rules ship
   in this package; MERGE the Magma presets into the project's ESLint and Stylelint
   configurations, never overwrite them.
7. Set up the MCP server - see [\`agents/mcp.md\`](agents/mcp.md): it ships in this package as
   the \`magma-mcp\` command, started with \`npx --no magma-mcp\` (never without \`--no\`, which
   would let npx install a package of that name from the registry). For Claude Code, register
   the Magma plugin in the project's \`.claude/settings.json\` instead: it starts the server and
   adds the Magma skills (\`/magma:setup\`, \`/magma:review\`, \`/magma:migrate\`). For the other
   clients MERGE the entry into \`.vscode/mcp.json\` or \`.cursor/mcp.json\`; never both the
   plugin and an \`.mcp.json\` entry, or the server runs twice. Then call its \`check_setup\`
   tool: it lists what the integration still misses.

## Step 4 - verify

Build the app and confirm an \`mds-*\` component renders and every icon it names loads
from the configured path (no 404 on \`<path><slug>.svg\`). In VS Code, check both halves of
the autocomplete: \`var(--magma-\` completes Magma tokens in a CSS file and, with Tailwind,
\`bg-surface-default\` shows a swatch. Run the lint ([\`agents/lint.md\`](agents/lint.md)): no
error. Report what was installed, the cascade order used, the icon route, the icon path and
the lint configuration.

## Using the components

Once installed, do not guess component APIs or rules - read only the file you need:

| You need | Read |
| -------- | ---- |
| Which component to reach for | [\`agents/components.md\`](agents/components.md) - the catalogue, one line each |
| One component's API (props with allowed values, events, methods, slots, parts, CSS vars) | its \`AGENTS.md\`, linked from the catalogue |
| Correct usage and mistakes for one component | \`pattern.md\` / \`antipattern.md\` beside its \`AGENTS.md\` |
| Rules shared by every component: naming, events, slots, compound, icons, a11y, styling from outside | [\`agents/conventions.md\`](agents/conventions.md) |
| \`variant\` and \`tone\` values | [\`agents/variants.md\`](agents/variants.md) |
| Mistakes to avoid with any component | [\`agents/anti-patterns.md\`](agents/anti-patterns.md) |
| Coloring your own UI | [\`agents/color.md\`](agents/color.md) |
| Colors in an Android, iOS or Flutter app, where the components do not run | [\`agents/color.md\`](agents/color.md), "Outside the web" |
| Typography utilities | [\`agents/typography.md\`](agents/typography.md) |
| Dark mode, preferences, named themes, surface levels and elevation, global design decisions, corner geometry | [\`agents/theming.md\`](agents/theming.md) |
| Asking instead of reading: the API of a component, the role for a need, a class, an icon slug, a guide section, a snippet checked before writing | the tools of the \`magma\` MCP server, [\`agents/mcp.md\`](agents/mcp.md) |
| Checking what you wrote: run ESLint and Stylelint with the Magma presets after every change, and fix what they report | [\`agents/lint.md\`](agents/lint.md) |
| Reporting a problem that is Magma's, not this project's (bug, wrong guide, missing token), with this project's origin label | [\`agents/reporting.md\`](agents/reporting.md) |
| What changed between the installed version and a newer one, before upgrading | \`CHANGELOG.md\` of each Magma package, newest release first (\`magma-react\` and \`magma-angular\` carry the releases of \`magma\`) |

Tooling that needs structured data reads \`documentation.json\`: one per component beside
its \`AGENTS.md\`, or \`@maggioli-design-system/magma/dist/documentation.json\` for all of them
(over 2 MB - do not load it into context). In both, the relative links of the \`usage\`
texts resolve from the component's folder, \`dist/collection/components/<tag>/\`.
\`dist/types/components.d.ts\` drives editor IntelliSense.
`;
}

/** First sentence of a component's "1. Description" usage markdown, for the catalogue. */
function summarise(description: string): string {
  const desc = description;
  let line = '';
  for (const raw of desc.split('\n')) {
    const s = raw.trim();
    if (s && !s.startsWith('#') && !s.startsWith('|') && !s.startsWith('```')) {
      line = s;
      break;
    }
  }
  // strip inline markdown links (repo-relative, broken in node_modules), keep their text
  line = line.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');
  // first sentence only, kept on one table row
  const sentence = (line.split('. ')[0] || line).replace(/\s+/g, ' ').trim();
  return toAscii(sentence).replace(/\|/g, '\\|');
}

/**
 * Builds agents/components.md from each component's committed usage description
 * (src/components/<tag>/usage/1. Description.md). Reading source - not the build's
 * dist/documentation.json - keeps generation independent of the stencil build, so it
 * can run before it (Stencil validates the package.json "files" array during build).
 */
function buildComponentsMd(docsPrefix: string): string {
  const entries: { tag: string; summary: string }[] = [];
  for (const dirent of fs.readdirSync(COMPONENTS_DIR, { withFileTypes: true })) {
    if (!dirent.isDirectory() || !dirent.name.startsWith('mds-')) continue;
    const descPath = path.join(COMPONENTS_DIR, dirent.name, 'usage', '1. Description.md');
    if (!fs.existsSync(descPath)) continue;
    const summary = summarise(fs.readFileSync(descPath, 'utf8'));
    if (summary) entries.push({ tag: dirent.name, summary });
  }
  entries.sort((a, b) => a.tag.localeCompare(b.tag));
  const rows = entries
    .map((e) => `| [\`${e.tag}\`](${docsPrefix}/${e.tag}/AGENTS.md) | ${e.summary} |`)
    .join('\n');

  return `${BANNER}# Magma components catalogue (${entries.length} components)

> Generated from each component's usage description. Each tag links the component's
> own \`AGENTS.md\` (its API, with \`pattern.md\` and \`antipattern.md\` beside it) in
> \`@maggioli-design-system/magma/${COMPONENT_DOCS_DIR}/<tag>/\`. The rules shared by
> every component: [\`conventions.md\`](conventions.md), [\`variants.md\`](variants.md),
> [\`anti-patterns.md\`](anti-patterns.md).

| Component | What it is |
| --------- | ---------- |
${rows}
`;
}

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readVersion(pkgRoot: string): string {
  const pkg = JSON.parse(fs.readFileSync(path.join(pkgRoot, 'package.json'), 'utf8'));
  return pkg.version ?? '0.0.0';
}

function main(): void {
  for (const target of TARGETS) {
    const pkgRoot = path.resolve(STENCIL_DIR, target.pkgDir);
    const agentsDir = path.join(pkgRoot, 'agents');
    // generated output only: start clean so a fragment dropped from the source does not linger
    fs.rmSync(agentsDir, { recursive: true, force: true });
    ensureDir(agentsDir);

    const version = readVersion(pkgRoot);
    const trackSrc = fs.readFileSync(path.join(SOURCE_DIR, target.track), 'utf8');
    // the wrappers link into the magma package they depend on, installed beside them
    const docsPrefix =
      target.pkgDir === '.' ? `../${COMPONENT_DOCS_DIR}` : `../../magma/${COMPONENT_DOCS_DIR}`;

    fs.writeFileSync(path.join(pkgRoot, 'AGENTS.md'), buildAgentsMd(target, version));
    fs.writeFileSync(
      path.join(agentsDir, 'install.md'),
      BANNER + rewriteGuideLinks(trackSrc, docsPrefix),
    );
    for (const fragment of SHARED_FRAGMENTS) {
      const src = fs.readFileSync(path.join(SOURCE_DIR, fragment), 'utf8');
      fs.writeFileSync(path.join(agentsDir, fragment), BANNER + rewriteGuideLinks(src, docsPrefix));
    }
    fs.writeFileSync(path.join(agentsDir, 'components.md'), buildComponentsMd(docsPrefix));

    console.log(
      `agent docs synced -> ${target.wrapperPkg} (${path.relative(STENCIL_DIR, pkgRoot) || '.'})`,
    );
  }
}

main();
