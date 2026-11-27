import chroma from 'chroma-js';

/*
  The order of the families (#1403): in their groups, and in chromatic order inside each group,
  everywhere a family shows or goes out: the list of Colours, the pickers, the preset the studio
  writes and the files it exports (studio.object-model.md, section 4, Family, "Ordine"; the person
  chose the criterion on its render, 2026-11-27, option B). The studio sorts and design-tokens
  keeps the order of the configuration it reads: moving this to the engine of design-tokens, so a
  configuration written by hand comes out in order too, is an issue of its own (question 12 of
  the model, answered 2026-11-27).

  - The groups keep their order: the variants first (the first of them is where the work starts,
    vittorio, 2026-11-05), then the others in the order the configuration names them, a new one
    last.
  - A family is placed by the OKLCH hue of its key colour, from 0 degrees, the red; a reference
    (an alias) by the key colour of the family it follows.
  - The group of the neutrals (`tone`, the row `neutrals` of GLOSSARY.md) runs from cool to warm,
    on the b axis of OKLab (blue below zero, yellow above): its families are greys with a cast,
    whose hue alone would split them (`porcelain`, chroma 0.035, would leave the others).
  - In another group, a grey, whose chroma is under HUE_READABLE, has no hue to place it by: the
    greys come first, from the lightest.
  - A family with no colour to read (a reference to a family that is not there, a value the
    colour library refuses) comes last; equal keys keep the order of the configuration.

  Pure: no Preact, no state, no document.
*/

/**
 * Under this OKLCH chroma the hue of a colour is noise: the value of `HUE_READABLE` in
 * `projects/design-tokens/src/lib/ramp-grade.mts`, which does not export it
 * (colour-order.test.mts holds the two equal).
 */
export const HUE_READABLE = 0.03;

/** The group of the neutrals (GLOSSARY.md, `neutrals`): ordered from cool to warm. */
export const NEUTRALS_GROUP = 'tone';

/** The group of the references, first in every list. */
export const VARIANTS_GROUP = 'variant';

/** A family as the order reads it: its name (`<group>.<name>`), its colour or its source. */
export interface OrderedFamily {
  name: string;
  color?: string;
  alias?: string;
}

/** The group of a family, the prefix of its name: `label` of `label.red`. */
export const groupOf = (name: string): string => name.split('.')[0];

interface Key {
  /** OKLCH lightness, from 0 to 1. */
  lightness: number;
  chroma: number;
  /** OKLCH hue in degrees, 0 when the colour has none. */
  hue: number;
}

/** The key colour of a family, in OKLCH: its own, or its source's for a reference. */
function keyOf(family: OrderedFamily, byName: Map<string, OrderedFamily>): Key | undefined {
  const source = family.alias ? byName.get(family.alias) : family;
  const color = source?.color;
  if (!color || !chroma.valid(color)) return undefined;
  const [lightness, chromaValue, hue] = chroma(color).oklch();
  return { lightness, chroma: chromaValue, hue: Number.isNaN(hue) ? 0 : hue };
}

/** Where a family stands on the b axis of OKLab: below zero blue, above zero yellow. */
const warmthOf = (key: Key): number => key.chroma * Math.sin((key.hue * Math.PI) / 180);

/** The rank of a family inside its group, as a list of numbers compared in turn. */
function rankOf(group: string, key: Key | undefined): number[] {
  if (!key) return [2, 0];
  if (group === NEUTRALS_GROUP) return [0, warmthOf(key)];
  // the greys first, the lightest first; then the hues from red
  if (key.chroma < HUE_READABLE) return [0, -key.lightness];
  return [1, key.hue];
}

function compareRanks(a: number[], b: number[]): number {
  for (let index = 0; index < Math.max(a.length, b.length); index++) {
    const difference = (a[index] ?? 0) - (b[index] ?? 0);
    if (difference !== 0) return difference;
  }
  return 0;
}

/** The groups of the families, in their order: the variants first, then as the list names them. */
export function groupsInOrder(families: readonly OrderedFamily[]): string[] {
  const groups = [...new Set(families.map((family) => groupOf(family.name)))];
  return groups.includes(VARIANTS_GROUP)
    ? [VARIANTS_GROUP, ...groups.filter((group) => group !== VARIANTS_GROUP)]
    : groups;
}

/**
 * The families in their order: grouped, the groups in their order, the families of each group in
 * chromatic order. A new array; the families are the same objects.
 */
export function chromaticOrder<F extends OrderedFamily>(families: readonly F[]): F[] {
  const byName = new Map<string, OrderedFamily>(families.map((family) => [family.name, family]));
  const ranked = families.map((family, index) => {
    const group = groupOf(family.name);
    return { family, group, index, rank: rankOf(group, keyOf(family, byName)) };
  });
  const groups = groupsInOrder(families);
  return ranked
    .sort(
      (a, b) =>
        groups.indexOf(a.group) - groups.indexOf(b.group) ||
        compareRanks(a.rank, b.rank) ||
        a.index - b.index,
    )
    .map((one) => one.family);
}

/** A preset with its families in their order, as the studio writes it and exports its files. */
export function presetInOrder<C extends { colors: OrderedFamily[] }>(config: C): C {
  return { ...config, colors: chromaticOrder(config.colors) };
}
