import { useMemo, useState } from 'preact/hooks';
import { APCAcontrast, sRGBtoY } from 'apca-w3';
import chroma from 'chroma-js';
import type { MagmaConfig } from '../../src/lib/color.mjs';
import { createColorTokens } from '../../src/lib/color.mjs';

import { semantic, accentTintOverride } from '../../semantic.config';
import { borderVerdict } from './surfaces.js';

/**
 * Themes - a DERIVED section under surfaces (epic #328, spec 8). It reads the
 * families opted into a surface above: each one IS a theme. The default
 * (`semantic.tint`) is the base `:root`; every other opted family switches in
 * via `data-theme-name`, repointing the whole `--magma-tint-*` block (surface +
 * border + text) to that family. Text comes from the family's own scale (A7),
 * so any tint works, not just the neutrals.
 *
 * Surfaces derive implicitly (opting a family into a surface IS opting it into a
 * theme). ACCENTS do not derive - an accent is a role (accent/ai) that points at a
 * `variant` family, and a theme may repoint it. So each non-default
 * theme gets an accent ASSIGNMENT: per role, pick which variant it uses (default =
 * the base variant). The card previews the accent APPLIED per mode and the export
 * emits `--magma-tint-accent-*` via the SAME helper the styles generator uses, so
 * the playground export and the shipped `themes.css` stay identical.
 */

type Mode = 'light' | 'dark';
const MODES: Mode[] = ['light', 'dark'];
type RoleSet = Record<string, { value: string }>;
type FamilyModes = { light: RoleSet; dark: RoleSet };

const SURFACE_ROLES = semantic.surfaceRoles;
const BORDER_ROLES = semantic.borderRoles;
const TEXT_ROLES = semantic.textRoles;

// accent roles (accent/ai). An accent is derivative of a variant: you pick WHICH
// variant it points at, nothing more - to add a new accent colour you add a variant
// upstream, keeping variant the single place a colour is chosen. The pickable
// families are ALL the variant families in the palette (derived per card from the
// token tree, see `variantFamilies`), not only the ones a role currently defaults
// to - so a theme can repoint an accent to any variant (e.g. `variant-secondary`
// for a future maggioli-editore theme), even one no role uses by default.
const ACCENT_ROLES = Object.keys(semantic.accents);
const ACCENT_STEPS = semantic.hueSteps;
/** tree step keys are numeric without the leading zero (`04` -> `4`). */
const stepKey = (s: string): string => String(Number(s));

/** APCA Lc magnitude (Magma flips the sign per mode; the preview shows the size). */
const apcaLc = (fg: string, bg: string): number =>
  Math.abs(APCAcontrast(sRGBtoY(chroma(fg).rgb()), sRGBtoY(chroma(bg).rgb())) as number);
const hex = (set: RoleSet | undefined, role: string): string => set?.[role]?.value ?? '#000000';
/** a variant family's step hex for a mode (family is the CSS name, e.g. `variant-ai`). */
const variantHex = (
  variants: Record<string, FamilyModes>,
  family: string,
  mode: Mode,
  step: string,
): string => hex(variants[family.replace('variant-', '')]?.[mode], stepKey(step));

/** per-theme accent assignment: theme family -> role -> variant family. */
type AccentAssignment = Record<string, Record<string, string>>;

interface ThemesManagerProps {
  config: MagmaConfig;
}

export function ThemesManager({ config }: ThemesManagerProps) {
  // generate once; read the per-family surface/text/border/variant role sets
  const [surfaces, texts, borders, variants, seeds, genError] = useMemo(() => {
    try {
      const { tokens } = createColorTokens(JSON.parse(JSON.stringify(config)));
      const color = (tokens as { color: Record<string, unknown> }).color;
      const tones = (color.tone as Record<string, FamilyModes>) ?? {};
      const seedByMode: Record<Mode, string> = {
        light: hex(tones.neutral?.light, 'seed'),
        dark: hex(tones.neutral?.dark, 'seed'),
      };
      return [
        (color.surface as Record<string, FamilyModes>) ?? {},
        (color.text as Record<string, FamilyModes>) ?? {},
        (color.border as Record<string, FamilyModes>) ?? {},
        (color.variant as Record<string, FamilyModes>) ?? {},
        seedByMode,
        null,
      ] as const;
    } catch (error) {
      return [{}, {}, {}, {}, { light: '#000', dark: '#000' }, String(error)] as const;
    }
  }, [JSON.stringify(config)]);

  // Every family opted into a surface above (text follows per A7); default first.
  // THEMEABLE families only: a theme repoints the whole neutral scaffolding, so it
  // only makes sense for a TINT. Since groups can opt in wholesale, non-tint
  // families now carry surfaces too (status does, so its components get a text
  // role guaranteed legible on their own tint) - and those must not show up here
  // as selectable themes, or you could set the whole UI to "success".
  const themeableFamilies = new Set(
    config.colors
      .filter((color) => !color.disabled && color.name.split('.')[0] === 'tone')
      .map((color) => color.name.split('.')[1]),
  );
  const opted = Object.keys(surfaces).filter(
    (family) => texts[family] && themeableFamilies.has(family),
  );
  const extras = opted.filter((family) => family !== semantic.tint);
  const previewFamilies = [...(opted.includes(semantic.tint) ? [semantic.tint] : []), ...extras];

  // per-theme accent assignment (only overrides are stored; missing = base variant)
  const [accents, setAccents] = useState<AccentAssignment>({});
  const setAccent = (family: string, role: string, variant: string) =>
    setAccents((prev) => ({ ...prev, [family]: { ...prev[family], [role]: variant } }));
  const accentFor = (family: string, role: string): string =>
    accents[family]?.[role] ?? semantic.accents[role];

  // export: the override block per non-default theme. Surface/border/text from the
  // family; each reassigned accent via the shared helper (identical to themes.css).
  const themeCss = (family: string): string => {
    const lines = [`:root[data-theme-name='${family}'] {`];
    SURFACE_ROLES.forEach((r) => lines.push(`  --magma-tint-${r}: var(--surface-${family}-${r});`));
    BORDER_ROLES.forEach((r) =>
      lines.push(`  --magma-tint-border-${r}: var(--border-${family}-${r});`),
    );
    TEXT_ROLES.forEach((r) => lines.push(`  --magma-tint-text-${r}: var(--text-${family}-${r});`));
    // the ramp travels with the block: component sheets still read raw steps through
    // --magma-scale-*, so a theme that retinted only surface/border/text would leave
    // those on the base tint. Same shared helper the styles generator uses.
    lines.push(...scaleTintOverride(scaleFamily(family)));
    ACCENT_ROLES.forEach((role) => {
      const variant = accentFor(family, role);
      if (variant !== semantic.accents[role]) lines.push(...accentTintOverride(role, variant));
    });
    lines.push('}');
    return lines.join('\n');
  };
  // the default family is the base :root: it emits no surface/border/text override,
  // but a repointed accent IS a base change, so surface it as a :root accent block.
  const defaultAccentCss = (): string => {
    const lines: string[] = [];
    ACCENT_ROLES.forEach((role) => {
      const variant = accentFor(semantic.tint, role);
      if (variant !== semantic.accents[role]) lines.push(...accentTintOverride(role, variant));
    });
    return lines.length ? [':root {', ...lines, '}'].join('\n') : '';
  };
  const exportCss = [defaultAccentCss(), ...extras.map(themeCss)].filter(Boolean).join('\n\n');
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
        (surface + border + text) to that family. An accent is a role that points at a{' '}
        <code>variant</code>; a theme may repoint it - pick a variant per role below and the accent
        retints with the theme. Any tint works; text comes from the family's own scale.
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
          <ThemeCard
            family={family}
            surfaces={surfaces}
            texts={texts}
            borders={borders}
            variants={variants}
            seeds={seeds}
            accentFor={accentFor}
            onAccent={setAccent}
          />
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
  variants: Record<string, FamilyModes>;
  seeds: Record<Mode, string>;
  accentFor: (family: string, role: string) => string;
  onAccent: (family: string, role: string, variant: string) => void;
}

function ThemeCard({
  family,
  surfaces,
  texts,
  borders,
  variants,
  seeds,
  accentFor,
  onAccent,
}: ThemeCardProps) {
  const hasScales = Boolean(surfaces[family] && texts[family]);
  const isDefault = family === semantic.tint;
  // every variant family in the palette is a pickable accent - not just the ones a
  // role defaults to (so a theme can repoint an accent to e.g. variant-secondary).
  const variantFamilies = Object.keys(variants).map((k) => `variant-${k}`);
  return (
    <div class="theme-card">
      <div class="scale-card-head">
        <span class="scale-usage">
          {family}
          {isDefault && <span class="theme-fam"> (default)</span>}
        </span>
        <code class="theme-attr-code">{isDefault ? ':root' : `data-theme-name='${family}'`}</code>
      </div>

      {/* accent assignment: pick a variant per role. Every theme - including the
          default (:root) - can repoint an accent role to another variant; the roles
          themselves are fixed (never renamed or removed). On the default a change is
          a BASE change (exported as a :root block), elsewhere a per-theme override. */}
      {hasScales && (
        <div class="theme-accent-controls">
          {ACCENT_ROLES.map((role) => {
            const current = accentFor(family, role);
            const isBase = current === semantic.accents[role];
            return (
              <label class="theme-accent-ctl">
                <span class="theme-accent-role">{role}</span>
                <select
                  value={current}
                  onChange={(e) => onAccent(family, role, (e.target as HTMLSelectElement).value)}
                >
                  {variantFamilies.map((v) => (
                    <option value={v}>
                      {v.replace('variant-', '')}
                      {v === semantic.accents[role] ? ' (base)' : ''}
                    </option>
                  ))}
                </select>
                {!isBase && (
                  <span class="theme-accent-flag">{isDefault ? 'changed' : 'override'}</span>
                )}
              </label>
            );
          })}
        </div>
      )}

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
                  {(BORDER_ROLES as readonly string[]).map((role) => {
                    // Ratio only, NO pass/warn tick: these cards report numbers so the
                    // families can be compared (same as the text roles above, which show
                    // Lc without a verdict). The verdict against the 3:1 floor lives in
                    // the surface panel; `borderVerdict` is still the source of the number
                    // so the rounding cannot drift between the two previews.
                    const v = borderVerdict(hex(b, role), canvas, role);
                    return (
                      <span
                        class="tsw-bchip"
                        style={{ borderColor: hex(b, role), background: canvas }}
                        title={v.note}
                      >
                        border {role} <code>{v.ratio}:1</code>
                      </span>
                    );
                  })}
                </div>
                {/* accents applied on THIS theme's surface, per mode. Each role: a
                    solid pill (emphasis fill + on-emphasis text) with its APCA Lc,
                    plus the soft surface tint chip (accent-<role>-surface / -fg). */}
                <div class="tsw-accents">
                  {ACCENT_ROLES.map((role) => {
                    const variant = accentFor(family, role);
                    const emphasis = variantHex(variants, variant, mode, ACCENT_STEPS.emphasis);
                    const onEmph = seeds[mode];
                    const aSurface = variantHex(variants, variant, mode, ACCENT_STEPS.surface);
                    const aFg = variantHex(variants, variant, mode, ACCENT_STEPS.fg);
                    return (
                      <span class="tsw-accent">
                        <span
                          class="tsw-accent-pill"
                          style={{ background: emphasis, color: onEmph }}
                        >
                          {role}
                        </span>
                        <span class="tsw-accent-soft" style={{ background: aSurface, color: aFg }}>
                          Aa
                        </span>
                        <code class="tsw-accent-lc">Lc {apcaLc(onEmph, emphasis).toFixed(0)}</code>
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
