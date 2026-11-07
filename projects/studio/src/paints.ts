import type { MagmaConfig } from '@maggioli-design-system/design-tokens/src/lib/color.mjs';
import { semantic } from '@maggioli-design-system/design-tokens/semantic.config';
import guide from '../../../docs/agents/variants.md?raw';
import api from 'virtual:magma-api';
import type { ComponentAxes } from '../magma-api.js';
import type { ConfigTheme } from './scene-css.js';
import { NO_THEME_CHOICES, type ThemeChoices } from './theme-choices.js';
import { accentOfTheme } from './themes.js';

/*
  What a family of the palette paints: the components a change of it moves, so that the previews
  of a colour show those, and say so when it paints none (#1308). Nothing here is guessed; each
  link of the chain is read where it is decided:

  - a component paints with a colour through its `variant`, the values it takes and its default
    in the documentation.json of the installed magma (magma-api.ts);
  - which variants are colours, and of which kind (accent, status, neutral, label, identity): the
    tables of the section Variants of docs/agents/variants.md. A `variant` that takes anything else
    is no colour (mds-text has one of typography: `info`, `read`, `title`);
  - which family a kind paints with: "Paints with" of the same guide and the mapping of
    docs/agents/color.md. A status and a label paint with their own family (`status-error` is the
    `error` variant, `label-red` the `red` one); an accent with the family the theme points the
    accent role at (`accent: variant-primary` in semantic.config.ts, repointed by a theme:
    editorial points it at `variant-secondary`); the neutral variants and the surfaces with the
    theme drawn from the family; an identity (`google`, `apple`) with the colours of its provider;
  - an alias re-exports the ramp of its source (`variant.primary` is `brand.maggioli`, color.mts):
    a family paints what its aliases paint too.

  A family that reaches none of these paints no component of Magma, whatever the scene.
*/

/**
 * The colour variants and the kind of each (`Accent`, `Status`, `Neutral`, `Label`, `Identity`),
 * from the two tables of the section Variants of the guide: the families with their values (the
 * labels cut short there) and the variants one per row.
 */
export function colourVariants(markdown: string): Map<string, string> {
  const section = markdown.split(/^## /m).find((part) => part.startsWith('Variants')) ?? '';
  const kinds = new Map<string, string>();
  const KIND = /^[A-Z][a-z]+$/;
  for (const line of section.split('\n')) {
    if (!line.startsWith('|')) continue;
    const [first = '', second = ''] = line
      .split('|')
      .slice(1)
      .map((cell) => cell.trim());
    const named = /^`([a-z-]+)`$/.exec(first);
    if (named && KIND.test(second)) kinds.set(named[1], second);
    else if (KIND.test(first))
      for (const [, value] of second.matchAll(/`([a-z-]+)`/g))
        if (!kinds.has(value)) kinds.set(value, first);
  }
  return kinds;
}

/** The colour variants of Magma, by kind (docs/agents/variants.md). */
export const KINDS: ReadonlyMap<string, string> = colourVariants(guide);

/** The tones, from the most to the least emphasis: the first table of the section Tones. */
export function toneOrder(markdown: string): string[] {
  const section = markdown.split(/^## /m).find((part) => part.startsWith('Tones')) ?? '';
  return [...section.matchAll(/^\| `([a-z]+)` +\|/gm)].map(([, tone]) => tone);
}

/** The tones of Magma, from the most to the least emphasis (docs/agents/variants.md). */
export const TONES: readonly string[] = toneOrder(guide);

/** The colour axes of every component of the installed magma (magma-api.ts). */
export const COMPONENTS: readonly ComponentAxes[] = api;

/** The components whose `variant` is a colour: every value it takes is a colour variant. */
export const paintingComponents = (
  components: readonly ComponentAxes[],
  kinds: ReadonlyMap<string, string>,
): ComponentAxes[] =>
  components.filter(
    ({ variant }) => variant?.values.length && variant.values.every((value) => kinds.has(value)),
  );

/** The kind of variant the families of a group are, by their own name (status-error: error). */
const KIND_OF_GROUP: Record<string, string> = { status: 'Status', label: 'Label' };

/**
 * The variants each accent role paints (docs/agents/variants.md, Accent): `primary` and
 * `secondary` with `--magma-accent-*`, secondary rendering exactly like primary, and `ai` with
 * `--magma-accent-ai-*`. The roles are the keys of `accents` in semantic.config.ts, which a theme
 * repoints and never adds to.
 */
export const VARIANTS_OF_ACCENT: Readonly<Record<string, readonly string[]>> = {
  accent: ['primary', 'secondary'],
  ai: ['ai'],
};

/** A variant a family paints, the family it reaches it through, the components that take it. */
export interface PaintedVariant {
  variant: string;
  /** Its kind in the guide: `Status`, `Label`, `Accent`, `Neutral`. */
  kind: string;
  /** The family itself, or the alias of it the variant paints with. */
  through: string;
  tags: string[];
}

export interface Painted {
  /**
   * The theme the family is seen in: the one drawn from it, else the first whose accents point at
   * it (the base first), else the base.
   */
  theme?: ConfigTheme;
  /** The family is the one `theme` is drawn from: its surfaces paint the whole page. */
  surfaces: boolean;
  /**
   * The variants that paint with the family in that theme: its own (a status, a label), the
   * accents the theme points at it, and the neutral ones of the theme drawn from it.
   */
  variants: PaintedVariant[];
}

const nameOf = (family: string) => family.split('.')[1] ?? family;
const groupOf = (family: string) => family.split('.')[0];

/**
 * What a family paints, by its full name (`status.error`): `themes` are the themes of the
 * configuration, the base first (scene-css.ts, configThemes), `choices` the accents the Themes page
 * repoints.
 */
export function paintedBy(
  family: string,
  {
    config,
    themes,
    choices = NO_THEME_CHOICES,
    components = paintingComponents(COMPONENTS, KINDS),
    kinds = KINDS,
  }: {
    config: MagmaConfig;
    themes: readonly ConfigTheme[];
    choices?: ThemeChoices;
    components?: readonly ComponentAxes[];
    kinds?: ReadonlyMap<string, string>;
  },
): Painted {
  const families = [
    family,
    ...config.colors.filter((one) => one.alias === family).map((one) => one.name),
  ];
  const accented = families
    .filter((one) => groupOf(one) === 'variant')
    .map((one) => `variant-${nameOf(one)}`);
  const roles = Object.keys(semantic.accents);
  const drawn = themes.find((theme) => families.some((one) => nameOf(one) === theme.family));
  const theme =
    drawn ??
    themes.find((one) =>
      roles.some((role) => accented.includes(accentOfTheme(one.family, role, choices))),
    ) ??
    themes[0];

  const variants: Array<Omit<PaintedVariant, 'tags'>> = [];
  for (const one of families) {
    const kind = KIND_OF_GROUP[groupOf(one)];
    if (kind && kinds.get(nameOf(one)) === kind)
      variants.push({ variant: nameOf(one), kind, through: one });
  }
  if (theme)
    for (const role of roles) {
      const target = accentOfTheme(theme.family, role, choices);
      if (!accented.includes(target)) continue;
      for (const variant of VARIANTS_OF_ACCENT[role] ?? [])
        variants.push({
          variant,
          kind: 'Accent',
          through: `variant.${target.slice('variant-'.length)}`,
        });
    }
  // a theme retints the neutral scaffolding (docs/agents/color.md), the roles of `dark` and `light`
  if (drawn)
    for (const [variant, kind] of kinds)
      if (kind === 'Neutral') variants.push({ variant, kind, through: family });

  return {
    theme,
    surfaces: drawn !== undefined,
    variants: variants
      .map((one) => ({
        ...one,
        tags: components
          .filter(({ variant }) => variant?.values.includes(one.variant))
          .map(({ tag }) => tag),
      }))
      .filter((one) => one.tags.length > 0),
  };
}

/** The family paints something: the surfaces of a theme, or a variant some component takes. */
export const paintsAny = (painted: Painted): boolean =>
  painted.surfaces || painted.variants.length > 0;

/**
 * The elements of a page that paint with some variants: a component that takes one, written on it
 * or as its default (mds-button paints `primary` with no variant written).
 */
export function paintedSelector(
  variants: readonly string[],
  components: readonly ComponentAxes[] = paintingComponents(COMPONENTS, KINDS),
): string {
  const wanted = new Set(variants);
  return components
    .flatMap(({ tag, variant }) =>
      [...wanted]
        .filter((one) => variant?.values.includes(one))
        .flatMap((one) => [
          `${tag}[variant="${one}"]`,
          ...(variant?.fallback === one ? [`${tag}:not([variant])`] : []),
        ]),
    )
    .join(', ');
}
