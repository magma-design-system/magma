/**
 * Manifest schema: the curated, per-component description of every v1 → v2
 * breaking change. The manifest is the single runtime artifact the transformers
 * consume; it is self-contained (carries attr↔prop pairs, the React component
 * name and the v2 enum sets) so a surface never has to look anything up
 * elsewhere. It is produced semi-automatically by the generator (see
 * `generate/diff-docs.ts`) and ratified by hand.
 */

/** How confident we are that a rule can be applied without human review. */
export type Confidence = 'safe' | 'review' | 'manual';

/** A prop identified by both of its surface spellings. */
export interface PropId {
  /** kebab-case attribute name, e.g. `auto-placement` (HTML). */
  attr: string;
  /** camelCase property / JSX prop name, e.g. `autoPlacement` (React, Angular). */
  prop: string;
}

/** Category D — rename a prop, value preserved. */
export interface PropRenameRule {
  kind: 'propRename';
  from: PropId;
  to: PropId;
  confidence: Confidence;
  note?: string;
}

/** Category C — prop removed with no replacement; warn the consumer. */
export interface PropRemoveRule {
  kind: 'propRemove';
  prop: PropId;
  /** `comment`: inject an inline note next to the attribute. `delete`: drop it. */
  strategy: 'comment' | 'delete';
  message: string;
}

/** Categories A and E — remap enum literals (validated against the v2 set). */
export interface EnumRemapRule {
  kind: 'enumRemap';
  prop: PropId;
  /** `value → newValue`; a `null` target means "no v2 equivalent, migrate manually". */
  map: Record<string, string | null>;
  /** Name of the entry in the component's `v2EnumSets` to validate targets/literals against. */
  v2set?: string;
  confidence: Confidence;
}

/** Category B — rename a boolean prop and negate its value. */
export interface BooleanInvertRule {
  kind: 'booleanInvert';
  from: PropId;
  to: PropId;
  oldDefault: boolean;
  newDefault: boolean;
  confidence: Confidence;
}

/** Category F — remove or rename a named slot. */
export interface SlotRule {
  kind: 'slotRemove' | 'slotRename';
  from: string;
  to?: string;
}

/**
 * Category F (preferred form) — lift the text content of a slot into an
 * attribute. v2 `mds-button` keeps reading slotted text for backward compat,
 * but the preferred shape moves it to `label`:
 * `<mds-button>Save</mds-button>` → `<mds-button label="Save"></mds-button>`.
 *
 * Only pure-text / single-expression content can be lifted; content with
 * element children is reported for manual migration instead.
 */
export interface SlotToAttrRule {
  kind: 'slotToAttr';
  /** Slot whose content is lifted; `default` = the unnamed slot (plain text content). */
  slot: string;
  to: PropId;
  confidence: Confidence;
}

/** Category G — rename a CSS custom property (optionally flagging a value-format change). */
export interface CssVarRenameRule {
  kind: 'cssVarRename';
  /** Without the leading `--`. */
  from: string;
  to: string;
  /** e.g. hex → `R G B` channels; the value cannot be migrated automatically. */
  valueFormatChanged?: boolean;
  /**
   * Extra context surfaced as a flag on the definition site: the value-format
   * details, or the fact that the v1 name was documented but never shipped
   * (renaming it activates an override that was silently inert).
   */
  note?: string;
}

/** Category G2 — a CSS custom property was removed with no v2 replacement; usages are reported. */
export interface CssVarRemoveRule {
  kind: 'cssVarRemove';
  /** Without the leading `--`. */
  name: string;
  message: string;
}

/**
 * Category G3 (report-only). A neutral tone/primitive used as a *background* is
 * a surface under the semantic color system, but the exact role (default /
 * raised / overlay / sunken / muted) is contextual and often the component's own
 * default (C2 territory), so the codemod REPORTS the site for manual migration
 * to a `--magma-surface-*` role instead of rewriting it. "Background context" =
 * a `background` / `background-color` property, OR a custom property whose name
 * contains `background` (component `--mds-*-background*` tokens). CSS-only; the
 * value is never rewritten.
 */
export interface CssVarSurfaceReportRule {
  kind: 'cssVarSurfaceReport';
  /** Without the leading `--`: the token that is a surface candidate as a background. */
  from: string;
  /** Optional extra guidance appended to the report message. */
  note?: string;
}

/** Category H — rename a shadow part referenced in `::part()`. */
export interface PartRenameRule {
  kind: 'partRename';
  from: string;
  to: string;
}

/** Category I — rename an event (raw event name, e.g. `mdsChange`). */
export interface EventRenameRule {
  kind: 'eventRename';
  from: string;
  to: string;
}

/**
 * Behavior-preservation guard. Adds `attr` (as a shorthand boolean) to the
 * element **only when none of the `unless` props are already present**. Used
 * when a v2 default flips relative to v1: e.g. `mds-dropdown` auto-placement was
 * off by default in v1 but is on in v2, so adding `disable-auto-placement` to
 * dropdowns that never set it preserves the v1 behavior.
 */
export interface EnsureAttrRule {
  kind: 'ensureAttr';
  /** Attribute/prop to add (shorthand boolean unless `value` is set). */
  attr: PropId;
  /** Literal value to set (`variant="light"`); omitted → boolean shorthand. */
  value?: string;
  /** Skip the insertion when any of these props is already on the element. */
  unless: PropId[];
  confidence: Confidence;
  /** Human-readable reason, shown in the report. */
  reason: string;
}

export type Rule =
  | PropRenameRule
  | PropRemoveRule
  | EnumRemapRule
  | BooleanInvertRule
  | SlotRule
  | SlotToAttrRule
  | CssVarRenameRule
  | CssVarRemoveRule
  | CssVarSurfaceReportRule
  | PartRenameRule
  | EventRenameRule
  | EnsureAttrRule;

export type RuleKind = Rule['kind'];

export interface ComponentManifest {
  /** `mds-dropdown`. */
  tag: string;
  /** React component name, `MdsDropdown`. */
  react: string;
  /** v2 enum sets referenced by this component's `enumRemap` rules, keyed by set name. */
  v2EnumSets?: Record<string, readonly string[]>;
  rules: Rule[];
}

/** Rules applied to every component (still validated per-component). */
export interface GlobalRules {
  /**
   * `tone` enum remap applied to any component that has a `tone` prop. Targets
   * are validated against each component's own v2 enum set named `toneSet`.
   */
  tone?: {
    prop: PropId;
    map: Record<string, string | null>;
    /** Name of the per-component `v2EnumSets` entry holding that component's valid tone values. */
    toneSet: string;
    /**
     * Per-tag replacement maps for components whose v2 tone set supports a
     * closer target than the global one (e.g. `quiet → text` where `text`
     * exists). A tag listed here uses its map *instead of* `map`.
     */
    overrides?: Record<string, Record<string, string | null>>;
  };
  /** Remove `slot="default"` everywhere (v2 uses the unnamed default slot). */
  removeDefaultSlot?: boolean;
  /**
   * CSS custom-property migrations that are not tied to a single component:
   * primitive-token renames (the `--tone-*` -> `--tone-*-seed` seed rename from
   * A2) and report-only surface candidates (a neutral tone used as a background,
   * migrated by hand to a `--magma-surface-*` role). CSS-only; the
   * HTML/React/Angular surfaces ignore them.
   */
  cssVars?: Array<CssVarRenameRule | CssVarSurfaceReportRule>;
}

export interface Manifest {
  fromVersion: string;
  toVersion: string;
  global: GlobalRules;
  /** Keyed by tag. */
  components: Record<string, ComponentManifest>;
}
