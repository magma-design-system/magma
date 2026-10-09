/**
 * Writes each component's own docs next to its build output, in
 * dist/collection/components/<tag>/, so an agent (or the docs site) reads one
 * component without loading the 2 MB dist/documentation.json:
 *
 *   AGENTS.md            what it is + its API (props with allowed values, events,
 *                        methods, slots, parts, CSS custom properties)
 *   pattern.md           correct usage        (usage/2. Pattern.md)
 *   antipattern.md       mistakes to avoid    (usage/3. Antipattern.md)
 *   documentation.json   its docs-json entry, same shape as dist/documentation.json
 *
 * It also rewrites the usage links of dist/documentation.json for the shipped layout
 * (relative to the component's folder), then checks that every relative link of the
 * shipped agent docs - the per-component ones and the AGENTS.md + agents/ of the
 * three entry-point packages - resolves inside the package. A broken link fails the
 * build.
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

const STENCIL_DIR = process.cwd();
const DOCS_JSON = path.join(STENCIL_DIR, 'dist', 'documentation.json');
const COMPONENTS_OUT = path.join(STENCIL_DIR, COMPONENT_DOCS_DIR);

/** Package roots whose AGENTS.md + agents/ are checked, relative to the stencil package. */
const PACKAGES = ['.', '../stencil-react', '../stencil-angular/magma-angular'];

interface DocsJson {
  timestamp?: string;
  compiler?: unknown;
  components: DocsComponent[];
  [key: string]: unknown;
}

function writeComponentDocs(docs: DocsJson, version: string): number {
  for (const component of docs.components) {
    const dir = path.join(COMPONENTS_OUT, component.tag);
    fs.mkdirSync(dir, { recursive: true });
    const usage = component.usage ?? {};

    fs.writeFileSync(path.join(dir, 'AGENTS.md'), renderComponentAgentsMd(component, version));
    for (const [key, file, title] of [
      ['2. Pattern', 'pattern.md', 'patterns'],
      ['3. Antipattern', 'antipattern.md', 'anti-patterns'],
    ] as const) {
      const target = path.join(dir, file);
      if (usage[key]?.trim())
        fs.writeFileSync(target, renderUsageFile(component.tag, title, usage[key]));
      else fs.rmSync(target, { force: true });
    }
    const single = {
      timestamp: docs.timestamp,
      compiler: docs.compiler,
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
    for (const f of ['AGENTS.md', 'pattern.md', 'antipattern.md']) {
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
