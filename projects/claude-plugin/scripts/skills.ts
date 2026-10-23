/*
  The skills of the Magma plugin: templates/<name>.md filled with what they list, written to
  skills/<name>/SKILL.md (#1114). What a skill lists comes from where it is decided, never
  from a copy kept by hand:
  - the package of each target: the "Pick your target" table of docs/agents/SPEC.md;
  - the tools of the magma MCP server: their names and descriptions in projects/lint;
  - the rules of the lint: the first sentence of each rule in docs/agents/lint.md;
  - the codemod: the name and the command of projects/codemod/package.json.

    tsx scripts/skills.ts write   regenerate the skills
    tsx scripts/skills.ts check   fail when a skill is out of date, or breaks the format

  The check also holds each SKILL.md to the portable keys of the Agent Skills format
  (https://agentskills.io/specification): name equal to its folder, a description of at most
  1024 characters, no key Claude Code alone reads.
*/
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { toolsOf } from '../../lint/src/mcp/server.js';

const PLUGIN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPOSITORY = path.resolve(PLUGIN, '../..');
const TEMPLATES = path.join(PLUGIN, 'templates');
const SKILLS = path.join(PLUGIN, 'skills');

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

const values = (): Record<string, string> => {
  // the package of each target, from the install SPEC
  const targets = tableAfter(read('docs/agents/SPEC.md'), '## Pick your target').map(
    ([target, pkg]) => `| ${target} | ${pkg} |`,
  );
  // the tools of the server: their objects need no data until they are called
  const tools = toolsOf({ root: REPOSITORY, settings: {} }).map(
    ({ name, description }) => `| \`${name}\` | ${sentence(description)} |`,
  );
  // the rules of the lint, from the section of each one in the consumer guide
  const lint = read('docs/agents/lint.md');
  const rules = [...lint.matchAll(/^### ([a-z-]+)\n\n([\s\S]*?)\n\n/gm)].map(
    ([, rule, text]) => `| \`magma/${rule}\` | ${sentence(text!)} |`,
  );
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
    codemod: codemod.name,
    codemodBin: Object.keys(codemod.bin)[0]!,
  };
};

/** Every skill, by its file: the template with its values, and a note on where it comes from. */
export const renderSkills = (): Map<string, string> => {
  const filled = values();
  const skills = new Map<string, string>();
  for (const file of readdirSync(TEMPLATES)
    .filter((one) => one.endsWith('.md'))
    .sort()) {
    const name = file.slice(0, -3);
    const template = readFileSync(path.join(TEMPLATES, file), 'utf8');
    const text = template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
      if (!(key in filled)) throw new Error(`templates/${file}: no value for {{${key}}}`);
      return filled[key]!;
    });
    const [, frontmatter, body] = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(text) ?? [];
    if (!frontmatter) throw new Error(`templates/${file}: no frontmatter`);
    const note = `<!-- Generated from projects/claude-plugin/templates/${file} by scripts/skills.ts: edit the template. -->`;
    skills.set(path.join(SKILLS, name, 'SKILL.md'), `---\n${frontmatter}\n---\n\n${note}\n${body}`);
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
    console.info(`${skills.size} skills written in ${path.relative(REPOSITORY, SKILLS)}`);
    return;
  }
  if (mode !== 'check') throw new Error('Usage: tsx scripts/skills.ts write|check');
  const errors: string[] = [];
  for (const [file, text] of skills) {
    const folder = path.basename(path.dirname(file));
    if (!existsSync(file) || readFileSync(file, 'utf8') !== text)
      errors.push(`${folder}: out of date, run nx run claude-plugin:build`);
    errors.push(...formatErrors(folder, text));
  }
  const extra = readdirSync(SKILLS).filter(
    (folder) => !skills.has(path.join(SKILLS, folder, 'SKILL.md')),
  );
  for (const folder of extra) errors.push(`skills/${folder}: no template generates it`);
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
  console.info(`OK - ${skills.size} skills up to date and in the Agent Skills format`);
};

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) main();
