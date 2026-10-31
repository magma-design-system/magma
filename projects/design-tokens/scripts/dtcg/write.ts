// Writes the global tokens as DTCG 2025.10 JSON in dist/dtcg: one file per set and
// the resolver document that combines them (see ./sets.ts). Called by
// scripts/build.ts once the color tokens exist.
// https://www.designtokens.org/TR/2025.10/
import chalk from 'chalk';
import { mkdir, readFile, rm, writeFile } from 'fs/promises';
import path from 'path';
import { semanticModel } from '../../semantic.model';
import { buildDtcg } from './sets';
import { DIST_DIR, TOKENS_DIR } from '../meta';

const OUT_DIR = path.join(DIST_DIR, 'dtcg');

/** The token sources the CSS of the scale and motion tokens is built from. */
const SOURCES = [
  'sizing/primitive.json',
  'sizing/spacing.json',
  'sizing/aspect-ratio.json',
  'sizing/radius.json',
  'sizing/role.json',
  'typography/default.json',
  'typography/leading.json',
  'typography/size.json',
  'typography/role.json',
  'cosmetic/border.json',
  'cosmetic/box-shadow.json',
  'screen/default.json',
  'css/transitions/duration.json',
  'css/transitions/timing-functions.json',
  'css/transitions/default.json',
];

type Tree = Record<string, unknown>;

const isTree = (value: unknown): value is Tree =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const merge = (into: Tree, from: Tree): Tree => {
  for (const [key, value] of Object.entries(from))
    into[key] = isTree(value) && isTree(into[key]) ? merge(into[key] as Tree, value) : value;
  return into;
};

/**
 * Write the DTCG sets of the color tokens `build.ts` has just generated (so the
 * color engine runs once) and of the JSON sources the other CSS is built from.
 */
export async function writeDtcg(
  tokens: unknown,
  config: { colors: Array<{ name: string; alias?: string }> },
): Promise<void> {
  const colorAliases = Object.fromEntries(
    config.colors.filter((color) => color.alias).map((color) => [color.name, color.alias]),
  );

  const sources: Tree = {};
  for (const file of SOURCES)
    merge(sources, JSON.parse(await readFile(path.join(TOKENS_DIR, file), 'utf8')));

  const { sets, resolver } = buildDtcg({
    colors: tokens as Parameters<typeof buildDtcg>[0]['colors'],
    colorAliases,
    sources,
    semantic: semanticModel(),
  });

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
      `DTCG tokens: ${Object.keys(sets).length} sets + magma.resolver.json in ${path.relative(process.cwd(), OUT_DIR)}`,
    ),
  );
}
