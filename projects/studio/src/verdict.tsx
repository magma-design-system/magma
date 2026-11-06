import type { Mode } from '@maggioli-design-system/design-tokens/src/lib/contrast-gate.js';
import type { GateTheme, GateVerdict } from './gate.js';

/*
  The verdict of the contrast gate as badges (#698): the status of the configuration, beside the
  title of every page of Colors and at the head of the Colors menu, and the verdict of a theme per
  mode, on its card of the Themes page and of the Contrast check page. Types only from gate.ts, so
  the pages that draw a verdict (themes.tsx) do not load the gate, which reads them.
*/

const MODES: Mode[] = ['light', 'dark'];

/** The verdict of the gate, as a badge: the status of the configuration being edited. */
export function GateBadge({ verdict }: { verdict: GateVerdict | null }) {
  if (!verdict) return null;
  if (verdict.state === 'pass')
    return (
      <mds-badge
        variant="success"
        label="All contrasts are OK"
        title={
          verdict.accepted
            ? `${verdict.accepted} known offender(s) accepted by the baseline of design-tokens`
            : 'Every pair the contrast gate judges meets its target, in every theme and mode'
        }
      ></mds-badge>
    );
  if (verdict.state === 'fail')
    return (
      <mds-badge
        variant="error"
        label={`${verdict.violations} contrast${verdict.violations === 1 ? '' : 's'} below target`}
        title="The pairs are on the Contrast check page"
      ></mds-badge>
    );
  return (
    <mds-badge variant="warning" label="Contrast not measured" title={verdict.message}></mds-badge>
  );
}

/** What a theme says in one mode: how many pairs fail, or that the mode is not offered. */
function ModeVerdict({ theme, mode }: { theme: GateTheme; mode: Mode }) {
  if (!theme.modes.includes(mode))
    return <mds-badge variant="dark" label={`${mode}: not offered`}></mds-badge>;
  const failing = theme.failing[mode];
  return failing ? (
    <mds-badge variant="error" label={`${mode}: ${failing} below target`}></mds-badge>
  ) : (
    <mds-badge variant="success" label={`${mode}: OK`}></mds-badge>
  );
}

/** The verdict of a theme per mode, for its card on the Themes page and on this page. */
export function ThemeVerdict({ theme }: { theme: GateTheme | undefined }) {
  if (!theme) return null;
  return (
    <div class="studio-row" role="group" aria-label={`The contrast gate on ${theme.name}`}>
      {MODES.map((mode) => (
        <ModeVerdict theme={theme} mode={mode} />
      ))}
    </div>
  );
}
