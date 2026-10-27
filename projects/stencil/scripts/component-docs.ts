/**
 * Writes each component's own docs next to its build output, in
 * dist/collection/components/<tag>/, so an agent (or the docs site) reads one
 * component without loading the 2 MB dist/documentation.json:
 *
 *   AGENTS.md            what it is + its API (props with allowed values, events,
 *                        methods, slots, parts, CSS custom properties)
 *   examples.md          correct usage        (usage/2. Examples.md)
 *   mistakes.md          mistakes to avoid    (usage/3. Mistakes.md)
 *   documentation.json   its docs-json entry, same shape as dist/documentation.json
 *
 * It first moves the public / internal mark of each CSS custom property from its
 * description into the fields of dist/documentation.json (scripts/style-contract-lib.ts),
 * so magma.api.txt and the docs written here read the contract; a description that tries
 * the mark and misses it fails the build. It also rewrites the usage links of
 * dist/documentation.json for the shipped layout (relative to the component's folder),
 * It gives each component the id of its Storybook docs page (`storybook`) and the file the
 * address of the published Storybook (scripts/story-titles-lib.ts), since the ids follow
 * neither the tags nor always the titles (#1148).
 *
 * It then checks that every relative link of the shipped agent docs - the per-component
 * ones and the AGENTS.md + agents/ of the three entry-point packages - resolves inside
 * the package. A broken link fails the build.
 *
 * Runs after the stencil build (it reads dist/documentation.json); the shared
 * fragments it links are written before the build by sync-agent-docs.ts.
 *
 * Run from the stencil package dir:  npm run build.component-docs
 */
import fs from 'fs';
import path from 'path';
import {
  COMPONENT_DOCS_DIR,
  brokenLinks,
  componentDocsJson,
  renderComponentAgentsMd,
  renderUsageFile,
  rewriteUsageEntries,
  type DocsComponent,
} from './agent-docs-lib';
import { COMPONENTS_DIR } from './meta';
import { markStyles } from './style-contract-lib';
import { readComponentStories, STORYBOOK_URL, storybookDocsIds } from './story-titles-lib';

const STENCIL_DIR = process.cwd();
const DOCS_JSON = path.join(STENCIL_DIR, 'dist', 'documentation.json');
const COMPONENTS_OUT = path.join(STENCIL_DIR, COMPONENT_DOCS_DIR);

/** Package roots whose AGENTS.md + agents/ are checked, relative to the stencil package. */
const PACKAGES = ['.', '../stencil-react', '../stencil-angular/magma-angular'];

interface DocsJson {
  timestamp?: string;
  compiler?: unknown;
  /** The published Storybook: a component's docs page opens at `?path=/docs/<storybook>`. */
  storybook?: string;
  components: DocsComponent[];
  [key: string]: unknown;
}

function writeComponentDocs(docs: DocsJson, version: string): number {
  for (const component of docs.components) {
    const dir = path.join(COMPONENTS_OUT, component.tag);
    fs.mkdirSync(dir, { recursive: true });
    const usage = component.usage ?? {};

    fs.writeFileSync(
      path.join(dir, 'AGENTS.md'),
      renderComponentAgentsMd(component, version, docs.storybook),
    );
    for (const [key, file, title] of [
      ['2. Examples', 'examples.md', 'examples'],
      ['3. Mistakes', 'mistakes.md', 'mistakes'],
    ] as const) {
      const target = path.join(dir, file);
      if (usage[key]?.trim())
        fs.writeFileSync(target, renderUsageFile(component.tag, title, usage[key]));
      else fs.rmSync(target, { force: true });
    }
    const single = {
      timestamp: docs.timestamp,
      compiler: docs.compiler,
      storybook: docs.storybook,
      components: [componentDocsJson(component)],
    };
    fs.writeFileSync(path.join(dir, 'documentation.json'), JSON.stringify(single, null, 2) + '\n');
  }
  return docs.components.length;
}

/** Every shipped agent doc, with the resolver for its relative links. */
function shippedDocs(): { file: string; root: string; resolve: (link: string) => string }[] {
  const out: { file: string; root: string; resolve: (link: string) => string }[] = [];
  for (const pkg of PACKAGES) {
    const root = path.resolve(STENCIL_DIR, pkg);
    // in node_modules a wrapper's ../../magma/ is the installed magma package; here it is this one
    const installedMagma = path.resolve(root, '..', 'magma');
    const files = [path.join(root, 'AGENTS.md')];
    const agentsDir = path.join(root, 'agents');
    if (fs.existsSync(agentsDir))
      for (const f of fs.readdirSync(agentsDir))
        if (f.endsWith('.md')) files.push(path.join(agentsDir, f));
    for (const file of files) {
      out.push({
        file,
        root,
        resolve: (link) => {
          const resolved = path.resolve(path.dirname(file), link);
          return pkg !== '.' && resolved.startsWith(installedMagma + path.sep)
            ? path.join(STENCIL_DIR, path.relative(installedMagma, resolved))
            : resolved;
        },
      });
    }
  }
  for (const tag of fs.readdirSync(COMPONENTS_OUT)) {
    for (const f of ['AGENTS.md', 'examples.md', 'mistakes.md']) {
      const file = path.join(COMPONENTS_OUT, tag, f);
      if (fs.existsSync(file))
        out.push({
          file,
          root: STENCIL_DIR,
          resolve: (link) => path.resolve(path.dirname(file), link),
        });
    }
  }
  return out;
}

function checkLinks(): string[] {
  const errors: string[] = [];
  for (const { file, root, resolve } of shippedDocs()) {
    if (!fs.existsSync(file)) {
      errors.push(`${path.relative(STENCIL_DIR, file)}: missing (run npm run sync.agent-docs)`);
      continue;
    }
    // a wrapper may link into the magma package it depends on, nowhere else
    const roots = root === STENCIL_DIR ? [STENCIL_DIR] : [root, STENCIL_DIR];
    for (const link of brokenLinks(fs.readFileSync(file, 'utf8'), resolve, roots, fs.existsSync))
      errors.push(`${path.relative(STENCIL_DIR, file)}: ${link}`);
  }
  return errors;
}

function main(): void {
  if (!fs.existsSync(DOCS_JSON)) {
    console.error(
      `Cannot read ${path.relative(STENCIL_DIR, DOCS_JSON)}: run the stencil build first.`,
    );
    process.exit(1);
  }
  const docs: DocsJson = JSON.parse(fs.readFileSync(DOCS_JSON, 'utf8'));
  const version: string = JSON.parse(
    fs.readFileSync(path.join(STENCIL_DIR, 'package.json'), 'utf8'),
  ).version;

  const markErrors: string[] = [];
  for (const component of docs.components) {
    const { styles, errors } = markStyles(component.styles ?? []);
    component.styles = styles;
    for (const e of errors) markErrors.push(`${component.tag} ${e}`);
  }
  if (markErrors.length) {
    console.error(
      `${markErrors.length} CSS custom property mark(s) to fix in the @prop of the sheets:`,
    );
    for (const e of markErrors) console.error(`  ${e}`);
    process.exit(1);
  }

  const storybookIds = storybookDocsIds(readComponentStories(COMPONENTS_DIR).pages);
  const unlisted = docs.components.filter(({ tag }) => !storybookIds.has(tag));
  if (unlisted.length) {
    console.error(
      `${unlisted.length} component(s) with no Storybook page of their own (a stories file or an MDX page named after the tag in <tag>/test/):`,
    );
    for (const { tag } of unlisted) console.error(`  ${tag}`);
    process.exit(1);
  }
  docs.storybook = STORYBOOK_URL;
  for (const component of docs.components) component.storybook = storybookIds.get(component.tag);

  const count = writeComponentDocs(docs, version);
  for (const component of docs.components) component.usage = rewriteUsageEntries(component.usage);
  fs.writeFileSync(DOCS_JSON, JSON.stringify(docs, null, 2) + '\n');
  console.log(`component docs written -> ${count} components in ${COMPONENT_DOCS_DIR}/<tag>/`);

  const errors = checkLinks();
  if (errors.length) {
    console.error(`${errors.length} broken link(s) in the shipped agent docs:`);
    for (const e of errors) console.error(`  ${e}`);
    process.exit(1);
  }
  console.log('shipped agent docs: every relative link resolves inside its package');
}

main();
