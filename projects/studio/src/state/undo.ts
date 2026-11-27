import { batch } from '@preact/signals';
import { clone, type StudioState, type Text } from './studio.js';

/*
  The actions that take work away with no confirmation, undone from a toast (#1403; the opening
  has its own, state/opening.ts): the object model wants every one of them undone, never confirmed
  (section 9, "Le azioni distruttive si annullano, senza conferma"; confirm-action, act-then-undo).
  The state keeps the preset before the action while the toast is open; an edit after it closes
  the toast (studio.ts), so Undo never takes back more than the action did.
*/

/**
 * Runs an action that takes work away, kept for Undo with what the toast says: the preset, the
 * family selected and the theme choices before it (a theme deleted or moved to another tint
 * changes both the preset and the choices, #1404).
 */
export function undoably(state: StudioState, said: Text, act: () => void): void {
  const before = clone(state.config.peek());
  const selectedName = state.selectedName.peek();
  const choices = state.themeChoices.peek();
  batch(() => {
    act();
    state.lastUndo.value = { said, before, selectedName, choices, after: state.json.peek() };
  });
}

/** Takes the preset back to where it was before the action, its family selected again. */
export function undoLast(state: StudioState): void {
  const undo = state.lastUndo.peek();
  if (!undo) return;
  batch(() => {
    state.lastUndo.value = null;
    state.config.value = clone(undo.before);
    state.selectedName.value = undo.selectedName;
    state.themeChoices.value = undo.choices;
  });
}

/** Closes the toast: nothing to undo any more. */
export function forgetUndo(state: StudioState): void {
  state.lastUndo.value = null;
}
