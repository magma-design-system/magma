/**
 * Guards the component usage docs (src/components/<tag>/usage/*.md) against drift
 * from the code they describe. They ship as pattern.md / antipattern.md next to each
 * component's AGENTS.md, and agents copy their examples verbatim, so a wrong example
 * becomes wrong code in consumer apps.
 *
 * What this checks, outside the INCORRECT half of the antipattern examples (wrong on
 * purpose): every `mds-*` tag, attribute, enumerated value, slot, documented part,
 * event and `--mds-*` property exists in dist/documentation.json; every other custom
 * property exists in the token layer; no palette step (`--tone-*`, `--variant-*`,
 * `--status-*`, raw palette classes) where a semantic role belongs; no raw `--radius-*`
 * (it ignores the corner axis); every icon slug exists; no `="false"` booleans, no
 * self-closed `<mds-* />` (HTML has no self-closing custom elements), no shadow piercing,
 * no `dark:` variants or preference media queries, every fence has a language, no emoji.
 *
 * #815 area 4 fixed the 342 docs against these rules; this keeps them fixed. The rules
 * the docs follow: docs/agents/conventions.md, variants.md, color.md, theming.md.
 *
 * Needs the stencil build (dist/documentation.json, src/fixtures/icons-dictionary.json)
 * and the design-tokens and styles builds (the token layer).
 *
 * Run from the stencil package dir:  npm run check.usage-docs
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { PROJECT_DIR } from './meta';
import { checkUsageDoc, type ApiComponent, type UsageModel } from './usage-docs-lib';

const REPO = join(PROJECT_DIR, '../..');
const COMPONENTS = join(PROJECT_DIR, 'src/components');
/* where the token layer is emitted; Tailwind's own theme counts, as in check-dangling-tokens */
const TOKEN_SOURCES = [
  'projects/design-tokens/dist/css',
  'projects/styles/dist/css',
  'projects/styles/dist/tailwind',
  'node_modules/tailwindcss/theme.css',
];

const walk = (dir: string, ext: RegExp): string[] =>
  readdirSync(dir).flatMap((entry) => {
    const p = join(dir, entry);
    return statSync(p).isDirectory() ? walk(p, ext) : ext.test(p) ? [p] : [];
  });

const need = (path: string, what: string): string => {
  if (!existsSync(path)) {
    console.error(`missing ${relative(REPO, path)} - ${what}`);
    process.exit(2);
  }
  return path;
};

const docs = JSON.parse(
  readFileSync(
    need(join(PROJECT_DIR, 'dist/documentation.json'), 'run the stencil build first'),
    'utf8',
  ),
) as { components: ApiComponent[] };
const icons = JSON.parse(
  readFileSync(
    need(join(PROJECT_DIR, 'src/fixtures/icons-dictionary.json'), 'run the stencil build first'),
    'utf8',
  ),
) as string[];

const tokens = new Set<string>();
for (const rel of TOKEN_SOURCES) {
  const at = need(join(REPO, rel), 'run the design-tokens and styles builds first');
  for (const f of statSync(at).isDirectory() ? walk(at, /\.css$/) : [at]) {
    for (const m of readFileSync(f, 'utf8').matchAll(/(--[\w-]+)\s*:/g)) tokens.add(m[1]);
  }
}

const privateVars = new Set<string>();
for (const f of walk(COMPONENTS, /\.css$/)) {
  for (const m of readFileSync(f, 'utf8').matchAll(/(--mds-[\w-]+)\s*:/g)) privateVars.add(m[1]);
}

const formAssociated = new Set<string>();
for (const c of docs.components) {
  const source = join(COMPONENTS, c.tag, `${c.tag}.tsx`);
  if (existsSync(source) && /formAssociated:\s*true/.test(readFileSync(source, 'utf8')))
    formAssociated.add(c.tag);
}

const model: UsageModel = {
  components: new Map(docs.components.map((c) => [c.tag, c])),
  formAssociated,
  tokens,
  privateVars,
  icons: new Set(icons),
};

let files = 0;
let total = 0;
for (const tag of readdirSync(COMPONENTS).sort()) {
  const dir = join(COMPONENTS, tag, 'usage');
  if (!existsSync(dir)) continue;
  for (const name of readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .sort()) {
    files++;
    const path = join(dir, name);
    const findings = checkUsageDoc(readFileSync(path, 'utf8'), model);
    if (!findings.length) continue;
    total += findings.length;
    console.error(`\n${relative(REPO, path)}`);
    for (const f of findings)
      console.error(`  ${String(f.line).padStart(4)}  ${f.kind.padEnd(22)} ${f.what}`);
  }
}

if (total) {
  console.error(
    `\n${total} problem(s) in the usage docs. The rules: docs/agents/conventions.md, variants.md, color.md, theming.md;` +
      ' the API: each component readme.md.',
  );
  process.exit(1);
}
console.log(
  `OK - ${files} usage docs of ${model.components.size} components match the API and the token layer`,
);
