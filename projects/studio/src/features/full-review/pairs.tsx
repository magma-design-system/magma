import type {
  Category,
  Mode,
  Severity,
} from '@maggioli-design-system/design-tokens/src/lib/contrast-gate.js';
import type { GateCell, GatePair, PairState } from '../../engine/gate.js';
import { msg, rich, useT, type T } from '../../shared/i18n/i18n.js';
import { IT_FULL_REVIEW } from './i18n-it.js';
import './pairs.css';

/*
  The pairs of the contrast gate as the full review shows them (#1404; the Contrast check page of
  #698 and #1401 until then): a pair in one mode, its sample, its measure and its verdict, and the
  table of the pairs of a theme in one mode; the dialog an export opens while the gate fails is
  gate-dialog.tsx. Written in the classes of Magma (src/tailwind.css); the samples paint the
  colours the preset generates, inline, and only their frame is written in the sheet of the page
  (pairs.css).
*/

/** The translator of the page and of its dialog: their own Italian (i18n-it.ts), then the studio's. */
export const useFullReviewT = () => useT(IT_FULL_REVIEW);

/** The name of a mode inside a sentence. */
export const MODE_NAMES: Record<Mode, string> = { light: msg('light'), dark: msg('dark') };

/** The categories of the gate, in its order, as the page names them. */
export const CATEGORIES: ReadonlyArray<{ id: Category; title: string }> = [
  {
    id: 'text-on-surface',
    title: msg('Text on the surfaces'),
  },
  {
    id: 'on-emphasis',
    title: msg('Text on the solid fills'),
  },
  {
    id: 'text-on-hue',
    title: msg('Text of a hue on its washes'),
  },
  {
    id: 'text-on-wash',
    title: msg('Text on the neutral washes'),
  },
  {
    id: 'hue-fg',
    title: msg('Coloured text on the surfaces'),
  },
  {
    id: 'border',
    title: msg('Borders on the surfaces'),
  },
];

/** A measure as the gate states it: APCA Lc, or the WCAG 2 ratio of a border. */
export const measure = (cell: Pick<GateCell, 'metric'>, value: number): string =>
  cell.metric === 'apca' ? `Lc ${value}` : `${value}:1`;

type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'dark';

/**
 * The badge of a pair in one mode, as the canvas of the surfaces draws a verdict: `error` for
 * what fails the build, `warning` for what the gate only reports, `success` when it holds. The
 * label fills `{measure}` with the target of the pair.
 */
const VERDICTS: Record<PairState, { variant: BadgeVariant; label: string; title: string }> = {
  pass: { variant: 'success', label: msg('OK'), title: msg('meets its target') },
  fail: {
    variant: 'error',
    label: msg('under {measure}'),
    title: msg('under its target: the contrast gate fails, the build of Magma refuses the theme'),
  },
  accepted: {
    variant: 'info',
    label: msg('accepted'),
    title: msg('under its target, accepted by the baseline of design-tokens as a known offender'),
  },
  below: {
    variant: 'warning',
    label: msg('under {measure}'),
    title: msg('under its target: the gate reports it, it does not fail on it'),
  },
  info: {
    variant: 'dark',
    label: msg('no floor'),
    title: msg(
      'a decorative border: no ratio floor, WCAG 1.4.11 is for the borders that convey state',
    ),
  },
  off: {
    variant: 'dark',
    label: msg('not offered'),
    title: msg('measured, not judged: the theme is not used in this mode'),
  },
};

/** What a pair is held to in a mode: its target and whether it is enforced or reported. */
function targetOf(t: T, pair: GatePair, mode: Mode): string {
  const cell = pair.cells[mode];
  const rule: Record<Severity, string> = {
    error: t('enforced'),
    warn: t('reported'),
    info: t('no floor'),
  };
  return pair.severity === 'info'
    ? rule.info
    : `${measure(cell, cell.target)}, ${rule[pair.severity]}`;
}

/** A pair in one mode: a sample of the two colours, the measure and the verdict. */
function PairCell({ cell, border }: { cell: GateCell; border: boolean }) {
  const t = useFullReviewT();
  const verdict = VERDICTS[cell.state];
  return (
    <div class="flex items-center gap-200">
      <span
        class="contrast-sample"
        style={
          border
            ? { background: cell.bgHex, borderColor: cell.fgHex }
            : { background: cell.bgHex, color: cell.fgHex }
        }
        title={t('{fg} on {bg}', { fg: cell.fgHex, bg: cell.bgHex })}
        aria-hidden="true"
      >
        {border ? '' : 'Aa'}
      </span>
      <code>{measure(cell, cell.achieved)}</code>
      <span title={t(verdict.title)}>
        <mds-badge
          variant={verdict.variant}
          label={t(verdict.label, { measure: measure(cell, cell.target) })}
        ></mds-badge>
      </span>
    </div>
  );
}

/** The title of the category of a pair, as the gate groups them. */
const categoryOf = (id: Category): string =>
  CATEGORIES.find((category) => category.id === id)?.title ?? id;

/**
 * The pairs of a theme in one mode, a row each: the two roles and their category, what the pair is
 * held to, its sample with its measure and its verdict.
 */
export function PairsTable({ pairs, mode }: { pairs: GatePair[]; mode: Mode }) {
  const t = useFullReviewT();
  return (
    // the table takes the width of its column and scrolls inside it, the target and the measure on
    // one line (mds-table, "Fill the Container and Let the Table Scroll")
    <mds-table class="w-full">
      <mds-table-header>
        <mds-table-header-cell label={t('Pair')}></mds-table-header-cell>
        <mds-table-header-cell label={t('Target')}></mds-table-header-cell>
        <mds-table-header-cell
          label={t(mode === 'light' ? 'Light' : 'Dark')}
        ></mds-table-header-cell>
      </mds-table-header>
      <mds-table-body>
        {pairs.map((pair) => (
          <mds-table-row key={`${pair.fg}|${pair.bg}`}>
            {/* the roles of a pair wrap, so the target and the measure keep their columns */}
            <mds-table-cell>
              <div class="grid">
                <mds-text typography="detail" tag="span">
                  {rich(t, '{fg} on {bg}', {
                    fg: <code>{pair.fg}</code>,
                    bg: <code>{pair.bg}</code>,
                  })}
                </mds-text>
                <mds-text typography="caption" tag="span" class="text-fg-muted">
                  {t(categoryOf(pair.category))}
                </mds-text>
              </div>
            </mds-table-cell>
            <mds-table-cell class="text-nowrap">
              <mds-text typography="caption" tag="span" class="text-nowrap text-fg-muted">
                {targetOf(t, pair, mode)}
              </mds-text>
            </mds-table-cell>
            <mds-table-cell class="text-nowrap">
              <PairCell cell={pair.cells[mode]} border={pair.category === 'border'} />
            </mds-table-cell>
          </mds-table-row>
        ))}
      </mds-table-body>
    </mds-table>
  );
}
