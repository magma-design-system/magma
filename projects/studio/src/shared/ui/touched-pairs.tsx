import type { PairState } from '../../engine/gate.js';
import { touchedSummary, type TouchedPair } from '../../engine/touched.js';
import { msg, plural, useT } from '../i18n/i18n.js';

/*
  The pairs of the contrast check a change moves, kept in view beside what is edited (#1403): the
  family in Colours, the contrast scale in Scale (studio.object-model.md, section 4, Verifica,
  "Sempre visibile": the pairs touched). Measured by the engine (engine/touched.ts).
*/

/** The word of the state of a pair in one mode. */
const STATE_WORD: Record<PairState, string> = {
  pass: msg('passes'),
  fail: msg('fails'),
  accepted: msg('accepted by the baseline'),
  below: msg('below its target'),
  info: msg('measured, not judged'),
  off: msg('measured, not judged'),
};

/** The name of a mode. */
const MODE_WORD = { light: msg('Light'), dark: msg('Dark') } as const;

/**
 * The pairs of the contrast check a family or a scale touches (touched.ts), in a closed detail under
 * its name, their count and their verdict in its title (vittorio on the renders of Colours,
 * 2026-11-27; Scale shows them the same way). Weights measures one mode at a time, and says which.
 */
export function TouchedPairs({
  pairs,
  mode,
}: {
  pairs: TouchedPair[] | undefined;
  /** The one mode the pairs were measured in; both when none. */
  mode?: 'light' | 'dark';
}) {
  const t = useT();
  if (!pairs)
    return (
      <mds-text typography="caption" tag="p" class="text-fg-muted" role="status">
        {t('Measuring the pairs it touches...')}
      </mds-text>
    );
  if (!pairs.length)
    return (
      <mds-text typography="detail" tag="p" class="text-fg-muted" data-touched="0">
        {t('No pair of the contrast check: it changes none.')}
      </mds-text>
    );
  const summary = touchedSummary(pairs);
  const verdict = [
    summary.fail
      ? plural(t, summary.fail, '{count} under its floor', '{count} under their floor')
      : mode === 'light'
        ? t('all above their floor, in light')
        : mode === 'dark'
          ? t('all above their floor, in dark')
          : t('all above their floor, in light and in dark'),
    ...(summary.accepted
      ? [
          plural(
            t,
            summary.accepted,
            '{count} pair accepted by the baseline',
            '{count} pairs accepted by the baseline',
          ),
        ]
      : []),
  ].join(', ');
  return (
    <mds-details data-touched={summary.pairs}>
      <span slot="title" class="flex flex-wrap items-center gap-inline">
        <mds-badge
          variant={summary.fail ? 'error' : summary.accepted ? 'warning' : 'success'}
          tone="weak"
          label={plural(t, summary.pairs, '{count} pair touched', '{count} pairs touched')}
        ></mds-badge>
        <mds-text typography="detail" tag="span">
          {verdict}
        </mds-text>
      </span>
      <ul class="m-0 grid list-none gap-inline p-0" aria-label={t('The pairs it touches')}>
        {pairs.map((pair) => (
          <li class="flex flex-wrap items-baseline gap-x-inline">
            <mds-text typography="caption" tag="span" class="text-fg-muted">
              {pair.theme}
            </mds-text>
            <mds-text typography="detail" tag="span">
              {t('{fg} on {bg}', { fg: pair.fg, bg: pair.bg })}
            </mds-text>
            {(['light', 'dark'] as const)
              .filter((mode) => pair.states[mode])
              .map((mode) => (
                <mds-text typography="caption" tag="span" class="text-fg-muted">
                  {`${t(MODE_WORD[mode])}: ${t(STATE_WORD[pair.states[mode]!])}`}
                </mds-text>
              ))}
          </li>
        ))}
      </ul>
    </mds-details>
  );
}
