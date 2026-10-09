# mds-pref-animation



<!-- Auto Generated Below -->


## Usage

### 1. Description

The `<mds-pref-animation>` web component is a preference control that lets users choose how animations are presented (reduced, system-driven, or fully enabled). It is usually a child of [`<mds-pref>`](../../mds-pref) and renders a labelled three-option tab group rather than any native HTML primitive.

#### Semantic Behavior

- **Usually inside `<mds-pref>`**: Placed as a direct default-slot child of `<mds-pref>`, which groups the preference controls in one panel; it also works on its own, since it applies and stores the preference by itself.
- **Tab-group selection**: Renders three options (reduce / system / no-preference); the active one is driven by the `mode` value, and clicking an option sets that mode.
- **Applies the preference globally**: Choosing a mode applies it across the whole document and persists the choice, so it is restored on later visits.
- **Initial mode resolution**: The effective mode is resolved in order from the `mode` prop, then the persisted value, then the `system` default.
- **Change event**: `mdsPrefChange` (detail `{ preference: 'animation' }`) fires on every selection and also on every render, page load included; the parent `<mds-pref>` listens for it only in `controller` mode.

#### Properties & Visual Configurations

- **`mode`**: Sets which animation preference is active - `reduce` to suppress motion, `no-preference` to fully enable animations, or `system` to defer to the user's OS setting. Leave unset to fall back to the persisted or default (`system`) value.
- **`size`**: Sizes the nested tab items (`sm` or `md`). The parent `<mds-pref>` forwards a later change of its own `size` to every `mds-pref-*` child, but not the initial value, so set it on this component as well.


### 2. Pattern

Correct and idiomatic ways to use the `<mds-pref-animation>` component, ordered from most common to most specialized. Patterns assume a working knowledge of the shared component rules in [`docs/agents/conventions.md`](../../../../../../docs/agents/conventions.md).

#### Default Usage Inside `mds-pref`

The standard form. Place `<mds-pref-animation>` as a direct slot child of [`<mds-pref>`](../../mds-pref). No `mode` or `size` is required - the component restores the last persisted choice and defaults to `system` on a first visit.

```html
<mds-pref>
  <mds-pref-animation></mds-pref-animation>
</mds-pref>
```

#### Combined Preferences Panel

Place multiple `mds-pref-*` children inside the same `<mds-pref>`. The parent forwards later changes of its `size` to every child.

```html
<mds-pref>
  <mds-pref-animation></mds-pref-animation>
  <mds-pref-contrast></mds-pref-contrast>
  <mds-pref-mode></mds-pref-mode>
  <mds-pref-consumption></mds-pref-consumption>
</mds-pref>
```

#### Pre-selecting a Mode via `mode`

Pass `mode` to override the persisted value and start from a known state - for example, a first-run onboarding screen that starts with reduced motion.

```html
<mds-pref>
  <mds-pref-animation mode="reduce"></mds-pref-animation>
</mds-pref>
```

#### Listening for Changes

Handle `mdsPrefChange` when the host application needs to react - for example, to announce the new setting or trigger a soft refresh. The event also fires on every render, page load included, so do not read each one as a user's choice.

```html
<mds-pref id="prefs">
  <mds-pref-animation></mds-pref-animation>
</mds-pref>

<script>
  document.getElementById('prefs').addEventListener('mdsPrefChange', (event) => {
    // event.detail.preference === 'animation'
    console.log('Preferenza animazioni aggiornata', event.detail);
  });
</script>
```

#### Compact Size

Set `size="sm"` on the parent `<mds-pref>` and on each `mds-pref-*` child to shrink the tab items consistently: the parent forwards later changes of its `size`, not the initial value.

```html
<!-- In the panel: on the parent and on each child -->
<mds-pref size="sm">
  <mds-pref-animation size="sm"></mds-pref-animation>
  <mds-pref-contrast size="sm"></mds-pref-contrast>
</mds-pref>

<!-- Acceptable when used standalone -->
<mds-pref-animation size="sm"></mds-pref-animation>
```

#### Silent Controller (Hidden Preference Sync)

When a `<mds-pref controller>` element is placed in the DOM, it applies preferences silently without rendering any UI. `<mds-pref-animation>` inside it restores the persisted animation class on `<html>` on load without showing the tab group.

```html
<!-- Place once, near the root - no UI is rendered -->
<mds-pref controller>
  <mds-pref-animation></mds-pref-animation>
</mds-pref>
```


### 3. Antipattern

Common incorrect uses of `<mds-pref-animation>`. Each entry pairs the wrong form with the right one and a one-line reason. System-wide rules (boolean-as-string, shadow piercing, Tailwind color utilities, raw native event listening) live in [`docs/agents/anti-patterns.md`](../../../../../../docs/agents/anti-patterns.md) - they apply here too but are not repeated.

#### Do Not Turn Off with `mode="false"` or Remove the Attribute to Reset

`mode` is a string union (`reduce | system | no-preference`), not a boolean. A value outside the union, such as `"false"` or `"none"`, does not disable the component: it has no entry in the component's mode table, so applying it fails with an error, after the value has already been stored in `localStorage` (later loads fail too). Without `mode`, the component restores the persisted choice or falls back to `system`.

```html
<!-- INCORRECT - not a valid mode value -->
<mds-pref-animation mode="false"></mds-pref-animation>
<mds-pref-animation mode="none"></mds-pref-animation>

<!-- CORRECT - use an explicit valid mode -->
<mds-pref-animation mode="system"></mds-pref-animation>
```

#### Do Not Listen to Raw `change` Events

`<mds-pref-animation>` emits `mdsPrefChange`; no native `change` event is fired.

```html
<!-- INCORRECT -->
<mds-pref id="prefs">
  <mds-pref-animation></mds-pref-animation>
</mds-pref>

<script>
  document.getElementById('prefs').addEventListener('change', handler);
</script>

<!-- CORRECT -->
<script>
  document.getElementById('prefs').addEventListener('mdsPrefChange', handler);
</script>
```

#### Do Not Hand-Roll Animation Preference Handling on `<html>`

The component already applies `pref-animation-reduce`, `pref-animation-system`, or `pref-animation-no-preference` to `<html>` and persists the choice in `localStorage`. Duplicating this logic conflicts with the component's state and causes double-writes.

```css
/* INCORRECT - duplicates the component's own logic */
html.custom-reduce-motion * {
  animation: none !important;
}
```

```html
<!-- CORRECT - rely on the class the component sets -->
<!-- The component sets pref-animation-reduce on <html>;
     target that class in your own CSS if needed -->
```

```css
/* Extend, do not replace */
html.pref-animation-reduce .my-widget {
  transition: none;
}
```



## Properties

| Property | Attribute | Description                                           | Type                                                   | Default     |
| -------- | --------- | ----------------------------------------------------- | ------------------------------------------------------ | ----------- |
| `mode`   | `mode`    | Specifies the preference mode                         | `"no-preference" \| "reduce" \| "system" \| undefined` | `undefined` |
| `size`   | `size`    | Sets the size of the component items nested inside it | `"md" \| "sm" \| undefined`                            | `undefined` |


## Events

| Event           | Description                           | Type                                    |
| --------------- | ------------------------------------- | --------------------------------------- |
| `mdsPrefChange` | Emits when the component is triggered | `CustomEvent<MdsPrefChangeEventDetail>` |


## Dependencies

### Depends on

- [mds-text](../mds-text)
- [mds-tab](../mds-tab)
- [mds-tab-item](../mds-tab-item)

### Graph
```mermaid
graph TD;
  mds-pref-animation --> mds-text
  mds-pref-animation --> mds-tab
  mds-pref-animation --> mds-tab-item
  mds-tab-item --> mds-button
  mds-button --> mds-spinner
  mds-button --> mds-icon
  mds-button --> mds-text
  style mds-pref-animation fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
