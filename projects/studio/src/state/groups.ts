import type { GroupConfig } from '@maggioli-design-system/design-tokens/src/lib/color.mjs';
import { updateConfig, type StudioState } from './studio.js';

/*
  The actions of Groups (#1400, out of the JSX of app.tsx): the settings a group gives its
  families, and the export groups of several families at once (the Batch export).
*/

/**
 * Writes the settings of a group: its scale, its formula, its export groups, and keeps the others
 * it has (`surface`, `emphasis`: the surfaces of the status colours, #1403 found them dropped by a
 * change of the formula). Only the ones set stay; a group left with none goes, and so does `groups`
 * when it is empty.
 */
export function updateGroup(state: StudioState, groupName: string, patch: GroupConfig): void {
  updateConfig(state, (draft) => {
    const cleaned = Object.fromEntries(
      Object.entries(patch).filter(([, value]) => value !== undefined),
    ) as GroupConfig;
    const nextGroups = { ...(draft.groups ?? {}) };
    if (Object.keys(cleaned).length === 0) delete nextGroups[groupName];
    else nextGroups[groupName] = cleaned;
    if (Object.keys(nextGroups).length === 0) delete (draft as Record<string, unknown>).groups;
    else draft.groups = nextGroups;
  });
}

/**
 * The export groups of the families named: the list given, or none of their own (they inherit the
 * one of their group) when it is undefined.
 */
export function setExports(
  state: StudioState,
  names: string[],
  exportList: string[] | undefined,
): void {
  const target = new Set(names);
  updateConfig(state, (draft) => {
    draft.colors.forEach((color) => {
      if (!target.has(color.name)) return;
      if (exportList) color.export = exportList;
      else delete color.export;
    });
  });
}
