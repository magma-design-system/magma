/**
 * Runtime v2 -> v3 migration manifest: the breaking changes of Magma 3 (epic
 * #1292). Written by hand, not drafted from a docs diff: each breaking part of
 * the epic adds its rules here, in its own pull request, with its source next
 * to it.
 *
 * #918, category N: the colour tokens are full colours (`rgb(r g b)`), no
 * longer three channels.
 *  - `colorTokens`: every custom property Magma publishes as a colour, so the
 *    reads `rgb(var(--x))` and the channel definitions `--x: r g b` of those
 *    names (and of no other) are rewritten. The bulk is generated from the DTCG
 *    sets of design-tokens and styles (`color-tokens.generated.ts`); the
 *    colour properties that are not tokens are listed below.
 *  - the component properties that took channels and lose their `-rgb`, as the
 *    API snapshot of the #918 commit records them (961e913c1, `magma.api.txt`):
 *    the four public ones of the inputs, and the two internal ones of
 *    `mds-button` and `mds-dropdown`, which the v1 -> v2 manifest wrote into
 *    products (`--mds-button-border-color` -> `-rgb`), so a run from Magma 1 has
 *    to bring them back. `--mds-input-date-icon-color-rgb`, deprecated and read
 *    by nothing, is gone.
 *
 * #1218, category O: the title of an item of an accordion is `h6` by default,
 * no longer `h5`. Reported, not rewritten, see {@link titleOfAPart}.
 */
import { colorTokenNames } from './color-tokens.generated.js';
import { type CssVarRenameRule, type EnsureAttrRule, type Manifest } from './schema.js';

/**
 * The colour custom properties that are not tokens, by their v3 name: the
 * component properties that took channels (the six renamed ones, and
 * `--mds-modal-overlay-color`, documented in the readme of mds-modal, whose
 * name did not change), and `--magma-field-fill`, which a surface passes down
 * to the fields inside it (docs/agents/theming.md, #1193). Source: the Magma 2
 * sheets read them with `rgb(var(--x))`, the Magma 3 sheets with `var(--x)`
 * (#918). A scan of every `rgb(var(--magma-*))` and `rgb(var(--mds-*))` of the
 * Magma 2 sources and guides against the DTCG list found no other, the
 * `--private-*` properties of the components aside (2026-11-06).
 */
const CONTRACT_COLORS = [
  'magma-field-fill',
  'mds-button-border-color',
  'mds-dropdown-drop-shadow-color',
  'mds-input-date-range-variant-color',
  'mds-input-date-variant-color',
  'mds-input-select-variant-color',
  'mds-input-variant-color',
  'mds-modal-overlay-color',
];

/** A property that took channels as `<name>-rgb` and takes a colour as `<name>`. */
const dropRgb = (name: string, note?: string): CssVarRenameRule => ({
  kind: 'cssVarRename',
  from: `${name}-rgb`,
  to: name,
  ...(note ? { note } : {}),
});

const INTERNAL =
  'an internal property: products may not set it, and Magma may change it without a major; style the component through its public properties';

/**
 * The default of `typography` on the items of `mds-accordion` and
 * `mds-accordion-timer` moves from `h5`, the style of a section, to `h6`, the
 * style of a part (`titles/part` of the design language, #1189; the API
 * snapshot of #1218, `magma.api.txt`). The new default is the reason of the
 * change, so an item that leaves `typography` out is reported with the
 * attribute that keeps the Magma 2 look, and nothing is written; an item that
 * writes it, statically or bound, is left alone. Chosen on #1218 (2026-11-07)
 * over the guard of the v1 -> v2 visual defaults (`mds-banner variant="light"`,
 * `mds-label truncate="none"`): writing `typography="h5"` into every item would
 * keep each migrated product off the decision.
 */
const titleOfAPart = (): EnsureAttrRule => ({
  kind: 'ensureAttr',
  attr: { attr: 'typography', prop: 'typography' },
  value: 'h5',
  unless: [{ attr: 'typography', prop: 'typography' }],
  reportOnly: true,
  confidence: 'review',
  reason:
    'the title of the item is h6 by default in Magma 3, the style of a part (it was h5, the style of a section); write typography="h5" to keep the look of Magma 2',
});

export const manifestV3: Manifest = {
  fromVersion: '2',
  toVersion: '3',
  global: {
    colorTokens: {
      kind: 'colorToken',
      names: [...colorTokenNames, ...CONTRACT_COLORS],
    },
  },
  components: {
    'mds-accordion-item': {
      tag: 'mds-accordion-item',
      react: 'MdsAccordionItem',
      rules: [titleOfAPart()],
    },
    'mds-accordion-timer-item': {
      tag: 'mds-accordion-timer-item',
      react: 'MdsAccordionTimerItem',
      rules: [titleOfAPart()],
    },
    'mds-button': {
      tag: 'mds-button',
      react: 'MdsButton',
      rules: [dropRgb('mds-button-border-color', INTERNAL)],
    },
    'mds-dropdown': {
      tag: 'mds-dropdown',
      react: 'MdsDropdown',
      rules: [dropRgb('mds-dropdown-drop-shadow-color', INTERNAL)],
    },
    'mds-input': {
      tag: 'mds-input',
      react: 'MdsInput',
      rules: [dropRgb('mds-input-variant-color')],
    },
    'mds-input-date': {
      tag: 'mds-input-date',
      react: 'MdsInputDate',
      rules: [
        dropRgb('mds-input-date-variant-color'),
        {
          kind: 'cssVarRemove',
          name: 'mds-input-date-icon-color-rgb',
          message:
            '`--mds-input-date-icon-color-rgb` is gone in Magma 3: it was deprecated and read by nothing; the icon takes `--mds-input-date-icon-color`',
        },
      ],
    },
    'mds-input-date-range': {
      tag: 'mds-input-date-range',
      react: 'MdsInputDateRange',
      rules: [dropRgb('mds-input-date-range-variant-color')],
    },
    'mds-input-select': {
      tag: 'mds-input-select',
      react: 'MdsInputSelect',
      rules: [dropRgb('mds-input-select-variant-color')],
    },
  },
};
