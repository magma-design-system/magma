import { useMemo, useState } from 'preact/hooks';
import {
  CURVE_PRESETS,
  resolveCurveWeights,
  type HueShiftConfig,
  type HueShiftEasing,
} from '@maggioli-design-system/design-tokens/src/lib/hue-shift.mjs';
import { HUE_ENDS, endsOf, moveEnd, type HueEnds } from '../../engine/hue-ends.js';
import { Field, Range, Select, type Option } from '../magma/magma.js';
import { useT } from '../i18n/i18n.js';
import {
  CURVE_KINDS,
  CUSTOM_CURVE_START,
  EASING_OPTIONS,
  type CurveKind,
  type CurvePreset,
} from './curves.js';

/*
  The hue shifting of a family, or of the whole preset (out of app.tsx, #1403): the turn of the hue
  at the dark and the light ends of a ramp, along a curve of the engine (hue-shift.mts). Colours
  edits the one of a family, Groups the one of the preset, so it sits in shared/.
*/

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

export function HueShiftEditor({
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
