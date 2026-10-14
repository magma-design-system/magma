import chalk from 'chalk';
import path from 'path';
import { mkdir, readFile, rm, writeFile } from 'fs/promises';
import { BUILD_DIR, DIST_DIR, PROJECT_DIR } from './meta';
import { buildGlobals, parseStylesheet } from './dtcg/globals';

/**
 * Write the globals of this package as DTCG 2025.10 JSON in dist/dtcg (see
 * ./dtcg/globals.ts), next to a resolver that combines them with the sets of
 * design-tokens, so one document covers every global token of Magma.
 *
 * The resolver points at design-tokens' files by a relative path. It is the same in
 * this repository (projects/styles -> projects/design-tokens) and in an install
 * (node_modules/@maggioli-design-system/styles -> .../design-tokens), because the two
 * packages sit side by side in both.
 */

const DT_DTCG_DIR = path.resolve(PROJECT_DIR, '../design-tokens/dist/dtcg');
const OUT_DIR = path.join(DIST_DIR, 'dtcg');

/** The stylesheets that declare the globals, in the order a page loads them. */
const SHEETS = [
  path.join(PROJECT_DIR, 'css', 'globals.css'),
  // appended to the published globals.css by the copy step
  path.join(BUILD_DIR, 'css', 'corner.css'),
  path.join(PROJECT_DIR, 'css', 'theme.css'),
];

type Sources = Array<{ $ref: string }>;

interface Resolver {
  $schema: string;
  version: string;
  sets: Record<string, { description?: string; sources: Sources }>;
  modifiers: Record<
    string,
    { description?: string; contexts: Record<string, Sources>; default?: string }
  >;
  resolutionOrder: Sources;
}

const readJson = async <T>(file: string): Promise<T> =>
  JSON.parse(await readFile(file, 'utf8')) as T;

const main = async (): Promise<void> => {
  const base = await readJson<Record<string, unknown>>(path.join(DT_DTCG_DIR, 'base.tokens.json'));
  const tokens = await readJson<Resolver>(path.join(DT_DTCG_DIR, 'magma.resolver.json'));
  const sheets = await Promise.all(
    SHEETS.map(async (file) => parseStylesheet(await readFile(file, 'utf8'), file)),
  );
  const { sets, modifiers } = buildGlobals({ sheets, base });

  const toTokens = path.relative(OUT_DIR, DT_DTCG_DIR).split(path.sep).join('/');
  const rebase = (sources: Sources): Sources =>
    sources.map(({ $ref }) => ({ $ref: `${toTokens}/${$ref}` }));

  // design-tokens' sets come first and the globals after them, then every modifier:
  // the globals only alias design-tokens' tokens, so no file overrides another
  const lastSet = tokens.resolutionOrder.findLastIndex(({ $ref }) => $ref.startsWith('#/sets/'));
  const resolver = {
    $schema: tokens.$schema,
    version: tokens.version,
    name: 'Magma global tokens',
    description:
      'Every global token of Magma: the sets of @maggioli-design-system/design-tokens and the globals of @maggioli-design-system/styles. Merge the sets in resolutionOrder for one mode, theme, corner shape and depth; the result matches the stylesheets of the two packages in the same conditions.',
    sets: {
      ...Object.fromEntries(
        Object.entries(tokens.sets).map(([name, set]) => [
          name,
          { ...set, sources: rebase(set.sources) },
        ]),
      ),
      globals: {
        description:
          'The --magma-* globals, the corner axis and the depth axis of @maggioli-design-system/styles, at their :root values.',
        sources: [{ $ref: 'globals.tokens.json' }],
      },
    },
    modifiers: {
      ...Object.fromEntries(
        Object.entries(tokens.modifiers).map(([name, modifier]) => [
          name,
          {
            ...modifier,
            contexts: Object.fromEntries(
              Object.entries(modifier.contexts).map(([context, sources]) => [
                context,
                rebase(sources),
              ]),
            ),
          },
        ]),
      ),
      ...modifiers,
    },
    resolutionOrder: [
      ...tokens.resolutionOrder.slice(0, lastSet + 1),
      { $ref: '#/sets/globals' },
      ...tokens.resolutionOrder.slice(lastSet + 1),
      ...Object.keys(modifiers).map((name) => ({ $ref: `#/modifiers/${name}` })),
    ],
  };

  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });
  for (const [name, set] of Object.entries(sets))
    await writeFile(path.join(OUT_DIR, `${name}.tokens.json`), `${JSON.stringify(set, null, 2)}\n`);
  await writeFile(
    path.join(OUT_DIR, 'magma.resolver.json'),
    `${JSON.stringify(resolver, null, 2)}\n`,
  );
  console.info(
    chalk.green(
      `[dtcg] ${Object.keys(sets).length} sets + magma.resolver.json in ${path.relative(process.cwd(), OUT_DIR)}`,
    ),
  );
};

main().catch((error) => {
  console.error(chalk.red(error instanceof Error ? (error.stack ?? error.message) : String(error)));
  process.exitCode = 1;
});
