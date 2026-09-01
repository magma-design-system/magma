/**
 * Stable, hand-written manifest used ONLY by the transformer/unit tests. It
 * carries one representative rule per category with fixed names/values the tests
 * assert against, so changes to the real generated manifest (`manifest.ts` /
 * `manifest.generated.ts`) never break the transformation-logic tests.
 *
 * Do not use at runtime — the CLI bundles `manifest.ts`.
 */
import { type Manifest } from './schema.js';

export const testManifest: Manifest = {
  fromVersion: '1.12.0',
  toVersion: '2.0.0',
  global: {
    tone: {
      prop: { attr: 'tone', prop: 'tone' },
      map: { ghost: 'outline', quiet: 'text' },
      toneSet: 'tone',
    },
    removeDefaultSlot: true,
    // Seed rename on the bare token + surface-candidate reports (bare token and
    // a scale step), so the fixtures/unit tests exercise the report-vs-rename
    // split by background context.
    cssVars: [
      {
        kind: 'cssVarRename',
        from: 'tone-neutral',
        to: 'tone-neutral-seed',
        note: 'the bare tone primitive is now the off-scale `-seed` escape hatch',
      },
      { kind: 'cssVarSurfaceReport', from: 'tone-neutral' },
      { kind: 'cssVarSurfaceReport', from: 'tone-neutral-09' },
    ],
    // Utility-class rules (J): a plain rename, a rename with a note, a chained
    // pair (`rounded-xl → rounded-md` while `rounded-md → rounded-2xs`) to pin
    // the single-pass guarantee, a bare one-word rename (`gap`) and a
    // report-only class.
    classes: [
      { kind: 'classRename', from: 'shadow-outline-light', to: 'shadow-ring-weak' },
      {
        kind: 'classRename',
        from: 'shadow-inner',
        to: 'shadow-inset-sm',
        note: 'v2 adds a 1%-alpha inset hairline — visually equivalent',
      },
      { kind: 'classRename', from: 'rounded-md', to: 'rounded-2xs' },
      { kind: 'classRename', from: 'rounded-xl', to: 'rounded-md' },
      { kind: 'classRename', from: 'gap', to: 'gap-lg' },
      {
        kind: 'classReport',
        name: 'shadow-outline-strong',
        message: 'v2 reuses this name for a different shadow; migrate manually',
      },
    ],
  },
  components: {
    'mds-dropdown': {
      tag: 'mds-dropdown',
      react: 'MdsDropdown',
      rules: [
        {
          kind: 'booleanInvert',
          from: { attr: 'arrow', prop: 'arrow' },
          to: { attr: 'hide-arrow', prop: 'hideArrow' },
          oldDefault: true,
          newDefault: false,
          confidence: 'safe',
        },
        {
          kind: 'booleanInvert',
          from: { attr: 'auto-placement', prop: 'autoPlacement' },
          to: { attr: 'disable-auto-placement', prop: 'disableAutoPlacement' },
          oldDefault: true,
          newDefault: false,
          confidence: 'safe',
        },
        {
          kind: 'booleanInvert',
          from: { attr: 'shift', prop: 'shift' },
          to: { attr: 'disable-shift', prop: 'disableShift' },
          oldDefault: true,
          newDefault: false,
          confidence: 'safe',
        },
        {
          kind: 'booleanInvert',
          from: { attr: 'smooth', prop: 'smooth' },
          to: { attr: 'disable-smooth', prop: 'disableSmooth' },
          oldDefault: true,
          newDefault: false,
          confidence: 'safe',
        },
        { kind: 'eventRename', from: 'mdsClose', to: 'mdsDismiss' },
      ],
    },
    'mds-button': {
      tag: 'mds-button',
      react: 'MdsButton',
      v2EnumSets: {
        tone: ['outline', 'strong', 'text', 'weak'],
      },
      rules: [
        {
          kind: 'slotToAttr',
          slot: 'default',
          to: { attr: 'label', prop: 'label' },
          confidence: 'review',
        },
        {
          kind: 'propRemove',
          prop: { attr: 'has-text', prop: 'hasText' },
          strategy: 'comment',
          message:
            'mds-button no longer exposes `hasText`; remove it (text is derived from content).',
        },
        {
          kind: 'cssVarRename',
          from: 'mds-button-ghost-background-color',
          to: 'mds-button-outline-background-color',
          note: 'the v1 name was documented but never shipped; the override becomes effective after the rename',
        },
        { kind: 'partRename', from: 'label', to: 'content' },
      ],
    },
    'mds-banner': {
      tag: 'mds-banner',
      react: 'MdsBanner',
      v2EnumSets: {
        tone: ['outline', 'strong', 'weak'],
      },
      rules: [
        {
          kind: 'cssVarRename',
          from: 'mds-banner-color',
          to: 'mds-banner-color-rgb',
          valueFormatChanged: true,
        },
        {
          kind: 'cssVarRemove',
          name: 'mds-banner-gap',
          message: '`--mds-banner-gap` was removed in v2 with no replacement; migrate manually.',
        },
      ],
    },
    'mds-push-notification': {
      tag: 'mds-push-notification',
      react: 'MdsPushNotification',
      rules: [
        { kind: 'slotRemove', from: 'top' },
        { kind: 'slotRemove', from: 'bottom' },
      ],
    },
    'mds-label': {
      tag: 'mds-label',
      react: 'MdsLabel',
      rules: [
        {
          kind: 'propRename',
          from: { attr: 'label-action', prop: 'labelAction' },
          to: { attr: 'label', prop: 'label' },
          confidence: 'review',
          note: 'Verify semantics: v1 `labelAction` maps to v2 `label`.',
        },
      ],
    },
  },
};

export default testManifest;

/**
 * Isolated manifest for the `ensureAttr` tests: a single `mds-dropdown` rule
 * with no inversions, so the guard's add/skip logic can be asserted on its own
 * without the other dropdown rules adding noise.
 */
export const ensureAttrManifest: Manifest = {
  fromVersion: '1.12.0',
  toVersion: '2.0.0',
  global: {},
  components: {
    'mds-dropdown': {
      tag: 'mds-dropdown',
      react: 'MdsDropdown',
      rules: [
        {
          kind: 'ensureAttr',
          attr: { attr: 'disable-auto-placement', prop: 'disableAutoPlacement' },
          unless: [
            { attr: 'auto-placement', prop: 'autoPlacement' },
            { attr: 'disable-auto-placement', prop: 'disableAutoPlacement' },
          ],
          confidence: 'review',
          reason:
            'v2 enables auto-placement by default; added disable-auto-placement to preserve v1 behavior',
        },
      ],
    },
    'mds-banner': {
      tag: 'mds-banner',
      react: 'MdsBanner',
      rules: [
        {
          kind: 'ensureAttr',
          attr: { attr: 'variant', prop: 'variant' },
          value: 'light',
          unless: [{ attr: 'variant', prop: 'variant' }],
          confidence: 'review',
          reason:
            'v2 defaults variant to "primary" (v1 was "light"); added variant="light" to preserve the v1 look',
        },
      ],
    },
  },
};
