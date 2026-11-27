import type { ComponentChildren } from 'preact';
import type {
  ColorConfig,
  MagmaConfig,
} from '@maggioli-design-system/design-tokens/src/lib/color.mjs';
import { COLORSPACES } from '@maggioli-design-system/design-tokens/src/lib/schema.mjs';
import type { Step } from '../../engine/generator.js';
import { MARK, type ColorspaceVerdict } from '../../engine/colorspace-verdict.js';
import { inheritedFrom, MAGMA_STEPS, type InheritedField } from '../../engine/families.js';
import { Check, ColorInput, Field, Select, type Option } from '../../shared/magma/magma.js';
import { rich, useT } from '../../shared/i18n/i18n.js';
import { CommitText } from '../../shared/ui/commit-text.js';
import { HueShiftEditor } from '../../shared/ui/hue-shift-editor.js';
import { SaturationEditor } from '../../shared/ui/saturation-editor.js';
import { GROUPS_PAGE, hrefOf, scaleRoute, type Formula } from '../../shared/routes/routes.js';
import { IT_COLOURS } from './i18n-it.js';

/*
  The fields of a family (ColorEditor of app.tsx until #1403), all in line (studio.object-model.md,
  section 5, Colours). A value the family does not set says from whom it comes on a line under its
  field, the name a link to where it is decided: its group in Groups, or the preset, whose settings
  are in Groups too (vittorio on the renders, 2026-11-27, option A: the message of mds-input-field
  holds text alone, so the line stands under the field, not in it nor on the row of the label). The
  contrast scale says whether it holds the roles of Magma, with a link to its page.
*/

/** The group of the hue shifting of the family selected. */
const HUE_SHIFT_GROUP = 'palette-hue-shift';

/** The group of the saturation curve of the family selected, under its hue shifting. */
const SATURATION_GROUP = 'palette-saturation';

/** A contrast scale the field offers, with what the page knows of it. */
export interface ScaleChoice {
  name: string;
  /** The name as the select shows it: built-in, overridden, or plain. */
  label: string;
  steps: number;
}

export interface FamilyFieldsProps {
  config: MagmaConfig;
  family: ColorConfig;
  /** how the colorspace of the family holds its seed, in the message of its field (#1454) */
  colorspaceVerdict: ColorspaceVerdict | null;
  /** the light ramp of the family before any saturation curve and with them (SaturationEditor) */
  saturationBefore: Step[] | null;
  saturationAfter: Step[] | null;
  /** the formula the family is solved with, and its scales, each with its number of steps */
  formula: Formula;
  scales: ScaleChoice[];
  /** the family paints something of Magma: it takes a Magma-compatible scale alone */
  paints: boolean;
  inheritedColorspace: string;
  inheritedRatios: string;
  inheritedFormula: string;
  inheritedExport: string[];
  hasGlobalShift: boolean;
  hasGlobalSaturation: boolean;
  onChange: (patch: Partial<ColorConfig>) => void;
  /** fired with each colour of the colour field, after onChange: a code typed, a step of a pick */
  onColorCommit: (hex: string) => void;
}

// the mark of a colorspace before its name in the select of a family, from the grades of the verdict
const marker =
  (verdict: ColorspaceVerdict | null) =>
  (space: string): string => {
    const grade = verdict?.grades[space];
    // an en space, which the closed select keeps beside the emoji where a plain one reads as none
    return grade ? `${MARK[grade]}\u2002` : '';
  };

/**
 * A field and the line under it that says where its value comes from when the family does not set
 * it. The line is a sentence with the source as a link, translated whole (rich).
 */
function Inherited({
  config,
  family,
  field,
  children,
  after,
}: {
  config: MagmaConfig;
  family: ColorConfig;
  field: InheritedField;
  children: ComponentChildren;
  /** what follows the line, about the value (the badge of a scale) */
  after?: ComponentChildren;
}) {
  const t = useT(IT_COLOURS);
  const from = inheritedFrom(config, family, field);
  return (
    <div class="grid min-w-0 content-start gap-label-control">
      {children}
      {from && (
        <mds-text typography="caption" tag="p" class="text-fg-muted" data-inherits={field}>
          {from.from === 'group'
            ? rich(t, 'Inherits from the group {group}', {
                group: <mds-link href={hrefOf(GROUPS_PAGE)}>{from.group}</mds-link>,
              })
            : rich(t, 'Inherits from the {preset}', {
                preset: <mds-link href={hrefOf(GROUPS_PAGE)}>{t('preset')}</mds-link>,
              })}
        </mds-text>
      )}
      {after}
    </div>
  );
}

/**
 * The contrast scale of the family, chosen in line, with its badge and a link to its page. A
 * family that paints Magma takes a Magma-compatible scale alone (vittorio, 2026-11-27, question 10
 * of the object model): the others are offered to a family outside Magma only. One that paints and
 * stands on another anyway (a preset written before) says why its roles do not hold.
 */
function ScaleField({
  config,
  family,
  formula,
  scales,
  paints,
  inherited,
  onChange,
}: {
  config: MagmaConfig;
  family: ColorConfig;
  /** the formula the family is solved with: its scales are those of it */
  formula: Formula;
  scales: ScaleChoice[];
  paints: boolean;
  inherited: string;
  onChange: (patch: Partial<ColorConfig>) => void;
}) {
  const t = useT(IT_COLOURS);
  const current = family.ratios ?? inherited;
  const scale = scales.find((one) => one.name === current);
  const compatible = scale?.steps === MAGMA_STEPS;
  const offered = scales.filter(
    (one) => !paints || one.steps === MAGMA_STEPS || one.name === family.ratios,
  );
  const labelOf = (one: ScaleChoice) =>
    one.steps === MAGMA_STEPS
      ? one.label
      : t('{name} ({count} steps, for the cases outside Magma)', {
          name: one.label,
          count: one.steps,
        });
  const options: Option[] = [
    { value: '', label: t('inherit ({value})', { value: inherited }) },
    ...offered.map((one) => ({ value: one.name, label: labelOf(one) })),
  ];
  const wrong = paints && scale !== undefined && !compatible;
  return (
    <Inherited
      config={config}
      family={family}
      field="ratios"
      after={
        scale && (
          <div class="flex flex-wrap items-center gap-inline">
            <mds-badge
              variant={compatible ? 'success' : 'warning'}
              tone="weak"
              label={compatible ? t('Compatible with Magma') : t('Not compatible with Magma')}
            ></mds-badge>
            <mds-link
              href={hrefOf(scaleRoute(formula, scale.name))}
              icon="mi/baseline/arrow-forward"
              label={t('Open the scale {scale}', { scale: scale.name })}
            ></mds-link>
          </div>
        )
      }
    >
      <Field
        label={t('Contrast scale')}
        variant={wrong ? 'error' : undefined}
        message={
          wrong
            ? t(
                'The roles of Magma name {steps} steps by number: on {count} steps they do not hold. A family that paints Magma takes a scale of {steps} steps.',
                { steps: MAGMA_STEPS, count: scale.steps },
              )
            : undefined
        }
      >
        <Select
          // mds-input-select reads its options once: another set of scales mounts it again
          key={options.map((option) => option.value).join('|')}
          value={family.ratios ?? ''}
          options={options}
          onValue={(ratios) => onChange({ ratios: ratios || undefined })}
        />
      </Field>
    </Inherited>
  );
}

/** The fields of a family with a colour of its own. */
export function FamilyFields(props: FamilyFieldsProps) {
  const t = useT(IT_COLOURS);
  const { config, family, colorspaceVerdict: verdict, onChange } = props;
  const markOf = marker(verdict);
  // each option marked with the grade of the ramp of this colour in that colorspace, the one it
  // inherits included: an option holds text only (vittorio, 2026-11-18)
  const colorspaceOptions: Option[] = [
    {
      value: '',
      label: `${markOf(props.inheritedColorspace)}${t('inherit ({value})', { value: props.inheritedColorspace })}`,
    },
    ...COLORSPACES.map((space) => ({ value: space, label: `${markOf(space)}${space}` })),
  ];
  return (
    <div class="grid min-w-0 gap-between-groups" key="own">
      <div class="grid grid-cols-[repeat(auto-fill,minmax(min(100%,calc(var(--magma-width-form)/2)),1fr))] items-start gap-between-fields">
        <CommitText label={t('Name')} value={family.name} onCommit={(name) => onChange({ name })} />
        <Field label={t('Base color')}>
          <ColorInput
            value={family.color}
            onValue={(hex) => {
              onChange({ color: hex as ColorConfig['color'] });
              props.onColorCommit(hex);
            }}
          />
        </Field>
        <ScaleField
          config={config}
          family={family}
          formula={props.formula}
          scales={props.scales}
          paints={props.paints}
          inherited={props.inheritedRatios}
          onChange={onChange}
        />
        <Inherited config={config} family={family} field="formula">
          <Field label={t('Formula')}>
            <Select
              value={family.formula ?? ''}
              options={[
                { value: '', label: t('inherit ({value})', { value: props.inheritedFormula }) },
                { value: 'wcag2', label: 'wcag2' },
                { value: 'wcag3', label: 'wcag3' },
              ]}
              onValue={(formula) =>
                onChange({ formula: (formula || undefined) as ColorConfig['formula'] })
              }
            />
          </Field>
        </Inherited>
        <Inherited config={config} family={family} field="colorspace">
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
              value={family.colorspace ?? ''}
              options={colorspaceOptions}
              onValue={(colorspace) =>
                onChange({ colorspace: (colorspace || undefined) as ColorConfig['colorspace'] })
              }
            />
          </Field>
        </Inherited>
        <Inherited config={config} family={family} field="export">
          <ExportField family={family} inherited={props.inheritedExport} onChange={onChange} />
        </Inherited>
        {/* the switch shows the value the ramp is made with; set back to the one of the preset,
            the family inherits it again */}
        <Inherited config={config} family={family} field="smooth">
          <div class="flex min-h-1200 items-end">
            <Check
              type="switch"
              checked={family.smooth ?? config.smooth ?? false}
              onChecked={(checked) =>
                onChange({ smooth: checked === (config.smooth ?? false) ? undefined : checked })
              }
            >
              {t('Smooth')}
            </Check>
          </div>
        </Inherited>
        <div class="flex min-h-1200 items-end">
          <Check
            type="switch"
            checked={family.disabled ?? false}
            onChecked={(checked) => onChange({ disabled: checked || undefined })}
          >
            {t('Disabled')}
          </Check>
        </div>
      </div>
      <HueShiftEditor
        key={family.name}
        value={family.hueShift}
        onChange={(hueShift) => onChange({ hueShift })}
        allowInherit
        globalActive={props.hasGlobalShift}
        id={HUE_SHIFT_GROUP}
      />
      <SaturationEditor
        key={family.name}
        value={family.saturation}
        onChange={(saturation) => onChange({ saturation })}
        allowInherit
        globalActive={props.hasGlobalSaturation}
        id={SATURATION_GROUP}
        before={props.saturationBefore}
        after={props.saturationAfter}
      />
    </div>
  );
}

/** The export groups of a family: a list of names, its own or the one of its group. */
function ExportField({
  family,
  inherited,
  onChange,
}: {
  family: ColorConfig;
  inherited: string[];
  onChange: (patch: Partial<ColorConfig>) => void;
}) {
  const t = useT(IT_COLOURS);
  return (
    <CommitText
      label={t('Export groups')}
      value={(family.export ?? []).join(', ')}
      placeholder={
        inherited.length
          ? t('inherit ({value})', { value: inherited.join(', ') })
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
}

/**
 * The fields of a reference (an alias): it re-exports the ramp of its source, so it carries none
 * of the fields that solve a ramp. What it does not set is said once at the top, with the one
 * action that edits it (vittorio, 2026-11-18): an info banner, its action strong in the variant of
 * the banner (docs/agents/patterns/actions.md, banner).
 */
export function ReferenceFields({
  config,
  family,
  builtin,
  targets,
  resolved,
  onChange,
  onOpenSource,
}: {
  config: MagmaConfig;
  family: ColorConfig;
  /** a built-in variant: its target changes, its name does not */
  builtin: boolean;
  /** the families a reference may follow: those with a colour of their own */
  targets: string[];
  /** the colour of the source */
  resolved: string | undefined;
  onChange: (patch: Partial<ColorConfig>) => void;
  /** opens the family it follows, its title focused */
  onOpenSource: () => void;
}) {
  const t = useT(IT_COLOURS);
  const known = !!family.alias && targets.includes(family.alias);
  const references: Option[] = [
    ...(!known && family.alias
      ? [{ value: family.alias, label: t('{name} (missing)', { name: family.alias }) }]
      : []),
    ...targets.map((name) => ({ value: name, label: name })),
  ];
  // keyed apart from the fields of a colour of its own, and the name of a built-in variant apart
  // from the name of another reference: mds-input-field draws the window of its message for an
  // empty message too, and a field reused with no message gets the empty string from Preact
  return (
    <div class="grid min-w-0 gap-between-groups" key="reference">
      {known && (
        <mds-banner variant="info">
          {t(
            '{name} is a reference to {source}: its ramp is the one of the source. Base color, colorspace, "Smooth", hue shifting, saturation, ratios and formula are set on {source}, and every reference to it follows.',
            { name: family.name, source: family.alias ?? '' },
          )}
          <mds-button
            slot="action"
            type="button"
            variant="info"
            tone="strong"
            label={t('Edit {name}', { name: family.alias ?? '' })}
            onClick={onOpenSource}
          ></mds-button>
        </mds-banner>
      )}
      <div class="grid grid-cols-[repeat(auto-fill,minmax(min(100%,calc(var(--magma-width-form)/2)),1fr))] items-start gap-between-fields">
        <CommitText
          key={builtin ? 'built-in-name' : 'name'}
          label={t('Name')}
          value={family.name}
          disabled={builtin}
          message={builtin ? t('Built-in variant: it cannot be renamed') : undefined}
          onCommit={(name) => onChange({ name })}
        />
        <Field label={t('Reference')}>
          <Select
            value={family.alias ?? ''}
            options={references}
            onValue={(alias) => onChange({ alias })}
          />
        </Field>
        {/* a read-only datum: a label and its value (docs/agents/patterns/labels-and-values.md) */}
        <dl class="m-0 grid gap-label-control">
          <mds-text typography="label" tag="dt" class="text-fg-muted">
            {t('Resolves to')}
          </mds-text>
          <mds-text tag="dd" class="m-0">
            <span class="inline-flex items-center gap-inline">
              <span class="studio-swatch" style={{ background: resolved ?? 'transparent' }} />
              {resolved ?? t('unresolved')}
            </span>
          </mds-text>
        </dl>
        <Inherited config={config} family={family} field="export">
          <ExportField
            family={family}
            inherited={config.groups?.[family.name.split('.')[0]]?.export ?? []}
            onChange={onChange}
          />
        </Inherited>
        <div class="flex min-h-1200 items-end">
          <Check
            type="switch"
            checked={family.disabled ?? false}
            onChecked={(checked) => onChange({ disabled: checked || undefined })}
          >
            {t('Disabled')}
          </Check>
        </div>
      </div>
    </div>
  );
}
