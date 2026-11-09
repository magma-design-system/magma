import type { MagmaConfig } from '@maggioli-design-system/design-tokens/src/lib/color.mjs';

// the working state is mirrored to localStorage so a reload keeps the edited
// or loaded configuration instead of falling back to the source config. The key
// is the one of the tokens playground the studio comes from, so a draft made
// there survives the move (same origin, same port)
export const DRAFT_STORAGE_KEY = 'magma-design-tokens:playground:draft';

/**
 * The config a draft was made on: the file a server serves (`path`), or the
 * bundled default when the studio runs on its own (`path` null).
 * `hash` fingerprints its content, null when the server found no file.
 */
export interface DraftSource {
  path: string | null;
  hash: string | null;
}

/**
 * The scales a configuration writes (its `ratios`), by formula, then by name: a null entry deletes
 * a built-in scale (app.tsx).
 */
export type LoadedRatios = Record<string, Record<string, number[] | null>>;

export interface StudioDraft<View extends string = string> {
  config: MagmaConfig & Record<string, unknown>;
  selectedName: string;
  view: View;
  /** missing in drafts written before the source was recorded */
  source?: DraftSource;
  /** whether the draft config differs from its source config */
  edited?: boolean;
  /**
   * The scales of the configuration last loaded, what the Reset of a scale takes it back to
   * (app.tsx, #1330); missing in drafts written before it.
   */
  loadedRatios?: LoadedRatios;
}

export type DraftDecision =
  /** keep the draft: it was made on the source the studio has now */
  | { use: 'draft' }
  /** show the source config: no draft, or one with nothing of its own */
  | { use: 'source' }
  /** the source changed under unsaved edits: let the user pick */
  | { use: 'ask'; reason: string };

// cyrb53: a fast, synchronous 53-bit string hash. A fingerprint only has to
// tell two configs apart, and crypto.subtle is missing outside secure contexts
export function hashText(text: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

function sourceLabel(path: string | null): string {
  return path ?? 'the bundled config';
}

/**
 * Decides what the studio shows at start when a draft was restored:
 * `sourceJson` is the JSON of the config it would show without one (the file
 * on disk, or the bundled default when there is no file or no server).
 */
export function reconcileDraft(
  draft: StudioDraft | null,
  source: DraftSource,
  sourceJson: string,
): DraftDecision {
  if (!draft) return { use: 'source' };
  const from = draft.source;
  if (from && from.path === source.path && from.hash === source.hash) return { use: 'draft' };
  // nothing to lose or to choose between
  if (JSON.stringify(draft.config) === sourceJson) return { use: 'source' };
  // a draft with no edits of its own only mirrored its old source
  if (from && draft.edited === false) return { use: 'source' };

  let why: string;
  if (!from) {
    why = `this draft comes from an older studio and may not match ${sourceLabel(source.path)}`;
  } else if (from.path !== source.path) {
    why = `this draft was made on ${sourceLabel(from.path)}, the studio now shows ${sourceLabel(source.path)}`;
  } else if (source.hash === null) {
    why = `${sourceLabel(source.path)} was removed after this draft was saved`;
  } else if (from.hash === null) {
    why = `${sourceLabel(source.path)} was created after this draft was saved`;
  } else {
    why = `${sourceLabel(source.path)} changed after this draft was saved`;
  }
  return { use: 'ask', reason: why };
}

export function readDraft(): StudioDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as StudioDraft;
    if (!draft.config || !Array.isArray(draft.config.colors) || draft.config.colors.length === 0) {
      return null;
    }
    return draft;
  } catch {
    return null;
  }
}

export function writeDraft(draft: StudioDraft): void {
  try {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // storage disabled or full: persistence is best-effort
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch {
    // ignore
  }
}
