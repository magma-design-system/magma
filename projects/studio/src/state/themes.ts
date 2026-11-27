import { batch } from '@preact/signals';
import { moveChoices } from '../engine/theme-choices.js';
import { kindOfTheme } from '../engine/theme-list.js';
import { nameOfTheme } from '../engine/themes.js';
import { msg } from '../shared/i18n/text.js';
import type { StudioState } from './studio.js';
import { toggleSurface } from './surfaces.js';
import { undoably } from './undo.js';

/*
  The actions of the stage Themes that change the preset with the theme choices (#1404): a theme
  is a family that generates surfaces, so deleting a theme, or moving it to another tint, turns the
  surfaces of a family off or on, and moves its choices. Both take work away with no confirmation
  and are undone from a toast (state/undo.ts, which keeps the choices with the preset).
*/

/** The full name of the family a theme is drawn from (themes are keyed by the short one). */
const fullNameOf = (state: StudioState, family: string): string | undefined =>
  state.config.peek().colors.find((one) => one.name.split('.')[1] === family)?.name;

/**
 * Moves a theme of the product to another tint (#1404): the family it is drawn from stops
 * generating surfaces, the new one starts, and the name, the accents and the modes of the theme go
 * with it. `to` is the full name of the family (`label.blue`).
 */
export function moveTheme(state: StudioState, from: string, to: string): void {
  const short = to.split('.')[1] ?? to;
  if (short === from) return;
  const previous = state.themeChoices.peek();
  const name = nameOfTheme(from, previous);
  const source = fullNameOf(state, from);
  undoably(
    state,
    {
      text: msg('The theme {theme} takes its tint from {family}.'),
      vars: { theme: name, family: to },
    },
    () =>
      batch(() => {
        if (source) toggleSurface(state, source, false);
        toggleSurface(state, to, true);
        state.themeChoices.value = moveChoices(previous, from, short, name);
      }),
  );
}

/**
 * Deletes a theme (#1404): its family stops generating surfaces, and stays in the palette. The
 * base theme is `:root`, never deleted.
 */
export function deleteTheme(state: StudioState, family: string): void {
  const source = fullNameOf(state, family);
  if (!source || kindOfTheme(family) === 'base') return;
  const name = nameOfTheme(family, state.themeChoices.peek());
  undoably(state, { text: msg('The theme {theme} deleted.'), vars: { theme: name } }, () =>
    toggleSurface(state, source, false),
  );
}
