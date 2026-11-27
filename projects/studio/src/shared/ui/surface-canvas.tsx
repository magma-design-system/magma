import type { ComponentChildren } from 'preact';
import { APCAcontrast, sRGBtoY } from 'apca-w3';
import chroma from 'chroma-js';
import { BORDER_ROLES } from '@maggioli-design-system/design-tokens/src/lib/surface.mjs';
import { TEXT_ROLES } from '@maggioli-design-system/design-tokens/src/lib/text-role.mjs';
import {
  DEFAULT_TARGETS,
  wcag2Ratio,
} from '@maggioli-design-system/design-tokens/src/lib/contrast-gate.js';
import type { Mode } from '../../engine/weights.js';
import { msg, rich, useT, type T } from '../i18n/i18n.js';
import './surface-canvas.css';

/*
  The canvas of a mode (#1403, out of surfaces.tsx, the Semantic surface page that the stage
  Weights replaced): the surfaces of a family on its canvas, the text roles with their Lc and
  verdict, the borders with their ratio. The Themes page draws it per mode under the accents of a
  theme. What each role is for is shared by the canvas and by Weights, which names the role beside
  its slider (the words chosen on the render of Weights, vittorio, 2026-11-27).
*/

/** What each surface is for (SEMANTIC_COLOR_SPEC sections 6.1 and 6.3). */
export const SURFACE_PURPOSE: Record<string, string> = {
  sunken: msg('wells, insets'),
  muted: msg('zebra rows, sections'),
  default: msg('the canvas of the page'),
  raised: msg('cards, panels'),
  overlay: msg('modal, dropdown, tooltip'),
};
/** What each border is for. */
export const BORDER_PURPOSE: Record<string, string> = {
  muted: msg('dividers, cells'),
  default: msg('fields, buttons'),
  strong: msg('selected, focus, error'),
};
/** What each text role is for: they are chosen by APCA target (A7, SEMANTIC_COLOR_SPEC 9.1). */
export const TEXT_PURPOSE: Record<string, string> = {
  default: msg('body, primary data'),
  muted: msg('essential secondary text'),
  subtle: msg('captions, hints'),
  disabled: msg('disabled'),
};

/** The name of a mode inside a text. */
const MODE_NAME: Record<Mode, string> = { light: msg('light'), dark: msg('dark') };

/** APCA Lc magnitude (Magma flips the sign in dark; the canvas shows the size). */
export const apcaLc = (fg: string, bg: string): number =>
  Math.abs(APCAcontrast(sRGBtoY(chroma(fg).rgb()), sRGBtoY(chroma(bg).rgb())) as number);

// Borders are judged with the WCAG2 non-text ratio (NOT APCA), and only the STATE roles carry the
// 3:1 floor of WCAG 1.4.11 - decorative borders deliberately have none, so a verdict on them would
// be permanent noise. Both facts mirror the severity split in contrast-gate.ts ("borders vs the
// elevated surfaces": strong/focus are `warn`, the rest `info`), so the studio and the CI gate
// cannot drift apart. NOTE the gate measures every border on `surface-raised` too, while the chip
// can only show the surface it is actually drawn on (`default`); in dark `raised` is the stricter
// of the two, so the chip is not always the worst case the gate reports.
const BORDER_STATE_ROLES = new Set(['strong', 'focus']);
const BORDER_MIN_RATIO = DEFAULT_TARGETS.borderState;

// APCA Lc floor per text role: the minimum legible contrast, INDEPENDENT of the editable
// theme.text target (SEMANTIC_COLOR_SPEC 9.1): the floors of the CI contrast gate
// (contrast-gate.ts). Below its floor a role is illegible; a role must also never out-contrast the
// role above it in the hierarchy (default > muted > subtle > disabled).
const TEXT_ROLE_MIN_LC: Record<string, number> = DEFAULT_TARGETS.text;

export interface BorderVerdict {
  ratio: number;
  /** true when the role conveys state, i.e. when the ratio floor applies at all */
  isState: boolean;
  ok: boolean;
  note: string;
}

/** The verdict of a border on the surface it is drawn on (`bgHex`), one rule for every preview. */
export function borderVerdict(t: T, borderHex: string, bgHex: string, role: string): BorderVerdict {
  const ratio = Math.round(wcag2Ratio(borderHex, bgHex) * 10) / 10;
  const isState = BORDER_STATE_ROLES.has(role);
  const ok = ratio >= BORDER_MIN_RATIO;
  const note = !isState
    ? t('{ratio}:1 on the surface below; decorative, no ratio floor', { ratio })
    : ok
      ? t('{ratio}:1 on the surface below, OK (floor {floor}:1, WCAG 1.4.11)', {
          ratio,
          floor: BORDER_MIN_RATIO,
        })
      : t(
          '{ratio}:1 on the surface below is under the {floor}:1 floor for a border that conveys state (WCAG 1.4.11)',
          { ratio, floor: BORDER_MIN_RATIO },
        );
  return { ratio, isState, ok, note };
}

/**
 * The verdict of a contrast in the canvas, as a badge: `error` for a text role under its floor
 * (the contrast gate fails the build on it), `warning` for what the gate only reports (a border of
 * state under 3:1, a role that out-contrasts the one above it), `success` when it holds.
 */
function Verdict({ state, label }: { state: 'success' | 'warning' | 'error'; label: string }) {
  return <mds-badge variant={state} label={label}></mds-badge>;
}

/** The roles of one set the engine generates, by name: `{ default: { value: '#f2f2f2' } }`. */
export type RoleSet = Record<string, { value: string }>;

/** The colour of a role, black when the set has none. */
export const hex = (set: RoleSet | undefined, role: string): string =>
  set?.[role]?.value ?? '#000000';

/**
 * One mode of a family: its canvas with the surfaces on it (sunken, muted, raised and the overlay
 * on it), the text roles with their Lc and verdict, the borders with their ratio. Themes shows the
 * modes one under the other, each with the accents of the theme (children), and dims the mode a
 * theme does not offer (`off`).
 */
export function SurfaceCanvas({
  mode,
  s,
  b,
  ink,
  ownText,
  canvasText,
  off,
  children,
}: {
  mode: Mode;
  /** the surfaces, the borders and the text of the family in this mode */
  s: RoleSet | undefined;
  b: RoleSet | undefined;
  ink: RoleSet | undefined;
  /** false when the family borrows the neutral ink, which the canvas says */
  ownText: boolean;
  canvasText: string;
  /** Why the mode is out of use: the canvas is dimmed and its label says why. */
  off?: string;
  children?: ComponentChildren;
}) {
  const t = useT();
  // a surface by the name of its role, which stays as it is in every language, and its colour
  const surface = (role: string) => (
    <>
      {role} <code>{hex(s, role)}</code>
    </>
  );
  // every role's Lc first (rounded, as displayed), so each can be compared to the role above it
  const roleLc = TEXT_ROLES.map((role) => {
    const c = ink ? hex(ink, role) : canvasText;
    return { role, c, lc: Math.round(apcaLc(c, hex(s, 'default'))) };
  });
  return (
    <div
      class={off ? 'surfaces-canvas surfaces-canvas-off' : 'surfaces-canvas'}
      style={{ background: hex(s, 'default'), color: canvasText }}
      title={t(SURFACE_PURPOSE.default)}
    >
      <span class="surfaces-canvas-label">
        {rich(t, '{mode} - canvas {color}', {
          mode: t(MODE_NAME[mode]),
          color: <code>{hex(s, 'default')}</code>,
        })}
        {off && ` - ${off}`}
      </span>
      <div class="surfaces-boxes">
        <div
          class="surfaces-box"
          style={{ background: hex(s, 'sunken') }}
          title={t(SURFACE_PURPOSE.sunken)}
        >
          {surface('sunken')}
        </div>
        <div
          class="surfaces-box"
          style={{ background: hex(s, 'muted') }}
          title={t(SURFACE_PURPOSE.muted)}
        >
          {surface('muted')}
        </div>
      </div>
      <div
        class="surfaces-box surfaces-box--raised"
        style={{ background: hex(s, 'raised') }}
        title={t(SURFACE_PURPOSE.raised)}
      >
        <span>{surface('raised')}</span>
        <div
          class="surfaces-box"
          style={{ background: hex(s, 'overlay') }}
          title={t(SURFACE_PURPOSE.overlay)}
        >
          {surface('overlay')}
        </div>
      </div>
      {/* text roles (A7) below the surface swatches: by-target step + achieved APCA Lc vs the
        canvas. A surface-only family borrows the neutral ink. */}
      <div class="surfaces-texts">
        {!ownText && (
          <span
            title={t(
              'No tone scale of its own, so this surface shows the default NEUTRAL ink (foreground = active counterpart of surface). Check the Lc to see if the neutral ink is legible on this surface.',
            )}
          >
            <mds-badge variant="info" label={t('inherits neutral ink')}></mds-badge>
          </span>
        )}
        {roleLc.map(({ role, c, lc }, i) => {
          const floor = TEXT_ROLE_MIN_LC[role] ?? 0;
          const above = i > 0 ? roleLc[i - 1] : null;
          // valid = clears its legibility floor AND does not out-contrast the role above it
          const belowFloor = lc < floor;
          const outOfOrder = above ? lc > above.lc : false;
          const purpose = t(TEXT_PURPOSE[role]);
          const title = belowFloor
            ? t('{purpose} - Lc {lc} is below the {floor} legibility floor', {
                purpose,
                lc,
                floor,
              })
            : outOfOrder && above
              ? t(
                  '{purpose} - Lc {lc} out-contrasts {above} (Lc {aboveLc}); a lower role must stay softer',
                  { purpose, lc, above: above.role, aboveLc: above.lc },
                )
              : t('{purpose} - Lc {lc} OK (floor {floor})', { purpose, lc, floor });
          // the role by its name, `text-muted` written with a space, the same in every language
          return (
            <span class="surfaces-text" style={{ color: c }} title={title}>
              {`text ${role}`} <code>{c}</code> <code>Lc {lc}</code>
              {belowFloor ? (
                <Verdict state="error" label={t('under Lc {floor}', { floor })} />
              ) : outOfOrder && above ? (
                <Verdict state="warning" label={t('over {role}', { role: above.role })} />
              ) : (
                <Verdict state="success" label={t('OK')} />
              )}
            </span>
          );
        })}
      </div>
      <div class="surfaces-borders">
        {(BORDER_ROLES as readonly string[]).map((role) => {
          const bg = hex(s, 'default');
          const v = borderVerdict(t, hex(b, role), bg, role);
          return (
            <span
              class="surfaces-border"
              style={{ borderColor: hex(b, role), background: bg }}
              title={`${t(BORDER_PURPOSE[role])} - ${v.note}`}
            >
              {`border ${role}`} <code>{v.ratio}:1</code>
              {v.isState &&
                (v.ok ? (
                  <Verdict state="success" label={t('OK')} />
                ) : (
                  <Verdict
                    state="warning"
                    label={t('under {ratio}:1', { ratio: BORDER_MIN_RATIO })}
                  />
                ))}
            </span>
          );
        })}
      </div>
      {children}
    </div>
  );
}
