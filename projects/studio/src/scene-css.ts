import type { MagmaConfig } from '@maggioli-design-system/design-tokens/src/lib/color.mjs';
import { createColorTokens } from '@maggioli-design-system/design-tokens/src/lib/color.mjs';
import { semantic } from '@maggioli-design-system/design-tokens/semantic.config';
import type { ColorMode } from '@maggioli-design-system/design-tokens/src/lib/theme-manifest.mjs';
import { cssRgb } from './formats.js';
import { REQUIRED_SURFACE_GROUPS } from './surfaces.js';
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
 * The themes of a configuration are the families the Themes page lists (themes.tsx): each family
 * of any group opted into a surface, its text included, the base family first, save the ones a
 * required group (status) carries with no flag of their own; a family that is not a tone repoints
 * the ramp of its group (`label-violet`). A theme whose name the model refuses is left out of the
 * select: the Themes page says why.
 */
export function sceneStyle(
  config: MagmaConfig,
  choices: ThemeChoices = NO_THEME_CHOICES,
): SceneStyle | null {
  let color: Record<string, unknown>;
  let tokens: Parameters<typeof cssRgb>[0];
  try {
    tokens = createColorTokens(JSON.parse(JSON.stringify(config))).tokens as typeof tokens;
    color = tokens.color;
  } catch {
    return null;
  }
  const surfaces = (color.surface as Record<string, FamilyModes>) ?? {};
  const texts = (color.text as Record<string, FamilyModes>) ?? {};
  const groupOf = new Map(
    config.colors.map((one) => [one.name.split('.')[1], one.name.split('.')[0]]),
  );
  const themeable = new Set(
    config.colors
      .filter((one) => !one.disabled)
      .filter(
        (one) =>
          !(REQUIRED_SURFACE_GROUPS.has(one.name.split('.')[0]) && one.surface === undefined),
      )
      .map((one) => one.name.split('.')[1]),
  );
  const scaleOf = (family: string): string | undefined => {
    const group = groupOf.get(family);
    return group && group !== 'tone' ? `${group}-${family}` : undefined;
  };
  const families = Object.keys(surfaces).filter((family) => texts[family] && themeable.has(family));
  const extras = families.filter((family) => family !== semantic.tint);
  const ordered = [...(families.includes(semantic.tint) ? [semantic.tint] : []), ...extras];

  const givenNames = givenNamesOf(extras, choices);
  const themes: ConfigTheme[] = ordered
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
  return {
    themes,
    css: [cssRgb(tokens, ''), themesExportCss(extras, choices, scaleOf)].join('\n\n'),
  };
}
