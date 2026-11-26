import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import initialConfigJson from '@maggioli-design-system/design-tokens/.magma-design-tokensrc.json';
import type {
  ColorConfig,
  Formula,
  MagmaConfig,
} from '@maggioli-design-system/design-tokens/src/lib/color.mjs';
import {
  resolveExport,
  resolveFormula,
  resolveRatiosName,
} from '@maggioli-design-system/design-tokens/src/lib/color.mjs';
import { COLORSPACES } from '@maggioli-design-system/design-tokens/src/lib/schema.mjs';
import { GroupsManager } from './groups.js';
import { DiffView } from './diff.js';
import { BatchExportModal } from './batch.js';
import {
  CURVE_PRESETS,
  hasHueShift,
  resolveCurveWeights,
  type HueShiftConfig,
  type HueShiftEasing,
} from '@maggioli-design-system/design-tokens/src/lib/hue-shift.mjs';
import { hasSaturation } from '@maggioli-design-system/design-tokens/src/lib/saturation.mjs';
import {
  generateScales,
  singleColorConfig,
  type ColorScales,
  type Step,
} from './engine/generator.js';
import { ScalesManager, type ScaleOrigin } from './scales.js';
import { SurfaceManager } from './surfaces.js';
import { COLORS_PAGES, type ColorsView } from './shared/routes/routes.js';
import { ThemesManager } from './themes.js';
import { ContrastCheck } from './contrast.js';
import { GateBadge } from './shared/ui/verdict.js';
import { nearestColorName } from './engine/color-names.js';
import { reasonText } from './state/draft.js';
import { clone, say, useStudio, type ExportAction } from './state/studio.js';
import {
  addFamily,
  autoNameFamily,
  deleteFamily,
  duplicateFamily,
  patchFamily,
  selectFamily,
  setGlobal,
} from './state/palette.js';
import {
  addScale,
  builtinScalesOf,
  changeScale,
  deleteScale,
  renameScale,
  scalesOf,
  type RatioSet,
} from './state/scales.js';
import { toggleGroupSurface, toggleSurface, updateBalances } from './state/surfaces.js';
import { setExports, updateGroup } from './state/groups.js';
import { exportSelection, guard } from './state/exports.js';
import { resetWork, resolveConflict, saveConfig } from './state/work.js';
import {
  Check,
  ColorInput,
  Field,
  Range,
  Select,
  TextInput,
  type Option,
} from './shared/magma/magma.js';
import { HUE_ENDS, endsOf, moveEnd, type HueEnds } from './engine/hue-ends.js';
import { PaletteSide } from './palette-side.js';
import { msg, useT, type T } from './shared/i18n/i18n.js';
import './palette.css';
import {
  CURVE_KINDS,
  CUSTOM_CURVE_START,
  EASING_OPTIONS,
  type CurveKind,
  type CurvePreset,
} from './curves.js';
import { SaturationEditor } from './saturation-editor.js';
import { MARK, colorspaceVerdict, type ColorspaceVerdict } from './colorspace-verdict.js';

// the views of the Colors section of the studio (shared/routes/routes.ts); 'surface' keeps its id so the
// drafts saved before the views were split keep working
type View = ColorsView;

// the color list on the left drives only the per-color views (edit a color,
// sample its contrast scales). Surfaces, groups and diff operate on the whole
// config, so the column - and its always-present selection - is hidden there.
const COLOR_LIST_VIEWS = new Set<View>(['colors', 'scales']);

/** A configuration with no saturation curve, global or of a family: the ramps before the curve. */
function withoutSaturation(config: MagmaConfig): MagmaConfig {
  const flat = clone(config);
  delete flat.saturation;
  flat.colors.forEach((color) => delete color.saturation);
  return flat;
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
// one it inherits (hs); then, the same way, a saturation curve (sat+, sat, #1439), the two side by
// side; nothing
function badgeOf(
  t: T,
  config: MagmaConfig,
  color: ColorConfig,
): { label: string; title: string } | undefined {
  if (isAliasColor(color)) return { label: 'ref', title: `alias -> ${color.alias}` };
  const parts: { label: string; title: string }[] = [];
  if (hasHueShift(color.hueShift) && hasHueShift(config.hueShift))
    parts.push({ label: 'hs+', title: t('hue shifting of its own, over the global one') });
  else if (hasHueShift(color.hueShift ?? config.hueShift))
    parts.push({ label: 'hs', title: t('hue shifting active') });
  if (hasSaturation(color.saturation) && hasSaturation(config.saturation))
    parts.push({ label: 'sat+', title: t('saturation curve of its own, over the global one') });
  else if (hasSaturation(color.saturation ?? config.saturation))
    parts.push({ label: 'sat', title: t('saturation curve active') });
  if (parts.length === 0) return undefined;
  return {
    label: parts.map((part) => part.label).join(' '),
    title: parts.map((part) => part.title).join('; '),
  };
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
  const t = useT();
  return (
    <div class="scale-row">
      <span class="scale-label">{label}</span>
      <div class="scale-cells">
        {steps.map((step) => (
          <div
            class="scale-cell"
            style={{ background: step.value }}
            title={t('{value} - contrast {ratio}:1', {
              value: step.value,
              ratio: step.contrast.toFixed(2),
            })}
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
          <div
            class="scale-cell seed"
            style={{ background: seed }}
            title={t('color token: {value}', { value: seed })}
          >
            <span class="cell-hex" style={{ color: textColorFor(seed) }}>
              {t('seed')}
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
  const t = useT();
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
        <ScaleRow label={t('light')} steps={scales.light} seed={scales.lightColor} />
      </div>
      <div class="preview-card dark">
        <ScaleRow label={t('dark')} steps={scales.dark} seed={scales.darkColor} />
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
  /** The id of the group, unique on the page: the family and the global one share it. */
  id?: string;
  /**
   * The title of the group: the one of the whole configuration says so, apart from the one of
   * the family on the same page (vittorio, 2026-11-05)
   */
  title?: string;
}

/** The group of the hue shifting of the family selected. */
const HUE_SHIFT_GROUP = 'palette-hue-shift';

/**
 * The title of the family selected: Edit, in the banner of a reference, opens the source and gives
 * its title the focus (tabindex -1), the next Tab reaching the actions of the family, then its
 * fields.
 */
const FAMILY_TITLE = 'palette-color-title';

/** The group of the saturation curve of the family selected, under its hue shifting. */
const SATURATION_GROUP = 'palette-saturation';

function HueShiftEditor({
  value,
  onChange,
  allowInherit,
  globalActive,
  id,
  title,
}: HueShiftEditorProps) {
  const t = useT();
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
      ? [
          {
            value: 'inherit',
            label: globalActive ? t('Inherit global (active)') : t('Inherit global (off)'),
          },
        ]
      : []),
    { value: 'custom', label: t('Custom') },
    { value: 'off', label: t('Off') },
  ];

  // a group of fields of the form: a fieldset with no border, its legend the title of the group
  // (docs/agents/patterns/titles.md, `group`). What comes and goes with the mode stays inside
  // one box of the fieldset: Chromium, given a new child of a fieldset in the frame a select of
  // Magma changes, drops the box of that select until its style is computed again
  return (
    <fieldset class="palette-group" id={id}>
      <legend>
        <mds-text typography="group" tag="span">
          {title ?? t('Hue shifting')}
        </mds-text>
      </legend>
      <div class="palette-group-content">
        <div class="palette-fields">
          <Field label={t('Mode')}>
            <Select
              value={mode}
              onValue={(next) => setMode(next as HueShiftMode)}
              options={modes}
            />
          </Field>
          {enabled && (
            <>
              <Field label={t('Curve')}>
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
                  <Field label={t('Dead zone')}>
                    <Range
                      value={deadZone}
                      min={0}
                      max={0.95}
                      step={0.05}
                      label={t('Dead zone')}
                      onValue={(next) => patch({ curve: { deadZone: next, easing } })}
                    />
                  </Field>
                  <Field label={t('Easing')}>
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
                    {t('The two ends')}
                  </mds-text>
                  <Select
                    label={t('Ends')}
                    value={ends}
                    options={HUE_ENDS.map((one) => ({ ...one, label: t(one.label) }))}
                    onValue={(next) => {
                      setEnds(next as HueEnds);
                      // the light end takes the link at once, from the dark one
                      const aligned = moveEnd(next as HueEnds, { dark, light }, 'dark', dark);
                      if (aligned.light !== light) patch(aligned);
                    }}
                  />
                </div>
                <Field label={t('Dark (degrees)')}>
                  <Range
                    value={dark}
                    min={-180}
                    max={180}
                    label={t('Dark (degrees)')}
                    onValue={(next) => moveTo('dark', next)}
                  />
                </Field>
                <Field label={t('Light (degrees)')}>
                  <Range
                    value={light}
                    min={-180}
                    max={180}
                    label={t('Light (degrees)')}
                    onValue={(next) => moveTo('light', next)}
                  />
                </Field>
              </div>
              {/* the intensity of the shift per step, under the box and as wide */}
              {weights && (
                <div
                  class="palette-weights"
                  role="img"
                  aria-label={t('Shift intensity per step (10-step scale)')}
                  title={t('shift intensity per step (10-step scale)')}
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
  /** how the colorspace of the family holds its seed, in the message of its field (#1454) */
  colorspaceVerdict: ColorspaceVerdict | null;
  /** colorspace the color resolves to when it does not set its own (root) */
  inheritedColorspace: string;
  hasGlobalShift: boolean;
  hasGlobalSaturation: boolean;
  /** the light ramp of the family before any saturation curve and with them (SaturationEditor) */
  saturationBefore: Step[] | null;
  saturationAfter: Step[] | null;
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
  onChange: (
    patch: Partial<ColorConfig> | { hueShift: undefined } | { saturation: undefined },
  ) => void;
  /** fired with each colour of the colour field, after onChange: a code typed, a step of a pick */
  onColorCommit: (hex: string) => void;
  /** a reference: opens the family it points at, its title focused */
  onOpenSource: () => void;
}

// the mark of a colorspace before its name in the select of a family, from the grades of the verdict
const marker =
  (verdict: ColorspaceVerdict | null) =>
  (space: string): string => {
    const grade = verdict?.grades[space];
    // an en space, which the closed select keeps beside the emoji where a plain one reads as none
    return grade ? `${MARK[grade]}\u2002` : '';
  };

function ColorEditor({
  color,
  colorspaceVerdict: verdict,
  inheritedColorspace,
  hasGlobalShift,
  hasGlobalSaturation,
  saturationBefore,
  saturationAfter,
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
  const t = useT();
  const markOf = marker(verdict);
  // each option marked with the grade of the ramp of this colour in that colorspace, the one it
  // inherits included: an option holds text only (vittorio, 2026-11-18)
  const colorspaceOptions: Option[] = [
    {
      value: '',
      label: `${markOf(inheritedColorspace)}${t('inherit ({value})', { value: inheritedColorspace })}`,
    },
    ...COLORSPACES.map((space) => ({ value: space, label: `${markOf(space)}${space}` })),
  ];
  const exportField = (
    <CommitText
      label={t('Export groups')}
      value={(color.export ?? []).join(', ')}
      placeholder={
        inheritedExport.length
          ? t('inherit ({value})', { value: inheritedExport.join(', ') })
          : t('e.g. tones, default')
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
      {t('Disabled')}
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
        ? [{ value: color.alias, label: t('{name} (missing)', { name: color.alias }) }]
        : []),
      ...aliasTargets.map((name) => ({ value: name, label: name })),
    ];
    // keyed apart from the editor of an own colour, and the name of a built-in variant apart from
    // the name of another reference: mds-input-field draws the window of its message for an empty
    // message too, and a field reused with no message gets the empty string from Preact
    return (
      <div class="palette-editor" key="reference">
        {/* what a reference does not set, said once at the top of its editor with the one action
            that edits it: an info banner, its action in the variant of the banner, strong
            (docs/agents/patterns/actions.md, banner). The action opens the source and changes
            nothing in the configuration (vittorio, 2026-11-18: one action to the linked colour
            avoids looking for Smooth or the hue shifting on a variant, which has neither) */}
        {targetKnown && (
          <mds-banner variant="info" class="palette-reference-note">
            {t(
              '{name} is a reference to {source}: its ramp is the one of the source. Base color, colorspace, "Smooth", hue shifting, saturation, ratios and formula are set on {source}, and every reference to it follows.',
              { name: color.name, source: color.alias ?? '' },
            )}
            <mds-button
              slot="action"
              type="button"
              variant="info"
              tone="strong"
              label={t('Edit {name}', { name: color.alias ?? '' })}
              onClick={onOpenSource}
            ></mds-button>
          </mds-banner>
        )}
        <div class="palette-fields">
          <CommitText
            key={isBuiltin ? 'built-in-name' : 'name'}
            label={t('Name')}
            value={color.name}
            disabled={isBuiltin}
            message={isBuiltin ? t('Built-in variant: it cannot be renamed') : undefined}
            onCommit={(name) => onChange({ name })}
          />
          <Field label={t('Reference')}>
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
                {t('Resolves to')}
              </mds-text>
              <mds-text tag="dd">
                <span class="palette-resolved">
                  <span
                    class="studio-swatch"
                    style={{ background: resolvedColor ?? 'transparent' }}
                  />
                  {resolvedColor ?? t('unresolved')}
                </span>
              </mds-text>
            </div>
          </dl>
          {exportField}
          <div class="studio-row palette-switches">{disabledField}</div>
        </div>
      </div>
    );
  }

  return (
    <div class="palette-editor" key="own">
      <div class="palette-fields">
        <CommitText label={t('Name')} value={color.name} onCommit={(name) => onChange({ name })} />
        <Field label={t('Base color')}>
          <ColorInput
            value={color.color}
            onValue={(hex) => {
              onChange({ color: hex as ColorConfig['color'] });
              onColorCommit(hex);
            }}
          />
        </Field>
        <Field label={t('Ratios')}>
          <Select
            value={color.ratios ?? ''}
            options={[
              { value: '', label: t('inherit ({value})', { value: inheritedRatios }) },
              ...scaleNames.map((preset) => ({ value: preset, label: labelFor(preset) })),
            ]}
            onValue={(ratios) => onChange({ ratios: ratios || undefined })}
          />
        </Field>
        <Field label={t('Formula')}>
          <Select
            value={color.formula ?? ''}
            options={[
              { value: '', label: t('inherit ({value})', { value: inheritedFormula }) },
              { value: 'wcag2', label: 'wcag2' },
              { value: 'wcag3', label: 'wcag3' },
            ]}
            onValue={(formula) =>
              onChange({ formula: (formula || undefined) as ColorConfig['formula'] })
            }
          />
        </Field>
        <Field
          label={t('Colorspace')}
          message={verdict?.message}
          variant={verdict?.variant}
          icon={verdict?.icon}
        >
          <Select
            // mds-input-select reads its options once, when they enter it: a change of their marks
            // (another family, another curve) mounts it again, as the components that read their
            // text once (README, "Languages")
            key={colorspaceOptions.map((option) => option.label).join('|')}
            value={color.colorspace ?? ''}
            options={colorspaceOptions}
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
            {t('Smooth')}
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
      <SaturationEditor
        key={color.name}
        value={color.saturation}
        onChange={(saturation) => onChange({ saturation })}
        allowInherit
        globalActive={hasGlobalSaturation}
        id={SATURATION_GROUP}
        before={saturationBefore}
        after={saturationAfter}
      />
    </div>
  );
}

interface AppProps {
  /** The view the shell routes to; without a shell the view is the App's own state. */
  view?: View;
  /** Opens a view: the shell follows its link. */
  onNavigate?: (view: View) => void;
}

/** One line under the title of each view: what it holds. */
const VIEW_SUMMARY: Record<View, string> = {
  colors: msg(
    'The families of colour of the configuration, each solved into a ramp of steps in light and dark.',
  ),
  scales: msg(
    'The contrast ratios the families solve their steps at, against the background of the mode.',
  ),
  surface: msg(
    'The families that generate surfaces, and the balances: the lightness of the surfaces and borders, the targets of the text.',
  ),
  themes: msg(
    'Each family with surfaces, status aside, is a theme: its name, its accents and the CSS that switches it in.',
  ),
  groups: msg('The ratios, formula and export of each group of the configuration.'),
  contrast: msg(
    'Every pair the contrast gate judges, in each theme and both modes: what the build of Magma would say of this configuration.',
  ),
  diff: msg('The palette against the configuration Magma builds with.'),
};

export function App({ view: routedView, onNavigate }: AppProps = {}) {
  const t = useT();
  // the work is the state's (state/studio.ts, #1400): the pages read it and change it through its
  // actions, so it outlives them; what is left here is the state of the page
  const studio = useStudio();
  const config = studio.config.value;
  const loadedRatios = studio.loadedRatios.value;
  const selectedName = studio.selectedName.value;
  // the contrast gate on the working config and the themes of the Themes page, at every edit
  // (#698): the badge beside the title, the Contrast check page, the exports
  const report = studio.report.value;
  const [ownView, setOwnView] = useState<View>(() => studio.colorsView.peek() ?? 'colors');
  const view = routedView ?? ownView;
  // the page of Colors the work is on, kept in the draft: the Start page offers to continue there
  useEffect(() => {
    studio.colorsView.value = view;
  }, [view]);
  // the list of the families opened where it stands folded above the page (narrow, palette.css);
  // where it stands beside the page it is always in view and this changes nothing
  const [listOpen, setListOpen] = useState(false);
  // the pages of Colors share the region that scrolls: a page opens at its top, never at the
  // scroll the page before it left there
  const content = useRef<HTMLElement>(null);
  useEffect(() => {
    if (content.current) content.current.scrollTop = 0;
  }, [view]);
  const setView = onNavigate ?? setOwnView;
  // the menu of the colour selected, closed once one of its actions ran
  const colorMenu = useRef<HTMLMdsDropdownElement>(null);
  const closeMenus = () => {
    if (colorMenu.current) colorMenu.current.visible = false;
  };
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

  // the ramps of the family selected, solved by the real generator on the configuration given
  const scalesOfFamily = (
    from: MagmaConfig,
    family: ColorConfig,
  ): [ColorScales | null, string | null] => {
    try {
      if (isAliasColor(family)) {
        const source = from.colors.find((c) => c.name === family.alias);
        if (!source) {
          return [
            null,
            t('alias target "{name}" is not defined in this config', {
              name: family.alias ?? '',
            }),
          ];
        }
        if (isAliasColor(source)) {
          return [
            null,
            t('alias target "{name}" is itself a reference; point it at a base-color family', {
              name: family.alias ?? '',
            }),
          ];
        }
        // resolve through the real generator with the source present, so the
        // alias re-export finds it; the alias scale equals the source's.
        const scales = generateScales({ ...from, colors: [source, family] });
        return [scales.get(family.name) ?? null, null];
      }
      const scales = generateScales(singleColorConfig(from, family));
      return [scales.get(family.name) ?? null, null];
    } catch (error) {
      return [null, String(error)];
    }
  };

  // what the ramps of the family selected depend on
  const selectedDeps = [
    JSON.stringify(selected),
    // an alias preview also depends on its source family's palette settings
    selected && isAliasColor(selected)
      ? JSON.stringify(config.colors.find((c) => c.name === selected.alias))
      : '',
    JSON.stringify(config.hueShift),
    JSON.stringify(config.saturation),
    JSON.stringify(config.ratios),
    config.colorspace,
    config.smooth,
    config.formula,
    view,
    t,
  ];

  const [selectedScales, selectedError] = useMemo(
    (): [ColorScales | null, string | null] =>
      !selected || view !== 'colors' ? [null, null] : scalesOfFamily(config, selected),
    selectedDeps,
  );

  // how the colorspace of the family selected holds its seed (colorspace-verdict.ts), graded
  // after the render that changed it: eight ramps of the family (some 30 ms in a browser, more in
  // jsdom) would hold every edit back, and a drag of a slider grades its last position only. The
  // verdict names its family: until the one selected is graded, the field shows none, never the
  // marks of the family before (seen in CI: a global Smooth took 2.2 s to reach the configuration)
  const [gradedVerdict, setGradedVerdict] = useState<{
    family: string;
    verdict: ColorspaceVerdict | null;
  } | null>(null);
  useEffect(() => {
    if (!selected || view !== 'colors') return;
    const timer = setTimeout(
      () =>
        setGradedVerdict({
          family: selected.name,
          verdict: colorspaceVerdict(t, config, selected),
        }),
      0,
    );
    return () => clearTimeout(timer);
  }, selectedDeps);
  const selectedColorspaceVerdict =
    selected && gradedVerdict?.family === selected.name ? gradedVerdict.verdict : null;

  // the same ramps with no saturation curve anywhere: the "before" of the saturation of the
  // family, drawn by its group and by the global one (saturation-editor.tsx)
  const flatScales = useMemo((): ColorScales | null => {
    if (!selected || view !== 'colors') return null;
    const flat = withoutSaturation(config);
    const family = flat.colors.find((c) => c.name === selected.name);
    return family ? scalesOfFamily(flat, family)[0] : null;
  }, selectedDeps);

  // the ramps of every family, solved only for the Groups page (a computed of the state)
  const generation = view === 'groups' ? studio.generation.value : null;

  // the family a reference points at, opened from the banner of the reference: once that family
  // renders, its title comes into view and takes the focus. The request names the family: the
  // effects of the render before it, still pending when the person clicks (a slow machine, a quick
  // hand), run at the start of the next render, before the family is drawn, and must leave the
  // request to the render of the family (seen in CI on #1326)
  const openSourceRef = useRef<string | null>(null);
  useEffect(() => {
    if (openSourceRef.current !== selectedName) return;
    const title = document.getElementById(FAMILY_TITLE);
    if (!title) return;
    openSourceRef.current = null;
    title.scrollIntoView({ block: 'start' });
    title.focus({ preventScroll: true });
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
  const ratioSetFor = (formula: Formula): RatioSet => scalesOf(config.ratios, formula);
  const ratioSet = ratioSetFor(scalesFormula);
  const builtinScales = Object.keys(builtinScalesOf(scalesFormula));

  const scaleNamesFor = (color: ColorConfig): string[] =>
    Object.keys(ratioSetFor(resolveFormula(color, config)));

  // origin of a scale relative to the built-in defaults. Comparing stops
  // (rather than mere presence in config.ratios) keeps the tag correct even
  // though writeScale materializes untouched built-ins back into the config.
  const scaleOrigin = (formula: Formula, name: string): ScaleOrigin => {
    const builtin = builtinScalesOf(formula)[name];
    if (!Array.isArray(builtin)) return 'custom';
    const current = ratioSetFor(formula)[name];
    const overridden =
      !!current &&
      (current.length !== builtin.length || current.some((value, i) => value !== builtin[i]));
    return overridden ? 'builtin-overridden' : 'builtin';
  };
  const scaleLabel = (formula: Formula, name: string): string => {
    const origin = scaleOrigin(formula, name);
    if (origin === 'builtin') return t('{name} (built-in)', { name });
    if (origin === 'builtin-overridden') return t('{name} (built-in, overridden)', { name });
    return name;
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

  // an export while the gate fails asks first: never the silent default (#698). The dialog is the
  // shell's, so the Config menu of the bar asks it from any section
  const ask = (action: ExportAction) => guard(studio, action);

  // a dialog of the page closes when another page opens: the dialog of the gate leads from the
  // Batch export of Groups to Contrast check
  const shownView = useRef(view);
  useEffect(() => {
    if (shownView.current === view) return;
    shownView.current = view;
    setBatchModal(null);
  }, [view]);

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
    setExports(studio, names, exportList);
    setBatchModal(null);
    setBatchSelection(new Set());
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

  // where the configuration comes from and goes: a command that serves it, a save under way, a
  // conflict with its source, what kept it from loading
  const served = studio.served.value;
  const saving = studio.saving.value;
  const dirty = studio.dirty.value;
  const conflict = studio.conflict.value;
  const notice = studio.notice.value;
  // the head of the page and what keeps the configuration from loading or saving: the first
  // things of the region that scrolls, or, on Semantic surface, the start of its first column
  // (surfaces.tsx), where the opt-in of the surfaces stands beside it on a wide page
  const pageTop = (
    <>
      <header class="studio-page-head">
        <div class="studio-page-title">
          {/* the status of what is edited beside the title (page-header, `status`): the verdict
              of the contrast gate, on every page of Colors */}
          <div class="studio-page-name">
            <mds-text typography="page" tag="h1">
              {t(COLORS_PAGES.find((page) => page.id === view)?.label ?? '')}
            </mds-text>
            <GateBadge verdict={report.verdict} />
          </div>
          <mds-text typography="detail" tag="p" class="studio-muted">
            {t(VIEW_SUMMARY[view])}
          </mds-text>
        </div>
        {/* the actions of the page (the page-header block of Magma): Reset in view, the one
            action left once the menu of the others had nothing else (vittorio, 2026-11-09), then
            Save when a command serves the studio, last. What brings a configuration in and takes
            it out is the Config menu of the bar (shell.tsx, app/config-menu.tsx) */}
        <div class="studio-page-actions">
          {studio.status.value && (
            <mds-text typography="caption" tag="span" class="studio-muted" role="status">
              {say(t, studio.status.value)}
            </mds-text>
          )}
          <mds-button
            id="studio-reset"
            icon="mi/baseline/restart-alt"
            variant="dark"
            tone="text"
            label={t('Reset')}
            title={t(
              'Discard the loaded configuration and every local change, back to the one Magma builds with',
            )}
            disabled={!studio.canReset.value}
            onClick={() => {
              resetWork(studio);
              setView('colors');
            }}
          ></mds-button>
          {/* the texts that change go in `label`: mds-button reads its slotted text only once */}
          {served &&
            (served.readOnly ? (
              <mds-button
                variant="dark"
                tone="outline"
                disabled
                title={served.readOnly}
                label={dirty ? t('Read-only *') : t('Read-only')}
              ></mds-button>
            ) : (
              <mds-button
                variant="dark"
                tone="outline"
                onClick={() =>
                  ask({
                    label: msg('Save'),
                    proceed: msg('Save anyway'),
                    run: () => saveConfig(studio),
                  })
                }
                disabled={saving || !dirty || !!conflict}
                title={served.path}
                label={saving ? t('Saving...') : dirty ? t('Save *') : t('Saved')}
              ></mds-button>
            ))}
        </div>
      </header>

      {/* what keeps the configuration from loading or saving, above the page */}
      {notice ? (
        <mds-banner class="studio-notice" variant="error">
          {say(t, notice)}
        </mds-banner>
      ) : conflict ? (
        <mds-banner class="studio-notice draft-conflict" variant="warning">
          {t('{reason}, and the draft restored from this browser has edits of its own.', {
            reason: reasonText(t, conflict.reason),
          })}
          <mds-button
            slot="action"
            type="button"
            variant="dark"
            tone="outline"
            label={t(conflict.label)}
            onClick={() => resolveConflict(studio, true)}
          ></mds-button>
          <mds-button
            slot="action"
            type="button"
            label={t('Keep the draft')}
            onClick={() => resolveConflict(studio, false)}
          ></mds-button>
        </mds-banner>
      ) : (
        served?.readOnly && (
          <mds-banner class="studio-notice" variant="info">
            {t('Saving is off: {reason}', { reason: served.readOnly })}
          </mds-banner>
        )
      )}
    </>
  );

  return (
    <div class={`layout${showSidebar ? '' : ' no-sidebar'}`}>
      {/* where the list stands above the page, folded into the family selected: its arrow at the
          end, as the sections of the bar that open a menu (app-shell); hidden where the list
          stands beside the page (palette.css) */}
      {showSidebar && (
        <div class="palette-list-bar">
          <mds-button
            type="button"
            icon={listOpen ? 'mi/baseline/expand-less' : 'mi/baseline/expand-more'}
            icon-position="right"
            variant="dark"
            tone="weak"
            class="palette-list-toggle"
            label={selectedName}
            aria-expanded={listOpen ? 'true' : 'false'}
            aria-controls="palette-list"
            onClick={() => setListOpen(!listOpen)}
          ></mds-button>
        </div>
      )}
      {showSidebar && (
        <aside
          id="palette-list"
          class={`palette-list${listOpen ? ' palette-list-open' : ''}`}
          aria-label={t('The families of colour')}
        >
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
            label={t('Add color')}
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
                  const badge = badgeOf(t, config, color);
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
                          selectFamily(studio, color.name);
                          setListOpen(false);
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
          aria-label={addModal.kind === 'alias' ? t('New reference') : t('New color')}
          onmdsModalClose={() => setAddModal(null)}
        >
          <mds-banner
            slot="window"
            variant="light"
            tone="box"
            dismissible
            headline={addModal.kind === 'alias' ? t('New reference') : t('New color')}
            onmdsBannerClose={() => setAddModal(null)}
          >
            <div class="studio-dialog">
              <fieldset class="palette-choice">
                <legend>
                  <mds-text typography="label" tag="span">
                    {t('Kind')}
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
                    {t('Own color')}
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
                    {t('Reference')}
                  </Check>
                </div>
                <mds-text typography="caption" tag="p" class="studio-muted">
                  {aliasTargets.length === 0
                    ? t('No base-color family to reference yet.')
                    : t('A reference follows another family instead of solving a palette.')}
                </mds-text>
              </fieldset>
              {addModal.kind === 'color' ? (
                // keyed apart: a colour field and a select are two controls, not one changing type
                <Field key="color" label={t('Color')}>
                  <ColorInput
                    value={addModal.color}
                    onValue={(hex) =>
                      setAddModal(
                        (state) =>
                          state && {
                            ...state,
                            color: hex,
                            name: state.manual ? state.name : nearestColorName(hex),
                          },
                      )
                    }
                  />
                </Field>
              ) : (
                <Field key="references" label={t('References')}>
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
              <Field label={t('Group')}>
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
              <Field label={t('Name')}>
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
              label={t('Cancel')}
              onClick={() => setAddModal(null)}
            ></mds-button>
            <mds-button
              slot="action"
              type="button"
              disabled={!addModal.name.trim() || (addModal.kind === 'alias' && !addModal.alias)}
              label={addModal.kind === 'alias' ? t('Add reference') : t('Add color')}
              onClick={() => {
                addFamily(studio, addModal);
                setView('colors');
                setAddModal(null);
              }}
            ></mds-button>
          </mds-banner>
        </mds-modal>
      )}

      <main class="content" ref={content}>
        {view !== 'surface' && pageTop}

        {view === 'colors' && selected && (
          <div class="palette-detail-frame">
            <div class="palette-detail">
              <div class="palette-title-row">
                <mds-text id={FAMILY_TITLE} typography="section" tag="h2" tabIndex={-1}>
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
                  aria-label={t('Actions of {name}', { name: selected.name })}
                ></mds-button>
              </div>
              {/* the ramps of the family, beside its fields and the settings of the whole
                configuration, in view of every control that changes them (palette.css) */}
              <PaletteSide
                config={config}
                family={selected.name}
                ramps={<Preview scales={selectedScales} error={selectedError} />}
              />
              <section class="palette-color" aria-labelledby="palette-color-title">
                <ColorEditor
                  color={selected}
                  colorspaceVerdict={selectedColorspaceVerdict}
                  inheritedColorspace={config.colorspace ?? 'HSL'}
                  hasGlobalShift={config.hueShift !== undefined}
                  hasGlobalSaturation={hasSaturation(config.saturation)}
                  saturationBefore={flatScales?.light ?? null}
                  saturationAfter={selectedScales?.light ?? null}
                  scaleNames={scaleNamesFor(selected)}
                  labelFor={(name) => scaleLabel(resolveFormula(selected, config), name)}
                  inheritedRatios={resolveRatiosName({ ...selected, ratios: undefined }, config)}
                  inheritedFormula={resolveFormula({ ...selected, formula: undefined }, config)}
                  inheritedExport={config.groups?.[selected.name.split('.')[0]]?.export ?? []}
                  isAlias={isAliasColor(selected)}
                  isBuiltin={BUILTIN_ALIAS_NAMES.has(selected.name)}
                  aliasTargets={aliasTargets}
                  resolvedColor={resolveBaseColor(config, selected)}
                  onColorCommit={(hex) => autoNameFamily(studio, selected.name, hex)}
                  onOpenSource={() => {
                    if (!selected.alias) return;
                    openSourceRef.current = selected.alias;
                    selectFamily(studio, selected.alias);
                  }}
                  onChange={(patch) => patchFamily(studio, selected.name, patch)}
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
                    label={t('Duplicate')}
                    onClick={() => {
                      closeMenus();
                      duplicateFamily(studio, selected.name);
                    }}
                  ></mds-button>
                  <mds-separator></mds-separator>
                  <mds-button
                    type="button"
                    icon="mi/baseline/delete"
                    variant="error"
                    tone="text"
                    class="studio-menu-link"
                    label={t('Delete color')}
                    disabled={BUILTIN_ALIAS_NAMES.has(selected.name)}
                    title={
                      BUILTIN_ALIAS_NAMES.has(selected.name)
                        ? t('built-in variant: cannot be deleted')
                        : undefined
                    }
                    onClick={() => {
                      closeMenus();
                      deleteFamily(studio, selected.name);
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
                  {t('Global settings')}
                </mds-text>
                <div class="palette-editor">
                  <div class="palette-fields">
                    <Field label={t('Colorspace')}>
                      <Select
                        value={config.colorspace ?? 'HSL'}
                        options={COLORSPACES.map((space) => ({ value: space, label: space }))}
                        onValue={(colorspace) => setGlobal(studio, 'colorspace', colorspace)}
                      />
                    </Field>
                    <div class="studio-row palette-switches">
                      <Check
                        type="switch"
                        checked={config.smooth ?? false}
                        onChecked={(checked) => setGlobal(studio, 'smooth', checked)}
                      >
                        {t('Smooth')}
                      </Check>
                    </div>
                  </div>
                  <HueShiftEditor
                    title={t('Global hue shifting')}
                    value={config.hueShift}
                    onChange={(hueShift) => setGlobal(studio, 'hueShift', hueShift)}
                  />
                  {/* the global curve, drawn on the family in view */}
                  <SaturationEditor
                    title={t('Global saturation')}
                    id="palette-global-saturation"
                    value={config.saturation}
                    before={flatScales?.light ?? null}
                    after={selectedScales?.light ?? null}
                    onChange={(saturation) => setGlobal(studio, 'saturation', saturation)}
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
            loaded={scalesOf(loadedRatios, scalesFormula)}
            builtinScales={builtinScales}
            sampleScales={sampleScales}
            selectedName={selectedName}
            labelFor={(name) => scaleLabel(scalesFormula, name)}
            originFor={(name) => scaleOrigin(scalesFormula, name)}
            onSelectColor={(name) => selectFamily(studio, name)}
            onFormulaChange={setScalesFormula}
            onChangeScale={(name, values) => changeScale(studio, scalesFormula, name, values)}
            onRenameScale={(name, nextName) => renameScale(studio, scalesFormula, name, nextName)}
            onAddScale={(copyFrom) => addScale(studio, scalesFormula, copyFrom)}
            onDeleteScale={(name) => deleteScale(studio, scalesFormula, name)}
          />
        )}
        {view === 'surface' && (
          <>
            <SurfaceManager
              head={pageTop}
              config={config}
              report={report}
              onToggleSurface={(colorName, on) => toggleSurface(studio, colorName, on)}
              onToggleGroupSurface={(groupName, on) => toggleGroupSurface(studio, groupName, on)}
              onUpdateTheme={(mutate) => updateBalances(studio, mutate)}
            />
          </>
        )}
        {/* Themes are DERIVED from the surfaces opt-in of the view above - same axis, one step down. */}
        {view === 'themes' && <ThemesManager config={config} report={report} guard={ask} />}
        {view === 'groups' && (
          <GroupsManager
            config={config}
            groups={groups}
            scaleNamesFor={(formula) => Object.keys(ratioSetFor(formula))}
            labelFor={scaleLabel}
            preview={generation?.scales ?? null}
            previewError={generation?.error ?? null}
            onUpdateGroup={(groupName, patch) => updateGroup(studio, groupName, patch)}
            selected={batchSelection}
            onToggleSelect={toggleBatch}
            exportNames={allExportNames}
            onSelectByExport={selectByExport}
            onOpenBatch={openBatch}
          />
        )}
        {view === 'contrast' && <ContrastCheck report={report} />}
        {view === 'diff' && <DiffView config={config} />}
      </main>

      {batchModal && (
        <BatchExportModal
          names={batchModal.names}
          config={config}
          initialExport={batchModal.initialExport}
          onSave={saveBatch}
          onExport={(names) =>
            ask({
              label: msg('Export selection'),
              proceed: msg('Export anyway'),
              run: () => exportSelection(studio, names),
            })
          }
          onClose={() => setBatchModal(null)}
        />
      )}
    </div>
  );
}
