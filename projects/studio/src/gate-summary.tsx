import { gateFailureGroups, type GateFailureGroup, type GateReport } from './gate.js';
import { msg, plural, rich, useT } from './i18n.js';
import { hrefOf } from './routes.js';
import { GateBadge } from './verdict.js';
import './gate-summary.css';

/*
  The verdict of the contrast gate where the balances are tuned (#1418): the badge of the head of
  the page scrolls away before the sliders, says a count only, and the preview of Semantic surface
  judges one family alone, so a retune that failed 15 pairs elsewhere read as OK everywhere. Here
  the pairs below target stand beside the controls that move them, one line per pair and mode
  (gateFailureGroups), each with the themes it fails in, and the way to Contrast check, where
  every pair of every theme is.

  It heads the column of the preview, which stays in view while the levels scroll where the page
  has room (surfaces.css): chosen on screenshots of the real page against a line over the controls,
  which covered the sliders once its list opened (vittorio, 2026-11-13).
*/

/** The groups named before the rest are counted: enough for a retune, short enough to read. */
const NAMED_GROUPS = 6;

const MODE_NAMES = { light: msg('light'), dark: msg('dark') } as const;

/** A measure as the gate states it: APCA Lc, or the WCAG 2 ratio of a border. */
const measure = (group: Pick<GateFailureGroup, 'metric'>, value: number): string =>
  group.metric === 'apca' ? `Lc ${value}` : `${value}:1`;

/** One pair below target: the roles, the mode, how far under, and where. */
function GroupItem({ group }: { group: GateFailureGroup }) {
  const t = useT();
  return (
    <mds-list-item typography="caption">
      {rich(t, '{fg} on {bg}, {mode}: {achieved} under {target}', {
        fg: <code>{group.fg}</code>,
        bg: <code>{group.bg}</code>,
        mode: t(MODE_NAMES[group.mode]),
        achieved: measure(group, group.worst),
        target: group.target,
      })}{' '}
      <span class="gate-summary-themes" title={group.themes.join(', ')}>
        {plural(t, group.themes.length, 'in {count} theme', 'in {count} themes')}
      </span>
    </mds-list-item>
  );
}

/** The groups, the rest counted, and the way to every pair. */
function Groups({ groups }: { groups: GateFailureGroup[] }) {
  const t = useT();
  return (
    <>
      <mds-list>
        {groups.slice(0, NAMED_GROUPS).map((group) => (
          <GroupItem group={group} />
        ))}
      </mds-list>
      {groups.length > NAMED_GROUPS && (
        <mds-text typography="caption" tag="p" class="studio-muted">
          {t('and {count} more', { count: groups.length - NAMED_GROUPS })}
        </mds-text>
      )}
      <div>
        <mds-button
          variant="dark"
          tone="text"
          size="sm"
          icon="mi/baseline/fact-check"
          href={hrefOf({ section: 'colors', view: 'contrast' })}
          label={t('See every pair')}
        ></mds-button>
      </div>
    </>
  );
}

/** The verdict of the gate on the configuration edited, and its pairs below target, grouped. */
export function GateSummary({ report }: { report: GateReport }) {
  const t = useT();
  const groups = report.verdict.state === 'fail' ? gateFailureGroups(report) : [];
  const head = (
    <div class="gate-summary-head">
      <mds-text typography="detail" tag="span">
        {t('Contrast gate')}
      </mds-text>
      <GateBadge verdict={report.verdict} />
    </div>
  );
  return (
    <section class="gate-summary" aria-label={t('Contrast gate')}>
      {head}
      {groups.length > 0 && <Groups groups={groups} />}
    </section>
  );
}
