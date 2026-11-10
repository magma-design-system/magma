import type { Mode } from '@maggioli-design-system/design-tokens/src/lib/contrast-gate.js';
import type { GateTheme, GateVerdict } from './gate.js';
import { msg, plural, useT, type T } from './i18n.js';

/*
  The verdict of the contrast gate as badges (#698): the status of the configuration, beside the
  title of every page of Colors and at the head of the Colors menu, and the verdict of a theme per
  mode, on its card of the Themes page and of the Contrast check page. Types only from gate.ts, so
  the pages that draw a verdict (themes.tsx) do not load the gate, which reads them.
*/

const MODES: Mode[] = ['light', 'dark'];
/** The name of a mode inside a verdict. */
const MODE_NAMES: Record<Mode, string> = { light: msg('light'), dark: msg('dark') };

/** What the gate says, in the words of its badge: the Start page tells it too. */
export const verdictLabel = (t: T, verdict: GateVerdict): string =>
  verdict.state === 'pass'
    ? t('All contrasts are OK')
    : verdict.state === 'fail'
      ? plural(
          t,
          verdict.violations,
          '{count} contrast below target',
          '{count} contrasts below target',
        )
      : t('Contrast not measured');

/** The verdict of the gate, as a badge: the status of the configuration being edited. */
export function GateBadge({ verdict }: { verdict: GateVerdict | null }) {
  const t = useT();
  if (!verdict) return null;
  if (verdict.state === 'pass')
    return (
      <mds-badge
        variant="success"
        label={verdictLabel(t, verdict)}
        title={
          verdict.accepted
            ? plural(
                t,
                verdict.accepted,
                '{count} known offender accepted by the baseline of design-tokens',
                '{count} known offenders accepted by the baseline of design-tokens',
              )
            : t('Every pair the contrast gate judges meets its target, in every theme and mode')
        }
      ></mds-badge>
    );
  if (verdict.state === 'fail')
    return (
      <mds-badge
        variant="error"
        label={verdictLabel(t, verdict)}
        title={t('The pairs are on the Contrast check page')}
      ></mds-badge>
    );
  return (
    <mds-badge
      variant="warning"
      label={verdictLabel(t, verdict)}
      title={verdict.message}
    ></mds-badge>
  );
}

/** What a theme says in one mode: how many pairs fail, or that the mode is not offered. */
function ModeVerdict({ theme, mode }: { theme: GateTheme; mode: Mode }) {
  const t = useT();
  const name = t(MODE_NAMES[mode]);
  if (!theme.modes.includes(mode))
    return <mds-badge variant="dark" label={t('{mode}: not offered', { mode: name })}></mds-badge>;
  const failing = theme.failing[mode];
  return failing ? (
    <mds-badge
      variant="error"
      label={t('{mode}: {count} below target', { mode: name, count: failing })}
    ></mds-badge>
  ) : (
    <mds-badge variant="success" label={t('{mode}: OK', { mode: name })}></mds-badge>
  );
}

/** The verdict of a theme per mode, for its card on the Themes page and on this page. */
export function ThemeVerdict({ theme }: { theme: GateTheme | undefined }) {
  const t = useT();
  if (!theme) return null;
  return (
    <div
      class="studio-row"
      role="group"
      aria-label={t('The contrast gate on {theme}', { theme: theme.name })}
    >
      {MODES.map((mode) => (
        <ModeVerdict theme={theme} mode={mode} />
      ))}
    </div>
  );
}
