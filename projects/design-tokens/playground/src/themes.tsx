import { useMemo, useState } from 'preact/hooks';
import { APCAcontrast, sRGBtoY } from 'apca-w3';
import chroma from 'chroma-js';
import type { MagmaConfig } from '../../src/lib/color.mjs';
import { createColorTokens } from '../../src/lib/color.mjs';
import { semantic } from '../../semantic.config';

/**
 * Themes - a DERIVED section under surfaces (epic #328, spec 8). It reads the
 * families opted into a surface above: each one IS a theme. The default
 * (`semantic.tint`) is the base `:root`; every other opted family switches in
 * via `data-theme-name`, repointing the whole `--magma-tint-*` block (surface +
 * border + text) to that family. Text comes from the family's own scale (A7),
 * so any tint works, not just the neutrals.
 *
 * There is no separate toggle: opting a family into a surface IS opting it in as
 * a theme - the same axis, one step down. So this section has no controls, it
 * just previews the derived themes side by side and exports their override CSS.
 */

type Mode = 'light' | 'dark';
const MODES: Mode[] = ['light', 'dark'];
type RoleSet = Record<string, { value: string }>;
type FamilyModes = { light: RoleSet; dark: RoleSet };

const SURFACE_ROLES = semantic.surfaceRoles;
const BORDER_ROLES = semantic.borderRoles;
const TEXT_ROLES = semantic.textRoles;

/** APCA Lc magnitude (Magma flips the sign per mode; the preview shows the size). */
const apcaLc = (fg: string, bg: string): number =>
  Math.abs(APCAcontrast(sRGBtoY(chroma(fg).rgb()), sRGBtoY(chroma(bg).rgb())) as number);
const hex = (set: RoleSet | undefined, role: string): string => set?.[role]?.value ?? '#000000';

interface ThemesManagerProps {
  config: MagmaConfig;
}

export function ThemesManager({ config }: ThemesManagerProps) {
  // generate once; read the per-family surface/text/border role sets
  const [surfaces, texts, borders, genError] = useMemo(() => {
    try {
      const { tokens } = createColorTokens(JSON.parse(JSON.stringify(config)));
      const color = (tokens as { color: Record<string, unknown> }).color;
      return [
        (color.surface as Record<string, FamilyModes>) ?? {},
        (color.text as Record<string, FamilyModes>) ?? {},
        (color.border as Record<string, FamilyModes>) ?? {},
        null,
      ] as [
        Record<string, FamilyModes>,
        Record<string, FamilyModes>,
        Record<string, FamilyModes>,
        string | null,
      ];
    } catch (error) {
      return [{}, {}, {}, String(error)] as [
        Record<string, FamilyModes>,
        Record<string, FamilyModes>,
        Record<string, FamilyModes>,
        string | null,
      ];
    }
  }, [JSON.stringify(config)]);

  // every family opted into a surface above (text follows per A7); default first
  const opted = Object.keys(surfaces).filter((family) => texts[family]);
  const extras = opted.filter((family) => family !== semantic.tint);
  const previewFamilies = [...(opted.includes(semantic.tint) ? [semantic.tint] : []), ...extras];

  // export: the override block per non-default theme; the default is the base
  // :root. on-emphasis stays the base seed (max contrast on a fill).
  const themeCss = (family: string): string => {
    const lines = [`:root[data-theme-name='${family}'] {`];
    SURFACE_ROLES.forEach((r) => lines.push(`  --magma-tint-${r}: var(--surface-${family}-${r});`));
    BORDER_ROLES.forEach((r) =>
      lines.push(`  --magma-tint-border-${r}: var(--border-${family}-${r});`),
    );
    TEXT_ROLES.forEach((r) => lines.push(`  --magma-tint-text-${r}: var(--text-${family}-${r});`));
    lines.push('}');
    return lines.join('\n');
  };
  const exportCss = extras.map(themeCss).join('\n\n');
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(exportCss + '\n');
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* clipboard blocked - the CSS is shown below to copy by hand */
    }
  };

  if (genError) return null;

  return (
    <div class="themes-manager">
      <div class="content-head">
        <h2>themes</h2>
        <span class="scales-hint">derived from the surfaces above</span>
      </div>
      <p class="scales-hint">
        Each family you opt into a surface above is a theme: the <code>default</code> (
        <code>{semantic.tint}</code>) is the base <code>:root</code>, and every other one switches
        in via <code>data-theme-name</code>, repointing the whole <code>--magma-tint-*</code> block
        (surface + border + text) to that family. Same axis as surfaces, one step down - no toggle,
        opting into a surface IS opting into a theme. Any tint works (a colour family is a
        monochromatic theme); text comes from the family's own scale.
      </p>

      {extras.length === 0 && (
        <p class="scales-hint">
          Only the <code>{semantic.tint}</code> default so far - opt another family into a surface
          above and it appears here as a theme.
        </p>
      )}

      {/* Preview: default + derived themes, side by side */}
      <div class="theme-preview-grid">
        {previewFamilies.map((family) => (
          <ThemeCard family={family} surfaces={surfaces} texts={texts} borders={borders} />
        ))}
      </div>

      {/* Export */}
      {extras.length > 0 && (
        <div class="scale-card">
          <div class="scale-card-head">
            <span class="scale-usage">export</span>
            <span class="scales-hint">
              paste into a styles theme file; the <code>default</code> is the base{' '}
              <code>:root</code> from <code>semantic.css</code>, so only the overrides are emitted
            </span>
          </div>
          <button onClick={copy}>{copied ? 'copied' : 'copy CSS'}</button>
          <pre class="theme-export">{exportCss}</pre>
        </div>
      )}
    </div>
  );
}

interface ThemeCardProps {
  family: string;
  surfaces: Record<string, FamilyModes>;
  texts: Record<string, FamilyModes>;
  borders: Record<string, FamilyModes>;
}

function ThemeCard({ family, surfaces, texts, borders }: ThemeCardProps) {
  const hasScales = Boolean(surfaces[family] && texts[family]);
  const isDefault = family === semantic.tint;
  return (
    <div class="theme-card">
      <div class="scale-card-head">
        <span class="scale-usage">
          {family}
          {isDefault && <span class="theme-fam"> (default)</span>}
        </span>
        <code class="theme-attr-code">{isDefault ? ':root' : `data-theme-name='${family}'`}</code>
      </div>
      {!hasScales ? (
        <span class="scales-hint">
          <code>{family}</code> has no surface+text scale.
        </span>
      ) : (
        <div class="theme-modes">
          {MODES.map((mode) => {
            const s = surfaces[family][mode];
            const t = texts[family]?.[mode];
            const b = borders[family]?.[mode];
            const canvas = hex(s, 'default');
            return (
              <div class="tsw" style={{ background: canvas, color: hex(t, 'default') }}>
                <div class="tsw-lab">
                  {mode} - surface <code>{canvas}</code>
                </div>
                <div
                  class="tsw-raised"
                  style={{ background: hex(s, 'raised'), border: `1px solid ${hex(b, 'default')}` }}
                >
                  raised <code>{hex(s, 'raised')}</code>
                </div>
                <div class="tsw-texts">
                  {(TEXT_ROLES as readonly string[]).map((role) => {
                    const c = hex(t, role);
                    return (
                      <span class="tsw-text" style={{ color: c }}>
                        text {role} <code>Lc {apcaLc(c, canvas).toFixed(0)}</code>
                      </span>
                    );
                  })}
                </div>
                <div class="tsw-borders">
                  {(BORDER_ROLES as readonly string[]).map((role) => (
                    <span
                      class="tsw-bchip"
                      style={{ borderColor: hex(b, role), background: canvas }}
                    >
                      border {role}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
