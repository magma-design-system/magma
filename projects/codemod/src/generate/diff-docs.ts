/**
 * Generate a **candidate** manifest by diffing two Stencil `documentation.json`
 * payloads (v1 and v2). The deterministic outputs — attr↔prop pairs, React
 * names, the per-component v2 enum sets — are reliable; the pairing heuristics
 * (boolean inversion, CSS var renames, part/event renames) are best-effort
 * candidates marked `review`/`manual` for a human to ratify. The runtime
 * `manifest.ts` is then maintained by merging this candidate's output.
 */
import { propToAttr, tagToReactName } from '../manifest/registry.js';
import { type ComponentManifest, type Manifest, type Rule } from '../manifest/schema.js';

// --- Minimal subset of the Stencil docs-json shape we rely on. ---
export interface DocsValue {
  value?: string;
  type: string;
}
export interface DocsProp {
  name: string;
  attr?: string;
  type: string;
  values?: DocsValue[];
  default?: string;
}
export interface DocsComponent {
  tag: string;
  props?: DocsProp[];
  styles?: { name: string }[];
  parts?: { name: string }[];
  slots?: { name: string }[];
  events?: { event: string }[];
}
export interface JsonDocs {
  components: DocsComponent[];
}

const cap = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);
// Stencil emits `boolean | undefined` for optional props, so match on the union members.
const isBool = (p: DocsProp): boolean => p.type.split('|').some((t) => t.trim() === 'boolean');

const enumValues = (p: DocsProp): string[] | undefined => {
  const values = (p.values ?? [])
    .filter((v) => v.type === 'string' && typeof v.value === 'string')
    .map((v) => v.value!);
  return values.length > 1 ? values : undefined;
};

const propId = (p: DocsProp) => ({ attr: p.attr ?? propToAttr(p.name), prop: p.name });
const byName = <T extends { name: string }>(items: T[]): Map<string, T> =>
  new Map(items.map((i) => [i.name, i]));
const setEq = (a: string[], b: string[]): boolean =>
  a.length === b.length && a.every((v) => b.includes(v));

/** Find the v2 boolean prop that looks like the inverted form of a removed v1 prop. */
const findInverted = (removed: DocsProp, addedBool: DocsProp[]): DocsProp | undefined => {
  const name = removed.name;
  const negated = (base: string): string[] => [
    `hide${cap(base)}`,
    `disable${cap(base)}`,
    `no${cap(base)}`,
  ];
  const candidates = negated(name);
  // v1 `showX` → v2 `hideX`: the `show` prefix drops, the negation flips.
  const shown = name.replace(/^show([A-Z])/, (_, c: string) => c.toLowerCase());
  if (shown !== name) candidates.push(...negated(shown));
  // v1 already negated (e.g. `hideArrow` → v2 `arrow`): stripping the prefix flips the polarity.
  // (`show` is intentionally not stripped here: `showX` → `x` keeps the polarity, so it is not an inversion.)
  const stripped = name.replace(/^(hide|disable|no)([A-Z])/, (_, __, c: string) => c.toLowerCase());
  if (stripped !== name) candidates.push(stripped);
  return addedBool.find((a) => candidates.includes(a.name));
};

export const diffComponent = (v1: DocsComponent, v2: DocsComponent): ComponentManifest => {
  const v1Props = byName(v1.props ?? []);
  const v2Props = byName(v2.props ?? []);
  const removedProps = [...v1Props.values()].filter((p) => !v2Props.has(p.name));
  const addedProps = [...v2Props.values()].filter((p) => !v1Props.has(p.name));
  const addedBool = addedProps.filter(isBool);
  const usedAdded = new Set<string>();
  const rules: Rule[] = [];

  // Boolean inversion (B).
  for (const r of removedProps.filter(isBool)) {
    const a = findInverted(
      r,
      addedBool.filter((p) => !usedAdded.has(p.name)),
    );
    if (a) {
      usedAdded.add(a.name);
      rules.push({
        kind: 'booleanInvert',
        from: propId(r),
        to: propId(a),
        oldDefault: r.default === 'true',
        newDefault: a.default === 'true',
        confidence: 'review',
      });
    }
  }

  // Enum changes on props present in both (A/E).
  const v2EnumSets: Record<string, readonly string[]> = {};
  for (const [name, v2p] of v2Props) {
    const v2set = enumValues(v2p);
    if (v2set) v2EnumSets[name] = v2set;
    const v1p = v1Props.get(name);
    if (!v1p) continue;
    const v1set = enumValues(v1p);
    if (v1set && v2set && !setEq(v1set, v2set)) {
      const removedValues = v1set.filter((v) => !v2set.includes(v));
      if (removedValues.length) {
        rules.push({
          kind: 'enumRemap',
          prop: propId(v2p),
          map: Object.fromEntries(removedValues.map((v) => [v, null])),
          v2set: name,
          confidence: 'manual',
        });
      }
    }
  }

  // Removed props with no inverted pair → removal (C).
  const invertedFromNames = new Set(
    rules.flatMap((rule) => (rule.kind === 'booleanInvert' ? [rule.from.prop] : [])),
  );
  for (const r of removedProps) {
    if (invertedFromNames.has(r.name)) continue;
    rules.push({
      kind: 'propRemove',
      prop: propId(r),
      strategy: 'comment',
      message: `\`${r.name}\` was removed in v2; migrate manually.`,
    });
  }

  // CSS custom properties: renames (G) and plain removals (G2).
  const v2Styles = new Set((v2.styles ?? []).map((s) => s.name));
  const v1Styles = (v1.styles ?? []).map((s) => s.name);
  for (const name of v1Styles) {
    if (v2Styles.has(name)) continue;
    const base = name.slice(2); // strip leading --
    if (v2Styles.has(`${name}-rgb`)) {
      rules.push({ kind: 'cssVarRename', from: base, to: `${base}-rgb`, valueFormatChanged: true });
    } else if (name.includes('ghost') && v2Styles.has(name.replace('ghost', 'outline'))) {
      rules.push({
        kind: 'cssVarRename',
        from: base,
        to: name.replace('ghost', 'outline').slice(2),
      });
    } else {
      rules.push({
        kind: 'cssVarRemove',
        name: base,
        message: `\`${name}\` was removed in v2 with no replacement; migrate manually.`,
      });
    }
  }

  // Named slots removed in v2 (F). The default slot is handled by the global rule.
  const v2Slots = new Set((v2.slots ?? []).map((s) => s.name));
  for (const { name } of v1.slots ?? []) {
    if (name === '' || name === 'default' || v2Slots.has(name)) continue;
    rules.push({ kind: 'slotRemove', from: name });
  }

  // Shadow parts (H) and events (I): pair when exactly one was removed and one added.
  pairRename(
    (v1.parts ?? []).map((p) => p.name),
    (v2.parts ?? []).map((p) => p.name),
    (from, to) => rules.push({ kind: 'partRename', from, to }),
  );
  pairRename(
    (v1.events ?? []).map((e) => e.event),
    (v2.events ?? []).map((e) => e.event),
    (from, to) => rules.push({ kind: 'eventRename', from, to }),
  );

  const component: ComponentManifest = { tag: v2.tag, react: tagToReactName(v2.tag), rules };
  if (Object.keys(v2EnumSets).length) component.v2EnumSets = v2EnumSets;
  return component;
};

const pairRename = (v1: string[], v2: string[], emit: (from: string, to: string) => void): void => {
  const removed = v1.filter((n) => !v2.includes(n));
  const added = v2.filter((n) => !v1.includes(n));
  if (removed.length === 1 && added.length === 1) emit(removed[0]!, added[0]!);
};

export const generateCandidateManifest = (
  v1: JsonDocs,
  v2: JsonDocs,
  opts: { fromVersion?: string; toVersion?: string } = {},
): Manifest => {
  const v1ByTag = new Map(v1.components.map((c) => [c.tag, c]));
  const components: Record<string, ComponentManifest> = {};
  let hasTone = false;
  let hasDefaultSlot = false;

  for (const v2c of v2.components) {
    const v1c = v1ByTag.get(v2c.tag);
    if (!v1c) continue; // new component, nothing to migrate
    const candidate = diffComponent(v1c, v2c);
    if (candidate.rules.length || candidate.v2EnumSets) components[v2c.tag] = candidate;
    if ((v2c.props ?? []).some((p) => p.name === 'tone')) hasTone = true;
    if ((v1c.slots ?? []).some((s) => s.name === 'default')) hasDefaultSlot = true;
  }

  return {
    fromVersion: opts.fromVersion ?? 'unknown',
    toVersion: opts.toVersion ?? 'unknown',
    global: {
      ...(hasTone
        ? {
            tone: {
              prop: { attr: 'tone', prop: 'tone' },
              map: { ghost: 'outline', quiet: 'weak' },
              toneSet: 'tone',
            },
          }
        : {}),
      removeDefaultSlot: hasDefaultSlot,
    },
    components,
  };
};
