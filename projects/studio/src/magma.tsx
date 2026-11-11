import type { ComponentChildren } from 'preact';
import { useRef, useState } from 'preact/hooks';
import { useLangOf } from './i18n.js';
import './magma.css';

/*
  The form controls of Magma for the pages of the studio. Each takes its value and hands back the
  next one, as a native control of Preact does, so a page swaps an <input> for one of these and
  keeps its state. The tags come from the Magma installed where the studio runs (vendor.ts).

  The events of Magma carry the value in their detail (the event-detail.ts of each component).
  Preact listens to them by their name: `onmdsInputChange` listens to `mdsInputChange`, since a
  name that starts lowercase is kept as it is.

  mds-input, mds-input-select and mds-input-range emit their change event also when the page sets
  the value (a watcher on `value`): a value equal to the one the page set is that echo, never a
  change of the person, so it is not handed back. A page that tells the edits of the person from
  its own (the names of the colours, app.tsx) depends on it. The value the page set is read from
  a ref written while rendering, not from the handler: Preact applies the props in the order they
  are written, so the new `value` reaches the component, whose watcher emits at once, while the
  handler of the previous render is still attached.

  Sizes: the fields of a form keep the size of Magma; a control inside a row of other controls (the
  steps of a scale, a toolbar, a cell) takes `size="md"`, a choice of the composition, not of the
  density (docs/agents/patterns/density.md, "Not here").
*/

type Detail<T> = CustomEvent<T>;

/**
 * The swatch of a colour as the icon of an mds-chip, until mds-chip has a swatch of its own
 * (#1263): mds-icon draws the markup of an <svg> it is given (its `name`), and the fill of the
 * disc wins over the one the chip sets on its icon. The ring takes the colour of the text of the
 * chip, so a white or empty swatch stays visible in both modes; the page clears the background
 * of the icon (--mds-chip-icon-background, public). The colour goes into markup: anything but the
 * characters of a CSS colour (a quote, a bracket) draws an empty swatch instead.
 */
export const swatchIcon = (color: string | undefined): string => {
  const fill = color && /^[#\w(),.%\s/-]+$/.test(color) ? color : 'none';
  return `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="${fill}" stroke="currentColor" stroke-opacity="0.3" stroke-width="1.5"/></svg>`;
};

/** The variants a field takes to say how its value stands (`mds-input-field`, `mds-input`). */
export type FieldVariant = 'error' | 'info' | 'success' | 'warning';

/** A field with its label above and its message below (`mds-input-field`). */
export function Field({
  label,
  message,
  variant,
  short,
  children,
}: {
  label: string;
  message?: string;
  /** How the value stands; the control inside takes the same one. */
  variant?: FieldVariant;
  short?: boolean;
  children: ComponentChildren;
}) {
  return (
    <mds-input-field label={label} message={message} variant={variant} short={short}>
      {children}
    </mds-input-field>
  );
}

/** The value the page sets in this render, for the echo its change event sends back at once. */
function useSet<T>(value: T) {
  const set = useRef(value);
  set.current = value;
  return set;
}

/**
 * A text or number field (`mds-input`); the value is a string, as the one of an <input>.
 *
 * `commit` says when the value is handed back. `key`, the default: at every key, as `onInput`.
 * `leave`: when the person commits it, as the change event of a native input: on Enter, on
 * leaving the field, and at once when it changes with the focus elsewhere (the arrows of a number
 * field). A value the page parses or sorts takes `leave`: a stop of a scale handed back at every
 * key is sorted under the caret, a name meets another one halfway and selects it, a list of
 * export groups loses the comma just typed. Until the person commits, the field shows what they
 * typed; after a commit, and whenever the page changes the value, the value of the page again,
 * which may have normalised or refused it.
 */
export function TextInput({
  value,
  onValue,
  commit = 'key',
  type = 'text',
  size,
  label,
  placeholder,
  variant,
  min,
  max,
  step,
  disabled,
}: {
  value: string;
  onValue: (value: string) => void;
  commit?: 'key' | 'leave';
  type?: 'text' | 'number' | 'search';
  size?: 'sm' | 'md' | 'lg';
  /** The accessible name, when no mds-input-field labels it. */
  label?: string;
  placeholder?: string;
  variant?: FieldVariant;
  min?: number;
  max?: number;
  step?: number | string;
  disabled?: boolean;
}) {
  const set = useSet(value);
  // what the field shows with commit "leave": what the person typed, until a commit or a new
  // value of the page; kept in refs and settled while rendering, never in an effect, which runs
  // after paint and would drop what the person types in between
  const typed = useRef(value);
  const taken = useRef(value);
  if (taken.current !== value) {
    taken.current = value;
    typed.current = value;
  }
  const focused = useRef(false);
  const [, redraw] = useState(0);

  const leave = commit === 'leave';
  const handOver = () => {
    const text = typed.current;
    // back to the value of the page, which a new one handed back replaces at the next render
    typed.current = set.current;
    if (text !== set.current) onValue(text);
    redraw((count) => count + 1);
  };
  return (
    <mds-input
      type={type}
      value={leave ? typed.current : value}
      size={size}
      aria-label={label}
      aria-invalid={variant === 'error' ? 'true' : undefined}
      placeholder={placeholder}
      variant={variant}
      min={min}
      max={max}
      step={step === undefined ? undefined : String(step)}
      disabled={disabled}
      onmdsInputChange={(event: Detail<{ value?: string }>) => {
        const next = event.detail?.value ?? '';
        if (!leave) {
          if (next !== set.current) onValue(next);
          return;
        }
        if (next === typed.current) return;
        typed.current = next;
        redraw((count) => count + 1);
        if (!focused.current) handOver();
      }}
      onmdsInputFocus={() => {
        focused.current = true;
      }}
      onmdsInputBlur={() => {
        focused.current = false;
        if (leave) handOver();
      }}
      onmdsInputKeydown={(event: Detail<KeyboardEvent>) => {
        if (leave && event.detail?.key === 'Enter') handOver();
      }}
    />
  );
}

/**
 * A colour as the colour field writes it, `#rrggbb` in lower case, or `''` when it names none: the
 * reading of `mds-input` (its meta/color.ts), which takes `#rgb` and any case. The configuration
 * allows those too (and an alpha, which the field refuses), so the field echoes `#ABC` set by the
 * page as `#aabbcc`: still an echo, not a colour of the person.
 */
const fieldColor = (text: string): string => {
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text.trim());
  if (!match) return '';
  const digits = match[1].toLowerCase();
  return `#${digits.length === 3 ? digits.replace(/./g, '$&$&') : digits}`;
};

/**
 * A colour field (`mds-input` with `type="color"`, #1260): the code typed, or picked with its
 * button in the picker of the platform. Each colour is handed back as it comes, as `#rrggbb`:
 * a code typed, each step of a drag in the picker. The `''` the field holds while its text names
 * no colour, or is empty, is never handed back: a colour of the studio always has one, and keeps
 * the last while the field shows its error (`required`, and the message of `mds-input-field`).
 */
export function ColorInput({
  value,
  onValue,
  label,
}: {
  value: string;
  onValue: (value: string) => void;
  /** The accessible name, when no mds-input-field labels it. */
  label?: string;
}) {
  const set = useSet(value);
  return (
    <mds-input
      type="color"
      value={value}
      aria-label={label}
      required
      onmdsInputChange={(event: Detail<{ value?: string }>) => {
        const next = event.detail?.value ?? '';
        if (next !== '' && next !== fieldColor(set.current)) onValue(next);
      }}
    />
  );
}

export interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}

/** A select (`mds-input-select`) of the options given. */
export function Select({
  value,
  onValue,
  options,
  size,
  label,
  placeholder,
  disabled,
}: {
  value: string;
  onValue: (value: string) => void;
  options: Option[];
  size?: 'sm' | 'md' | 'lg';
  /** The accessible name, when no mds-input-field labels it. */
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  const set = useSet(value);
  return (
    <mds-input-select
      value={value}
      size={size}
      aria-label={label}
      placeholder={placeholder}
      disabled={disabled}
      onmdsInputSelectChange={(event: Detail<{ value?: string }>) => {
        const next = event.detail?.value ?? '';
        if (next !== set.current) onValue(next);
      }}
    >
      {options.map((option) => (
        <option value={option.value} disabled={option.disabled} selected={option.value === value}>
          {option.label}
        </option>
      ))}
    </mds-input-select>
  );
}

/**
 * A checkbox, a switch or a radio (`mds-input-switch`), its label beside it. mds-input-switch has
 * no `label`: its text is its slot, which it reads once into the name of its control, so it is
 * keyed by the language and mounts again, reading the new text, when the language changes (#1336);
 * its state comes from the props and survives.
 */
export function Check({
  checked,
  onChecked,
  children,
  type = 'checkbox',
  name,
  value,
  disabled,
}: {
  checked: boolean;
  onChecked: (checked: boolean) => void;
  children: ComponentChildren;
  type?: 'checkbox' | 'switch' | 'radio';
  name?: string;
  value?: string;
  disabled?: boolean;
}) {
  const lang = useLangOf();
  return (
    <mds-input-switch
      key={lang}
      type={type}
      name={name}
      value={value}
      checked={checked}
      disabled={disabled}
      onmdsInputSwitchChange={(event: Detail<{ checked: boolean }>) =>
        onChecked(event.detail.checked)
      }
    >
      {children}
    </mds-input-switch>
  );
}

/**
 * A slider (`mds-input-range`) of one value. mds-input-range names its slider with its own text
 * and draws that text over the track, never with the aria-label of its host: the label goes in as
 * text, hidden from the eye where the page shows its own label beside the slider. It reads that
 * text once: keyed by the language, it mounts again and reads the new one when the language
 * changes (#1336).
 */
export function Range({
  value,
  onValue,
  min,
  max,
  step = 1,
  label,
  showLabel,
  disabled,
}: {
  value: number;
  onValue: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  /** The accessible name. */
  label: string;
  /** Draw the label over the track too; by default only assistive technologies read it. */
  showLabel?: boolean;
  disabled?: boolean;
}) {
  const set = useSet(value);
  const lang = useLangOf();
  return (
    <mds-input-range
      key={lang}
      value={value}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      onmdsInputRangeChange={(event: Detail<number>) => {
        const next = Number(event.detail);
        if (next !== set.current) onValue(next);
      }}
    >
      <span class={showLabel ? undefined : 'studio-hidden'}>{label}</span>
    </mds-input-range>
  );
}
