import type { ComponentChildren } from 'preact';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { APCAcontrast, sRGBtoY } from 'apca-w3';
import chroma from 'chroma-js';
import type {
  ColorConfig,
  MagmaConfig,
} from '@maggioli-design-system/design-tokens/src/lib/color.mjs';
import { createColorTokens } from '@maggioli-design-system/design-tokens/src/lib/color.mjs';
import {
  SURFACE_ROLES,
  BORDER_ROLES,
  groupOf,
  resolveSurfaceOptIn,
  type ThemeConfig,
} from '@maggioli-design-system/design-tokens/src/lib/surface.mjs';
import { TEXT_ROLES } from '@maggioli-design-system/design-tokens/src/lib/text-role.mjs';
import {
  DEFAULT_TARGETS,
  wcag2Ratio,
} from '@maggioli-design-system/design-tokens/src/lib/contrast-gate.js';
import boxShadowTokens from '@maggioli-design-system/design-tokens/tokens/cosmetic/box-shadow.json';
import committedConfig from '@maggioli-design-system/design-tokens/.magma-design-tokensrc.json';
import { Field, Range, Select } from './magma.js';
import type { GateReport } from './gate.js';
import { GateSummary } from './gate-summary.js';
import { msg, rich, useT, type T } from './i18n.js';
import './surfaces.css';

/*
  The Semantic surface page of the studio: the groups and the families that generate surfaces,
  the levels of the shared ramp, and a preview of one family. The page is written in Magma
  (src/magma.tsx); the preview boxes paint the colours the configuration generates, so their
  colours are data, inline, and only their frame follows the tokens (surfaces.css).
*/

type Mode = 'light' | 'dark';
const MODES: Mode[] = ['light', 'dark'];
const MODE_LABEL: Record<Mode, string> = { light: msg('Light'), dark: msg('Dark') };
/** The name of a mode inside a text. */
const MODE_NAME: Record<Mode, string> = { light: msg('light'), dark: msg('dark') };

// box-shadow presets straight from the design-tokens source (tokens/cosmetic/box-shadow.json,
// shipped as --shadow-*); token references resolved, "none" first. Preview aid only, not a token.
const RAW_SHADOWS = (
  boxShadowTokens as { cosmetic: { boxShadow: Record<string, { value: string }> } }
).cosmetic.boxShadow;
const resolveShadow = (value: string): string => {
  const ref = /^\{cosmetic\.boxShadow\.(.+)\}$/.exec(value.trim());
  return ref ? resolveShadow(RAW_SHADOWS[ref[1]].value) : value;
};
const SHADOW_OPTIONS: { name: string; value: string }[] = [
  { name: 'none', value: 'none' },
  ...Object.entries(RAW_SHADOWS).map(([name, token]) => ({
    name,
    value: resolveShadow(token.value),
  })),
];

// fallback ramp when a loaded config opts a family in but carries no theme block:
// the `theme` block of the configuration Magma builds with (design-tokens
// `.magma-design-tokensrc.json`), its surface and border levels and the APCA Lc
// targets of the text roles (A7, #632)
export const DEFAULT_THEME = (committedConfig as { theme: ThemeConfig }).theme;

/** APCA Lc magnitude (Magma flips the sign in dark; the preview shows the size). */
const apcaLc = (fg: string, bg: string): number =>
  Math.abs(APCAcontrast(sRGBtoY(chroma(fg).rgb()), sRGBtoY(chroma(bg).rgb())) as number);

/** A level ("96%" | "96" | 0.96) shown as a 0..100 number for the editor. */
function toPercent(level: string | number): number {
  if (typeof level === 'number') return level > 1 ? level : level * 100;
  const n = Number.parseFloat(String(level).replace('%', ''));
  return Number.isNaN(n) ? 0 : n <= 1 ? n * 100 : n;
}

// what each semantic role is for (SEMANTIC_COLOR_SPEC sections 6.1 and 6.3)
const SURFACE_PURPOSE: Record<string, string> = {
  sunken: msg('wells, insets, code blocks, tracks (recessed)'),
  muted: msg('same-plane grouping: zebra rows, subtle sections'),
  default: msg('the canvas / page background'),
  raised: msg('cards, panels, sticky headers (lifted)'),
  overlay: msg('modal, dropdown, popover, tooltip, sheet (top)'),
};
const BORDER_PURPOSE: Record<string, string> = {
  muted: msg('decorative: grid, dividers, cell/row borders (softest)'),
  default: msg('functional outlines: inputs, buttons'),
  strong: msg('assertive / state: selected, focus, error'),
};
// Borders are judged with the WCAG2 non-text ratio (NOT APCA), and only the STATE roles
// carry the 3:1 floor of WCAG 1.4.11 - decorative borders deliberately have none, so a
// verdict on them would be permanent noise. Both facts mirror the severity split in
// contrast-gate.ts ("borders vs the elevated surfaces": strong/focus are `warn`, the rest
// `info`), so the studio and the CI gate cannot drift apart.
// NOTE the gate measures every border on `surface-raised` too, while the chip can only show
// the surface it is actually drawn on (`default`); in dark `raised` is the stricter of the
// two, so the chip is not always the worst case the gate reports.
const BORDER_STATE_ROLES = new Set(['strong', 'focus']);
const BORDER_MIN_RATIO = DEFAULT_TARGETS.borderState;

export interface BorderVerdict {
  ratio: number;
  /** true when the role conveys state, i.e. when the ratio floor applies at all */
  isState: boolean;
  ok: boolean;
  note: string;
}
/** SHARED by both border previews (the surface panel and the theme cards) so one rule
 * decides the verdict in both. `bgHex` is the surface the chip is actually drawn on. */
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
 * The verdict of a contrast in the preview, as a badge: `error` for a text role under its floor
 * (the contrast gate fails the build on it), `warning` for what the gate only reports (a border
 * of state under 3:1, a role that out-contrasts the one above it), `success` when it holds.
 */
function Verdict({ state, label }: { state: 'success' | 'warning' | 'error'; label: string }) {
  return <mds-badge variant={state} label={label}></mds-badge>;
}

// text roles are chosen BY APCA TARGET vs the worst-case surface (A7); see SEMANTIC_COLOR_SPEC 9.1
const TEXT_PURPOSE: Record<string, string> = {
  default: msg('body / primary data (highest contrast)'),
  muted: msg('secondary ESSENTIAL text: address, phone (stays legible)'),
  subtle: msg('non-essential: captions, hints, units'),
  disabled: msg('disabled / inactive (lowest)'),
};
// APCA Lc floor per text role: the minimum legible contrast, INDEPENDENT of the
// editable theme.text target (SEMANTIC_COLOR_SPEC 9.1): the floors of the CI contrast
// gate (contrast-gate.ts). Below its floor a role is illegible; a role must also never
// out-contrast the role above it in the hierarchy (default > muted > subtle > disabled).
const TEXT_ROLE_MIN_LC: Record<string, number> = DEFAULT_TARGETS.text;

// Slider ranges for the lightness editors. Surfaces are confined to a band per mode
// (high in light, low in dark) because they ARE the canvas. Borders are not: a border
// has to stand out FROM the surface it sits on, and in dark `strong` has to climb well
// past the 50% ceiling of the dark surfaces to read at all, so they get the whole ramp
// in both modes. There is deliberately no guard here against a level that dissolves
// into the canvas: the contrast gate is what catches that, not the slider bounds.
type LevelRange = Record<Mode, { min: number; max: number }>;
const SURFACE_RANGE: LevelRange = {
  light: { min: 85, max: 100 },
  dark: { min: 1, max: 50 },
};
const BORDER_RANGE: LevelRange = {
  light: { min: 0, max: 100 },
  dark: { min: 0, max: 100 },
};
// text targets are an APCA Lc magnitude (0..~106), not a lightness percentage
const TEXT_TARGET_MAX = 106;

/** The family segment of a color name (tone.neutral -> neutral). */
function familyOf(color: ColorConfig): string {
  return color.name.split('.')[1];
}

/**
 * Groups RESERVED to the status messages: the group of the `status-*` families the
 * coloured hues of semantic.config.ts (`hues`) draw from. Their families MUST
 * generate surfaces, shown checked and locked: a status component (banner, toast,
 * badge) paints text on its own tinted background, and that pair only has a contrast
 * guarantee when the family carries generated `--text-*` roles (text-role picks the
 * step against the WORST of the family's surfaces). Left optional, a status family
 * would fall back to hand-picked ramp steps in each component - which is what it does
 * today. And they never become a theme (themes.tsx): a theme repaints the whole
 * interface, so a page painted in a status colour would mix with the messages that
 * colour carries. Every other group, one created in the studio included, can be one.
 */
export const RESERVED_GROUPS = new Set(['status']);

/**
 * Groups that can never be a surface seed. `variant.*` is an alias-only accent
 * family (constraint A3, issue #613), so it is excluded from both lists.
 */
const EXCLUDED_SURFACE_GROUPS = new Set(['variant']);

/** The two panels of the preview, in the order of their tabs. */
type PreviewTab = 'text' | 'surface';
const PREVIEW_TABS: { id: PreviewTab; label: string; icon: string }[] = [
  { id: 'text', label: msg('Texts'), icon: 'mi/baseline/text-fields' },
  { id: 'surface', label: msg('Surface'), icon: 'mi/baseline/layers' },
];

interface SurfaceManagerProps {
  /**
   * The head of the page and its notices, which the App draws (app.tsx, `pageTop`): the start of
   * the first column, so the opt-in of the surfaces can stand beside it on a wide page.
   */
  head?: ComponentChildren;
  config: MagmaConfig;
  /** The report of the contrast gate on the configuration edited (app.tsx), summed up beside the controls (#1418). */
  report?: GateReport;
  /** toggle the per-color surface opt-in flag */
  onToggleSurface: (colorName: string, on: boolean) => void;
  /** toggle the group-level opt-in (groups.<group>.surface) */
  onToggleGroupSurface: (groupName: string, on: boolean) => void;
  /** mutate the global theme block (initialized from defaults if absent) */
  onUpdateTheme: (mutate: (theme: ThemeConfig) => void) => void;
}

// token subtree shapes produced by createColorTokens for surface/border groups
type RoleSet = Record<string, { value: string }>;
type FamilyModes = { light: RoleSet; dark: RoleSet };

export function SurfaceManager({
  head,
  config,
  report,
  onToggleSurface,
  onToggleGroupSurface,
  onUpdateTheme,
}: SurfaceManagerProps) {
  const t = useT();
  const theme = config.theme ?? DEFAULT_THEME;
  // preview-only: which Magma box-shadow renders on the surface boxes (default off)
  const [previewShadow, setPreviewShadow] = useState('none');
  const shadowValue = SHADOW_OPTIONS.find((o) => o.name === previewShadow)?.value ?? 'none';

  // the families eligible to be surfaces, and the groups they fall into (config
  // order, deduped) - both lists exclude the alias-only accent group
  const surfaceColors = config.colors.filter(
    (color) => !color.disabled && !EXCLUDED_SURFACE_GROUPS.has(groupOf(color)),
  );
  const surfaceGroups = [...new Set(surfaceColors.map(groupOf))];
  // the reserved families go under the others, in a row of their own that says why
  // they never become a theme
  const themeColors = surfaceColors.filter((color) => !RESERVED_GROUPS.has(groupOf(color)));
  const reservedColors = surfaceColors.filter((color) => RESERVED_GROUPS.has(groupOf(color)));
  // B5: the preview column shows one panel at a time (manual tab switch); surface boxes
  // lead by default, so editing surface levels shows their effect without a tab change
  const [previewTab, setPreviewTab] = useState<PreviewTab>('surface');

  // generate once; the surface/border groups only exist when a family opts in
  const [surfaces, borders, tones, texts, genError] = useMemo((): [
    Record<string, FamilyModes>,
    Record<string, FamilyModes>,
    Record<string, FamilyModes>,
    Record<string, FamilyModes>,
    string | null,
  ] => {
    try {
      const { tokens } = createColorTokens(JSON.parse(JSON.stringify(config)));
      const color = (tokens as { color: Record<string, unknown> }).color;
      return [
        (color.surface as Record<string, FamilyModes>) ?? {},
        (color.border as Record<string, FamilyModes>) ?? {},
        (color.tone as Record<string, FamilyModes>) ?? {},
        (color.text as Record<string, FamilyModes>) ?? {},
        null,
      ];
    } catch (error) {
      return [{}, {}, {}, {}, String(error)];
    }
  }, [JSON.stringify(config)]);

  const optedFamilies = Object.keys(surfaces);

  // Preview one family at a time (saves vertical space). A newly opted-in family
  // auto-selects; if the shown one is removed, fall back to the first.
  const [selectedFamily, setSelectedFamily] = useState<string>('');
  const prevOpted = useRef<string[]>([]);
  useEffect(() => {
    const added = optedFamilies.filter((family) => !prevOpted.current.includes(family));
    if (prevOpted.current.length > 0 && added.length > 0) {
      setSelectedFamily(added[added.length - 1]);
    }
    prevOpted.current = optedFamilies;
  }, [optedFamilies.join(',')]);
  const shownFamily = optedFamilies.includes(selectedFamily)
    ? selectedFamily
    : (optedFamilies[0] ?? '');

  const setLevel = (kind: 'surfaces' | 'borders', mode: Mode, role: string, percent: number) => {
    onUpdateTheme((draft) => {
      const table = draft[kind] as Record<Mode, Record<string, string | number>>;
      table[mode][role] = `${percent}%`;
    });
  };

  // text targets are an APCA Lc magnitude, mode-agnostic (unlike surfaces/borders)
  const setTextTarget = (role: string, target: number) => {
    onUpdateTheme((draft) => {
      const text = (draft.text ??= { ...(DEFAULT_THEME.text as Record<string, number>) });
      (text as Record<string, number | { step: number }>)[role] = target;
    });
  };

  const textTargets = (theme.text ?? DEFAULT_THEME.text) as Record<
    string,
    number | { step: number }
  >;

  // a family to opt in, the same in the list of the themes and in the reserved row: a selectable
  // chip with the swatch of its colour, and beside it, as beside a group that is always on, the
  // badge of a family that follows its group
  const familyChip = (color: ColorConfig) => {
    const group = groupOf(color);
    const on = resolveSurfaceOptIn(config, color) !== undefined;
    const inherited = color.surface === undefined && Boolean(config.groups?.[group]?.surface);
    return (
      <span
        key={color.name}
        class="surfaces-choice"
        title={
          inherited
            ? t('{name} (follows the {group} group)', { name: color.name, group })
            : color.name
        }
      >
        <mds-chip
          label={familyOf(color)}
          swatch={color.color}
          selectable
          selected={on}
          onmdsChipSelect={(event: CustomEvent<{ selected?: boolean }>) =>
            onToggleSurface(color.name, Boolean(event.detail?.selected))
          }
        ></mds-chip>
        {inherited && <mds-badge variant="dark" label={t('via {group}', { group })}></mds-badge>}
      </span>
    );
  };

  return (
    <div class="surfaces" style={{ '--preview-shadow': shadowValue }}>
      {/* the start of the page: its head and what the page is, then the opt-in of the surfaces,
          beside them where the page is wide (surfaces.css), so what can be done is in view
          before the page scrolls (vittorio, 2026-11-09) */}
      <div class="surfaces-top">
        <div class="surfaces-lead">
          {head}
          <mds-text typography="detail" tag="p" class="surfaces-muted">
            {rich(
              t,
              "Surfaces and borders are placed by perceptual {lightness} in OKLCH (not APCA), per mode and per role. Opt a family in below; the shared ramp is the same for every family (the tint comes from each family's key color). The active default tint is chosen in {styles}, not here. Every family you opt in here also becomes a theme on the Themes page, whatever its group, except the status ones.",
              // the name of a package: code, the same in every language
              { lightness: <em>{t('lightness')}</em>, styles: <code>{'styles'}</code> },
            )}
          </mds-text>
        </div>
        <div class="surfaces-optin">
          {/* Section 1a: opt-in by GROUP - the coarse switch. A group opts every one of
            its families in at once; the per-family list below refines it. */}
          <div class="surfaces-card">
            <div class="surfaces-head">
              <mds-text typography="part" tag="h2">
                {t('Surface groups')}
              </mds-text>
              <mds-text typography="caption" tag="p" class="surfaces-muted">
                {rich(
                  t,
                  'A whole group at once: every family in it generates a {surface}, {border} and {text} scale.',
                  {
                    surface: <code>{'--surface-*'}</code>,
                    border: <code>{'--border-*'}</code>,
                    text: <code>{'--text-*'}</code>,
                  },
                )}
              </mds-text>
            </div>
            <div class="surfaces-choices" role="group" aria-label={t('Surface groups')}>
              {surfaceGroups.map((group) => {
                const required = RESERVED_GROUPS.has(group);
                return (
                  <span
                    class="surfaces-choice"
                    title={
                      required
                        ? t(
                            '{group} always generates surfaces: its components paint text on their own tinted background, so the pair needs a generated text role to be legible by construction',
                            { group },
                          )
                        : undefined
                    }
                  >
                    <mds-chip
                      label={group}
                      selectable
                      selected={required || Boolean(config.groups?.[group]?.surface)}
                      disabled={required}
                      onmdsChipSelect={(event: CustomEvent<{ selected?: boolean }>) =>
                        onToggleGroupSurface(group, Boolean(event.detail?.selected))
                      }
                    ></mds-chip>
                    {required && <mds-badge variant="dark" label={t('always on')}></mds-badge>}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Section 1b: opt-in by FAMILY - the refinement. A family with no flag of its
            own follows its group; turning one on or off writes an explicit override. */}
          <div class="surfaces-card">
            <div class="surfaces-head">
              <mds-text typography="part" tag="h2">
                {t('Surface families')}
              </mds-text>
              <mds-text typography="caption" tag="p" class="surfaces-muted">
                {t(
                  'Refine the groups above per family: a family with no flag of its own follows its group. Each one you opt in here also becomes a theme.',
                )}
              </mds-text>
            </div>
            <div class="surfaces-choices" role="group" aria-label={t('Surface families')}>
              {themeColors.map(familyChip)}
            </div>
            {reservedColors.length > 0 && (
              <div class="surfaces-reserved">
                <mds-text typography="caption" tag="p" class="surfaces-muted">
                  {rich(
                    t,
                    '{lead} These families generate surfaces so that banners, toasts and badges get a text role legible on their own tint; a theme drawn from one would paint the whole interface in a status colour, and the page would mix with the messages that colour carries.',
                    { lead: <strong>{t('Status, never a theme.')}</strong> },
                  )}
                </mds-text>
                <div class="surfaces-choices" role="group" aria-label={t('Status families')}>
                  {reservedColors.map(familyChip)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* B4: lightness levels (left) sit beside the preview (right); the families
        card above stays full-width. Collapses to one column on a narrow page. */}
      <div class="surfaces-workbench">
        {/* Section 2: level editors */}
        <div class="surfaces-card">
          <div class="surfaces-head">
            <mds-text typography="part" tag="h2">
              {t('Lightness levels (%)')}
            </mds-text>
            <mds-text typography="caption" tag="p" class="surfaces-muted">
              {t(
                'The shared ramp for surfaces and borders, per mode; the text targets are an APCA Lc, the same in both modes.',
              )}
            </mds-text>
          </div>
          <div class="surfaces-levels">
            <TextTargets targets={textTargets} onChange={setTextTarget} />
            <LevelGroup
              title={t('Surfaces')}
              roles={SURFACE_ROLES as readonly string[]}
              table={theme.surfaces as Record<Mode, Record<string, string | number>>}
              purpose={SURFACE_PURPOSE}
              range={SURFACE_RANGE}
              onChange={(mode, role, pct) => setLevel('surfaces', mode, role, pct)}
            />
            <LevelGroup
              title={t('Borders')}
              roles={BORDER_ROLES as readonly string[]}
              table={theme.borders as Record<Mode, Record<string, string | number>>}
              purpose={BORDER_PURPOSE}
              range={BORDER_RANGE}
              onChange={(mode, role, pct) => setLevel('borders', mode, role, pct)}
            />
          </div>
        </div>

        {/* Section 3: preview (sticky right column) */}
        <div class="surfaces-preview">
          {/* the verdict of the gate on every theme, beside the preview of one family (#1418) */}
          {report && <GateSummary report={report} />}
          {genError && <mds-banner variant="error">{genError}</mds-banner>}
          {!genError && optedFamilies.length === 0 && (
            <mds-text typography="detail" tag="p" class="surfaces-muted">
              {t('No family opts into surfaces yet: turn one on above to preview it.')}
            </mds-text>
          )}
          {!genError && shownFamily && (
            <>
              <div class="surfaces-preview-controls">
                <Field label={t('Preview family')}>
                  <Select
                    size="md"
                    value={shownFamily}
                    onValue={setSelectedFamily}
                    options={optedFamilies.map((family) => ({ value: family, label: family }))}
                  />
                </Field>
                <Field label={t('Preview shadow')}>
                  <Select
                    size="md"
                    value={previewShadow}
                    onValue={setPreviewShadow}
                    options={SHADOW_OPTIONS.map((o) => ({ value: o.name, label: o.name }))}
                  />
                </Field>
              </div>
              <mds-text typography="caption" tag="p" class="surfaces-muted">
                {rich(
                  t,
                  'The shadow is a Magma {shadow} on the surface boxes below (preview only, not a token).',
                  { shadow: <code>{'--shadow-*'}</code> },
                )}
              </mds-text>
              <div class="surfaces-card">
                {/* B5: Testi (text step-charts) / Surface (surface+border boxes), one panel at a time */}
                <mds-tab
                  onmdsTabChange={(event: CustomEvent<{ id: number; value?: string }>) => {
                    const tab = PREVIEW_TABS.find((one) => one.id === event.detail?.value);
                    if (tab) setPreviewTab(tab.id);
                  }}
                >
                  {PREVIEW_TABS.map((tab) => (
                    <mds-tab-item
                      type="button"
                      label={t(tab.label)}
                      value={tab.id}
                      icon={tab.icon}
                      selected={previewTab === tab.id}
                    ></mds-tab-item>
                  ))}
                </mds-tab>
                {previewTab === 'text' && (
                  <TextPanel
                    family={shownFamily}
                    tones={tones}
                    surfaces={surfaces}
                    texts={texts}
                    targets={textTargets}
                  />
                )}
                {previewTab === 'surface' && (
                  <SurfacePanel
                    family={shownFamily}
                    tones={tones}
                    surfaces={surfaces}
                    borders={borders}
                    texts={texts}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const hex = (set: RoleSet | undefined, role: string): string => set?.[role]?.value ?? '#000000';

interface PanelProps {
  family: string;
  tones: Record<string, FamilyModes>;
  surfaces: Record<string, FamilyModes>;
  texts: Record<string, FamilyModes>;
}

/** Testi: how the engine picks the step of each text role, per mode. */
function TextPanel({
  family,
  tones,
  surfaces,
  texts,
  targets,
}: PanelProps & { targets: Record<string, number | { step: number }> }) {
  const t = useT();
  return (
    <>
      <div class="surfaces-head">
        <mds-text typography="part" tag="h2">
          {t('Text-role step selection')}
        </mds-text>
        <mds-text typography="caption" tag="p" class="surfaces-muted">
          {rich(
            t,
            'The worst-case APCA Lc of each tone step; the engine picks the {least} step whose bar clears a target. Edit the targets (or the surface levels) and the pick moves.',
            { least: <em>{t('least-contrast')}</em> },
          )}
        </mds-text>
      </div>
      <div class="surfaces-modes">
        {MODES.map((mode) => (
          <StepSelectionChart
            mode={mode}
            tone={tones[family]?.[mode]}
            surface={surfaces[family]?.[mode]}
            text={texts[family]?.[mode]}
            targets={targets}
          />
        ))}
      </div>
    </>
  );
}

/**
 * One mode of a family: its canvas with the surfaces on it (sunken, muted, raised and the overlay
 * on it), the text roles with their Lc and verdict, the borders with their ratio. Semantic surface
 * shows the two modes side by side; Themes shows them one under the other, each with the accents
 * of the theme (children), and dims the mode a theme does not offer (`off`).
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
      {/* text roles (A7) below the surface swatches: by-target step + achieved
        APCA Lc vs the canvas. A surface-only family borrows the neutral ink. */}
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
        {(() => {
          // every role's Lc first (rounded, as displayed), so each can be
          // compared to the higher-priority role directly above it
          const roleLc = TEXT_ROLES.map((role) => {
            const c = ink ? hex(ink, role) : canvasText;
            return { role, c, lc: Math.round(apcaLc(c, hex(s, 'default'))) };
          });
          return roleLc.map(({ role, c, lc }, i) => {
            const floor = TEXT_ROLE_MIN_LC[role] ?? 0;
            const above = i > 0 ? roleLc[i - 1] : null;
            // valid = clears its legibility floor AND does not out-contrast
            // the (more important) role above it
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
          });
        })()}
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

/** Surface: the surfaces, the text roles and the borders of the family, per mode. */
function SurfacePanel({
  family,
  tones,
  surfaces,
  borders,
  texts,
}: PanelProps & { borders: Record<string, FamilyModes> }) {
  return (
    <>
      <div class="surfaces-head">
        <mds-text typography="part" tag="h2">
          <code>{`surface-${family}`}</code> / <code>{`border-${family}`}</code>
        </mds-text>
      </div>
      <div class="surfaces-modes">
        {MODES.map((mode) => {
          // Foreground = the active INK. A full tint (tone + surface) carries its own
          // by-target text; a surface-only family (a colored tint with no tone scale,
          // e.g. label.green) has none, so it inherits the NEUTRAL ink - the default
          // foreground, exactly as the semantic layer does (foreground = active
          // counterpart of surface). tone-3 is the last resort for a config with no
          // theme.text at all. The text must never fall through to #000: that is the
          // black-on-dark-surface bug this guards against.
          const ownText = texts[family]?.[mode];
          const ink = ownText ?? texts.neutral?.[mode];
          return (
            <SurfaceCanvas
              mode={mode}
              s={surfaces[family]?.[mode]}
              b={borders[family]?.[mode]}
              ink={ink}
              ownText={Boolean(ownText)}
              canvasText={ink ? hex(ink, 'default') : hex(tones.neutral?.[mode], '3')}
            />
          );
        })}
      </div>
    </>
  );
}

/** The name of a role and what it is for, the first column of a group of levels. */
function RoleName({ role, purpose }: { role: string; purpose: string }) {
  return (
    <div class="surfaces-role">
      <mds-text typography="detail" tag="span">
        {role}
      </mds-text>
      <mds-text typography="caption" tag="span" class="surfaces-muted">
        {purpose}
      </mds-text>
    </div>
  );
}

/** The head of a column of sliders: the mode (or the target) and its range. */
function ColumnHead({ name, range }: { name: string; range: string }) {
  return (
    <mds-text typography="label" tag="span" class="surfaces-column">
      {name} <span class="surfaces-muted">{range}</span>
    </mds-text>
  );
}

interface LevelGroupProps {
  title: string;
  roles: readonly string[];
  table: Record<Mode, Record<string, string | number>>;
  purpose: Record<string, string>;
  range: LevelRange;
  onChange: (mode: Mode, role: string, percent: number) => void;
}

/** The lightness of each role of a group (surfaces, borders), one slider per mode. */
function LevelGroup({ title, roles, table, purpose, range, onChange }: LevelGroupProps) {
  const t = useT();
  return (
    <fieldset class="surfaces-level-group">
      <legend>
        <mds-text typography="group" tag="span">
          {title}
        </mds-text>
      </legend>
      <div class="surfaces-level-grid">
        <span />
        {MODES.map((mode) => (
          <ColumnHead name={t(MODE_LABEL[mode])} range={`${range[mode].min}-${range[mode].max}`} />
        ))}
        {roles.map((role) => (
          <>
            <RoleName role={role} purpose={t(purpose[role])} />
            {MODES.map((mode) => (
              <Range
                value={toPercent(table[mode]?.[role] ?? 0)}
                min={range[mode].min}
                max={range[mode].max}
                label={`${title} ${role}, ${t(MODE_NAME[mode])}`}
                onValue={(value) => onChange(mode, role, value)}
              />
            ))}
          </>
        ))}
      </div>
    </fieldset>
  );
}

interface TextTargetsProps {
  targets: Record<string, number | { step: number }>;
  onChange: (role: string, target: number) => void;
}

/**
 * Text targets are an APCA Lc magnitude, mode-agnostic (one value, applied to
 * both modes), so this is a single-column editor - unlike the per-mode surface
 * and border levels. A `{ step }` override is shown read-only. Beside each target, the floor the
 * contrast gate holds the role to (DEFAULT_TARGETS of contrast-gate.ts), marked when the target
 * is under it (#1418): the engine keeps a text over its floor on the washes of its family (#1414),
 * so the part of a slider under the floor does not make the text weaker.
 */
function TextTargets({ targets, onChange }: TextTargetsProps) {
  const t = useT();
  return (
    <fieldset class="surfaces-level-group">
      <legend>
        <mds-text typography="group" tag="span">
          {t('Text (APCA Lc)')}
        </mds-text>
      </legend>
      <div class="surfaces-level-grid">
        <span />
        <ColumnHead name={t('Target')} range={`0-${TEXT_TARGET_MAX}`} />
        <span />
        {(TEXT_ROLES as readonly string[]).map((role) => {
          const level = targets[role];
          return (
            <>
              <RoleName role={role} purpose={t(TEXT_PURPOSE[role])} />
              {typeof level === 'object' ? (
                <mds-text typography="caption" tag="span" class="surfaces-muted">
                  {t('step {step} (pinned)', { step: level.step })}
                </mds-text>
              ) : (
                <Range
                  value={level ?? 0}
                  min={0}
                  max={TEXT_TARGET_MAX}
                  label={t('Text {role}, target', { role })}
                  onValue={(value) => onChange(role, value)}
                />
              )}
              <TextFloor role={role} level={level} />
            </>
          );
        })}
      </div>
    </fieldset>
  );
}

/** The floor of the gate for a text role, and whether the target stands under it. */
function TextFloor({
  role,
  level,
}: {
  role: string;
  level: number | { step: number } | undefined;
}) {
  const t = useT();
  const floor = DEFAULT_TARGETS.text[role as keyof typeof DEFAULT_TARGETS.text];
  if (floor === undefined) return <span />;
  const under = typeof level === 'number' && level < floor;
  return (
    <span class="surfaces-floor">
      <mds-text typography="caption" tag="span" class="surfaces-muted">
        {t('floor {floor}', { floor })}
      </mds-text>
      {under && (
        <mds-badge
          variant="dark"
          tone="weak"
          label={t('under the floor')}
          title={t(
            'The contrast gate holds this text to Lc {floor}, on the surfaces and on the washes that carry it.',
            { floor },
          )}
        ></mds-badge>
      )}
    </span>
  );
}

const LC_MAX = 108;
/** The letters each step of the chart is drawn in: a sample of type, no word. */
const SAMPLE_GLYPHS = 'Ag';

interface StepChartProps {
  mode: Mode;
  tone?: RoleSet;
  surface?: RoleSet;
  text?: RoleSet;
  targets: Record<string, number | { step: number }>;
}

/**
 * Visualizes the by-target text-role engine (A7) for one family/mode: every tone
 * step plotted by its WORST-CASE APCA Lc across all surfaces, with the theme.text
 * targets as threshold lines. The engine picks the least-contrast step whose
 * worst-case bar clears the target; the step that actually carries each role is
 * found by matching the engine's chosen value back to its tone step, so the marks
 * always agree with the generated tokens.
 */
function StepSelectionChart({ mode, tone, surface, text, targets }: StepChartProps) {
  const t = useT();
  if (!tone || !surface) {
    return (
      <mds-text typography="caption" tag="p" class="surfaces-chart-empty surfaces-muted">
        {t('{mode}: no tone/surface scale', { mode: t(MODE_LABEL[mode]) })}
      </mds-text>
    );
  }

  const surfaceList = Object.entries(surface).map(([role, v]) => ({ role, value: v.value }));

  // per tone step: worst (minimum) APCA Lc across every surface, and which surface binds
  const steps = Array.from({ length: 10 }, (_, i) => String(i + 1))
    .map((step) => ({ step, value: tone[step]?.value }))
    .filter((s): s is { step: string; value: string } => Boolean(s.value))
    .map(({ step, value }) => {
      let lc = Infinity;
      let bind = surfaceList[0];
      for (const s of surfaceList) {
        const v = apcaLc(value, s.value);
        if (v < lc) {
          lc = v;
          bind = s;
        }
      }
      return { step, value, lc, bind };
    });

  // the engine's real choice per role -> the step whose value carries it
  const pickByStep: Record<string, string[]> = {};
  (TEXT_ROLES as readonly string[]).forEach((role) => {
    const chosen = text?.[role]?.value;
    const hit = chosen ? steps.find((s) => s.value === chosen) : undefined;
    if (hit) (pickByStep[hit.step] ??= []).push(role);
  });

  // threshold lines from numeric targets ({ step } pins carry no Lc line)
  const lines = (TEXT_ROLES as readonly string[])
    .map((role) => ({ role, target: targets[role] }))
    .filter((line): line is { role: string; target: number } => typeof line.target === 'number');

  const pct = (lc: number) => `${Math.min(100, (lc / LC_MAX) * 100)}%`;

  return (
    <div class="surfaces-chart">
      <div class="surfaces-chart-row">
        <mds-text typography="label" tag="span" class="surfaces-chart-mode">
          {t(MODE_LABEL[mode])}
        </mds-text>
        <span class="surfaces-chart-track">
          {lines.map((line) => (
            <span
              class="surfaces-chart-tick"
              style={{ left: pct(line.target) }}
              title={t('{role} target {target}', { role: line.role, target: line.target })}
            >
              {line.target}
            </span>
          ))}
        </span>
        <span />
      </div>
      {steps.map((s) => {
        const picks = pickByStep[s.step];
        return (
          <div class="surfaces-chart-row" data-pick={picks ? '' : undefined}>
            <span
              class="surfaces-chart-sample"
              style={{ background: s.bind.value, color: s.value }}
              title={t('tone {color} on its worst surface: {role} {surface}', {
                color: s.value,
                role: s.bind.role,
                surface: s.bind.value,
              })}
            >
              {SAMPLE_GLYPHS}
            </span>
            <span class="surfaces-chart-step">
              <span>
                <b>{s.step}</b> <code>{s.value}</code>
              </span>
              {picks && <span class="surfaces-chart-picks">{picks.join(' ')}</span>}
            </span>
            <span class="surfaces-chart-track">
              {lines.map((line) => (
                <span class="surfaces-chart-line" style={{ left: pct(line.target) }} />
              ))}
              <span class="surfaces-chart-fill" style={{ width: pct(s.lc) }} />
            </span>
            <span class="surfaces-chart-lc">{s.lc.toFixed(0)}</span>
          </div>
        );
      })}
    </div>
  );
}
