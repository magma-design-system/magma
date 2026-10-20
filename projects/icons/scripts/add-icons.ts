/*
 * Adds entries to projects/icons/dictionary.json.
 *
 * The file is only roughly alphabetical (hundreds of entries deviate from a
 * strict sort, e.g. "action-close-circle" sits before "action-close"), so a
 * global re-sort would produce an unreadable diff and bury the actual change.
 * This script edits the raw text and inserts each new entry next to its
 * alphabetical neighbours, leaving every other line untouched.
 *
 * Usage:
 *   tsx scripts/add-icons.ts --auto                    # map every unmapped Maggioli source
 *   tsx scripts/add-icons.ts my-icon                   # shorthand for my-icon=maggioli/my-icon
 *   tsx scripts/add-icons.ts my-icon=mdi/alarm-note    # explicit source
 *   tsx scripts/add-icons.ts --auto --dry-run          # print what would change
 */

import chalk from 'chalk';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { DICTIONARY_PATH, MAGGIOLI_ICONS_DIR, UNMAPPED_ALLOWLIST_PATH } from './meta';

const ENTRY_REGEX = /^(\s*)"([^"]+)"\s*:\s*"([^"]+)"(,?)\s*$/;

interface Entry {
  key: string;
  value: string;
}

const die = (message: string): never => {
  console.error(chalk.red(message));
  process.exit(1);
};

/** Same ordering used to decide where a new key belongs. */
const compareKeys = (a: string, b: string): number => a.localeCompare(b);

const parseArgument = (argument: string): Entry => {
  const [key, value] = argument.includes('=') ? argument.split('=') : [argument, undefined];
  if (!key) die(`cannot parse argument "${argument}"`);
  return { key, value: value ?? `maggioli/${key}` };
};

const unmappedSources = (dictionary: Record<string, string>): string[] => {
  const mapped = new Set(
    Object.values(dictionary)
      .filter((value) => value.startsWith('maggioli/'))
      .map((value) => value.slice('maggioli/'.length)),
  );

  const allowlist: Set<string> = existsSync(UNMAPPED_ALLOWLIST_PATH)
    ? new Set(JSON.parse(readFileSync(UNMAPPED_ALLOWLIST_PATH, 'utf-8')).icons ?? [])
    : new Set();

  return readdirSync(MAGGIOLI_ICONS_DIR)
    .filter((file) => file.endsWith('.svg'))
    .map((file) => file.replace(/\.svg$/, ''))
    .filter((name) => !mapped.has(name) && !allowlist.has(name))
    .sort(compareKeys);
};

/**
 * Inserts an entry into the raw lines, keeping trailing commas valid whether it
 * lands in the middle of the file or after the current last entry.
 */
const insertEntry = (lines: string[], entry: Entry): string[] => {
  const entryLines = lines
    .map((line, index) => ({ index, match: line.match(ENTRY_REGEX) }))
    .filter((candidate) => candidate.match !== null);

  if (entryLines.length === 0) die('no existing entries found in dictionary.json');

  const indent = entryLines[0].match![1];
  const successor = entryLines.find((candidate) => compareKeys(candidate.match![2], entry.key) > 0);

  if (successor) {
    const newLine = `${indent}"${entry.key}": "${entry.value}",`;
    return [...lines.slice(0, successor.index), newLine, ...lines.slice(successor.index)];
  }

  // append after the current last entry, which has no trailing comma
  const last = entryLines[entryLines.length - 1];
  const newLine = `${indent}"${entry.key}": "${entry.value}"`;
  const patched = [...lines];
  if (!last.match![4]) patched[last.index] = `${patched[last.index].trimEnd()},`;
  return [...patched.slice(0, last.index + 1), newLine, ...patched.slice(last.index + 1)];
};

const main = (): void => {
  const argv = process.argv.slice(2);
  const isAuto = argv.includes('--auto');
  const isDryRun = argv.includes('--dry-run');
  const positional = argv.filter((argument) => !argument.startsWith('--'));

  if (!isAuto && positional.length === 0) {
    die('nothing to do: pass icon names or --auto. See the header of this file for usage.');
  }

  const raw = readFileSync(DICTIONARY_PATH, 'utf-8');
  const dictionary: Record<string, string> = JSON.parse(raw);

  const requested = isAuto
    ? unmappedSources(dictionary).map((name) => ({ key: name, value: `maggioli/${name}` }))
    : positional.map(parseArgument);

  if (requested.length === 0) {
    console.info(chalk.green('every Maggioli source is already mapped, nothing to add'));
    return;
  }

  const newline = raw.includes('\r\n') ? '\r\n' : '\n';
  let lines = raw.split(/\r?\n/);

  for (const entry of requested) {
    if (dictionary[entry.key]) {
      die(`key "${entry.key}" already exists and points to "${dictionary[entry.key]}"`);
    }

    if (entry.value.startsWith('maggioli/')) {
      const name = entry.value.slice('maggioli/'.length);
      if (!existsSync(path.join(MAGGIOLI_ICONS_DIR, `${name}.svg`))) {
        die(`"${entry.value}" has no source at ${path.join(MAGGIOLI_ICONS_DIR, `${name}.svg`)}`);
      }
    }

    lines = insertEntry(lines, entry);
    dictionary[entry.key] = entry.value;
    console.info(`${chalk.green('+')} "${entry.key}": "${chalk.yellow(entry.value)}"`);
  }

  if (isDryRun) {
    console.info(chalk.yellow(`dry run: ${requested.length} entries not written`));
    return;
  }

  writeFileSync(DICTIONARY_PATH, lines.join(newline), { encoding: 'utf8' });
  console.info(
    `${chalk.green('saved')} ${requested.length} new entries in ${path.basename(DICTIONARY_PATH)}, ` +
      'now run `yarn nx run icons:build` to verify the font builds',
  );
};

main();
