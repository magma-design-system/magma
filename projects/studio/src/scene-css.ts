import type { MagmaConfig } from '@maggioli-design-system/design-tokens/src/lib/color.mjs';
import { createColorTokens } from '@maggioli-design-system/design-tokens/src/lib/color.mjs';
import { semantic } from '@maggioli-design-system/design-tokens/semantic.config';
import { namedThemeCss, themeOf } from '@maggioli-design-system/design-tokens/semantic.model';
import { cssRgb } from './formats.js';
import { SHIPPED_BY_FAMILY } from './themes.js';

/*
  What the frame of the Theme section needs to show the configuration the person edits, not only
  the Magma installed: its themes, for the select, and the CSS that paints them, written into the
  frame over the stylesheets of that Magma (shell.tsx, applyFrame). Both come from the code that
  writes the files Magma ships: the palette from the template of colors-rgb.css (formats.ts, the
  one the download uses), each theme from `namedThemeCss`, the function that writes themes.css.
*/

/** A theme of the configuration, by the family it is drawn from. */
export interface ConfigTheme {
  name: string;
  family: string;
}

export interface SceneStyle {
  /** The themes, the base first: the select of the Theme section offers them. */
  themes: ConfigTheme[];
  /** The palette and the block of each theme but the base, which is `:root`. */
  css: string;
}

type FamilyModes = Record<string, unknown>;

/**
 * The themes of a configuration are the families the Themes page lists (themes.tsx): each tint
 * opted into a surface, its text included, the base family first. A theme takes the name and the
 * accents of the theme Magma draws from its family, else the name of the family: the name a
 * person gives a theme on the Themes page lives in that page until the configuration keeps it.
 * A theme whose name is no theme name is left out, as the model refuses it.
 */
export function sceneStyle(config: MagmaConfig): SceneStyle | null {
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
  const tints = new Set(
    config.colors
      .filter((one) => !one.disabled && one.name.split('.')[0] === 'tone')
      .map((one) => one.name.split('.')[1]),
  );
  const families = Object.keys(surfaces).filter((family) => texts[family] && tints.has(family));
  const ordered = [
    ...(families.includes(semantic.tint) ? [semantic.tint] : []),
    ...families.filter((family) => family !== semantic.tint),
  ];

  const themes: ConfigTheme[] = [];
  const blocks: string[] = [];
  for (const family of ordered) {
    const shipped = SHIPPED_BY_FAMILY.get(family);
    const name = shipped?.name ?? family;
    if (family === semantic.tint) {
      themes.push({ name, family });
      continue;
    }
    try {
      blocks.push(namedThemeCss(themeOf(name, { surface: family, accents: shipped?.accents })));
      themes.push({ name, family });
    } catch {
      /* not a theme name: the model refuses it, the Themes page says why */
    }
  }
  return { themes, css: [cssRgb(tokens, ''), ...blocks].join('\n\n') };
}
