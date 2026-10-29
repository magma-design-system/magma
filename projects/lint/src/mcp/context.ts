/*
  What every tool of the MCP server shares: the project the agent works in (icons,
  configurations and parsers are resolved from it), the settings that point the data
  elsewhere (tests, a project that wants other files), and small helpers on both.
*/
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { MagmaSettings } from '../core/data.js';

export interface ToolContext {
  /** The project the agent works in: the directory the client starts the server in by default. */
  root: string;
  /** Where the Magma data is read from: the installed packages when empty. */
  settings: MagmaSettings;
  /** The folders of the icon sets, by set (mi, mdi, mgg): the installed packages when unset. */
  icons?: Partial<Record<'mi' | 'mdi' | 'mgg', string>>;
  /** The lazy loader of the components render_preview loads: the one of the installed magma when unset. */
  loader?: string;
}

const HERE = fileURLToPath(import.meta.url);

/**
 * The file of a package the project uses, resolved from the project first and from this
 * module next (inside magma, its own dependencies). Undefined when it is not installed.
 */
export const resolvePackage = (context: ToolContext, id: string): string | undefined => {
  for (const from of [path.join(context.root, 'package.json'), HERE])
    try {
      return createRequire(from).resolve(id);
    } catch {
      // try the next place
    }
  return undefined;
};

/** The folder of an installed package, from its package.json. */
export const packageDir = (context: ToolContext, name: string): string | undefined => {
  const manifest = resolvePackage(context, `${name}/package.json`);
  return manifest && path.dirname(manifest);
};

/** A module the project installed (eslint, a parser), loaded from the project. */
export const requireFromProject = (context: ToolContext, id: string): unknown => {
  const file = resolvePackage(context, id);
  if (!file) return undefined;
  return createRequire(path.join(context.root, 'package.json'))(file);
};

/** A JSON file, or undefined when it is missing or not JSON. */
export const readJsonFile = <T = Record<string, unknown>>(file: string): T | undefined => {
  if (!existsSync(file)) return undefined;
  try {
    return JSON.parse(readFileSync(file, 'utf8')) as T;
  } catch {
    return undefined;
  }
};

/** The words of a search, lowercase, without the ones that say nothing. */
const STOP = new Set([
  'a',
  'an',
  'the',
  'for',
  'to',
  'of',
  'with',
  'and',
  'or',
  'in',
  'on',
  'that',
  'need',
  'want',
  'component',
  'magma',
  'mds',
  'icon',
]);
export const wordsOf = (text: string): string[] =>
  text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 1 && !STOP.has(word))
    .map((word) => (word.length > 3 && word.endsWith('s') ? word.slice(0, -1) : word));

/** `mds-button-dropdown` -> `MdsButtonDropdown`. */
export const pascalOf = (tag: string): string =>
  tag
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

/** The first sentence of a markdown text, without links, headings or tables. */
export const firstSentence = (markdown = ''): string => {
  const line =
    markdown
      .split('\n')
      .map((one) => one.trim())
      .find((one) => one && !/^(#|\||```|>)/.test(one)) ?? '';
  const plain = line.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');
  return (plain.split(/\.\s/)[0] ?? plain).replace(/\s+/g, ' ').trim().replace(/\.$/, '') + '.';
};

/**
 * What an answer adds when the installed Magma has nothing for a well-formed question (a
 * search that matches nothing, a value it cannot read): the gap is Magma's to fill, and the
 * agent proposes an issue (agents/reporting.md, section 7, #1137). An input error is not a gap.
 */
export const GAP =
  'Magma has nothing for this. If it should, tell the user, and at the end of the task propose an issue on Magma: get_guide reporting, section "A tool or an answer the MCP server is missing".';

/** The output schema of the optional `gap` of an answer. */
export const GAP_SCHEMA = {
  type: 'string',
  description: 'Set when Magma has nothing for the question: a gap to report.',
};
