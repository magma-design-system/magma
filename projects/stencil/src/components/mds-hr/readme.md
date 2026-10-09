# mds-hr



This is a web-component from Maggioli Design System [Magma](https://magma.maggiolicloud.it), built with StencilJS, TypeScript, Storybook. It's based on the web-component standard and it's designed to be agnostic from the JavaScript framework you are using.

<!-- Auto Generated Below -->


## Usage

### 1. Description

The `<mds-hr>` web component is the horizontal rule of the Magma Design System. It is a purely presentational separator that replaces the native `<hr>` element, rendering a thin themed divider line to split content into visual sections.

#### Semantic Behavior

- **No interactivity**: The component has no props, slots, events, or state; it is decorative and takes no part in focus order, form association, or keyboard interaction.
- **Full-width line**: It always spans the full inline width of its container and is sized purely by layout context.
- **Theme-aware color**: The rule is painted with the `wash-strong` neutral role and adapts automatically between light and dark preference themes, so it stays legible without configuration.

#### Properties & Visual Configurations

`<mds-hr>` exposes no props. Visual variation is achieved entirely through standard utility classes on the host - for example overriding the background color with a semantic color utility (`class="bg-border-default"`) - rather than through component-specific attributes.


### 2. Pattern

Correct and idiomatic ways to use the `<mds-hr>` component, ordered from most common to most specialized. Patterns assume a working knowledge of the shared component rules in [`docs/agents/conventions.md`](../../../../../../docs/agents/conventions.md).

#### Default Divider

The simplest use - no attributes required. Drop it between content blocks to draw a full-width neutral rule that adapts automatically to light and dark themes.

```html
<section>
  <mds-text typography="h4">Dati personali</mds-text>
  <mds-text typography="paragraph">Nome, cognome e data di nascita.</mds-text>
</section>

<mds-hr></mds-hr>

<section>
  <mds-text typography="h4">Dati di contatto</mds-text>
  <mds-text typography="paragraph">Indirizzo e-mail e numero di telefono.</mds-text>
</section>
```

#### Divider Inside a Card

Use `<mds-hr>` to split regions inside a compound component such as `<mds-card>`. It stretches to the full width of its parent slot, so no extra sizing is needed.

```html
<mds-card>
  <mds-card-header slot="header">
    <mds-text typography="h6">Riepilogo ordine</mds-text>
  </mds-card-header>
  <mds-card-content slot="content">
    <mds-text typography="paragraph">Articolo 1 - Servizio annuale</mds-text>
    <mds-hr></mds-hr>
    <mds-text typography="paragraph">Articolo 2 - Supporto prioritario</mds-text>
  </mds-card-content>
</mds-card>
```

#### Color Tint via Utility Class

`<mds-hr>` exposes no CSS custom properties. To change the line color, apply a semantic color utility class (`bg-<role>`) directly on the host element. Use `rgb(var(--magma-<role>))` values in CSS only when no matching utility class exists.

```html
<!-- Stronger neutral rule -->
<mds-hr class="bg-border-default"></mds-hr>

<!-- Branded primary tint -->
<mds-hr class="bg-accent-border"></mds-hr>
```

#### Divider Inside a Form

Use `<mds-hr>` to visually group related form fields without adding semantic structure (use `<fieldset>` for the semantic grouping; `<mds-hr>` is purely presentational).

```html
<form>
  <mds-input-field label="Nome">
    <mds-input name="nome"></mds-input>
  </mds-input-field>
  <mds-input-field label="Cognome">
    <mds-input name="cognome"></mds-input>
  </mds-input-field>

  <mds-hr></mds-hr>

  <mds-input-field label="E-mail">
    <mds-input name="email" type="email"></mds-input>
  </mds-input-field>
</form>
```

#### Width Constraint via Parent Layout

`<mds-hr>` always fills `width: 100%` of its container. To produce an inset or centered rule, constrain it through the parent's padding or a wrapping element - do not apply `width` inline on the component itself.

```html
<div style="padding-inline: 2rem;">
  <mds-hr></mds-hr>
</div>
```


### 3. Antipattern

Common incorrect uses of `<mds-hr>`. Each entry pairs the wrong form with the right one and a one-line reason. System-wide rules (boolean-as-string, shadow piercing, Tailwind color utilities, raw native event listening) live in [`docs/agents/anti-patterns.md`](../../../../../../docs/agents/anti-patterns.md) - they apply here too but are not repeated.

#### Do Not Use the Raw `<hr>` Element

The native `<hr>` element does not pick up Magma tokens, so it renders with browser-default styling that does not adapt to themes or high-contrast preferences. Replace it with `<mds-hr>` inside any Magma-themed page.

```html
<!-- INCORRECT -->
<hr />

<!-- CORRECT -->
<mds-hr></mds-hr>
```

#### Do Not Set `width` or `height` Directly on the Component

`<mds-hr>` manages its own `width: 100%` and `height: 1px` internally. Overriding these via inline styles or CSS produces inconsistent results across layouts and breaks the visual system contract. Use parent padding to create inset rules instead.

```html
<!-- INCORRECT -->
<mds-hr style="width: 50%; height: 2px;"></mds-hr>

<!-- CORRECT -->
<div style="padding-inline: 2rem;">
  <mds-hr></mds-hr>
</div>
```

#### Do Not Pierce Shadow DOM to Change the Line Color

`<mds-hr>` exposes no `::part()` surface and no `--mds-hr-*` CSS custom properties. Targeting its `:host` internals via `>>>` or `/deep/` will break on updates. Apply a semantic color utility class (`bg-<role>`) on the host element instead.

```css
/* INCORRECT */
mds-hr >>> :host {
  background-color: red;
}

/* CORRECT */
```

```html
<mds-hr class="bg-border-default"></mds-hr>
```

#### Do Not Slot Content Into `<mds-hr>`

`<mds-hr>` is an empty presentational rule with no slot. Any children placed inside the tags are silently ignored and do not render.

```html
<!-- INCORRECT -->
<mds-hr>
  <span>oppure</span>
</mds-hr>

<!-- CORRECT -->
<mds-text typography="caption" class="text-center">oppure</mds-text>
<mds-hr></mds-hr>
```

#### Do Not Use `<mds-separator>` as a Horizontal Rule

[`mds-separator`](../../mds-separator) is a **vertical** divider intended for inline or flex contexts such as toolbars and breadcrumbs. Using it to separate stacked content blocks produces incorrect orientation and layout.

```html
<!-- INCORRECT -->
<section>Sezione A</section>
<mds-separator></mds-separator>
<section>Sezione B</section>

<!-- CORRECT -->
<section>Sezione A</section>
<mds-hr></mds-hr>
<section>Sezione B</section>
```



----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
