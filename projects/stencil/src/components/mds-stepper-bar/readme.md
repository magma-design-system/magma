# mds-stepper-bar



This is a web-component from Maggioli Design System [Magma](https://magma.maggiolicloud.it), built with StencilJS, TypeScript, Storybook. It's based on the web-component standard and it's designed to be agnostic from the JavaScript framework you are using.

<!-- Auto Generated Below -->


## Usage

### 1. Description

The `<mds-stepper-bar>` web component is the Magma Design System container that orchestrates a multi-step progress flow, coordinating a set of slotted `<mds-stepper-bar-item>` children and revealing the matching content panel for the active step. It has no native HTML equivalent; it composes a stepper indicator track with a switchable content region.

#### Semantic Behavior

- **Compound parent**: It is the controlling parent of `<mds-stepper-bar-item>` children placed in the default slot, driving every child's `done`/`current` state - children do not manage their own progression.
- **Active step derivation**: From `itemsDone` it marks all earlier items as `done`, the item at the current index as `current`, and clears the rest; the active step is `itemsDone - 1`.
- **Content synchronization**: Each `slot="content"` element is paired by position to a stepper item; only the panel matching the current index is shown. The other panels get the `hidden` attribute, so no style of the page is needed (a `display` the page sets on a panel overrides it). The panels are the direct children with `slot="content"`, read again at every step and whenever the slot changes: a panel that a framework renders, replaces or removes after the load (conditional rendering, a keyed list) takes the state of its step at once.
- **Child requests, page decides**: A step that is done emits `mdsStepperBarItemDone` when the user activates it; the bar does not move by itself, progress is driven by `itemsDone` only. To let the user go back, listen for the event and set `itemsDone` to the index of that item plus one.
- **Auto-scroll**: When a step becomes current the indicator track scrolls horizontally to center the active item.
- **Change event**: It emits `mdsStepperBarChange` when it loads and whenever `itemsDone` changes, with a detail of the active `step` index and a comma-joined `value` string collected from the completed items.

#### Properties & Visual Configurations

- **`itemsDone`** is the controlled entry point for progress: `0` means no step completed, `1` activates the first step, and `last + 1` marks the whole flow complete. Treat it as the single source of truth for which step is current rather than mutating children directly.

#### Other behavioral props

- **`navigation`** selects how the indicator track is traversed: `'none'` (default) keeps the track static, while `'scrollbar'` exposes a horizontal scrollbar (styleable through the `--mds-stepper-bar-scrollbar-*` custom properties) for flows with many steps.


### 2. Examples

Correct and idiomatic ways to use the `<mds-stepper-bar>` component, ordered from most common to most specialized. The examples assume a working knowledge of the shared component rules in [`docs/agents/conventions.md`](../../../../../../docs/agents/conventions.md).

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

Drive progress by updating `items-done` from outside. `itemsDone = 0` leaves all items pending; `itemsDone = N + 1` (where N is the total number of items) marks the whole flow as complete. Do not mutate the children's `done` or `current` attributes directly - only the parent controls those. The button names the step it leads to, and at the last step what it does (`magma/stepper-forward-named`).

```html
<mds-stepper-bar id="reg-stepper" items-done="1">
  <mds-stepper-bar-item badge step icon="mi/baseline/person" icon-checked="mi/baseline/done" label="Account"></mds-stepper-bar-item>
  <mds-stepper-bar-item badge step icon="mi/baseline/badge" icon-checked="mi/baseline/done" label="Profilo"></mds-stepper-bar-item>
  <mds-stepper-bar-item badge step icon="mi/baseline/done" icon-checked="mi/baseline/done" label="Conferma"></mds-stepper-bar-item>
</mds-stepper-bar>

<mds-button label="Avanti: Profilo" variant="primary" tone="strong" id="btn-next"></mds-button>

<script>
  const steps = ['Account', 'Profilo', 'Conferma'];
  const next = document.getElementById('btn-next');
  let step = 1;
  next.addEventListener('click', () => {
    step += 1;
    document.getElementById('reg-stepper').setAttribute('items-done', String(step));
    next.setAttribute('label', step === steps.length ? 'Completa la registrazione' : `Avanti: ${steps[step]}`);
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

Add elements with `slot="content"` - one per step in the same order as the items. The component hides all panels except the one matching the active step, with the `hidden` attribute: no style of the page is needed. Nest navigation buttons inside each panel to let users move forward and back.

```html
<mds-stepper-bar items-done="1">
  <mds-stepper-bar-item badge step icon="mi/baseline/person" icon-checked="mi/baseline/done" label="Account"></mds-stepper-bar-item>
  <mds-stepper-bar-item badge step icon="mi/baseline/badge" icon-checked="mi/baseline/done" label="Profilo"></mds-stepper-bar-item>

  <div slot="content">
    <mds-text>Inserisci i dati del tuo account.</mds-text>
    <mds-button
      label="Avanti: Profilo"
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

#### Scrollbar Navigation for a Narrow Track

When the steps do not fit the width of the track (a narrow column, a card, a phone), set `navigation="scrollbar"` to expose a styled horizontal scrollbar under the indicator track. It is not a way to hold more steps: a flow keeps 6 steps at most (`4. When to use.md`). The active item scrolls into view automatically; the scrollbar appearance is configurable through the `--mds-stepper-bar-scrollbar-*` custom properties.

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

#### Styling the Gap

Set the item spacing through the public `--mds-stepper-bar-*` CSS custom properties; the scrollbar of the indicator track is styled by the component. Use semantic color roles via `rgb(var(--magma-<role>))` for any colour you set, so dark mode and high-contrast keep working.

```css
mds-stepper-bar {
  --mds-stepper-bar-gap: calc(var(--spacing) * 700);
}
```

#### Targeting Shadow Parts for Deep Customization

The two documented shadow parts - `items` (the indicator track wrapper) and `contents` (the content panel wrapper) - let you apply layout overrides that CSS custom properties cannot express. Limit `::part()` use to structural needs only; prefer the `--mds-stepper-bar-*` properties for everything else.

```css
mds-stepper-bar::part(items) {
  padding-block: calc(var(--spacing) * 400);
  border-bottom: 1px solid rgb(var(--magma-border-muted));
}

mds-stepper-bar::part(contents) {
  padding-block: calc(var(--spacing) * 600);
}
```


### 3. Mistakes

Common incorrect uses of `<mds-stepper-bar>`. Each entry pairs the wrong form with the right one and a one-line reason. System-wide rules (boolean-as-string, shadow piercing, Tailwind color utilities, raw native event listening) live in [`docs/agents/mistakes.md`](../../../../../../docs/agents/mistakes.md) - they apply here too but are not repeated.

#### Do Not Mutate Child State Directly

`done` and `current` on `<mds-stepper-bar-item>` are managed exclusively by the parent; writing them from outside bypasses the synchronization logic and breaks content panel visibility, scroll centering, and the `mdsStepperBarChange` event. Drive progress through `items-done` on the parent instead.

```html
<!-- INCORRECT -->
<mds-stepper-bar>
  <mds-stepper-bar-item done icon="mi/baseline/person" icon-checked="mi/baseline/done" label="Account"></mds-stepper-bar-item>
  <mds-stepper-bar-item current icon="mi/baseline/badge" icon-checked="mi/baseline/done" label="Profilo"></mds-stepper-bar-item>
</mds-stepper-bar>

<!-- CORRECT -->
<mds-stepper-bar items-done="2">
  <mds-stepper-bar-item icon="mi/baseline/person" icon-checked="mi/baseline/done" label="Account"></mds-stepper-bar-item>
  <mds-stepper-bar-item icon="mi/baseline/badge" icon-checked="mi/baseline/done" label="Profilo"></mds-stepper-bar-item>
</mds-stepper-bar>
```

#### Do Not Listen for Native `change` Events

`<mds-stepper-bar>` emits `mdsStepperBarChange` - not a native `change` event. Native DOM events do not bubble out of shadow DOM reliably, so listening for `change` will silently never fire.

```html
<!-- INCORRECT -->
<mds-stepper-bar id="stepper" items-done="1">...</mds-stepper-bar>
<script>
  document.getElementById('stepper').addEventListener('change', handler);
</script>

<!-- CORRECT -->
<mds-stepper-bar id="stepper" items-done="1">...</mds-stepper-bar>
<script>
  document.getElementById('stepper').addEventListener('mdsStepperBarChange', handler);
</script>
```

#### Do Not Use `<mds-stepper-bar-item>` Outside `<mds-stepper-bar>`

`<mds-stepper-bar-item>` is a compound child; it relies on the parent to receive its `done`/`current` state. Outside the parent it renders without state management and will not advance any stepper.

```html
<!-- INCORRECT -->
<div class="custom-steps">
  <mds-stepper-bar-item icon="mi/baseline/person" icon-checked="mi/baseline/done" label="Account"></mds-stepper-bar-item>
  <mds-stepper-bar-item icon="mi/baseline/badge" icon-checked="mi/baseline/done" label="Profilo"></mds-stepper-bar-item>
</div>

<!-- CORRECT -->
<mds-stepper-bar items-done="1">
  <mds-stepper-bar-item icon="mi/baseline/person" icon-checked="mi/baseline/done" label="Account"></mds-stepper-bar-item>
  <mds-stepper-bar-item icon="mi/baseline/badge" icon-checked="mi/baseline/done" label="Profilo"></mds-stepper-bar-item>
</mds-stepper-bar>
```

#### Do Not Wrap Items in Extra Elements

The indicator track lays out its direct slot children (flex row, `--mds-stepper-bar-gap`, scroll snapping): a wrapper becomes a single item of the track, so the steps lose that layout. Compound children must be direct children of the parent.

```html
<!-- INCORRECT -->
<mds-stepper-bar items-done="1">
  <div class="step-group">
    <mds-stepper-bar-item icon="mi/baseline/person" icon-checked="mi/baseline/done" label="Account"></mds-stepper-bar-item>
    <mds-stepper-bar-item icon="mi/baseline/badge" icon-checked="mi/baseline/done" label="Profilo"></mds-stepper-bar-item>
  </div>
</mds-stepper-bar>

<!-- CORRECT -->
<mds-stepper-bar items-done="1">
  <mds-stepper-bar-item icon="mi/baseline/person" icon-checked="mi/baseline/done" label="Account"></mds-stepper-bar-item>
  <mds-stepper-bar-item icon="mi/baseline/badge" icon-checked="mi/baseline/done" label="Profilo"></mds-stepper-bar-item>
</mds-stepper-bar>
```

#### Do Not Supply Fewer `slot="content"` Panels than Items

The component pairs panels to items by index position; if a panel is missing for a given index, the content region for that step will be empty with no warning. Always provide exactly one `slot="content"` element per `<mds-stepper-bar-item>`.

```html
<!-- INCORRECT - three items, only two content panels -->
<mds-stepper-bar items-done="1">
  <mds-stepper-bar-item icon="mi/baseline/person" icon-checked="mi/baseline/done" label="Account"></mds-stepper-bar-item>
  <mds-stepper-bar-item icon="mi/baseline/badge" icon-checked="mi/baseline/done" label="Profilo"></mds-stepper-bar-item>
  <mds-stepper-bar-item icon="mi/baseline/done" icon-checked="mi/baseline/done" label="Conferma"></mds-stepper-bar-item>

  <div slot="content"><mds-text>Account</mds-text></div>
  <div slot="content"><mds-text>Profilo</mds-text></div>
</mds-stepper-bar>

<!-- CORRECT - one panel per item -->
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

`items-done` is a number, not a flag. Setting it as a bare boolean attribute sends the string `""`, which parses to `NaN`: no step is marked current or done. Always pass a numeric value.

```html
<!-- INCORRECT -->
<mds-stepper-bar items-done>...</mds-stepper-bar>

<!-- CORRECT -->
<mds-stepper-bar items-done="1">...</mds-stepper-bar>
```


### 4. When to use

#### Use it for

- The person must complete a task they do once or rarely (a sign-up, an application), in 3 to 6 steps that come in a fixed order, and see where they are and how many steps are left.
- The person must go back to a step already done, to change an answer, before finishing.

#### Not for

- The person moves between the stages or the sections of a tool they work in over time, going back and forth (an editor, a configuration workspace): `mds-tab`, with `href` on every item and the address holding the stage; when the status of each stage matters, the task list of the next line.
- The person does the steps in any order, over several sessions, and needs the status of each step, who does it and by when: `gap`, a task list (the steps in a column with their status, the open step beside them, the summary and the activity on the other side).
- The person who knows the object creates it often, or a step holds sections of its own: `form-and-validation`, one form with its sections.
- The task has fewer than 3 steps, or is a short form split into pages: `form-and-validation`, one form with its button.
- The number of steps changes with the answers: `mds-progress`.
- The person must see where a page sits in the hierarchy of the site: `mds-breadcrumb`.
- The person waits for a process the system runs (an upload, an import): `mds-progress`.


### 5. Placement context

#### Where it goes

- In a frame of its own, when the flow takes the whole screen (a sign-up, an onboarding, a checkout): under the bar of the frame, which holds only the product and the name of the task, or inside that bar when the stepper is compact.
- In a page of the application: under the title of the page, which names the task, not the step.
- In a container (a card, a dialog): as a band at the top of the container; in a dialog, three steps at most.
- As wide as the content it leads: the column of a form (`widths/form`) when every step is a short form or a choice; the main column when a step is wider.
- Beside a summary of what the flow builds (an order, a plan, its total): above the column of the steps, or across the top of the page; never above the summary alone.
- One per page, never inside another stepper.

#### Not here

- In the bar of the application or in the header of a page, as the way between sections: `app-shell`.
- Twice for the same flow (a vertical one in a side panel and a horizontal one above the form): one stepper.
- Down a side column: the stepper has no vertical form (#1586).
- With the buttons that move between steps at the top of the page: they go at the foot of each step.

#### Around it

- Each panel opens with the title of its step; when the step changes, the page moves the focus to that title (`tabindex="-1"` on the heading, as `record-detail` does with its own).
- At the foot of each panel, the row of actions (`actions/place`, `actions/order`): the way forward last, on the edge, named after the step it leads to; the way back right before it.
- The last step is a review of the answers, each with a way to change it, and its main action names what it does (Invia la domanda), not Avanti.
- The error of a step stands right above its row of actions.

#### Inside it

- A label per step that names it in one or two words, never "Step 1".
- With a line of description under each label, five steps at most on one row.
- One panel per step, one subject per panel, only the fields that subject needs.

#### Narrow screens

- The track keeps its row and scrolls, the current step in view (a compact form: #1587).



## Properties

| Property     | Attribute    | Description                                                                                                                                                                                              | Type                    | Default  |
| ------------ | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | -------- |
| `itemsDone`  | `items-done` | Sets the current item by its position, counted from 1: the items before it are done. 1 makes the first item current with none done, 0 makes no item current, the number of items + 1 marks them all done | `number`                | `1`      |
| `navigation` | `navigation` | Specifies the navigation type                                                                                                                                                                            | `"none" \| "scrollbar"` | `'none'` |


## Events

| Event                 | Description                  | Type                                    |
| --------------------- | ---------------------------- | --------------------------------------- |
| `mdsStepperBarChange` | Emits when a step is changed | `CustomEvent<MdsStepperBarEventDetail>` |


## Slots

| Slot        | Description                                                             |
| ----------- | ----------------------------------------------------------------------- |
|             | Add `mds-stepper-bar-item` element/s.                                   |
| `"content"` | Add `HTML elements` or `components`, one per mds-stepper-bar-item added |


## Shadow Parts

| Part         | Description                                                    |
| ------------ | -------------------------------------------------------------- |
| `"contents"` | Selects the `contents` container element wrapped in shadowDOM. |
| `"items"`    | Selects the `items` container element wrapped in shadowDOM.    |


## CSS Custom Properties

| Name                                           | Description                                         |
| ---------------------------------------------- | --------------------------------------------------- |
| `--mds-stepper-bar-gap`                        | Public. Sets the gap between the stepper bar items. |
| `--mds-stepper-bar-offset-margin`              | Public. Sets the offset margin of the stepper bar.  |
| `--mds-stepper-bar-scroll-behavior`            | Sets the scroll behavior of the stepper bar.        |
| `--mds-stepper-bar-scrollbar-margin`           | Sets the margin of the scrollbar.                   |
| `--mds-stepper-bar-scrollbar-radius`           | Sets the radius of the scrollbar.                   |
| `--mds-stepper-bar-scrollbar-size`             | Sets the size of the scrollbar.                     |
| `--mds-stepper-bar-scrollbar-thumb-background` | Sets the background color of the scrollbar thumb.   |
| `--mds-stepper-bar-scrollbar-track-background` | Sets the background color of the scrollbar track.   |


----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
