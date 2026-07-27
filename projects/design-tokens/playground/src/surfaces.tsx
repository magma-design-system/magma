import { useMemo, useState } from 'preact/hooks';
import { APCAcontrast, sRGBtoY } from 'apca-w3';
import chroma from 'chroma-js';
import type { ColorConfig, MagmaConfig } from '../../src/lib/color.mjs';
import { createColorTokens } from '../../src/lib/color.mjs';
import { SURFACE_ROLES, BORDER_ROLES, type ThemeConfig } from '../../src/lib/surface.mjs';
import { TEXT_ROLES } from '../../src/lib/text-role.mjs';
import boxShadowTokens from '../../tokens/cosmetic/box-shadow.json';

type Mode = 'light' | 'dark';
const MODES: Mode[] = ['light', 'dark'];

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

// fallback ramp when a loaded config opts a family in but carries no theme block
export const DEFAULT_THEME: ThemeConfig = {
  colorspace: 'OKLCH',
  surfaces: {
    light: { sunken: '92%', muted: '94%', default: '96%', raised: '99%', overlay: '99%' },
    dark: { sunken: '15%', muted: '22%', default: '20%', raised: '24%', overlay: '28%' },
  },
  borders: {
    light: { muted: '87%', default: '82%', strong: '72%' },
    dark: { muted: '30%', default: '36%', strong: '44%' },
  },
  // APCA Lc targets per text role vs the worst-case surface (A7); engine picks the step
  text: { default: 85, muted: 75, subtle: 45, disabled: 30 },
};

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
  sunken: 'wells, insets, code blocks, tracks (recessed)',
  muted: 'same-plane grouping: zebra rows, subtle sections',
  default: 'the canvas / page background',
  raised: 'cards, panels, sticky headers (lifted)',
  overlay: 'modal, dropdown, popover, tooltip, sheet (top)',
};
const BORDER_PURPOSE: Record<string, string> = {
  muted: 'decorative: grid, dividers, cell/row borders (softest)',
  default: 'functional outlines: inputs, buttons',
  strong: 'assertive / state: selected, focus, error',
};
// text roles are chosen BY APCA TARGET vs the worst-case surface (A7); see SEMANTIC_COLOR_SPEC 9.1
const TEXT_PURPOSE: Record<string, string> = {
  default: 'body / primary data (highest contrast)',
  muted: 'secondary ESSENTIAL text: address, phone (stays legible)',
  subtle: 'non-essential: captions, hints, units',
  disabled: 'disabled / inactive (lowest)',
};

/** The family segment of a color name (tone.neutral -> neutral). */
function familyOf(color: ColorConfig): string {
  return color.name.split('.')[1];
}

interface SurfaceManagerProps {
  config: MagmaConfig;
  /** toggle the per-color surface opt-in flag */
  onToggleSurface: (colorName: string, on: boolean) => void;
  /** mutate the global theme block (initialized from defaults if absent) */
  onUpdateTheme: (mutate: (theme: ThemeConfig) => void) => void;
}

// token subtree shapes produced by createColorTokens for surface/border groups
type RoleSet = Record<string, { value: string }>;
type FamilyModes = { light: RoleSet; dark: RoleSet };

export function SurfaceManager({ config, onToggleSurface, onUpdateTheme }: SurfaceManagerProps) {
  const theme = config.theme ?? DEFAULT_THEME;
  // preview-only: which Magma box-shadow renders on the surface boxes (default off)
  const [previewShadow, setPreviewShadow] = useState('none');
  const shadowValue = SHADOW_OPTIONS.find((o) => o.name === previewShadow)?.value ?? 'none';

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

  const hex = (set: RoleSet | undefined, role: string): string => set?.[role]?.value ?? '#000000';

  return (
    <div class="surface-manager" style={{ '--preview-shadow': shadowValue }}>
      <p class="scales-hint">
        Surfaces and borders are placed by perceptual <em>lightness</em> in OKLCH (not APCA), per
        mode and per role. Opt a family in below; the shared ramp is the same for every family (the
        tint comes from each family's key color). The active default tint is chosen in{' '}
        <code>styles</code>, not here.
      </p>

      {/* Section 1: opt-in */}
      <div class="scale-card">
        <div class="scale-card-head">
          <span class="scale-usage">surface families</span>
          <span class="scales-hint">
            check every family that should generate a <code>--surface-*</code> /{' '}
            <code>--border-*</code> scale (multiple allowed - themes repoint the tint between them)
          </span>
        </div>
        <div class="surface-optin">
          {config.colors
            .filter((color) => !color.disabled)
            .map((color) => (
              <label class="surface-optin-item" title={color.name}>
                <input
                  type="checkbox"
                  checked={Boolean(color.surface)}
                  onChange={(e) =>
                    onToggleSurface(color.name, (e.target as HTMLInputElement).checked)
                  }
                />
                <span class="swatch" style={{ background: color.color }} />
                {familyOf(color)}
              </label>
            ))}
        </div>
      </div>

      {/* Section 2: level editors */}
      <div class="scale-card">
        <div class="scale-card-head">
          <span class="scale-usage">lightness levels (%)</span>
          <span class="scales-hint">shared ramp for surfaces and borders, per mode</span>
        </div>
        <div class="surface-levels">
          <LevelTable
            title="surfaces"
            roles={SURFACE_ROLES as readonly string[]}
            table={theme.surfaces as Record<Mode, Record<string, string | number>>}
            purpose={SURFACE_PURPOSE}
            onChange={(mode, role, pct) => setLevel('surfaces', mode, role, pct)}
          />
          <LevelTable
            title="borders"
            roles={BORDER_ROLES as readonly string[]}
            table={theme.borders as Record<Mode, Record<string, string | number>>}
            purpose={BORDER_PURPOSE}
            onChange={(mode, role, pct) => setLevel('borders', mode, role, pct)}
          />
          <TextTargetTable
            targets={
              (theme.text ?? DEFAULT_THEME.text) as Record<string, number | { step: number }>
            }
            onChange={setTextTarget}
          />
        </div>
      </div>

      {/* Section 3: preview */}
      {genError && <div class="preview-error">{genError}</div>}
      {!genError && optedFamilies.length === 0 && (
        <p class="scales-hint">no family opts into surfaces yet - check one above to preview it</p>
      )}
      {!genError && optedFamilies.length > 0 && (
        <div class="preview-controls">
          <label class="preview-shadow-label">
            preview shadow
            <select
              value={previewShadow}
              onChange={(e) => setPreviewShadow((e.target as HTMLSelectElement).value)}
            >
              {SHADOW_OPTIONS.map((o) => (
                <option value={o.name}>{o.name}</option>
              ))}
            </select>
          </label>
          <span class="scales-hint">
            Magma <code>--shadow-*</code> on the surface boxes below (preview only, not a token)
          </span>
        </div>
      )}
      {optedFamilies.map((family) => (
        <div class="scale-card">
          <div class="scale-card-head">
            <span class="scale-usage">
              <code>surface-{family}</code> / <code>border-{family}</code>
            </span>
          </div>
          <div class="surface-preview">
            {MODES.map((mode) => {
              const s = surfaces[family]?.[mode];
              const b = borders[family]?.[mode];
              const t = texts[family]?.[mode];
              // real text-default role (A7); fall back to tone-3 for configs without theme.text
              const canvasText = t ? hex(t, 'default') : hex(tones.neutral?.[mode], '3');
              return (
                <div
                  class="sf-canvas"
                  style={{ background: hex(s, 'default'), color: canvasText }}
                  title={SURFACE_PURPOSE.default}
                >
                  <div class="sf-canvas-label">
                    {mode} - canvas <code>{hex(s, 'default')}</code>
                  </div>
                  <div class="sf-row">
                    <div
                      class="sf-box"
                      style={{ background: hex(s, 'sunken') }}
                      title={SURFACE_PURPOSE.sunken}
                    >
                      sunken <code>{hex(s, 'sunken')}</code>
                    </div>
                    <div
                      class="sf-box"
                      style={{ background: hex(s, 'muted') }}
                      title={SURFACE_PURPOSE.muted}
                    >
                      muted <code>{hex(s, 'muted')}</code>
                    </div>
                  </div>
                  <div
                    class="sf-box sf-raised"
                    style={{ background: hex(s, 'raised') }}
                    title={SURFACE_PURPOSE.raised}
                  >
                    raised <code>{hex(s, 'raised')}</code>
                    <div
                      class="sf-box sf-overlay"
                      style={{ background: hex(s, 'overlay') }}
                      title={SURFACE_PURPOSE.overlay}
                    >
                      overlay <code>{hex(s, 'overlay')}</code>
                    </div>
                  </div>
                  {/* text roles (A7): by-target step + achieved APCA Lc vs the canvas */}
                  <div class="sf-text-roles">
                    {TEXT_ROLES.map((role) => {
                      const c = hex(t, role);
                      return (
                        <span class="sf-text" style={{ color: c }} title={TEXT_PURPOSE[role]}>
                          text {role} <code>{c}</code>{' '}
                          <code>Lc {apcaLc(c, hex(s, 'default')).toFixed(0)}</code>
                        </span>
                      );
                    })}
                  </div>
                  <div class="sf-borders">
                    {(BORDER_ROLES as readonly string[]).map((role) => (
                      <span
                        class="sf-border-chip"
                        style={{ borderColor: hex(b, role), background: hex(s, 'default') }}
                        title={BORDER_PURPOSE[role]}
                      >
                        border {role}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div class="scale-card-head" style={{ marginTop: '12px' }}>
            <span class="scale-usage">text-role step selection</span>
            <span class="scales-hint">
              worst-case APCA Lc per tone step; the engine picks the <em>least-contrast</em> step
              whose bar clears a target. Edit the targets above (or the surface levels) and the pick
              moves.
            </span>
          </div>
          <div class="step-charts">
            {MODES.map((mode) => (
              <StepSelectionChart
                mode={mode}
                tone={tones[family]?.[mode]}
                surface={surfaces[family]?.[mode]}
                text={texts[family]?.[mode]}
                targets={
                  (theme.text ?? DEFAULT_THEME.text) as Record<string, number | { step: number }>
                }
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

interface LevelTableProps {
  title: string;
  roles: readonly string[];
  table: Record<Mode, Record<string, string | number>>;
  purpose: Record<string, string>;
  onChange: (mode: Mode, role: string, percent: number) => void;
}

function LevelTable({ title, roles, table, purpose, onChange }: LevelTableProps) {
  return (
    <table class="level-table">
      <thead>
        <tr>
          <th>{title}</th>
          {MODES.map((mode) => (
            <th>{mode}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {roles.map((role) => (
          <tr>
            <td>
              <span class="role-name">{role}</span>
              <span class="role-purpose">{purpose[role]}</span>
            </td>
            {MODES.map((mode) => (
              <td>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  value={toPercent(table[mode]?.[role] ?? 0)}
                  onChange={(e) =>
                    onChange(mode, role, Number((e.target as HTMLInputElement).value))
                  }
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

interface TextTargetTableProps {
  targets: Record<string, number | { step: number }>;
  onChange: (role: string, target: number) => void;
}

/**
 * Text targets are an APCA Lc magnitude, mode-agnostic (one value, applied to
 * both modes), so this is a single-column editor - unlike the per-mode surface
 * and border level tables. A `{ step }` override is shown read-only.
 */
function TextTargetTable({ targets, onChange }: TextTargetTableProps) {
  return (
    <table class="level-table">
      <thead>
        <tr>
          <th>text (APCA Lc)</th>
          <th>target</th>
        </tr>
      </thead>
      <tbody>
        {(TEXT_ROLES as readonly string[]).map((role) => {
          const level = targets[role];
          return (
            <tr>
              <td>
                <span class="role-name">{role}</span>
                <span class="role-purpose">{TEXT_PURPOSE[role]}</span>
              </td>
              <td>
                {typeof level === 'object' ? (
                  <span class="role-purpose">step {level.step} (pinned)</span>
                ) : (
                  <input
                    type="number"
                    min={0}
                    max={106}
                    step={1}
                    value={level ?? 0}
                    onChange={(e) => onChange(role, Number((e.target as HTMLInputElement).value))}
                  />
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

const LC_MAX = 108;

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
  if (!tone || !surface) {
    return <div class="step-chart step-chart-empty">{mode}: no tone/surface scale</div>;
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
    .filter((t): t is { role: string; target: number } => typeof t.target === 'number');

  const pct = (lc: number) => `${Math.min(100, (lc / LC_MAX) * 100)}%`;

  return (
    <div class="step-chart">
      <div class="sc-head-row">
        <span class="sc-mode">{mode}</span>
        <span class="sc-track">
          {lines.map((t) => (
            <span
              class="sc-tick"
              style={{ left: pct(t.target) }}
              title={`${t.role} target ${t.target}`}
            >
              {t.target}
            </span>
          ))}
        </span>
        <span />
      </div>
      {steps.map((s) => {
        const picks = pickByStep[s.step];
        return (
          <div class={picks ? 'sc-row sc-row-pick' : 'sc-row'}>
            <span
              class="sc-sw"
              style={{ background: s.bind.value, color: s.value }}
              title={`tone ${s.value} on its worst surface: ${s.bind.role} ${s.bind.value}`}
            >
              Ag
            </span>
            <span class="sc-label">
              <span>
                <b>{s.step}</b> <code>{s.value}</code>
              </span>
              {picks && (
                <span class="sc-picks">
                  {picks.map((r) => (
                    <span class="sc-pick">{r}</span>
                  ))}
                </span>
              )}
            </span>
            <span class="sc-track">
              {lines.map((t) => (
                <span class="sc-line" style={{ left: pct(t.target) }} />
              ))}
              <span
                class={picks ? 'sc-fill sc-fill-pick' : 'sc-fill'}
                style={{ width: pct(s.lc) }}
              />
            </span>
            <span class="sc-lc">{s.lc.toFixed(0)}</span>
          </div>
        );
      })}
    </div>
  );
}
