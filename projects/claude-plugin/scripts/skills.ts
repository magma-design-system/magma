/*
  The skills of the Magma plugin: templates/<name>.md filled with what they list, written to
  skills/<name>/SKILL.md (#1114), and each file of a folder templates/<name>/ written at the same
  place in the skill, such as the references a path of it reads on demand (#1581). What a skill
  lists comes from where it is decided, never from a copy kept by hand:
  - the package of each target: the "Pick your target" table of docs/agents/SPEC.md;
  - the tools of the magma MCP server: their names and descriptions in projects/mcp;
  - the rules of the lint: the first sentence of each rule in docs/agents/lint.md;
  - the rules every path follows: the rule in bold that opens each item of
    docs/agents/mistakes.md, with the rules of the lint the item names;
  - the codemod: the name and the command of projects/codemod/package.json;
  - the table need -> component (#1615): the `4. When to use.md` of each component
    (projects/stencil/src/components/<tag>/usage/), read with the lint core, its category from the
    `@category` of the component and the table "Categories" of docs/COMPONENTS.md, the patterns
    from docs/agents/patterns/. A template whose path holds `[category]` is written once per
    category, with the values of that category.

    nx run claude-plugin:build    regenerate the skills (tsx scripts/skills.ts write)
    nx run claude-plugin:check    fail when a skill is out of date, or breaks the format

  Both run tsx with the tsconfig of projects/mcp: its paths take the imports of the lint the
  server makes, through the exports of magma, to the sources of projects/lint.

  The check also holds each SKILL.md to the portable keys of the Agent Skills format
  (https://agentskills.io/specification): name equal to its folder, a description of at most
  1024 characters, no key Claude Code alone reads.
*/
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  answersOf,
  parseWhenToUse,
  readPatternDir,
  type Pattern,
} from '@maggioli-design-system/magma/lint';
import { toolsOf } from '../../mcp/src/server.js';
import {
  CATEGORY_SLOT,
  categoriesOf,
  commonRules,
  filesUnder,
  needsByCategory,
  needTable,
  taxonomyOf,
  templateTargets,
  writtenList,
  writtenSentence,
  type NeedFile,
} from './skill-files.js';

const PLUGIN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPOSITORY = path.resolve(PLUGIN, '../..');
const TEMPLATES = path.join(PLUGIN, 'templates');
const SKILLS = path.join(PLUGIN, 'skills');
const COMPONENTS = 'projects/stencil/src/components';

/** The frontmatter keys of the Agent Skills format: what every client that reads skills understands. */
const PORTABLE = new Set([
  'name',
  'description',
  'license',
  'compatibility',
  'metadata',
  'allowed-tools',
]);

const read = (file: string) => readFileSync(path.join(REPOSITORY, file), 'utf8');

/** The first sentence of a paragraph, on one line, without its links (relative to a guide, they break in a skill). */
const sentence = (text: string) => {
  const flat = text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
  const end = flat.search(/\.(\s|$)/);
  return end === -1 ? flat : flat.slice(0, end + 1);
};

/** The rows of the first markdown table after a heading. */
const tableAfter = (markdown: string, heading: string): string[][] => {
  const start = markdown.indexOf(`\n${heading}\n`);
  if (start === -1) throw new Error(`No "${heading}" heading`);
  const lines = markdown.slice(start).split('\n');
  const first = lines.findIndex((line) => line.startsWith('|'));
  const after = lines.slice(first).findIndex((line) => !line.startsWith('|'));
  // the header and the separator are not rows
  return lines.slice(first + 2, after === -1 ? undefined : first + after).map((line) =>
    line
      .split('|')
      .slice(1, -1)
      .map((cell) => cell.trim()),
  );
};

/**
  The table need -> component of each category (#1615), read from the sources, without a build:
  the components are the folders `mds-*` of projects/stencil/src/components, as the stencil
  scripts list them (readComponentStories of story-titles-lib.ts); a `4. When to use.md` with a
  problem of its format stops the build, as check.usage-docs would.
*/
const componentNeeds = () => {
  const categories = categoriesOf(read('docs/COMPONENTS.md'), 'docs/COMPONENTS.md');
  const tags = readdirSync(path.join(REPOSITORY, COMPONENTS), { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith('mds-'))
    .map(({ name }) => name)
    .sort();
  const taxonomy = new Map(
    tags.map((tag) => [tag, taxonomyOf(read(`${COMPONENTS}/${tag}/${tag}.tsx`))] as const),
  );
  const known = {
    tags: new Set(tags),
    patterns: new Set(
      readPatternDir<Pattern>(path.join(REPOSITORY, 'docs/agents/patterns')).map(
        ({ data }) => data.id,
      ),
    ),
  };
  const files = new Map<string, NeedFile>();
  for (const tag of tags) {
    const file = `${COMPONENTS}/${tag}/usage/4. When to use.md`;
    if (!existsSync(path.join(REPOSITORY, file))) continue;
    const { useFor, notFor, problems } = parseWhenToUse(read(file));
    if (problems.length)
      throw new Error(
        `${file}:${problems[0]!.line}: ${problems[0]!.message} (nx run stencil:check.usage-docs)`,
      );
    files.set(tag, {
      useFor: useFor.map(({ text }) => ({ text })),
      notFor: notFor.map((line) => ({
        need: line.need,
        answer: line.text.slice(line.text.indexOf(': ') + 2),
        answers: answersOf(line, known),
      })),
    });
  }
  const tables = needsByCategory(files, taxonomy, categories);
  return { categories, tables };
};

const values = (): {
  shared: Record<string, string>;
  perCategory: Array<{ id: string; values: Record<string, string> }>;
} => {
  const { categories, tables } = componentNeeds();
  const shared = sharedValues();
  shared.componentCategories = categories
    .map(
      ({ id, holds }) =>
        `- [\`${id}\`](components/${id}.md): ${holds}. In the table: ${writtenList(tables.get(id)!)}.`,
    )
    .join('\n');
  return {
    shared,
    perCategory: categories.map(({ id, holds }) => ({
      id,
      values: {
        category: id,
        categoryHolds: holds,
        categoryTable: needTable(tables.get(id)!),
        categoryWritten: writtenSentence(tables.get(id)!),
      },
    })),
  };
};

const sharedValues = (): Record<string, string> => {
  // the package of each target, from the install SPEC
  const targets = tableAfter(read('docs/agents/SPEC.md'), '## Pick your target').map(
    ([target, pkg]) => `| ${target} | ${pkg} |`,
  );
  // the tools of the server: their objects need no data until they are called
  const tools = toolsOf({ root: REPOSITORY, settings: {} }).map(
    ({ name, description }) => `| \`${name}\` | ${sentence(description)} |`,
  );
  // the rules of the lint, from the section of each one in the consumer guide
  const lint = [...read('docs/agents/lint.md').matchAll(/^### ([a-z-]+)\n\n([\s\S]*?)\n\n/gm)];
  const rules = lint.map(([, rule, text]) => `| \`magma/${rule}\` | ${sentence(text!)} |`);
  if (!rules.length) throw new Error('No rule in docs/agents/lint.md');
  const codemod = JSON.parse(read('projects/codemod/package.json')) as {
    name: string;
    bin: Record<string, string>;
  };
  return {
    arguments: '$ARGUMENTS',
    targets: ['| Target | Package |', '| --- | --- |', ...targets].join('\n'),
    tools: ['| Tool | What it answers |', '| --- | --- |', ...tools].join('\n'),
    rules: ['| Rule | Catches |', '| --- | --- |', ...rules].join('\n'),
    commonRules: commonRules(
      read('docs/agents/mistakes.md'),
      new Set(lint.map(([, rule]) => rule!)),
      'docs/agents/mistakes.md',
    ),
    codemod: codemod.name,
    codemodBin: Object.keys(codemod.bin)[0]!,
  };
};

/** Every file of every skill, by its path: the template with its values, and a note on where it comes from. */
export const renderSkills = (): Map<string, string> => {
  const { shared, perCategory } = values();
  const skills = new Map<string, string>();
  for (const { template: file, target: written } of templateTargets(TEMPLATES)) {
    const template = readFileSync(path.join(TEMPLATES, file), 'utf8');
    const once = written.includes(CATEGORY_SLOT)
      ? perCategory.map(({ id, values: own }) => ({
          target: written.replace(CATEGORY_SLOT, id),
          filled: { ...shared, ...own },
          from: ' and the usage/4. When to use.md of the components',
        }))
      : [{ target: written, filled: shared, from: '' }];
    if (/\[[^\]]*\]/.test(written.replace(CATEGORY_SLOT, '')))
      throw new Error(`templates/${file}: only ${CATEGORY_SLOT} is written once per item`);
    for (const { target, filled, from } of once) {
      const text = template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
        if (!(key in filled)) throw new Error(`templates/${file}: no value for {{${key}}}`);
        return filled[key]!;
      });
      const note = from
        ? `<!-- Generated from projects/claude-plugin/templates/${file}${from} by scripts/skills.ts: edit those. -->`
        : `<!-- Generated from projects/claude-plugin/templates/${file} by scripts/skills.ts: edit the template. -->`;
      if (!target.endsWith('/SKILL.md')) {
        skills.set(path.join(SKILLS, target), `${note}\n\n${text}`);
        continue;
      }
      const [, frontmatter, body] = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(text) ?? [];
      if (!frontmatter) throw new Error(`templates/${file}: no frontmatter`);
      skills.set(path.join(SKILLS, target), `---\n${frontmatter}\n---\n\n${note}\n${body}`);
    }
  }
  return skills;
};

/** What breaks the Agent Skills format in a SKILL.md, by its folder. */
export const formatErrors = (folder: string, text: string): string[] => {
  const errors: string[] = [];
  const frontmatter = /^---\n([\s\S]*?)\n---\n/.exec(text)?.[1];
  if (!frontmatter) return [`${folder}: no frontmatter`];
  const keys = new Map<string, string>();
  for (const line of frontmatter.split('\n'))
    if (/^[a-z-]+:/.test(line))
      keys.set(line.slice(0, line.indexOf(':')), line.slice(line.indexOf(':') + 1).trim());
  for (const key of keys.keys())
    if (!PORTABLE.has(key))
      errors.push(`${folder}: "${key}" is not a key of the Agent Skills format`);
  const name = keys.get('name') ?? '';
  if (name !== folder) errors.push(`${folder}: name "${name}" is not the name of its folder`);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name) || name.length > 64)
    errors.push(
      `${folder}: name "${name}" is not lowercase words joined by hyphens, at most 64 characters`,
    );
  const description = keys.get('description') ?? '';
  if (!description || description.length > 1024)
    errors.push(
      `${folder}: the description is empty or longer than 1024 characters (${description.length})`,
    );
  if ((keys.get('compatibility') ?? '').length > 500)
    errors.push(`${folder}: compatibility is longer than 500 characters`);
  if (/[\u0080-\uFFFF]/.test(text)) errors.push(`${folder}: non-ASCII characters`);
  return errors;
};

const main = () => {
  const mode = process.argv[2];
  const skills = renderSkills();
  if (mode === 'write') {
    for (const [file, text] of skills) {
      mkdirSync(path.dirname(file), { recursive: true });
      writeFileSync(file, text);
    }
    console.info(`${skills.size} files written in ${path.relative(REPOSITORY, SKILLS)}`);
    return;
  }
  if (mode !== 'check') throw new Error('Usage: tsx scripts/skills.ts write|check');
  const errors: string[] = [];
  for (const [file, text] of skills) {
    const relative = path.relative(SKILLS, file).split(path.sep).join('/');
    if (!existsSync(file) || readFileSync(file, 'utf8') !== text)
      errors.push(`${relative}: out of date, run nx run claude-plugin:build`);
    if (path.basename(file) === 'SKILL.md')
      errors.push(...formatErrors(path.basename(path.dirname(file)), text));
    else if (/[\u0080-\uFFFF]/.test(text)) errors.push(`${relative}: non-ASCII characters`);
  }
  for (const file of filesUnder(SKILLS))
    if (!skills.has(path.join(SKILLS, file)))
      errors.push(`skills/${file}: no template generates it`);
  // the marketplace of the repository points at this plugin
  const marketplace = JSON.parse(read('.claude-plugin/marketplace.json')) as {
    plugins: Array<{ name: string; source: string }>;
  };
  for (const { name, source } of marketplace.plugins)
    if (!existsSync(path.join(REPOSITORY, source, '.claude-plugin/plugin.json')))
      errors.push(
        `.claude-plugin/marketplace.json: the plugin ${name} has no plugin.json at ${source}`,
      );
  if (errors.length) {
    console.error(errors.map((error) => `  ${error}`).join('\n'));
    process.exitCode = 1;
    return;
  }
  const count = [...skills.keys()].filter((file) => path.basename(file) === 'SKILL.md').length;
  console.info(
    `OK - ${count} skills (${skills.size} files) up to date and in the Agent Skills format`,
  );
};

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) main();
