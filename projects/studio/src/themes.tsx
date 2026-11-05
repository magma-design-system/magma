import { useMemo, useState } from 'preact/hooks';
import { APCAcontrast, sRGBtoY } from 'apca-w3';
import chroma from 'chroma-js';
import type { MagmaConfig } from '@maggioli-design-system/design-tokens/src/lib/color.mjs';
import { createColorTokens } from '@maggioli-design-system/design-tokens/src/lib/color.mjs';

import {
  semantic,
  accentTintOverride,
} from '@maggioli-design-system/design-tokens/semantic.config';
import {
  THEME_NAME,
  namedThemeCss,
  themeOf,
} from '@maggioli-design-system/design-tokens/semantic.model';
import { borderVerdict } from './surfaces.js';
import { Field, Select, TextInput } from './magma.js';
import './themes.css';

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
 * prints each theme with `namedThemeCss`, the function the styles generator writes
 * `themes.css` with, so the export and the shipped `themes.css` stay identical.
 */

type Mode = 'light' | 'dark';
const MODES: Mode[] = ['light', 'dark'];
type RoleSet = Record<string, { value: string }>;
type FamilyModes = { light: RoleSet; dark: RoleSet };

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

/** A ThemeDef of semantic.config.ts as surface and accents (a string is the surface alone). */
const defOf = (def: (typeof semantic.themes)[string]) =>
  typeof def === 'string' ? { surface: def, accents: undefined, deprecated: undefined } : def;

/**
 * The name of a theme is its own, not the name of the family it is drawn from (decided with
 * vittorio, 2026-11-05): `editorial` is drawn from `bisque`. Every name Magma ships is reserved,
 * the deprecated ones included while themes.css still emits them, so a theme of a product never
 * takes one (semantic.config.ts, `themes`).
 */
export const RESERVED_THEME_NAMES: ReadonlySet<string> = new Set(Object.keys(semantic.themes));

/**
 * The themes Magma ships, by the family they are drawn from: their name and their accents. The
 * deprecated ones are no starting point, so they are not offered.
 */
const SHIPPED_BY_FAMILY: ReadonlyMap<string, { name: string; accents: Record<string, string> }> =
  new Map(
    Object.entries(semantic.themes)
      .map(([name, def]) => ({ name, ...defOf(def) }))
      .filter(({ deprecated }) => !deprecated)
      .map(({ name, surface, accents }) => [
        surface ?? semantic.tint,
        { name, accents: accents ?? {} },
      ]),
  );

/** Why a name a person gave a theme cannot be used, or null when it can. */
export function themeNameProblem(name: string, family: string, names: Record<string, string>) {
  if (!THEME_NAME.test(name))
    return 'lowercase words joined by hyphens, as editorial or my-product';
  if (RESERVED_THEME_NAMES.has(name))
    return `${name} is a theme Magma ships: pick a name of your own`;
  const taken = Object.entries(names).find(([other, value]) => other !== family && value === name);
  if (taken) return `the theme drawn from ${taken[0]} is named ${name} already`;
  return null;
}

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

  // per-theme accent assignment (only overrides are stored; missing = the accents of the theme
  // Magma ships from the family, then the base variant)
  const [accents, setAccents] = useState<AccentAssignment>({});
  const setAccent = (family: string, role: string, variant: string) =>
    setAccents((prev) => ({ ...prev, [family]: { ...prev[family], [role]: variant } }));
  const accentFor = (family: string, role: string): string =>
    accents[family]?.[role] ??
    SHIPPED_BY_FAMILY.get(family)?.accents[role] ??
    semantic.accents[role];

  // the name of each theme: the shipped one for a family Magma draws a theme from, else the
  // one the person gives it, the family name until then
  const [names, setNames] = useState<Record<string, string>>({});
  const nameOf = (family: string): string =>
    SHIPPED_BY_FAMILY.get(family)?.name ?? names[family] ?? family;
  const givenNames = Object.fromEntries(
    extras
      .filter((family) => !SHIPPED_BY_FAMILY.has(family))
      .map((family) => [family, nameOf(family)]),
  );

  // export: the block of each non-default theme, expanded and printed by the code
  // that writes themes.css (design-tokens semantic.model.ts): the tint block of the
  // family with its ramp, each reassigned accent, and the theme's own contrast blocks.
  // A family whose name is no theme name (the model refuses it) says why instead.
  const themeCss = (family: string): string => {
    const name = nameOf(family);
    const problem = SHIPPED_BY_FAMILY.has(family)
      ? null
      : themeNameProblem(name, family, givenNames);
    if (problem) return `/* the theme drawn from ${family}: ${problem} */`;
    const accentOverrides = Object.fromEntries(
      ACCENT_ROLES.map((role) => [role, accentFor(family, role)]).filter(
        ([role, variant]) => variant !== semantic.accents[role],
      ),
    );
    try {
      return namedThemeCss(themeOf(name, { surface: family, accents: accentOverrides }));
    } catch (error) {
      return `/* ${name}: ${error instanceof Error ? error.message : String(error)} */`;
    }
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
    <div class="themes">
      <mds-text typography="detail" tag="p" class="themes-muted">
        Each family opted into a surface (Semantic surface) is a theme with a name of its own:{' '}
        <code>{nameOf(semantic.tint)}</code>, drawn from <code>{semantic.tint}</code>, is the base{' '}
        <code>:root</code>, and every other one switches in via <code>data-theme-name</code>,
        repointing the whole <code>--magma-tint-*</code> block (surface + border + text) to its
        family. The names of the themes Magma ships are reserved. An accent is a role that points at
        a <code>variant</code>; a theme may repoint it - pick a variant per role below and the
        accent retints with the theme. Any tint works; text comes from the family's own scale.
      </mds-text>

      {extras.length === 0 && (
        <mds-text typography="detail" tag="p" class="themes-muted">
          Only the base theme so far: opt another family into a surface (Semantic surface) and it
          appears here as a theme.
        </mds-text>
      )}

      {/* Preview: default + derived themes, side by side */}
      <div class="themes-grid">
        {previewFamilies.map((family) => (
          <ThemeCard
            family={family}
            name={nameOf(family)}
            shipped={SHIPPED_BY_FAMILY.has(family)}
            nameProblem={
              SHIPPED_BY_FAMILY.has(family)
                ? null
                : themeNameProblem(nameOf(family), family, givenNames)
            }
            onName={(name) => setNames((prev) => ({ ...prev, [family]: name }))}
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
        <div class="themes-card">
          <div class="themes-head">
            <mds-text typography="part" tag="h2">
              Export
            </mds-text>
            <mds-text typography="caption" tag="p" class="themes-muted">
              Paste into a styles theme file; the <code>default</code> is the base{' '}
              <code>:root</code> from <code>semantic.css</code>, so only the overrides are emitted.
            </mds-text>
          </div>
          <div class="studio-row">
            <mds-button
              type="button"
              variant="dark"
              tone="outline"
              size="md"
              icon={copied ? 'mi/baseline/check' : 'mi/baseline/content-copy'}
              onClick={copy}
              label={copied ? 'Copied' : 'Copy CSS'}
            ></mds-button>
          </div>
          <pre class="themes-export">{exportCss}</pre>
        </div>
      )}
    </div>
  );
}

/** The label of an accent role in its field: `ai` is an acronym. */
const accentLabel = (role: string): string =>
  role === 'ai' ? 'AI' : role.charAt(0).toUpperCase() + role.slice(1);

interface ThemeCardProps {
  family: string;
  /** The name of the theme drawn from the family. */
  name: string;
  /** A theme Magma ships: its name is fixed. */
  shipped: boolean;
  /** Why the name cannot be used, or null. */
  nameProblem: string | null;
  onName: (name: string) => void;
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
  name,
  shipped,
  nameProblem,
  onName,
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
    <div class="themes-card">
      <div class="themes-head">
        <div class="themes-title">
          <mds-text typography="part" tag="h2" class="themes-name">
            {name || family}
          </mds-text>
          {isDefault && <mds-badge variant="dark" label="base"></mds-badge>}
          {shipped && (
            <span title="a theme Magma ships: its name is reserved">
              <mds-badge variant="dark" label="shipped"></mds-badge>
            </span>
          )}
        </div>
        <mds-text typography="caption" tag="p" class="themes-family themes-muted">
          drawn from <code>{family}</code>
        </mds-text>
        <code class="themes-attr">{isDefault ? ':root' : `data-theme-name='${name}'`}</code>
      </div>

      {!shipped && (
        <div class="themes-name-field">
          <Field
            label="Name"
            message={nameProblem ?? undefined}
            variant={nameProblem ? 'error' : undefined}
          >
            <TextInput
              value={name}
              variant={nameProblem ? 'error' : undefined}
              onValue={(value) => onName(value.trim())}
            />
          </Field>
        </div>
      )}

      {/* accent assignment: pick a variant per role. Every theme - including the
          default (:root) - can repoint an accent role to another variant; the roles
          themselves are fixed (never renamed or removed). On the default a change is
          a BASE change (exported as a :root block), elsewhere a per-theme override. */}
      {hasScales && (
        <div class="themes-accents" role="group" aria-label={`The accents of ${name || family}`}>
          {ACCENT_ROLES.map((role) => {
            const current = accentFor(family, role);
            const isBase = current === semantic.accents[role];
            return (
              <div class="themes-accent">
                <Field label={accentLabel(role)}>
                  <Select
                    size="md"
                    value={current}
                    onValue={(variant) => onAccent(family, role, variant)}
                    options={variantFamilies.map((v) => ({
                      value: v,
                      label: `${v.replace('variant-', '')}${v === semantic.accents[role] ? ' (base)' : ''}`,
                    }))}
                  />
                </Field>
                {!isBase && (
                  <mds-badge variant="info" label={isDefault ? 'changed' : 'override'}></mds-badge>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!hasScales ? (
        <mds-text typography="caption" tag="p" class="themes-muted">
          <code>{family}</code> has no surface+text scale.
        </mds-text>
      ) : (
        <div class="themes-modes">
          {MODES.map((mode) => {
            const s = surfaces[family][mode];
            const t = texts[family]?.[mode];
            const b = borders[family]?.[mode];
            const canvas = hex(s, 'default');
            return (
              <div class="themes-mode" style={{ background: canvas, color: hex(t, 'default') }}>
                <span class="themes-mode-label">
                  {mode} - surface <code>{canvas}</code>
                </span>
                <div
                  class="themes-raised"
                  style={{ background: hex(s, 'raised'), borderColor: hex(b, 'default') }}
                >
                  raised <code>{hex(s, 'raised')}</code>
                </div>
                <div class="themes-texts">
                  {(TEXT_ROLES as readonly string[]).map((role) => {
                    const c = hex(t, role);
                    return (
                      <span class="themes-text" style={{ color: c }}>
                        text {role} <code>Lc {apcaLc(c, canvas).toFixed(0)}</code>
                      </span>
                    );
                  })}
                </div>
                <div class="themes-borders">
                  {(BORDER_ROLES as readonly string[]).map((role) => {
                    // Ratio only, NO pass/warn verdict: these cards report numbers so the
                    // families can be compared (same as the text roles above, which show
                    // Lc without a verdict). The verdict against the 3:1 floor lives in
                    // the surface panel; `borderVerdict` is still the source of the number
                    // so the rounding cannot drift between the two previews.
                    const v = borderVerdict(hex(b, role), canvas, role);
                    return (
                      <span
                        class="themes-border"
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
                <div class="themes-samples">
                  {ACCENT_ROLES.map((role) => {
                    const variant = accentFor(family, role);
                    const emphasis = variantHex(variants, variant, mode, ACCENT_STEPS.emphasis);
                    // the fill ink: the seed in light, the canvas in dark (spec 6.5)
                    const onEmph =
                      mode === 'dark' && semantic.onEmphasisDark
                        ? hex(s, semantic.onEmphasisDark)
                        : seeds[mode];
                    const aSurface = variantHex(variants, variant, mode, ACCENT_STEPS.surface);
                    const aFg = variantHex(variants, variant, mode, ACCENT_STEPS.fg);
                    return (
                      <span class="themes-sample">
                        <span
                          class="themes-sample-pill"
                          style={{ background: emphasis, color: onEmph }}
                        >
                          {role}
                        </span>
                        <span
                          class="themes-sample-soft"
                          style={{ background: aSurface, color: aFg }}
                        >
                          Aa
                        </span>
                        <code>Lc {apcaLc(onEmph, emphasis).toFixed(0)}</code>
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
