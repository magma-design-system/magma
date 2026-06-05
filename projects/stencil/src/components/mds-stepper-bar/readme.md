# mds-stepper-bar



This is a web-component from Maggioli Design System [Magma](https://magma.maggiolicloud.it), built with StencilJS, TypeScript, Storybook. It's based on the web-component standard and it's designed to be agnostic from the JavaScript framework you are using.

<!-- Auto Generated Below -->


## Usage

### 1. Description

The `<mds-stepper-bar>` web component is the Magma Design System container that orchestrates a multi-step progress flow, coordinating a set of slotted `<mds-stepper-bar-item>` children and revealing the matching content panel for the active step. It has no native HTML equivalent; it composes a stepper indicator track with a switchable content region.

#### Semantic Behavior

- **Compound parent**: It is the controlling parent of `<mds-stepper-bar-item>` children placed in the default slot, driving every child's `done`/`current` state - children do not manage their own progression.
- **Active step derivation**: From `itemsDone` it marks all earlier items as `done`, the item at the current index as `current`, and clears the rest; the active step is `itemsDone - 1`.
- **Content synchronization**: Each `slot="content"` element is paired by position to a stepper item; only the panel matching the current index is shown.
- **Child-driven navigation**: It listens for the `mdsStepperBarItemDone` event bubbling from a child and promotes the matching item to `current`, allowing a step to take focus on direct interaction.
- **Auto-scroll**: When a step becomes current the indicator track scrolls horizontally to center the active item.
- **Change event**: It emits `mdsStepperBarChange` whenever the current step changes, with a detail of the active `step` index and a comma-joined `value` string collected from the completed items.

#### Properties & Visual Configurations

- **`itemsDone`** is the controlled entry point for progress: `0` means no step completed, `1` activates the first step, and `last + 1` marks the whole flow complete. Treat it as the single source of truth for which step is current rather than mutating children directly.

#### Other behavioral props

- **`navigation`** selects how the indicator track is traversed: `'none'` (default) keeps the track static, while `'scrollbar'` exposes a horizontal scrollbar (styleable through the `--mds-stepper-bar-scrollbar-*` custom properties) for flows with many steps.


### 2. Pattern

Correct and idiomatic ways to use the `<mds-stepper-bar>` component, ordered from most common to most specialized. Patterns assume a working knowledge of the compound component rules documented in [`docs/COMPONENTS.md`](../../../../../../docs/COMPONENTS.md) and the generic stencil rules in [`projects/stencil/SPEC.md`](../../../../SPEC.md).

#### Minimal Stepper with Step Labels

The canonical form. Place `<mds-stepper-bar-item>` elements in the default slot, one per step. Every item requires `icon` and `label`; `badge` and `step` enable the status badge and step counter visuals. Set `items-done` to control which step is active - `1` activates the first step.

```html
<mds-stepper-bar items-done="1">
  <mds-stepper-bar-item
    badge
    step
    icon="mi/baseline/person"
    icon-checked="mi/baseline/done"
    label="Dati account"
  ></mds-stepper-bar-item>
  <mds-stepper-bar-item
    badge
    step
    icon="mi/baseline/badge"
    icon-checked="mi/baseline/done"
    label="Dati personali"
  ></mds-stepper-bar-item>
  <mds-stepper-bar-item
    badge
    step
    icon="mi/baseline/lock-open"
    icon-checked="mi/baseline/done"
    label="Attivazione"
  ></mds-stepper-bar-item>
</mds-stepper-bar>
```

#### Advancing Steps Programmatically

Drive progress by updating `items-done` from outside. `itemsDone = 0` leaves all items pending; `itemsDone = N + 1` (where N is the total number of items) marks the whole flow as complete. Do not mutate the children's `done` or `current` attributes directly - only the parent controls those.

```html
<mds-stepper-bar id="reg-stepper" items-done="1">
  <mds-stepper-bar-item badge step icon="mi/baseline/person" icon-checked="mi/baseline/done" label="Account"></mds-stepper-bar-item>
  <mds-stepper-bar-item badge step icon="mi/baseline/badge" icon-checked="mi/baseline/done" label="Profilo"></mds-stepper-bar-item>
  <mds-stepper-bar-item badge step icon="mi/baseline/done" icon-checked="mi/baseline/done" label="Conferma"></mds-stepper-bar-item>
</mds-stepper-bar>

<mds-button label="Prossimo" variant="primary" tone="strong" id="btn-next"></mds-button>

<script>
  let step = 1;
  document.getElementById('btn-next').addEventListener('mdsButtonClick', () => {
    step += 1;
    document.getElementById('reg-stepper').setAttribute('items-done', String(step));
  });
</script>
```

#### Listening to the Change Event

React to step changes via `mdsStepperBarChange`. The event detail carries `step` (zero-based index of the current item) and `value` (comma-joined `value` attributes of all completed items).

```html
<mds-stepper-bar id="wizard" items-done="1">
  <mds-stepper-bar-item value="account" badge step icon="mi/baseline/person" icon-checked="mi/baseline/done" label="Account"></mds-stepper-bar-item>
  <mds-stepper-bar-item value="profilo" badge step icon="mi/baseline/badge" icon-checked="mi/baseline/done" label="Profilo"></mds-stepper-bar-item>
  <mds-stepper-bar-item value="conferma" badge step icon="mi/baseline/done" icon-checked="mi/baseline/done" label="Conferma"></mds-stepper-bar-item>
</mds-stepper-bar>

<script>
  document.getElementById('wizard').addEventListener('mdsStepperBarChange', (e) => {
    console.log('Step corrente:', e.detail.step);
    console.log('Passi completati:', e.detail.value); // es. "account,profilo"
  });
</script>
```

#### Content Panels Synchronized with Steps

Add elements with `slot="content"` - one per step in the same order as the items. The component hides all panels except the one matching the active step. Nest navigation buttons inside each panel to let users move forward and back.

```html
<mds-stepper-bar items-done="1">
  <mds-stepper-bar-item badge step icon="mi/baseline/person" icon-checked="mi/baseline/done" label="Account"></mds-stepper-bar-item>
  <mds-stepper-bar-item badge step icon="mi/baseline/badge" icon-checked="mi/baseline/done" label="Profilo"></mds-stepper-bar-item>

  <div slot="content">
    <mds-text>Inserisci i dati del tuo account.</mds-text>
    <mds-button
      label="Prossimo"
      variant="primary"
      tone="strong"
      onclick="document.querySelector('mds-stepper-bar').setAttribute('items-done', '2')"
    ></mds-button>
  </div>

  <div slot="content">
    <mds-text>Completa il tuo profilo.</mds-text>
    <mds-button
      label="Indietro"
      variant="dark"
      tone="outline"
      onclick="document.querySelector('mds-stepper-bar').setAttribute('items-done', '1')"
    ></mds-button>
    <mds-button
      label="Conferma"
      variant="primary"
      tone="strong"
      onclick="document.querySelector('mds-stepper-bar').setAttribute('items-done', '3')"
    ></mds-button>
  </div>
</mds-stepper-bar>
```

#### Scrollbar Navigation for Long Flows

For flows with many steps, set `navigation="scrollbar"` to expose a styled horizontal scrollbar under the indicator track. The active item scrolls into view automatically; the scrollbar appearance is configurable through the `--mds-stepper-bar-scrollbar-*` custom properties.

```html
<mds-stepper-bar items-done="1" navigation="scrollbar">
  <mds-stepper-bar-item badge step icon="mi/baseline/person" icon-checked="mi/baseline/done" label="Account"></mds-stepper-bar-item>
  <mds-stepper-bar-item badge step icon="mi/baseline/badge" icon-checked="mi/baseline/done" label="Dati personali"></mds-stepper-bar-item>
  <mds-stepper-bar-item badge step icon="mi/round/email" icon-checked="mi/baseline/done" label="Newsletter"></mds-stepper-bar-item>
  <mds-stepper-bar-item badge step icon="mi/baseline/lock-open" icon-checked="mi/baseline/done" label="Attivazione"></mds-stepper-bar-item>
  <mds-stepper-bar-item badge step icon="mi/baseline/login" icon-checked="mi/baseline/done" label="Accedi"></mds-stepper-bar-item>
  <mds-stepper-bar-item badge step icon="mi/baseline/done" icon-checked="mi/baseline/done" label="Completato"></mds-stepper-bar-item>
</mds-stepper-bar>
```

#### Offset Margin inside a Padded Container

When the stepper bar lives inside a padded card or panel, use `--mds-stepper-bar-offset-margin` to let the indicator track bleed into the padding without altering the outer container's spacing.

```css
.wizard-card mds-stepper-bar {
  --mds-stepper-bar-offset-margin: 24px;
}
```

```html
<div class="wizard-card" style="padding: 24px;">
  <mds-stepper-bar items-done="2">
    <mds-stepper-bar-item badge step icon="mi/baseline/person" icon-checked="mi/baseline/done" label="Account"></mds-stepper-bar-item>
    <mds-stepper-bar-item badge step icon="mi/baseline/badge" icon-checked="mi/baseline/done" label="Profilo"></mds-stepper-bar-item>
    <mds-stepper-bar-item badge step icon="mi/baseline/done" icon-checked="mi/baseline/done" label="Conferma"></mds-stepper-bar-item>
  </mds-stepper-bar>
</div>
```

#### Styling the Scrollbar and Gap

Style the indicator track's scrollbar and item spacing through the documented `--mds-stepper-bar-*` CSS custom properties. Use Magma color tokens via `rgb(var(--<token>))` so dark mode and high-contrast keep working.

```css
mds-stepper-bar {
  --mds-stepper-bar-gap: var(--spacing-700);
  --mds-stepper-bar-scrollbar-size: 6px;
  --mds-stepper-bar-scrollbar-radius: var(--radius-full);
  --mds-stepper-bar-scrollbar-thumb-background: rgb(var(--variant-primary-04));
  --mds-stepper-bar-scrollbar-track-background: rgb(var(--tone-neutral-09));
}
```

#### Targeting Shadow Parts for Deep Customization

The two documented shadow parts - `items` (the indicator track wrapper) and `contents` (the content panel wrapper) - let you apply layout overrides that CSS custom properties cannot express. Limit `::part()` use to structural needs only; prefer the `--mds-stepper-bar-*` properties for everything else.

```css
mds-stepper-bar::part(items) {
  padding-block: var(--spacing-400);
  border-bottom: 1px solid rgb(var(--tone-neutral-08));
}

mds-stepper-bar::part(contents) {
  padding-block: var(--spacing-600);
}
```


### 3. Antipattern

Common incorrect uses of `<mds-stepper-bar>`. Each entry pairs the wrong form with the right one and a one-line reason. System-wide rules (boolean-as-string, shadow piercing, Tailwind color utilities, raw native event listening) live in [`docs/COMPONENTS.md`](../../../../../../docs/COMPONENTS.md#system-level-anti-patterns) - they apply here too but are not repeated.

#### Do Not Mutate Child State Directly

`done` and `current` on `<mds-stepper-bar-item>` are managed exclusively by the parent; writing them from outside bypasses the synchronization logic and breaks content panel visibility, scroll centering, and the `mdsStepperBarChange` event. Drive progress through `items-done` on the parent instead.

```html
<!-- 🚫 INCORRECT -->
<mds-stepper-bar>
  <mds-stepper-bar-item done icon="mi/baseline/person" icon-checked="mi/baseline/done" label="Account"></mds-stepper-bar-item>
  <mds-stepper-bar-item current icon="mi/baseline/badge" icon-checked="mi/baseline/done" label="Profilo"></mds-stepper-bar-item>
</mds-stepper-bar>

<!-- ✅ CORRECT -->
<mds-stepper-bar items-done="2">
  <mds-stepper-bar-item icon="mi/baseline/person" icon-checked="mi/baseline/done" label="Account"></mds-stepper-bar-item>
  <mds-stepper-bar-item icon="mi/baseline/badge" icon-checked="mi/baseline/done" label="Profilo"></mds-stepper-bar-item>
</mds-stepper-bar>
```

#### Do Not Listen for Native `change` Events

`<mds-stepper-bar>` emits `mdsStepperBarChange` - not a native `change` event. Native DOM events do not bubble out of shadow DOM reliably, so listening for `change` will silently never fire.

```html
<!-- 🚫 INCORRECT -->
<mds-stepper-bar id="stepper" items-done="1">...</mds-stepper-bar>
<script>
  document.getElementById('stepper').addEventListener('change', handler);
</script>

<!-- ✅ CORRECT -->
<mds-stepper-bar id="stepper" items-done="1">...</mds-stepper-bar>
<script>
  document.getElementById('stepper').addEventListener('mdsStepperBarChange', handler);
</script>
```

#### Do Not Use `<mds-stepper-bar-item>` Outside `<mds-stepper-bar>`

`<mds-stepper-bar-item>` is a compound child; it relies on the parent to receive its `done`/`current` state and to wire its `mdsStepperBarItemDone` event back to the flow. Outside the parent it renders without state management and will not advance any stepper.

```html
<!-- 🚫 INCORRECT -->
<div class="custom-steps">
  <mds-stepper-bar-item icon="mi/baseline/person" icon-checked="mi/baseline/done" label="Account"></mds-stepper-bar-item>
  <mds-stepper-bar-item icon="mi/baseline/badge" icon-checked="mi/baseline/done" label="Profilo"></mds-stepper-bar-item>
</div>

<!-- ✅ CORRECT -->
<mds-stepper-bar items-done="1">
  <mds-stepper-bar-item icon="mi/baseline/person" icon-checked="mi/baseline/done" label="Account"></mds-stepper-bar-item>
  <mds-stepper-bar-item icon="mi/baseline/badge" icon-checked="mi/baseline/done" label="Profilo"></mds-stepper-bar-item>
</mds-stepper-bar>
```

#### Do Not Wrap Items in Extra Elements

The parent queries `mds-stepper-bar-item` elements via `querySelectorAll('mds-stepper-bar-item')` across the whole light DOM, but compound communication relies on direct slot children - wrapping items in a container breaks the positional pairing with `slot="content"` panels and the auto-scroll logic.

```html
<!-- 🚫 INCORRECT -->
<mds-stepper-bar items-done="1">
  <div class="step-group">
    <mds-stepper-bar-item icon="mi/baseline/person" icon-checked="mi/baseline/done" label="Account"></mds-stepper-bar-item>
    <mds-stepper-bar-item icon="mi/baseline/badge" icon-checked="mi/baseline/done" label="Profilo"></mds-stepper-bar-item>
  </div>
</mds-stepper-bar>

<!-- ✅ CORRECT -->
<mds-stepper-bar items-done="1">
  <mds-stepper-bar-item icon="mi/baseline/person" icon-checked="mi/baseline/done" label="Account"></mds-stepper-bar-item>
  <mds-stepper-bar-item icon="mi/baseline/badge" icon-checked="mi/baseline/done" label="Profilo"></mds-stepper-bar-item>
</mds-stepper-bar>
```

#### Do Not Supply Fewer `slot="content"` Panels than Items

The component pairs panels to items by index position; if a panel is missing for a given index, the content region for that step will be empty with no warning. Always provide exactly one `slot="content"` element per `<mds-stepper-bar-item>`.

```html
<!-- 🚫 INCORRECT - three items, only two content panels -->
<mds-stepper-bar items-done="1">
  <mds-stepper-bar-item icon="mi/baseline/person" icon-checked="mi/baseline/done" label="Account"></mds-stepper-bar-item>
  <mds-stepper-bar-item icon="mi/baseline/badge" icon-checked="mi/baseline/done" label="Profilo"></mds-stepper-bar-item>
  <mds-stepper-bar-item icon="mi/baseline/done" icon-checked="mi/baseline/done" label="Conferma"></mds-stepper-bar-item>

  <div slot="content"><mds-text>Account</mds-text></div>
  <div slot="content"><mds-text>Profilo</mds-text></div>
</mds-stepper-bar>

<!-- ✅ CORRECT - one panel per item -->
<mds-stepper-bar items-done="1">
  <mds-stepper-bar-item icon="mi/baseline/person" icon-checked="mi/baseline/done" label="Account"></mds-stepper-bar-item>
  <mds-stepper-bar-item icon="mi/baseline/badge" icon-checked="mi/baseline/done" label="Profilo"></mds-stepper-bar-item>
  <mds-stepper-bar-item icon="mi/baseline/done" icon-checked="mi/baseline/done" label="Conferma"></mds-stepper-bar-item>

  <div slot="content"><mds-text>Account</mds-text></div>
  <div slot="content"><mds-text>Profilo</mds-text></div>
  <div slot="content"><mds-text>Conferma</mds-text></div>
</mds-stepper-bar>
```

#### Do Not Set `items-done` as a Boolean

`items-done` is a number, not a flag. Setting it as a bare boolean attribute sends the string `""` which is not a valid number, leaving the stepper at its default state. Always pass a numeric value.

```html
<!-- 🚫 INCORRECT -->
<mds-stepper-bar items-done>...</mds-stepper-bar>

<!-- ✅ CORRECT -->
<mds-stepper-bar items-done="1">...</mds-stepper-bar>
```



## Properties

| Property     | Attribute    | Description                                                                                                           | Type                    | Default  |
| ------------ | ------------ | --------------------------------------------------------------------------------------------------------------------- | ----------------------- | -------- |
| `itemsDone`  | `items-done` | Sets the current item to the given index: 0 is none done, 1 is the first item done, last number + 1 is all items done | `number`                | `1`      |
| `navigation` | `navigation` | Specifies the navigation type                                                                                         | `"none" \| "scrollbar"` | `'none'` |


## Events

| Event                 | Description                  | Type                                    |
| --------------------- | ---------------------------- | --------------------------------------- |
| `mdsStepperBarChange` | Emits when a step is changed | `CustomEvent<MdsStepperBarEventDetail>` |


## Slots

| Slot        | Description                                                             |
| ----------- | ----------------------------------------------------------------------- |
| `"content"` | Add `HTML elements` or `components`, one per mds-stepper-bar-item added |
| `"default"` | Add `mds-tepper-bar-item` element/s.                                    |


## Shadow Parts

| Part         | Description                                                    |
| ------------ | -------------------------------------------------------------- |
| `"contents"` | Selects the `contents` container element wrapped in shadowDOM. |
| `"items"`    | Selects the `items` container element wrapped in shadowDOM.    |


----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
