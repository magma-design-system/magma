import { gateFailures, type GateReport } from '../../engine/gate.js';
import { plural, rich } from '../../shared/i18n/i18n.js';
import type { ExportAction } from '../../state/studio.js';
import { MODE_NAMES, measure, useFullReviewT } from './pairs.js';

/*
  The dialog an export opens while the contrast gate fails (#698; #1401, out of contrast.tsx), on
  the report of the state: the exit of the bar of the studio opens it (app/shell.tsx,
  PendingExport), the one exit since the foot of the full review went (#1595). Written in the
  classes of Magma (src/tailwind.css), its texts in the catalogue of the full review.
*/

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
  const t = useFullReviewT();
  const failures = gateFailures(report);
  const headline = plural(
    t,
    failures.length,
    'Export with {count} contrast below target?',
    'Export with {count} contrasts below target?',
  );
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
        <div class="grid max-w-(--magma-width-dialog) gap-between-fields">
          <mds-text typography="detail" tag="p">
            {t(
              '{action} hands out a configuration that fails the contrast gate of design-tokens: the build of Magma would refuse it, and these pairs are hard to read.',
              { action: t(action.label) },
            )}
          </mds-text>
          {/* the pairs it names, a list of Magma that draws its own bullets */}
          <mds-list class="grid gap-label-control">
            {failures.slice(0, NAMED_FAILURES).map(({ theme, cell }) => (
              <mds-list-item typography="caption">
                {rich(t, '{theme}, {mode}: {fg} on {bg}, {achieved} under {target}', {
                  theme,
                  mode: t(MODE_NAMES[cell.mode]),
                  fg: <code>{cell.fgToken}</code>,
                  bg: <code>{cell.bgToken}</code>,
                  achieved: measure(cell, cell.achieved),
                  target: cell.target,
                })}
              </mds-list-item>
            ))}
          </mds-list>
          {failures.length > NAMED_FAILURES && (
            <mds-text typography="caption" tag="p" class="text-fg-muted">
              {t('and {count} more', { count: failures.length - NAMED_FAILURES })}
            </mds-text>
          )}
          <div>
            <mds-button
              type="button"
              variant="dark"
              tone="text"
              icon="mi/baseline/fact-check"
              label={t('See every pair')}
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
          label={t('Cancel')}
          onClick={onCancel}
        ></mds-button>
        <mds-button
          slot="action"
          type="button"
          label={t(action.proceed)}
          onClick={onConfirm}
        ></mds-button>
      </mds-banner>
    </mds-modal>
  );
}
