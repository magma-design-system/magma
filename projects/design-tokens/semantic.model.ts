import {
  semantic,
  accentInfix,
  accentTintDecls,
  contrastTintDecls,
  emphasisStateSteps,
  hueContrastDecls,
  roleDescription,
  scaleFamily,
  scaleTintDecls,
  type ContrastLevel,
  type SemanticDecl,
  type ThemeDef,
} from './semantic.config';

/**
 * The semantic color layer (A9) as data: which custom property each `--magma-*`
 * role and each internal `--magma-tint-*` pointer resolves to, in every block the
 * layer has (base, dark ink, contrast, named themes).
 *
 * semantic.config.ts states the contract; this module expands it into declarations,
 * once, for every output that needs them:
 *  - the styles generator (`../styles/scripts/semantic.ts`) prints them as
 *    `semantic.css`, the Tailwind bridge and `themes.css`;
 *  - the DTCG export of this package (`scripts/dtcg/`) writes them as
 *    aliases.
 * Both read the same declarations, so the CSS and the JSON cannot point a role at
 * two different primitives. Text roles come from A7's `--text-*` primitives;
 * surfaces/borders resolve through the `--magma-tint-*` indirection so a named
 * theme retints with one swap (B2, spec section 8).
 */

/** A titled run of declarations: one commented section of the `:root` block. */
export interface SemanticSection {
  title: string;
  decls: SemanticDecl[];
}

/** A named theme (spec 8): what its `data-theme-name` block repoints. */
export interface SemanticTheme {
  name: string;
  /** The ramp family its `--magma-tint-scale-*` pointers name; absent when it keeps the base one. */
  ramp?: string;
  /** The `:root[data-theme-name]` block; empty when the theme is the base layer. */
  decls: SemanticDecl[];
  /** The contrast promotions restated in the theme's own family, under the theme's scope. */
  contrast: SemanticDecl[];
}

export interface SemanticModel {
  /** The active tint family of the base layer. */
  tint: string;
  /** The contrast level the `contrast` blocks answer to (`prefers-contrast: <level>`). */
  contrastLevel: ContrastLevel;
  /** The `:root` block, in order. */
  base: SemanticSection[];
  /** What dark mode repoints on top of the primitives flipping (spec 6.5, #739). */
  dark: SemanticDecl[];
  /** The `pref-contrast-<level>` promotions of the base scope: tint pointers, then every hue. */
  contrast: SemanticDecl[];
  /** Every named theme, the base one included, in config order. */
  themes: SemanticTheme[];
}

const CONTRAST_LEVEL: ContrastLevel = 'more';

const {
  tint,
  surfaceRoles,
  borderRoles,
  textRoles,
  borderFocus,
  seed,
  onEmphasisDark,
  hues,
  hueSteps,
  washSteps,
  shadowStep,
  hueRoles,
  neutralHueSteps,
  accents,
  accentStateSteps,
  themes,
} = semantic;

/** A public role: `--magma-<name>`, bridged to Tailwind as `--color-<tw>`. */
const role = (
  name: string,
  ref: string,
  tw: string,
  extra?: Partial<SemanticDecl>,
): SemanticDecl => ({
  name: `magma-${name}`,
  ref,
  tw,
  ...extra,
});

/** An internal `--magma-tint-*` pointer: not bridged, repointed by themes and contrast. */
const pointer = (name: string, ref: string): SemanticDecl => ({ name: `magma-tint-${name}`, ref });

// 1. tint indirection (internal; not bridged to Tailwind). The tint block IS the
//    theme: a named theme repoints these to another family and retints surface,
//    border AND text together in one swap (spec 8). Text joins the block so the
//    foreground retints WITH its surface, kept to one coherent, contrast-paired
//    family (A7 verifies text against that same family's surfaces).
const tintSection = (): SemanticSection => ({
  title:
    'Active tint = the theme (spec 8): a named theme retints surface + border + text by repointing --magma-tint-*.',
  decls: [
    ...surfaceRoles.map((r) => pointer(r, `surface-${tint}-${r}`)),
    ...borderRoles.map((r) => pointer(`border-${r}`, `border-${tint}-${r}`)),
    ...textRoles.map((r) => pointer(`text-${r}`, `text-${tint}-${r}`)),
    // the ink on a solid fill: the seed in light; repointed to the canvas in dark by
    // the dark block (#739). Every `*-on-emphasis` and `on-inverse` resolves through
    // this one pointer, so the fills cannot disagree on their ink.
    pointer('text-on-emphasis', seed),
    // the active tint's RAMP pointers. Not an API: nothing outside this layer reads
    // them. They are what the wash band (2b), the shadow ink (2c), the inverse pair
    // and the neutral hue's fg/border resolve through, so a named theme retints those
    // roles by repointing this block.
    // The public `--magma-scale-NN` bridge that once exposed the ramp to the
    // component sheets was retired (#732, spec 8) once every use had a role.
    ...scaleTintDecls(scaleFamily(tint)),
  ],
});

// 2. surfaces (from the tint pointers)
const surfaceSection = (): SemanticSection => ({
  title: 'Surfaces - elevation + same-plane prominence (spec 6.1)',
  decls: surfaceRoles.map((r) => role(`surface-${r}`, `magma-tint-${r}`, `surface-${r}`)),
});

// 2b. wash levels - neutral PILLS, not elevation. Same device as the colored
//    `--magma-<hue>-wash-*` of 6.4 and the same `washSteps` map, so the two
//    vocabularies cannot drift; what differs is what they name. A hue names its
//    own family directly (a theme never retints a hue), while the neutral levels
//    resolve through `--magma-tint-scale-*`, so they follow the active theme
//    exactly like the surfaces above.
//    Why they cannot BE surfaces, measured: the elevation ladder moves toward
//    white as it rises in light and toward the ink in dark, while a pill moves
//    toward the ink in BOTH modes (step 08 is #d0d0d0 on #f2f2f2 paper in light,
//    #6b6b6b on #1d1d1d in dark). No elevation role can hold that value - it
//    would have to be `sunken` in light and `raised` in dark. Naming a ramp step
//    gets the mode-flip for free, because the primitive itself flips.
//    Censused for #624: 144 component declarations were naming steps 10/09/08 as
//    a background for exactly this reason, with no role to reach for.
const washSection = (): SemanticSection => ({
  title:
    'Wash - neutral pills, by how marked they are (spec 6.1b); follows the theme via --magma-tint-scale-*',
  decls: Object.entries(washSteps).map(([level, step]) =>
    role(`wash-${level}`, `magma-tint-scale-${step}`, `wash-${level}`),
  ),
});

// 2c. shadow ink - the COLOUR a projected shadow is drawn with, not a shadow.
//    Named on the tint ramp's ink extreme, so it flips with the mode: black on a
//    light page, white on a dark one. That flip is the whole point - a pure black
//    shadow is invisible on a dark surface, which is the defect #641 documents on
//    the composite ring tokens.
//    The composite `--shadow-*` tokens live one layer down (design-tokens cosmetic
//    tokens) and name the primitive directly: they cannot reference a role without
//    inverting the layering, and at the ink extreme the difference is 1/255.
const shadowSection = (): SemanticSection => ({
  title: 'Shadow ink - the colour of a projected shadow (spec 6.1c)',
  decls: [role('shadow-ink', `magma-tint-scale-${shadowStep}`, 'shadow-ink')],
});

// 3. text roles - resolve through the tint-text indirection so a theme retints
//    the foreground with its surface (values are the by-target --text-*, A7).
const textSection = (): SemanticSection => ({
  title: 'Text - prominence, by APCA target (spec 6.2 / 9, A7); retints via --magma-tint-text-*',
  decls: [
    ...textRoles.map((r) => role(`text-${r}`, `magma-tint-text-${r}`, `fg-${r}`)),
    role('text-on-emphasis', 'magma-tint-text-on-emphasis', 'fg-on-emphasis'),
  ],
});

// 4. borders (from the tint pointers); focus follows an accent (theme-aware)
const borderSection = (): SemanticSection => ({
  title: 'Border - prominence (spec 6.3); focus follows the accent it is named after',
  decls: [
    ...borderRoles.map((r) => role(`border-${r}`, `magma-tint-border-${r}`, `border-${r}`)),
    role('border-focus', `magma-accent-${accentInfix(borderFocus)}emphasis`, 'border-focus'),
  ],
});

// 5. hues - a colored hue carries the SAME role vocabulary as the neutral
//    scaffolding, on its own family: wash levels (how marked the colored
//    background is), the text ladder and the border ladder. Text and border come
//    from the generated per-family role scales (`--text-success-*`), so the A7
//    guarantee - each step solved against the family's own surfaces - carries over
//    to every hue, and the spec 9.3 promotion applies to them verbatim.
//    Wash levels instead NAME ramp steps (see `washSteps`, shared with the
//    neutral band of 2b): a colored chip
//    moves toward the ink in both modes, which no elevation role can express, and
//    they are NOT called `surface-*` precisely so they cannot be read as the
//    colored parent of `--magma-surface-*`, which is a different thing.
//    The legacy quintet (`-surface`, `-fg`, `-border`) stays as a shortcut onto
//    these roles, so consumers keep resolving AND inherit the promotion.
//    A `partial` hue (neutral) is unchanged: it borrows ramp steps and its
//    emphasis pair is the inverse-surface role, not a colored fill (spec 6.4).
//    The neutral family's "emphasis" pair is NOT a saturated fill like the colored
//    hues: it is the INVERSE SURFACE role (a dark chip in light mode, light in dark -
//    toast, tooltip). It is emitted under role names --magma-surface-inverse /
//    --magma-on-inverse (Material inverseSurface), decoupled from the colored
//    <hue>-emphasis fills. The former --magma-neutral-emphasis / -on-emphasis names
//    stay as DEPRECATED aliases (one release) so existing consumers keep resolving.
const hueSection = (
  hue: string,
  { family, roles, partial }: { family: string; roles?: string; partial?: boolean },
): SemanticSection => {
  const title = `${hue} (${family})`;
  if (partial) {
    const steps = neutralHueSteps;
    // The neutral hue is the TINT's own ramp, so its steps resolve through the
    // tint pointers and retint with a named theme like the wash band does. Named
    // on `${family}` directly they stayed a static neutral under `cool` / `warm`
    // (#731: the dark variants had retinted through the retired --magma-scale-* bridge).
    const tintStep = (step: string) => `magma-tint-scale-${step}`;
    return {
      title,
      decls: [
        role(`${hue}-fg`, tintStep(steps.fg), `${hue}-fg`),
        role(`${hue}-border`, tintStep(steps.border), `${hue}-border`),
        // inverse-surface role (renamed from neutral-emphasis / -on-emphasis)
        role('surface-inverse', tintStep(steps.emphasis), 'surface-inverse'),
        role('surface-inverse-muted', tintStep(steps.emphasisMuted), 'surface-inverse-muted'),
        role('on-inverse', 'magma-tint-text-on-emphasis', 'on-inverse'),
        role(`${hue}-emphasis`, 'magma-surface-inverse', `${hue}-emphasis`, {
          note: 'deprecated: renamed to --magma-surface-inverse / --magma-on-inverse',
          deprecated: 'Renamed to --magma-surface-inverse.',
        }),
        role(`${hue}-on-emphasis`, 'magma-on-inverse', `${hue}-on-emphasis`, {
          deprecated: 'Renamed to --magma-on-inverse.',
        }),
      ],
    };
  }
  if (!roles) {
    // Not a fallback: without the role family there is nothing to point text and
    // border at, and silently dropping back to ramp steps would ship the very
    // hand-picked pairs this layer exists to remove.
    throw new Error(
      `semantic.config: hue "${hue}" is colored but declares no "roles" family; ` +
        `add the generated role family (e.g. roles: '${family.split('-').slice(1).join('-')}').`,
    );
  }
  return {
    title,
    decls: [
      // wash levels: named ramp steps, so they mode-flip with the primitive
      ...Object.entries(washSteps).map(([level, step]) =>
        role(`${hue}-wash-${level}`, `${family}-${step}`, `${hue}-wash-${level}`),
      ),
      // text + border: the family's own generated role scales (A7 guarantee)
      ...textRoles.map((r) => role(`${hue}-text-${r}`, `text-${roles}-${r}`, `${hue}-fg-${r}`)),
      ...borderRoles.map((r) =>
        role(`${hue}-border-${r}`, `border-${roles}-${r}`, `${hue}-border-${r}`),
      ),
      // the solid saturated fill has no counterpart in the generated scales (those
      // model tinted surfaces, not fills), so it keeps naming a ramp step - and so do
      // its interaction states, shared with the accents through emphasisStateSteps()
      // (spec 6.6). Stated directly on the family, not through a tint pointer: a
      // named theme retints the accents, never a hue.
      role(`${hue}-emphasis`, `${family}-${hueSteps.emphasis}`, `${hue}-emphasis`),
      ...Object.entries(emphasisStateSteps()).map(([state, step]) =>
        role(`${hue}-${state}`, `${family}-${step}`, `${hue}-${state}`),
      ),
      role(`${hue}-on-emphasis`, 'magma-tint-text-on-emphasis', `${hue}-on-emphasis`),
      // shortcuts onto the roles above (NOT onto the primitives): stated this way
      // they follow the contrast promotion instead of freezing the base step
      role(`${hue}-surface`, `magma-${hue}-wash-${hueRoles.surface}`, `${hue}-surface`, {
        note: 'shortcuts: the roles above at their default prominence',
      }),
      role(`${hue}-fg`, `magma-${hue}-text-${hueRoles.text}`, `${hue}-fg`),
      role(`${hue}-border`, `magma-${hue}-border-${hueRoles.border}`, `${hue}-border`),
    ],
  };
};

// 6. accents (variant) - the standout colors (spec 8). Each accent role is a
//    THEME-AWARE quintet: the roles resolve through per-role tint pointers
//    (--magma-tint-accent-*), so a named theme repoints an accent exactly like a
//    surface. Steps reuse the colored-hue quintet (hueSteps); on-emphasis is the
//    fill ink pointer (family-independent, spec 6.5). The GENERAL `accent` role carries NO
//    infix (--magma-accent-*), promoting the formerly deprecated single alias to
//    the canonical general accent; `ai` infixes (--magma-accent-ai-*). See
//    `accentInfix`.
const accentSection = (accentRole: string, family: string): SemanticSection => {
  const infix = accentInfix(accentRole);
  // roles resolve through the tint pointers -> theme-aware
  const accent = (key: string) =>
    role(`accent-${infix}${key}`, `magma-tint-accent-${infix}${key}`, `accent-${infix}${key}`);
  return {
    title: `accent ${accentRole} (${family})`,
    decls: [
      // tint pointers (internal; repointed per theme, not bridged to Tailwind): the
      // quintet steps + interaction states (spec 6.6 accent exception), each an
      // existing ramp step so it mode-flips and retints per theme like the quintet.
      // Shared with the theme overrides + playground via accentTintDecls().
      ...accentTintDecls(accentRole, family),
      accent('surface'),
      accent('fg'),
      accent('border'),
      accent('emphasis'),
      ...Object.keys(accentStateSteps).map((state) => accent(state)),
      role(
        `accent-${infix}on-emphasis`,
        'magma-tint-text-on-emphasis',
        `accent-${infix}on-emphasis`,
      ),
    ],
  };
};

// Dark ink (spec 6.5, #739): in dark the seed is pure black, the only pure extreme
// left once the canvas is lifted, so the ink on a solid fill takes the canvas
// instead - the page showing through the fill. Stated as the tint pointer, so a
// named theme (which repoints --magma-tint-default) and `pref-contrast-more`
// (which sends the page back to the seed) carry the ink with them, no rule of
// their own.
const darkDecls = (): SemanticDecl[] =>
  onEmphasisDark ? [pointer('text-on-emphasis', `magma-tint-${onEmphasisDark}`)] : [];

// Contrast (spec 9.3): under `prefers-contrast: more` the text + border roles are
// promoted to a STRONGER same-family step and the page surface to the family seed
// (the paper of the mode) by repointing the --magma-tint-* block, so the WHOLE
// scaffolding gains contrast UPSTREAM - every role that resolves through the tint
// pointers follows, with no per-component --tone-* sheet involved.
// Every colored hue promotes its own text + border roles off the SAME table. They
// are stated as roles (not through a tint pointer) because a hue is not retinted
// by a theme; the quintet shortcuts are var() of these roles, so they follow.
const contrastDecls = (): SemanticDecl[] => [
  ...contrastTintDecls(tint, CONTRAST_LEVEL),
  ...Object.entries(hues).flatMap(([hue, { roles, partial }]) =>
    partial || !roles ? [] : hueContrastDecls(hue, roles, CONTRAST_LEVEL),
  ),
];

// Named themes (spec 8): one override block per theme. A theme repoints the
// --magma-tint-* block (surface + border + text) when its surface family differs
// from the base `tint`, AND repoints --magma-tint-accent-<role>-* for every
// accent it overrides - so a theme retints background, foreground AND accents in
// one swap. A theme that changes nothing (base tint, no accent override) emits
// nothing. String shorthand == surface family only (back-compat).
const normalizeTheme = (
  def: ThemeDef,
): { surface?: string; accents?: Record<string, string>; scale?: string } =>
  typeof def === 'string' ? { surface: def } : def;

const themeOf = (name: string, def: ThemeDef): SemanticTheme => {
  const { surface, accents: accentOverride, scale } = normalizeTheme(def);
  const retints = Boolean(surface && surface !== tint);
  const ramp = retints ? scaleFamily(surface, scale) : undefined;
  const decls: SemanticDecl[] = [];
  if (retints) {
    decls.push(
      ...surfaceRoles.map((r) => pointer(r, `surface-${surface}-${r}`)),
      ...borderRoles.map((r) => pointer(`border-${r}`, `border-${surface}-${r}`)),
      ...textRoles.map((r) => pointer(`text-${r}`, `text-${surface}-${r}`)),
      // the ramp retints with the rest of the block, or the raw steps a component
      // still uses would stay on the base tint while its surfaces moved
      ...scaleTintDecls(ramp),
    );
  }
  if (accentOverride) {
    Object.entries(accentOverride).forEach(([accentRole, family]) =>
      decls.push(...accentTintDecls(accentRole, family)),
    );
  }
  // A theme that retints the tint block must ALSO restate the contrast promotions
  // in its OWN family: `:root[data-theme-name='x']` and `:root.pref-contrast-more`
  // carry the same specificity, so without a theme-scoped block which one wins is
  // decided by the order semantic.css and themes.css happen to be loaded in - the
  // promotion would silently vanish under a named theme. Qualifying the scope with
  // the theme attribute makes it one selector stronger, and the family swap keeps
  // the theme contrasted within its own ramp instead of borrowing the base tint.
  // A theme that only overrides accents leaves the tint text/border alone, so the
  // base block already covers it and nothing extra is emitted.
  const contrast = retints ? contrastTintDecls(surface, CONTRAST_LEVEL) : [];
  return { name, ramp, decls, contrast };
};

/**
 * Every public role of the base sections, with what it is for (#876): from the description
 * tables of semantic.config.ts. A public role nothing describes stops every build that reads
 * the layer, so a new role cannot ship bare.
 */
const describe = (sections: SemanticSection[]): SemanticSection[] => {
  const missing: string[] = [];
  const described = sections.map((section) => ({
    ...section,
    decls: section.decls.map((decl) => {
      if (!decl.tw) return decl;
      const description = roleDescription(
        decl.name.replace(/^magma-/, ''),
        Object.keys(hues),
        Object.keys(accents),
      );
      if (!description) missing.push(`--${decl.name}`);
      return { ...decl, description };
    }),
  }));
  if (missing.length > 0) {
    throw new Error(
      `${missing.length} public role(s) have no description: add them to the description ` +
        `tables of semantic.config.ts (roleDescriptions, hueRoleDescriptions, ` +
        `accentRoleDescriptions):\n${missing.map((name) => `  ${name}`).join('\n')}`,
    );
  }
  return described;
};

/** Expand semantic.config.ts into the declarations of every block of the layer. */
export function semanticModel(): SemanticModel {
  return {
    tint,
    contrastLevel: CONTRAST_LEVEL,
    base: describe([
      tintSection(),
      surfaceSection(),
      washSection(),
      shadowSection(),
      textSection(),
      borderSection(),
      ...Object.entries(hues).map(([hue, def]) => hueSection(hue, def)),
      ...Object.entries(accents).map(([accentRole, family]) => accentSection(accentRole, family)),
    ]),
    dark: darkDecls(),
    contrast: contrastDecls(),
    themes: Object.entries(themes).map(([name, def]) => themeOf(name, def)),
  };
}
