import type { MagmaConfig } from '@maggioli-design-system/design-tokens/src/lib/color.mjs';
import { createColorTokens } from '@maggioli-design-system/design-tokens/src/lib/color.mjs';
import { semantic } from '@maggioli-design-system/design-tokens/semantic.config';
import type { ColorMode } from '@maggioli-design-system/design-tokens/src/lib/theme-manifest.mjs';
import { cssRgb } from './formats.js';
import { RESERVED_GROUPS } from './surfaces.js';
import { NO_THEME_CHOICES, type ThemeChoices } from './theme-choices.js';
import {
  SHIPPED_BY_FAMILY,
  givenNamesOf,
  modesOfTheme,
  nameOfTheme,
  themeNameProblem,
  themesExportCss,
} from './themes.js';

/*
  What the frame of the Theme section needs to show the configuration the person edits, not only
  the Magma installed: its themes, for the select, and the CSS that paints them, written into the
  frame over the stylesheets of that Magma (shell.tsx, applyFrame). Both come from the code that
  writes the files Magma ships: the palette from the template of colors-rgb.css (formats.ts, the
  one the download uses), the themes from the export of the Themes page (`themesExportCss`), so
  the frame paints what the page exports: the names, the accents and the modes chosen there.
*/

/** A theme of the configuration, by the family it is drawn from, with its colour modes. */
export interface ConfigTheme {
  name: string;
  family: string;
  modes: readonly ColorMode[];
}

export interface SceneStyle {
  /** The themes, the base first: the select of the Theme section offers them. */
  themes: ConfigTheme[];
  /** The palette and the CSS of the themes. */
  css: string;
}

type FamilyModes = Record<string, unknown>;

/**
 * The ramp a theme drawn from a family repoints: `tone-<family>` by default, which the model
 * names itself, and the ramp of its group for a family of another group (`label-violet`, spec
 * section 8: `{ surface: 'blue', scale: 'label-blue' }`).
 */
export function scaleOfFamily(config: MagmaConfig): (family: string) => string | undefined {
  const groupOf = new Map(
    config.colors.map((one) => [one.name.split('.')[1], one.name.split('.')[0]]),
  );
  return (family) => {
    const group = groupOf.get(family);
    return group && group !== 'tone' ? `${group}-${family}` : undefined;
  };
}

/** The families that back a theme, the base first; the extras are the ones not the base. */
function themeFamilies(config: MagmaConfig, color: Record<string, unknown>) {
  const surfaces = (color.surface as Record<string, FamilyModes>) ?? {};
  const texts = (color.text as Record<string, FamilyModes>) ?? {};
  // the families of a reserved group are never a theme, as on the Themes page (themes.tsx)
  const reserved = new Set(
    config.colors
      .filter((one) => RESERVED_GROUPS.has(one.name.split('.')[0]))
      .map((one) => one.name.split('.')[1]),
  );
  const families = Object.keys(surfaces).filter((family) => texts[family] && !reserved.has(family));
  const extras = families.filter((family) => family !== semantic.tint);
  const ordered = [...(families.includes(semantic.tint) ? [semantic.tint] : []), ...extras];
  return { extras, ordered };
}

/**
 * The themes of a configuration are the families the Themes page lists (themes.tsx): each family
 * of any group opted into a surface, its text included, the base family first, save the ones a
 * required group (status) carries with no flag of their own. A theme whose name the model refuses
 * is left out: the Themes page says why. `color` is the tree the configuration generates. The
 * select of the Theme section offers them, and the contrast gate judges them (gate.ts).
 */
export function configThemes(
  config: MagmaConfig,
  color: Record<string, unknown>,
  choices: ThemeChoices = NO_THEME_CHOICES,
): ConfigTheme[] {
  const { extras, ordered } = themeFamilies(config, color);
  const givenNames = givenNamesOf(extras, choices);
  return ordered
    .filter(
      (family) =>
        family === semantic.tint ||
        SHIPPED_BY_FAMILY.has(family) ||
        !themeNameProblem(nameOfTheme(family, choices), family, givenNames),
    )
    .map((family) => ({
      name: nameOfTheme(family, choices),
      family,
      modes: modesOfTheme(family, choices),
    }));
}

/** The themes of a configuration, for the select, and the CSS that paints them in the frame. */
export function sceneStyle(
  config: MagmaConfig,
  choices: ThemeChoices = NO_THEME_CHOICES,
): SceneStyle | null {
  let tokens: Parameters<typeof cssRgb>[0];
  try {
    tokens = createColorTokens(JSON.parse(JSON.stringify(config))).tokens as typeof tokens;
  } catch {
    return null;
  }
  const { extras } = themeFamilies(config, tokens.color);
  return {
    themes: configThemes(config, tokens.color, choices),
    css: [cssRgb(tokens, ''), themesExportCss(extras, choices, scaleOfFamily(config))].join('\n\n'),
  };
}
