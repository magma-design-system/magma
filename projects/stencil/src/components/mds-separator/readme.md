# mds-separator



This is a web-component from Maggioli Design System [Magma](https://magma.maggiolicloud.it), built with StencilJS, TypeScript, Storybook. It's based on the web-component standard and it's designed to be agnostic from the JavaScript framework you are using.

<!-- Auto Generated Below -->


## Usage

### 1. Description

The `<mds-separator>` web component is the visual divider of the Magma Design System: a thin, full-radius horizontal rule used to partition content into distinct groups. It is a purely presentational primitive - the styled equivalent of an `<hr>` - with no props, slots, events, or interactive state.

#### Semantic Behavior

- **Presentational by default**: It exposes no role or ARIA attributes and accepts no children, so it is treated as decorative chrome rather than semantic content.
- **Theme-reactive coloring**: The separator color adapts automatically to the active appearance - darker under dark themes and stronger under high-contrast preferences - with no consumer wiring required.
- **No state or interaction**: There is no disabled, await, focus, or keyboard behavior - the element is inert and never enters the tab sequence.

#### Properties & Visual Configurations

The component defines no configurable props. The only intended customization point is the CSS custom property **`--mds-separator-background`** (default `rgb(var(--magma-border-default))`) that overrides the divider color; set it to a semantic color role so the divider keeps following the mode and the contrast preference.

For the semantic color roles the default value draws from, see [`docs/agents/color.md`](../../../../../../docs/agents/color.md).


### 2. Pattern

Correct and idiomatic ways to use the `<mds-separator>` component, ordered from most common to most specialized. Patterns assume a working knowledge of the shared component rules in [`docs/agents/conventions.md`](../../../../../../docs/agents/conventions.md).

#### Dividing Items in a List or Card

The most common use: place `<mds-separator>` between stacked rows or sections to create a thin visual boundary without adding semantic structure. The component is inert and carries no ARIA role, so it works as pure chrome.

```html
<div class="grid rounded-(--magma-radius-xl) bg-surface-raised overflow-hidden">
  <mds-entity icon="mi/baseline/person">
    <mds-text typography="h6">Mario Rossi</mds-text>
  </mds-entity>
  <mds-separator></mds-separator>
  <mds-entity icon="mi/baseline/person">
    <mds-text typography="h6">Luigi Verdi</mds-text>
  </mds-entity>
  <mds-separator></mds-separator>
  <mds-entity icon="mi/baseline/person">
    <mds-text typography="h6">Wario</mds-text>
  </mds-entity>
</div>
```

#### Dividing Sections Inside a Card

Use `<mds-separator>` to separate groups of content inside a card region. `<mds-card>` renders only its four named slots, so a separator placed directly in the card, between the regions, is not rendered: put it inside the region, as a direct sibling of the rows it divides - do not wrap it.

```html
<mds-card>
  <mds-card-header slot="header">
    <mds-text typography="h6">Riepilogo ordine</mds-text>
  </mds-card-header>
  <mds-card-content slot="content">
    <mds-text typography="paragraph">Subtotale: 104,92 EUR</mds-text>
    <mds-separator></mds-separator>
    <mds-text typography="paragraph">Totale: 128,00 EUR</mds-text>
  </mds-card-content>
  <mds-card-footer slot="footer">
    <mds-button label="Conferma" variant="primary" tone="strong"></mds-button>
  </mds-card-footer>
</mds-card>
```

#### Dividing Items Inside a Price-Table List

`<mds-separator>` is the internal divider used by [`mds-price-table-list`](../../mds-price-table-list), between its header and its items. When building a custom feature list, place one separator between consecutive rows, never one before the first or after the last.

```html
<div class="grid">
  <mds-text typography="caption">Archiviazione inclusa</mds-text>
  <mds-separator></mds-separator>
  <mds-text typography="caption">Utenti illimitati</mds-text>
  <mds-separator></mds-separator>
  <mds-text typography="caption">Supporto dedicato</mds-text>
</div>
```

#### Custom Separator Color

Override the divider color through the single documented CSS custom property `--mds-separator-background`. Use a semantic color role wrapped in `rgb(var(--magma-<role>))` so dark-mode and high-contrast variants keep working.

```css
.sezione-speciale mds-separator {
  --mds-separator-background: rgb(var(--magma-accent-border));
}
```

```html
<div class="sezione-speciale">
  <mds-text typography="h6">Piano Pro</mds-text>
  <mds-separator></mds-separator>
  <mds-text typography="paragraph">Accesso a tutte le funzionalita</mds-text>
</div>
```


### 3. Antipattern

Common incorrect uses of `<mds-separator>`. Each entry pairs the wrong form with the right one and a one-line reason. System-wide rules (boolean-as-string, shadow piercing, Tailwind color utilities, raw native event listening) live in [`docs/agents/anti-patterns.md`](../../../../../../docs/agents/anti-patterns.md) - they apply here too but are not repeated.

#### Do Not Use a Raw `<hr>` Instead of `<mds-separator>`

Using a plain `<hr>` bypasses the Magma token system, so the divider will not adapt to dark mode or high-contrast preferences automatically. Use `<mds-separator>` for any themed divider inside a Magma layout.

```html
<!-- INCORRECT -->
<mds-entity icon="mi/baseline/person">
  <mds-text typography="h6">Mario Rossi</mds-text>
</mds-entity>
<hr>
<mds-entity icon="mi/baseline/person">
  <mds-text typography="h6">Luigi Verdi</mds-text>
</mds-entity>

<!-- CORRECT -->
<mds-entity icon="mi/baseline/person">
  <mds-text typography="h6">Mario Rossi</mds-text>
</mds-entity>
<mds-separator></mds-separator>
<mds-entity icon="mi/baseline/person">
  <mds-text typography="h6">Luigi Verdi</mds-text>
</mds-entity>
```

#### Do Not Put Content Inside `<mds-separator>`

The component defines no slots and accepts no children. Placing text or elements inside it has no effect and may produce unexpected layout behavior.

```html
<!-- INCORRECT -->
<mds-separator>oppure</mds-separator>

<!-- CORRECT -->
<!-- Use a dedicated labeled-divider pattern with a flex row if a label is needed -->
<div class="flex items-center gap-300">
  <mds-separator class="grow"></mds-separator>
  <mds-text typography="caption">oppure</mds-text>
  <mds-separator class="grow"></mds-separator>
</div>
```

#### Do Not Override Color with a Raw CSS Value

Setting `--mds-separator-background` to a literal hex or RGB value without using a semantic color role breaks dark mode and high-contrast adaptation. Always wrap the value in `rgb(var(--magma-<role>))`.

```css
/* INCORRECT */
mds-separator {
  --mds-separator-background: #cccccc;
}

/* CORRECT */
mds-separator {
  --mds-separator-background: rgb(var(--magma-border-muted));
}
```

#### Do Not Pierce Shadow DOM to Style the Separator

There are no documented `::part()` names on `<mds-separator>`. The only supported customization surface is `--mds-separator-background`. Targeting internal elements via `>>>` or undocumented selectors will break on future releases.

```css
/* INCORRECT */
mds-separator >>> :host {
  height: 2px;
  border-radius: 0;
}

/* CORRECT */
/* Only --mds-separator-background is the supported override.
   Layout constraints such as height are not part of its styling API. */
mds-separator {
  --mds-separator-background: rgb(var(--magma-accent-border));
}
```

#### Do Not Add Semantic Roles to `<mds-separator>`

`<mds-separator>` is purely decorative. Adding `role="separator"` or `aria-orientation` introduces misleading semantics for assistive technology. `<mds-hr>` carries no role either: express a meaningful break through the document structure (headings, sections).

```html
<!-- INCORRECT -->
<mds-separator role="separator" aria-orientation="horizontal"></mds-separator>

<!-- CORRECT - decorative divider (no ARIA needed) -->
<mds-separator></mds-separator>
```



## CSS Custom Properties

| Name                         | Description                                |
| ---------------------------- | ------------------------------------------ |
| `--mds-separator-background` | Background color of the separator element. |


## Dependencies

### Used by

 - [mds-price-table-list](../mds-price-table-list)

### Graph
```mermaid
graph TD;
  mds-price-table-list --> mds-separator
  style mds-separator fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
