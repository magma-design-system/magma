import type { ComponentChildren } from 'preact';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { Formula, MagmaConfig } from '@maggioli-design-system/design-tokens/src/lib/color.mjs';
import {
  resolveFormula,
  resolveRatiosName,
} from '@maggioli-design-system/design-tokens/src/lib/color.mjs';
import {
  CONTRAST_RANGE,
  classifyRatioTarget,
} from '@maggioli-design-system/design-tokens/src/lib/contrast-range.js';
import {
  EASINGS,
  EASING_FAMILIES,
  type EasingFn,
} from '@maggioli-design-system/design-tokens/src/lib/easing.mjs';
import { COLOR_MODES } from '@maggioli-design-system/design-tokens/src/lib/theme-manifest.mjs';
import { applyFrame, type Scheme } from './frame.js';
import { Field, Select, TextInput, swatchIcon, type Option } from './magma.js';
import { paintedBy, type Painted } from './paints.js';
import { sceneStyle, type ConfigTheme } from './scene-css.js';
import { forceHover, settled, statesMarkup, statesPlan } from './states.js';
import { msg, plural, rich, useT, type T } from './i18n.js';
import { useThemeChoices, type ThemeChoices } from './theme-choices.js';
import './scales.css';

/*
  The Contrast scales page of the studio, written in Magma (src/magma.tsx): one card per scale
  (mds-card, its title the part title, its actions in the menu of the card with Delete last,
  docs/agents/patterns/actions.md, destructive-in-menu), the fields of Magma for the stops and the
  distribution, mds-modal for the rename and for the confirmation of a delete. The axis of the
  stops stays native: Magma has no range of several values yet (#1261). The colours of the usage
  panel are selectable mds-chips, their swatch the icon (swatchIcon, until #1263).

  Beside each card, where the page has the room, the sample colour solved on the scale paints the
  components it paints in every state (states.ts, #1308), in one mode at a time, chosen once for
  the page as the side of the Palette chooses it (decided with vittorio, 2026-11-07); narrower,
  the states go under the card.
*/

export interface RatioSet {
  [scaleName: string]: number[];
}

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

function axisFor(formula: Formula, values: number[]): AxisConfig {
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

function roundTo(value: number, precision: number): number {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

/** A number the person typed, or null when the field holds no number. */
function numberOf(raw: string): number | null {
  if (raw.trim() === '') return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

const sameStops = (a: number[], b: number[]) =>
  a.length === b.length && a.every((value, index) => value === b[index]);

// The values are contrast against the theme background, not lightness:
// 0 sits on the background, the maximum is the strongest contrast (dark in
// light mode, light in dark mode). Distributions are expressed as easing
// functions over that axis, the named easings of the engine (easing.mts, which the hue shift ramps
// its weights with too); dragging or typing a stop switches to manual.

export type EasingName = string;

// mds-input-select takes a flat list of options: the families follow each other in their order
const EASING_OPTIONS: Option[] = [
  { value: 'manual', label: msg('manual') },
  ...Object.values(EASING_FAMILIES)
    .flat()
    .map((name) => ({ value: name, label: name })),
];

// the label of wcag3 is names and numbers only, the same in every language
const FORMULA_OPTIONS: Option[] = [
  { value: 'wcag3', label: 'wcag3 (APCA Lc, 0-106)' },
  { value: 'wcag2', label: msg('wcag2 (ratio, 1-21)') },
];

/** The options of a select in the language of the page: their labels marked with msg(). */
const translated = (t: T, options: Option[]): Option[] =>
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
function CommitInput({ value, onCommit, field, class: className, ...input }: CommitInputProps) {
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
function DistributionStrip({ values, axis, formula, onChange }: DistributionStripProps) {
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
  /** The actions of the row, after its fields: the Reset of the scale. */
  children?: ComponentChildren;
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
    <div class="scales-distribution">
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
          <CommitInput
            class="scales-distribution-number"
            field={t('Steps')}
            type="number"
            min={2}
            max={24}
            step={1}
            value={String(steps)}
            onCommit={update(setSteps, 'steps')}
          />
          <CommitInput
            class="scales-distribution-number"
            field={t('Min')}
            type="number"
            step={step}
            value={String(min)}
            onCommit={update(setMin, 'min')}
          />
          <CommitInput
            class="scales-distribution-number"
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
function RenameDialog({ name, ratioSet, onRename, onClose }: RenameDialogProps) {
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

interface DeleteDialogProps {
  name: string;
  usedBy: number;
  onDelete: () => void;
  onClose: () => void;
}

/** The confirmation of the delete of a scale some colours use (actions.md, confirm). */
function DeleteDialog({ name, usedBy, onDelete, onClose }: DeleteDialogProps) {
  const t = useT();
  const title = t('Delete the scale {name}?', { name });
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
        <div class="studio-dialog">
          <mds-text typography="detail" tag="p">
            {plural(
              t,
              usedBy,
              'The scale "{name}" is used by {count} color: deleting it reassigns them to the "default" scale.',
              'The scale "{name}" is used by {count} colors: deleting it reassigns them to the "default" scale.',
              { name },
            )}
          </mds-text>
        </div>
        <mds-button
          slot="action"
          type="button"
          variant="dark"
          tone="outline"
          autofocus
          label={t('Cancel')}
          onClick={onClose}
        ></mds-button>
        <mds-button
          slot="action"
          type="button"
          variant="error"
          tone="strong"
          label={t('Delete')}
          onClick={() => {
            onDelete();
            onClose();
          }}
        ></mds-button>
      </mds-banner>
    </mds-modal>
  );
}

/** Closes the mds-dropdown a button of the menu stands in. */
const closeMenu = (event: Event) => {
  const menu = (event.currentTarget as HTMLElement).closest('mds-dropdown') as
    (HTMLElement & { visible?: boolean }) | null;
  if (menu) menu.visible = false;
};

const SCHEMES: ReadonlyArray<{ id: Scheme; label: string }> = [
  { id: 'light', label: msg('Light') },
  { id: 'dark', label: msg('Dark') },
];

/**
 * The configuration with the sample family solved on a scale, as the sample under each axis is
 * (app.tsx, sampleScales): the scale and the formula of the page, no hue shift of its own.
 */
export function onScale(
  config: MagmaConfig,
  family: string,
  scale: string,
  formula: Formula,
): MagmaConfig {
  return {
    ...config,
    colors: config.colors.map((color) =>
      color.name === family ? { ...color, ratios: scale, formula, hueShift: undefined } : color,
    ),
  };
}

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
function ScaleStates({
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

interface ScalesManagerProps {
  config: MagmaConfig;
  formula: Formula;
  ratioSet: RatioSet;
  /**
   * The scales of the configuration last loaded (app.tsx): what the Reset of a scale takes it back
   * to (#1330). A scale it has no entry for, added or renamed since, has nothing to go back to.
   */
  loaded: RatioSet;
  /**
   * Scales shipped with the generator: deleting one writes a null entry in
   * the config (the generator would merge it back from its defaults) and
   * renaming is not allowed.
   */
  builtinScales: string[];
  sampleScales: Map<string, string[]>;
  selectedName: string;
  /** display label for a scale name (tags built-in scales in selects) */
  labelFor: (name: string) => string;
  /** origin of a scale, used to render its badge on the card */
  originFor: (name: string) => ScaleOrigin;
  onSelectColor: (name: string) => void;
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
  loaded,
  builtinScales,
  sampleScales,
  selectedName,
  labelFor,
  originFor,
  onSelectColor,
  onFormulaChange,
  onChangeScale,
  onRenameScale,
  onAddScale,
  onDeleteScale,
}: ScalesManagerProps) {
  const t = useT();
  // scale under inspection in the usage panel
  const [inspectedState, setInspected] = useState('default');
  const inspected = ratioSet[inspectedState] ? inspectedState : 'default';
  // the dialog open, if any: the rename of a scale or the confirmation of its delete
  const [dialog, setDialog] = useState<{ kind: 'rename' | 'delete'; name: string } | null>(null);

  const involved = useMemo(() => {
    const byGroup = new Map<string, typeof config.colors>();
    config.colors.forEach((color) => {
      if (resolveFormula(color, config) !== formula) return;
      if (resolveRatiosName(color, config) !== inspected) return;
      const group = color.name.split('.')[0];
      if (!byGroup.has(group)) byGroup.set(group, []);
      byGroup.get(group)!.push(color);
    });
    return byGroup;
  }, [config, formula, inspected]);
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

  const scaleOptions: Option[] = Object.keys(ratioSet).map((name) => ({
    value: name,
    label: labelFor(name),
  }));

  // what the sample paints, in the theme it is seen in (paints.ts), and the mode of its states
  const choices = useThemeChoices();
  const themes = useMemo(() => sceneStyle(config, choices)?.themes ?? [], [config, choices]);
  const painted = useMemo(
    () => paintedBy(selectedName, { config, themes, choices }),
    [selectedName, config, themes, choices],
  );
  // an alias takes the ramp of its source whatever its scale (color.mts): no scale moves it
  const source = config.colors.find((color) => color.name === selectedName)?.alias;
  const statesTheme = painted.variants.length > 0 && !source ? painted.theme : undefined;
  const [picked, setScheme] = useState<Scheme>('light');
  const modes: readonly Scheme[] = statesTheme?.modes ?? COLOR_MODES;
  const scheme: Scheme = modes.includes(picked) ? picked : modes[0];
  const sampleName = selectedName.split('.')[1] ?? selectedName;

  return (
    <div class="scales-page">
      <div class="scales-intro">
        <mds-text typography="detail" tag="p" class="scales-muted scales-reading">
          {rich(
            t,
            'Contrast scales define the target contrast of every step {against}: 0 sits on the background, the maximum is the strongest contrast (dark in light mode, light in dark mode). Colors pick a scale with their {ratios} field; the {default} scale is mandatory. Pick a distribution easing, or drag the markers / edit the numbers to go manual; Reset takes a scale back to the steps of the configuration loaded.',
            {
              against: <em>{t('against the theme background')}</em>,
              // the name of a field and of a scale: code, the same in every language
              ratios: <code>{'ratios'}</code>,
              default: <code>{'default'}</code>,
            },
          )}
        </mds-text>
        <div class="scales-formula">
          <Field label={t('Formula')}>
            <Select
              value={formula}
              options={translated(t, FORMULA_OPTIONS)}
              onValue={(next) => onFormulaChange(next as Formula)}
            />
          </Field>
        </div>
      </div>

      <mds-card class="scales-usage">
        <mds-card-header>
          <mds-text typography="part" tag="h2">
            {t('The colors of a scale, by group')}
          </mds-text>
        </mds-card-header>
        <mds-card-content>
          <div class="scales-card-body">
            <div class="scales-usage-select">
              <Field label={t('Scale')}>
                <Select
                  value={inspected}
                  options={scaleOptions}
                  onValue={(next) => {
                    setInspected(next);
                    // sample the first color resolving to the scale; an unused
                    // scale keeps the current sample color
                    const first = config.colors.find(
                      (color) =>
                        resolveFormula(color, config) === formula &&
                        resolveRatiosName(color, config) === next,
                    );
                    if (first) onSelectColor(first.name);
                  }}
                />
              </Field>
            </div>
            {involved.size === 0 ? (
              <mds-text typography="detail" tag="p" class="scales-muted">
                {t('No color uses this scale right now')}
              </mds-text>
            ) : (
              <dl class="scales-groups">
                {[...involved.entries()].map(([group, colors]) => (
                  <div class="scales-group" key={group}>
                    <mds-text typography="label" tag="dt" class="scales-muted">
                      {group}
                    </mds-text>
                    <dd class="scales-chips">
                      {colors.map((color) => (
                        <mds-chip
                          key={color.name}
                          class="scales-chip"
                          label={color.name.split('.')[1]}
                          icon={swatchIcon(color.color)}
                          selectable
                          selected={color.name === selectedName}
                          title={t('{name} ({color}) - click to use it as the sample color', {
                            name: color.name,
                            color: color.color,
                          })}
                          onmdsChipSelect={(
                            event: CustomEvent<{ element: HTMLElement; selected?: boolean }>,
                          ) => {
                            onSelectColor(color.name);
                            // one colour is the sample: the chip of the sample, clicked again,
                            // stays selected, though mds-chip unselects itself
                            if (!event.detail?.selected)
                              (event.detail.element as { selected?: boolean }).selected = true;
                          }}
                        ></mds-chip>
                      ))}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </mds-card-content>
      </mds-card>

      <div class="scales-states-head" role="toolbar" aria-label={t('The states beside the scales')}>
        <mds-text typography="detail" tag="p" class="scales-muted">
          {source
            ? t(
                '{name} takes the ramp of {source} whatever its scale: the states of {source} show beside its scales.',
                { name: selectedName, source },
              )
            : statesTheme
              ? t(
                  'Beside each scale, {name} solved on it paints the components it paints, in the theme {theme}.',
                  { name: sampleName, theme: statesTheme.name },
                )
              : t(
                  '{name} paints no component of Magma: no variant of a component takes it, no theme points an accent at it and no theme is drawn from it.',
                  { name: selectedName },
                )}
        </mds-text>
        {statesTheme && (
          <mds-tab
            aria-label={t('Mode')}
            onmdsTabChange={(event: CustomEvent<{ id: number; value?: string }>) => {
              const value = event.detail?.value as Scheme | undefined;
              if (value) setScheme(value);
            }}
          >
            {SCHEMES.map((one) => (
              <mds-tab-item
                type="button"
                label={t(one.label)}
                value={one.id}
                selected={one.id === scheme}
                disabled={!modes.includes(one.id)}
                title={
                  modes.includes(one.id)
                    ? undefined
                    : t(modes[0] === 'light' ? '{theme} is light only' : '{theme} is dark only', {
                        theme: statesTheme.name,
                      })
                }
              ></mds-tab-item>
            ))}
          </mds-tab>
        )}
      </div>

      {Object.keys(ratioSet).map((name, cardIndex) => {
        const values = ratioSet[name];
        const axis = axisFor(formula, values);
        const usedBy = usage.get(name) ?? 0;
        const builtin = builtinScales.includes(name);
        const origin = originFor(name);
        const sample = sampleScales.get(name);
        const menuId = `scales-more-${cardIndex}`;
        const step = axis.precision === 0 ? 1 : 0.01;
        const easing = easings[name] ?? 'manual';
        const loadedStops = loaded[name];
        // Reset is off where it would change nothing, as the Reset of the page is (app.tsx): the
        // scale holds the stops it was loaded with, on manual, or the configuration loaded has no
        // scale of this name. The title says which
        const resetOff = !loadedStops
          ? t('the loaded configuration has no scale named {name}', { name })
          : easing === 'manual' && sameStops(values, loadedStops)
            ? t('{name} holds the steps of the loaded configuration', { name })
            : null;
        return (
          <div class="scales-card" key={name}>
            <div class="scales-card-pair">
              <mds-card>
                <mds-card-header>
                  <div class="scales-card-title">
                    <mds-text typography="part" tag="h2">
                      {name}
                    </mds-text>
                    {origin !== 'custom' && (
                      <mds-badge
                        variant={origin === 'builtin-overridden' ? 'info' : 'dark'}
                        label={t(
                          origin === 'builtin-overridden' ? 'Built-in, overridden' : 'Built-in',
                        )}
                        title={t(
                          origin === 'builtin-overridden'
                            ? 'shipped with magma; shown here because your config overrides its stops'
                            : 'shipped with magma; shown even though it is not in your config',
                        )}
                      ></mds-badge>
                    )}
                    <mds-text typography="detail" class="scales-muted">
                      {t('{steps}, used by {colors}', {
                        steps: plural(t, values.length, '{count} step', '{count} steps'),
                        colors: plural(t, usedBy, '{count} color', '{count} colors'),
                      })}
                    </mds-text>
                  </div>
                  <mds-button
                    slot="action"
                    id={menuId}
                    type="button"
                    icon="mi/baseline/more-vert"
                    variant="dark"
                    tone="text"
                    aria-label={t('Actions of the scale {name}', { name })}
                  ></mds-button>
                </mds-card-header>
                <mds-card-content>
                  <div class="scales-card-body">
                    <DistributionStrip
                      values={values}
                      axis={axis}
                      formula={formula}
                      onChange={(next) => manualChange(name, next)}
                    />

                    <div
                      class="scales-stops"
                      role="group"
                      aria-label={t('The steps of {name}', { name })}
                    >
                      {values.map((value, index) => (
                        <div class="scales-stop">
                          <CommitInput
                            type="number"
                            size="md"
                            label={t('Step {step}', { step: index + 1 })}
                            min={axis.min}
                            max={axis.max}
                            step={step}
                            value={String(value)}
                            onCommit={(raw) => {
                              const typed = numberOf(raw);
                              if (typed === null) return;
                              const clamped = Math.min(axis.max, Math.max(axis.min, typed));
                              const next = [...values];
                              next[index] = roundTo(clamped, axis.precision);
                              manualChange(
                                name,
                                next.sort((a, b) => a - b),
                              );
                            }}
                          />
                          <mds-button
                            type="button"
                            icon="mi/baseline/close"
                            size="sm"
                            variant="dark"
                            tone="text"
                            aria-label={t('Remove step {step}', { step: index + 1 })}
                            title={t('remove step')}
                            disabled={values.length <= 2}
                            onClick={() =>
                              manualChange(
                                name,
                                values.filter((_, i) => i !== index),
                              )
                            }
                          ></mds-button>
                        </div>
                      ))}
                      <mds-button
                        type="button"
                        icon="mi/baseline/add"
                        size="md"
                        variant="dark"
                        tone="outline"
                        title={t('insert a step in the widest gap')}
                        label={t('Add step')}
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
                      ></mds-button>
                    </div>

                    <DistributionControls
                      axis={axis}
                      values={values}
                      easing={easing}
                      onEasingChange={(next) => setEasing(name, next)}
                      onApply={(next) => onChangeScale(name, next)}
                    >
                      <mds-button
                        type="button"
                        icon="mi/baseline/restart-alt"
                        size="lg"
                        variant="dark"
                        tone="outline"
                        disabled={resetOff !== null}
                        title={
                          resetOff ??
                          t(
                            'back to the steps of {name} in the loaded configuration, distribution manual',
                            { name },
                          )
                        }
                        label={t('Reset')}
                        onClick={() => loadedStops && manualChange(name, [...loadedStops])}
                      ></mds-button>
                    </DistributionControls>

                    {sample && (
                      <div
                        class="scales-sample"
                        title={t(
                          'selected color rendered with this scale, ordered like the axis: 0 (background side) to max contrast',
                        )}
                      >
                        {[...sample].reverse().map((value) => (
                          <div class="scales-sample-cell" style={{ background: value }} />
                        ))}
                      </div>
                    )}
                  </div>
                </mds-card-content>
              </mds-card>
              {statesTheme && (
                <ScaleStates
                  config={config}
                  family={selectedName}
                  scale={name}
                  formula={formula}
                  painted={painted}
                  theme={statesTheme}
                  scheme={scheme}
                  choices={choices}
                />
              )}
            </div>
            {/* outside the card: mds-card clips what overflows it */}
            <mds-dropdown target={`#${menuId}`} placement="bottom-end" strategy="fixed">
              <div class="scales-menu">
                <mds-button
                  type="button"
                  icon="mi/baseline/edit"
                  variant="dark"
                  tone="text"
                  disabled={builtin}
                  title={t(
                    name === 'default'
                      ? 'the default scale is mandatory and cannot be renamed'
                      : builtin
                        ? 'built-in scales cannot be renamed'
                        : 'rename scale',
                  )}
                  label={t('Rename')}
                  onClick={(event: Event) => {
                    closeMenu(event);
                    setDialog({ kind: 'rename', name });
                  }}
                ></mds-button>
                <mds-button
                  type="button"
                  icon="mi/baseline/content-copy"
                  variant="dark"
                  tone="text"
                  label={t('Duplicate')}
                  onClick={(event: Event) => {
                    closeMenu(event);
                    onAddScale(name);
                  }}
                ></mds-button>
                <mds-separator></mds-separator>
                <mds-button
                  type="button"
                  icon="mi/baseline/delete"
                  variant="error"
                  tone="text"
                  disabled={name === 'default'}
                  title={
                    name === 'default'
                      ? t('the default scale is mandatory')
                      : usedBy > 0
                        ? plural(
                            t,
                            usedBy,
                            'used by {count} color: deleting reassigns them to the default scale',
                            'used by {count} colors: deleting reassigns them to the default scale',
                          )
                        : t('delete scale')
                  }
                  label={t('Delete')}
                  onClick={(event: Event) => {
                    closeMenu(event);
                    // a scale no color uses goes at once; one in use asks first
                    if (usedBy > 0) setDialog({ kind: 'delete', name });
                    else onDeleteScale(name);
                  }}
                ></mds-button>
              </div>
            </mds-dropdown>
          </div>
        );
      })}

      <mds-button
        class="scales-add"
        type="button"
        icon="mi/baseline/add"
        variant="dark"
        tone="outline"
        label={t('Add scale')}
        onClick={() => onAddScale('default')}
      ></mds-button>

      {dialog?.kind === 'rename' && (
        <RenameDialog
          name={dialog.name}
          ratioSet={ratioSet}
          onRename={(nextName) => onRenameScale(dialog.name, nextName)}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog?.kind === 'delete' && (
        <DeleteDialog
          name={dialog.name}
          usedBy={usage.get(dialog.name) ?? 0}
          onDelete={() => onDeleteScale(dialog.name)}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  );
}
