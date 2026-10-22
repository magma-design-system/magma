/*
  What each group of the global tokens is for, in one line (#1095): the `$description` of the
  group in the DTCG export (dist/dtcg/base.tokens.json), and of each typography style. The
  semantic roles and the groups of their layer are described in semantic.config.ts (#876);
  this file covers the rest of the set. A group is described by what it is for, never by how
  it is built. The steps of a ramp are explained once, on `palette`, not one by one.

  buildDtcg() fails on a group that nothing here describes, and on an entry that describes
  nothing, so a new group cannot ship bare and a renamed one cannot leave a stale line.
*/

/** Groups and tokens of the base set, by their DTCG path. */
export const tokenDescriptions: Record<string, string> = {
  magma:
    'The semantic layer: the roles UI code paints with, which follow the mode, the named theme and the contrast preference.',

  palette:
    'The colour primitives the semantic roles are built from: they follow the light and dark mode, not the named themes or the contrast preference. Each ramp runs from 01, the most contrast against the page, to 10, the closest to it.',
  'palette.tone':
    'Neutral ramps behind the neutral roles and the named themes: paint with the roles, not with these. seed is the pure extreme of the mode, white in light and black in dark, for a knockout.',
  'palette.tone.neutral': 'The grey ramp behind the neutral roles of the default theme.',
  'palette.tone.porcelain': 'The cool grey ramp behind the cool theme.',
  'palette.tone.bisque': 'The warm grey ramp behind the warm theme.',
  'palette.tone.kaolin': 'Another neutral ramp: no role or theme uses it today.',
  'palette.tone.fireclay': 'Another neutral ramp: no role or theme uses it today.',
  'palette.status':
    'The status ramps behind the status roles (magma.info, magma.success, magma.warning, magma.danger); the bare family name is its key colour.',
  'palette.status.info': 'The info ramp: notices and help.',
  'palette.status.success': 'The success ramp: completed and positive states.',
  'palette.status.warning': 'The warning ramp: states that need attention.',
  'palette.status.error':
    'The error ramp, behind the danger roles: errors and destructive actions.',
  'palette.label':
    'Twelve categorical hues for colour that encodes data, such as a category, a tag or a colour picked by the person: UI code may paint with them directly.',
  'palette.variant':
    'The ramps behind the accents, each an alias of a brand or label ramp, step by step.',
  'palette.variant.primary':
    'The brand accent ramp behind magma.accent: an alias of brand.maggioli.',
  'palette.variant.secondary':
    'A legacy ramp no role uses, an alias of brand.maggioli-editore: the secondary variant of a component renders like primary.',
  'palette.variant.ai': 'The AI accent ramp behind magma.accent-ai: an alias of label.violet.',
  'palette.brand':
    'The Maggioli brand palettes, for brand identity such as logo containers and brand panels: UI code may paint with them directly.',
  'palette.brand.maggioli': 'The Maggioli brand colour, also the brand accent of the interface.',
  'palette.brand.maggioli-editore': 'The Maggioli Editore brand colour.',
  'palette.brand.rnd': 'The Maggioli R&D brand colour.',
  'palette.surface':
    'Background ladders by elevation (sunken, muted, default, raised, overlay), one per family: the neutral ones are behind the surface roles of each theme, no role uses the status ones today.',
  'palette.border':
    'Border ladders (muted, default, strong), one per neutral and status family: the primitives behind the border roles.',
  'palette.text':
    'Text ladders (default, muted, subtle, disabled), one per neutral and status family, solved for contrast: the primitives behind the text roles.',

  size: 'The primitive length scale that spacing, container, border and radius name: size.100 is 4px, size.400 is 16px. The CSS publishes the resolved values, not these.',
  font: 'The four font families, used through the typography styles: title (Roboto), info (Karla), read (Merriweather), code (Roboto Mono).',
  'text-size':
    'The parts of each typography style as custom properties: set text with the whole style (typography), not by composing its parts.',

  typography:
    'Text styles as one unit (family, size, weight, letter spacing, line height): set UI text with them, through the text-* utilities or the typography-* classes.',
  'typography.title': 'Roboto styles for headings and actions.',
  'typography.title.h1': 'The largest heading: the title of a page.',
  'typography.title.h2': 'Heading level 2: the sections of a page.',
  'typography.title.h3': 'Heading level 3: the subsections of a page.',
  'typography.title.h4': 'Heading level 4, for the next level down.',
  'typography.title.h5': 'Heading level 5, the smallest in black weight.',
  'typography.title.h6':
    'The smallest heading, bold rather than black: the title of a card, a banner or a notification.',
  'typography.title.action': 'The label of buttons and other actions.',
  'typography.info': 'Karla styles for interface text.',
  'typography.info.paragraph': 'The largest interface text: lead paragraphs and introductions.',
  'typography.info.detail': 'The default interface text, the most used: body copy and values.',
  'typography.info.caption': 'Smaller interface text: descriptions, helper text, metadata.',
  'typography.info.label': 'Short bold labels: field labels, table headers, the names of figures.',
  'typography.info.option':
    'The smallest bold text, on one line: counters, steps, the items of a filter.',
  'typography.info.tip': 'Small text for hints and short messages under a control.',
  'typography.read': 'Merriweather styles for long reading, such as articles and documents.',
  'typography.read.paragraph': 'The body of long reading, in light weight.',
  'typography.read.detail': 'Long reading at the regular interface size.',
  'typography.read.caption': 'Captions and notes of long reading.',
  'typography.code': 'Roboto Mono styles for code.',
  'typography.code.snippet': 'Code blocks and inline code.',
  'typography.code.hack':
    'Compact monospaced text: code inside interface text, values typed by hand such as dates.',

  leading:
    'Line heights as lengths, from 2xs (10px) to 4xl (48px), which the typography styles name.',
  spacing:
    'Spacing: --spacing is the step of the numeric utilities (p-400 is 400 times it, 16px); none to 4xl are named steps of the size scale; phrase, prose, text and title are line lengths in ch.',
  container:
    'Widths for layout boxes, from 4xs (128px) to 7xl (1280px): what a size name means on w-*, max-w-*, min-w-* and basis-*.',
  breakpoint:
    'The screen widths where the layout changes, from mobile (480px) to tv (1920px): the minimum of each range behind the mobile: to tv: prefixes.',
  aspect: 'Aspect ratios for media and frames, width over height: book is an alias of a4.',
  border: 'Border widths, from xs (1px) to xl (5px).',
  radius:
    'Corner radii in two scales, round and squircle-* (about 1.7 times larger for the same visual corner): UI code uses --magma-radius-*, which picks the scale of the active corner shape.',
  shadow:
    'Box shadows: xs to 2xl by elevation (the -sharp ones add a 1px contact edge), inset-* for recessed wells, the glow, box, outline and highlight composites, and ring-*, borders drawn with box-shadow in the neutral ink, which follow the mode.',
  duration: 'Durations for transitions and animations, named by their length in milliseconds.',
  ease: 'Easing curves by family, sine to expo plus back, which overshoots: in- accelerates (exits), out- decelerates (entrances), in-out- moves within the view.',
  'transition-property':
    'Lists of properties to transition together: cosmetic (colours, shadows, sizes, transforms) and size (height, width, margin, padding).',
};

/** The ladders of `palette`: one per family, described by a rule, not one by one. */
const LADDERS = ['surface', 'border', 'text'];

/**
 * The description of a group or token of the base set, by its DTCG path: its own entry, else
 * the rule of its kind (a label hue, a family of a ladder, the parts of a typography style).
 * Undefined when nothing describes it.
 */
export const tokenDescription = (path: string[]): string | undefined => {
  const own = tokenDescriptions[path.join('.')];
  if (own) return own;
  const [group, family, style] = path;
  if (group === 'palette' && path.length === 3) {
    if (family === 'label') return `The ${style} hue of the categorical palette.`;
    if (LADDERS.includes(family)) return `The ${family} ladder of the ${style} family.`;
  }
  if (group === 'text-size' && path.length === 2) return `The parts of the ${family} styles.`;
  if (group === 'text-size' && path.length === 3)
    return `The size of the ${family} ${style} style, with its weight, letter spacing and line height.`;
  return undefined;
};
