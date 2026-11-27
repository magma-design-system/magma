import type { Mode } from '@maggioli-design-system/design-tokens/src/lib/contrast-gate.js';
import { withLook, withoutLook, type Looks } from '../engine/review.js';
import type { KeptIn } from './draft.js';
import type { StudioState } from './studio.js';

/*
  The looks of the full review (#1404): which theme the person looked at in which mode, as the
  print of what they saw (engine/review.ts). A signal of the state (studio.ts), kept in the storage
  of the studio beside the draft, so a reload keeps them; a preset opened starts with none, since
  nothing of it was looked at.
*/

export const LOOKS_KEY = 'magma-studio:looks';

/** The looks kept in the storage, else none. */
export function readLooks(storage: KeptIn): Looks {
  try {
    const stored = JSON.parse(storage?.getItem(LOOKS_KEY) ?? 'null');
    return stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {};
  } catch {
    return {};
  }
}

export function writeLooks(looks: Looks, storage: KeptIn): void {
  try {
    storage?.setItem(LOOKS_KEY, JSON.stringify(looks));
  } catch {
    /* storage blocked: the looks last until the page is left */
  }
}

/** The person looked at a theme in a mode: kept until a change touches it. */
export function markLooked(state: StudioState, family: string, mode: Mode): void {
  state.looks.value = withLook(state.looks.peek(), state.report.peek(), family, mode);
}

/** The person takes their look back. */
export function unmarkLooked(state: StudioState, family: string, mode: Mode): void {
  state.looks.value = withoutLook(state.looks.peek(), family, mode);
}
