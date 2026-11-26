import { batch } from '@preact/signals';
import type {
  ColorConfig,
  MagmaConfig,
} from '@maggioli-design-system/design-tokens/src/lib/color.mjs';
import { nearestColorName } from '../engine/color-names.js';
import { msg } from '../shared/i18n/text.js';
import { clone, updateConfig, type StudioState } from './studio.js';

/*
  The actions of the Palette (#1400, out of the JSX of app.tsx): the families of the
  configuration, added, copied, removed and edited, and the settings of the whole configuration.
*/

/** The family the person selects: the Palette shows it, Contrast scales samples it. */
export function selectFamily(state: StudioState, name: string): void {
  state.selectedName.value = name;
}

/** A family to add: its own colour, or a reference to another family. */
export interface NewFamily {
  /** 'color' solves a palette of its own, 'alias' follows another family. */
  kind: 'color' | 'alias';
  group: string;
  name: string;
  /** The base colour of an own family. */
  color: string;
  /** The family a reference follows (`<group>.<name>`). */
  alias: string;
  /** The name was typed by the person, not given after the colour. */
  manual: boolean;
}

/**
 * Adds a family at the end of the configuration and selects it. Its name is made unique in its
 * group with a counter (`red-2`); a name given after the colour keeps following it (autoNameFamily).
 * Returns the full name.
 */
export function addFamily(state: StudioState, family: NewFamily): string {
  const colors = state.config.peek().colors;
  const base = family.name.trim();
  let candidate = base;
  let suffix = 2;
  while (colors.some((c) => c.name === `${family.group}.${candidate}`)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  const fullName = `${family.group}.${candidate}`;
  if (family.kind === 'color' && !family.manual) state.autoNamed.add(fullName);
  batch(() => {
    updateConfig(state, (draft) => {
      // color XOR alias: emit exactly one of the two fields
      draft.colors.push(
        (family.kind === 'alias'
          ? { name: fullName, alias: family.alias }
          : { name: fullName, color: family.color }) as ColorConfig,
      );
    });
    state.selectedName.value = fullName;
  });
  return fullName;
}

/** Copies a family right after it, as `<name>-copy`, and selects the copy. */
export function duplicateFamily(state: StudioState, name: string): void {
  const index = state.config.peek().colors.findIndex((c) => c.name === name);
  if (index < 0) return;
  const copyName = `${name}-copy`;
  batch(() => {
    updateConfig(state, (draft) => {
      const copy = clone(draft.colors[index]);
      copy.name = copyName;
      draft.colors.splice(index + 1, 0, copy);
    });
    state.selectedName.value = copyName;
  });
}

/** Removes a family and selects the first one left. */
export function deleteFamily(state: StudioState, name: string): void {
  const index = state.config.peek().colors.findIndex((c) => c.name === name);
  if (index < 0) return;
  batch(() => {
    updateConfig(state, (draft) => {
      draft.colors.splice(index, 1);
    });
    state.selectedName.value = state.config.peek().colors[0]?.name ?? '';
  });
}

/**
 * Writes the fields of a family: a field set to undefined goes. A family carries its own base
 * colour or a reference, never both (the schema of design-tokens): setting one drops the other. A
 * new name follows the family in the selection, and a name the person typed stops following its
 * colour.
 */
export function patchFamily(state: StudioState, name: string, patch: Partial<ColorConfig>): void {
  const index = state.config.peek().colors.findIndex((c) => c.name === name);
  if (index < 0) return;
  if ('name' in patch) state.autoNamed.delete(name);
  batch(() => {
    updateConfig(state, (draft) => {
      const target = draft.colors[index] as unknown as Record<string, unknown>;
      Object.entries(patch).forEach(([key, value]) => {
        if (value === undefined) delete target[key];
        else target[key] = value;
      });
      if ('alias' in patch && patch.alias) delete target.color;
      if ('color' in patch && patch.color) delete target.alias;
    });
    if ('name' in patch && typeof patch.name === 'string') state.selectedName.value = patch.name;
  });
}

/**
 * At each colour of the colour field of a family (a code typed, a step of the picker): a family
 * still carrying a name the studio gave (or a new-N placeholder) is renamed after its colour,
 * unique in its group, and stays selected; a colour another family already has is only a warning.
 */
export function autoNameFamily(state: StudioState, name: string, hex: string): void {
  const colors = state.config.peek().colors;
  const index = colors.findIndex((c) => c.name === name);
  if (index < 0) return;
  const duplicate = colors.find(
    (other, i) => i !== index && !!other.color && other.color.toLowerCase() === hex.toLowerCase(),
  );
  state.notice.value = duplicate
    ? {
        text: msg('Warning: {hex} is already used by "{name}"'),
        vars: { hex, name: duplicate.name },
      }
    : null;

  const [group, baseName] = name.split('.');
  const autoAssigned = /^new(-\d+)?$/.test(baseName ?? '') || state.autoNamed.has(name);
  if (!autoAssigned) return;
  const vocabularyName = nearestColorName(hex);
  let candidate = vocabularyName;
  let suffix = 2;
  while (colors.some((other, i) => i !== index && other.name === `${group}.${candidate}`)) {
    candidate = `${vocabularyName}-${suffix}`;
    suffix += 1;
  }
  const nextName = `${group}.${candidate}`;
  if (nextName === name) return;
  state.autoNamed.delete(name);
  state.autoNamed.add(nextName);
  batch(() => {
    updateConfig(state, (draft) => {
      draft.colors[index].name = nextName;
    });
    state.selectedName.value = nextName;
  });
}

/** The settings of the whole configuration the Palette edits, below its families. */
export type GlobalSetting = 'colorspace' | 'smooth' | 'hueShift' | 'saturation';

/** Writes a setting of the whole configuration; undefined removes it (no global curve). */
export function setGlobal<Key extends GlobalSetting>(
  state: StudioState,
  key: Key,
  value: MagmaConfig[Key] | undefined,
): void {
  updateConfig(state, (draft) => {
    if (value === undefined) delete (draft as Record<string, unknown>)[key];
    else (draft as MagmaConfig)[key] = value as MagmaConfig[Key];
  });
}
