import { msg } from '../i18n/text.js';

/*
  What each role of the weights is for, in a few words (#1403, out of surfaces.tsx): Weights names
  the role beside its slider (the words chosen on the render of Weights, vittorio, 2026-11-27).
  The canvas of the surfaces that shared them went with the Themes page it was drawn on (#1404:
  the stage Themes shows the scene instead, vittorio, 2026-11-27).
*/

/** What each surface is for (SEMANTIC_COLOR_SPEC sections 6.1 and 6.3). */
export const SURFACE_PURPOSE: Record<string, string> = {
  sunken: msg('wells, insets'),
  muted: msg('zebra rows, sections'),
  default: msg('the canvas of the page'),
  raised: msg('cards, panels'),
  overlay: msg('modal, dropdown, tooltip'),
};
/** What each border is for. */
export const BORDER_PURPOSE: Record<string, string> = {
  muted: msg('dividers, cells'),
  default: msg('fields, buttons'),
  strong: msg('selected, focus, error'),
};
/** What each text role is for: they are chosen by APCA target (A7, SEMANTIC_COLOR_SPEC 9.1). */
export const TEXT_PURPOSE: Record<string, string> = {
  default: msg('body, primary data'),
  muted: msg('essential secondary text'),
  subtle: msg('captions, hints'),
  disabled: msg('disabled'),
};
