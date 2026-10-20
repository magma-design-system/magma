/*
 * Validates projects/icons/dictionary.json against the icon sources it points to,
 * without running the (slow) font build.
 *
 * It catches the two failure modes of the manual icon-adding flow:
 *   1. a dictionary entry whose source icon does not exist -> the font build dies
 *      halfway with "Icon not found", after minutes of work;
 *   2. an SVG added to projects/svg-icons/svg that nobody mapped in the dictionary
 *      -> the icon silently never reaches the font. It still resolves through
 *      mds-icon (iconsauce reads svg-icons/dist directly), so the drift is invisible
 *      until someone asks why the font class is missing.
 *
 * Usage:
 *   tsx scripts/check-dictionary.ts              # full check
 *   tsx scripts/check-dictionary.ts --no-resolve # skip third-party lookups (faster, no node_modules)
 */

import chalk from 'chalk';
import { existsSync, readdirSync, readFileSync } from 'fs';
import path from 'path';
import { DICTIONARY_PATH, MAGGIOLI_ICONS_DIR, UNMAPPED_ALLOWLIST_PATH } from './meta';

/** Groups understood by font-icons.ts, see ICON_GROUPS in icons-groups.ts */
const KNOWN_GROUPS = ['maggioli', 'material', 'material-icons-svg', 'mdi'];

/** Mirrors the filename rule enforced by svg-icons/scripts/iconsauce.ts */
const SOURCE_FILENAME_REGEX = /^[a-z0-9-]+\.svg$/;

/**
 * Dictionary keys become CSS class suffixes. `_` is deliberately allowed:
 * see commit "fix(icons): restore _ character as permitted on CSS build".
 */
const KEY_REGEX = /^[a-z0-9_-]+$/;

const problems: string[] = [];
const notices: string[] = [];

const fail = (message: string) => problems.push(message);
const notice = (message: string) => notices.push(message);

/**
 * Resolves a package directory the same way icons-groups.ts does, returning
 * undefined instead of throwing when the package is not installed.
 */
const packageDir = (packageName: string): string | undefined => {
  try {
    return path.dirname(require.resolve(`${packageName}/package.json`));
  } catch {
    return undefined;
  }
};

const listFiles = (dir: string): string[] => (existsSync(dir) ? readdirSync(dir) : []);

const listSubDirectories = (dir: string): string[] =>
  existsSync(dir)
    ? readdirSync(dir, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name)
    : [];

/**
 * Builds a membership index per icon group once, instead of walking the
 * directories again for every entry like the font build does.
 */
const buildIndexes = (resolveThirdParty: boolean) => {
  const maggioli = new Set(
    listFiles(MAGGIOLI_ICONS_DIR)
      .filter((file) => file.endsWith('.svg'))
      .map((file) => file.replace(/\.svg$/, '')),
  );

  const indexes: Record<string, Set<string> | undefined> = { maggioli };

  if (!resolveThirdParty) return indexes;

  const mdiDir = packageDir('@mdi/svg');
  if (mdiDir) {
    indexes.mdi = new Set(
      listFiles(path.join(mdiDir, 'svg'))
        .filter((file) => file.endsWith('.svg'))
        .map((file) => file.replace(/\.svg$/, '')),
    );
  }

  const materialDir = packageDir('material-design-icons-updated');
  if (materialDir) {
    const root = path.join(materialDir, 'icons', 'filled');
    const names = new Set<string>();
    for (const category of listSubDirectories(root)) {
      for (const file of listFiles(path.join(root, category))) {
        const match = file.match(/^ic_(.+)_24px\.svg$/);
        if (match) names.add(match[1]);
      }
    }
    indexes.material = names;
  }

  const materialIconsSvgDir = packageDir('@material-icons/svg');
  if (materialIconsSvgDir) {
    const root = path.join(materialIconsSvgDir, 'svg');
    indexes['material-icons-svg'] = new Set(
      listSubDirectories(root).filter((name) => existsSync(path.join(root, name, 'baseline.svg'))),
    );
  }

  return indexes;
};

/**
 * JSON.parse keeps only the last occurrence of a repeated key, so a duplicate
 * added by hand would silently override an existing icon. Scan the raw text.
 */
const findDuplicateKeys = (raw: string): string[] => {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^\s*"([^"]+)"\s*:/);
    if (!match) continue;
    if (seen.has(match[1])) duplicates.add(match[1]);
    seen.add(match[1]);
  }
  return [...duplicates];
};

/** Entry lines must read `  "key": "value",` — keeps hand edits consistent. */
const findMalformedLines = (raw: string): string[] => {
  const malformed: string[] = [];
  raw.split(/\r?\n/).forEach((line, index) => {
    if (!/^\s*"/.test(line)) return;
    if (!/^ {2}"[^"]+": "[^"]+",?$/.test(line)) {
      malformed.push(`line ${index + 1}: ${line.trim()}`);
    }
  });
  return malformed;
};

const loadAllowlist = (): Set<string> => {
  if (!existsSync(UNMAPPED_ALLOWLIST_PATH)) return new Set();
  const parsed = JSON.parse(readFileSync(UNMAPPED_ALLOWLIST_PATH, 'utf-8'));
  return new Set<string>(parsed.icons ?? []);
};

const main = (): void => {
  const resolveThirdParty = !process.argv.includes('--no-resolve');

  if (!existsSync(MAGGIOLI_ICONS_DIR)) {
    console.error(
      chalk.red(
        `Maggioli SVG sources not found at ${MAGGIOLI_ICONS_DIR}. ` +
          'Run `yarn install` so the svg-icons workspace symlink exists.',
      ),
    );
    process.exit(1);
  }

  const raw = readFileSync(DICTIONARY_PATH, 'utf-8');

  let dictionary: Record<string, string>;
  try {
    dictionary = JSON.parse(raw);
  } catch (error) {
    console.error(chalk.red(`dictionary.json is not valid JSON: ${(error as Error).message}`));
    process.exit(1);
  }

  for (const key of findDuplicateKeys(raw)) {
    fail(`duplicate key "${key}": only the last one survives JSON parsing`);
  }

  for (const line of findMalformedLines(raw)) {
    fail(`malformed entry, expected 2-space indent and ": " separator -> ${line}`);
  }

  const indexes = buildIndexes(resolveThirdParty);
  const mappedMaggioliIcons = new Set<string>();

  for (const [key, value] of Object.entries(dictionary)) {
    if (!KEY_REGEX.test(key)) {
      fail(`key "${key}" has illegal characters, allowed are a-z, 0-9, - and _`);
    }

    const segments = value.split('/');
    if (segments.length !== 2) {
      fail(`entry "${key}" -> "${value}" must be in the form <group>/<icon-name>`);
      continue;
    }

    const [group, name] = segments;
    if (group === 'maggioli') mappedMaggioliIcons.add(name);

    if (!KNOWN_GROUPS.includes(group)) {
      fail(
        `entry "${key}" -> "${value}" uses unknown group "${group}", allowed are ${KNOWN_GROUPS.join(', ')}`,
      );
      continue;
    }

    // a known group with no index was not resolved: either --no-resolve, or the
    // upstream package is not installed. Reported once, below, not per entry.
    const index = indexes[group];
    if (index === undefined) continue;

    if (!index.has(name)) {
      fail(`entry "${key}" -> "${value}" points to an icon that does not exist in "${group}"`);
    }
  }

  const sources = listFiles(MAGGIOLI_ICONS_DIR).filter((file) => file.endsWith('.svg'));

  for (const file of sources) {
    if (!SOURCE_FILENAME_REGEX.test(file)) {
      fail(`source "${file}" has illegal characters, allowed are a-z, 0-9 and -`);
    }
  }

  const allowlist = loadAllowlist();
  const unmapped = sources
    .map((file) => file.replace(/\.svg$/, ''))
    .filter((name) => !mappedMaggioliIcons.has(name));

  for (const name of unmapped) {
    if (allowlist.has(name)) continue;
    const collision = dictionary[name];
    if (collision) {
      fail(
        `source "${name}.svg" is not in the font: key "${name}" is already taken by "${collision}". ` +
          `Pick a different key or remap it to "maggioli/${name}".`,
      );
    } else {
      fail(
        `source "${name}.svg" is not mapped in dictionary.json, so it never reaches the icon font. ` +
          `Add "${name}": "maggioli/${name}" or allowlist it in ${path.basename(UNMAPPED_ALLOWLIST_PATH)}.`,
      );
    }
  }

  const staleAllowlist = [...allowlist].filter((name) => mappedMaggioliIcons.has(name));
  for (const name of staleAllowlist) {
    notice(`"${name}" is mapped now: remove it from ${path.basename(UNMAPPED_ALLOWLIST_PATH)}`);
  }

  const unresolved = KNOWN_GROUPS.filter((group) => indexes[group] === undefined);
  if (unresolved.length) {
    notice(
      `not verified: ${unresolved.join(', ')} ` +
        (resolveThirdParty ? '(package not installed, run `yarn install`)' : '(--no-resolve)'),
    );
  }

  console.info(
    `Checked ${chalk.yellow(String(Object.keys(dictionary).length))} dictionary entries against ` +
      `${chalk.yellow(String(sources.length))} Maggioli sources` +
      (allowlist.size ? ` (${allowlist.size} allowlisted as intentionally unmapped)` : ''),
  );

  for (const message of notices) {
    console.info(`${chalk.yellow('note')} ${message}`);
  }

  if (problems.length === 0) {
    console.info(chalk.green('dictionary.json is in sync'));
    return;
  }

  for (const message of problems) {
    console.error(`${chalk.red('error')} ${message}`);
  }
  console.error(chalk.red(`\n${problems.length} problem(s) found in dictionary.json`));
  process.exit(1);
};

main();
