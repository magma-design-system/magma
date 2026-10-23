/*
  What each global of styles is for, in one line (#1095): the `$description` of its token
  and of its group in dist/dtcg/globals.tokens.json, and so of its entry in the consumption
  map. The same rules as design-tokens' descriptions.config.ts: a global is described by
  what it is for, never by how it is built; the long form stays in SPEC.md, "Global
  tokens". buildGlobals() fails on a group or a token nothing here describes, and on an
  entry that describes nothing.
*/
import { tokenDescriptions } from '../../../design-tokens/descriptions.config';

/** The floating layers of the stacking scale, by the group of their z-index. */
const LAYERS: Record<string, string> = {
  header: 'the header',
  notification: 'notifications',
  modal: 'modals',
  dropdown: 'dropdowns',
  tooltip: 'tooltips',
  theme: 'the theme overlay',
  context: 'context menus',
};

/** Groups and tokens of the globals set, by their DTCG path. */
export const globalDescriptions: Record<string, string> = {
  // the same group as in design-tokens' base set: the resolver merges the two
  magma: tokenDescriptions.magma,
  'magma.pref':
    'The preferences the mds-pref components write on the html element: read them to adapt, never set them by hand.',

  'magma.backdrop':
    'The scrim behind modals and drawers: its colour, opacity, blur, entrance and stacking level.',
  'magma.backdrop.$root': 'The scrim as one colour, with its opacity.',
  'magma.backdrop.color':
    'The colour of the scrim, black in both modes; the elevation shadows draw with it too.',
  'magma.backdrop.opacity': 'How much the scrim darkens the page.',
  'magma.backdrop.blur': 'How much the scrim blurs the page behind it.',
  'magma.backdrop.animation-duration': 'How long the scrim takes to fade in.',
  'magma.backdrop.z-index': 'The stacking level of the scrim, between modals and dropdowns.',

  'magma.overlay':
    'The scrim of mds-modal: its colour and blur are the backdrop ones, its opacity is its own.',
  'magma.overlay.$root': 'The scrim of mds-modal as one colour, with its opacity.',
  'magma.overlay.color': 'The colour of the modal scrim: the backdrop colour.',
  'magma.overlay.opacity': 'How much the modal scrim darkens the page.',
  'magma.overlay.blur': 'How much the modal scrim blurs the page: the backdrop blur.',
  'magma.on': 'Ink on the scrims.',
  'magma.on.backdrop':
    'Text and icons on the scrim, such as the close icon of a modal: light in both modes, as the scrim is black in both.',

  'magma.outline':
    'The focus ring, and the transparent ring of an element without focus: the focus effects move between the two.',
  'magma.outline.focus': 'The focus ring: width, style and colour.',
  'magma.outline.focus-color': 'The colour of the focus ring.',
  'magma.outline.focus-offset': 'The gap between the focus ring and the element.',
  'magma.outline.blur': 'The ring of an element without focus: transparent.',
  'magma.outline.blur-color': 'The colour of the ring without focus: transparent.',
  'magma.outline.blur-offset':
    'The gap of the ring without focus, wider than the focus one: the focus ring closes in from it, or pulses out to it.',
  'magma.outline.animation-duration': 'How long one pulse of the focus ring takes.',

  'magma.disabled': 'How disabled components fade.',
  'magma.disabled.opacity': 'The opacity of disabled components.',
  'magma.selection': 'The colours of selected text.',
  'magma.selection.background': 'The background of selected text.',
  'magma.selection.color': 'The colour of selected text.',

  'magma.corner':
    'The corner axis: the shape of the corners, and how much of its height a corner may take.',
  'magma.corner.cap':
    'The part of its height a corner may take, for the controls whose radius is past half their height.',
  'magma.radius':
    'The radius scale of the active corner shape: what components and UI code round corners with.',
  'magma.radius.none': 'No rounding.',
  'magma.radius.full': 'The pill, the same under every corner shape.',

  'magma.view': 'The view transitions between pages.',

  depth:
    'The depth axis, from 0 to 1: how strong the elevation shadows are. data-theme-depth="flat" sets it to 0.',
  mds: 'Globals the components share.',
  'mds.elevation': 'The shadows of the raised and overlay surfaces, scaled by the depth axis.',
  'mds.elevation.raised': 'The shadow of a raised surface, such as a card.',
  'mds.elevation.overlay': 'The shadow of an overlay surface, such as a dropdown or a popover.',
};

/**
 * The globals DTCG has no type for (a keyword, an enumeration), by custom property: they
 * are listed in the `cssOnly` extension of their group, each with its line.
 */
export const cssOnlyDescriptions: Record<string, string> = {
  '--magma-corner-shape':
    'The shape of the corners: set it through data-corner-shape, which changes the radius scale with it.',
  '--magma-view-transition-navigation':
    'Whether a navigation between pages animates as a view transition.',
};

/** The line of a global listed in `cssOnly`: its own entry, else the rule of a preference. */
export const cssOnlyDescription = (name: string): string | undefined => {
  if (cssOnlyDescriptions[name]) return cssOnlyDescriptions[name];
  const preference = /^--magma-pref-([a-z-]+)$/.exec(name);
  if (preference)
    return `The active ${preference[1]} preference, as the mds-pref components write it: read it, never set it.`;
  return undefined;
};

/**
 * The description of a group or token of the globals set, by its DTCG path: its own entry,
 * else the rule of its kind (a step of the radius scale, a layer of the stacking scale).
 * Undefined when nothing describes it.
 */
export const globalDescription = (path: string[]): string | undefined => {
  const own = globalDescriptions[path.join('.')];
  if (own) return own;
  const [prefix, group, key] = path;
  if (prefix !== 'magma') return undefined;
  if (group === 'radius' && key)
    return `The ${key} corner radius, on the scale of the active corner shape.`;
  const layer = LAYERS[group];
  if (layer && path.length === 2) return `The stacking level of ${layer}.`;
  if (layer && key?.endsWith('z-index'))
    return `The z-index of ${layer}, on the stacking scale of the floating layers: slot your own layers between its steps.`;
  return undefined;
};
