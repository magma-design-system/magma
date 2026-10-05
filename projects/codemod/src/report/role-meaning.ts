/**
 * What a semantic role is for, in a few words: the column the Markdown report
 * prints next to each alternative. It is the role's meaning in the system
 * (projects/styles/SEMANTIC_COLOR_SPEC.md, section 6), not a guess about the
 * element being migrated: the codemod sees a colour, never what the element is.
 */

const UTILITY =
  /^(?:bg|text|fill|stroke|ring-offset|ring|outline|divide|from|via|to|shadow|decoration|caret|placeholder|accent|border(?:-[trblxyse])?)-/;

const SURFACE: Record<string, string> = {
  sunken: 'sunken well: insets, code blocks, tracks',
  muted: 'same-plane grouping: zebra rows, subtle sections',
  default: 'the page canvas',
  raised: 'raised: cards, panels, sticky headers',
  overlay: 'floating: modal, dropdown, popover, tooltip',
  inverse: 'inverse fill: tooltip, toast, dark button',
  'inverse-muted': 'softer inverse fill: weak tone, hover of the inverse fill',
};

const WASH: Record<string, string> = {
  soft: 'faintest pill: zebra rows on a card, resting track',
  base: 'default pill: chip ground, disabled fill',
  strong: 'marked pill: hover on a pill, selected track',
};

const FG: Record<string, string> = {
  default: 'body text and icons',
  muted: 'secondary text',
  subtle: 'tertiary text: hints, captions',
  disabled: 'disabled text',
  'on-emphasis': 'text on a solid fill',
};

const BORDER: Record<string, string> = {
  muted: 'decorative divider: grid, rows, cells',
  default: 'functional outline: inputs, controls',
  strong: 'assertive border: a state',
  focus: 'focus ring',
};

const EMPHASIS: Record<string, string> = {
  '': 'solid fill: button, solid badge',
  hover: 'solid fill, hovered',
  active: 'solid fill, pressed',
};

const ACCENT: Record<string, string> = {
  surface: 'tinted background: selected item, active tab',
  'surface-hover': 'tinted background, hovered',
  'surface-subtle': 'lighter tinted background',
  fg: 'text and icons',
  border: 'border',
  emphasis: 'solid fill: primary button',
  'emphasis-hover': 'solid fill, hovered',
  'emphasis-active': 'solid fill, pressed',
  'on-emphasis': 'text on the solid fill',
};

const HUES: Record<string, string> = {
  info: 'info',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
};

const RAW = /^(?:tone|status|label|brand|area|adjust|theme|variant)-/;

/** The role a utility class names: variants, opacity and utility prefix stripped. */
const roleOf = (value: string): string =>
  value
    .slice(value.lastIndexOf(':') + 1)
    .replace(/\/[\d.]+$/, '')
    .replace(UTILITY, '');

/** A short meaning for a utility class naming a colour, or undefined when unknown. */
export const roleMeaning = (value: string): string | undefined => {
  const role = roleOf(value);
  let m: RegExpExecArray | null;
  if ((m = /^surface-(.+)$/.exec(role))) return SURFACE[m[1]!];
  if (role === 'on-inverse') return 'text and icons on an inverse fill';
  if ((m = /^wash-(\w+)$/.exec(role))) return WASH[m[1]!];
  if ((m = /^fg-(.+)$/.exec(role))) return FG[m[1]!];
  if ((m = /^border-(\w+)$/.exec(role))) return BORDER[m[1]!];
  if (role === 'neutral-border') return 'neutral border';
  if ((m = /^accent(-ai)?-(.+)$/.exec(role))) {
    const what = ACCENT[m[2]!];
    return what && `${m[1] ? 'AI accent' : 'accent'} ${what}`;
  }
  if ((m = /^(info|success|warning|danger)-(.+)$/.exec(role))) {
    const hue = HUES[m[1]!]!;
    const rest = m[2]!;
    if ((m = /^wash-(\w+)$/.exec(rest))) return WASH[m[1]!] && `${hue}-tinted ${WASH[m[1]!]}`;
    if ((m = /^fg-(.+)$/.exec(rest))) return FG[m[1]!] && `${hue} ${FG[m[1]!]}`;
    if ((m = /^border-(\w+)$/.exec(rest))) return BORDER[m[1]!] && `${hue} ${BORDER[m[1]!]}`;
    if (rest === 'on-emphasis') return `text on the ${hue} solid fill`;
    if ((m = /^emphasis(?:-(hover|active))?$/.exec(rest))) return `${hue} ${EMPHASIS[m[1] ?? '']}`;
    if (rest === 'surface') return `${hue}-tinted ${WASH.base}`;
    if (rest === 'fg') return `${hue} ${FG.default}`;
    if (rest === 'border') return `${hue} ${BORDER.default}`;
    return undefined;
  }
  if (RAW.test(role)) return 'raw palette step: a fixed colour, does not follow themes';
  return undefined;
};
