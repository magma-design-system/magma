import DEFAULT_COLOR_CONFIG from '@maggioli-design-system/design-tokens/src/config/default-color.json';
import type { Formula, MagmaConfig } from '@maggioli-design-system/design-tokens/src/lib/color.mjs';
import type { LoadedRatios } from './draft.js';
import { msg } from '../shared/i18n/text.js';
import { updateConfig, type StudioState } from './studio.js';
import { undoably } from './undo.js';

/*
  The actions of Contrast scales (#1400, out of the JSX of app.tsx): the scales of a formula,
  changed, renamed, added and deleted. A configuration writes only the scales it changes; the
  generator lays them over the built-in ones, and a null entry deletes a built-in one.
*/

/** The contrast scales of a formula, by name: the targets of the steps of a ramp. */
export interface RatioSet {
  [scaleName: string]: number[];
}

/** The scales a formula has before any configuration: the built-in ones of design-tokens. */
export const builtinScalesOf = (formula: Formula): RatioSet =>
  ((DEFAULT_COLOR_CONFIG.ratios as Record<Formula, RatioSet>)[formula] ?? {}) as RatioSet;

/**
 * The scales of a formula as the generator merges them: the entries a configuration writes over
 * the built-in ones, a null entry (a built-in deleted) left out.
 */
export function scalesOf(ratios: LoadedRatios | MagmaConfig['ratios'], formula: Formula): RatioSet {
  return Object.fromEntries(
    Object.entries({ ...builtinScalesOf(formula), ...(ratios?.[formula] ?? {}) }).filter(
      ([, values]) => Array.isArray(values),
    ),
  ) as RatioSet;
}

/**
 * Changes the scales of a formula on the configuration: the built-in ones are written into it
 * first, so the set the mutation sees is the one the generator merges, deleted ones included.
 */
function writeScales(
  draft: MagmaConfig,
  formula: Formula,
  mutate: (scales: RatioSet) => void,
): void {
  const materialized = { ...builtinScalesOf(formula), ...(draft.ratios?.[formula] ?? {}) };
  mutate(materialized);
  draft.ratios = { ...(draft.ratios ?? {}), [formula]: materialized } as MagmaConfig['ratios'];
}

/** The targets of the steps of a scale. */
export function changeScale(
  state: StudioState,
  formula: Formula,
  name: string,
  values: number[],
): void {
  updateConfig(state, (draft) =>
    writeScales(draft, formula, (scales) => {
      scales[name] = values;
    }),
  );
}

/**
 * Renames a scale, and the families and groups that use it follow. Nothing happens for an empty
 * name, the same one, or one another scale has: returns whether it was renamed.
 */
export function renameScale(
  state: StudioState,
  formula: Formula,
  name: string,
  nextName: string,
): boolean {
  if (!nextName || nextName === name || scalesOf(state.config.peek().ratios, formula)[nextName])
    return false;
  updateConfig(state, (draft) => {
    writeScales(draft, formula, (scales) => {
      scales[nextName] = scales[name];
      delete scales[name];
    });
    draft.colors.forEach((color) => {
      if (color.ratios === name) color.ratios = nextName;
    });
    Object.values(draft.groups ?? {}).forEach((group) => {
      if (group.ratios === name) group.ratios = nextName;
    });
  });
  return true;
}

/** Adds a scale, `custom-<n>`, a copy of another one (else of `default`): returns its name. */
export function addScale(state: StudioState, formula: Formula, copyFrom: string): string {
  const scales = scalesOf(state.config.peek().ratios, formula);
  let index = 1;
  while (scales[`custom-${index}`]) index += 1;
  const name = `custom-${index}`;
  updateConfig(state, (draft) =>
    writeScales(draft, formula, (set) => {
      set[name] = [...(set[copyFrom] ?? set.default)];
    }),
  );
  return name;
}

/**
 * Deletes a scale: the families and groups that used it fall back to the mandatory default. A
 * built-in scale stays deleted with a null entry, since the generator merges the built-ins back.
 */
export function deleteScale(state: StudioState, formula: Formula, name: string): void {
  // nothing asked: a toast undoes it (undo.ts), the families and groups that used it with it
  undoably(state, { text: msg('The scale {name} deleted.'), vars: { name } }, () =>
    updateConfig(state, (draft) => {
      draft.colors.forEach((color) => {
        const colorFormula = color.formula ?? draft.formula ?? 'wcag3';
        if (colorFormula === formula && color.ratios === name) delete color.ratios;
      });
      Object.values(draft.groups ?? {}).forEach((group) => {
        if (group.ratios === name) delete group.ratios;
      });
      writeScales(draft, formula, (scales) => {
        if (name in builtinScalesOf(formula)) (scales as Record<string, unknown>)[name] = null;
        else delete scales[name];
      });
    }),
  );
}

/**
 * Takes a built-in scale back to its built-in steps, their number with them: what a preset written
 * before the number was locked needs when families that paint Magma use it (studio.object-model.md,
 * section 4, Scala di contrasto, question 10). Nothing asked: a toast undoes it.
 */
export function restoreBuiltinSteps(state: StudioState, formula: Formula, name: string): void {
  const builtin = builtinScalesOf(formula)[name];
  if (!Array.isArray(builtin)) return;
  undoably(
    state,
    {
      text: msg('The scale {name} back to its {count} built-in steps.'),
      vars: { name, count: builtin.length },
    },
    () => changeScale(state, formula, name, [...builtin]),
  );
}
