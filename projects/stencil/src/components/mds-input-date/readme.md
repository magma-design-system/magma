# mds-input-date



<!-- Auto Generated Below -->


## Usage

### 1. Description

The `<mds-input-date>` web component is the Magma Design System control for capturing a single calendar date. It wraps a native `<input type="date">`, adding form association, ISO value validation against an optional `min`/`max` range, contextual tips, and a button-triggered calendar dropdown for visual date picking.

#### Semantic Behavior

- **Form association**: The host participates natively in form submission and exposes its `value` under `name`; on form reset it clears the submitted value (the date shown in the field stays). An invalid value submits nothing, and its invalid state is reported to the form: like a native control, the field matches `:invalid` and stops the submit, with a message in the page language (a missing required date, a date out of the range, an unreadable one). A disabled or read-only field is left out, and `novalidate` on the `<form>` turns the check off.
- **ISO value contract**: `value`, `min`, and `max` are all ISO date strings (`YYYY-MM-DD`); other formats are not accepted.
- **Validation on change**: Validation runs when the component loads, on every value change and whenever `required`, `min` or `max` change (also after load, as with the React wrappers under SSR), and emits `mdsInputValidation` with a boolean. When the date is invalid, missing while `required`, or outside the `min`/`max` range, the component forces `variant` to `'error'` and submits no value; otherwise it restores `'primary'` and submits the value. An empty `required` field is therefore in the `'error'` variant from the start.
- **Range self-correction**: If `max` is earlier than `min`, at load or after a later change of either, `max` is snapped to equal `min`.
- **Selection event**: `mdsInputDateSelect` fires with the new string value whenever `value` changes, whether typed or picked from the calendar.
- **Calendar dropdown**: The trailing calendar button opens a single-date calendar; picking a day writes back the value and, after `delay`, auto-closes.
- **Slotted mode**: When the host carries a `slot` attribute it is treated as embedded - the calendar button, dropdown, and calendar are not rendered, leaving only the bare input for composition inside a larger field.
- **Contextual tips**: A tip surfaces `disabled`, `readonly`, and `required` states; the required tip expands on focus and reflects success once the value is valid.
- **Read-only**: A read-only field shows its tip and auto-selects its text on focus. In the current release the native input is not made read-only and the calendar button stays active, so the value can still be changed.

#### Properties & Visual Configurations

The shared `variant` ladder is defined in [`docs/agents/variants.md`](../../../../../../docs/agents/variants.md). Note that `variant` is mutable here: the component overrides it to `'error'` / `'primary'` as validation dictates, already when it loads, so a variant set in the markup does not survive and one set from script lasts only until the next value change or blur.

#### Other behavioral props

- **`min`** / **`max`** bound the selectable range; dates outside it invalidate the field rather than being silently clamped.
- **`delay`** is the milliseconds to wait before auto-closing the calendar dropdown after a pick; setting it to `0` keeps the dropdown open.
- **`required`** makes an empty or invalid value fail validation and drives the required/required-success tip.


### 2. Pattern

Correct and idiomatic ways to use the `<mds-input-date>` component, ordered from most common to most specialized. Patterns assume a working knowledge of the variant ladder documented in [`docs/agents/variants.md`](../../../../../../docs/agents/variants.md) and the shared component rules in [`docs/agents/conventions.md`](../../../../../../docs/agents/conventions.md).

#### Basic Date Input

The simplest form. Wrap in [`mds-input-field`](../../mds-input-field) to attach a visible label. Use `name` so the value is submitted with the form.

```html
<mds-input-field label="Data di nascita">
  <mds-input-date name="birthdate"></mds-input-date>
</mds-input-field>
```

#### Pre-filled Value

Set `value` to an ISO date string (`YYYY-MM-DD`) to initialize the picker with a known date. Do not use other date formats.

```html
<mds-input-date name="dataScadenza" value="2026-12-31"></mds-input-date>
```

#### Required Field

Add `required` to make an empty or invalid date fail validation. The component surfaces a tip on focus and keeps `variant` on `'error'`, already from load, until the user enters a valid date.

```html
<mds-input-field label="Data di inizio *">
  <mds-input-date name="startDate" required></mds-input-date>
</mds-input-field>
```

#### Bounded Date Range

Use `min` and `max` (both ISO strings) to restrict the selectable range. Dates outside the range invalidate the field and emit `mdsInputValidation` with `false`. If `max` is earlier than `min` at load time, the component snaps `max` to equal `min`.

```html
<mds-input-date
  name="dataSopralluogo"
  min="2026-01-01"
  max="2026-12-31"
></mds-input-date>
```

#### Listening to Value Changes

Listen to `mdsInputDateSelect` (fires with the new ISO string) for every value change - whether typed or picked from the calendar. Listen to `mdsInputValidation` to react to validity changes.

```html
<mds-input-date id="picker" name="dataEvento"></mds-input-date>

<script>
  const picker = document.getElementById('picker');

  picker.addEventListener('mdsInputDateSelect', (e) => {
    console.log('Data selezionata:', e.detail); // "2026-06-15"
  });

  picker.addEventListener('mdsInputValidation', (e) => {
    console.log('Valido:', e.detail); // true | false
  });
</script>
```

#### Programmatic Value via `setValue`

Use the `setValue` method to set the value from JavaScript; it runs validation and emits both events, identical to a user interaction.

```html
<mds-input-date id="datePicker" name="dataConsegna"></mds-input-date>

<script>
  document.getElementById('datePicker').setValue('2026-09-01');
</script>
```

#### Controlling Calendar Auto-close Delay

The calendar dropdown closes `delay` milliseconds after a date is picked (default 500 ms). Set `delay="0"` to keep it open after selection - useful when the picker is used inside a form where the user might want to confirm before the overlay disappears.

```html
<!-- Default: closes 500 ms after pick -->
<mds-input-date name="dataRiunione" delay="500"></mds-input-date>

<!-- Keep open until the user dismisses manually -->
<mds-input-date name="dataRiunione" delay="0"></mds-input-date>
```

#### Disabled and Read-only States

`disabled` blocks all interaction and removes the field from the tab sequence. `readonly` shows a read-only tip and selects the text on focus, but in the current release it does not prevent editing: the native input and the calendar button stay active. Both surface a contextual tip.

```html
<!-- Disabled: no interaction at all -->
<mds-input-date name="dataArchiviazione" disabled value="2025-01-01"></mds-input-date>

<!-- Read-only: tip and selection on focus -->
<mds-input-date name="dataCreazione" readonly value="2024-06-01"></mds-input-date>
```

#### Form Participation

`<mds-input-date>` is form-associated and submits its ISO value under `name`. A missing `required` date, or one out of the `min`/`max` range, stops the submit like a native control. On form reset the submitted value is cleared (the date shown in the field stays).

```html
<form action="/prenota" method="post">
  <mds-input-field label="Data prenotazione">
    <mds-input-date name="bookingDate" required></mds-input-date>
  </mds-input-field>
  <mds-button type="submit" label="Conferma" variant="primary" tone="strong"></mds-button>
</form>
```

#### Slotted Mode Inside a Compound Field

When the host carries a `slot` attribute, the component renders only the bare native input - the calendar button, dropdown, and calendar are suppressed. This is the correct way to embed the date input inside [`mds-input-date-range`](../../mds-input-date-range) or a custom compound field.

```html
<mds-input-date-range>
  <mds-input-date slot="start" name="rangeStart"></mds-input-date>
  <mds-input-date slot="end" name="rangeEnd"></mds-input-date>
</mds-input-date-range>
```

#### Variant Override for External State Signalling

`variant` is driven automatically by validation (`'error'` on invalid, `'primary'` on valid), which already runs when the component loads: a `variant` written in the markup is overwritten at once. To communicate an external state, set it from script once the component has loaded; it lasts until the next value change or blur. Values follow the theme input ladder: `primary` (default), `error`, `success`, `warning`, `info`, `ai`.

```html
<mds-input-date id="dataConferma" name="dataConferma" value="2026-03-15"></mds-input-date>

<script>
  // Pre-mark as success when the date was already validated server-side
  const field = document.getElementById('dataConferma');
  field.componentOnReady().then(() => {
    field.variant = 'success';
  });
</script>
```

#### Styling Customization

Style the component only through its documented `--mds-input-date-*` CSS custom properties. Use the semantic color roles via `rgb(var(--magma-<role>))` so dark mode and high-contrast work automatically.

```css
.booking-widget mds-input-date {
  --mds-input-date-background: rgb(var(--magma-wash-base));
  --mds-input-date-icon-color: rgb(var(--magma-accent-fg));
  --mds-input-date-ring: 0 0 0 2px rgb(var(--magma-border-focus) / 0.5);
}
```


### 3. Antipattern

Common incorrect uses of `<mds-input-date>`. Each entry pairs the wrong form with the right one and a one-line reason. System-wide rules (boolean-as-string, shadow piercing, Tailwind color utilities, raw native event listening) live in [`docs/agents/anti-patterns.md`](../../../../../../docs/agents/anti-patterns.md) - they apply here too but are not repeated.

#### Do Not Use Non-ISO Date Strings

`value`, `min`, and `max` must be ISO 8601 date strings (`YYYY-MM-DD`). Any other format is passed to `DateTime.fromISO`, which marks the date invalid: a non-ISO `value` immediately trips validation, and a non-ISO `min` / `max` is silently ignored.

```html
<!-- INCORRECT -->
<mds-input-date value="31/12/2026" max="31-12-2026"></mds-input-date>

<!-- CORRECT -->
<mds-input-date value="2026-12-31" max="2026-12-31"></mds-input-date>
```

#### Do Not Hardcode `variant="error"` to Signal Validation

The component manages `variant` automatically: it sets `'error'` when validation fails and restores `'primary'` when it passes. Hardcoding `variant="error"` is overwritten as soon as the component loads and does not persist.

```html
<!-- INCORRECT -->
<mds-input-date name="dataScadenza" variant="error"></mds-input-date>

<!-- CORRECT - let validation drive variant; listen to mdsInputValidation instead -->
<mds-input-date name="dataScadenza" required></mds-input-date>
```

#### Do Not Listen to the Native `change` or `input` Events

The component emits `mdsInputDateSelect` (value string) and `mdsInputValidation` (boolean). The native `change` event does not cross the shadow boundary, and `input` misses calendar-driven picks and values set from script.

```html
<!-- INCORRECT -->
<mds-input-date id="picker" name="data"></mds-input-date>
<script>
  document.getElementById('picker').addEventListener('change', handler);
</script>

<!-- CORRECT -->
<mds-input-date id="picker" name="data"></mds-input-date>
<script>
  document.getElementById('picker').addEventListener('mdsInputDateSelect', handler);
</script>
```

#### Do Not Use a Raw `<input type="date">` as a Drop-in Replacement

Replacing `<mds-input-date>` with a plain `<input type="date">` loses form-association conventions, theming, the calendar overlay, the contextual tip, and all Magma accessibility defaults.

```html
<!-- INCORRECT -->
<input type="date" name="dataEvento" />

<!-- CORRECT -->
<mds-input-date name="dataEvento"></mds-input-date>
```

#### Do Not Set `disabled="false"` or `readonly="false"` to Remove the State

Boolean attributes must be absent to be off. The runtime happens to read the string `"false"` as `false`, but the attribute stays in the markup until the component renders, and HTML, the browser's own handling of `disabled` on a form-associated element, attribute selectors and `hasAttribute()` all read a present attribute as set.

```html
<!-- INCORRECT -->
<mds-input-date name="data" disabled="false" readonly="false"></mds-input-date>

<!-- CORRECT - remove the attribute entirely -->
<mds-input-date name="data"></mds-input-date>
```

#### Do Not Pierce Shadow DOM to Style the Inner Input

The documented customization surface is `--mds-input-date-*` CSS custom properties plus the `::part(input-date)` part. Targeting internals with `>>>`, `/deep/`, or undocumented selectors will break on any minor release.

```css
/* INCORRECT */
mds-input-date >>> .input {
  border: 2px solid red;
}

/* CORRECT */
mds-input-date {
  --mds-input-date-ring: 0 0 0 2px rgb(var(--magma-danger-border) / 0.8);
}
mds-input-date::part(input-date) {
  font-size: var(--text-size-info-caption);
}
```

#### Do Not Set `value` to Clear the Field

Setting `value=""` is the correct way to clear; do not set `value` to a non-ISO string expecting the component to silently ignore it - it passes through validation and trips an error state.

```html
<!-- INCORRECT (non-ISO value to "reset") -->
<mds-input-date name="data" value="clear"></mds-input-date>

<!-- CORRECT -->
<mds-input-date name="data" value=""></mds-input-date>
```



## Properties

| Property         | Attribute    | Description                                                                                                                                                                                                                                                                                                                          | Type                                                                            | Default     |
| ---------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- | ----------- |
| `accessibleName` | `aria-label` | The accessible name of the native control: the label a screen reader announces. An `mds-input-field` around the component passes its own label down here, so the attribute is only written by hand when the control stands on its own. The placeholder is deliberately not a fallback: it disappears as soon as the field is filled. | `string \| undefined`                                                           | `undefined` |
| `delay`          | `delay`      | Specifies the delay in milliseconds before closing the calendar dropdown, if the value is 0 the dropdown will not close                                                                                                                                                                                                              | `number`                                                                        | `500`       |
| `disabled`       | `disabled`   | If true, the element is displayed as disabled                                                                                                                                                                                                                                                                                        | `boolean \| undefined`                                                          | `false`     |
| `hideToday`      | `hide-today` | Hides the highlight on today's date in the calendar.                                                                                                                                                                                                                                                                                 | `boolean`                                                                       | `false`     |
| `max`            | `max`        | Specifies the max date of the range, user cannot set dates after this date                                                                                                                                                                                                                                                           | `null \| string`                                                                | `null`      |
| `min`            | `min`        | Specifies the min date of the range, user cannot set dates before this date                                                                                                                                                                                                                                                          | `null \| string`                                                                | `null`      |
| `name`           | `name`       | Is needed to reference the form data after the form is submitted                                                                                                                                                                                                                                                                     | `string \| undefined`                                                           | `undefined` |
| `readonly`       | `readonly`   | Specifies that the element is read-only                                                                                                                                                                                                                                                                                              | `boolean \| undefined`                                                          | `false`     |
| `required`       | `required`   | Specifies that the element must be filled out before submitting the form                                                                                                                                                                                                                                                             | `boolean \| undefined`                                                          | `false`     |
| `value`          | `value`      | Specifies the value of the input                                                                                                                                                                                                                                                                                                     | `string`                                                                        | `''`        |
| `variant`        | `variant`    | Sets the variant of the input field                                                                                                                                                                                                                                                                                                  | `"ai" \| "error" \| "info" \| "primary" \| "success" \| "warning" \| undefined` | `'primary'` |


## Events

| Event                | Description                                           | Type                   |
| -------------------- | ----------------------------------------------------- | ---------------------- |
| `mdsInputDateSelect` | Emitted when the selected date value changes.         | `CustomEvent<string>`  |
| `mdsInputValidation` | Emits a boolean event when a input execute validation | `CustomEvent<boolean>` |


## Methods

### `focusInput() => Promise<void>`

Sets focus on the underlying input element.

#### Returns

Type: `Promise<void>`



### `getErrors() => Promise<MdsValidationErrors | null>`

Returns the current validation errors, or `null` if the value is valid.

#### Returns

Type: `Promise<MdsValidationErrors | null>`

the validation errors, or `null` when valid

### `setValue(value: string) => Promise<void>`

Sets the input value.

#### Parameters

| Name    | Type     | Description                                  |
| ------- | -------- | -------------------------------------------- |
| `value` | `string` | the value to set, in ISO format (YYYY-MM-DD) |

#### Returns

Type: `Promise<void>`




## Shadow Parts

| Part           | Description |
| -------------- | ----------- |
| `"input-date"` |             |


## CSS Custom Properties

| Name                                        | Description                                         |
| ------------------------------------------- | --------------------------------------------------- |
| `--mds-input-date-background`               | The background of the date input                    |
| `--mds-input-date-field-background-empty`   | The background when the date field is empty         |
| `--mds-input-date-field-color-empty`        | The text/icon color when the date field is empty    |
| `--mds-input-date-icon-color`               | The color of the date input icon                    |
| `--mds-input-date-icon-color-rgb`           | The RGB channels used for the icon color            |
| `--mds-input-date-ring`                     | The focus ring of the date input                    |
| `--mds-input-date-shadow`                   | The shadow applied to the date input                |
| `--mds-input-date-variant-color-rgb`        | The base RGB value for the date input variant       |
| `--mds-input-tip-background`                | The background of the input tip                     |
| `--mds-input-tip-horizontal-offset`         | The horizontal offset for the input tip             |
| `--mds-input-tip-horizontal-offset-focused` | The horizontal offset when the input tip is focused |
| `--mds-input-tip-vertical-offset`           | The vertical offset for the input tip               |


## Dependencies

### Depends on

- [mds-button](../mds-button)
- [mds-input-tip](../mds-input-tip)
- [mds-input-tip-item](../mds-input-tip-item)
- [mds-dropdown](../mds-dropdown)
- [mds-calendar](../mds-calendar)

### Graph
```mermaid
graph TD;
  mds-input-date --> mds-button
  mds-input-date --> mds-input-tip
  mds-input-date --> mds-input-tip-item
  mds-input-date --> mds-dropdown
  mds-input-date --> mds-calendar
  mds-button --> mds-spinner
  mds-button --> mds-icon
  mds-button --> mds-text
  mds-input-tip-item --> mds-text
  mds-calendar --> mds-button
  mds-calendar --> mds-calendar-cell
  mds-calendar-cell --> mds-button
  style mds-input-date fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
