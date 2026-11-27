import type { ComponentChildren } from 'preact';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { Formula, MagmaConfig } from '@maggioli-design-system/design-tokens/src/lib/color.mjs';
import {
  CONTRAST_RANGE,
  classifyRatioTarget,
} from '@maggioli-design-system/design-tokens/src/lib/contrast-range.js';
import {
  EASINGS,
  EASING_FAMILIES,
  type EasingFn,
} from '@maggioli-design-system/design-tokens/src/lib/easing.mjs';
import { applyFrame, type Scheme } from '../../shared/frames/frame.js';
import { Field, Select, TextInput, type Option } from '../../shared/magma/magma.js';
import type { Painted } from '../../engine/paints.js';
import { sceneStyle, type ConfigTheme } from '../../engine/scene-css.js';
import { onScale } from '../../engine/families.js';
import { forceHover, settled, statesMarkup, statesPlan } from '../../shared/frames/states.js';
import { msg, useT, type T } from '../../shared/i18n/i18n.js';
import type { ThemeChoices } from '../../engine/theme-choices.js';
import type { RatioSet } from '../../state/scales.js';
import './scale.css';

/*
  The pieces of the page of a contrast scale (scale.tsx, #1403; the Contrast scales page until
  then): the axis of its steps and its distribution, the fields of Magma for the stops, mds-modal
  for the rename, the states of the sample colour solved on the scale (states.ts, #1308), in one
  mode at a time. The axis of the stops stays native: Magma has no range of several values yet
  (#1261).
*/

export type { RatioSet };

/**
 * Origin of a scale relative to the generator's built-in defaults:
 * - 'custom': defined entirely by the config, not shipped with magma
 * - 'builtin': shipped with magma and shown as-is (the config leaves it alone)
 * - 'builtin-overridden': shipped with magma but redefined by the config
 */
export type ScaleOrigin = 'custom' | 'builtin' | 'builtin-overridden';

interface AxisConfig {
  min: number;
  /** render extent; may exceed the ceiling so out-of-band stops stay visible */
  max: number;
  /** the formula's highest reachable target (band edge); beyond it clamps */
  ceiling: number;
  /** APCA dead-zone edge: below this Lc the formula reports 0 (wcag3 only) */
  lowClamp?: number;
  precision: number;
  tick: number;
}

export function axisFor(formula: Formula, values: number[]): AxisConfig {
  const bounds = CONTRAST_RANGE[formula];
  // extend the render range past the ceiling when a stop is out of band, so it
  // is shown sitting in the shaded "unreachable" zone rather than clipped
  const max = Math.max(bounds.max, ...values);
  if (formula === 'wcag2') {
    return { min: bounds.min, max, ceiling: bounds.max, precision: 2, tick: 2 };
  }
  // wcag3 (APCA Lc): usable band is lowClamp..ceiling (issue #578)
  return {
    min: bounds.min,
    max,
    ceiling: bounds.max,
    lowClamp: bounds.lowClamp,
    precision: 0,
    tick: 10,
  };
}

export function roundTo(value: number, precision: number): number {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

/** A number the person typed, or null when the field holds no number. */
export function numberOf(raw: string): number | null {
  if (raw.trim() === '') return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export const sameStops = (a: number[], b: number[]) =>
  a.length === b.length && a.every((value, index) => value === b[index]);

// The values are contrast against the theme background, not lightness:
// 0 sits on the background, the maximum is the strongest contrast (dark in
// light mode, light in dark mode). Distributions are expressed as easing
// functions over that axis, the named easings of the engine (easing.mts, which the hue shift ramps
// its weights with too); dragging or typing a stop switches to manual.

export type EasingName = string;

// mds-input-select takes a flat list of options: the families follow each other in their order
export const EASING_OPTIONS: Option[] = [
  { value: 'manual', label: msg('manual') },
  ...Object.values(EASING_FAMILIES)
    .flat()
    .map((name) => ({ value: name, label: name })),
];

// the label of wcag3 is names and numbers only, the same in every language
export const FORMULA_OPTIONS: Option[] = [
  { value: 'wcag3', label: 'wcag3 (APCA Lc, 0-106)' },
  { value: 'wcag2', label: msg('wcag2 (ratio, 1-21)') },
];

/** The options of a select in the language of the page: their labels marked with msg(). */
export const translated = (t: T, options: Option[]): Option[] =>
  options.map((option) => ({ ...option, label: t(option.label) }));

interface CommitInputProps {
  value: string;
  onCommit: (value: string) => void;
  /** The visible label: the field is wrapped in an mds-input-field. */
  field?: string;
  /** The accessible name, when the field has no visible label. */
  label?: string;
  type?: 'text' | 'number';
  size?: 'sm' | 'md' | 'lg';
  min?: number;
  max?: number;
  step?: number | string;
  class?: string;
}

/**
 * A number field of the page that hands its value back when the person commits it (TextInput,
 * commit "leave"): a stop handed back at every key would be sorted under the caret, a count of
 * steps would regenerate the scale at every digit. With a `field` it carries its label.
 */
export function CommitInput({
  value,
  onCommit,
  field,
  class: className,
  ...input
}: CommitInputProps) {
  const control = <TextInput {...input} commit="leave" value={value} onValue={onCommit} />;
  return <div class={className}>{field ? <Field label={field}>{control}</Field> : control}</div>;
}

interface DistributionStripProps {
  values: number[];
  axis: AxisConfig;
  formula: Formula;
  onChange: (values: number[]) => void;
}

/**
 * Horizontal axis showing where every contrast stop of a scale sits.
 * Markers are draggable; neighbors act as bounds so the order of the
 * stops is preserved while dragging. The usable band is shaded: a dead
 * zone below the APCA low-contrast clamp and an unreachable zone above the
 * ceiling (issue #578), and out-of-band stops are flagged. The numeric
 * stops under it are the way to the same values from the keyboard.
 */
// until Magma has a range of several values: #1261
export function DistributionStrip({ values, axis, formula, onChange }: DistributionStripProps) {
  const t = useT();
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
  for (let at = axis.min; at <= axis.max; at += axis.tick) ticks.push(roundTo(at, 0));

  return (
    <div class="scales-strip" ref={stripRef}>
      <div class="scales-track" />
      {axis.lowClamp !== undefined && position(axis.lowClamp) > 0 && (
        <div
          class="scales-band"
          style={{ left: 0, width: `${position(axis.lowClamp)}%` }}
          title={t(
            'dead zone: below Lc {clamp} APCA reports 0 and the step collapses toward the background',
            { clamp: axis.lowClamp },
          )}
        />
      )}
      <div
        class="scales-band"
        style={{ left: `${position(axis.ceiling)}%`, right: 0 }}
        title={t(
          'unreachable: above the {formula} ceiling ({ceiling}) the step clamps to the pure extreme',
          { formula, ceiling: axis.ceiling },
        )}
      />
      <div class="scales-band-edge" style={{ left: `${position(axis.ceiling)}%` }} />
      {ticks.map((tick) => (
        <div class="scales-tick" style={{ left: `${position(tick)}%` }} aria-hidden="true">
          <span>{tick}</span>
        </div>
      ))}
      {values.map((value, index) => {
        const issue = classifyRatioTarget(value, formula);
        return (
          <div
            class="scales-marker"
            data-severity={issue?.severity}
            style={{ left: `${position(value)}%` }}
            title={
              issue
                ? t('step {step}: {value} - {issue}', {
                    step: index + 1,
                    value,
                    issue: issue.message,
                  })
                : t('step {step}: {value}', { step: index + 1, value })
            }
            onPointerDown={startDrag(index)}
          >
            <span class="scales-value">{value}</span>
          </div>
        );
      })}
    </div>
  );
}

interface DistributionControlsProps {
  axis: AxisConfig;
  values: number[];
  easing: EasingName;
  onEasingChange: (easing: EasingName) => void;
  onApply: (values: number[]) => void;
  /**
   * A built-in scale: its number of steps stays (question 10 of the object model), so the easing
   * regenerates its targets on the steps it has and offers no field for their number.
   */
  locked?: boolean;
  /** The actions of the row, after its fields: the Reset of the scale. */
  children?: ComponentChildren;
}

/**
 * Distribution mode of a scale: one of the named easings (stops are
 * regenerated live from steps/min/max) or "manual" (stops are whatever
 * the user dragged or typed).
 */
export function DistributionControls({
  axis,
  values,
  easing,
  onEasingChange,
  onApply,
  locked = false,
  children,
}: DistributionControlsProps) {
  const t = useT();
  const [steps, setSteps] = useState(values.length);
  const [min, setMin] = useState(values[0] ?? axis.min);
  const [max, setMax] = useState(values[values.length - 1] ?? axis.max);

  const apply = (easingName: EasingName, s = steps, lo = min, hi = max) => {
    // a name the select offers, or manual, which has no function
    const fn = (EASINGS as Record<string, EasingFn | undefined>)[easingName];
    if (!fn) return;
    const generated = Array.from({ length: s }, (_, i) => {
      const at = s === 1 ? 1 : i / (s - 1);
      return roundTo(lo + (hi - lo) * fn(at), axis.precision);
    });
    onApply(generated);
  };

  // a field left with no number keeps the value it had; the steps stay whole, 2 to 24
  const update = (setter: (v: number) => void, key: 'steps' | 'min' | 'max') => (raw: string) => {
    const typed = numberOf(raw);
    if (typed === null) return;
    const value = key === 'steps' ? Math.min(24, Math.max(2, Math.round(typed))) : typed;
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
  const step = axis.precision === 0 ? 1 : 0.01;

  return (
    <div class="flex flex-wrap items-end gap-inline [&>mds-input-field]:w-5600 [&>mds-button]:self-end">
      <Field label={t('Distribution')}>
        <Select
          value={easing}
          options={translated(t, EASING_OPTIONS)}
          onValue={(next) => {
            onEasingChange(next);
            if (next === 'manual') return;
            if (easing !== 'manual') {
              apply(next);
              return;
            }
            // from manual, the fields of the easing start from the stops it replaces, those
            // dragged, typed or reset since, not from the ones they held before (#1330)
            const lo = values[0] ?? axis.min;
            const hi = values[values.length - 1] ?? axis.max;
            setSteps(values.length);
            setMin(lo);
            setMax(hi);
            apply(next, values.length, lo, hi);
          }}
        />
      </Field>
      {easing !== 'manual' && (
        <>
          {!locked && (
            <CommitInput
              class="w-3200"
              field={t('Steps')}
              type="number"
              min={2}
              max={24}
              step={1}
              value={String(steps)}
              onCommit={update(setSteps, 'steps')}
            />
          )}
          <CommitInput
            class="w-3200"
            field={t('Min')}
            type="number"
            step={step}
            value={String(min)}
            onCommit={update(setMin, 'min')}
          />
          <CommitInput
            class="w-3200"
            field={t('Max')}
            type="number"
            step={step}
            value={String(max)}
            onCommit={update(setMax, 'max')}
          />
        </>
      )}
      {children}
    </div>
  );
}

interface RenameDialogProps {
  name: string;
  ratioSet: RatioSet;
  onRename: (nextName: string) => void;
  onClose: () => void;
}

/** The new name of a scale: the colours and groups that use it follow it (app.tsx). */
export function RenameDialog({ name, ratioSet, onRename, onClose }: RenameDialogProps) {
  const t = useT();
  const [draft, setDraft] = useState(name);
  const next = draft.trim();
  const problem =
    next === ''
      ? t('Write a name')
      : next !== name && ratioSet[next]
        ? t('A scale named "{name}" exists already', { name: next })
        : null;
  const ready = !problem && next !== name;
  const submit = () => {
    if (!ready) return;
    onRename(next);
    onClose();
  };
  const title = t('Rename the scale {name}', { name });
  const onKeydown = {
    onmdsInputKeydown: (event: CustomEvent<KeyboardEvent>) => {
      if (event.detail?.key === 'Enter') submit();
    },
  };
  return (
    <mds-modal opened aria-label={title} onmdsModalClose={onClose}>
      <mds-banner
        slot="window"
        variant="light"
        tone="box"
        dismissible
        headline={title}
        onmdsBannerClose={onClose}
      >
        <div class="studio-dialog" {...onKeydown}>
          <Field
            label={t('Name')}
            message={problem ?? t('The colors and the groups that use the scale take the new name')}
          >
            <TextInput value={draft} onValue={setDraft} />
          </Field>
        </div>
        <mds-button
          slot="action"
          type="button"
          variant="dark"
          tone="outline"
          label={t('Cancel')}
          onClick={onClose}
        ></mds-button>
        <mds-button
          slot="action"
          type="button"
          disabled={!ready}
          label={t('Rename')}
          onClick={submit}
        ></mds-button>
      </mds-banner>
    </mds-modal>
  );
}

/** Closes the mds-dropdown a button of the menu stands in. */
export const closeMenu = (event: Event) => {
  const menu = (event.currentTarget as HTMLElement).closest('mds-dropdown') as
    (HTMLElement & { visible?: boolean }) | null;
  if (menu) menu.visible = false;
};

export const SCHEMES: ReadonlyArray<{ id: Scheme; label: string }> = [
  { id: 'light', label: msg('Light') },
  { id: 'dark', label: msg('Dark') },
];

interface ScaleStatesProps {
  config: MagmaConfig;
  family: string;
  scale: string;
  formula: Formula;
  painted: Painted;
  theme: ConfigTheme;
  scheme: Scheme;
  choices: ThemeChoices;
}

/**
 * The states of the sample family solved on a scale: the page of the states (states.html), set as
 * the frame of the Palette is (frame.ts), as tall as what it shows.
 */
export function ScaleStates({
  config,
  family,
  scale,
  formula,
  painted,
  theme,
  scheme,
  choices,
}: ScaleStatesProps) {
  const t = useT();
  const frame = useRef<HTMLIFrameElement>(null);
  const forced = useRef(new WeakSet<object>());
  const [loaded, setLoaded] = useState(0);
  const [height, setHeight] = useState<number>();
  const css = useMemo(
    () => sceneStyle(onScale(config, family, scale, formula), choices)?.css,
    [config, family, scale, formula, choices],
  );
  const plan = useMemo(() => statesPlan(painted), [painted]);
  const markup = plan ? statesMarkup(plan, t) : '';

  useEffect(() => {
    const page = frame.current?.contentDocument;
    const main = page?.getElementById('states');
    if (!page || !main) return;
    applyFrame(page, { theme: theme.name, scheme, contrast: false, css, modes: theme.modes });
    if (main.dataset.markup !== markup) {
      main.innerHTML = markup;
      main.dataset.markup = markup;
    }
    // an iframe takes no height from what it holds: the bottom of the states is its height, read
    // again when the frame narrows or widens and the messages wrap otherwise
    const view = page.defaultView;
    const measure = () =>
      setHeight(
        Math.ceil(
          main.getBoundingClientRect().bottom +
            (view?.scrollY ?? 0) +
            parseFloat(view?.getComputedStyle(page.body).marginBlockEnd ?? '0'),
        ),
      );
    let live = true;
    void settled(page).then(() => {
      if (!live) return;
      forceHover(page, forced.current);
      measure();
    });
    view?.addEventListener('resize', measure);
    return () => {
      live = false;
      view?.removeEventListener('resize', measure);
    };
  }, [css, theme.name, scheme, markup, loaded]);

  return (
    <iframe
      ref={frame}
      class="scales-states"
      src="states.html"
      title={t(
        scheme === 'light'
          ? 'The states of {family} on the scale {scale}, light mode'
          : 'The states of {family} on the scale {scale}, dark mode',
        { family, scale },
      )}
      style={height ? { blockSize: `${height}px` } : undefined}
      onLoad={() => setLoaded((count) => count + 1)}
    />
  );
}
