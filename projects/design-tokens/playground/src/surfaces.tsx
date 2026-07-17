import { useMemo } from 'preact/hooks';
import type { ColorConfig, MagmaConfig } from '../../src/lib/color.mjs';
import { createColorTokens } from '../../src/lib/color.mjs';
import { SURFACE_ROLES, BORDER_ROLES, type ThemeConfig } from '../../src/lib/surface.mjs';

type Mode = 'light' | 'dark';
const MODES: Mode[] = ['light', 'dark'];

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
};

/** A level ("96%" | "96" | 0.96) shown as a 0..100 number for the editor. */
function toPercent(level: string | number): number {
  if (typeof level === 'number') return level > 1 ? level : level * 100;
  const n = Number.parseFloat(String(level).replace('%', ''));
  return Number.isNaN(n) ? 0 : n <= 1 ? n * 100 : n;
}

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

  // generate once; the surface/border groups only exist when a family opts in
  const [surfaces, borders, tones, genError] = useMemo((): [
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
        null,
      ];
    } catch (error) {
      return [{}, {}, {}, String(error)];
    }
  }, [JSON.stringify(config)]);

  const optedFamilies = Object.keys(surfaces);

  const setLevel = (kind: 'surfaces' | 'borders', mode: Mode, role: string, percent: number) => {
    onUpdateTheme((draft) => {
      const table = draft[kind] as Record<Mode, Record<string, string | number>>;
      table[mode][role] = `${percent}%`;
    });
  };

  const hex = (set: RoleSet | undefined, role: string): string => set?.[role]?.value ?? '#000000';

  return (
    <div class="surface-manager">
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
            onChange={(mode, role, pct) => setLevel('surfaces', mode, role, pct)}
          />
          <LevelTable
            title="borders"
            roles={BORDER_ROLES as readonly string[]}
            table={theme.borders as Record<Mode, Record<string, string | number>>}
            onChange={(mode, role, pct) => setLevel('borders', mode, role, pct)}
          />
        </div>
      </div>

      {/* Section 3: preview */}
      {genError && <div class="preview-error">{genError}</div>}
      {!genError && optedFamilies.length === 0 && (
        <p class="scales-hint">no family opts into surfaces yet - check one above to preview it</p>
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
              const textStrong = hex(tones.neutral?.[mode], '3');
              const textSubtle = hex(tones.neutral?.[mode], '5');
              return (
                <div class="sf-canvas" style={{ background: hex(s, 'default'), color: textStrong }}>
                  <div class="sf-canvas-label">
                    {mode} - canvas <code>{hex(s, 'default')}</code>
                  </div>
                  <div class="sf-row">
                    <div class="sf-box" style={{ background: hex(s, 'sunken') }}>
                      sunken <code>{hex(s, 'sunken')}</code>
                    </div>
                    <div class="sf-box" style={{ background: hex(s, 'muted') }}>
                      muted <code>{hex(s, 'muted')}</code>
                    </div>
                  </div>
                  <div class="sf-box sf-raised" style={{ background: hex(s, 'raised') }}>
                    raised <code>{hex(s, 'raised')}</code>
                    <div class="sf-box sf-overlay" style={{ background: hex(s, 'overlay') }}>
                      overlay <code>{hex(s, 'overlay')}</code>
                      <p class="sf-text" style={{ color: textStrong }}>
                        Text default
                      </p>
                      <p class="sf-text" style={{ color: textSubtle }}>
                        Text subtle
                      </p>
                    </div>
                  </div>
                  <div class="sf-borders">
                    {(BORDER_ROLES as readonly string[]).map((role) => (
                      <span
                        class="sf-border-chip"
                        style={{ borderColor: hex(b, role), background: hex(s, 'default') }}
                      >
                        border {role}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
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
  onChange: (mode: Mode, role: string, percent: number) => void;
}

function LevelTable({ title, roles, table, onChange }: LevelTableProps) {
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
            <td>{role}</td>
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
