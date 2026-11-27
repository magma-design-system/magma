import { batch } from '@preact/signals';
import { validateConfig } from '@maggioli-design-system/design-tokens/src/lib/schema.mjs';
import { presetInOrder } from '../engine/colour-order.js';
import { msg } from '../shared/i18n/text.js';
import { clearDraft, hashText, reconcileDraft, type DraftSource } from './draft.js';
import {
  adoptConfig,
  bundled,
  markExited,
  presetJson,
  ratiosOf,
  type CloneableConfig,
  type StudioState,
  type Text,
} from './studio.js';

/*
  Where the work comes from and where it goes (#1400, out of app.tsx): the start-up check of the
  draft against its source, a configuration imported, the Reset of the studio, the answer to a
  conflict, the save to the file a command serves and the build of the tokens on disk.

  A command serves the configuration when it answers /api/config (the `ui` command of
  design-tokens 15 did; the studio's own command comes with #695): the studio then saves it back
  to disk. On its own (the static site, a test), editing stays in the draft.
*/

/** An error that says a text of the studio, translated where it is drawn. */
class SaidError extends Error {
  constructor(readonly said: Text) {
    super(said.text);
  }
}

/** What an error said: its text, its message as it is, else the text given. */
const said = (error: unknown, fallback: Text): Text => {
  if (error instanceof SaidError) return error.said;
  if (error instanceof Error && error.message) return { text: error.message, plain: true };
  return fallback;
};

/** A text shown for a moment: it goes after `ms`, unless another took its place. */
function sayForAMoment(state: StudioState, text: Text, ms: number): void {
  state.status.value = text;
  setTimeout(() => {
    if (state.status.peek() === text) state.status.value = null;
  }, ms);
}

/**
 * The start-up check: when a command serves the configuration, the studio adopts the file on disk
 * and saves to it; in both modes, a restored draft is checked against the configuration it was
 * made on before it wins (reconcileDraft): it is kept, replaced by its source, or the person is
 * asked. Until it has run, the draft keeps its old stamp.
 */
export async function checkSource(state: StudioState): Promise<void> {
  let served: { path: string; config: CloneableConfig | null; readOnly?: string | null } | null =
    null;
  try {
    if (state.api) {
      const res = await fetch('/api/config');
      if (res.ok) served = await res.json();
    }
  } catch {
    // not served by a command: the source is the bundled default
  }
  const boot = state.boot;
  const fileConfig =
    served?.config && Array.isArray(served.config.colors) && served.config.colors.length > 0
      ? served.config
      : null;
  const sourceConfig = fileConfig ?? bundled();
  const json = JSON.stringify(sourceConfig);
  const source: DraftSource = served
    ? { path: served.path, hash: fileConfig ? hashText(json) : null }
    : { path: null, hash: hashText(json) };
  const decision = reconcileDraft(boot, source, json);
  batch(() => {
    if (served) {
      state.served.value = { path: served.path, readOnly: served.readOnly ?? null };
      // the file on disk is always what a save is measured against; with no file yet, the
      // bundled default is unsaved
      state.savedJson.value = fileConfig ? JSON.stringify(fileConfig) : null;
    }
    if (decision.use === 'source' && (boot || fileConfig)) adoptConfig(state, sourceConfig, true);
    else if (decision.use === 'ask')
      state.conflict.value = {
        reason: decision.reason,
        config: sourceConfig,
        label: fileConfig ? msg('Use the file on disk') : msg('Use the bundled config'),
      };
    // a draft written before drafts kept what was loaded (#1330) was made on this source
    if (boot && !boot.loadedRatios) state.loadedRatios.value = ratiosOf(sourceConfig);
    // a draft kept, written before drafts kept the last exit (#1402): its changes are counted
    // from the source it was made on
    if (decision.use === 'draft' && boot && !boot.baseline)
      state.baseline.value = presetJson(sourceConfig, state.themeChoices.peek());
    state.origin.value = { ...source, json };
  });
}

/**
 * The answer to a conflict: the source (`useSource`), which replaces the draft, or the draft,
 * which is then stamped on the source now there and keeps its edits unsaved.
 */
export function resolveConflict(state: StudioState, useSource: boolean): void {
  const conflict = state.conflict.peek();
  if (!conflict) return;
  batch(() => {
    if (useSource) adoptConfig(state, conflict.config, true);
    state.conflict.value = null;
  });
}

/** A file the person picks: its name, and its text. */
export interface PickedFile {
  name: string;
  text: () => Promise<string>;
}

/**
 * Imports a configuration from a file (the Config menu of the bar): checked against the schema
 * of design-tokens, then loaded, on its first family. What keeps it out is a notice of the pages
 * of Colors. Returns whether it was loaded.
 */
export async function importConfig(state: StudioState, file: PickedFile): Promise<boolean> {
  try {
    const parsed = JSON.parse(await file.text()) as CloneableConfig;
    const { valid, errors } = validateConfig(parsed);
    if (!valid)
      throw errors.length
        ? new Error(errors.slice(0, 3).join('; '))
        : new SaidError({ text: msg('it does not match the schema') });
    batch(() => {
      adoptConfig(state, parsed);
      state.notice.value = null;
    });
    return true;
  } catch (error) {
    const reason = said(error, { text: String(error), plain: true });
    state.notice.value = {
      text: msg('Could not load {file}: {error}'),
      vars: { file: file.name, error: reason },
    };
    return false;
  }
}

/**
 * The Reset of the studio: the configuration Magma builds with, on its first family, every local
 * change and the loaded configuration discarded.
 */
export function resetWork(state: StudioState): void {
  clearDraft(state.storage);
  batch(() => {
    adoptConfig(state, bundled());
    state.notice.value = null;
  });
}

/**
 * Saves the configuration to the file a command serves. Nothing happens on its own, while a save
 * is under way, when the server refuses saves, or while a conflict waits for an answer.
 */
export async function saveConfig(state: StudioState): Promise<void> {
  const served = state.served.peek();
  if (!served || state.saving.peek() || served.readOnly || state.conflict.peek()) return;
  batch(() => {
    state.saving.value = true;
    state.status.value = null;
  });
  const before = state.config.peek();
  // the preset goes out with its families in their order (engine/colour-order.ts): the first save
  // sorts a configuration once, and the work takes the order it went out in
  const config = presetInOrder(before);
  try {
    const res = await fetch('/api/config', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(config, null, 2) + '\n',
    });
    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { error?: string };
      throw err.error
        ? new Error(err.error)
        : new SaidError({ text: msg('save failed ({status})'), vars: { status: res.status } });
    }
    const written = (await res.json().catch(() => ({}))) as { path?: string };
    const json = JSON.stringify(config);
    batch(() => {
      // nothing changed while it was saved: the work is what went out, in its order
      if (state.config.peek() === before) state.config.value = config;
      state.savedJson.value = json;
      state.origin.value = { path: written.path ?? served.path, hash: hashText(json), json };
      // the preset left the studio: the changes are counted from it now
      if (state.json.peek() === json) markExited(state);
    });
    sayForAMoment(state, { text: msg('saved') }, 1500);
  } catch (error) {
    state.status.value = said(error, { text: msg('save failed') });
  } finally {
    state.saving.value = false;
  }
}

/** Builds the tokens on disk, through the command that serves the studio. */
export async function buildTokens(state: StudioState): Promise<void> {
  state.status.value = { text: msg('building...') };
  try {
    const res = await fetch('/api/build', { method: 'POST' });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok)
      throw data.error
        ? new Error(data.error)
        : new SaidError({ text: msg('build failed ({status})'), vars: { status: res.status } });
    sayForAMoment(state, { text: msg('tokens generated on disk') }, 2000);
  } catch (error) {
    state.status.value = said(error, { text: msg('build failed') });
  }
}
