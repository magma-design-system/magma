import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import initialConfigJson from '@maggioli-design-system/design-tokens/.magma-design-tokensrc.json';
import DEFAULT_COLOR_CONFIG from '@maggioli-design-system/design-tokens/src/config/default-color.json';
import { zipSync } from 'fflate';
import type {
  ColorConfig,
  Formula,
  GroupConfig,
  MagmaConfig,
} from '@maggioli-design-system/design-tokens/src/lib/color.mjs';
import {
  createColorTokens,
  resolveExport,
  resolveFormula,
  resolveRatiosName,
} from '@maggioli-design-system/design-tokens/src/lib/color.mjs';
import { cssHex, cssRgb, gimpPalette } from './formats.js';
import {
  COLORSPACES,
  validateConfig,
} from '@maggioli-design-system/design-tokens/src/lib/schema.mjs';
import {
  colorsToDtcg,
  type ColorTokenTree,
} from '@maggioli-design-system/design-tokens/src/lib/dtcg.mjs';
import { GroupsManager } from './groups.js';
import { DiffView } from './diff.js';
import { BatchExportModal } from './batch.js';
import {
  CURVE_PRESETS,
  HUE_SHIFT_EASINGS,
  hasHueShift,
  resolveCurveWeights,
  type HueShiftConfig,
  type HueShiftEasing,
} from '@maggioli-design-system/design-tokens/src/lib/hue-shift.mjs';
import { generateScales, singleColorConfig, type ColorScales, type Step } from './generator.js';
import { ScalesManager, type RatioSet, type ScaleOrigin } from './scales.js';
import { SurfaceManager, DEFAULT_THEME } from './surfaces.js';
import { COLORS_PAGES, type ColorsView } from './routes.js';
import { ThemesManager } from './themes.js';
import type { ThemeConfig } from '@maggioli-design-system/design-tokens/src/lib/surface.mjs';
import { nearestColorName } from './color-names.js';
import {
  clearDraft,
  hashText,
  readDraft,
  reconcileDraft,
  writeDraft,
  type DraftSource,
  type StudioDraft,
} from './draft.js';
import { Check, Field, Range, Select, TextInput, type Option } from './magma.js';
import { HUE_ENDS, endsOf, moveEnd, type HueEnds } from './hue-ends.js';
import './palette.css';
// the named curves of the engine, then a custom one edited by its parameters
type CurvePreset = keyof typeof CURVE_PRESETS;
type CurveKind = CurvePreset | 'custom';

/**
 * A custom curve starts from smooth, the default: no dead zone and a linear ramp, so a person who
 * turns to custom changes the curve they were looking at (vittorio, 2026-11-05 and 2026-11-06).
 */
const CUSTOM_CURVE_START = CURVE_PRESETS.smooth;

/** The ramps of a custom curve: every easing the engine takes, in its order (easing.mts). */
const EASING_OPTIONS: Option[] = HUE_SHIFT_EASINGS.map((name) => ({ value: name, label: name }));
const CURVE_KINDS: CurveKind[] = [...(Object.keys(CURVE_PRESETS) as CurvePreset[]), 'custom'];

type CloneableConfig = MagmaConfig & Record<string, unknown>;
// the views of the Colors section of the studio (routes.ts); 'surface' keeps its id so the
// drafts saved before the views were split keep working
type View = ColorsView;

// the color list on the left drives only the per-color views (edit a color,
// sample its contrast scales). Surfaces, groups and diff operate on the whole
// config, so the column - and its always-present selection - is hidden there.
const COLOR_LIST_VIEWS = new Set<View>(['colors', 'scales']);

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

// an alias family references another family instead of solving its own palette:
// the schema enforces `color` XOR `alias`, so an alias entry carries no `color`.
function isAliasColor(color: Pick<ColorConfig, 'alias'>): boolean {
  return typeof color.alias === 'string' && color.alias.length > 0;
}

// families that ship as aliases in the bundled config are the built-in variants:
// their reference target stays editable, but they cannot be renamed or deleted
// (mirrors how built-in contrast scales are protected). User-created aliases are
// not in this set and stay fully editable.
const BUILTIN_ALIAS_NAMES = new Set(
  (initialConfigJson as unknown as MagmaConfig).colors.filter(isAliasColor).map((c) => c.name),
);

// the base color a swatch/preview should show: an alias follows through to its
// source family's own base color (the source is a non-alias family).
function resolveBaseColor(config: MagmaConfig, color: ColorConfig): string | undefined {
  if (color.color) return color.color;
  if (!color.alias) return undefined;
  return config.colors.find((c) => c.name === color.alias)?.color;
}

// what the badge of a row in the list says, and the title of its button: a reference (ref); a hue
// shift of its own over a global one (hs+, vittorio 2026-11-05); a hue shift, its own or the global
// one it inherits (hs); nothing
function badgeOf(
  config: MagmaConfig,
  color: ColorConfig,
): { label: string; title: string } | undefined {
  if (isAliasColor(color)) return { label: 'ref', title: `alias -> ${color.alias}` };
  if (hasHueShift(color.hueShift) && hasHueShift(config.hueShift))
    return { label: 'hs+', title: 'hue shifting of its own, over the global one' };
  if (hasHueShift(color.hueShift ?? config.hueShift))
    return { label: 'hs', title: 'hue shifting active' };
  return undefined;
}

// neutral is the reference color of the system: select it when present
function defaultSelected(colors: MagmaConfig['colors']): string {
  return (
    colors.find((color) => color.name.split('.')[1] === 'neutral')?.name ?? colors[0]?.name ?? ''
  );
}

function textColorFor(hex: string): string {
  try {
    const [r, g, b] = hex.match(/\w\w/g)!.map((c) => parseInt(c, 16) / 255);
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return lum > 0.45 ? '#00000099' : '#ffffff99';
  } catch {
    return '#00000099';
  }
}

function ScaleRow({ label, steps, seed }: { label: string; steps: Step[]; seed?: string }) {
  return (
    <div class="scale-row">
      <span class="scale-label">{label}</span>
      <div class="scale-cells">
        {steps.map((step) => (
          <div
            class="scale-cell"
            style={{ background: step.value }}
            title={`${step.value} - contrast ${step.contrast.toFixed(2)}:1`}
          >
            <span class="cell-contrast" style={{ color: textColorFor(step.value) }}>
              {step.contrast.toFixed(1)}
            </span>
            <span class="cell-hex" style={{ color: textColorFor(step.value) }}>
              {step.value.replace('#', '')}
            </span>
          </div>
        ))}
        {seed !== undefined && (
          <div class="scale-cell seed" style={{ background: seed }} title={`color token: ${seed}`}>
            <span class="cell-hex" style={{ color: textColorFor(seed) }}>
              seed
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// the ramps of the colour selected: the cards and the cells are data, drawn in the colours they
// show; a configuration the engine cannot solve says why in place of the ramps
function Preview({ scales, error }: { scales: ColorScales | null; error: string | null }) {
  if (error)
    return (
      <mds-banner class="palette-ramps-error" variant="error">
        {error}
      </mds-banner>
    );
  if (!scales) return null;
  return (
    <div class="palette-ramps">
      <div class="preview-card light">
        <ScaleRow label="light" steps={scales.light} seed={scales.lightColor} />
      </div>
      <div class="preview-card dark">
        <ScaleRow label="dark" steps={scales.dark} seed={scales.darkColor} />
      </div>
    </div>
  );
}

type HueShiftMode = 'inherit' | 'custom' | 'off';

interface HueShiftEditorProps {
  value: HueShiftConfig | undefined;
  onChange: (value: HueShiftConfig | undefined) => void;
  /**
   * Per-color editors allow inheriting the global hueShift; the global
   * editor itself only toggles between custom and off.
   */
  allowInherit?: boolean;
  globalActive?: boolean;
  /** The id of the group, for the one of a family: the banner of a reference opens it. */
  id?: string;
  /**
   * The title of the group: the one of the whole configuration says so, apart from the one of
   * the family on the same page (vittorio, 2026-11-05)
   */
  title?: string;
}

/**
 * The group of the hue shifting of the family selected: the banner of a reference brings it into
 * view and gives it the focus (tabindex -1), the next Tab reaching its Mode.
 */
const HUE_SHIFT_GROUP = 'palette-hue-shift';

function HueShiftEditor({
  value,
  onChange,
  allowInherit,
  globalActive,
  id,
  title = 'Hue shifting',
}: HueShiftEditorProps) {
  const mode: HueShiftMode =
    value === undefined
      ? allowInherit
        ? 'inherit'
        : 'off'
      : (value.dark ?? 0) === 0 && (value.light ?? 0) === 0
        ? 'off'
        : 'custom';
  const enabled = mode === 'custom';
  const dark = value?.dark ?? 0;
  const light = value?.light ?? 0;
  const curve = value?.curve ?? 'smooth';
  const curveKind: CurveKind = typeof curve === 'string' ? curve : 'custom';
  // what a custom curve leaves out is the default (smooth) one of the engine, as it generates it
  const { deadZone: defaultDeadZone, easing: defaultEasing } = CURVE_PRESETS.smooth;
  const deadZone =
    typeof curve === 'object' && !Array.isArray(curve)
      ? (curve.deadZone ?? defaultDeadZone)
      : defaultDeadZone;
  const easing =
    typeof curve === 'object' && !Array.isArray(curve)
      ? (curve.easing ?? defaultEasing)
      : defaultEasing;

  const weights = useMemo(() => {
    try {
      return resolveCurveWeights(curve as never, 10);
    } catch {
      return null;
    }
  }, [JSON.stringify(curve)]);

  const patch = (partial: Partial<HueShiftConfig>) => onChange({ dark, light, curve, ...partial });

  // how the two ends move together (hue-ends.ts): read back from the ends at the start, kept by
  // the editor while the person works (the configuration has no place for it)
  const [ends, setEnds] = useState<HueEnds>(() => endsOf(dark, light));
  // the title of the box of the ends, one per editor: the family and the global one share a page
  const endsTitle = `${id ?? 'palette-global-hue-shift'}-ends`;
  const moveTo = (end: 'dark' | 'light', next: number) =>
    patch(moveEnd(ends, { dark, light }, end, next));

  const setMode = (next: HueShiftMode) => {
    if (next === 'custom')
      onChange({ ...moveEnd(ends, { dark: -18, light: 10 }, 'dark', -18), curve: 'smooth' });
    else if (next === 'off') onChange(allowInherit ? { dark: 0, light: 0 } : undefined);
    else onChange(undefined);
  };

  const modes: Option[] = [
    ...(allowInherit
      ? [{ value: 'inherit', label: `Inherit global (${globalActive ? 'active' : 'off'})` }]
      : []),
    { value: 'custom', label: 'Custom' },
    { value: 'off', label: 'Off' },
  ];

  // a group of fields of the form: a fieldset with no border, its legend the title of the group
  // (docs/agents/patterns/titles.md, `group`). What comes and goes with the mode stays inside
  // one box of the fieldset: Chromium, given a new child of a fieldset in the frame a select of
  // Magma changes, drops the box of that select until its style is computed again
  return (
    <fieldset class="palette-group" id={id} tabIndex={id ? -1 : undefined}>
      <legend>
        <mds-text typography="group" tag="span">
          {title}
        </mds-text>
      </legend>
      <div class="palette-group-content">
        <div class="palette-fields">
          <Field label="Mode">
            <Select
              value={mode}
              onValue={(next) => setMode(next as HueShiftMode)}
              options={modes}
            />
          </Field>
          {enabled && (
            <>
              <Field label="Curve">
                <Select
                  value={curveKind}
                  options={CURVE_KINDS.map((kind) => ({ value: kind, label: kind }))}
                  onValue={(kind) =>
                    patch({
                      curve: kind === 'custom' ? CUSTOM_CURVE_START : (kind as CurvePreset),
                    })
                  }
                />
              </Field>
              {curveKind === 'custom' && (
                <>
                  <Field label="Dead zone">
                    <Range
                      value={deadZone}
                      min={0}
                      max={0.95}
                      step={0.05}
                      label="Dead zone"
                      onValue={(next) => patch({ curve: { deadZone: next, easing } })}
                    />
                  </Field>
                  <Field label="Easing">
                    <Select
                      value={easing}
                      options={EASING_OPTIONS}
                      onValue={(next) =>
                        patch({ curve: { deadZone, easing: next as HueShiftEasing } })
                      }
                    />
                  </Field>
                </>
              )}
              {/* the two ends and their link in one box, the whole row of the fields up to the
                  width of a form: Dark above Light on tracks of one width, so the handles show
                  the link (in a column: linked; symmetric about the middle: mirror), the link in
                  the head of the box (vittorio, 2026-11-05) */}
              <div class="palette-ends" role="group" aria-labelledby={endsTitle}>
                <div class="palette-ends-head">
                  <mds-text id={endsTitle} typography="label" tag="p">
                    The two ends
                  </mds-text>
                  <Select
                    label="Ends"
                    value={ends}
                    options={HUE_ENDS}
                    onValue={(next) => {
                      setEnds(next as HueEnds);
                      // the light end takes the link at once, from the dark one
                      const aligned = moveEnd(next as HueEnds, { dark, light }, 'dark', dark);
                      if (aligned.light !== light) patch(aligned);
                    }}
                  />
                </div>
                <Field label="Dark (degrees)">
                  <Range
                    value={dark}
                    min={-180}
                    max={180}
                    label="Dark (degrees)"
                    onValue={(next) => moveTo('dark', next)}
                  />
                </Field>
                <Field label="Light (degrees)">
                  <Range
                    value={light}
                    min={-180}
                    max={180}
                    label="Light (degrees)"
                    onValue={(next) => moveTo('light', next)}
                  />
                </Field>
              </div>
              {/* the intensity of the shift per step, under the box and as wide */}
              {weights && (
                <div
                  class="palette-weights"
                  role="img"
                  aria-label="Shift intensity per step (10-step scale)"
                  title="shift intensity per step (10-step scale)"
                >
                  {weights.map((weight) => (
                    <div class="palette-weight">
                      {/* the height of a bar is the datum it draws */}
                      <div
                        class="palette-weight-fill"
                        style={{ height: `${Math.max(weight, 2)}%` }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </fieldset>
  );
}

/**
 * A labelled text field whose value is handed over when the person commits it, on Enter or on
 * leaving it (TextInput, commit "leave"): a name handed over at every key would meet the name of
 * another colour halfway and select it, and the export groups would lose the comma just typed.
 */
function CommitText({
  label,
  value,
  onCommit,
  placeholder,
  message,
  disabled,
}: {
  label: string;
  value: string;
  onCommit: (value: string) => void;
  placeholder?: string;
  message?: string;
  disabled?: boolean;
}) {
  return (
    <Field label={label} message={message}>
      <TextInput
        commit="leave"
        value={value}
        onValue={onCommit}
        placeholder={placeholder}
        disabled={disabled}
      />
    </Field>
  );
}

interface ColorEditorProps {
  color: ColorConfig;
  hasGlobalShift: boolean;
  scaleNames: string[];
  /** display label for a scale name (tags built-in-only scales) */
  labelFor: (name: string) => string;
  /** ratios scale the color resolves to when it does not override (group or default) */
  inheritedRatios: string;
  /** formula the color resolves to when it does not override (group or root) */
  inheritedFormula: string;
  /** export groups inherited from the group when the color does not set its own */
  inheritedExport: string[];
  /** this family is an alias (a reference), not a solved palette */
  isAlias: boolean;
  /** a built-in variant: retarget is allowed, but rename/delete are not */
  isBuiltin: boolean;
  /** non-alias families an alias may point at (`<group>.<name>` paths) */
  aliasTargets: string[];
  /** the source family's base color, for the read-only resolved swatch */
  resolvedColor: string | undefined;
  onChange: (patch: Partial<ColorConfig> | { hueShift: undefined }) => void;
  /** fired when the color picker is released (change, not live input) */
  onColorCommit: (hex: string) => void;
  /** a reference: opens the hue shifting of the family it points at */
  onOpenSource: () => void;
}

function ColorEditor({
  color,
  hasGlobalShift,
  scaleNames,
  labelFor,
  inheritedRatios,
  inheritedFormula,
  inheritedExport,
  isAlias,
  isBuiltin,
  aliasTargets,
  resolvedColor,
  onChange,
  onColorCommit,
  onOpenSource,
}: ColorEditorProps) {
  const exportField = (
    <CommitText
      label="Export groups"
      value={(color.export ?? []).join(', ')}
      placeholder={
        inheritedExport.length ? `inherit (${inheritedExport.join(', ')})` : 'e.g. tones, default'
      }
      onCommit={(text) => {
        const raw = text
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        onChange({ export: raw.length ? raw : undefined });
      }}
    />
  );

  // on/off settings that apply at once: switches (mds-input-switch, "Type")
  const disabledField = (
    <Check
      type="switch"
      checked={color.disabled ?? false}
      onChecked={(checked) => onChange({ disabled: checked || undefined })}
    >
      Disabled
    </Check>
  );

  // An alias family is a reference: it re-exports the source family's already
  // resolved scale, so it carries no palette-solving fields (base color, hue
  // shift, ratios, formula). The only alias-specific control is which family it
  // points at; built-in variants keep that editable but lock name/delete.
  if (isAlias) {
    const targetKnown = !!color.alias && aliasTargets.includes(color.alias);
    const references: Option[] = [
      ...(!targetKnown && color.alias
        ? [{ value: color.alias, label: `${color.alias} (missing)` }]
        : []),
      ...aliasTargets.map((name) => ({ value: name, label: name })),
    ];
    // keyed apart from the editor of an own colour, and the name of a built-in variant apart from
    // the name of another reference: mds-input-field draws the window of its message for an empty
    // message too, and a field reused with no message gets the empty string from Preact
    return (
      <div class="palette-editor" key="reference">
        <div class="palette-fields">
          <CommitText
            key={isBuiltin ? 'built-in-name' : 'name'}
            label="Name"
            value={color.name}
            disabled={isBuiltin}
            message={isBuiltin ? 'Built-in variant: it cannot be renamed' : undefined}
            onCommit={(name) => onChange({ name })}
          />
          <Field label="Reference">
            <Select
              value={color.alias ?? ''}
              options={references}
              onValue={(alias) => onChange({ alias })}
            />
          </Field>
          {/* a read-only datum: a label and its value (docs/agents/patterns/labels-and-values.md) */}
          <dl class="palette-value">
            <div>
              <mds-text typography="label" tag="dt" class="studio-muted">
                Resolves to
              </mds-text>
              <mds-text tag="dd">
                <span class="palette-resolved">
                  <span
                    class="studio-swatch"
                    style={{ background: resolvedColor ?? 'transparent' }}
                  />
                  {resolvedColor ?? 'unresolved'}
                </span>
              </mds-text>
            </div>
          </dl>
          {exportField}
          <div class="studio-row palette-switches">{disabledField}</div>
        </div>
        <mds-text tag="p" class="studio-muted">
          Reference to {color.alias}: this family re-exports the resolved scale of the source. Base
          color, hue shift, ratios and formula are defined by the source, not here.
        </mds-text>
        {/* the group a family has in this place, for a reference a banner that says where its hue
            shifting is set: an info banner, its action in the variant of the banner, strong
            (docs/agents/patterns/actions.md, banner). The action opens the group of the source and
            changes nothing in the configuration (vittorio, 2026-11-05) */}
        {targetKnown && (
          <section class="palette-group palette-group-note" aria-labelledby="palette-reference-hue">
            <mds-text id="palette-reference-hue" typography="group" tag="h3">
              Hue shifting
            </mds-text>
            <mds-banner variant="info">
              The hue shifting of a reference is the one of the family it points at, {color.alias}:
              set it there, and every reference to it follows.
              <mds-button
                slot="action"
                type="button"
                variant="info"
                tone="strong"
                label={`Open ${color.alias}`}
                onClick={onOpenSource}
              ></mds-button>
            </mds-banner>
          </section>
        )}
      </div>
    );
  }

  return (
    <div class="palette-editor" key="own">
      <div class="palette-fields">
        <CommitText label="Name" value={color.name} onCommit={(name) => onChange({ name })} />
        <Field label="Base color" message={color.color}>
          {/* until Magma has a colour field: #1260 */}
          <input
            type="color"
            class="palette-picker"
            value={color.color}
            onInput={(e) =>
              onChange({ color: (e.target as HTMLInputElement).value as ColorConfig['color'] })
            }
            onChange={(e) => onColorCommit((e.target as HTMLInputElement).value)}
          />
        </Field>
        <Field label="Ratios">
          <Select
            value={color.ratios ?? ''}
            options={[
              { value: '', label: `inherit (${inheritedRatios})` },
              ...scaleNames.map((preset) => ({ value: preset, label: labelFor(preset) })),
            ]}
            onValue={(ratios) => onChange({ ratios: ratios || undefined })}
          />
        </Field>
        <Field label="Formula">
          <Select
            value={color.formula ?? ''}
            options={[
              { value: '', label: `inherit (${inheritedFormula})` },
              { value: 'wcag2', label: 'wcag2' },
              { value: 'wcag3', label: 'wcag3' },
            ]}
            onValue={(formula) =>
              onChange({ formula: (formula || undefined) as ColorConfig['formula'] })
            }
          />
        </Field>
        <Field label="Colorspace">
          <Select
            value={color.colorspace ?? ''}
            options={[
              { value: '', label: 'inherit' },
              ...COLORSPACES.map((space) => ({ value: space, label: space })),
            ]}
            onValue={(colorspace) =>
              onChange({ colorspace: (colorspace || undefined) as ColorConfig['colorspace'] })
            }
          />
        </Field>
        {exportField}
        <div class="studio-row palette-switches">
          <Check
            type="switch"
            checked={color.smooth ?? false}
            onChecked={(checked) => onChange({ smooth: checked || undefined })}
          >
            Smooth
          </Check>
          {disabledField}
        </div>
      </div>
      <HueShiftEditor
        key={color.name}
        value={color.hueShift}
        onChange={(hueShift) => onChange({ hueShift })}
        allowInherit
        globalActive={hasGlobalShift}
        id={HUE_SHIFT_GROUP}
      />
    </div>
  );
}

interface AppProps {
  /** The view the shell routes to; without a shell the view is the App's own state. */
  view?: View;
  /** Opens a view: the shell follows its link. */
  onNavigate?: (view: View) => void;
  /** The working config, on every change: the shell judges it with the contrast gate. */
  onConfig?: (config: MagmaConfig) => void;
}

/** One line under the title of each view: what it holds. */
const VIEW_SUMMARY: Record<View, string> = {
  colors:
    'The families of colour of the configuration, each solved into a ramp of steps in light and dark.',
  scales:
    'The contrast ratios the families solve their steps at, against the background of the mode.',
  surface:
    'The families that generate surfaces, and the balances: the lightness of the surfaces and borders, the targets of the text.',
  themes:
    'Each family with surfaces is a theme: its name, its accents and the CSS that switches it in.',
  groups: 'The ratios, formula and export of each group of the configuration.',
  diff: 'The palette against the configuration Magma builds with.',
};

export function App({ view: routedView, onNavigate, onConfig }: AppProps = {}) {
  // a persisted working state, restored once at mount, takes precedence over
  // the bundled defaults
  const bootDraft = useMemo(() => readDraft() as StudioDraft<View> | null, []);
  const [config, setConfig] = useState<CloneableConfig>(() =>
    bootDraft ? bootDraft.config : clone(initialConfigJson as unknown as CloneableConfig),
  );
  const [selectedName, setSelectedName] = useState<string>(() =>
    bootDraft
      ? bootDraft.selectedName
      : defaultSelected((initialConfigJson as unknown as MagmaConfig).colors),
  );
  const [ownView, setOwnView] = useState<View>(() => bootDraft?.view ?? 'colors');
  const view = routedView ?? ownView;
  // the pages of Colors share the region that scrolls: a page opens at its top, never at the
  // scroll the page before it left there
  const content = useRef<HTMLElement>(null);
  useEffect(() => {
    if (content.current) content.current.scrollTop = 0;
  }, [view]);
  const setView = onNavigate ?? setOwnView;
  // the menus of the head of the page, closed once one of their actions ran
  const fileInput = useRef<HTMLInputElement>(null);
  const moreMenu = useRef<HTMLElement & { visible?: boolean }>(null);
  // the menu of the colour selected, closed as well once one of its actions ran
  const colorMenu = useRef<HTMLElement & { visible?: boolean }>(null);
  const closeMenus = () => {
    for (const menu of [moreMenu.current, colorMenu.current]) if (menu) menu.visible = false;
  };
  const [copied, setCopied] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  // server mode: the config is served by a command that answers /api/config
  // (the `ui` command of design-tokens 15 did; the studio's own command comes
  // with #695) and can be saved back to disk. On its own these stay inert.
  const [serverMode, setServerMode] = useState(false);
  const [savePath, setSavePath] = useState<string | null>(null);
  // why the server refuses saves (a JavaScript config or package.json), or null
  const [saveRefusal, setSaveRefusal] = useState<string | null>(null);
  // the config the draft is made on (the file on disk, or the bundled default)
  // and its JSON; null until the start-up check below has run
  const [origin, setOrigin] = useState<(DraftSource & { json: string }) | null>(null);
  // the source changed under a draft with edits of its own: the user picks one
  const [draftConflict, setDraftConflict] = useState<{
    reason: string;
    config: CloneableConfig;
    label: string;
  } | null>(null);
  // JSON of the last-persisted config; null means nothing has been saved yet
  const [savedConfig, setSavedConfig] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [scalesFormula, setScalesFormula] = useState<Formula>('wcag3');
  const [addModal, setAddModal] = useState<{
    // 'color' creates an own-palette family, 'alias' a reference to another family
    kind: 'color' | 'alias';
    color: string;
    /** alias target (`<group>.<name>`) when kind === 'alias' */
    alias: string;
    name: string;
    group: string;
    manual: boolean;
  } | null>(null);
  const [batchSelection, setBatchSelection] = useState<Set<string>>(() => new Set());
  const [batchModal, setBatchModal] = useState<{ names: string[]; initialExport: string } | null>(
    null,
  );

  const selectedIndex = config.colors.findIndex((c) => c.name === selectedName);
  const selected = selectedIndex >= 0 ? config.colors[selectedIndex] : undefined;

  const updateConfig = (mutate: (draft: CloneableConfig) => void) => {
    setConfig((prev) => {
      const draft = clone(prev);
      mutate(draft);
      return draft;
    });
  };

  const [selectedScales, selectedError] = useMemo((): [ColorScales | null, string | null] => {
    if (!selected || view !== 'colors') return [null, null];
    try {
      if (isAliasColor(selected)) {
        const source = config.colors.find((c) => c.name === selected.alias);
        if (!source) {
          return [null, `alias target "${selected.alias}" is not defined in this config`];
        }
        if (isAliasColor(source)) {
          return [
            null,
            `alias target "${selected.alias}" is itself a reference; point it at a base-color family`,
          ];
        }
        // resolve through the real generator with the source present, so the
        // alias re-export finds it; the alias scale equals the source's.
        const scales = generateScales({ ...config, colors: [source, selected] });
        return [scales.get(selected.name) ?? null, null];
      }
      const scales = generateScales(singleColorConfig(config, selected));
      return [scales.get(selected.name) ?? null, null];
    } catch (error) {
      return [null, String(error)];
    }
  }, [
    JSON.stringify(selected),
    // an alias preview also depends on its source family's palette settings
    selected && isAliasColor(selected)
      ? JSON.stringify(config.colors.find((c) => c.name === selected.alias))
      : '',
    JSON.stringify(config.hueShift),
    JSON.stringify(config.ratios),
    config.colorspace,
    config.smooth,
    config.formula,
    view,
  ]);

  const [fullScales, fullScalesError] = useMemo((): [
    Map<string, ColorScales> | null,
    string | null,
  ] => {
    if (view !== 'groups') return [null, null];
    try {
      return [generateScales(config), null];
    } catch (error) {
      return [null, String(error)];
    }
  }, [view, JSON.stringify(config)]);

  // the hue shifting of the family a reference points at, opened from the banner of the
  // reference: once the family renders, its group comes into view and takes the focus
  const openHueShiftRef = useRef(false);
  useEffect(() => {
    if (!openHueShiftRef.current) return;
    openHueShiftRef.current = false;
    const group = document.getElementById(HUE_SHIFT_GROUP);
    group?.scrollIntoView({ block: 'start' });
    group?.focus({ preventScroll: true });
  }, [selectedName]);

  // the variants first, at the top of the list: the first of them is where the work starts
  // (vittorio, 2026-11-05); the other groups in the order of the configuration
  const groups = useMemo(() => {
    const map = new Map<string, ColorConfig[]>();
    if (config.colors.some((color) => color.name.split('.')[0] === 'variant'))
      map.set('variant', []);
    config.colors.forEach((color) => {
      const group = color.name.split('.')[0];
      if (!map.has(group)) map.set(group, []);
      map.get(group)!.push(color);
    });
    return map;
  }, [config]);

  // effective ratio scales: config entries layered over the built-in ones,
  // exactly like the generator merges them. A null entry in the config is
  // the sentinel for a deleted built-in scale and is filtered out.
  const ratioSetFor = (formula: Formula): RatioSet =>
    Object.fromEntries(
      Object.entries({
        ...(DEFAULT_COLOR_CONFIG.ratios as Record<Formula, RatioSet>)[formula],
        ...(config.ratios?.[formula] ?? {}),
      }).filter(([, values]) => Array.isArray(values)),
    );
  const ratioSet = ratioSetFor(scalesFormula);
  const builtinScales = Object.keys(
    (DEFAULT_COLOR_CONFIG.ratios as Record<Formula, RatioSet>)[scalesFormula],
  );

  const scaleNamesFor = (color: ColorConfig): string[] =>
    Object.keys(ratioSetFor(resolveFormula(color, config)));

  // origin of a scale relative to the built-in defaults. Comparing stops
  // (rather than mere presence in config.ratios) keeps the tag correct even
  // though writeScale materializes untouched built-ins back into the config.
  const scaleOrigin = (formula: Formula, name: string): ScaleOrigin => {
    const builtin = (DEFAULT_COLOR_CONFIG.ratios as Record<Formula, RatioSet>)[formula]?.[name];
    if (!Array.isArray(builtin)) return 'custom';
    const current = ratioSetFor(formula)[name];
    const overridden =
      !!current &&
      (current.length !== builtin.length || current.some((value, i) => value !== builtin[i]));
    return overridden ? 'builtin-overridden' : 'builtin';
  };
  const scaleLabel = (formula: Formula, name: string): string => {
    const origin = scaleOrigin(formula, name);
    if (origin === 'builtin') return `${name} (built-in)`;
    if (origin === 'builtin-overridden') return `${name} (built-in, overridden)`;
    return name;
  };

  const writeScale = (mutate: (draftSet: RatioSet) => void) => {
    updateConfig((draft) => {
      const materialized = {
        ...(DEFAULT_COLOR_CONFIG.ratios as Record<Formula, RatioSet>)[scalesFormula],
        ...(draft.ratios?.[scalesFormula] ?? {}),
      };
      mutate(materialized);
      draft.ratios = {
        ...(draft.ratios ?? {}),
        [scalesFormula]: materialized,
      } as MagmaConfig['ratios'];
    });
  };

  const sampleScales = useMemo(() => {
    const map = new Map<string, string[]>();
    if (view !== 'scales' || !selected) return map;
    Object.keys(ratioSet).forEach((name) => {
      try {
        const sampleColor: ColorConfig = {
          ...selected,
          ratios: name,
          formula: scalesFormula,
          hueShift: undefined,
        };
        const scales = generateScales(singleColorConfig(config, sampleColor));
        map.set(
          name,
          (scales.get(selected.name)?.light ?? []).map((step) => step.value),
        );
      } catch {
        // an inconsistent scale under edit should not break the view
      }
    });
    return map;
  }, [view, scalesFormula, JSON.stringify(config), selectedName]);

  // the shell judges the working config with the contrast gate
  useEffect(() => {
    onConfig?.(config);
  }, [config]);

  // mirror the working state to localStorage on every change, stamped with
  // the config it is made on. Until the start-up check has run, and while a
  // conflict waits for an answer, the restored draft keeps its old stamp, so
  // a reload asks again instead of keeping the draft silently
  useEffect(() => {
    if (!origin) return;
    if (draftConflict) {
      writeDraft({ config, selectedName, view, source: bootDraft?.source, edited: true });
      return;
    }
    const edited = JSON.stringify(config) !== origin.json;
    writeDraft({
      config,
      selectedName,
      view,
      source: { path: origin.path, hash: origin.hash },
      edited,
    });
  }, [JSON.stringify(config), selectedName, view, origin, draftConflict]);

  // when served by a command, adopt the on-disk config and enable
  // saving; in both modes, check a restored draft against the config it was
  // made on before letting it win
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let served: {
        path: string;
        config: CloneableConfig | null;
        readOnly?: string | null;
      } | null = null;
      try {
        const res = await fetch('/api/config');
        if (res.ok) served = await res.json();
      } catch {
        // not served by a command: the source is the bundled default
      }
      if (cancelled) return;
      const fileConfig =
        served?.config && Array.isArray(served.config.colors) && served.config.colors.length > 0
          ? served.config
          : null;
      if (served) {
        setServerMode(true);
        setSavePath(served.path);
        setSaveRefusal(served.readOnly ?? null);
        // the on-disk file is always the save baseline; with no file yet, the
        // bundled default is unsaved
        setSavedConfig(fileConfig ? JSON.stringify(fileConfig) : null);
      }
      const sourceConfig = fileConfig ?? clone(initialConfigJson as unknown as CloneableConfig);
      const json = JSON.stringify(sourceConfig);
      const source: DraftSource = served
        ? { path: served.path, hash: fileConfig ? hashText(json) : null }
        : { path: null, hash: hashText(json) };
      const decision = reconcileDraft(bootDraft, source, json);
      if (decision.use === 'source' && (bootDraft || fileConfig)) {
        setConfig(sourceConfig);
        setSelectedName((name) =>
          sourceConfig.colors.some((c) => c.name === name)
            ? name
            : defaultSelected(sourceConfig.colors),
        );
      } else if (decision.use === 'ask') {
        setDraftConflict({
          reason: decision.reason,
          config: sourceConfig,
          label: fileConfig ? 'Use the file on disk' : 'Use the bundled config',
        });
      }
      setOrigin({ ...source, json });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const resolveDraftConflict = (useSource: boolean) => {
    if (!draftConflict) return;
    if (useSource) {
      const next = draftConflict.config;
      setConfig(next);
      setSelectedName((name) =>
        next.colors.some((c) => c.name === name) ? name : defaultSelected(next.colors),
      );
    }
    setDraftConflict(null);
  };

  const dirty = serverMode && JSON.stringify(config) !== savedConfig;

  // reset returns to the built-in default: it only does something when the
  // current config differs from it (edited or loaded), so disable it otherwise
  const defaultConfigString = useMemo(() => JSON.stringify(initialConfigJson), []);
  const canReset = JSON.stringify(config) !== defaultConfigString;

  const saveConfig = async () => {
    if (!serverMode || saving || saveRefusal || draftConflict) return;
    setSaving(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(config, null, 2) + '\n',
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error ?? `save failed (${res.status})`);
      }
      const written = (await res.json().catch(() => ({}))) as { path?: string };
      const json = JSON.stringify(config);
      setSavedConfig(json);
      setOrigin({ path: written.path ?? savePath, hash: hashText(json), json });
      setStatusMsg('saved');
      setTimeout(() => setStatusMsg((msg) => (msg === 'saved' ? null : msg)), 1500);
    } catch (error) {
      setStatusMsg(error instanceof Error ? error.message : 'save failed');
    } finally {
      setSaving(false);
    }
  };

  const buildTokens = async () => {
    setStatusMsg('building...');
    try {
      const res = await fetch('/api/build', { method: 'POST' });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? `build failed (${res.status})`);
      setStatusMsg('tokens generated on disk');
      setTimeout(
        () => setStatusMsg((msg) => (msg === 'tokens generated on disk' ? null : msg)),
        2000,
      );
    } catch (error) {
      setStatusMsg(error instanceof Error ? error.message : 'build failed');
    }
  };

  const copyJson = async () => {
    await navigator.clipboard.writeText(JSON.stringify(config, null, 2) + '\n');
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const loadConfigFile = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text()) as CloneableConfig;
      const { valid, errors } = validateConfig(parsed);
      if (!valid) {
        throw new Error(errors.slice(0, 3).join('; ') || 'it does not match the schema');
      }
      setConfig(parsed);
      setSelectedName(defaultSelected(parsed.colors));
      setView('colors');
      setLoadError(null);
    } catch (error) {
      setLoadError(
        `Could not load ${file.name}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

  // names assigned by the system during this session: only these (and the
  // new-N placeholders) keep following the picker; a name typed by the
  // user is never touched
  const autoNamedRef = useRef(new Set<string>());

  // when the color picker is released, colors still carrying an
  // auto-assigned name get renamed after the picked value, unique within
  // the config; a duplicate hex only raises a warning
  const autoNameColor = (index: number, hex: string) => {
    const color = config.colors[index];
    if (!color) return;
    const duplicate = config.colors.find(
      (other, i) => i !== index && !!other.color && other.color.toLowerCase() === hex.toLowerCase(),
    );
    setLoadError(duplicate ? `Warning: ${hex} is already used by "${duplicate.name}"` : null);

    const [group, baseName] = color.name.split('.');
    const autoAssigned =
      /^new(-\d+)?$/.test(baseName ?? '') || autoNamedRef.current.has(color.name);
    if (!autoAssigned) return;
    const vocabularyName = nearestColorName(hex);
    let candidate = vocabularyName;
    let suffix = 2;
    while (
      config.colors.some((other, i) => i !== index && other.name === `${group}.${candidate}`)
    ) {
      candidate = `${vocabularyName}-${suffix}`;
      suffix += 1;
    }
    const nextName = `${group}.${candidate}`;
    if (nextName === color.name) return;
    autoNamedRef.current.delete(color.name);
    autoNamedRef.current.add(nextName);
    updateConfig((draft) => {
      draft.colors[index].name = nextName;
    });
    setSelectedName(nextName);
  };

  const triggerDownload = (data: BlobPart, filename: string, type: string) => {
    const url = URL.createObjectURL(new Blob([data], { type }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const downloadJson = () =>
    triggerDownload(
      JSON.stringify(config, null, 2) + '\n',
      'magma-design-tokensrc.json',
      'application/json',
    );

  type ColorTree = Parameters<typeof cssHex>[0];

  // The whole palette plus one entry per export group; formats that respect
  // export diversification (CSS, GIMP) emit one file per entry. The whole
  // palette carries an empty suffix, groups carry "-<group>".
  const exportTrees = (
    tokens: ColorTree,
    exportGroups: Record<string, unknown>,
  ): Array<{ suffix: string; tree: ColorTree }> => [
    { suffix: '', tree: tokens },
    ...Object.keys(exportGroups).map((group) => ({
      suffix: `-${group}`,
      tree: exportGroups[group] as ColorTree,
    })),
  ];

  const cssFiles = (
    tokens: ColorTree,
    exportGroups: Record<string, unknown>,
    date: string,
  ): Record<string, string> => {
    const files: Record<string, string> = {};
    exportTrees(tokens, exportGroups).forEach(({ suffix, tree }) => {
      files[`colors-hex${suffix}.css`] = cssHex(tree, date);
      files[`colors-rgb${suffix}.css`] = cssRgb(tree, date);
    });
    return files;
  };

  const gimpFiles = (
    tokens: ColorTree,
    exportGroups: Record<string, unknown>,
  ): Record<string, string> => {
    const files: Record<string, string> = {};
    exportTrees(tokens, exportGroups).forEach(({ suffix, tree }) => {
      // the whole palette keeps the classic name, groups take the group name
      files[`${suffix ? suffix.slice(1) : 'colors'}.gpl`] = gimpPalette(tree);
    });
    return files;
  };

  // download a set of text files: a single file directly, several as a zip
  const downloadFiles = (files: Record<string, string>, zipName: string, singleType: string) => {
    const names = Object.keys(files);
    if (names.length === 1) {
      triggerDownload(files[names[0]], names[0], singleType);
      return;
    }
    const encoder = new TextEncoder();
    const zipped: Record<string, Uint8Array> = {};
    names.forEach((name) => {
      zipped[name] = encoder.encode(files[name]);
    });
    triggerDownload(zipSync(zipped), zipName, 'application/zip');
  };

  const downloadCss = () => {
    try {
      const { tokens, exportGroups } = createColorTokens(clone(config));
      downloadFiles(
        cssFiles(tokens as ColorTree, exportGroups, new Date().toUTCString()),
        'magma-css.zip',
        'text/css',
      );
      setLoadError(null);
    } catch (error) {
      setLoadError(
        `Could not build the CSS: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

  const downloadGimp = () => {
    try {
      const { tokens, exportGroups } = createColorTokens(clone(config));
      downloadFiles(gimpFiles(tokens as ColorTree, exportGroups), 'magma-gimp.zip', 'text/plain');
      setLoadError(null);
    } catch (error) {
      setLoadError(
        `Could not build the palette: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

  // DTCG color tokens for Figma: one file per theme mode, zipped together.
  // Matches the package build output (dist/json/figma-magma-colors-*.tokens.json).
  const downloadFigmaDtcg = () => {
    try {
      const { tokens } = createColorTokens(clone(config));
      const color = (tokens as ColorTree).color as unknown as ColorTokenTree;
      downloadFiles(
        {
          'figma-magma-colors-light.tokens.json':
            JSON.stringify(colorsToDtcg(color, 'light'), null, 2) + '\n',
          'figma-magma-colors-dark.tokens.json':
            JSON.stringify(colorsToDtcg(color, 'dark'), null, 2) + '\n',
        },
        'magma-figma-dtcg.zip',
        'application/json',
      );
      setLoadError(null);
    } catch (error) {
      setLoadError(
        `Could not build the Figma tokens: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

  // zip mirroring the dist output: the config, the generated JSON tokens
  // (whole palette + one file per export group, byte-for-byte the CLI files)
  // and the CSS / GIMP renders, both diversified per export group
  const downloadZip = () => {
    try {
      const { tokens, exportGroups } = createColorTokens(clone(config));
      const date = new Date().toUTCString();
      const files: Record<string, Uint8Array> = {};
      const encoder = new TextEncoder();
      const add = (path: string, text: string) => {
        files[path] = encoder.encode(text);
      };
      add('magma-design-tokensrc.json', JSON.stringify(config, null, 2) + '\n');
      // token JSON files match the generator output byte-for-byte (no newline)
      add('tokens/color/generated/base.json', JSON.stringify(tokens, null, 2));
      Object.keys(exportGroups).forEach((group) => {
        add(`tokens/color/generated/${group}.json`, JSON.stringify(exportGroups[group], null, 2));
      });
      const css = cssFiles(tokens as ColorTree, exportGroups, date);
      Object.keys(css).forEach((name) => add(`css/${name}`, css[name]));
      const gimp = gimpFiles(tokens as ColorTree, exportGroups);
      Object.keys(gimp).forEach((name) => add(`gimp/${name}`, gimp[name]));
      triggerDownload(zipSync(files), 'magma-design-tokens.zip', 'application/zip');
      setLoadError(null);
    } catch (error) {
      setLoadError(
        `Could not build the zip: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

  const toggleBatch = (name: string) =>
    setBatchSelection((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  // color names in config order, for a stable modal list
  const namesInOrder = (predicate: (color: ColorConfig) => boolean): string[] =>
    config.colors.filter(predicate).map((color) => color.name);

  const openBatch = () =>
    setBatchModal({
      names: namesInOrder((color) => batchSelection.has(color.name)),
      initialExport: '',
    });

  const selectByExport = (exportName: string) => {
    const names = namesInOrder((color) =>
      (resolveExport(color, config) ?? []).includes(exportName),
    );
    setBatchSelection(new Set(names));
    setBatchModal({ names, initialExport: exportName });
  };

  const saveBatch = (names: string[], exportList: string[] | undefined) => {
    const target = new Set(names);
    updateConfig((draft) => {
      draft.colors.forEach((color) => {
        if (!target.has(color.name)) return;
        if (exportList) color.export = exportList;
        else delete color.export;
      });
    });
    setBatchModal(null);
    setBatchSelection(new Set());
  };

  // download a zip with the generated tokens of only the selected colors
  const exportSelection = (names: string[]) => {
    try {
      const target = new Set(names);
      const subset: CloneableConfig = {
        ...clone(config),
        colors: config.colors.filter((color) => target.has(color.name)),
      };
      const { tokens, exportGroups } = createColorTokens(subset);
      const date = new Date().toUTCString();
      const files: Record<string, Uint8Array> = {};
      const encoder = new TextEncoder();
      const add = (path: string, text: string) => {
        files[path] = encoder.encode(text);
      };
      add('tokens/color/generated/base.json', JSON.stringify(tokens, null, 2));
      const css = cssFiles(tokens as ColorTree, exportGroups, date);
      Object.keys(css).forEach((name) => add(`css/${name}`, css[name]));
      const gimp = gimpFiles(tokens as ColorTree, exportGroups);
      Object.keys(gimp).forEach((name) => add(`gimp/${name}`, gimp[name]));
      triggerDownload(zipSync(files), 'magma-selection.zip', 'application/zip');
      setLoadError(null);
    } catch (error) {
      setLoadError(
        `Could not export the selection: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

  // every export name referenced by the config, for the select-by-export control
  const allExportNames = [
    ...new Set(config.colors.flatMap((color) => resolveExport(color, config) ?? [])),
  ].sort();

  // families an alias may point at: any non-alias color (one with its own base
  // palette). Shared by the alias editor and the "new reference" flow.
  const aliasTargets = config.colors.filter((color) => !isAliasColor(color)).map((c) => c.name);

  // the surfaces/groups/diff views work on the whole config, not a single
  // color, so the picker column is dropped and the content spans full width
  const showSidebar = COLOR_LIST_VIEWS.has(view);

  return (
    <div class={`layout${showSidebar ? '' : ' no-sidebar'}`}>
      {showSidebar && (
        <aside class="palette-list" aria-label="The families of colour">
          {/* the main action of the list, a part of the page: primary outline (actions.md,
              part-primary), the primary strong being Download in the head of the page. At the
              top of the list, in view on loading: at the end it sat under some thirty families,
              out of the window (vittorio, 2026-11-05). The
              buttons of the page take their text in `label`: mds-button keeps the first text of
              its slot as its label, and would not follow a text that changes */}
          <mds-button
            type="button"
            icon="mi/baseline/add"
            variant="primary"
            tone="outline"
            class="palette-add"
            label="Add color"
            onClick={() =>
              setAddModal({
                kind: 'color',
                color: '#4f8fd9',
                alias: aliasTargets[0] ?? '',
                name: nearestColorName('#4f8fd9'),
                group: 'label',
                manual: false,
              })
            }
          ></mds-button>
          {[...groups.entries()].map(([group, colors]) => (
            <div class="palette-list-group">
              <mds-text typography="part" tag="h2">
                {group}
              </mds-text>
              <ul class="palette-list-items">
                {colors.map((color) => {
                  const badge = badgeOf(config, color);
                  return (
                    <li class={`palette-item${color.disabled ? ' palette-item-off' : ''}`}>
                      {/* until Magma has a list and detail: #1262. A button of Magma per family,
                        as the links of the menus of the shell: the family shown in the detail
                        marked by aria-current and the weak tone; its swatch the icon, painted
                        with --palette-swatch (palette.css) */}
                      <mds-button
                        type="button"
                        icon="mdi/circle"
                        variant="dark"
                        tone={color.name === selectedName ? 'weak' : 'text'}
                        aria-current={color.name === selectedName ? 'true' : undefined}
                        class="palette-item-button"
                        style={{ '--palette-swatch': resolveBaseColor(config, color) }}
                        label={color.name.split('.')[1]}
                        title={badge?.title}
                        onClick={() => {
                          setSelectedName(color.name);
                          // the scales view works on the selected color: switching
                          // color must not leave it
                          if (view !== 'scales') setView('colors');
                        }}
                      ></mds-button>
                      {/* the slot of mds-button takes text only: the badge sits on the end of the
                        row, the button under it takes the click and says the badge in its title */}
                      {badge && (
                        <mds-badge
                          variant="dark"
                          tone="weak"
                          label={badge.label}
                          class="palette-item-badge"
                        ></mds-badge>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </aside>
      )}

      {/* no dismissal by a click outside nor by Esc (interaction strict): an accidental click must
          not lose the input; the X of the window and Cancel close it */}
      {addModal && (
        <mds-modal
          opened
          interaction="strict"
          aria-label={addModal.kind === 'alias' ? 'New reference' : 'New color'}
          onmdsModalClose={() => setAddModal(null)}
        >
          <mds-banner
            slot="window"
            variant="light"
            tone="box"
            dismissible
            headline={addModal.kind === 'alias' ? 'New reference' : 'New color'}
            onmdsBannerClose={() => setAddModal(null)}
          >
            <div class="studio-dialog">
              <fieldset class="palette-choice">
                <legend>
                  <mds-text typography="label" tag="span">
                    Kind
                  </mds-text>
                </legend>
                <div class="studio-row">
                  <Check
                    type="radio"
                    name="palette-new-kind"
                    value="color"
                    checked={addModal.kind === 'color'}
                    onChecked={(checked) =>
                      checked &&
                      setAddModal(
                        (state) =>
                          state && {
                            ...state,
                            kind: 'color',
                            // A2: leaving reference mode must not keep the alias-only `variant` family
                            group: state.group === 'variant' ? 'label' : state.group,
                          },
                      )
                    }
                  >
                    Own color
                  </Check>
                  <Check
                    type="radio"
                    name="palette-new-kind"
                    value="alias"
                    checked={addModal.kind === 'alias'}
                    disabled={aliasTargets.length === 0}
                    onChecked={(checked) =>
                      checked &&
                      setAddModal((state) => {
                        if (!state) return state;
                        const target = state.alias || aliasTargets[0] || '';
                        return {
                          ...state,
                          kind: 'alias',
                          alias: target,
                          // A1: a reference can only live in the alias-only `variant` family
                          group: 'variant',
                          name: state.manual ? state.name : (target.split('.')[1] ?? state.name),
                        };
                      })
                    }
                  >
                    Reference
                  </Check>
                </div>
                <mds-text typography="caption" tag="p" class="studio-muted">
                  {aliasTargets.length === 0
                    ? 'No base-color family to reference yet.'
                    : 'A reference follows another family instead of solving a palette.'}
                </mds-text>
              </fieldset>
              {addModal.kind === 'color' ? (
                // keyed apart: the field of the picker has a message, the select none
                <Field key="color" label="Color" message={addModal.color}>
                  {/* until Magma has a colour field: #1260 */}
                  <input
                    type="color"
                    class="palette-picker palette-picker-large"
                    value={addModal.color}
                    onInput={(e) => {
                      const hex = (e.target as HTMLInputElement).value;
                      setAddModal(
                        (state) =>
                          state && {
                            ...state,
                            color: hex,
                            name: state.manual ? state.name : nearestColorName(hex),
                          },
                      );
                    }}
                  />
                </Field>
              ) : (
                <Field key="references" label="References">
                  <Select
                    value={addModal.alias}
                    options={aliasTargets.map((name) => ({ value: name, label: name }))}
                    onValue={(target) =>
                      setAddModal(
                        (state) =>
                          state && {
                            ...state,
                            alias: target,
                            name: state.manual ? state.name : (target.split('.')[1] ?? state.name),
                          },
                      )
                    }
                  />
                </Field>
              )}
              <Field label="Group">
                <Select
                  // A1: references are locked to the alias-only `variant` family
                  value={addModal.kind === 'alias' ? 'variant' : addModal.group}
                  disabled={addModal.kind === 'alias'}
                  options={[...new Set([...groups.keys(), 'label', 'variant'])]
                    // A2: an own color can never live in the alias-only `variant` family
                    .filter((group) => addModal.kind === 'alias' || group !== 'variant')
                    .map((group) => ({ value: group, label: group }))}
                  onValue={(group) => setAddModal((state) => state && { ...state, group })}
                />
              </Field>
              <Field label="Name">
                <TextInput
                  value={addModal.name}
                  // a name the person types stops following the picker; the echo of a name the
                  // studio sets never reaches here (magma.tsx)
                  onValue={(name) =>
                    setAddModal((state) => state && { ...state, name, manual: true })
                  }
                />
              </Field>
              <div class="studio-row palette-new-preview">
                <span
                  class="studio-swatch"
                  style={{
                    background:
                      addModal.kind === 'alias'
                        ? (config.colors.find((c) => c.name === addModal.alias)?.color ??
                          'transparent')
                        : addModal.color,
                  }}
                />
                <mds-text typography="snippet" tag="code">
                  {`${addModal.group}.${addModal.name}`}
                </mds-text>
                <mds-text typography="snippet" tag="code" class="studio-muted">
                  {addModal.kind === 'alias' ? `-> ${addModal.alias}` : addModal.color}
                </mds-text>
              </div>
            </div>
            <mds-button
              slot="action"
              type="button"
              variant="dark"
              tone="outline"
              label="Cancel"
              onClick={() => setAddModal(null)}
            ></mds-button>
            <mds-button
              slot="action"
              type="button"
              disabled={!addModal.name.trim() || (addModal.kind === 'alias' && !addModal.alias)}
              label={addModal.kind === 'alias' ? 'Add reference' : 'Add color'}
              onClick={() => {
                const base = addModal.name.trim();
                let candidate = base;
                let suffix = 2;
                while (config.colors.some((c) => c.name === `${addModal.group}.${candidate}`)) {
                  candidate = `${base}-${suffix}`;
                  suffix += 1;
                }
                const fullName = `${addModal.group}.${candidate}`;
                const { kind, alias: aliasTarget, color: colorHex, manual } = addModal;
                if (kind === 'color' && !manual) autoNamedRef.current.add(fullName);
                updateConfig((draft) => {
                  // color XOR alias: emit exactly one of the two fields
                  draft.colors.push(
                    (kind === 'alias'
                      ? { name: fullName, alias: aliasTarget }
                      : { name: fullName, color: colorHex }) as ColorConfig,
                  );
                });
                setSelectedName(fullName);
                setView('colors');
                setAddModal(null);
              }}
            ></mds-button>
          </mds-banner>
        </mds-modal>
      )}

      <main class="content" ref={content}>
        {/* the head of the page and what keeps the configuration from loading or saving: the
            first things of the region that scrolls, so they scroll with the page, and on a page
            with the list of the families they head the larger column, not the whole width */}
        <header class="studio-page-head">
          <div class="studio-page-title">
            <mds-text typography="page" tag="h1">
              {COLORS_PAGES.find((page) => page.id === view)?.label}
            </mds-text>
            <mds-text typography="detail" tag="p" class="studio-muted">
              {VIEW_SUMMARY[view]}
            </mds-text>
          </div>
          {/* the actions of the page (the page-header block of Magma): the menu of the others
              first, the secondary used most, the main one last in the strong tone */}
          <div class="studio-page-actions">
            {statusMsg && (
              <mds-text typography="caption" tag="span" class="studio-muted" role="status">
                {statusMsg}
              </mds-text>
            )}
            <mds-button
              id="studio-more"
              icon="mi/baseline/more-horiz"
              variant="dark"
              tone="text"
              aria-label="More actions"
            ></mds-button>
            <input
              ref={fileInput}
              type="file"
              accept=".json,application/json"
              hidden
              onChange={(e) => {
                const input = e.target as HTMLInputElement;
                const file = input.files?.[0];
                if (file) loadConfigFile(file);
                input.value = '';
              }}
            />
            {/* the texts that change go in `label`: mds-button reads its slotted text only once */}
            {serverMode ? (
              saveRefusal ? (
                <mds-button
                  variant="dark"
                  tone="outline"
                  disabled
                  title={saveRefusal}
                  label={dirty ? 'Read-only *' : 'Read-only'}
                ></mds-button>
              ) : (
                <mds-button
                  variant="dark"
                  tone="outline"
                  onClick={saveConfig}
                  disabled={saving || !dirty || !!draftConflict}
                  title={savePath ?? undefined}
                  label={saving ? 'Saving...' : dirty ? 'Save *' : 'Saved'}
                ></mds-button>
              )
            ) : (
              <mds-button
                variant="dark"
                tone="outline"
                onClick={copyJson}
                label={copied ? 'Copied!' : 'Copy JSON'}
              ></mds-button>
            )}
            {/* the main action of the page: the zip of every token, the other downloads in the
                menu of its split button (vittorio, 2026-11-05) */}
            <mds-button-dropdown
              icon="mi/outline/file-download"
              label="Download all tokens (zip)"
              onmdsButtonDropdownClick={downloadZip}
            >
              {[
                { label: 'Figma tokens (DTCG)', run: downloadFigmaDtcg },
                { label: 'Config (json)', run: downloadJson },
                { label: 'CSS tokens', run: downloadCss },
                { label: 'GIMP palette', run: downloadGimp },
                ...(serverMode ? [{ label: 'Build tokens on disk', run: buildTokens }] : []),
              ].map((item) => (
                <mds-button
                  type="button"
                  variant="dark"
                  tone="text"
                  class="studio-menu-link"
                  label={item.label}
                  onClick={item.run}
                ></mds-button>
              ))}
            </mds-button-dropdown>
          </div>
          <mds-dropdown
            ref={moreMenu}
            target="#studio-more"
            placement="bottom-end"
            strategy="fixed"
          >
            <div class="studio-dropdown">
              <mds-button
                icon="mi/baseline/restart-alt"
                variant="dark"
                tone="text"
                class="studio-menu-link"
                title="discard the loaded config and any local changes, back to the built-in default"
                disabled={!canReset}
                onClick={() => {
                  closeMenus();
                  clearDraft();
                  const base = clone(initialConfigJson as unknown as CloneableConfig);
                  setConfig(base);
                  setSelectedName(defaultSelected(base.colors));
                  setView('colors');
                  setLoadError(null);
                }}
              >
                Reset
              </mds-button>
              <mds-button
                icon="mi/baseline/upload-file"
                variant="dark"
                tone="text"
                class="studio-menu-link"
                onClick={() => {
                  closeMenus();
                  fileInput.current?.click();
                }}
              >
                Load config
              </mds-button>
            </div>
          </mds-dropdown>
        </header>

        {/* what keeps the configuration from loading or saving, above the page */}
        {loadError ? (
          <mds-banner class="studio-notice" variant="error">
            {loadError}
          </mds-banner>
        ) : draftConflict ? (
          <mds-banner class="studio-notice draft-conflict" variant="warning">
            {draftConflict.reason}, and the draft restored from this browser has edits of its own.
            <mds-button
              slot="action"
              type="button"
              variant="dark"
              tone="outline"
              label={draftConflict.label}
              onClick={() => resolveDraftConflict(true)}
            ></mds-button>
            <mds-button
              slot="action"
              type="button"
              label="Keep the draft"
              onClick={() => resolveDraftConflict(false)}
            ></mds-button>
          </mds-banner>
        ) : (
          saveRefusal && (
            <mds-banner class="studio-notice" variant="info">
              Saving is off: {saveRefusal}
            </mds-banner>
          )
        )}

        {view === 'colors' && selected && (
          <div class="palette-detail-frame">
            <div class="palette-detail">
              <div class="palette-title-row">
                <mds-text id="palette-color-title" typography="section" tag="h2">
                  {selected.name}
                </mds-text>
                {/* the actions of the family in its menu, Delete last after a separator
                    (docs/agents/patterns/actions.md, destructive-in-menu) */}
                <mds-button
                  id="palette-color-actions"
                  type="button"
                  icon="mi/baseline/more-vert"
                  variant="dark"
                  tone="text"
                  aria-label={`Actions of ${selected.name}`}
                ></mds-button>
              </div>
              {/* the ramps of the family, beside its fields and the settings of the whole
                configuration, in view of every control that changes them (palette.css) */}
              <Preview scales={selectedScales} error={selectedError} />
              <section class="palette-color" aria-labelledby="palette-color-title">
                <ColorEditor
                  color={selected}
                  hasGlobalShift={config.hueShift !== undefined}
                  scaleNames={scaleNamesFor(selected)}
                  labelFor={(name) => scaleLabel(resolveFormula(selected, config), name)}
                  inheritedRatios={resolveRatiosName({ ...selected, ratios: undefined }, config)}
                  inheritedFormula={resolveFormula({ ...selected, formula: undefined }, config)}
                  inheritedExport={config.groups?.[selected.name.split('.')[0]]?.export ?? []}
                  isAlias={isAliasColor(selected)}
                  isBuiltin={BUILTIN_ALIAS_NAMES.has(selected.name)}
                  aliasTargets={aliasTargets}
                  resolvedColor={resolveBaseColor(config, selected)}
                  onColorCommit={(hex) => autoNameColor(selectedIndex, hex)}
                  onOpenSource={() => {
                    if (!selected.alias) return;
                    openHueShiftRef.current = true;
                    setSelectedName(selected.alias);
                  }}
                  onChange={(patch) => {
                    // a name typed by the user opts the color out of auto-naming
                    if ('name' in patch) autoNamedRef.current.delete(selected.name);
                    updateConfig((draft) => {
                      const target = draft.colors[selectedIndex] as Record<string, unknown>;
                      Object.entries(patch).forEach(([key, value]) => {
                        if (value === undefined) delete target[key];
                        else target[key] = value;
                      });
                      // keep the schema's color XOR alias invariant: a family carries
                      // EITHER its own base color OR a reference, never both
                      if ('alias' in patch && patch.alias) delete target.color;
                      if ('color' in patch && patch.color) delete target.alias;
                      if ('name' in patch && typeof patch.name === 'string')
                        setSelectedName(patch.name);
                    });
                  }}
                />
              </section>
              <mds-dropdown
                ref={colorMenu}
                target="#palette-color-actions"
                placement="bottom-start"
                strategy="fixed"
              >
                <div class="studio-dropdown">
                  <mds-button
                    type="button"
                    icon="mi/baseline/content-copy"
                    variant="dark"
                    tone="text"
                    class="studio-menu-link"
                    label="Duplicate"
                    onClick={() => {
                      closeMenus();
                      updateConfig((draft) => {
                        const source = draft.colors[selectedIndex];
                        const copy = clone(source);
                        copy.name = `${source.name}-copy`;
                        draft.colors.splice(selectedIndex + 1, 0, copy);
                        setSelectedName(copy.name);
                      });
                    }}
                  ></mds-button>
                  <mds-separator></mds-separator>
                  <mds-button
                    type="button"
                    icon="mi/baseline/delete"
                    variant="error"
                    tone="text"
                    class="studio-menu-link"
                    label="Delete color"
                    disabled={BUILTIN_ALIAS_NAMES.has(selected.name)}
                    title={
                      BUILTIN_ALIAS_NAMES.has(selected.name)
                        ? 'built-in variant: cannot be deleted'
                        : undefined
                    }
                    onClick={() => {
                      closeMenus();
                      updateConfig((draft) => {
                        draft.colors.splice(selectedIndex, 1);
                        setSelectedName(draft.colors[0]?.name ?? '');
                      });
                    }}
                  ></mds-button>
                </div>
              </mds-dropdown>
              {/* the settings of the family apart from the ones of the whole configuration
                (vittorio, 2026-11-05) */}
              <mds-separator></mds-separator>
              {/* the settings of the whole configuration, closed at first: the page opens on the family
                and its own hue shifting, not on the global one with the same fields (vittorio,
                2026-11-05) */}
              <mds-details class="palette-global">
                <mds-text slot="title" typography="part" tag="span">
                  Global settings
                </mds-text>
                <div class="palette-editor">
                  <div class="palette-fields">
                    <Field label="Colorspace">
                      <Select
                        value={config.colorspace ?? 'HSL'}
                        options={COLORSPACES.map((space) => ({ value: space, label: space }))}
                        onValue={(colorspace) =>
                          updateConfig((draft) => {
                            draft.colorspace = colorspace;
                          })
                        }
                      />
                    </Field>
                    <div class="studio-row palette-switches">
                      <Check
                        type="switch"
                        checked={config.smooth ?? false}
                        onChecked={(checked) =>
                          updateConfig((draft) => {
                            draft.smooth = checked;
                          })
                        }
                      >
                        Smooth
                      </Check>
                    </div>
                  </div>
                  <HueShiftEditor
                    title="Global hue shifting"
                    value={config.hueShift}
                    onChange={(hueShift) =>
                      updateConfig((draft) => {
                        if (hueShift === undefined)
                          delete (draft as Record<string, unknown>).hueShift;
                        else draft.hueShift = hueShift;
                      })
                    }
                  />
                </div>
              </mds-details>
            </div>
          </div>
        )}
        {view === 'scales' && (
          <ScalesManager
            config={config}
            formula={scalesFormula}
            ratioSet={ratioSet}
            builtinScales={builtinScales}
            sampleScales={sampleScales}
            selectedName={selectedName}
            labelFor={(name) => scaleLabel(scalesFormula, name)}
            originFor={(name) => scaleOrigin(scalesFormula, name)}
            onSelectColor={setSelectedName}
            onFormulaChange={setScalesFormula}
            onChangeScale={(name, values) =>
              writeScale((draftSet) => {
                draftSet[name] = values;
              })
            }
            onRenameScale={(name, nextName) => {
              if (!nextName || nextName === name || ratioSet[nextName]) return;
              writeScale((draftSet) => {
                draftSet[nextName] = draftSet[name];
                delete draftSet[name];
              });
              updateConfig((draft) => {
                draft.colors.forEach((color) => {
                  if (color.ratios === name) color.ratios = nextName;
                });
                Object.values(draft.groups ?? {}).forEach((group) => {
                  if (group.ratios === name) group.ratios = nextName;
                });
              });
            }}
            onAddScale={(copyFrom) => {
              let index = 1;
              while (ratioSet[`custom-${index}`]) index += 1;
              writeScale((draftSet) => {
                draftSet[`custom-${index}`] = [...(draftSet[copyFrom] ?? draftSet.default)];
              });
            }}
            onDeleteScale={(name) => {
              // colors and groups using the deleted scale fall back to the
              // mandatory default
              updateConfig((draft) => {
                draft.colors.forEach((color) => {
                  const colorFormula = color.formula ?? draft.formula ?? 'wcag3';
                  if (colorFormula === scalesFormula && color.ratios === name) {
                    delete color.ratios;
                  }
                });
                Object.values(draft.groups ?? {}).forEach((group) => {
                  if (group.ratios === name) delete group.ratios;
                });
              });
              writeScale((draftSet) => {
                if (builtinScales.includes(name)) {
                  // built-ins are merged back by the generator: a null entry
                  // in the config marks them as deleted
                  (draftSet as Record<string, unknown>)[name] = null;
                } else {
                  delete draftSet[name];
                }
              });
            }}
          />
        )}
        {view === 'surface' && (
          <>
            <SurfaceManager
              config={config}
              onToggleSurface={(colorName, on) =>
                updateConfig((draft) => {
                  const color = draft.colors.find((c) => c.name === colorName);
                  if (!color) return;
                  // With a group-level default in play, "off" is not always the
                  // absence of the key: unchecking a family whose GROUP opts in
                  // has to write an explicit `false`, otherwise it would just
                  // inherit the group straight back. When the group is silent,
                  // deleting the key keeps the config clean as before.
                  const groupOn = Boolean(draft.groups?.[colorName.split('.')[0]]?.surface);
                  if (on) (color as ColorConfig).surface = true;
                  else if (groupOn) (color as ColorConfig).surface = false;
                  else delete (color as Record<string, unknown>).surface;
                })
              }
              onToggleGroupSurface={(groupName, on) =>
                updateConfig((draft) => {
                  const groups = { ...(draft.groups ?? {}) };
                  const group = { ...(groups[groupName] ?? {}) };
                  if (on) group.surface = true;
                  else delete (group as Record<string, unknown>).surface;
                  // drop a group entry that carries nothing else, so toggling on
                  // and back off leaves the config byte-identical
                  if (Object.keys(group).length === 0) delete groups[groupName];
                  else groups[groupName] = group;
                  if (Object.keys(groups).length === 0) delete draft.groups;
                  else draft.groups = groups;
                  // a family-level `false` only exists to escape a group that opts
                  // in; once the group is off it is noise, so clear it
                  if (!on) {
                    draft.colors.forEach((color) => {
                      if (color.name.split('.')[0] === groupName && color.surface === false) {
                        delete color.surface;
                      }
                    });
                  }
                })
              }
              onUpdateTheme={(mutate) =>
                updateConfig((draft) => {
                  if (!draft.theme) {
                    draft.theme = JSON.parse(JSON.stringify(DEFAULT_THEME)) as ThemeConfig;
                  }
                  mutate(draft.theme);
                })
              }
            />
          </>
        )}
        {/* Themes are DERIVED from the surfaces opt-in of the view above - same axis, one step down. */}
        {view === 'themes' && <ThemesManager config={config} />}
        {view === 'groups' && (
          <GroupsManager
            config={config}
            groups={groups}
            scaleNamesFor={(formula) => Object.keys(ratioSetFor(formula))}
            labelFor={scaleLabel}
            preview={fullScales}
            previewError={fullScalesError}
            onUpdateGroup={(groupName, patch) =>
              updateConfig((draft) => {
                const cleaned: GroupConfig = {};
                if (patch.ratios !== undefined) cleaned.ratios = patch.ratios;
                if (patch.formula !== undefined) cleaned.formula = patch.formula;
                if (patch.export !== undefined) cleaned.export = patch.export;
                const nextGroups = { ...(draft.groups ?? {}) };
                if (Object.keys(cleaned).length === 0) delete nextGroups[groupName];
                else nextGroups[groupName] = cleaned;
                if (Object.keys(nextGroups).length === 0)
                  delete (draft as Record<string, unknown>).groups;
                else draft.groups = nextGroups;
              })
            }
            selected={batchSelection}
            onToggleSelect={toggleBatch}
            exportNames={allExportNames}
            onSelectByExport={selectByExport}
            onOpenBatch={openBatch}
          />
        )}
        {view === 'diff' && <DiffView config={config} />}
      </main>

      {batchModal && (
        <BatchExportModal
          names={batchModal.names}
          config={config}
          initialExport={batchModal.initialExport}
          onSave={saveBatch}
          onExport={exportSelection}
          onClose={() => setBatchModal(null)}
        />
      )}
    </div>
  );
}
