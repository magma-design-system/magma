import { batch } from '@preact/signals';
import { fromBrandColour, fromReadyTheme, type ReadyTheme } from '../engine/opening.js';
import { NO_THEME_CHOICES } from '../engine/theme-choices.js';
import { msg } from '../shared/i18n/text.js';
import {
  adoptConfig,
  bundled,
  clone,
  updateConfig,
  type CloneableConfig,
  type StudioState,
  type Text,
  type WorkSnapshot,
} from './studio.js';
import { importConfig, type PickedFile } from './work.js';

/*
  The actions of the opening (#1402, studio.object-model.md, section 5): the preset to work on,
  opened from Magma's preset, a preset of a project, a ready theme or a brand colour
  (engine/opening.ts). Opening a preset takes the place of the work, so the changes count from it;
  a ready theme or a brand colour add a theme of the product to Magma's preset, and those count as
  changes of it. When the work had changes, the opening acts at once and keeps it for a toast that
  undoes it (confirm-action, `act-then-undo`; the object model, Change: "the actions that take work
  away do not ask"; vittorio, 2026-11-27); with no change, nothing is lost and nothing is kept.
*/

/** The work as it stands. */
function snapshot(state: StudioState): WorkSnapshot {
  return {
    config: clone(state.config.peek()),
    choices: clone(state.themeChoices.peek()),
    baseline: state.baseline.peek(),
    selectedName: state.selectedName.peek(),
    loadedRatios: clone(state.loadedRatios.peek()),
    colorsView: state.colorsView.peek(),
  };
}

/**
 * Opens a preset: Magma's, then the theme of the product an opening adds to it, the family it
 * selects; the work it takes the place of kept for the toast when it had changes.
 */
function open(
  state: StudioState,
  said: Text,
  opened: { config: CloneableConfig; choices: typeof NO_THEME_CHOICES; family?: string },
  base: CloneableConfig = bundled(),
): void {
  const previous = state.changes.peek().length ? snapshot(state) : null;
  batch(() => {
    // the preset opened, with no choice of its own: what the changes count from
    state.themeChoices.value = clone(NO_THEME_CHOICES);
    adoptConfig(state, base);
    // what the opening adds to it, a change of it
    if (opened.config !== base) updateConfig(state, (draft) => Object.assign(draft, opened.config));
    state.themeChoices.value = opened.choices;
    if (opened.family) state.selectedName.value = opened.family;
    state.colorsView.value = undefined;
    state.notice.value = null;
    state.lastOpening.value = previous && { said, previous };
  });
}

/** Opens the preset Magma builds with. */
export function openMagma(state: StudioState): void {
  const config = bundled();
  open(
    state,
    { text: msg("You opened Magma's preset.") },
    { config, choices: clone(NO_THEME_CHOICES) },
    config,
  );
}

/** Opens Magma's preset with a theme of the product drawn from a ready theme. */
export function openReadyTheme(state: StudioState, ready: ReadyTheme): void {
  const opened = fromReadyTheme(bundled(), clone(NO_THEME_CHOICES), ready);
  if (!opened) return;
  open(
    state,
    { text: msg('You opened a theme of yours from {theme}.'), vars: { theme: ready.name } },
    { ...opened, config: opened.config as CloneableConfig },
  );
}

/** Opens Magma's preset with a theme of the product from a brand colour. */
export function openBrandColour(state: StudioState, hex: string): void {
  const opened = fromBrandColour(bundled(), clone(NO_THEME_CHOICES), hex);
  if (!opened) return;
  open(
    state,
    { text: msg('You opened a theme of yours from {colour}.'), vars: { colour: hex } },
    { ...opened, config: opened.config as CloneableConfig },
  );
}

/**
 * Opens the preset of a project from its file (importConfig): with no choice of the themes of its
 * own; one the schema refuses changes nothing, the notice says why. Returns whether it opened.
 */
export async function openImported(state: StudioState, file: PickedFile): Promise<boolean> {
  const previous = state.changes.peek().length ? snapshot(state) : null;
  const choices = state.themeChoices.peek();
  state.themeChoices.value = clone(NO_THEME_CHOICES);
  const loaded = await importConfig(state, file);
  batch(() => {
    if (!loaded) {
      state.themeChoices.value = choices;
      return;
    }
    state.colorsView.value = undefined;
    state.lastOpening.value = previous && {
      said: { text: msg('You opened {file}.'), vars: { file: file.name } },
      previous,
    };
  });
  return loaded;
}

/** Undoes the last opening: the work it took the place of, as it stood. */
export function undoOpening(state: StudioState): void {
  const opening = state.lastOpening.peek();
  if (!opening) return;
  const { previous } = opening;
  batch(() => {
    state.config.value = previous.config;
    state.themeChoices.value = previous.choices;
    state.baseline.value = previous.baseline;
    state.selectedName.value = previous.selectedName;
    state.loadedRatios.value = previous.loadedRatios;
    state.colorsView.value = previous.colorsView;
    state.lastOpening.value = null;
  });
}

/** The toast closed: the work it kept goes. */
export function forgetOpening(state: StudioState): void {
  state.lastOpening.value = null;
}
