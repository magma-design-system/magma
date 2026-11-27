import type { ColorMode } from '@maggioli-design-system/design-tokens/src/lib/theme-manifest.mjs';

/*
  The choices a person makes on the Themes page, per family: the name of the theme, the variant
  each accent role points at, the colour modes it is used in. Only the changes are kept: what is
  missing is the theme Magma ships from the family, then the base (themes.ts). They belong to the
  studio, not to one page: the Theme section shows the theme as the Themes page defines it, a
  theme of one mode in that mode only (theme-section.tsx). They are kept in the storage of the studio
  beside the draft (a signal of the state, src/state/theme-choices.ts), so a reload keeps them, until the
  configuration keeps the themes itself (#694, the theme files of a project).
*/

export interface ThemeChoices {
  /** family -> the name given to its theme */
  names: Record<string, string>;
  /** family -> accent role -> the variant family it points at */
  accents: Record<string, Record<string, string>>;
  /** family -> the colour modes of its theme */
  modes: Record<string, readonly ColorMode[]>;
}

/** No choice: every theme as Magma ships it, or as its family. */
export const NO_THEME_CHOICES: ThemeChoices = { names: {}, accents: {}, modes: {} };
