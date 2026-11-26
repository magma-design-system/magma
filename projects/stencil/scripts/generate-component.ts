/**
 * Scaffolds a Magma component (#1499): the files a component of this repository starts from,
 * written from template/component and template/usage, so that it follows SPEC.md from its first
 * build. The sheet declares on :host the design decisions the tokens feed into it, with the
 * spacing written in the rules ("The design decisions on :host"), next to its fouc and pref-*
 * sheets; the component reflects the preferences; test/ holds a Vitest e2e and the stories file
 * with its States story, or, for a part of a compound, the MDX page of its usage docs; usage/
 * holds the three files of the templates. No prompt: it runs under Nx and under an agent, which a
 * TTY prompt would hang.
 *
 *   nx run stencil:generate mds-name --category <id>    a component that stands alone
 *   nx run stencil:generate mds-name --parent <tag>     a part of a compound
 *
 * What to do next is printed at the end; the skill /magma-dev:component-new walks through it.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import Handlebars from 'handlebars';
import { COMPONENT_CATEGORIES, USAGE_FILES } from './agent-docs-lib';
import {
  componentNames,
  partTitle,
  positionals,
  readOption,
  storyTitleOf,
} from './generate-component-lib';
import { COMPONENTS_DIR, PROJECT_DIR, TEMPLATES_DIR } from './meta';

const fail = (message: string): never => {
  console.error(message);
  process.exit(1);
};

const args = process.argv.slice(2);
const [tag] = positionals(args, ['category', 'parent']);
const category = readOption(args, 'category');
const parent = readOption(args, 'parent');
const categories = COMPONENT_CATEGORIES.map(({ id }) => id).join(', ');
const usage = `nx run stencil:generate mds-<name> --category <${categories}> | --parent <tag>`;

if (!tag || !/^mds-[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(tag)) {
  fail(`A tag in kebab-case with the mds- prefix: ${usage}`);
}
if (existsSync(join(COMPONENTS_DIR, tag))) {
  fail(`${tag} exists already in ${relative(PROJECT_DIR, COMPONENTS_DIR)}`);
}
if ((category === undefined) === (parent === undefined)) {
  fail(`One of --category, for a component that stands alone, and --parent, for a part: ${usage}`);
}

const names = componentNames(tag);
let title = '';
let taxonomy = '';
if (category !== undefined) {
  const found = COMPONENT_CATEGORIES.find(({ id }) => id === category);
  if (!found) {
    fail(`--category ${category} is not one of ${categories} (docs/COMPONENTS.md, "Categories")`);
  } else {
    title = `UI / ${found.title} / ${names.name}`;
    taxonomy = `@category ${category}`;
  }
} else if (parent !== undefined) {
  const parentTitle = existsSync(join(COMPONENTS_DIR, parent))
    ? storyTitleOf(join(COMPONENTS_DIR, parent, 'test'), parent)
    : undefined;
  if (!parentTitle) {
    fail(`--parent ${parent}: no component with a Storybook page of its own to put ${tag} under`);
  } else {
    title = partTitle(parentTitle, parent, tag);
    taxonomy = `@parent ${parent}`;
  }
}

// the name on its page: the last word of its title (`Cell` for `UI / Data / Table / Cell`)
const pageName = title.split(' / ').at(-1);
const data = { ...names, curly: '{', endCurly: '}', pageName, tag, taxonomy, title };
// the data of template/usage, as generate-usage.ts compiles it
const usageData = {
  capitalizedComponentName: names.className,
  componentName: tag,
  componentNameWithNoPrefix: names.short,
};
const files: [template: string, output: string][] = [
  ['component/component.tsx.hbs', `${tag}.tsx`],
  ['component/component.css.hbs', `${tag}.css`],
  ['component/css/fouc.css.hbs', `css/${tag}-fouc.css`],
  ['component/css/pref-animation.css.hbs', `css/${tag}-pref-animation.css`],
  ['component/css/pref-contrast.css.hbs', `css/${tag}-pref-contrast.css`],
  ['component/css/pref-mode.css.hbs', `css/${tag}-pref-mode.css`],
  ['component/test/e2e.ts.hbs', `test/${tag}.e2e.ts`],
  category !== undefined
    ? ['component/test/stories.tsx.hbs', `test/${tag}.stories.tsx`]
    : ['component/test/part.mdx.hbs', `test/${tag}.mdx`],
  ...USAGE_FILES.map((stem): [string, string] => [`usage/${stem}.md.hbs`, `usage/${stem}.md`]),
];

const dir = join(COMPONENTS_DIR, tag);
for (const [template, output] of files) {
  const source = readFileSync(join(TEMPLATES_DIR, template), 'utf8');
  const values = template.startsWith('usage/') ? usageData : data;
  mkdirSync(dirname(join(dir, output)), { recursive: true });
  writeFileSync(join(dir, output), Handlebars.compile(source, { noEscape: true })(values));
  console.log(`  ${relative(PROJECT_DIR, join(dir, output))}`);
}

const states =
  category !== undefined
    ? 'the States story with every state'
    : `its states in the States story of ${parent}`;
console.log(`
${tag}: scaffolded, ${taxonomy}, its Storybook page "${title}". Next (the skill /magma-dev:component-new):
  1. the description above @Component, its props, events and parts, each with its JSDoc;
  2. its design decisions as knobs on :host in ${tag}.css, each with its @prop and named in
     the order of SPEC.md (npm run lint.css holds both: magma/host-knobs); the spacing in the
     rules; delete the pref-* sheets it does not refine, with their @import;
  3. ${states}, and a Vitest test for every behaviour;
  4. the usage docs in usage/ (SPEC.md, "Per-component usage docs");
  5. nx run stencil:build, then the checks of SPEC.md and the preview of the pattern on the build.`);
