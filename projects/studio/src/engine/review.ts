import type { Mode } from '@maggioli-design-system/design-tokens/src/lib/contrast-gate.js';
import type { GatePair, GateReport, GateTheme } from './gate.js';

/*
  The full review as data (#1404), with no Preact and no state: one item per theme and mode the
  theme is used in, in the order of the themes, light before dark; each with what the contrast
  check says of it (the pairs that block, the reported ones, the debt the baseline accepts) and
  whether the person looked at it. A look is kept as the print of what was looked at, the colours
  of every pair of the theme in that mode: a change that touches the item changes its print, and
  the look goes, saying why (studio.object-model.md, section 4, Verifica: "guardato o no, finché una
  modifica non lo tocca").
*/

const MODES: Mode[] = ['light', 'dark'];

/** What the person looked at: by item key, the print of the item when it was looked at. */
export type Looks = Readonly<Record<string, string>>;

/** The key of an item: the family of its theme, which a rename leaves alone, and the mode. */
export const reviewKey = (family: string, mode: Mode): string => `${family}|${mode}`;

/** Where an item stands for the person: not looked at, looked at, or changed after the look. */
export type LookState = 'open' | 'looked' | 'changed';

export interface ReviewItem {
  key: string;
  theme: string;
  family: string;
  base: boolean;
  mode: Mode;
  /** The pairs under their floor that fail the build. */
  blocking: GatePair[];
  /** The pairs under their target the gate only reports. */
  reported: GatePair[];
  /** The pairs under their floor the baseline accepts: the debt in view. */
  debt: GatePair[];
  /** How many pairs were measured in this mode. */
  measured: number;
  look: LookState;
}

/** The print of a theme in a mode: the colours of each of its pairs, as the gate measured them. */
export function printOf(theme: GateTheme, mode: Mode): string {
  return theme.pairs
    .map((pair) => {
      const cell = pair.cells[mode];
      return `${pair.fg}/${pair.bg}:${cell.fgHex}/${cell.bgHex}`;
    })
    .sort()
    .join(';');
}

/** The items of the review: every theme in every mode it is used in, with its verdict and look. */
export function reviewItems(report: GateReport, looks: Looks): ReviewItem[] {
  return report.themes.flatMap((theme) =>
    MODES.filter((mode) => theme.modes.includes(mode)).map((mode) => {
      const key = reviewKey(theme.family, mode);
      const looked = looks[key];
      const of = (state: string) => theme.pairs.filter((pair) => pair.cells[mode].state === state);
      return {
        key,
        theme: theme.name,
        family: theme.family,
        base: theme.base,
        mode,
        blocking: of('fail'),
        reported: of('below'),
        debt: of('accepted'),
        measured: theme.pairs.length,
        look:
          looked === undefined ? 'open' : looked === printOf(theme, mode) ? 'looked' : 'changed',
      } satisfies ReviewItem;
    }),
  );
}

/** How the review stands: how many items, how many looked at, how many block. */
export function reviewSummary(items: readonly ReviewItem[]) {
  return {
    items: items.length,
    looked: items.filter((item) => item.look === 'looked').length,
    changed: items.filter((item) => item.look === 'changed').length,
    blocking: items.filter((item) => item.blocking.length > 0).length,
  };
}

/** The looks with one item looked at now: its print as it stands. */
export function withLook(looks: Looks, report: GateReport, family: string, mode: Mode): Looks {
  const theme = report.themes.find((one) => one.family === family);
  if (!theme) return looks;
  return { ...looks, [reviewKey(family, mode)]: printOf(theme, mode) };
}

/** The looks with one item's look taken back. */
export function withoutLook(looks: Looks, family: string, mode: Mode): Looks {
  const key = reviewKey(family, mode);
  return Object.fromEntries(Object.entries(looks).filter(([one]) => one !== key));
}
