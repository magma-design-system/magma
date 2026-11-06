import { useState } from 'preact/hooks';
import type {
  Category,
  Mode,
  Severity,
} from '@maggioli-design-system/design-tokens/src/lib/contrast-gate.js';
import {
  gateFailures,
  type GateCell,
  type GatePair,
  type GateReport,
  type PairState,
} from './gate.js';
import { Check } from './magma.js';
import { ThemeVerdict } from './verdict.js';
import './contrast.css';

/*
  The contrast gate in the studio (#698): the Contrast check page, every pair the gate of
  design-tokens judges in each theme of the configuration and both modes, with its verdict, and
  the dialog an export opens while the gate fails. They read the report the App computes on every
  edit (gate.ts), so a verdict turns as the configuration changes. The samples paint the colours
  the configuration generates, inline: only their frame follows the tokens (contrast.css).
*/

const MODES: Mode[] = ['light', 'dark'];

/** The categories of the gate, in its order, as the page names them. */
export const CATEGORIES: ReadonlyArray<{ id: Category; title: string; about: string }> = [
  {
    id: 'text-on-surface',
    title: 'Text on the surfaces',
    about: 'Every text role on every surface of the theme.',
  },
  {
    id: 'on-emphasis',
    title: 'Text on the solid fills',
    about:
      'The on-emphasis text of each hue on its fill and the states of the fill, on-inverse on the muted inverse surface.',
  },
  {
    id: 'text-on-hue',
    title: 'Text of a hue on its washes',
    about:
      'The text of each status hue on its own washes: enforced where the wash carries that text, reported where it does not.',
  },
  {
    id: 'text-on-wash',
    title: 'Text on the neutral washes',
    about:
      'The text roles on the washes of the neutral band: enforced where the wash carries that text, reported where it does not.',
  },
  {
    id: 'hue-fg',
    title: 'Coloured text on the surfaces',
    about: 'The text of each hue on the page and on a card. Reported, not enforced.',
  },
  {
    id: 'border',
    title: 'Borders on the surfaces',
    about:
      'The WCAG 2 ratio of each border on the page and on a card: a border of state is reported under 3:1, a decorative one has no floor.',
  },
];

/** A measure as the gate states it: APCA Lc, or the WCAG 2 ratio of a border. */
const measure = (cell: Pick<GateCell, 'metric'>, value: number): string =>
  cell.metric === 'apca' ? `Lc ${value}` : `${value}:1`;

type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'dark';

/**
 * The badge of a pair in one mode, as the Semantic surface preview draws a verdict: `error` for
 * what fails the build, `warning` for what the gate only reports, `success` when it holds.
 */
const VERDICTS: Record<
  PairState,
  { variant: BadgeVariant; label: (cell: GateCell) => string; title: string }
> = {
  pass: { variant: 'success', label: () => 'OK', title: 'meets its target' },
  fail: {
    variant: 'error',
    label: (cell) => `under ${measure(cell, cell.target)}`,
    title: 'under its target: the contrast gate fails, the build of Magma refuses the theme',
  },
  accepted: {
    variant: 'info',
    label: () => 'accepted',
    title: 'under its target, accepted by the baseline of design-tokens as a known offender',
  },
  below: {
    variant: 'warning',
    label: (cell) => `under ${measure(cell, cell.target)}`,
    title: 'under its target: the gate reports it, it does not fail on it',
  },
  info: {
    variant: 'dark',
    label: () => 'no floor',
    title: 'a decorative border: no ratio floor, WCAG 1.4.11 is for the borders that convey state',
  },
  off: {
    variant: 'dark',
    label: () => 'not offered',
    title: 'measured, not judged: the theme is not used in this mode',
  },
};

/** Whether a pair is under its target in a mode the theme is used in. */
const under = (pair: GatePair): boolean =>
  MODES.some((mode) => ['fail', 'accepted', 'below'].includes(pair.cells[mode].state));

/** What a pair is held to: its target, the same in both modes or one per mode, and whether. */
function targetOf(pair: GatePair): string {
  const { light, dark } = pair.cells;
  const target =
    light.target === dark.target
      ? measure(light, light.target)
      : `${measure(light, light.target)} light, ${dark.target} dark`;
  const rule: Record<Severity, string> = {
    error: 'enforced',
    warn: 'reported',
    info: 'no floor',
  };
  return pair.severity === 'info' ? rule.info : `${target}, ${rule[pair.severity]}`;
}

/** One mode of a pair: a sample of the two colours, the measure and the verdict. */
function PairCell({ cell, border }: { cell: GateCell; border: boolean }) {
  const verdict = VERDICTS[cell.state];
  return (
    <div class={cell.state === 'off' ? 'contrast-cell contrast-cell-off' : 'contrast-cell'}>
      <span
        class="contrast-sample"
        style={
          border
            ? { background: cell.bgHex, borderColor: cell.fgHex }
            : { background: cell.bgHex, color: cell.fgHex }
        }
        title={`${cell.fgHex} on ${cell.bgHex}`}
        aria-hidden="true"
      >
        {border ? '' : 'Aa'}
      </span>
      <code>{measure(cell, cell.achieved)}</code>
      <span title={verdict.title}>
        <mds-badge variant={verdict.variant} label={verdict.label(cell)}></mds-badge>
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
  return (
    <section class="contrast-category">
      <div class="contrast-category-head">
        <mds-text typography="group" tag="h3">
          {title}
        </mds-text>
        <mds-text typography="caption" tag="p" class="studio-muted">
          {about}
        </mds-text>
      </div>
      <mds-table class="contrast-table">
        <mds-table-header>
          <mds-table-header-cell label="Pair"></mds-table-header-cell>
          <mds-table-header-cell label="Target"></mds-table-header-cell>
          <mds-table-header-cell label="Light"></mds-table-header-cell>
          <mds-table-header-cell label="Dark"></mds-table-header-cell>
        </mds-table-header>
        <mds-table-body>
          {pairs.map((pair) => (
            <mds-table-row key={`${pair.fg}|${pair.bg}`} data-pair={`${pair.fg}|${pair.bg}`}>
              <mds-table-cell>
                <mds-text typography="detail" tag="span">
                  <code>{pair.fg}</code> on <code>{pair.bg}</code>
                </mds-text>
              </mds-table-cell>
              <mds-table-cell>
                <mds-text typography="caption" tag="span" class="studio-muted">
                  {targetOf(pair)}
                </mds-text>
              </mds-table-cell>
              {MODES.map((mode) => (
                <mds-table-cell data-mode={mode}>
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
  const [onlyUnder, setOnlyUnder] = useState(false);
  const { verdict, themes } = report;
  if (verdict.state === 'error')
    return (
      <mds-banner class="contrast-notice" variant="warning" headline="Contrast not measured">
        {verdict.message}
      </mds-banner>
    );
  const measured = themes.reduce((count, theme) => count + theme.pairs.length * MODES.length, 0);
  return (
    <div class="contrast">
      <mds-text typography="detail" tag="p" class="contrast-hint studio-muted">
        The pairs and the targets of <code>nx run design-tokens:contrast</code>, in every theme of
        the Themes page. A mode a theme is not offered in is measured, not judged.
      </mds-text>
      <mds-text typography="detail" tag="p" role="status">
        {verdict.state === 'fail'
          ? `${verdict.violations} pair${verdict.violations === 1 ? '' : 's'} below target: the build of Magma would refuse this configuration.`
          : `Every enforced pair meets its target: ${measured} measures in ${themes.length} theme${themes.length === 1 ? '' : 's'}.`}
      </mds-text>
      <div class="studio-row">
        <Check type="switch" checked={onlyUnder} onChecked={setOnlyUnder}>
          Only the pairs below their target
        </Check>
      </div>
      {themes.map((theme) => {
        const shown = onlyUnder ? theme.pairs.filter(under) : theme.pairs;
        return (
          <mds-card class="contrast-theme" key={theme.name} data-theme={theme.name}>
            <mds-card-header>
              <div class="contrast-theme-head">
                <div class="studio-row">
                  <mds-text typography="part" tag="h2">
                    {theme.name}
                  </mds-text>
                  {theme.base && <mds-badge variant="dark" label="base"></mds-badge>}
                </div>
                <mds-text typography="caption" tag="p" class="studio-muted">
                  drawn from <code>{theme.family}</code>
                </mds-text>
                <ThemeVerdict theme={theme} />
              </div>
            </mds-card-header>
            <mds-card-content>
              <div class="contrast-categories">
                {shown.length === 0 ? (
                  <mds-text typography="detail" tag="p" class="studio-muted">
                    Every pair meets its target.
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

/** Something that hands the configuration out of the studio: a download, a save, a copy. */
export interface ExportAction {
  /** What the action is called where the person chose it: `Download all tokens (zip)`. */
  label: string;
  /** Its verb, which the button of the dialog repeats: `Download`. */
  verb: string;
  run: () => void;
}

/** How many failing pairs the dialog names before it counts the rest. */
const NAMED_FAILURES = 5;

/**
 * The dialog an export opens while the gate fails (#698): an author may have a reason to hand out
 * a theme under target, but never by default. The question names the action and how many pairs
 * fail, the text the consequence and the first pairs; Cancel and Esc never export, the action
 * repeats its verb (docs/agents/patterns/confirm-action.md, `ask-first-many`).
 */
export function GateDialog({
  action,
  report,
  onCancel,
  onConfirm,
  onReview,
}: {
  action: ExportAction;
  report: GateReport;
  onCancel: () => void;
  onConfirm: () => void;
  onReview: () => void;
}) {
  const failures = gateFailures(report);
  const headline = `Export with ${failures.length} contrast${failures.length === 1 ? '' : 's'} below target?`;
  return (
    <mds-modal opened aria-label={headline} onmdsModalClose={onCancel}>
      <mds-banner
        slot="window"
        variant="light"
        tone="box"
        dismissible
        headline={headline}
        onmdsBannerClose={onCancel}
      >
        <div class="studio-dialog contrast-dialog">
          <mds-text typography="detail" tag="p">
            {action.label} hands out a configuration that fails the contrast gate of design-tokens:
            the build of Magma would refuse it, and these pairs are hard to read.
          </mds-text>
          <ul class="contrast-failures">
            {failures.slice(0, NAMED_FAILURES).map(({ theme, cell }) => (
              <li>
                <mds-text typography="caption" tag="span">
                  {theme}, {cell.mode}: <code>{cell.fgToken}</code> on <code>{cell.bgToken}</code>,{' '}
                  {measure(cell, cell.achieved)} under {cell.target}
                </mds-text>
              </li>
            ))}
          </ul>
          {failures.length > NAMED_FAILURES && (
            <mds-text typography="caption" tag="p" class="studio-muted">
              and {failures.length - NAMED_FAILURES} more
            </mds-text>
          )}
          <div>
            <mds-button
              type="button"
              variant="dark"
              tone="text"
              icon="mi/baseline/fact-check"
              label="See every pair"
              onClick={onReview}
            ></mds-button>
          </div>
        </div>
        <mds-button
          slot="action"
          type="button"
          variant="dark"
          tone="outline"
          autofocus
          label="Cancel"
          onClick={onCancel}
        ></mds-button>
        <mds-button
          slot="action"
          type="button"
          label={`${action.verb} anyway`}
          onClick={onConfirm}
        ></mds-button>
      </mds-banner>
    </mds-modal>
  );
}
