import type { ColorConfig } from '@maggioli-design-system/design-tokens/src/lib/color.mjs';
import {
  SURFACE_ROLES,
  type ThemeConfig,
} from '@maggioli-design-system/design-tokens/src/lib/surface.mjs';
import { DEFAULT_THEME, pushSurfaces, type Levels, type Mode } from '../engine/weights.js';
import { clone, updateConfig, type StudioState } from './studio.js';

/*
  The actions of the surfaces (#1400, out of the JSX of app.tsx): which families and groups
  generate surfaces, a field of the family in Colours and of the group in Groups (#1403), and the
  weights, the `theme` block of the configuration the stage Weights edits.
*/

// the weights of a configuration that names none, those of Magma (engine/weights.ts)
export { DEFAULT_THEME } from '../engine/weights.js';

/**
 * Opts a family into the surfaces, or out (the switch of the family in Colours, #1403). Set to what
 * its group says, the family inherits it again and the key goes, as the other fields of a family
 * do; set against it, the family says so: `true` in a silent group, `false` in a group that opts in
 * (or it would inherit the group straight back).
 */
export function toggleSurface(state: StudioState, colorName: string, on: boolean): void {
  updateConfig(state, (draft) => {
    const color = draft.colors.find((c) => c.name === colorName) as ColorConfig | undefined;
    if (!color) return;
    const groupOn = Boolean(draft.groups?.[colorName.split('.')[0]]?.surface);
    if (on === groupOn) delete color.surface;
    else color.surface = on;
  });
}

/**
 * Opts a whole group into the surfaces, or out. A group entry that carries nothing else goes, so
 * toggling on and back off leaves the config byte-identical; once the group is off, the `false`
 * of its families (there only to escape the group) goes too.
 */
export function toggleGroupSurface(state: StudioState, groupName: string, on: boolean): void {
  updateConfig(state, (draft) => {
    const groups = { ...(draft.groups ?? {}) };
    const group = { ...(groups[groupName] ?? {}) };
    if (on) group.surface = true;
    else delete (group as Record<string, unknown>).surface;
    if (Object.keys(group).length === 0) delete groups[groupName];
    else groups[groupName] = group;
    if (Object.keys(groups).length === 0) delete draft.groups;
    else draft.groups = groups;
    if (!on) {
      draft.colors.forEach((color) => {
        if (color.name.split('.')[0] === groupName && color.surface === false) delete color.surface;
      });
    }
  });
}

/** Changes the weights: a configuration with none starts from those of Magma. */
export function updateBalances(state: StudioState, mutate: (theme: ThemeConfig) => void): void {
  updateConfig(state, (draft) => {
    if (!draft.theme) draft.theme = clone(DEFAULT_THEME);
    mutate(draft.theme);
  });
}

/**
 * Sets the lightness of a surface in a mode, the surfaces past it pushed along so the order of
 * depth holds (engine/weights.ts, vittorio, 2026-11-27).
 */
export function setSurfaceLevel(
  state: StudioState,
  mode: Mode,
  role: string,
  percent: number,
): void {
  updateBalances(state, (theme) => {
    const levels = theme.surfaces as Record<Mode, Levels>;
    levels[mode] = pushSurfaces(levels[mode], SURFACE_ROLES, role, percent);
  });
}

/** Sets the lightness of a border in a mode. */
export function setBorderLevel(
  state: StudioState,
  mode: Mode,
  role: string,
  percent: number,
): void {
  updateBalances(state, (theme) => {
    (theme.borders as Record<Mode, Levels>)[mode][role] = `${percent}%`;
  });
}

/** Sets the APCA Lc target of a text role, one for both modes. */
export function setTextTarget(state: StudioState, role: string, target: number): void {
  updateBalances(state, (theme) => {
    const text = (theme.text ??= { ...DEFAULT_THEME.text });
    (text as Record<string, number | { step: number }>)[role] = target;
  });
}
