import {
  semantic,
  accentTintOverride,
} from '@maggioli-design-system/design-tokens/semantic.config';
import {
  THEME_NAME,
  namedThemeCss,
  themeOf,
} from '@maggioli-design-system/design-tokens/semantic.model';
import {
  COLOR_MODES,
  type ColorMode,
} from '@maggioli-design-system/design-tokens/src/lib/theme-manifest.mjs';
import type { ThemeChoices } from './theme-choices.js';
import { translator, type T } from '../shared/i18n/text.js';

/*
  The model of the themes, with no Preact and no state (out of themes.tsx, #1399): the themes
  Magma ships, the name, the accents and the modes of the theme drawn from a family, given the
  choices of the person, and the CSS the export prints. The Themes page, the gate, the paints and
  the scene read it.
*/

// accent roles (accent/ai). An accent is derivative of a variant: you pick WHICH
// variant it points at, nothing more - to add a new accent colour you add a variant
// upstream, keeping variant the single place a colour is chosen. The pickable
// families are ALL the variant families in the palette (derived per card from the
// token tree, see `variantFamilies`), not only the ones a role currently defaults
// to - so a theme can repoint an accent to any variant (e.g. `variant-secondary`
// for a future maggioli-editore theme), even one no role uses by default.
export const ACCENT_ROLES = Object.keys(semantic.accents);

/** A ThemeDef of semantic.config.ts as surface, accents and modes (a string is the surface alone). */
const defOf = (def: (typeof semantic.themes)[string]) =>
  typeof def === 'string'
    ? { surface: def, accents: undefined, modes: undefined, deprecated: undefined }
    : def;

/**
 * The name of a theme is its own, not the name of the family it is drawn from (decided with
 * vittorio, 2026-11-05): `editorial` is drawn from `bisque`. Every name Magma ships is reserved,
 * the deprecated ones included while themes.css still emits them, so a theme of a product never
 * takes one (semantic.config.ts, `themes`).
 */
export const RESERVED_THEME_NAMES: ReadonlySet<string> = new Set(Object.keys(semantic.themes));

/**
 * The themes Magma ships, by the family they are drawn from: their name, their accents and their
 * modes. The deprecated ones are no starting point, so they are not offered.
 */
export const SHIPPED_BY_FAMILY: ReadonlyMap<
  string,
  { name: string; accents: Record<string, string>; modes: readonly ColorMode[] }
> = new Map(
  Object.entries(semantic.themes)
    .map(([name, def]) => ({ name, ...defOf(def) }))
    .filter(({ deprecated }) => !deprecated)
    .map(({ name, surface, accents, modes }) => [
      surface ?? semantic.tint,
      { name, accents: accents ?? {}, modes: modes ?? COLOR_MODES },
    ]),
);

/**
 * Why a name a person gave a theme cannot be used, or null when it can. In English unless a
 * translator is given: the export writes it in a comment of the CSS, which stays English.
 */
export function themeNameProblem(
  name: string,
  family: string,
  names: Record<string, string>,
  t: T = translator('en'),
) {
  if (!THEME_NAME.test(name))
    return t('lowercase words joined by hyphens, as editorial or my-product');
  if (RESERVED_THEME_NAMES.has(name))
    return t('{name} is a theme Magma ships: pick a name of your own', { name });
  const taken = Object.entries(names).find(([other, value]) => other !== family && value === name);
  if (taken)
    return t('the theme drawn from {family} is named {name} already', { family: taken[0], name });
  return null;
}

/** The name of the theme drawn from a family: the shipped one, the one given, the family. */
export const nameOfTheme = (family: string, choices: ThemeChoices): string =>
  SHIPPED_BY_FAMILY.get(family)?.name ?? choices.names[family] ?? family;

/** The variant an accent role points at in a theme: the choice, the shipped theme, the base. */
export const accentOfTheme = (family: string, role: string, choices: ThemeChoices): string =>
  choices.accents[family]?.[role] ??
  SHIPPED_BY_FAMILY.get(family)?.accents[role] ??
  semantic.accents[role];

/** The colour modes of a theme (#1274): the choice, the shipped theme, then both. */
export const modesOfTheme = (family: string, choices: ThemeChoices): readonly ColorMode[] =>
  choices.modes[family] ?? SHIPPED_BY_FAMILY.get(family)?.modes ?? COLOR_MODES;

/** The names given to the themes Magma does not ship, by family: the names a theme may not take. */
export const givenNamesOf = (extras: string[], choices: ThemeChoices): Record<string, string> =>
  Object.fromEntries(
    extras
      .filter((family) => !SHIPPED_BY_FAMILY.has(family))
      .map((family) => [family, nameOfTheme(family, choices)]),
  );

/**
 * The CSS of the themes, as the export prints it and the frame of the Theme section paints it:
 * the accents the base theme repoints in `:root`, the modes of the base theme under its own name,
 * then the block of each other theme, expanded and printed by the code that writes themes.css
 * (design-tokens semantic.model.ts): the tint block of the family with its ramp, each reassigned
 * accent, the theme's own contrast blocks and, for a theme of one mode, `--magma-color-modes`
 * first. A family whose name is no theme name (the model refuses it) says why instead.
 */
export function themesExportCss(
  extras: string[],
  choices: ThemeChoices,
  scaleOf: (family: string) => string | undefined,
): string {
  const givenNames = givenNamesOf(extras, choices);
  const themeCss = (family: string): string => {
    const name = nameOfTheme(family, choices);
    const problem = SHIPPED_BY_FAMILY.has(family)
      ? null
      : themeNameProblem(name, family, givenNames);
    if (problem) return `/* the theme drawn from ${family}: ${problem} */`;
    const accentOverrides = Object.fromEntries(
      ACCENT_ROLES.map((role) => [role, accentOfTheme(family, role, choices)]).filter(
        ([role, variant]) => variant !== semantic.accents[role],
      ),
    );
    try {
      const scale = scaleOf(family);
      return namedThemeCss(
        themeOf(name, {
          surface: family,
          accents: accentOverrides,
          modes: modesOfTheme(family, choices),
          ...(scale && { scale }),
        }),
      );
    } catch (error) {
      return `/* ${name}: ${error instanceof Error ? error.message : String(error)} */`;
    }
  };
  // the base theme of one mode declares it under its own name, as every theme does: mds-pref-theme
  // reads it from `:root[data-theme-name]` when it applies the theme. In `:root` the lock would
  // reach every theme of both modes, which declares nothing. Both modes print nothing.
  const baseModesCss = namedThemeCss(
    themeOf(nameOfTheme(semantic.tint, choices), {
      surface: semantic.tint,
      modes: modesOfTheme(semantic.tint, choices),
    }),
  );
  // the default family is the base :root: it emits no surface/border/text override,
  // but a repointed accent IS a base change, so surface it as a :root accent block.
  const lines: string[] = [];
  ACCENT_ROLES.forEach((role) => {
    const variant = accentOfTheme(semantic.tint, role, choices);
    if (variant !== semantic.accents[role]) lines.push(...accentTintOverride(role, variant));
  });
  const defaultAccentCss = lines.length ? [':root {', ...lines, '}'].join('\n') : '';
  return [defaultAccentCss, baseModesCss, ...extras.map(themeCss)].filter(Boolean).join('\n\n');
}
