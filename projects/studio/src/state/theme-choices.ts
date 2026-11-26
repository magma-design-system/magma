import type { ColorMode } from '@maggioli-design-system/design-tokens/src/lib/theme-manifest.mjs';
import { NO_THEME_CHOICES, type ThemeChoices } from '../engine/theme-choices.js';
import type { KeptIn } from './draft.js';
import type { StudioState } from './studio.js';

/*
  The theme choices of the work (#1400): a signal of the state (studio.ts), kept in the storage of
  the studio beside the draft, so a reload keeps them, until the configuration keeps the themes
  itself (#694). The choices themselves, and what no choice means, are the model of
  engine/theme-choices.ts; the actions of the Themes page change them, one family at a time.
*/

export const THEME_CHOICES_KEY = 'magma-studio:theme-choices';

/** The choices kept in the storage, else none. */
export function readThemeChoices(storage: KeptIn): ThemeChoices {
  try {
    const stored = JSON.parse(storage?.getItem(THEME_CHOICES_KEY) ?? 'null');
    return stored && typeof stored === 'object'
      ? { ...NO_THEME_CHOICES, ...stored }
      : NO_THEME_CHOICES;
  } catch {
    return NO_THEME_CHOICES;
  }
}

export function writeThemeChoices(choices: ThemeChoices, storage: KeptIn): void {
  try {
    storage?.setItem(THEME_CHOICES_KEY, JSON.stringify(choices));
  } catch {
    /* storage blocked: the choices last until the page is left */
  }
}

/** The name a person gives the theme of a family. */
export function setThemeName(state: StudioState, family: string, name: string): void {
  const prev = state.themeChoices.peek();
  state.themeChoices.value = { ...prev, names: { ...prev.names, [family]: name } };
}

/** The variant an accent role of the theme of a family points at. */
export function setThemeAccent(
  state: StudioState,
  family: string,
  role: string,
  variant: string,
): void {
  const prev = state.themeChoices.peek();
  state.themeChoices.value = {
    ...prev,
    accents: { ...prev.accents, [family]: { ...prev.accents[family], [role]: variant } },
  };
}

/** The colour modes the theme of a family is used in. */
export function setThemeModes(
  state: StudioState,
  family: string,
  modes: readonly ColorMode[],
): void {
  const prev = state.themeChoices.peek();
  state.themeChoices.value = { ...prev, modes: { ...prev.modes, [family]: modes } };
}

/** Forgets every choice: every theme as Magma ships it, or as its family. */
export function resetThemeChoices(state: StudioState): void {
  state.themeChoices.value = NO_THEME_CHOICES;
}
