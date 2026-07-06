import { useMemo, useRef, useState } from 'preact/hooks';
import type { Formula, MagmaConfig } from '../../src/lib/color.mjs';
import { resolveFormula, resolveRatiosName } from '../../src/lib/color.mjs';

export interface RatioSet {
  [scaleName: string]: number[];
}

interface AxisConfig {
  min: number;
  max: number;
  precision: number;
  tick: number;
}

function axisFor(formula: Formula, values: number[]): AxisConfig {
  if (formula === 'wcag2') {
    return { min: 1, max: Math.max(21, ...values), precision: 2, tick: 2 };
  }
  // wcag3 (APCA Lc): 0..110 requested range, existing presets reach 115
  return { min: 0, max: Math.max(110, ...values), precision: 0, tick: 10 };
}

function roundTo(value: number, precision: number): number {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

// The values are contrast against the theme background, not lightness:
// 0 sits on the background, the maximum is the strongest contrast (dark in
// light mode, light in dark mode). Distributions are expressed as easing
// functions over that axis; dragging or typing a stop switches to manual.
type EasingFn = (t: number) => number;

const EASE_IN: Record<string, EasingFn> = {
  sine: (t) => 1 - Math.cos((t * Math.PI) / 2),
  quad: (t) => t * t,
  cubic: (t) => t ** 3,
  quart: (t) => t ** 4,
  quint: (t) => t ** 5,
  expo: (t) => (t === 0 ? 0 : 2 ** (10 * t - 10)),
  circ: (t) => 1 - Math.sqrt(1 - t * t),
};

// every family expands to in / out / in-out (Penner-style)
const EASINGS: Record<string, EasingFn> = { linear: (t) => t };
const EASING_FAMILIES: Record<string, string[]> = { linear: ['linear'] };
Object.entries(EASE_IN).forEach(([family, easeIn]) => {
  EASINGS[`${family}-in`] = easeIn;
  EASINGS[`${family}-out`] = (t) => 1 - easeIn(1 - t);
  EASINGS[`${family}-in-out`] = (t) => (t < 0.5 ? easeIn(2 * t) / 2 : 1 - easeIn(2 * (1 - t)) / 2);
  EASING_FAMILIES[family] = [`${family}-in`, `${family}-out`, `${family}-in-out`];
});

export type EasingName = string;

interface DistributionStripProps {
  values: number[];
  axis: AxisConfig;
  onChange: (values: number[]) => void;
}

/**
 * Horizontal axis showing where every contrast stop of a scale sits.
 * Markers are draggable; neighbors act as bounds so the order of the
 * stops is preserved while dragging.
 */
function DistributionStrip({ values, axis, onChange }: DistributionStripProps) {
  const stripRef = useRef<HTMLDivElement>(null);
  const position = (value: number) => ((value - axis.min) / (axis.max - axis.min)) * 100;

  const startDrag = (index: number) => (event: PointerEvent) => {
    event.preventDefault();
    const strip = stripRef.current;
    if (!strip) return;
    const rect = strip.getBoundingClientRect();
    if (rect.width < 40) return; // collapsed layout: dragging would divide by ~0
    const lower = index > 0 ? values[index - 1] : axis.min;
    const upper = index < values.length - 1 ? values[index + 1] : axis.max;

    const move = (ev: PointerEvent) => {
      const ratio = Math.min(1, Math.max(0, (ev.clientX - rect.left) / rect.width));
      const raw = axis.min + ratio * (axis.max - axis.min);
      const clamped = Math.min(upper, Math.max(lower, roundTo(raw, axis.precision)));
      const next = [...values];
      next[index] = clamped;
      onChange(next);
    };
    const stop = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', stop);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', stop);
  };

  const ticks: number[] = [];
  for (let t = axis.min; t <= axis.max; t += axis.tick) ticks.push(roundTo(t, 0));

  return (
    <div class="strip" ref={stripRef}>
      <div class="strip-axis" />
      {ticks.map((tick) => (
        <div class="strip-tick" style={{ left: `${position(tick)}%` }}>
          <span>{tick}</span>
        </div>
      ))}
      {values.map((value, index) => (
        <div
          class="strip-marker"
          style={{ left: `${position(value)}%` }}
          title={`step ${index + 1}: ${value}`}
          onPointerDown={startDrag(index)}
        >
          <span class="strip-value">{value}</span>
        </div>
      ))}
    </div>
  );
}

interface DistributionControlsProps {
  axis: AxisConfig;
  values: number[];
  easing: EasingName;
  onEasingChange: (easing: EasingName) => void;
  onApply: (values: number[]) => void;
}

/**
 * Distribution mode of a scale: one of the named easings (stops are
 * regenerated live from steps/min/max) or "manual" (stops are whatever
 * the user dragged or typed).
 */
function DistributionControls({
  axis,
  values,
  easing,
  onEasingChange,
  onApply,
}: DistributionControlsProps) {
  const [steps, setSteps] = useState(values.length);
  const [min, setMin] = useState(values[0] ?? axis.min);
  const [max, setMax] = useState(values[values.length - 1] ?? axis.max);

  const apply = (easingName: EasingName, s = steps, lo = min, hi = max) => {
    const fn = EASINGS[easingName];
    if (!fn) return;
    const generated = Array.from({ length: s }, (_, i) => {
      const t = s === 1 ? 1 : i / (s - 1);
      return roundTo(lo + (hi - lo) * fn(t), axis.precision);
    });
    onApply(generated);
  };

  const update = (setter: (v: number) => void, key: 'steps' | 'min' | 'max') => (e: Event) => {
    const value = Number((e.target as HTMLInputElement).value);
    setter(value);
    if (easing !== 'manual') {
      apply(
        easing,
        key === 'steps' ? value : steps,
        key === 'min' ? value : min,
        key === 'max' ? value : max,
      );
    }
  };

  return (
    <div class="curve-generator">
      <label>
        distribution
        <select
          value={easing}
          onChange={(e) => {
            const next = (e.target as HTMLSelectElement).value as EasingName;
            onEasingChange(next);
            if (next !== 'manual') apply(next);
          }}
        >
          <option value="manual">manual</option>
          {Object.entries(EASING_FAMILIES).map(([family, names]) =>
            names.length === 1 ? (
              <option value={names[0]}>{names[0]}</option>
            ) : (
              <optgroup label={family}>
                {names.map((name) => (
                  <option value={name}>{name}</option>
                ))}
              </optgroup>
            ),
          )}
        </select>
      </label>
      {easing !== 'manual' && (
        <>
          <label>
            steps
            <input
              type="number"
              min={2}
              max={24}
              value={steps}
              onChange={update(setSteps, 'steps')}
            />
          </label>
          <label>
            min
            <input type="number" value={min} onChange={update(setMin, 'min')} />
          </label>
          <label>
            max
            <input type="number" value={max} onChange={update(setMax, 'max')} />
          </label>
        </>
      )}
    </div>
  );
}

interface ScalesManagerProps {
  config: MagmaConfig;
  formula: Formula;
  ratioSet: RatioSet;
  /**
   * Scales shipped with the generator: deleting one writes a null entry in
   * the config (the generator would merge it back from its defaults) and
   * renaming is not allowed.
   */
  builtinScales: string[];
  sampleScales: Map<string, string[]>;
  onFormulaChange: (formula: Formula) => void;
  onChangeScale: (name: string, values: number[]) => void;
  onRenameScale: (name: string, nextName: string) => void;
  onAddScale: (copyFrom: string) => void;
  onDeleteScale: (name: string) => void;
}

export function ScalesManager({
  config,
  formula,
  ratioSet,
  builtinScales,
  sampleScales,
  onFormulaChange,
  onChangeScale,
  onRenameScale,
  onAddScale,
  onDeleteScale,
}: ScalesManagerProps) {
  // distribution mode per scale; anything not chosen explicitly is manual
  const [easings, setEasings] = useState<Record<string, EasingName>>({});

  const setEasing = (name: string, easing: EasingName) =>
    setEasings((prev) => ({ ...prev, [name]: easing }));

  const manualChange = (name: string, values: number[]) => {
    onChangeScale(name, values);
    setEasing(name, 'manual');
  };

  const usage = useMemo(() => {
    const map = new Map<string, number>();
    config.colors.forEach((color) => {
      if (resolveFormula(color, config) !== formula) return;
      const scale = resolveRatiosName(color, config);
      map.set(scale, (map.get(scale) ?? 0) + 1);
    });
    return map;
  }, [config, formula]);

  return (
    <div class="scales-manager">
      <div class="scales-head">
        <p class="scales-hint">
          Contrast scales define the target contrast of every step{' '}
          <em>against the theme background</em>: 0 sits on the background, the maximum is the
          strongest contrast (dark in light mode, light in dark mode). Colors pick a scale with
          their <code>ratios</code> field; the <code>default</code> scale is mandatory. Pick a
          distribution easing, or drag the markers / edit the numbers to go manual.
        </p>
        <label>
          formula
          <select
            value={formula}
            onChange={(e) => onFormulaChange((e.target as HTMLSelectElement).value as Formula)}
          >
            <option value="wcag3">wcag3 (APCA Lc, 0-110)</option>
            <option value="wcag2">wcag2 (ratio, 1-21)</option>
          </select>
        </label>
      </div>

      {Object.keys(ratioSet).map((name) => {
        const values = ratioSet[name];
        const axis = axisFor(formula, values);
        const usedBy = usage.get(name) ?? 0;
        const builtin = builtinScales.includes(name);
        const sample = sampleScales.get(name);
        return (
          <div class="scale-card">
            <div class="scale-card-head">
              <input
                class="scale-name"
                type="text"
                value={name}
                disabled={builtin}
                title={
                  name === 'default'
                    ? 'the default scale is mandatory and cannot be renamed'
                    : builtin
                      ? 'built-in scales cannot be renamed'
                      : 'rename scale'
                }
                onChange={(e) => onRenameScale(name, (e.target as HTMLInputElement).value.trim())}
              />
              <span class="scale-usage">
                {values.length} steps - used by {usedBy} color{usedBy === 1 ? '' : 's'}
              </span>
              <div class="scale-card-actions">
                <button onClick={() => onAddScale(name)}>duplicate</button>
                <button
                  class="danger"
                  disabled={name === 'default'}
                  title={
                    name === 'default'
                      ? 'the default scale is mandatory'
                      : usedBy > 0
                        ? `used by ${usedBy} color${usedBy === 1 ? '' : 's'}: deleting reassigns them to the default scale`
                        : 'delete scale'
                  }
                  onClick={() => {
                    if (
                      usedBy > 0 &&
                      !window.confirm(
                        `The scale "${name}" is used by ${usedBy} color${usedBy === 1 ? '' : 's'}.\n` +
                          'Deleting it will reassign them to the "default" scale. Continue?',
                      )
                    ) {
                      return;
                    }
                    onDeleteScale(name);
                  }}
                >
                  {usedBy > 0 && name !== 'default' && (
                    <svg class="warn-icon" viewBox="0 0 16 16" aria-hidden="true">
                      <path d="M8 1.5 15 14H1L8 1.5z" fill="currentColor" opacity="0.25" />
                      <path
                        d="M8 5.5v4M8 11.6v1.4"
                        stroke="currentColor"
                        stroke-width="1.6"
                        fill="none"
                      />
                    </svg>
                  )}
                  delete
                </button>
              </div>
            </div>

            <DistributionStrip
              values={values}
              axis={axis}
              onChange={(next) => manualChange(name, next)}
            />

            <div class="scale-stops">
              {values.map((value, index) => (
                <span class="stop-field">
                  <input
                    type="number"
                    step={axis.precision === 0 ? 1 : 0.01}
                    value={value}
                    onChange={(e) => {
                      const raw = Number((e.target as HTMLInputElement).value);
                      const clamped = Math.min(axis.max, Math.max(axis.min, raw));
                      const next = [...values];
                      next[index] = roundTo(clamped, axis.precision);
                      manualChange(
                        name,
                        next.sort((a, b) => a - b),
                      );
                    }}
                  />
                  <button
                    class="stop-remove"
                    title="remove step"
                    disabled={values.length <= 2}
                    onClick={() =>
                      manualChange(
                        name,
                        values.filter((_, i) => i !== index),
                      )
                    }
                  >
                    x
                  </button>
                </span>
              ))}
              <button
                title="insert a step in the widest gap"
                onClick={() => {
                  let gapIndex = 0;
                  let gapSize = -1;
                  for (let i = 0; i < values.length - 1; i++) {
                    if (values[i + 1] - values[i] > gapSize) {
                      gapSize = values[i + 1] - values[i];
                      gapIndex = i;
                    }
                  }
                  const inserted = roundTo(
                    (values[gapIndex] + values[gapIndex + 1]) / 2,
                    axis.precision,
                  );
                  const next = [...values];
                  next.splice(gapIndex + 1, 0, inserted);
                  manualChange(name, next);
                }}
              >
                + step
              </button>
            </div>

            <DistributionControls
              axis={axis}
              values={values}
              easing={easings[name] ?? 'manual'}
              onEasingChange={(easing) => setEasing(name, easing)}
              onApply={(next) => onChangeScale(name, next)}
            />

            {sample && (
              <div
                class="scale-sample"
                title="selected color rendered with this scale, ordered like the axis: 0 (background side) to max contrast"
              >
                {[...sample].reverse().map((value) => (
                  <div class="scale-sample-cell" style={{ background: value }} />
                ))}
              </div>
            )}
          </div>
        );
      })}

      <button class="add-scale" onClick={() => onAddScale('default')}>
        + add scale
      </button>
    </div>
  );
}
