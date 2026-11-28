/*
  The parts of scripts/skills.ts that read only files, without the MCP server, so the tests load
  them alone (#1581): which template writes which file of a skill, the rules every path of a
  skill follows, taken from the guide that decides them, and the table need -> component of the
  skill ui, one file per category of the components (#1615), taken from their usage files.
*/
import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';

/** Every file under a folder, relative to it, with forward slashes, sorted. */
export const filesUnder = (dir: string): string[] =>
  readdirSync(dir, { recursive: true, encoding: 'utf8' })
    .filter((file) => statSync(path.join(dir, file)).isFile())
    .map((file) => file.split(path.sep).join('/'))
    .sort();

/**
  What each template writes, as paths relative to the folder of the templates and to the folder
  of the skills: `<name>.md` is the SKILL.md of the skill `<name>`, and a file of the folder
  `<name>/` is the file at the same place in that skill, such as `ui/references/compose.md`.
*/
export const templateTargets = (templates: string): Array<{ template: string; target: string }> => {
  const files = filesUnder(templates);
  const skills = new Set(
    files.filter((file) => !file.includes('/')).map((file) => file.slice(0, -3)),
  );
  const targets = files.map((template) => {
    if (!template.endsWith('.md'))
      throw new Error(`templates/${template}: not a Markdown template`);
    const [name, ...rest] = template.split('/');
    if (!rest.length) return { template, target: `${name!.slice(0, -3)}/SKILL.md` };
    if (!skills.has(name!))
      throw new Error(`templates/${template}: no templates/${name}.md for its skill`);
    return { template, target: template };
  });
  const seen = new Set<string>();
  for (const { template, target } of targets) {
    if (seen.has(target))
      throw new Error(`templates/${template}: another template writes skills/${target}`);
    seen.add(target);
  }
  return targets;
};

const unlink = (text: string) => text.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');

/**
  The rules every path follows, as a Markdown list: the rule in bold that opens each item of a
  guide (docs/agents/mistakes.md), one line each, followed by the rules of the lint the item
  names (`magma/<rule>`), which catch it, in full or in part. An item without its rule in bold,
  or naming a rule the lint does not have, stops the build: the list is only as good as the
  guide it comes from.
*/
export const commonRules = (
  guide: string,
  lintRules: ReadonlySet<string>,
  file: string,
): string => {
  const items: string[] = [];
  for (const line of guide.split('\n')) {
    if (line.startsWith('- ')) items.push(line);
    else if (items.length && line.startsWith('  ')) items[items.length - 1] += ` ${line.trim()}`;
    else if (items.length && line.trim()) break;
  }
  if (!items.length) throw new Error(`${file}: no item`);
  return items
    .map((item) => {
      const rule = /^- \*\*(.+?)\*\*/.exec(item)?.[1];
      if (!rule)
        throw new Error(
          `${file}: the item "${item.slice(2, 62)}..." does not open with its rule in bold`,
        );
      const lint = [...new Set([...item.matchAll(/`magma\/([a-z-]+)`/g)].map(([, name]) => name!))];
      for (const name of lint)
        if (!lintRules.has(name))
          throw new Error(
            `${file}: the item "${rule}" names magma/${name}, not a rule of the lint`,
          );
      const checked = lint.length
        ? ` (lint: ${lint.map((name) => `\`magma/${name}\``).join(', ')})`
        : '';
      return `- ${unlink(rule).replace(/\.$/, '')}${checked}`;
    })
    .join('\n');
};

/** The placeholder of a template path written once per category of the components (#1615). */
export const CATEGORY_SLOT = '[category]';

/** A category of the components: its id and what it holds. */
export interface Category {
  id: string;
  holds: string;
}

/**
  The categories of the components, in their order: the table under "## Categories" of
  docs/COMPONENTS.md, its id in inline code and "What it holds". The guide writes the same list
  as COMPONENT_CATEGORIES of projects/stencil/scripts/agent-docs-lib.ts, which this project does
  not import: an import of stencil would make Nx build it before every target of the plugin
  (`test` depends on `build`, `build` on the builds of its dependencies). A component whose
  category is not a row of the table stops the build (needsByCategory).
*/
export const categoriesOf = (guide: string, file: string): Category[] => {
  const start = guide.indexOf('\n## Categories\n');
  if (start === -1) throw new Error(`${file}: no "## Categories" heading`);
  const lines = guide.slice(start + 1).split('\n');
  const first = lines.findIndex((line) => line.startsWith('|'));
  if (first === -1 || lines.slice(1, first).some((line) => line.startsWith('#')))
    throw new Error(`${file}: no table under "## Categories"`);
  const categories: Category[] = [];
  // the header and the separator are not rows
  for (const line of lines.slice(first + 2)) {
    if (!line.startsWith('|')) break;
    const [id, holds] = line
      .split('|')
      .slice(1, -1)
      .map((cell) => cell.trim());
    const name = /^`([a-z-]+)`$/.exec(id ?? '')?.[1];
    if (!name || !holds)
      throw new Error(
        `${file}: the row "${line.trim()}" of "Categories" is not \`<id>\` | <what it holds>`,
      );
    categories.push({ id: name, holds });
  }
  if (!categories.length) throw new Error(`${file}: no row under "## Categories"`);
  return categories;
};

/** The place of a component in the catalogue: its category, or the parents of a part. */
export interface Taxonomy {
  category?: string;
  parents: string[];
}

/**
  `@category` and `@parent` of a component, from the JSDoc right before its `@Component(`
  decorator: the reading of readTaxonomy in projects/stencil/scripts/agent-docs-lib.ts, which this
  project cannot import (see categoriesOf), where Stencil takes the docs tags from
  (docs/COMPONENTS.md, "Categories").
*/
export const taxonomyOf = (source: string): Taxonomy => {
  const at = source.indexOf('@Component(');
  const before = at < 0 ? '' : source.slice(0, at).trimEnd();
  const jsdoc = before.endsWith('*/') ? before.slice(before.lastIndexOf('/**')) : '';
  const texts = (name: string): string[] =>
    [...jsdoc.matchAll(new RegExp(`^\\s*\\*\\s*@${name}\\s+(.+)$`, 'gm'))].map(([, text]) =>
      text!.trim(),
    );
  return {
    category: texts('category')[0],
    parents: texts('parent').flatMap((text) => text.split(/\s+/)),
  };
};

/**
  The category of a component: its own, or for a part the one of the component its first parent
  leads to, as rootOf of agent-docs-lib.ts walks it. None for a tag that is not a component, a part
  whose parents lead nowhere, or a loop.
*/
export const categoryOf = (
  tag: string,
  taxonomy: ReadonlyMap<string, Taxonomy>,
  seen: Set<string> = new Set(),
): string | undefined => {
  const entry = taxonomy.get(tag);
  if (!entry || seen.has(tag)) return undefined;
  if (!entry.parents.length) return entry.category;
  seen.add(tag);
  return categoryOf(entry.parents[0]!, taxonomy, seen);
};

/** An answer of a `Not for` line, as answersOf of the lint core gives it. */
export interface NeedAnswer {
  kind: 'component' | 'pattern' | 'gap';
  id: string;
}

/** `4. When to use.md` of a component, as parseWhenToUse and answersOf of the lint core read it. */
export interface NeedFile {
  useFor: Array<{ text: string }>;
  notFor: Array<{ need: string; answer: string; answers: NeedAnswer[] }>;
}

/** A row of the table: the need, and what answers it. */
export interface NeedRow {
  need: string;
  use: string;
}

/** The table of a category and the components whose needs it holds. */
export interface CategoryNeeds {
  rows: NeedRow[];
  /** The components of the category that have their `4. When to use.md`, sorted. */
  written: string[];
}

/** A line of a usage file as a cell of a table: on one line, no link, no final period. */
const cell = (text: string) =>
  unlink(text).replace(/\s+/g, ' ').trim().replace(/\.$/, '').replace(/\|/g, '\\|');

/**
  The table need -> component of each category, from the `4. When to use.md` of the components:
  - every `Use it for` line, the need -> the component of the file;
  - every `Not for` line, the need -> what follows its colon, unless each of its answers is a
    component with a file of its own: that file is the place of the need, among its `Use it for`
    lines, so the row would repeat it. What holds it is a heuristic, not a proof:
    check.usage-docs asks the need to share two significant words with one of those lines
    (reciprocityFailures and RECIPROCITY_SHARED_WORDS of
    projects/stencil/scripts/usage-docs-lib.ts). It catches a file that does not cover the need
    at all; a need the other file words another way reaches the table in that file's words.
  A line that names a component and a pattern or `gap` too is a row: the pattern or the gap is
  an answer no `Use it for` line holds. A `Not for` row goes to the category of the first
  component it names, or, when it names only patterns or `gap`, to the one of the component of
  the file. In a table, the rows of each
  component come in the order of the tags, its own lines first, then the rows of each pattern,
  then those of `gap`; a row the same as another is written once. A file of a component with no
  category, a category that is not one of `categories`, or a `Not for` line with no answer stops
  the build: the tables are only as good as the files they come from.
*/
export const needsByCategory = (
  files: ReadonlyMap<string, NeedFile>,
  taxonomy: ReadonlyMap<string, Taxonomy>,
  categories: readonly Category[],
): Map<string, CategoryNeeds> => {
  const ids = new Set(categories.map(({ id }) => id));
  const where = (tag: string, from: string) => {
    const category = categoryOf(tag, taxonomy);
    if (!category)
      throw new Error(`${from}: ${tag} has no @category, and no @parent that leads to one`);
    if (!ids.has(category))
      throw new Error(
        `${from}: the category "${category}" of ${tag} is not a row of "Categories" in docs/COMPONENTS.md`,
      );
    return category;
  };
  const found: Array<
    NeedRow & { category: string; order: [number, string, number, string, number] }
  > = [];
  for (const [tag, file] of [...files].sort(([a], [b]) => a.localeCompare(b))) {
    const from = `${tag}/usage/4. When to use.md`;
    file.useFor.forEach(({ text }, at) =>
      found.push({
        need: cell(text),
        use: `\`${tag}\``,
        category: where(tag, from),
        order: [0, tag, 0, tag, at],
      }),
    );
    file.notFor.forEach(({ need, answer, answers }, at) => {
      if (!answers.length)
        throw new Error(
          `${from}: the Not for "${need}" has no answer (nx run stencil:check.usage-docs)`,
        );
      if (answers.every(({ kind, id }) => kind === 'component' && files.has(id))) return;
      const component = answers.find(({ kind }) => kind === 'component');
      const first = component ?? answers[0]!;
      found.push({
        need: cell(need),
        use: cell(answer),
        category: where(component?.id ?? tag, from),
        order: [{ component: 0, pattern: 1, gap: 2 }[first.kind], first.id, 1, tag, at],
      });
    });
  }
  const compare = (a: (typeof found)[number], b: (typeof found)[number]) => {
    for (let at = 0; at < a.order.length; at++) {
      const [x, y] = [a.order[at]!, b.order[at]!];
      if (x !== y)
        return typeof x === 'number' ? x - (y as number) : String(x).localeCompare(String(y));
    }
    return 0;
  };
  const tables = new Map<string, CategoryNeeds>();
  for (const { id } of categories) {
    const seen = new Set<string>();
    const rows = found
      .filter(({ category }) => category === id)
      .sort(compare)
      .filter(({ need, use }) => !seen.has(`${need}\n${use}`) && seen.add(`${need}\n${use}`))
      .map(({ need, use }) => ({ need, use }));
    const written = [...files.keys()]
      .filter((tag) => taxonomy.get(tag)?.category === id)
      .sort((a, b) => a.localeCompare(b));
    tables.set(id, { rows, written });
  }
  return tables;
};

/** The table of a category as Markdown, or the sentence that says it has no row yet. */
export const needTable = ({ rows }: CategoryNeeds): string =>
  rows.length
    ? [
        '| Need | Use |',
        '| --- | --- |',
        ...rows.map(({ need, use }) => `| ${need} | ${use} |`),
      ].join('\n')
    : 'No need of this category is written yet.';

/** Tags in inline code, joined as a list in a sentence: `a`, `b` and `c`. */
const tagList = (tags: readonly string[]) => {
  const codes = tags.map((tag) => `\`${tag}\``);
  return codes.length < 2 ? codes.join('') : `${codes.slice(0, -1).join(', ')} and ${codes.at(-1)}`;
};

/** The components whose needs a table holds, for the list of the categories, or "none yet". */
export const writtenList = ({ written }: CategoryNeeds): string =>
  written.length ? tagList(written) : 'none yet';

/** What the table of a category holds, as the sentence that opens it. */
export const writtenSentence = ({ written }: CategoryNeeds): string =>
  written.length
    ? `The table holds every need of ${tagList(written)}, and the needs other components send to this category.`
    : 'No component of the category has its needs written yet: the rows are the needs other components send to it.';
