import bundledJson from '@maggioli-design-system/design-tokens/.magma-design-tokensrc.json';
import type { ColorConfig } from '@maggioli-design-system/design-tokens/src/lib/color.mjs';
import type { ThemeConfig } from '@maggioli-design-system/design-tokens/src/lib/surface.mjs';
import { clone, updateConfig, type StudioState } from './studio.js';

/*
  The actions of Semantic surface (#1400, out of the JSX of app.tsx): which families and groups
  generate surfaces, and the balances of the `theme` block of the configuration.
*/

/**
 * The balances of a configuration that names none: the `theme` block of the configuration Magma
 * builds with (design-tokens `.magma-design-tokensrc.json`), its surface and border levels and the
 * APCA Lc targets of the text roles (A7, #632).
 */
export const DEFAULT_THEME = (bundledJson as { theme: ThemeConfig }).theme;

/**
 * Opts a family into the surfaces, or out. With a group that opts in, "off" is not always the
 * absence of the key: a family of such a group writes an explicit `false`, or it would inherit
 * the group straight back. When the group is silent, the key goes, so the config stays clean.
 */
export function toggleSurface(state: StudioState, colorName: string, on: boolean): void {
  updateConfig(state, (draft) => {
    const color = draft.colors.find((c) => c.name === colorName) as ColorConfig | undefined;
    if (!color) return;
    const groupOn = Boolean(draft.groups?.[colorName.split('.')[0]]?.surface);
    if (on) color.surface = true;
    else if (groupOn) color.surface = false;
    else delete color.surface;
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

/** Changes the balances: a configuration with none starts from those of Magma. */
export function updateBalances(state: StudioState, mutate: (theme: ThemeConfig) => void): void {
  updateConfig(state, (draft) => {
    if (!draft.theme) draft.theme = clone(DEFAULT_THEME);
    mutate(draft.theme);
  });
}
