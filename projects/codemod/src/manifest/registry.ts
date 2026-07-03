/**
 * Deterministic name helpers and manifest accessors shared by the generator
 * (which builds the manifest from `documentation.json`) and the transformers
 * (which consume it).
 */
import { type ComponentManifest, type EnumRemapRule, type Manifest, type Rule } from './schema.js';

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
    case 'cssVarRemove':
      return `${tag}/${rule.kind}/${rule.name}`;
    case 'cssVarRename':
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
      map: tone.map,
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
