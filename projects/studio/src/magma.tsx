import type { ComponentChildren } from 'preact';
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
  its own (the names of the colours, app.tsx) depends on it.

  Sizes: the fields of a form keep the size of Magma; a control inside a row of other controls (the
  steps of a scale, a toolbar, a cell) takes `size="md"`, a choice of the composition, not of the
  density (docs/agents/patterns/density.md, "Not here").
*/

type Detail<T> = CustomEvent<T>;

/** A field with its label above and its message below (`mds-input-field`). */
export function Field({
  label,
  message,
  short,
  children,
}: {
  label: string;
  message?: string;
  short?: boolean;
  children: ComponentChildren;
}) {
  return (
    <mds-input-field label={label} message={message} short={short}>
      {children}
    </mds-input-field>
  );
}

/** A text or number field (`mds-input`); the value is a string, as the one of an <input>. */
export function TextInput({
  value,
  onValue,
  type = 'text',
  size,
  label,
  placeholder,
  min,
  max,
  step,
  disabled,
}: {
  value: string;
  onValue: (value: string) => void;
  type?: 'text' | 'number' | 'search';
  size?: 'sm' | 'md' | 'lg';
  /** The accessible name, when no mds-input-field labels it. */
  label?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number | string;
  disabled?: boolean;
}) {
  return (
    <mds-input
      type={type}
      value={value}
      size={size}
      aria-label={label}
      placeholder={placeholder}
      min={min}
      max={max}
      step={step === undefined ? undefined : String(step)}
      disabled={disabled}
      onmdsInputChange={(event: Detail<{ value?: string }>) => {
        const next = event.detail?.value ?? '';
        if (next !== value) onValue(next);
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
  return (
    <mds-input-select
      value={value}
      size={size}
      aria-label={label}
      placeholder={placeholder}
      disabled={disabled}
      onmdsInputSelectChange={(event: Detail<{ value?: string }>) => {
        const next = event.detail?.value ?? '';
        if (next !== value) onValue(next);
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

/** A checkbox, a switch or a radio (`mds-input-switch`), its label beside it. */
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
  return (
    <mds-input-switch
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

/** A slider (`mds-input-range`) of one value. */
export function Range({
  value,
  onValue,
  min,
  max,
  step = 1,
  label,
  disabled,
}: {
  value: number;
  onValue: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  /** The accessible name. */
  label: string;
  disabled?: boolean;
}) {
  return (
    <mds-input-range
      value={value}
      min={min}
      max={max}
      step={step}
      aria-label={label}
      disabled={disabled}
      onmdsInputRangeChange={(event: Detail<number>) => {
        const next = Number(event.detail);
        if (next !== value) onValue(next);
      }}
    />
  );
}
