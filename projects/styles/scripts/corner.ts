import chalk from 'chalk';
import path from 'path';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { BUILD_DIR, PROJECT_DIR } from './meta';

/**
 * Generate the corner axis: `build/css/corner.css`.
 *
 * Corner shape and corner radius are two halves of one decision. At the same
 * `border-radius` a squircle cuts a far smaller corner than a round one, so a
 * scale tuned for `round` reads rigid the moment the shape changes. This file
 * emits the shape AND the radius scale together, in one block per shape, so the
 * two can never drift apart - the reason it is generated rather than written by
 * hand.
 *
 * The default lives on a bare `:root`: install the design system and you get it
 * with no attribute to write, exactly like a theme nobody spells as
 * `data-theme-name="default"`. The deviation blocks are NOT prefixed with
 * `:root`, so `data-corner-shape` works on any element and the custom
 * properties inherit into that subtree, shadow DOM included.
 *
 * The pill stays out of the axis, by decision: `--magma-radius-full` resolves to
 * the same `--radius-full` under every shape. Past half the shorter side a
 * squircle stops producing a pill and draws the filled superellipse of an app
 * icon, so the components that spell a pill (chip, filter item, avatar, hr, ...)
 * keep the CSS default `round` by simply not declaring `corner-shape`.
 *
 * The squircle steps come from `design-tokens/tokens/sizing/radius.json`, where
 * they are the round scale multiplied by 1.715 - the factor that preserves the
 * AREA the corner cuts - and then snapped to the nearest existing primitive so
 * the scale stays inside the system.
 *
 * A browser without `corner-shape` (Firefox, Safari) drops the declaration and
 * draws every corner round: left on the squircle scale, each one would come out
 * 1.715 times rounder than designed. Where the default or an explicit squircle
 * cannot be drawn, a `@supports not` block puts the round scale back, so the
 * page draws the round look-alike of what a squircle browser shows (#913).
 *
 * `--magma-corner-cap` is the part of its height a corner may take. A box whose
 * radius is always past half its height (a button, the strip of a tab) is clamped
 * by the browser to half the height: a squircle cut to half the height, or a pill
 * when round. Its round look-alike is not the clamped token but a fraction of the
 * height, so the components that know their height spell their radius as
 * `min(<token>, var(--magma-corner-cap) * <height>)`. The cap is 0.5 in every
 * shape block, where the min() gives exactly what the browser clamps to (the pill
 * of an explicit round stays a pill), and 0.5 / 1.715 in the fallback block.
 */

const TOKENS_CSS = path.resolve(PROJECT_DIR, '../design-tokens/dist/css/typography.css');
const OUT_FILE = path.resolve(BUILD_DIR, 'css', 'corner.css');

/** The shape a consumer gets without writing a single attribute. */
const DEFAULT_SHAPE = 'squircle';

/** The part of its height a corner may take: half, where the browser clamps. */
const CAP = 0.5;

/** What a round corner is to the squircle that cuts the same area (radius.json). */
const SQUIRCLE_FACTOR = 1.715;

/** The cap of the fallback: the round look-alike of a squircle cut to half the height. */
const FALLBACK_CAP = Number((CAP / SQUIRCLE_FACTOR).toFixed(4));

/** Every shape that owns a scale. A shape with no `--radius-<shape>-*` steps
 * would produce a block identical to `round`, which is why the list is derived
 * from the emitted tokens rather than from the `corner-shape` keywords. */
const SHAPE_WITH_SCALE = 'squircle';

interface Scale {
  /** Step names in emission order, e.g. `['none', '3xs', ..., 'full']`. */
  steps: string[];
  /** Step names that have a `--radius-squircle-*` counterpart. */
  shaped: Set<string>;
}

/**
 * Read the emitted token sheet and split `--radius-*` into the base scale and
 * the per-shape one. Deriving the steps from the build output (rather than
 * hardcoding them here) means adding a step to `radius.json` is enough.
 */
const readScale = async (): Promise<Scale> => {
  const css = await readFile(TOKENS_CSS, 'utf8').catch((error) => {
    throw new Error(chalk.red(`[corner] cannot read ${TOKENS_CSS}: ${error}`));
  });

  const steps: string[] = [];
  const shaped = new Set<string>();
  const prefix = `${SHAPE_WITH_SCALE}-`;

  for (const [, name] of css.matchAll(/--radius-([a-z0-9-]+)\s*:/g)) {
    if (name.startsWith(prefix)) {
      shaped.add(name.slice(prefix.length));
    } else if (!steps.includes(name)) {
      steps.push(name);
    }
  }

  const orphans = [...shaped].filter((step) => !steps.includes(step));
  if (orphans.length > 0) {
    throw new Error(
      chalk.red(`[corner] --radius-${SHAPE_WITH_SCALE}-* steps with no base step: ${orphans}`),
    );
  }
  if (steps.length === 0) {
    throw new Error(chalk.red(`[corner] no --radius-* token found in ${TOKENS_CSS}`));
  }

  return { steps, shaped };
};

/**
 * One selector's worth of declarations: the shape itself and its cap, then every
 * step of the scale pointed at the source token that shape uses. The fallback
 * block declares `round`, with the round scale, and passes its own cap.
 */
const block = (
  selector: string,
  shape: string,
  scale: Scale,
  { cap = CAP, indent = '' }: { cap?: number; indent?: string } = {},
): string => {
  const lines = [`--magma-corner-shape: ${shape};`, `--magma-corner-cap: ${cap};`, ''];
  for (const step of scale.steps) {
    const source =
      shape === SHAPE_WITH_SCALE && scale.shaped.has(step)
        ? `--radius-${SHAPE_WITH_SCALE}-${step}`
        : `--radius-${step}`;
    lines.push(`--magma-radius-${step}: var(${source});`);
  }
  const body = lines.map((line) => (line ? `${indent}  ${line}` : '')).join('\n');
  return `${indent}${selector} {\n${body}\n${indent}}`;
};

/**
 * Where `corner-shape: squircle` cannot be drawn: the default, unless the root
 * asks for round itself, and every explicit squircle subtree get the round shape,
 * the round scale and the fallback cap. An explicit round is left alone, pill
 * included. It comes last, so it wins over the squircle block of equal weight.
 */
const fallbackBlock = (scale: Scale): string =>
  [
    `@supports not (corner-shape: ${SHAPE_WITH_SCALE}) {`,
    block(
      `:root:not([data-corner-shape='round']),\n  [data-corner-shape='${SHAPE_WITH_SCALE}']`,
      'round',
      scale,
      { cap: FALLBACK_CAP, indent: '  ' },
    ),
    '}',
  ].join('\n');

const main = async (): Promise<void> => {
  const scale = await readScale();

  const header = [
    '/*',
    '  GENERATED by projects/styles/scripts/corner.ts - do not edit.',
    '',
    '  The corner axis: one block per shape, each carrying the shape and the radius',
    '  scale tuned for it. The default sits on a bare :root, so nothing has to be',
    '  written to get it; the deviation blocks carry no :root prefix, so',
    '  data-corner-shape works on any element and inherits into its subtree.',
    '',
    `  --magma-radius-full is the same under every shape on purpose: the pill is out`,
    '  of the axis (see corner.ts).',
    '',
    '  A browser without corner-shape gets the round scale back from the last block,',
    '  and --magma-corner-cap, the part of its height a corner may take, drops from',
    '  0.5 to the round look-alike of a squircle cut to half the height.',
    '*/',
    '',
  ].join('\n');

  const blocks = [
    block(':root', DEFAULT_SHAPE, scale),
    ...['round', SHAPE_WITH_SCALE].map((shape) =>
      block(`[data-corner-shape='${shape}']`, shape, scale),
    ),
    fallbackBlock(scale),
  ];

  await mkdir(path.dirname(OUT_FILE), { recursive: true });
  await writeFile(OUT_FILE, `${header}${blocks.join('\n\n')}\n`, 'utf8');

  console.info(
    `[corner] ${scale.steps.length} steps, ${scale.shaped.size} of them shaped -> ${OUT_FILE}`,
  );
};

main();
