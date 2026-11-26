import { useMemo, useState } from 'preact/hooks';
import {
  CURVE_PRESETS,
  type HueShiftEasing,
} from '@maggioli-design-system/design-tokens/src/lib/hue-shift.mjs';
import {
  hasSaturation,
  relativeSaturation,
  resolveStepSaturation,
  type SaturationConfig,
} from '@maggioli-design-system/design-tokens/src/lib/saturation.mjs';
import {
  CURVE_KINDS,
  CUSTOM_CURVE_START,
  EASING_OPTIONS,
  type CurveKind,
  type CurvePreset,
} from './curves.js';
import type { Step } from './engine/generator.js';
import { HUE_ENDS, endsOf, moveEnd, type HueEnds } from './engine/hue-ends.js';
import { Field, Range, Select, type Option } from './shared/magma/magma.js';
import { useT } from './shared/i18n/i18n.js';

/*
  The saturation curve of a scale (#1439, vittorio 2026-11-18), the group beside the hue shifting
  in the Palette: global in the settings of the configuration, and of the family over it. The engine
  (design-tokens, saturation.mts) raises or lowers the relative saturation of the steps toward the
  two ends of the scale and solves their lightness again, so the contrast stays the one of the
  scale. The group follows the one of the hue shifting (app.tsx, HueShiftEditor), with three
  differences:

  - a curve starts flat, both ends at 0, the scale as Leonardo makes it (vittorio, 2026-11-18:
    flat by default), and its ends start linked, the U of the reference of the issue (more
    saturation toward the dark and the light end alike); the hue shift starts at -18/18, mirrored;
  - a family keeps its own flat curve apart from Off: Off writes the two ends at 0 alone, which
    takes the family out of a global curve; Custom writes a curve too, so the mode reads back;
  - under the ends, the change of each step (signed bars, from the darkest step to the lightest),
    then the relative saturation of each step of the family in view, light mode, before the curve
    (a ring) and with it (a dot in the colour of the step), as the reference drew it.
*/

type SaturationMode = 'inherit' | 'custom' | 'off';

/** The link the two ends start from: linked, the U of the reference of the issue (#1439). */
const START_ENDS: HueEnds = 'linked';

/** Where a custom curve starts: flat, both ends at 0, the smooth curve of the engine. */
const FLAT: SaturationConfig = { dark: 0, light: 0, curve: 'smooth' };

// the steps the bars draw: a scale of 10, as the bars of the hue shifting
const BAR_STEPS = 10;

// the two ends of the axis of a chart, under it: the steps run from the darkest to the lightest
function ChartEnds() {
  const t = useT();
  return (
    <div class="palette-chart-ends" aria-hidden="true">
      <mds-text typography="caption" tag="span" class="studio-muted">
        {t('darkest')}
      </mds-text>
      <mds-text typography="caption" tag="span" class="studio-muted">
        {t('lightest')}
      </mds-text>
    </div>
  );
}

function modeOf(value: SaturationConfig | undefined, allowInherit?: boolean): SaturationMode {
  if (value === undefined) return allowInherit ? 'inherit' : 'off';
  // a curve with no ends of its own and no curve is the Off of a family (it opts out of the global)
  if (!hasSaturation(value) && value.curve === undefined) return 'off';
  return 'custom';
}

interface SaturationEditorProps {
  value: SaturationConfig | undefined;
  onChange: (value: SaturationConfig | undefined) => void;
  /** The one of a family inherits the global curve; the global one is custom or off. */
  allowInherit?: boolean;
  globalActive?: boolean;
  /** The title of the group: the global one says so, apart from the one of the family. */
  title?: string;
  /** The id of the group, unique on the page: the family and the global one share it. */
  id: string;
  /** The light ramp of the family in view as the engine makes it with no saturation curve. */
  before?: Step[] | null;
  /** The same ramp with the curves of the configuration. */
  after?: Step[] | null;
}

export function SaturationEditor({
  value,
  onChange,
  allowInherit,
  globalActive,
  title,
  id,
  before,
  after,
}: SaturationEditorProps) {
  const t = useT();
  const mode = modeOf(value, allowInherit);
  const enabled = mode === 'custom';
  const dark = value?.dark ?? 0;
  const light = value?.light ?? 0;
  const curve = value?.curve ?? 'smooth';
  const curveKind: CurveKind = typeof curve === 'string' ? curve : 'custom';
  const { deadZone: defaultDeadZone, easing: defaultEasing } = CURVE_PRESETS.smooth;
  const deadZone =
    typeof curve === 'object' && !Array.isArray(curve)
      ? (curve.deadZone ?? defaultDeadZone)
      : defaultDeadZone;
  const easing =
    typeof curve === 'object' && !Array.isArray(curve)
      ? (curve.easing ?? defaultEasing)
      : defaultEasing;

  // the change of each step, from the darkest to the lightest: the light mode runs from the
  // background (the lightest step) outward, so its order reversed
  const amounts = useMemo(() => {
    try {
      return resolveStepSaturation({ dark, light, curve }, BAR_STEPS, 'light').reverse();
    } catch {
      return null;
    }
  }, [dark, light, JSON.stringify(curve)]);

  // the saturation of the ramp in view, before the curve and with it, in percent
  const points = useMemo(() => {
    if (!before || !after || before.length !== after.length) return null;
    return after.map((step, i) => ({
      value: step.value,
      after: Math.round(relativeSaturation(step.value) * 100),
      before: Math.round(relativeSaturation(before[i].value) * 100),
    }));
  }, [JSON.stringify(before), JSON.stringify(after)]);

  const patch = (partial: Partial<SaturationConfig>) =>
    onChange({ dark, light, curve, ...partial });

  // how the two ends move together (hue-ends.ts): read back from the ends at the start, kept by
  // the editor while the person works (the configuration has no place for it)
  const [ends, setEnds] = useState<HueEnds>(() => endsOf(dark, light, START_ENDS));
  const endsTitle = `${id}-ends`;
  const moveTo = (end: 'dark' | 'light', next: number) =>
    patch(moveEnd(ends, { dark, light }, end, next));

  const setMode = (next: SaturationMode) => {
    if (next === 'custom') onChange(FLAT);
    // the Off of a family: the two ends at 0 and no curve, over a global one
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

  // a group of fields of the form, as the one of the hue shifting: what comes and goes with the
  // mode stays inside one box of the fieldset (a Chromium trap, see HueShiftEditor)
  return (
    <fieldset class="palette-group" id={id}>
      <legend>
        <mds-text typography="group" tag="span">
          {title ?? t('Saturation')}
        </mds-text>
      </legend>
      <div class="palette-group-content">
        <div class="palette-fields">
          <Field label={t('Mode')}>
            <Select
              value={mode}
              onValue={(next) => setMode(next as SaturationMode)}
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
                      const aligned = moveEnd(next as HueEnds, { dark, light }, 'dark', dark);
                      if (aligned.light !== light) patch(aligned);
                    }}
                  />
                </div>
                <Field label={t('Dark (%)')}>
                  <Range
                    value={dark}
                    min={-100}
                    max={100}
                    label={t('Dark (%)')}
                    onValue={(next) => moveTo('dark', next)}
                  />
                </Field>
                <Field label={t('Light (%)')}>
                  <Range
                    value={light}
                    min={-100}
                    max={100}
                    label={t('Light (%)')}
                    onValue={(next) => moveTo('light', next)}
                  />
                </Field>
              </div>
              {/* the change of each step, from the darkest to the lightest: up toward the most
                  vivid colour, down toward grey, around the line of no change */}
              {amounts && (
                <figure class="palette-chart">
                  <figcaption>
                    <mds-text typography="label" tag="span">
                      {t('Change per step')}
                    </mds-text>
                  </figcaption>
                  <div
                    class="palette-amounts"
                    role="img"
                    aria-label={t(
                      'Saturation change per step (10-step scale), from the darkest to the lightest',
                    )}
                    title={t(
                      'saturation change per step (10-step scale), from the darkest to the lightest',
                    )}
                  >
                    {amounts.map((amount) => (
                      <div class="palette-amount">
                        {/* the height of a bar is the datum it draws, half the track each way */}
                        <div class="palette-amount-up">
                          {amount > 0 && (
                            <div class="palette-amount-fill" style={{ height: `${amount}%` }} />
                          )}
                        </div>
                        <div class="palette-amount-down">
                          {amount < 0 && (
                            <div class="palette-amount-fill" style={{ height: `${-amount}%` }} />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <ChartEnds />
                </figure>
              )}
              {/* the saturation of each step of the ramp in view: a ring before the curve, a dot
                  in the colour of the step with it */}
              {points && (
                <figure class="palette-chart">
                  <figcaption>
                    <mds-text typography="label" tag="span">
                      {t('Saturation per step, light mode')}
                    </mds-text>
                    <mds-text typography="caption" tag="span" class="studio-muted">
                      {t('a ring before the curve, a dot in the colour of the step with it')}
                    </mds-text>
                  </figcaption>
                  <div
                    class="palette-saturation"
                    role="img"
                    aria-label={t(
                      'Relative saturation of each step in light mode, from the darkest to the lightest: before the curve {before}, with it {after}',
                      {
                        before: points.map((point) => `${point.before}%`).join(', '),
                        after: points.map((point) => `${point.after}%`).join(', '),
                      },
                    )}
                  >
                    {points.map((point) => (
                      <div
                        class="palette-saturation-step"
                        title={t('{value}: saturation {after}% (before the curve {before}%)', {
                          value: point.value,
                          after: String(point.after),
                          before: String(point.before),
                        })}
                      >
                        {/* the position of a mark is the datum it draws */}
                        <span
                          class="palette-saturation-before"
                          style={{ insetBlockEnd: `${point.before}%` }}
                        />
                        <span
                          class="palette-saturation-after"
                          style={{ insetBlockEnd: `${point.after}%`, background: point.value }}
                        />
                      </div>
                    ))}
                  </div>
                  <ChartEnds />
                </figure>
              )}
            </>
          )}
        </div>
      </div>
    </fieldset>
  );
}
