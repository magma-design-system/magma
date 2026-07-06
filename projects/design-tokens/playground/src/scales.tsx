import { useMemo, useRef, useState } from 'preact/hooks';
import type { Formula, MagmaConfig } from '../../src/lib/color.mjs';

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

interface CurveGeneratorProps {
  axis: AxisConfig;
  count: number;
  onApply: (values: number[]) => void;
}

/**
 * Regenerates the stops of a scale from a parametric distribution:
 * value(t) = min + (max - min) * t^gamma. Gamma below 1 packs the stops
 * toward the high end, above 1 toward the low end.
 */
function CurveGenerator({ axis, count, onApply }: CurveGeneratorProps) {
  const [steps, setSteps] = useState(count);
  const [min, setMin] = useState(axis.min);
  const [max, setMax] = useState(axis.precision === 0 ? Math.min(110, axis.max) : axis.max);
  const [gamma, setGamma] = useState(1);

  const generate = () => {
    const values = Array.from({ length: steps }, (_, i) => {
      const t = steps === 1 ? 1 : i / (steps - 1);
      return roundTo(min + (max - min) * t ** gamma, axis.precision);
    });
    onApply(values);
  };

  return (
    <div class="curve-generator">
      <label>
        steps
        <input
          type="number"
          min={2}
          max={24}
          value={steps}
          onChange={(e) => setSteps(Number((e.target as HTMLInputElement).value))}
        />
      </label>
      <label>
        min
        <input
          type="number"
          value={min}
          onChange={(e) => setMin(Number((e.target as HTMLInputElement).value))}
        />
      </label>
      <label>
        max
        <input
          type="number"
          value={max}
          onChange={(e) => setMax(Number((e.target as HTMLInputElement).value))}
        />
      </label>
      <label class="gamma">
        curve <code>{gamma.toFixed(2)}</code>
        <input
          type="range"
          min={0.25}
          max={4}
          step={0.05}
          value={gamma}
          onInput={(e) => setGamma(Number((e.target as HTMLInputElement).value))}
        />
      </label>
      <button onClick={generate}>distribute</button>
    </div>
  );
}

interface ScalesManagerProps {
  config: MagmaConfig;
  formula: Formula;
  ratioSet: RatioSet;
  /** scales shipped with the generator: editable but not removable */
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
  const usage = useMemo(() => {
    const map = new Map<string, number>();
    config.colors.forEach((color) => {
      const colorFormula = color.formula ?? config.formula ?? 'wcag3';
      if (colorFormula !== formula) return;
      const scale = color.ratios ?? 'default';
      map.set(scale, (map.get(scale) ?? 0) + 1);
    });
    return map;
  }, [config, formula]);

  return (
    <div class="scales-manager">
      <div class="scales-head">
        <p class="scales-hint">
          Contrast scales define the target contrast of every step against the theme background.
          Colors pick a scale with their <code>ratios</code> field; the <code>default</code> scale
          is mandatory. Drag the markers, edit the numbers, or regenerate the distribution with a
          curve.
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
                  disabled={builtin || usedBy > 0}
                  title={
                    name === 'default'
                      ? 'the default scale is mandatory'
                      : builtin
                        ? 'built-in scales cannot be deleted'
                        : usedBy > 0
                          ? 'reassign the colors using this scale first'
                          : 'delete scale'
                  }
                  onClick={() => onDeleteScale(name)}
                >
                  delete
                </button>
              </div>
            </div>

            <DistributionStrip
              values={values}
              axis={axis}
              onChange={(next) => onChangeScale(name, next)}
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
                      onChangeScale(
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
                      onChangeScale(
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
                  onChangeScale(name, next);
                }}
              >
                + step
              </button>
            </div>

            <CurveGenerator
              axis={axis}
              count={values.length}
              onApply={(next) => onChangeScale(name, next)}
            />

            {sample && (
              <div
                class="scale-sample"
                title="selected color rendered with this scale (light mode)"
              >
                {sample.map((value) => (
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
