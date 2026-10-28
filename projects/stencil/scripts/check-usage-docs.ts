/**
 * Guards the component usage docs (src/components/<tag>/usage/*.md) against drift
 * from the code they describe. They ship as pattern.md / antipattern.md next to each
 * component's AGENTS.md, and agents copy their examples verbatim, so a wrong example
 * becomes wrong code in consumer apps.
 *
 * What this checks, outside the INCORRECT half of the antipattern examples (wrong on
 * purpose): every `mds-*` tag, attribute, enumerated value, slot, documented part,
 * event and `--mds-*` property exists in dist/documentation.json, and every `--mds-*` is a
 * public one (an internal one may change in any release, #1095); every other custom
 * property exists in the token layer; no palette step (`--tone-*`, `--variant-*`,
 * `--status-*`, raw palette classes) where a semantic role belongs; no raw `--radius-*`
 * (it ignores the corner axis); every icon slug exists; no `="false"` booleans, no
 * self-closed `<mds-* />` (HTML has no self-closing custom elements), no shadow piercing,
 * no `dark:` variants or preference media queries, every fence has a language, no emoji.
 *
 * The same rules hold for the shared agent guides of docs/agents/, which ship next to them
 * in the three entry-point packages as agents/*.md: a prop or value renamed in a component
 * must not survive in a guide either. A guide also fences commands, JSON and prompts. The
 * bodies of the patterns (docs/agents/patterns/*.md, #1174) are guides too.
 *
 * It also keeps the readme.md of every component free of hand-written text: above the
 * generated part only the title and the generic intro, since the usage files are the only
 * hand-authored docs (#842); and it fails on a prop, event, method, slot, part or documented
 * custom property that ships without a description, which the readme and the shipped
 * AGENTS.md would list with an empty cell (#829), or whose description writes an HTML tag
 * outside inline code, which a Markdown reader drops or renders as an element (#1036).
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
import {
  checkUsageDoc,
  handWrittenReadme,
  rawHtmlMembers,
  undescribedMembers,
  type ApiComponent,
  type DescribedComponent,
  type UsageModel,
} from './usage-docs-lib';

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
) as { components: (ApiComponent & DescribedComponent)[] };
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

let total = 0;
const check = (path: string, guide = false, text = readFileSync(path, 'utf8')): void => {
  const findings = checkUsageDoc(text, model, guide);
  if (!findings.length) return;
  total += findings.length;
  console.error(`\n${relative(REPO, path)}`);
  for (const f of findings)
    console.error(`  ${String(f.line).padStart(4)}  ${f.kind.padEnd(22)} ${f.what}`);
};

let files = 0;
for (const tag of readdirSync(COMPONENTS).sort()) {
  const dir = join(COMPONENTS, tag, 'usage');
  if (!existsSync(dir)) continue;
  for (const name of readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .sort()) {
    files++;
    check(join(dir, name));
  }
}

// the shared guides ship in the three entry-point packages as agents/*.md (sync-agent-docs.ts);
// SPEC.md is the maintainers' spec of those packages and stays in the repository
const GUIDES = join(REPO, 'docs/agents');
const guides = readdirSync(GUIDES)
  .filter((f) => f.endsWith('.md') && f !== 'SPEC.md')
  .sort();
for (const name of guides) check(join(GUIDES, name), true);

// the patterns ship beside them as agents/patterns/*.md: their bodies follow the same rules; the
// frontmatter, data, is held by check.patterns (scripts/check-patterns.ts), so it is blanked
// here, line for line, to keep the line numbers
const PATTERNS = join(GUIDES, 'patterns');
const patterns = existsSync(PATTERNS)
  ? readdirSync(PATTERNS)
      .filter((f) => f.endsWith('.md'))
      .sort()
  : [];
for (const name of patterns) {
  const text = readFileSync(join(PATTERNS, name), 'utf8');
  const front = /^---\n[\s\S]*?\n---\n/.exec(text)?.[0] ?? '';
  check(join(PATTERNS, name), true, front.replace(/[^\n]/g, '') + text.slice(front.length));
}

// the readmes: Stencil keeps what is written above its marker and ships it in documentation.json
const handWritten: string[] = [];
for (const tag of readdirSync(COMPONENTS).sort()) {
  const path = join(COMPONENTS, tag, 'readme.md');
  if (existsSync(path) && handWrittenReadme(tag, readFileSync(path, 'utf8')))
    handWritten.push(relative(REPO, path));
}
if (handWritten.length) {
  console.error(
    `\n${handWritten.length} readme(s) with hand-written text above "Auto Generated Below":\n` +
      handWritten.map((path) => `  ${path}`).join('\n') +
      '\nKeep only the title and the generic intro there: what a component needs goes in its usage/*.md.',
  );
  total += handWritten.length;
}

// the JSDoc of every member: its description in the readme, in AGENTS.md and documentation.json
const undescribed = docs.components.flatMap((c) =>
  undescribedMembers(c).map((member) => `${c.tag} ${member}`),
);
if (undescribed.length) {
  console.error(
    `\n${undescribed.length} API member(s) without a description:\n` +
      undescribed.map((member) => `  ${member}`).join('\n') +
      '\nDescribe each one in its JSDoc; `@part` and `@slot` go in the JSDoc right above `@Component`.',
  );
  total += undescribed.length;
}

// a tag in a description is read as markup by every Markdown reader of the readme and AGENTS.md
const rawHtml = docs.components.flatMap((c) =>
  rawHtmlMembers(c).map((member) => `${c.tag} ${member}`),
);
if (rawHtml.length) {
  console.error(
    `\n${rawHtml.length} API member(s) with an HTML tag outside inline code in the description:\n` +
      rawHtml.map((member) => `  ${member}`).join('\n') +
      '\nWrite the tag as code in the JSDoc: `<input>`, not <input>.',
  );
  total += rawHtml.length;
}

if (total) {
  console.error(
    `\n${total} problem(s) in the usage docs. The rules: docs/agents/conventions.md, variants.md, color.md, theming.md;` +
      ' the API: each component readme.md.',
  );
  process.exit(1);
}
console.log(
  `OK - ${files} usage docs of ${model.components.size} components and ${guides.length} shared agent guides and ${patterns.length} patterns match the API and the token layer, every member of the API has a description, with its tags as code`,
);
