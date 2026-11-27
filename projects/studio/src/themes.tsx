import { useMemo, useState } from 'preact/hooks';
import { APCAcontrast, sRGBtoY } from 'apca-w3';
import chroma from 'chroma-js';
import type { MagmaConfig } from '@maggioli-design-system/design-tokens/src/lib/color.mjs';
import { ACCENT_FG_STEPS } from '@maggioli-design-system/design-tokens/src/lib/emphasis.js';
import { createColorTokens } from '@maggioli-design-system/design-tokens/src/lib/color.mjs';

import { semantic } from '@maggioli-design-system/design-tokens/semantic.config';
import type { ColorMode } from '@maggioli-design-system/design-tokens/src/lib/theme-manifest.mjs';
import {
  ACCENT_ROLES,
  SHIPPED_BY_FAMILY,
  accentOfTheme,
  givenNamesOf,
  modesOfTheme,
  nameOfTheme,
  themeNameProblem,
  themesExportCss,
} from './engine/themes.js';
import { RESERVED_GROUPS } from './engine/groups.js';
import { SurfaceCanvas } from './shared/ui/surface-canvas.js';
import { Field, Select, TextInput, type Option } from './shared/magma/magma.js';
import { useStudio, type ExportAction } from './state/studio.js';
import { setThemeAccent, setThemeModes, setThemeName } from './state/theme-choices.js';
import type { GateReport, GateTheme } from './engine/gate.js';
import { msg, rich, useT } from './shared/i18n/i18n.js';
import { ThemeVerdict } from './shared/ui/verdict.js';
import { hrefOf } from './shared/routes/routes.js';
import './themes.css';

/**
 * Themes - a DERIVED section under surfaces (epic #328, spec 8). It reads the
 * families opted into a surface above: each one IS a theme, whatever its group,
 * except the status ones (RESERVED_GROUPS, engine/groups.ts). The default
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
/** The name of a mode inside a sentence. */
const MODE_NAMES: Record<Mode, string> = { light: msg('light'), dark: msg('dark') };
type RoleSet = Record<string, { value: string }>;
type FamilyModes = { light: RoleSet; dark: RoleSet };

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
/** a state generated for a variant family (#1427): `emphasis` (its fill) or `wash` (its base wash). */
const variantState = (
  variants: Record<string, FamilyModes>,
  family: string,
  mode: Mode,
  state: 'emphasis' | 'wash',
): string => hex(variants[family.replace('variant-', '')]?.[mode], state);

/**
 * The colour modes a theme can be used in (#1274), as its select offers them. A value is the list
 * of the modes as `color-scheme` writes it, since the modes are its values (`color.modes` of the
 * theme file, theme-manifest.mts): both, the default of a theme that says nothing, or one alone.
 */
export const MODE_CHOICES: Option[] = [
  { value: 'light dark', label: msg('Light and dark') },
  { value: 'light', label: msg('Light only') },
  { value: 'dark', label: msg('Dark only') },
];

interface ThemesManagerProps {
  config: MagmaConfig;
  /** The contrast gate on the configuration: each card says the verdict of its theme per mode. */
  report?: GateReport;
  /** Runs an export, asking first while the gate fails (app.tsx); without it, it just runs. */
  guard?: (action: ExportAction) => void;
}

export function ThemesManager({
  config,
  report,
  guard = (action) => void action.run(),
}: ThemesManagerProps) {
  const t = useT();
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
      // a variant with the states generated for it (#1427): the rest of its solid fill and its
      // base wash, what --magma-accent-emphasis and --magma-accent-surface name, beside its ramp
      const emphasis = (color.emphasis as Record<string, FamilyModes>) ?? {};
      const wash = (color.wash as Record<string, FamilyModes>) ?? {};
      const variantSets = Object.fromEntries(
        Object.entries((color.variant as Record<string, FamilyModes>) ?? {}).map(([key, ramp]) => [
          key,
          Object.fromEntries(
            MODES.map((mode) => [
              mode,
              {
                ...ramp[mode],
                ...(emphasis[key] ? { emphasis: emphasis[key][mode].default } : {}),
                ...(wash[key] ? { wash: wash[key][mode].base } : {}),
              },
            ]),
          ) as FamilyModes,
        ]),
      );
      return [
        (color.surface as Record<string, FamilyModes>) ?? {},
        (color.text as Record<string, FamilyModes>) ?? {},
        (color.border as Record<string, FamilyModes>) ?? {},
        variantSets,
        seedByMode,
        null,
      ] as const;
    } catch (error) {
      return [{}, {}, {}, {}, { light: '#000', dark: '#000' }, String(error)] as const;
    }
  }, [JSON.stringify(config)]);

  // Every family opted into a surface above (text follows per A7); default first. Any group
  // backs a theme, a label or brand family a monochromatic one: "the groups organise names; they
  // do not gate what can back a theme" (styles/SEMANTIC_COLOR_SPEC.md, section 8). Save the
  // reserved groups (RESERVED_GROUPS, engine/groups.ts), even a family opted in on its own: status
  // always generates surfaces, so its components get a text role legible on their own tint, but
  // a theme in a status colour would mix with the messages that colour carries (vittorio,
  // 2026-11-06, over the opt-in exception of 2026-11-05).
  const groupOf = new Map(
    config.colors.map((color) => [color.name.split('.')[1], color.name.split('.')[0]]),
  );
  const reservedFamilies = new Set(
    config.colors
      .filter((color) => RESERVED_GROUPS.has(color.name.split('.')[0]))
      .map((color) => color.name.split('.')[1]),
  );
  // the ramp a theme repoints is `tone-<family>` by default; a family of another group names
  // its own (spec section 8: `{ surface: 'blue', scale: 'label-blue' }`)
  const scaleOf = (family: string): string | undefined => {
    const group = groupOf.get(family);
    return group && group !== 'tone' ? `${group}-${family}` : undefined;
  };
  const opted = Object.keys(surfaces).filter(
    (family) => texts[family] && !reservedFamilies.has(family),
  );
  const extras = opted.filter((family) => family !== semantic.tint);
  const previewFamilies = [...(opted.includes(semantic.tint) ? [semantic.tint] : []), ...extras];

  // the choices of the person, per family: the state's, shared with the Theme section and kept
  // across a reload (state/theme-choices.ts); only the changes are stored, the rest from the
  // shipped theme
  const studio = useStudio();
  const choices = studio.themeChoices.value;
  const setAccent = (family: string, role: string, variant: string) =>
    setThemeAccent(studio, family, role, variant);
  const accentFor = (family: string, role: string): string => accentOfTheme(family, role, choices);
  const modesFor = (family: string): readonly ColorMode[] => modesOfTheme(family, choices);
  const nameOf = (family: string): string => nameOfTheme(family, choices);
  const givenNames = givenNamesOf(extras, choices);
  const exportCss = themesExportCss(extras, choices, scaleOf);
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(exportCss + '\n');
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* clipboard blocked - the CSS opens below to copy by hand */
    }
  };

  if (genError) return null;

  return (
    <div class="themes">
      <mds-text typography="detail" tag="p" class="themes-muted">
        {rich(
          t,
          "Each family that generates surfaces (its switch in Colours, or its group's in Groups), whatever its group, is a theme with a name of its own, except the status ones, which would mix with the messages they colour: {base}, drawn from {tint}, is the base {root}, and every other one switches in via {attribute}, repointing the whole {block} block (surface + border + text) to its family. The names of the themes Magma ships are reserved. An accent is a role that points at a {variant}; a theme may repoint it - pick a variant per role below and the accent retints with the theme. Any tint works; text comes from the family's own scale.",
          {
            base: <code>{nameOf(semantic.tint)}</code>,
            tint: <code>{semantic.tint}</code>,
            root: <code>{':root'}</code>,
            attribute: <code>{'data-theme-name'}</code>,
            block: <code>{'--magma-tint-*'}</code>,
            variant: <code>{'variant'}</code>,
          },
        )}
      </mds-text>

      {extras.length === 0 && (
        <mds-text typography="detail" tag="p" class="themes-muted">
          {t(
            'Only the base theme so far: turn on Generate surfaces for another family, in Colours, and it appears here as a theme.',
          )}
        </mds-text>
      )}

      {/* Preview: default + derived themes, one under the other, each a row of its settings and
          its two modes where the page has room (vittorio, 2026-11-07). The themes are a list, the
          base first, each card an item of it (ThemeCard): the roles tell it to assistive
          technologies, the look stays the one of the classes */}
      <div class="themes-list" role="list">
        {previewFamilies.map((family) => (
          <ThemeCard
            family={family}
            name={nameOf(family)}
            shipped={SHIPPED_BY_FAMILY.has(family)}
            nameProblem={
              SHIPPED_BY_FAMILY.has(family)
                ? null
                : themeNameProblem(nameOf(family), family, givenNames, t)
            }
            onName={(name) => setThemeName(studio, family, name)}
            surfaces={surfaces}
            texts={texts}
            borders={borders}
            variants={variants}
            seeds={seeds}
            accentFor={accentFor}
            onAccent={setAccent}
            gate={report?.themes.find((theme) => theme.family === family)}
            modes={modesFor(family)}
            onModes={(next) => setThemeModes(studio, family, next)}
          />
        ))}
      </div>

      {/* Export: its header and the copy always in view, the CSS closed under them until it is
          opened (vittorio, 2026-11-07); Copy CSS takes it closed too */}
      {extras.length > 0 && (
        <div class="themes-card">
          <div class="themes-head">
            <mds-text typography="part" tag="h2">
              {t('Export')}
            </mds-text>
            <mds-text typography="caption" tag="p" class="themes-muted">
              {rich(
                t,
                'Paste into a styles theme file; the {default} is the base {root} from {file}, so only the overrides are emitted.',
                {
                  default: <code>{'default'}</code>,
                  root: <code>{':root'}</code>,
                  file: <code>{'semantic.css'}</code>,
                },
              )}
            </mds-text>
          </div>
          <div class="studio-row">
            <mds-button
              type="button"
              variant="dark"
              tone="outline"
              size="md"
              icon={copied ? 'mi/baseline/check' : 'mi/baseline/content-copy'}
              onClick={() =>
                guard({ label: msg('Copy CSS'), proceed: msg('Copy anyway'), run: copy })
              }
              label={copied ? t('Copied') : t('Copy CSS')}
            ></mds-button>
          </div>
          <mds-details class="themes-export-details">
            <mds-text slot="title" typography="detail" tag="span">
              {t('The CSS of the themes')}
            </mds-text>
            <pre class="themes-export">{exportCss}</pre>
          </mds-details>
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
  /** What the contrast gate says of the theme, per mode. */
  gate?: GateTheme;
  /** The colour modes the theme can be used in. */
  modes: readonly ColorMode[];
  onModes: (modes: ColorMode[]) => void;
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
  gate,
  modes,
  onModes,
}: ThemeCardProps) {
  const t = useT();
  const hasScales = Boolean(surfaces[family] && texts[family]);
  const isDefault = family === semantic.tint;
  // the Theme section lists the themes whose name is valid, and the base (configThemes)
  const testable = isDefault || !nameProblem;
  // every variant family in the palette is a pickable accent - not just the ones a
  // role defaults to (so a theme can repoint an accent to e.g. variant-secondary).
  const variantFamilies = Object.keys(variants).map((k) => `variant-${k}`);
  return (
    // an item of the list of the themes (ThemesManager)
    <div class="themes-card" role="listitem">
      {/* what the theme is and its settings, the first column of its row */}
      <div class="themes-info">
        <div class="themes-head">
          <div class="themes-title">
            <mds-text typography="part" tag="h2" class="themes-name">
              {name || family}
            </mds-text>
            {isDefault && <mds-badge variant="dark" label={t('base')}></mds-badge>}
            {shipped && (
              <span title={t('a theme Magma ships: its name is reserved')}>
                <mds-badge variant="dark" label={t('shipped')}></mds-badge>
              </span>
            )}
          </div>
          <mds-text typography="caption" tag="p" class="themes-family themes-muted">
            {rich(t, 'drawn from {family}', { family: <code>{family}</code> })}
          </mds-text>
          <code class="themes-attr">{isDefault ? ':root' : `data-theme-name='${name}'`}</code>
          {/* the verdict of the contrast gate on the theme, per mode, live while it is edited:
            its pairs are on the Contrast check page (#698) */}
          <ThemeVerdict theme={gate} />
        </div>

        {!shipped && (
          <div class="themes-name-field">
            <Field
              label={t('Name')}
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
          a BASE change (exported as a :root block), elsewhere a per-theme override.
          The accents on one row, the modes of the theme under them (vittorio, 2026-11-05). */}
        {hasScales && (
          <div class="themes-settings">
            <div
              class="themes-accents"
              role="group"
              aria-label={t('The accents of {theme}', { theme: name || family })}
            >
              {ACCENT_ROLES.map((role) => {
                const current = accentFor(family, role);
                const isBase = current === semantic.accents[role];
                return (
                  <div class="themes-accent">
                    <Field label={t(accentLabel(role))}>
                      <Select
                        size="md"
                        value={current}
                        onValue={(variant) => onAccent(family, role, variant)}
                        options={variantFamilies.map((v) => ({
                          value: v,
                          label:
                            v === semantic.accents[role]
                              ? t('{variant} (base)', { variant: v.replace('variant-', '') })
                              : v.replace('variant-', ''),
                        }))}
                      />
                    </Field>
                    {!isBase && (
                      <mds-badge
                        variant="info"
                        label={isDefault ? t('changed') : t('override')}
                      ></mds-badge>
                    )}
                  </div>
                );
              })}
            </div>
            <div class="themes-accent themes-modes-field">
              <Field label={t('Modes')}>
                <Select
                  size="md"
                  value={modes.join(' ')}
                  onValue={(value) => onModes(value.split(' ') as ColorMode[])}
                  options={MODE_CHOICES.map((choice) => ({ ...choice, label: t(choice.label) }))}
                />
              </Field>
            </div>
          </div>
        )}
      </div>

      {!hasScales ? (
        <mds-text typography="caption" tag="p" class="themes-muted">
          {rich(t, '{family} has no surface+text scale.', { family: <code>{family}</code> })}
        </mds-text>
      ) : (
        // the canvas of the surfaces per mode (shared/ui/surface-canvas.tsx): the surfaces of the
        // theme are in view (vittorio, 2026-11-05), the accents of the theme under each. A mode the
        // theme does not offer stays in view, dimmed, and says so. Under each canvas, the link that
        // tests the theme in that mode in the Theme section (vittorio, 2026-11-07), outside the
        // canvas, which paints the colours of the theme and not the ones the button reads on; a
        // mode not offered, or a theme whose name the Theme section refuses, has none, as the
        // section cannot show it
        <div class="themes-modes">
          {MODES.map((mode) => {
            const s = surfaces[family][mode];
            const ink = texts[family]?.[mode];
            const offered = modes.includes(mode);
            return (
              <div class="themes-mode">
                <SurfaceCanvas
                  mode={mode}
                  s={s}
                  b={borders[family]?.[mode]}
                  ink={ink}
                  ownText
                  canvasText={hex(ink, 'default')}
                  off={offered ? undefined : t('not offered by the theme')}
                >
                  {/* accents applied on THIS theme's surface, per mode. Each role: a
                    solid pill (emphasis fill + on-emphasis text) with its APCA Lc,
                    plus the soft surface tint chip (accent-<role>-surface / -fg). */}
                  <div class="themes-samples">
                    {ACCENT_ROLES.map((role) => {
                      const variant = accentFor(family, role);
                      const emphasis = variantState(variants, variant, mode, 'emphasis');
                      // the fill ink: the seed in light, the canvas in dark (spec 6.5)
                      const onEmph =
                        mode === 'dark' && semantic.onEmphasisDark
                          ? hex(s, semantic.onEmphasisDark)
                          : seeds[mode];
                      const aSurface = variantState(variants, variant, mode, 'wash');
                      // its ink on a neutral surface, a step per mode, as the layer generates it (#1496)
                      const aFg = variantHex(variants, variant, mode, ACCENT_FG_STEPS[mode]);
                      return (
                        <span class="themes-sample">
                          <span
                            class="themes-sample-pill"
                            style={{ background: emphasis, color: onEmph }}
                          >
                            {role}
                          </span>
                          {/* a sample of type, the same in every language */}
                          <span
                            class="themes-sample-soft"
                            style={{ background: aSurface, color: aFg }}
                          >
                            {'Aa'}
                          </span>
                          <code>Lc {apcaLc(onEmph, emphasis).toFixed(0)}</code>
                        </span>
                      );
                    })}
                  </div>
                </SurfaceCanvas>
                {offered && testable && (
                  <mds-button
                    class="themes-test"
                    href={hrefOf({ section: 'theme', theme: name, mode })}
                    icon="mi/baseline/format-size"
                    variant="dark"
                    tone="outline"
                    size="md"
                    label={t('Test in {mode}', { mode: t(MODE_NAMES[mode]) })}
                    aria-label={t('Test in {mode}, {theme}', {
                      mode: t(MODE_NAMES[mode]),
                      theme: name,
                    })}
                  ></mds-button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
