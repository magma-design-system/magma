# mds-breadcrumb



This is a web-component from Maggioli Design System [Magma](https://magma.maggiolicloud.it), built with StencilJS, TypeScript, Storybook. It's based on the web-component standard and it's designed to be agnostic from the JavaScript framework you are using.

<!-- Auto Generated Below -->


## Usage

### 1. Description

The `<mds-breadcrumb>` web component is the navigation-trail container of the Magma Design System. It is a compound parent that arranges a sequence of slotted `<mds-breadcrumb-item>` children into a hierarchical path and adds an optional back-navigation control.

#### Semantic Behavior

- **Compound parent/child**: The default slot accepts only `<mds-breadcrumb-item>` children.
- **Selection tracking**: When the user selects a child it becomes the single current depth and the others are cleared. Setting `selected` from code emits nothing, so the parent does not react to it.
- **Back button**: Unless `hide-back` is set the host renders a leading arrow that steps selection to the previous item; it auto-disables whenever the first item is current (or, on load, when no item is).
- **Change event**: `mdsBreadcrumbChange` fires after any selection change - via a child click or the back arrow - carrying the new index `id` and a `caller` item: the clicked item, or for the back arrow the item that was current before the step.
- **Localized back button**: The back button's `title` is resolved per document language (el/en/es/it).

#### Properties & Visual Configurations

This component exposes a single behavioral prop:

- **`hideBack`** removes the leading arrow control. Leave it off (the default) for multi-level trails where users benefit from a one-tap step backwards; set it for shallow or display-only breadcrumbs where reverse navigation adds no value.

Visual styling (item button colors, separator arrow color) is driven by the CSS custom properties documented in [`readme.md`](../readme.md), not by props; the current item's colors are set on [`mds-breadcrumb-item`](../../mds-breadcrumb-item) with its `--mds-breadcrumb-item-button-*-selected` properties. The shared `variant` / `tone` / `size` ladders defined in [`docs/agents/variants.md`](../../../../../../docs/agents/variants.md) do not apply here; per-item labels and selection state live on the `<mds-breadcrumb-item>` children.


### 2. Pattern

Correct and idiomatic ways to use the `<mds-breadcrumb>` component, ordered from most common to most specialized. Patterns assume a working knowledge of the shared component rules in [`docs/agents/conventions.md`](../../../../../../docs/agents/conventions.md).

#### Basic Navigation Trail

The canonical form. Slot one `<mds-breadcrumb-item>` per level and mark the current depth with `selected`. The back arrow is shown by default.

```html
<mds-breadcrumb>
  <mds-breadcrumb-item label="Home"></mds-breadcrumb-item>
  <mds-breadcrumb-item label="Archivio pratiche"></mds-breadcrumb-item>
  <mds-breadcrumb-item label="Pratica 2024/001" selected></mds-breadcrumb-item>
</mds-breadcrumb>
```

#### Without the Back Arrow

Add the `hide-back` attribute for display-only or shallow breadcrumbs where reverse navigation adds no value. The back arrow is shown by default, so this is an explicit opt-out.

```html
<mds-breadcrumb hide-back>
  <mds-breadcrumb-item label="Impostazioni"></mds-breadcrumb-item>
  <mds-breadcrumb-item label="Profilo utente" selected></mds-breadcrumb-item>
</mds-breadcrumb>
```

#### Listening for Navigation Changes

`mdsBreadcrumbChange` fires whenever a child item is clicked or the back arrow is activated. The detail carries the zero-based `id` string of the newly selected item and a `caller` element: the clicked item, or for the back arrow the item that was current before the step.

```html
<mds-breadcrumb id="nav">
  <mds-breadcrumb-item label="Dashboard"></mds-breadcrumb-item>
  <mds-breadcrumb-item label="Documenti"></mds-breadcrumb-item>
  <mds-breadcrumb-item label="Fatture" selected></mds-breadcrumb-item>
</mds-breadcrumb>

<script>
  document.getElementById('nav').addEventListener('mdsBreadcrumbChange', (e) => {
    console.log('Livello selezionato:', e.detail.id);
    console.log('Elemento:', e.detail.caller);
  });
</script>
```

#### Programmatic Selection

Set `selected` in the markup on the item you want active on load: the parent reads it to set the back button state (disabled on the first item). Setting `selected` later from JavaScript emits no event, so the parent neither clears the other items nor updates the back button.

```html
<mds-breadcrumb>
  <mds-breadcrumb-item label="Progetto Alpha" selected></mds-breadcrumb-item>
  <mds-breadcrumb-item label="Sprint 3"></mds-breadcrumb-item>
  <mds-breadcrumb-item label="Attivita"></mds-breadcrumb-item>
</mds-breadcrumb>
```

#### Item Label via `label` Prop

Always set the text with the `label` prop on `<mds-breadcrumb-item>`: the item has no slot. The prop is reflected as an HTML attribute, enabling CSS attribute selectors and framework bindings.

```html
<mds-breadcrumb>
  <mds-breadcrumb-item label="Area riservata"></mds-breadcrumb-item>
  <mds-breadcrumb-item label="Gestione utenti"></mds-breadcrumb-item>
  <mds-breadcrumb-item label="Nuovo utente" selected></mds-breadcrumb-item>
</mds-breadcrumb>
```

#### Styling Customization via CSS Custom Properties

Apply `--mds-breadcrumb-*` vars on the host to retheme the whole trail at once. Use semantic color roles wrapped in `rgb(var(--magma-<role>))` so dark mode and high-contrast modes keep working. Changes on the parent propagate into the child items because the item vars inherit from the parent vars. The current item's color is set on the items: the parent's `--mds-breadcrumb-button-color-current` is not read by them.

```css
.sidebar-nav mds-breadcrumb {
  --mds-breadcrumb-button-color: rgb(var(--magma-accent-fg));
  --mds-breadcrumb-button-color-hover: rgb(var(--magma-text-default));
  --mds-breadcrumb-arrow-depth-color: rgb(var(--magma-accent-fg));
}

.sidebar-nav mds-breadcrumb-item {
  --mds-breadcrumb-item-button-color-selected: rgb(var(--magma-text-default));
}
```

#### Per-Item Styling via `::part(button)`

When you need to restyle a single item's inner button beyond what the CSS vars allow, target the documented `::part(button)` on `<mds-breadcrumb-item>`. This is the only supported shadow-part surface on the child component.

```css
mds-breadcrumb-item[selected]::part(button) {
  font-weight: bold;
  letter-spacing: 0.02em;
}
```


### 3. Antipattern

Common incorrect uses of `<mds-breadcrumb>`. Each entry pairs the wrong form with the right one and a one-line reason. System-wide rules (boolean-as-string, shadow piercing, raw native event listening) live in [`docs/agents/anti-patterns.md`](../../../../../../docs/agents/anti-patterns.md) - they apply here too but are not repeated.

#### Do Not Slot Raw HTML Inside `<mds-breadcrumb>`

The default slot accepts only `<mds-breadcrumb-item>` elements; slotting arbitrary HTML breaks the internal selection-tracking and back-button logic.

```html
<!-- INCORRECT -->
<mds-breadcrumb>
  <a href="/home">Home</a>
  <span>Archivio</span>
  <strong>Documento corrente</strong>
</mds-breadcrumb>

<!-- CORRECT -->
<mds-breadcrumb>
  <mds-breadcrumb-item label="Home"></mds-breadcrumb-item>
  <mds-breadcrumb-item label="Archivio"></mds-breadcrumb-item>
  <mds-breadcrumb-item label="Documento corrente" selected></mds-breadcrumb-item>
</mds-breadcrumb>
```

#### Do Not Use `<mds-breadcrumb-item>` Outside `<mds-breadcrumb>`

Child items rely on the parent for ID assignment and selection-state management. Rendered standalone they get no back button, no sibling deselection and no `mdsBreadcrumbChange`.

```html
<!-- INCORRECT -->
<div class="my-nav">
  <mds-breadcrumb-item label="Home"></mds-breadcrumb-item>
  <mds-breadcrumb-item label="Sezione" selected></mds-breadcrumb-item>
</div>

<!-- CORRECT -->
<mds-breadcrumb>
  <mds-breadcrumb-item label="Home"></mds-breadcrumb-item>
  <mds-breadcrumb-item label="Sezione" selected></mds-breadcrumb-item>
</mds-breadcrumb>
```

#### Do Not Pass Text or HTML as `<mds-breadcrumb-item>` Children

`<mds-breadcrumb-item>` has no default slot; the `label` prop is the only way to set the visible text. Text or HTML placed between the tags is ignored and never rendered.

```html
<!-- INCORRECT -->
<mds-breadcrumb>
  <mds-breadcrumb-item>
    <strong>Categoria</strong>
  </mds-breadcrumb-item>
  <mds-breadcrumb-item selected>
    <span class="active">Sottocategoria</span>
  </mds-breadcrumb-item>
</mds-breadcrumb>

<!-- CORRECT -->
<mds-breadcrumb>
  <mds-breadcrumb-item label="Categoria"></mds-breadcrumb-item>
  <mds-breadcrumb-item label="Sottocategoria" selected></mds-breadcrumb-item>
</mds-breadcrumb>
```

#### Do Not Manage Selection State Manually by Toggling Classes

The parent tracks which item is selected internally; toggling CSS classes or `aria-current` on the host bypasses that logic and leaves the back button in an inconsistent state. Use the `selected` prop instead.

```html
<!-- INCORRECT -->
<mds-breadcrumb>
  <mds-breadcrumb-item label="Home" class="is-active" aria-current="page"></mds-breadcrumb-item>
  <mds-breadcrumb-item label="Archivio"></mds-breadcrumb-item>
</mds-breadcrumb>

<!-- CORRECT -->
<mds-breadcrumb>
  <mds-breadcrumb-item label="Home" selected></mds-breadcrumb-item>
  <mds-breadcrumb-item label="Archivio"></mds-breadcrumb-item>
</mds-breadcrumb>
```

#### Do Not Pierce the Shadow DOM to Style the Internal Back Button

The back button rendered inside `<mds-breadcrumb>` is a private implementation detail: it exposes no part, and no documented `--mds-breadcrumb-*` CSS custom property reaches it. To remove it, set `hide-back`.

```css
/* INCORRECT */
mds-breadcrumb >>> .back {
  background: red;
}
mds-breadcrumb::part(back) {
  display: none;
}

/* CORRECT - no part or custom property reaches the back button: remove it with hide-back */
```

```html
<!-- CORRECT -->
<mds-breadcrumb hide-back>
  <mds-breadcrumb-item label="Home"></mds-breadcrumb-item>
  <mds-breadcrumb-item label="Archivio" selected></mds-breadcrumb-item>
</mds-breadcrumb>
```



## Properties

| Property   | Attribute   | Description                 | Type                   | Default |
| ---------- | ----------- | --------------------------- | ---------------------- | ------- |
| `hideBack` | `hide-back` | Hides the back arrow button | `boolean \| undefined` | `false` |


## Events

| Event                 | Description                          | Type                                    |
| --------------------- | ------------------------------------ | --------------------------------------- |
| `mdsBreadcrumbChange` | Emits when the breadcrumb is changed | `CustomEvent<MdsBreadcrumbEventDetail>` |


## Slots

| Slot | Description                          |
| ---- | ------------------------------------ |
|      | Add `mds-breadcrumb-item` element/s. |


## CSS Custom Properties

| Name                                          | Description                                                                          |
| --------------------------------------------- | ------------------------------------------------------------------------------------ |
| `--mds-breadcrumb-arrow-depth-color`          | Sets the color of the arrow icon that separates buttons                              |
| `--mds-breadcrumb-button-background`          | Sets the background color of the button                                              |
| `--mds-breadcrumb-button-background-disabled` | Sets the background color of the button when it's disabled, is used for arrow button |
| `--mds-breadcrumb-button-background-hover`    | Sets the background color of the button when the mouse is over it                    |
| `--mds-breadcrumb-button-color`               | Sets the text color of the button                                                    |
| `--mds-breadcrumb-button-color-current`       | Sets the text color of the button when it's active                                   |
| `--mds-breadcrumb-button-color-hover`         | Sets the text color of the button when the mouse is over it                          |
| `--mds-breadcrumb-current-button-color`       | Sets the text color of the current depth button                                      |


## Dependencies

### Depends on

- [mds-button](../mds-button)

### Graph
```mermaid
graph TD;
  mds-breadcrumb --> mds-button
  mds-button --> mds-spinner
  mds-button --> mds-icon
  mds-button --> mds-text
  style mds-breadcrumb fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
