import { exportOf, selectionOf, type ExportKind } from '../engine/exports.js';
import { msg } from '../shared/i18n/text.js';
import { markExited, type ExportAction, type StudioState } from './studio.js';
import { saveConfig } from './work.js';

/*
  What hands the configuration out of the studio (#1400, out of app.tsx), each through the
  contrast gate (#698): an export while the gate fails asks first, never the silent default. The
  dialog that asks is the shell's (app/shell.tsx), drawn from `pendingExport`, so the Config menu of
  the bar exports from any section.
*/

/** Runs an export, or, while the gate fails, holds it for the dialog of the gate to ask first. */
export function guard(state: StudioState, action: ExportAction): void {
  if (state.verdict.peek().state === 'fail') state.pendingExport.value = action;
  else void action.run();
}

/** The person exports anyway: the action held runs. */
export function confirmExport(state: StudioState): void {
  const action = state.pendingExport.peek();
  state.pendingExport.value = null;
  void action?.run();
}

/** The preset downloaded as JSON: once it has left, the changes are counted from it. */
export function downloadPreset(state: StudioState): ExportAction {
  return {
    label: msg('Download the preset'),
    proceed: msg('Download anyway'),
    run: () => {
      exportConfig(state, 'config');
      markExited(state);
    },
  };
}

/**
 * The exit of the preset (the register: exit), the way forward of the last stage and the action
 * of the bar: saved into the file a command serves when it takes saves, downloaded as JSON on its
 * own (the site on Pages, a command that refuses saves). Run it through `guard`, which asks first
 * while the gate fails (object model, Verification: leaving with it red is allowed, asking). Once
 * the preset has left, the changes are counted from it (markExited; a save marks it on success).
 */
export function exitOf(state: StudioState): ExportAction {
  const served = state.served.peek();
  return served && !served.readOnly
    ? { label: msg('Save the preset'), proceed: msg('Save anyway'), run: () => saveConfig(state) }
    : downloadPreset(state);
}

/** The person does not export: the action held goes. */
export function cancelExport(state: StudioState): void {
  state.pendingExport.value = null;
}

/** The configuration as JSON, copied to the clipboard. */
export async function copyConfig(state: StudioState): Promise<void> {
  await navigator.clipboard.writeText(JSON.stringify(state.config.peek(), null, 2) + '\n');
}

/** What keeps a file of each export from being built, in the notice of the pages of Colors. */
const FAILURES: Record<Exclude<ExportKind, 'config'>, string> = {
  zip: msg('Could not build the zip: {error}'),
  figma: msg('Could not build the Figma tokens: {error}'),
  css: msg('Could not build the CSS: {error}'),
  gimp: msg('Could not build the palette: {error}'),
};

const messageOf = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

/**
 * Hands the person a file of the configuration (engine/exports.ts). The configuration itself
 * always is; the tokens may not be, when the generator refuses it: the notice says why.
 */
export function exportConfig(state: StudioState, kind: ExportKind): void {
  if (kind === 'config') {
    state.download(exportOf(state.config.peek(), kind));
    return;
  }
  try {
    state.download(exportOf(state.config.peek(), kind));
    state.notice.value = null;
  } catch (error) {
    state.notice.value = { text: FAILURES[kind], vars: { error: messageOf(error) } };
  }
}

/** Hands the person the tokens of the families named (the Batch export of Groups). */
export function exportSelection(state: StudioState, names: string[]): void {
  try {
    state.download(selectionOf(state.config.peek(), names));
    state.notice.value = null;
  } catch (error) {
    state.notice.value = {
      text: msg('Could not export the selection: {error}'),
      vars: { error: messageOf(error) },
    };
  }
}
