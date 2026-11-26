import { useState } from 'preact/hooks';
import type {
  Category,
  Mode,
  Severity,
} from '@maggioli-design-system/design-tokens/src/lib/contrast-gate.js';
import {
  type GateCell,
  type GatePair,
  type GateReport,
  type PairState,
} from '../../engine/gate.js';
import { msg, plural, rich, useT, type T } from '../../shared/i18n/i18n.js';
import { Check } from '../../shared/magma/magma.js';
import { ThemeVerdict } from '../../shared/ui/verdict.js';
import { IT_CONTRAST_CHECK } from './i18n-it.js';
import './contrast-check.css';

/*
  The contrast gate in the studio (#698): the Contrast check page (#1401, out of contrast.tsx; the
  Full review takes it over in #1404), every pair the gate of design-tokens judges in each theme of
  the configuration and both modes, with its verdict; the dialog an export opens while the gate
  fails is gate-dialog.tsx. They read the report the state computes on every edit (gate.ts), so a
  verdict turns as the configuration changes. Written in the classes of Magma (src/tailwind.css);
  the samples paint the colours the configuration generates, inline, and only their frame is
  written in the sheet of the page (contrast-check.css).
*/

/** The translator of the page and of its dialog: their own Italian (i18n-it.ts), then the studio's. */
export const useContrastCheckT = () => useT(IT_CONTRAST_CHECK);

const MODES: Mode[] = ['light', 'dark'];
/** The name of a mode inside a sentence. */
export const MODE_NAMES: Record<Mode, string> = { light: msg('light'), dark: msg('dark') };

/** The categories of the gate, in its order, as the page names them. */
export const CATEGORIES: ReadonlyArray<{ id: Category; title: string; about: string }> = [
  {
    id: 'text-on-surface',
    title: msg('Text on the surfaces'),
    about: msg('Every text role on every surface of the theme.'),
  },
  {
    id: 'on-emphasis',
    title: msg('Text on the solid fills'),
    about: msg(
      'The on-emphasis text of each hue on its fill and the states of the fill, on-inverse on the muted inverse surface.',
    ),
  },
  {
    id: 'text-on-hue',
    title: msg('Text of a hue on its washes'),
    about: msg(
      'The text of each status hue on its own washes: enforced where the wash carries that text, reported where it does not.',
    ),
  },
  {
    id: 'text-on-wash',
    title: msg('Text on the neutral washes'),
    about: msg(
      'The text roles on the washes of the neutral band: enforced where the wash carries that text, reported where it does not.',
    ),
  },
  {
    id: 'hue-fg',
    title: msg('Coloured text on the surfaces'),
    about: msg('The text of each hue on the page and on a card. Reported, not enforced.'),
  },
  {
    id: 'border',
    title: msg('Borders on the surfaces'),
    about: msg(
      'The WCAG 2 ratio of each border on the page and on a card: a border of state is reported under 3:1, a decorative one has no floor.',
    ),
  },
];

/** A measure as the gate states it: APCA Lc, or the WCAG 2 ratio of a border. */
export const measure = (cell: Pick<GateCell, 'metric'>, value: number): string =>
  cell.metric === 'apca' ? `Lc ${value}` : `${value}:1`;

type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'dark';

/**
 * The badge of a pair in one mode, as the Semantic surface preview draws a verdict: `error` for
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

/** Whether a pair is under its target in a mode the theme is used in. */
const under = (pair: GatePair): boolean =>
  MODES.some((mode) => ['fail', 'accepted', 'below'].includes(pair.cells[mode].state));

/** What a pair is held to: its target, the same in both modes or one per mode, and whether. */
function targetOf(t: T, pair: GatePair): string {
  const { light, dark } = pair.cells;
  const target =
    light.target === dark.target
      ? measure(light, light.target)
      : t('{light} light, {dark} dark', { light: measure(light, light.target), dark: dark.target });
  const rule: Record<Severity, string> = {
    error: t('enforced'),
    warn: t('reported'),
    info: t('no floor'),
  };
  return pair.severity === 'info' ? rule.info : `${target}, ${rule[pair.severity]}`;
}

/** One mode of a pair: a sample of the two colours, the measure and the verdict. */
function PairCell({ cell, border }: { cell: GateCell; border: boolean }) {
  const t = useContrastCheckT();
  const verdict = VERDICTS[cell.state];
  return (
    <div
      class={
        cell.state === 'off'
          ? 'flex items-center gap-200 opacity-(--magma-disabled-opacity)'
          : 'flex items-center gap-200'
      }
    >
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

/** The table of one category of a theme: a row per pair, its two modes side by side. */
function CategoryTable({
  title,
  about,
  pairs,
}: {
  title: string;
  about: string;
  pairs: GatePair[];
}) {
  const t = useContrastCheckT();
  return (
    <section class="grid min-w-0 gap-title-content">
      <div class="grid gap-label-control">
        <mds-text typography="group" tag="h3">
          {t(title)}
        </mds-text>
        <mds-text typography="caption" tag="p" class="text-fg-muted">
          {t(about)}
        </mds-text>
      </div>
      {/* the table takes the width of the card and scrolls inside it, its cells on one line
          (mds-table, "Fill the Container and Let the Table Scroll") */}
      <mds-table class="w-full">
        <mds-table-header>
          <mds-table-header-cell label={t('Pair')}></mds-table-header-cell>
          <mds-table-header-cell label={t('Target')}></mds-table-header-cell>
          <mds-table-header-cell label={t('Light')}></mds-table-header-cell>
          <mds-table-header-cell label={t('Dark')}></mds-table-header-cell>
        </mds-table-header>
        <mds-table-body>
          {pairs.map((pair) => (
            <mds-table-row key={`${pair.fg}|${pair.bg}`}>
              <mds-table-cell class="text-nowrap">
                <mds-text typography="detail" tag="span" class="text-nowrap">
                  {rich(t, '{fg} on {bg}', {
                    fg: <code>{pair.fg}</code>,
                    bg: <code>{pair.bg}</code>,
                  })}
                </mds-text>
              </mds-table-cell>
              <mds-table-cell class="text-nowrap">
                <mds-text typography="caption" tag="span" class="text-nowrap text-fg-muted">
                  {targetOf(t, pair)}
                </mds-text>
              </mds-table-cell>
              {MODES.map((mode) => (
                <mds-table-cell class="text-nowrap">
                  <PairCell cell={pair.cells[mode]} border={pair.category === 'border'} />
                </mds-table-cell>
              ))}
            </mds-table-row>
          ))}
        </mds-table-body>
      </mds-table>
    </section>
  );
}

/** The Contrast check page: the verdict, then a card per theme with a table per category. */
export function ContrastCheck({ report }: { report: GateReport }) {
  const t = useContrastCheckT();
  const [onlyUnder, setOnlyUnder] = useState(false);
  const { verdict, themes } = report;
  if (verdict.state === 'error')
    return (
      <mds-banner class="max-w-text" variant="warning" headline={t('Contrast not measured')}>
        {verdict.message}
      </mds-banner>
    );
  const measured = themes.reduce((count, theme) => count + theme.pairs.length * MODES.length, 0);
  return (
    <div class="grid gap-between-containers">
      <mds-text typography="detail" tag="p" class="max-w-text text-fg-muted">
        {rich(
          t,
          'The pairs and the targets of {command}, in every theme of the Themes page. A mode a theme is not offered in is measured, not judged.',
          { command: <code>{'nx run design-tokens:contrast'}</code> },
        )}
      </mds-text>
      <mds-text typography="detail" tag="p" role="status">
        {verdict.state === 'fail'
          ? plural(
              t,
              verdict.violations,
              '{count} pair below target: the build of Magma would refuse this configuration.',
              '{count} pairs below target: the build of Magma would refuse this configuration.',
            )
          : plural(
              t,
              themes.length,
              'Every enforced pair meets its target: {measured} measures in {count} theme.',
              'Every enforced pair meets its target: {measured} measures in {count} themes.',
              { measured },
            )}
      </mds-text>
      <div class="flex flex-wrap items-center gap-inline">
        <Check type="switch" checked={onlyUnder} onChecked={setOnlyUnder}>
          {t('Only the pairs below their target')}
        </Check>
      </div>
      {themes.map((theme) => {
        const shown = onlyUnder ? theme.pairs.filter(under) : theme.pairs;
        return (
          <mds-card key={theme.name}>
            <mds-card-header>
              <div class="grid gap-title-content">
                <div class="flex flex-wrap items-center gap-inline">
                  <mds-text typography="part" tag="h2">
                    {theme.name}
                  </mds-text>
                  {theme.base && <mds-badge variant="dark" label={t('base')}></mds-badge>}
                </div>
                <mds-text typography="caption" tag="p" class="text-fg-muted">
                  {rich(t, 'drawn from {family}', { family: <code>{theme.family}</code> })}
                </mds-text>
                <ThemeVerdict theme={theme} />
              </div>
            </mds-card-header>
            <mds-card-content>
              <div class="grid gap-between-groups">
                {shown.length === 0 ? (
                  <mds-text typography="detail" tag="p" class="text-fg-muted">
                    {t('Every pair meets its target.')}
                  </mds-text>
                ) : (
                  CATEGORIES.map(({ id, title, about }) => {
                    const pairs = shown.filter((pair) => pair.category === id);
                    return (
                      pairs.length > 0 && (
                        <CategoryTable title={title} about={about} pairs={pairs} />
                      )
                    );
                  })
                )}
              </div>
            </mds-card-content>
          </mds-card>
        );
      })}
    </div>
  );
}
