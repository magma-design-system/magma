import chalk from 'chalk';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { FIXTURES_DIR } from './meta';
import { logFileSavedTo } from '../../../scripts/log';

/**
 * Iconsauce emits `icons-dictionary.json` from async plugin resolution, so the
 * slug order varies between runs and produces spurious diffs. This script
 * normalises the file to a stable, deterministic order (lexicographic by
 * UTF-16 code unit, matching JavaScript's default Array.sort).
 *
 * Run as a post-step of `build.icons`.
 */

const DICTIONARY_FILE = join(FIXTURES_DIR, 'icons-dictionary.json');

const sortIconsDictionary = async (): Promise<void> => {
  const raw = await readFile(DICTIONARY_FILE, 'utf8').catch((error) => {
    throw Error(chalk.red(`Cannot read ${DICTIONARY_FILE}: ${error}`));
  });

  let slugs: unknown;
  try {
    slugs = JSON.parse(raw);
  } catch (error) {
    throw Error(chalk.red(`Cannot parse ${DICTIONARY_FILE} as JSON: ${error}`));
  }

  if (!Array.isArray(slugs) || !slugs.every((s) => typeof s === 'string')) {
    throw Error(chalk.red(`Expected ${DICTIONARY_FILE} to be a flat JSON array of strings`));
  }

  const sorted = [...(slugs as string[])].sort();

  // 4-space indent, no trailing newline - matches iconsauce's emit format,
  // keeps the diff minimal across the two scripts.
  await writeFile(DICTIONARY_FILE, JSON.stringify(sorted, null, 4), 'utf8').catch((error) => {
    throw Error(chalk.red(`Cannot write ${DICTIONARY_FILE}: ${error}`));
  });

  logFileSavedTo('icons-dictionary.json', DICTIONARY_FILE);
  console.info(
    `Sorted ${chalk.yellow(sorted.length.toString())} slugs in ${chalk.yellow('icons-dictionary.json')}`,
  );
};

sortIconsDictionary().catch((error) => {
  console.error(error);
  process.exit(1);
});
