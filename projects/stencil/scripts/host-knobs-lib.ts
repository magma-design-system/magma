/**
 * The baseline of magma/host-knobs (#1499, SPEC.md "The knobs on :host"): the sheets that do not
 * follow the rule yet, each with the count of what the rule reports in it, relative to
 * src/components (`"mds-button/mds-button.css": 40`). The rule holds every sheet at its count
 * (scripts/stylelint-host-knobs.mjs); the counts only go down, and a sheet leaves the list at 0.
 *
 * Kept free of file-system side effects so scripts/host-knobs-lib.spec.ts can test it.
 */

export type Pending = Record<string, number>;

/** One report of the rule, on a sheet relative to src/components. */
export interface Problem {
  sheet: string;
  line: number;
  text: string;
}

/**
 * The count of the reports of each sheet.
 */
export const countBySheet = (problems: Problem[]): Pending => {
  const counts: Pending = {};
  for (const { sheet } of problems) counts[sheet] = (counts[sheet] ?? 0) + 1;
  return counts;
};

/**
 * The baseline lowered to what the rule reports now: a count never goes up, a sheet that
 * reports nothing (or no longer exists) leaves the list, a sheet the list does not name is not
 * added. Sorted, as the file is written.
 */
export const lowerPending = (pending: Pending, counts: Pending): Pending =>
  Object.fromEntries(
    Object.keys(pending)
      .sort()
      .map((sheet) => [sheet, Math.min(pending[sheet], counts[sheet] ?? 0)] as const)
      .filter(([, count]) => count > 0),
  );

/**
 * The component a sheet belongs to: its first folder.
 */
export const componentOfSheet = (sheet: string): string => sheet.split('/')[0];
