/**
 * Deterministic name helpers and manifest accessors shared by the generator
 * (which builds the manifest from `documentation.json`) and the transformers
 * (which consume it).
 */
import {
  type ComponentManifest,
  type EnumRemapRule,
  type Manifest,
  type Rule,
  type TagRenameRule,
} from './schema.js';

/** camelCase prop → kebab-case attribute: `autoPlacement` → `auto-placement`. */
export const propToAttr = (prop: string): string => prop.replace(/([A-Z])/g, '-$1').toLowerCase();

/** kebab-case attribute → camelCase prop: `auto-placement` → `autoPlacement`. */
export const attrToProp = (attr: string): string =>
  attr.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase());

/** Custom-element tag → React component name: `mds-dropdown` → `MdsDropdown`. */
export const tagToReactName = (tag: string): string =>
  tag
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

/** Stencil event name → React handler prop: `mdsChange` → `onMdsChange`. */
export const eventToReactProp = (event: string): string =>
  `on${event.charAt(0).toUpperCase()}${event.slice(1)}`;

/** A stable identifier for a rule, used by `--only`/`--skip` and the report. */
export const ruleId = (tag: string, rule: Rule): string => {
  switch (rule.kind) {
    case 'propRename':
    case 'booleanInvert':
      return `${tag}/${rule.kind}/${rule.from.prop}`;
    case 'propRemove':
      return `${tag}/${rule.kind}/${rule.prop.prop}`;
    case 'enumRemap':
      return `${tag}/${rule.kind}/${rule.prop.prop}`;
    case 'slotRemove':
    case 'slotRename':
      return `${tag}/${rule.kind}/${rule.from}`;
    case 'slotToAttr':
      return `${tag}/${rule.kind}/${rule.slot}`;
    case 'ensureAttr':
      return `${tag}/${rule.kind}/${rule.attr.prop}`;
    case 'tagRename':
    case 'colorToken':
      return `${tag}/${rule.kind}`;
    case 'classSemantic':
      return `${tag}/${rule.kind}/${rule.channel}`;
    case 'classSemanticReport':
      return `${tag}/${rule.kind}/${rule.reason}`;
    case 'variantRename':
      return `${tag}/${rule.kind}/${rule.from}`;
    case 'cssVarRemove':
    case 'classReport':
      return `${tag}/${rule.kind}/${rule.name}`;
    case 'cssVarRename':
    case 'cssVarSurfaceReport':
    case 'classRename':
    case 'partRename':
    case 'eventRename':
      return `${tag}/${rule.kind}/${rule.from}`;
  }
};

export const getByTag = (manifest: Manifest, tag: string): ComponentManifest | undefined =>
  manifest.components[tag];

/** Lazily-built React-name → component index. */
const reactIndexCache = new WeakMap<Manifest, Map<string, ComponentManifest>>();

export const getByReactName = (
  manifest: Manifest,
  react: string,
): ComponentManifest | undefined => {
  let index = reactIndexCache.get(manifest);
  if (!index) {
    index = new Map();
    for (const component of Object.values(manifest.components))
      index.set(component.react, component);
    reactIndexCache.set(manifest, index);
  }
  return index.get(react);
};

/**
 * The effective rule list for a component: the global per-component rules
 * (currently `tone`) resolved against this component, followed by its own
 * rules. Global `tone` only materialises for components that declare the
 * referenced v2 enum set.
 *
 * Note: `removeDefaultSlot` is intentionally *not* expanded here — `slot="default"`
 * lives on the projected child (any tag), not on the `mds-*` element, so each
 * surface applies it globally by reading `manifest.global.removeDefaultSlot`.
 */
export const rulesForComponent = (manifest: Manifest, component: ComponentManifest): Rule[] => {
  const rules: Rule[] = [];

  const tone = manifest.global.tone;
  if (tone && component.v2EnumSets?.[tone.toneSet]) {
    const toneRule: EnumRemapRule = {
      kind: 'enumRemap',
      prop: tone.prop,
      map: tone.overrides?.[component.tag] ?? tone.map,
      v2set: tone.toneSet,
      confidence: 'review',
    };
    rules.push(toneRule);
  }

  rules.push(...component.rules);
  return rules;
};

/** Resolve the v2 enum set referenced by an `enumRemap` rule, if any. */
export const v2SetFor = (
  component: ComponentManifest,
  rule: EnumRemapRule,
): readonly string[] | undefined => (rule.v2set ? component.v2EnumSets?.[rule.v2set] : undefined);

/**
 * The v1 → v2 tag renames of the manifest, keyed by v1 tag. Read in one lookup
 * per element so the renames are simultaneous: `mds-pref-theme` becomes
 * `mds-pref-mode` while `mds-pref-theme-variant` becomes `mds-pref-theme`, and
 * neither result is looked up again.
 */
const tagRenameCache = new WeakMap<Manifest, Map<string, TagRenameRule>>();

export const tagRenamesOf = (manifest: Manifest): Map<string, TagRenameRule> => {
  let renames = tagRenameCache.get(manifest);
  if (!renames) {
    renames = new Map();
    for (const component of Object.values(manifest.components)) {
      const rule = component.rules.find((r): r is TagRenameRule => r.kind === 'tagRename');
      if (rule) renames.set(component.tag, rule);
    }
    tagRenameCache.set(manifest, renames);
  }
  return renames;
};

/** The rule kinds a surface applies to an element's markup (attributes, slots, tag), not to CSS. */
const MARKUP_KINDS: ReadonlySet<Rule['kind']> = new Set([
  'propRename',
  'propRemove',
  'enumRemap',
  'booleanInvert',
  'slotRemove',
  'slotRename',
  'slotToAttr',
  'ensureAttr',
  'tagRename',
  'eventRename',
]);

/**
 * Whether a component has rules on its markup. The reports that tell the
 * reader to check an element by hand (spread props, a template with `${}`)
 * are about these rules: a jump whose rules on a component are CSS only (its
 * custom properties) has nothing to check there.
 */
export const hasMarkupRules = (manifest: Manifest, component: ComponentManifest): boolean =>
  rulesForComponent(manifest, component).some((rule) => MARKUP_KINDS.has(rule.kind));

/**
 * The start tags of the elements whose markup the jump rewrites or reports, as
 * one expression: a template the codemod cannot parse (`${}`) is reported when
 * it holds one. Every `mds-*` tag when `slot="default"` is dropped from any
 * element (v1 -> v2); otherwise the tags of the components with markup rules,
 * so the one rule of v2 -> v3 on the items of an accordion (#1218) does not
 * report every template with an `mds-*` element. `undefined` when none.
 */
export const markupTagRe = (manifest: Manifest): RegExp | undefined => {
  if (manifest.global.removeDefaultSlot === true) return /<mds-[a-z-]/;
  const tags = Object.values(manifest.components)
    .filter((component) => hasMarkupRules(manifest, component))
    .map((component) => component.tag);
  return tags.length > 0 ? new RegExp(`<(?:${tags.join('|')})(?![a-z0-9-])`) : undefined;
};
