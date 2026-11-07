/*
  The agent context of this repository, held to what it describes (#1306).

  The generated docs have their checks (check.api-snapshot, check.usage-docs, check.patterns,
  claude-plugin:check, check.diagrams). This one holds the context written by hand for the agents
  that work on the repository (`isContext`): AGENTS.md and the root README, the documents of
  docs/, the documents at the root of each project, the project skills of .claude/skills/, the
  instructions and the templates of .github/. Each rule reads what it compares with from where it
  is decided, never from a list kept here:

  - links: every relative link resolves to a tracked file, or to a folder that holds one: GitHub,
    where the docs are read, has nothing else;
  - index: every path of the repository AGENTS.md writes in code resolves, a `{a,b}` to each of
    its names, a `*` or a `<name>` to one at least;
  - commands: every `nx run <project>:<target>` of the context and of the guides of docs/agents/
    names a target of the project graph (`nx graph --file`, as check.diagrams reads it);
  - projects: every project of the graph has its line in "Sub-projects and build order" of
    AGENTS.md, and no other line is there; every project skill is named in AGENTS.md as `/<name>`;
  - counts: a count of the components in figures, three of them ("117 components": a smaller
    number is an example, "two components"), is the number of folders of
    projects/stencil/src/components; a count of tools in the documents of the MCP server
    (`TOOL_COUNTS`) is the number of tools of the server (`toolsOf`), "the other N tools" one less;
  - copies: the commit types and the project scopes docs/COMMITS.md and
    .github/instructions/commit-messages.instructions.md write are those of commitlint.config.js,
    and the count of types docs/COMMITS.md writes is theirs;
  - budget: what every session loads before any task, CLAUDE.md with what it imports and the
    names and descriptions of the project skills, stays within `BUDGET` tokens.

  Left out, and why:
  - the guides of docs/agents/ from the links and the index: the stencil build rewrites their
    links to resolve inside node_modules, next to the files it writes there (agents/components.md,
    agents/patterns.md), and check.usage-docs holds their content;
  - the CHANGELOG.md of each project: the release writes it;
  - a path inside a build output (a `dist` folder): the build writes it, git ignores it.

  What a machine cannot see stays with the skill /context-review (.claude/skills/context-review):
  whether a change needs a new line in a document, whether a document still describes the old
  behaviour, whether a part every session loads belongs in a document read on demand.

    tsx --tsconfig projects/mcp/tsconfig.json scripts/agent-context.ts
                                    fail when the agent context does not match the repository

  The tsconfig of projects/mcp maps the imports of the lint the server makes, as claude-plugin
  does, so the count of its tools comes from `toolsOf` and needs no build.
*/
import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readProjectGraph, sectionOf, type ProjectGraph } from './diagrams.ts';

/**
 * The tokens every session may load before any task: about a fifth above the 5.5k it loaded
 * when this check was written (2026-11-07, #1306), room for a few rules more. Past it, move a
 * section read for one kind of task into a document the index of AGENTS.md routes to.
 */
export const BUDGET = 6500;

/** The documents whose counts of tools are the tools of the MCP server. */
export const TOOL_COUNTS = ['AGENTS.md', 'projects/mcp/README.md', 'docs/agents/mcp.md'];

/** A token counted as four bytes, the usual estimate for English text: the budget guards an order of magnitude, it is no tokenizer. */
export const tokens = (text: string): number => Math.ceil(Buffer.byteLength(text, 'utf8') / 4);

/** Whether a tracked file is context written by hand for the agents that work on the repository. */
export const isContext = (file: string): boolean =>
  /^(AGENTS|CLAUDE|README)\.md$/.test(file) ||
  /^docs\/[^/]+\.md$/.test(file) ||
  (/^projects\/[^/]+\/[^/]+\.md$/.test(file) && !file.endsWith('/CHANGELOG.md')) ||
  /^\.claude\/skills\/.+\.md$/.test(file) ||
  /^\.github\/(instructions\/)?[^/]+\.md$/.test(file);

/** What the check reads of the repository. */
export interface Repository {
  /** The tracked files, relative to the root. */
  files: string[];
  read: (file: string) => string | undefined;
  graph: ProjectGraph;
  /** The number of tools of the MCP server. */
  tools: number;
  /** The `type-enum` and the `custom-scope-enum` of commitlint.config.js, components included. */
  commitlint: { types: string[]; scopes: string[] };
}

/** What the check finds, and what it measures. */
export interface Report {
  errors: string[];
  /** What every session loads, with its tokens. */
  loaded: { files: string[]; tokens: number };
  /** The documents of the context, largest first, with their tokens. */
  largest: Array<[string, number]>;
  links: number;
  commands: number;
}

/** The numbers a document may write in words, by value. */
const NUMBERS = (
  'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen ' +
  'sixteen seventeen eighteen nineteen twenty'
).split(' ');
const numberOf = (word: string) =>
  /^\d+$/.test(word) ? Number(word) : NUMBERS.indexOf(word.toLowerCase());

/** A piece of Markdown without its fenced blocks, so a link written as an example is not read. */
const withoutFences = (markdown: string) =>
  markdown.replace(/^\s*(```|~~~)[\s\S]*?^\s*\1.*$/gm, '');

/** The line a match starts on. */
const lineOf = (text: string, index: number) => text.slice(0, index).split('\n').length;

/** The frontmatter keys of a SKILL.md, each on one line. */
const frontmatter = (text: string): Map<string, string> => {
  const keys = new Map<string, string>();
  const block = /^---\n([\s\S]*?)\n---\n/.exec(text)?.[1] ?? '';
  for (const line of block.split('\n'))
    if (/^[a-z-]+:/.test(line))
      keys.set(line.slice(0, line.indexOf(':')), line.slice(line.indexOf(':') + 1).trim());
  return keys;
};

/** The words in code of the bullet that starts with `label`, continuation lines included. */
const bulletWords = (markdown: string, label: string): string[] | undefined => {
  const lines = markdown.split('\n');
  const start = lines.findIndex((line) => line.startsWith(`- ${label}`));
  if (start < 0) return undefined;
  let end = start + 1;
  while (end < lines.length && /^ {2,}\S/.test(lines[end])) end++;
  return [
    ...lines
      .slice(start, end)
      .join(' ')
      .matchAll(/`([^`]+)`/g),
  ].map((match) => match[1]);
};

/** The names of `list` missing from `copy`, and the names of `copy` not in `list`. */
const compare = (file: string, what: string, copy: string[], list: string[]): string[] => {
  const errors: string[] = [];
  const missing = list.filter((name) => !copy.includes(name));
  const extra = copy.filter((name) => !list.includes(name));
  if (missing.length)
    errors.push(
      `${file}: the ${what} miss ${missing.join(', ')} (commitlint.config.js allows them)`,
    );
  if (extra.length)
    errors.push(
      `${file}: the ${what} name ${extra.join(', ')}, which commitlint.config.js does not allow`,
    );
  return errors;
};

/** What the check finds wrong in the agent context of a repository. */
export const checkContext = (repository: Repository): Report => {
  const { files, read, graph } = repository;
  const errors: string[] = [];
  const tracked = new Set(files);
  const folders = new Set(
    files.flatMap((file) =>
      file
        .split('/')
        .slice(0, -1)
        .map((_, i, parts) => parts.slice(0, i + 1).join('/')),
    ),
  );
  const exists = (at: string) => tracked.has(at) || folders.has(at.replace(/\/$/, ''));
  const context = files.filter(isContext).sort();
  const guides = files.filter((file) => /^docs\/agents\/.+\.md$/.test(file));
  const text = new Map([...context, ...guides].map((file) => [file, read(file) ?? '']));

  // links
  let links = 0;
  for (const file of context) {
    const markdown = withoutFences(text.get(file)!);
    for (const match of markdown.matchAll(/\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
      const target = match[1];
      if (/^[a-z][a-z0-9+.-]*:|^#/i.test(target)) continue;
      const bare = decodeURIComponent(target.split('#')[0].split('?')[0]);
      if (!bare) continue;
      links++;
      const at = bare.startsWith('/')
        ? bare.slice(1)
        : path.posix.normalize(path.posix.join(path.posix.dirname(file), bare));
      if (at.split('/').includes('dist')) continue;
      if (!exists(at))
        errors.push(
          `${file}:${lineOf(markdown, match.index)}: the link ${target} reaches no tracked file`,
        );
    }
  }

  // index
  const agents = text.get('AGENTS.md') ?? '';
  const tops = new Set(files.map((file) => file.split('/')[0]));
  for (const match of agents.matchAll(/`([^`\s]+)`/g)) {
    const written = match[1];
    if (!tops.has(written.split('/')[0]) || !written.includes('/')) continue;
    if (written.split('/').some((part) => part === 'dist' || part === 'node_modules')) continue;
    const braces = /\{([^}]+)\}/.exec(written);
    const each = braces
      ? braces[1].split(',').map((name) => written.replace(braces[0], name))
      : [written];
    for (const one of each) {
      const pattern = new RegExp(
        `^${one
          .replace(/\/$/, '')
          .replace(/[.+?^$()|[\]\\]/g, '\\$&')
          .replace(/<[^>]+>/g, '[^/]+')
          .replace(/\*/g, '[^/]*')}$`,
      );
      if (![...tracked, ...folders].some((at) => pattern.test(at)))
        errors.push(`AGENTS.md:${lineOf(agents, match.index)}: ${one} is not in the repository`);
    }
  }

  // commands
  const targets = new Set(
    Object.entries(graph.nodes).flatMap(([project, node]) =>
      Object.keys(node.data.targets ?? {}).map((target) => `${project}:${target}`),
    ),
  );
  let commands = 0;
  for (const [file, markdown] of text)
    for (const match of markdown.matchAll(/\bnx run ([a-z0-9-]+:[A-Za-z0-9._:-]*[A-Za-z0-9_-])/g)) {
      commands++;
      if (!targets.has(match[1]))
        errors.push(
          `${file}:${lineOf(markdown, match.index)}: nx run ${match[1]} is no target of the project graph`,
        );
    }

  // projects and skills
  const projects = Object.keys(graph.nodes)
    .filter((name) => graph.nodes[name].data.root !== '.')
    .sort();
  const order = /```[^\n]*\n([\s\S]*?)```/.exec(
    sectionOf(agents, 'Sub-projects and build order') ?? '',
  )?.[1];
  if (order === undefined) errors.push('AGENTS.md: no block in "Sub-projects and build order"');
  else {
    const listed = order
      .split('\n')
      .map((line) => line.trim().split(/\s/)[0])
      .filter(Boolean);
    for (const project of projects)
      if (!listed.includes(project))
        errors.push(`AGENTS.md: "Sub-projects and build order" misses ${project}`);
    for (const name of listed)
      if (!projects.includes(name))
        errors.push(`AGENTS.md: "Sub-projects and build order" lists ${name}, not a project`);
  }
  const skills = files.filter((file) => /^\.claude\/skills\/[^/]+\/SKILL\.md$/.test(file)).sort();
  for (const skill of skills) {
    const name = skill.split('/')[2];
    if (!new RegExp(`(^|[\\s\`(,])/${name}\\b`).test(agents))
      errors.push(`AGENTS.md: the project skill /${name} is not named`);
  }

  // counts
  const components = new Set(
    files
      .filter((file) => file.startsWith('projects/stencil/src/components/'))
      .map((file) => file.split('/')[4]),
  );
  for (const [file, markdown] of text)
    for (const match of markdown.matchAll(/\b(\d{3}) (?:web )?components\b/g))
      if (Number(match[1]) !== components.size)
        errors.push(
          `${file}:${lineOf(markdown, match.index)}: "${match[0]}", there are ${components.size}`,
        );
  const count = new RegExp(`\\b(other\\s+)?(\\d+|${NUMBERS.join('|')})\\s+tools\\b`, 'gi');
  for (const file of TOOL_COUNTS) {
    const markdown = text.get(file) ?? '';
    for (const match of markdown.matchAll(count)) {
      const expected = repository.tools - (match[1] ? 1 : 0);
      if (numberOf(match[2]) !== expected)
        errors.push(
          `${file}:${lineOf(markdown, match.index)}: "${match[0]}", the MCP server has ${repository.tools} tools`,
        );
    }
  }

  // copies
  const { types } = repository.commitlint;
  const scopes = repository.commitlint.scopes.filter((scope) => !components.has(scope));
  const commits = text.get('docs/COMMITS.md');
  if (commits !== undefined) {
    const table = [...(sectionOf(commits, 'Types') ?? '').matchAll(/^\| `([^`]+)`/gm)].map(
      (match) => match[1],
    );
    errors.push(...compare('docs/COMMITS.md', 'types of the table', table, types));
    const block = /```[^\n]*\n([\s\S]*?)```/.exec(
      sectionOf(commits, '1. Project scopes (static list)') ?? '',
    )?.[1];
    errors.push(
      ...compare(
        'docs/COMMITS.md',
        'project scopes',
        block?.split(/[\s,]+/).filter(Boolean) ?? [],
        scopes,
      ),
    );
    for (const match of commits.matchAll(/\b(\d+) allowed values\b/g))
      if (Number(match[1]) !== types.length)
        errors.push(
          `docs/COMMITS.md:${lineOf(commits, match.index)}: "${match[0]}", commitlint.config.js allows ${types.length}`,
        );
  }
  const instructions = '.github/instructions/commit-messages.instructions.md';
  const copilot = text.get(instructions);
  if (copilot !== undefined) {
    for (const [label, what, list] of [
      ['Allowed types:', 'types', types],
      ['Project scopes:', 'project scopes', scopes],
    ] as const) {
      const words = bulletWords(copilot, label);
      if (!words) errors.push(`${instructions}: no bullet "- ${label}"`);
      else errors.push(...compare(instructions, what, words, [...list]));
    }
  }

  // budget
  const loaded: string[] = [];
  let size = 0;
  const load = (file: string) => {
    const markdown = read(file);
    if (markdown === undefined || loaded.includes(file)) return;
    loaded.push(file);
    size += tokens(markdown);
    // an import is a line made of `@<path>` alone, the form CLAUDE.md writes
    for (const match of markdown.matchAll(/^@(\S+)\s*$/gm))
      load(path.posix.normalize(path.posix.join(path.posix.dirname(file), match[1])));
  };
  load('CLAUDE.md');
  for (const skill of skills) {
    const keys = frontmatter(read(skill) ?? '');
    size += tokens(`${keys.get('name') ?? ''}: ${keys.get('description') ?? ''}`);
  }
  const what = [...loaded, `${skills.length} skill descriptions`].join(', ');
  if (size > BUDGET)
    errors.push(
      `every session loads ~${size} tokens before any task (${what}), over the budget of ${BUDGET}: move a section read for one task into a document the index of AGENTS.md routes to`,
    );

  const largest = context
    .map((file): [string, number] => [file, tokens(text.get(file)!)])
    .sort((a, b) => b[1] - a[1]);
  return {
    errors,
    loaded: { files: [...loaded, `${skills.length} skill descriptions`], tokens: size },
    largest,
    links,
    commands,
  };
};

const thousands = (value: number) => `${(value / 1000).toFixed(1)}k`;

const main = async () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const { execFileSync } = await import('node:child_process');
  const files = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' })
    .split('\0')
    .filter(Boolean);
  const { toolsOf } = await import('../projects/mcp/src/server.js');
  const config = createRequire(import.meta.url)(path.join(root, 'commitlint.config.js')) as {
    rules: Record<string, [number, string, string[]]>;
  };
  const report = checkContext({
    files,
    read: (file) =>
      existsSync(path.join(root, file)) ? readFileSync(path.join(root, file), 'utf8') : undefined,
    graph: readProjectGraph(root),
    tools: toolsOf({ root, settings: {} }).length,
    commitlint: {
      types: config.rules['type-enum'][2],
      scopes: config.rules['custom-scope-enum'][2],
    },
  });
  if (report.errors.length) {
    console.error(report.errors.map((error) => `  ${error}`).join('\n'));
    process.exitCode = 1;
    return;
  }
  const largest = report.largest
    .slice(0, 5)
    .map(([file, size]) => `${file} ~${thousands(size)}`)
    .join(', ');
  console.info(
    `OK - the agent context matches the repository (${report.links} links, ${report.commands} nx commands); ` +
      `every session loads ~${thousands(report.loaded.tokens)} of ${thousands(BUDGET)} tokens (${report.loaded.files.join(', ')}); ` +
      `the largest documents: ${largest}`,
  );
};

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]))
  void main();
