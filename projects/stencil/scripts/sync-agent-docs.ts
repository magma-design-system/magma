/**
 * Generates the agent-facing install docs shipped inside the three Magma
 * entry-point packages (magma, magma-react, magma-angular).
 *
 * Single source of truth: docs/install/ in the monorepo. This script copies the
 * relevant track plus the shared assets core into each package, rewrites the
 * repo-internal links so they resolve (or degrade to plain text) inside
 * node_modules, and emits a version-stamped AGENTS.md entry point carrying the
 * detect-then-ask install procedure.
 *
 * Do not hand-edit the generated files; edit docs/install/ and re-run this.
 *
 * Run from the stencil package dir:  npm run sync.agent-docs
 */
import fs from 'fs';
import path from 'path';

// cwd is the stencil package dir when run via npm script.
const STENCIL_DIR = process.cwd();
const SOURCE_DIR = path.resolve(STENCIL_DIR, '../../docs/install');

interface Target {
  /** package dir relative to the stencil package */
  pkgDir: string;
  /** track file in docs/install to ship as agents/install.md */
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
    register: "defineCustomElements() from '@maggioli-design-system/magma/loader'",
  },
  {
    pkgDir: 'react',
    track: 'react.md',
    framework: 'React / Next.js',
    wrapperPkg: '@maggioli-design-system/magma-react',
    register:
      "import the Mds* components from '@maggioli-design-system/magma-react' (no defineCustomElements needed)",
  },
  {
    pkgDir: 'angular/magma-angular',
    track: 'angular.md',
    framework: 'Angular (>= 18.2)',
    wrapperPkg: '@maggioli-design-system/magma-angular',
    register: "MagmaModule.forRoot() from '@maggioli-design-system/magma-angular'",
  },
];

const BANNER = [
  '<!--',
  '  GENERATED FILE - do not edit by hand.',
  '  Source of truth: docs/install/ in the magma monorepo.',
  '  Regenerate with: npm run sync.agent-docs (from the stencil package).',
  '-->',
  '',
].join('\n');

/**
 * Rewrites links that only make sense inside the monorepo so the published copy
 * resolves within the package (or degrades to plain text).
 */
function rewriteLinks(md: string): string {
  return (
    md
      // cross-project deep links -> friendly plain text (these files are not in node_modules)
      .replace(/\[`?[^\]]*styles\/SPEC\.md`?\]\([^)]*\)/g, 'the Magma styles guide')
      .replace(/\[`?[^\]]*stencil\/SPEC\.md`?\]\([^)]*\)/g, 'the Magma component conventions guide')
      .replace(/\[`?[^\]]*mds-icon\/readme\.md`?\]\([^)]*\)/g, 'the mds-icon readme')
      // any other repo-internal deep link -> keep the text only
      .replace(/\[(`?[^\]]+`?)\]\(\.\.\/\.\.\/[^)]*\)/g, '$1')
      // install entry point SPEC.md -> the package AGENTS.md (one level up from agents/)
      .replace(/\[`?SPEC\.md`?\]\(SPEC\.md\)/g, '[`AGENTS.md`](../AGENTS.md)')
      // collapse the "(web-components.md, react.md, angular.md)" group to the single shipped track
      .replace(
        /\(\[`?web-components\.md`?\]\([^)]*\),\s*\[`?react\.md`?\]\([^)]*\),\s*\[`?angular\.md`?\]\([^)]*\)\)/g,
        '([`install.md`](install.md))',
      )
      // per-target track filenames -> the single track shipped here
      .replace(
        /\[`?(?:web-components|react|angular)\.md`?\]\((?:web-components|react|angular)\.md\)/g,
        '[`install.md`](install.md)',
      )
  );
}

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
| Tailwind + version | \`tailwindcss\` in deps (v3 vs v4 -> different preset) |
| SSR | \`@angular/ssr\` / Angular Universal, or Next App Router |
| Compatible versions | derive from the installed \`@maggioli-design-system/magma\` major (see matrix in install.md) |

## Step 2 - ask only the gaps

Ask the user only what detection left undecided. Typical questions:

1. **Icons**: use the prebuilt set (\`@maggioli-design-system/svg-icons\`) or do you need
   **iconsauce** for tree-shaking / custom icons? Most consumers do NOT need iconsauce -
   Magma already ships resolved SVGs; iconsauce is an internal build dependency. Only
   add \`@iconsauce/*\` if the user wants their own icon pipeline.
2. **Static assets path**: where are static files served from? This sets \`mdsIconSvgPath\`
   and the SVG copy destination.
3. **Dark mode / preferences**: needed? If yes, wire the preference classes and components.
4. Confirm the version row if the installed major is ambiguous.

## Step 3 - execute

1. Install packages and the shared assets - see [\`agents/install.md\`](agents/install.md).
2. Wire styles in the exact cascade-layer order - see [\`agents/assets.md\`](agents/assets.md).
3. Copy the icon SVGs to the static path and set \`mdsIconSvgPath\`.
4. Register components: ${target.register}.

## Step 4 - verify

Build the app and confirm an \`mds-*\` component renders and at least one icon loads from
the configured path. Report what was installed, the cascade order used, and the icon path.
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
  const assetsSrc = fs.readFileSync(path.join(SOURCE_DIR, 'assets.md'), 'utf8');

  for (const target of TARGETS) {
    const pkgRoot = path.resolve(STENCIL_DIR, target.pkgDir);
    const agentsDir = path.join(pkgRoot, 'agents');
    ensureDir(agentsDir);

    const version = readVersion(pkgRoot);
    const trackSrc = fs.readFileSync(path.join(SOURCE_DIR, target.track), 'utf8');

    fs.writeFileSync(path.join(pkgRoot, 'AGENTS.md'), buildAgentsMd(target, version));
    fs.writeFileSync(path.join(agentsDir, 'install.md'), BANNER + rewriteLinks(trackSrc));
    fs.writeFileSync(path.join(agentsDir, 'assets.md'), BANNER + rewriteLinks(assetsSrc));

    // eslint-disable-next-line no-console
    console.log(
      `agent docs synced -> ${target.wrapperPkg} (${path.relative(STENCIL_DIR, pkgRoot) || '.'})`,
    );
  }
}

main();
