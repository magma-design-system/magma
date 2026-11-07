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
 *
 * #1061, category P: a t-shirt name is a container size, spacing a numeric
 * step. The Tailwind theme of Magma 3 publishes no named step of spacing (the
 * CSS variables `--spacing-none` ... `--spacing-4xl` of typography.css stay),
 * and the measures of text moved from spacing to container.
 *  - a spacing utility with a t-shirt name becomes the numeric step of the same
 *    value (`p-md` -> `p-400`, `-m-xs` -> `-m-100`, `w-none` -> `w-0`);
 *  - a class whose value changes is reported: a logical size utility
 *    (`inline-2xl`: the spacing step in Magma 2, the container in Magma 3),
 *    `leading-none` and `max-inline-none`, and a measure on a spacing utility
 *    (`p-prose`, no class in Magma 3);
 *  - `var(--spacing-prose)` becomes `var(--container-prose)`.
 */
import { colorTokenNames } from './color-tokens.generated.js';
import {
  type ClassRenameRule,
  type ClassReportRule,
  type CssVarRenameRule,
  type EnsureAttrRule,
  type Manifest,
} from './schema.js';

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

/**
 * The named steps of spacing in Magma 2, each with the numeric step of the same
 * value: `md` is `{sizing.primitive.400}` in tokens/sizing/spacing.json, and
 * `p-400` is 400 times `--spacing` (0.0025rem), the same 16px, as every
 * primitive N is the step N; `none` is 0px, the step 0.
 */
export const SPACING_STEPS: Readonly<Record<string, string>> = {
  none: '0',
  xs: '100',
  sm: '200',
  md: '400',
  lg: '600',
  xl: '800',
  '2xl': '1200',
  '3xl': '1600',
  '4xl': '2400',
};

/** The measures of text: spacing keys in Magma 2, container keys in Magma 3. */
export const MEASURES = ['phrase', 'prose', 'text', 'title'] as const;

/**
 * The utility roots that read a named key of spacing: the
 * `namespaces["--spacing"].utilities` of the consumption map of styles
 * (`dist/tailwind/consumption.json`, Tailwind 4.3), the same in the Magma 2 and
 * the Magma 3 build, where the relations of the rhythm (`gap-between-fields`)
 * keep the namespace. manifest-v3.test.ts holds the list to the built map.
 */
export const SPACING_ROOTS = [
  '-bottom',
  '-indent',
  '-inset',
  '-inset-be',
  '-inset-bs',
  '-inset-e',
  '-inset-s',
  '-inset-x',
  '-inset-y',
  '-left',
  '-m',
  '-mb',
  '-mbe',
  '-mbs',
  '-me',
  '-ml',
  '-mr',
  '-ms',
  '-mt',
  '-mx',
  '-my',
  '-right',
  '-scroll-m',
  '-scroll-mb',
  '-scroll-mbe',
  '-scroll-mbs',
  '-scroll-me',
  '-scroll-ml',
  '-scroll-mr',
  '-scroll-ms',
  '-scroll-mt',
  '-scroll-mx',
  '-scroll-my',
  '-space-x',
  '-space-y',
  '-top',
  '-translate',
  '-translate-x',
  '-translate-y',
  '-translate-z',
  'basis',
  'block',
  'border-spacing',
  'border-spacing-x',
  'border-spacing-y',
  'bottom',
  'gap',
  'gap-x',
  'gap-y',
  'h',
  'indent',
  'inline',
  'inset',
  'inset-be',
  'inset-bs',
  'inset-e',
  'inset-s',
  'inset-x',
  'inset-y',
  'leading',
  'left',
  'm',
  'max-block',
  'max-h',
  'max-inline',
  'max-w',
  'mb',
  'mbe',
  'mbs',
  'me',
  'min-block',
  'min-h',
  'min-inline',
  'min-w',
  'ml',
  'mr',
  'ms',
  'mt',
  'mx',
  'my',
  'p',
  'pb',
  'pbe',
  'pbs',
  'pe',
  'pl',
  'pr',
  'ps',
  'pt',
  'px',
  'py',
  'right',
  'scroll-m',
  'scroll-mb',
  'scroll-mbe',
  'scroll-mbs',
  'scroll-me',
  'scroll-ml',
  'scroll-mr',
  'scroll-ms',
  'scroll-mt',
  'scroll-mx',
  'scroll-my',
  'scroll-p',
  'scroll-pb',
  'scroll-pbe',
  'scroll-pbs',
  'scroll-pe',
  'scroll-pl',
  'scroll-pr',
  'scroll-ps',
  'scroll-pt',
  'scroll-px',
  'scroll-py',
  'size',
  'space-x',
  'space-y',
  'top',
  'translate',
  'translate-x',
  'translate-y',
  'translate-z',
  'w',
] as const;

/**
 * The size roots that read the container for a t-shirt name in Magma 2 already,
 * through the aliases of #1060 (the `shadowed` of `--spacing-<key>` in the Magma
 * 2 map), and read it in Magma 3 too: unchanged.
 */
export const SIZE_ROOTS: readonly string[] = ['w', 'min-w', 'max-w', 'basis'];

/**
 * The logical size roots, which have no namespace of their own in Tailwind 4.3:
 * the spacing step in Magma 2 (`inline-2xl`, 48px), the container in Magma 3
 * (640px). Same class, another value: reported.
 */
export const LOGICAL_ROOTS: readonly string[] = ['inline', 'min-inline', 'max-inline'];

/**
 * The class rules of category P, over every root of {@link SPACING_ROOTS}.
 * Measured on the compiler (Tailwind 4.3.4, the Magma 2 and Magma 3 themes):
 * `leading-<key>` reads `--leading-<key>` in both (its scale has every t-shirt
 * key, `2xs` ... `4xl`), and `max-w-none` is none in both (`--max-width-none` in
 * Magma 2, Tailwind's own `max-w-none` in Magma 3), so they are left alone;
 * `leading-none` and `max-inline-none` were 0px in Magma 2, since the spacing
 * step `none` won over Tailwind's own class, and are `line-height: 1` and no
 * limit in Magma 3.
 */
const spacingClassRules = (): Array<ClassRenameRule | ClassReportRule> => {
  const renames: ClassRenameRule[] = [];
  const reports: ClassReportRule[] = [];
  const report = (name: string, message: string) =>
    reports.push({ kind: 'classReport', name, message });
  for (const root of SPACING_ROOTS) {
    const logical = LOGICAL_ROOTS.includes(root);
    for (const [key, step] of Object.entries(SPACING_STEPS)) {
      const name = `${root}-${key}`;
      if (key === 'none') {
        if (root === 'max-w') continue;
        if (root === 'leading')
          report(
            name,
            "the spacing step `none` (0) won over Tailwind's own `leading-none` in Magma 2; in Magma 3 it is `line-height: 1` (#1061): keep it for 1, or write `leading-0` to keep 0",
          );
        else if (root === 'max-inline')
          report(
            name,
            'the spacing step `none` (0) in Magma 2; in Magma 3 it sets no limit, as `max-w-none` (#1061): keep it for no limit, or write `max-inline-0` to keep 0',
          );
        else renames.push({ kind: 'classRename', from: name, to: `${root}-${step}` });
        continue;
      }
      if (SIZE_ROOTS.includes(root) || root === 'leading') continue;
      if (logical)
        report(
          name,
          `the spacing step \`${step}\` in Magma 2, the container \`--container-${key}\` in Magma 3 (#1061): write \`${root}-${step}\` to keep the step, or keep it for the container`,
        );
      else renames.push({ kind: 'classRename', from: name, to: `${root}-${step}` });
    }
    if (SIZE_ROOTS.includes(root) || logical) continue;
    for (const measure of MEASURES)
      report(
        `${root}-${measure}`,
        `a measure of text as a spacing step: in Magma 3 the measures are container widths, which make no spacing utility (#1061); write \`${root}-(--container-${measure})\` to keep the value`,
      );
  }
  return [...renames, ...reports];
};

/** The custom properties of the measures, renamed with their group (#1061). */
const measureVars: CssVarRenameRule[] = MEASURES.map((measure) => ({
  kind: 'cssVarRename',
  from: `spacing-${measure}`,
  to: `container-${measure}`,
}));

/** The rules of category P, also pinned by the fixtures of the v2 -> v3 test manifest. */
export const spacingRules = { classes: spacingClassRules(), cssVars: measureVars };

export const manifestV3: Manifest = {
  fromVersion: '2',
  toVersion: '3',
  global: {
    colorTokens: {
      kind: 'colorToken',
      names: [...colorTokenNames, ...CONTRACT_COLORS],
    },
    classes: spacingRules.classes,
    cssVars: spacingRules.cssVars,
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
