# mds-card-content



This is a web-component from Maggioli Design System [Magma](https://magma.maggiolicloud.it), built with StencilJS, TypeScript, Storybook. It's based on the web-component standard and it's designed to be agnostic from the JavaScript framework you are using.

<!-- Auto Generated Below -->


## Usage

### 1. Description

The `<mds-card-content>` web component is the body region of a [`<mds-card>`](../../mds-card), grouping the primary textual or component content of a card. It is a thin layout wrapper with no HTML primitive equivalent: it exposes a single default slot and assigns itself to the parent card's `content` region automatically.

#### Semantic Behavior

- **Compound child only**: `<mds-card-content>` must be placed as a direct child of `<mds-card>`; it is not used standalone, and a card's content region is expected to be a dedicated `mds-card-*` child rather than mixed loose markup.
- **Automatic slot targeting**: It lands in the parent's `content` region without the developer having to set the `slot` attribute manually.
- **Presence affects parent layout**: The parent card adapts its responsive layout to whichever `mds-card-*` regions are present, so including or omitting the content region changes how the card arranges itself.
- **No state, events, or ARIA**: The component declares no props or emitted events and applies no role or ARIA attributes; it is purely structural and inherits semantics from whatever is slotted into it.

#### Slot semantics and layout role

This component is intentionally prop-free. Its only API is the **default slot**, which accepts text strings, HTML elements, or other components that make up the card's main content. All visual configuration (responsive behavior, grid layout) is governed by the parent `<mds-card>` through its `autoGrid` prop and the `--mds-card-gap` / `--mds-card-padding` custom properties; see the compound-component and slot rules in [`projects/stencil/SPEC.md`](../../../../SPEC.md).


### 2. Pattern

Correct and idiomatic ways to use the `<mds-card-content>` component, ordered from most common to most specialized. Patterns assume a working knowledge of compound-component composition documented in [`docs/COMPONENTS.md`](../../../../../../docs/COMPONENTS.md) and the generic stencil rules in [`projects/stencil/SPEC.md`](../../../../SPEC.md).

#### Basic Card with Content

The most common use: a card with only a content region. Place `<mds-card-content>` as a direct child of `<mds-card>` - no `slot` attribute needed, the component self-assigns to the parent's `content` region.

```html
<mds-card>
  <mds-card-content>
    <mds-text typography="label">Comune di Roma</mds-text>
    <mds-text typography="body">Aggiornato il 5 giugno 2026</mds-text>
  </mds-card-content>
</mds-card>
```

#### Full Card Composition

Use `<mds-card-content>` alongside [`<mds-card-header>`](../../mds-card-header), [`<mds-card-media>`](../../mds-card-media), and [`<mds-card-footer>`](../../mds-card-footer) to build a complete card. The parent arranges them in a responsive grid automatically when `auto-grid` is enabled (the default).

```html
<mds-card>
  <mds-card-media>
    <mds-img src="copertina.jpg" alt="Immagine documento"></mds-img>
  </mds-card-media>
  <mds-card-header label="Delibera n. 42"></mds-card-header>
  <mds-card-content>
    <mds-text typography="body">
      Approvazione del piano triennale delle opere pubbliche per il periodo 2026-2028.
    </mds-text>
  </mds-card-content>
  <mds-card-footer>
    <mds-button label="Scarica PDF" icon="mi/baseline/download" variant="primary"></mds-button>
  </mds-card-footer>
</mds-card>
```

#### Mixed Rich Content

The default slot accepts any HTML or components. Use it for structured content like lists, banners, or data visualizations that make up the card body.

```html
<mds-card>
  <mds-card-header label="Riepilogo pratiche"></mds-card-header>
  <mds-card-content>
    <mds-banner variant="warning" tone="weak" label="3 pratiche in scadenza oggi"></mds-banner>
    <mds-list>
      <mds-list-item label="Pratica SUAP 2026-001"></mds-list-item>
      <mds-list-item label="Pratica SUAP 2026-002"></mds-list-item>
      <mds-list-item label="Pratica SUAP 2026-003"></mds-list-item>
    </mds-list>
  </mds-card-content>
</mds-card>
```

#### Content-Only Card Without a Header

Omitting sibling regions is valid. A card holding only `<mds-card-content>` renders the content at full height in the grid's single-column layout. This is common for KPI panels or compact info tiles.

```html
<mds-card>
  <mds-card-content>
    <mds-kpi>
      <mds-kpi-item label="Pratiche aperte" value="142" variant="info"></mds-kpi-item>
    </mds-kpi>
  </mds-card-content>
</mds-card>
```

#### Adjusting Card Spacing via Parent Custom Properties

`<mds-card-content>` has no CSS custom properties of its own. Control the gap and padding of the card composition - including the content region - through the parent's `--mds-card-gap` and `--mds-card-padding` properties. Set them on the `<mds-card>` host or on a parent selector.

```css
.card-compatta mds-card {
  --mds-card-gap: var(--spacing-200);
  --mds-card-padding: var(--spacing-300);
}
```


### 3. Antipattern

Common incorrect uses of `<mds-card-content>`. Each entry pairs the wrong form with the right one and a one-line reason. System-wide rules (boolean-as-string, shadow piercing, Tailwind color utilities, raw native event listening) live in [`docs/COMPONENTS.md`](../../../../../../docs/COMPONENTS.md#system-level-anti-patterns) - they apply here too but are not repeated.

#### Do Not Use `<mds-card-content>` Outside `<mds-card>`

`<mds-card-content>` is a compound child and relies on `<mds-card>`'s slot infrastructure and grid layout. Used standalone it renders with no container context and produces unpredictable visual output.

```html
<!-- 🚫 INCORRECT -->
<mds-card-content>
  <mds-text typography="body">Testo senza contesto.</mds-text>
</mds-card-content>

<!-- ✅ CORRECT -->
<mds-card>
  <mds-card-content>
    <mds-text typography="body">Testo senza contesto.</mds-text>
  </mds-card-content>
</mds-card>
```

#### Do Not Set the `slot` Attribute Manually

`<mds-card-content>` self-assigns `slot="content"` in its `Host` render. Adding the attribute externally is redundant and can produce a double-assignment that breaks the grid-area resolution.

```html
<!-- 🚫 INCORRECT -->
<mds-card>
  <mds-card-content slot="content">
    <mds-text typography="body">Intestazione sezione principale.</mds-text>
  </mds-card-content>
</mds-card>

<!-- ✅ CORRECT -->
<mds-card>
  <mds-card-content>
    <mds-text typography="body">Intestazione sezione principale.</mds-text>
  </mds-card-content>
</mds-card>
```

#### Do Not Replace `<mds-card-content>` with a Raw `<div slot="content">`

A raw element placed directly in `slot="content"` bypasses the card-content component's internal grid and consistent padding, producing a layout that diverges from the design system baseline and breaks on card-region composition changes.

```html
<!-- 🚫 INCORRECT -->
<mds-card>
  <div slot="content" style="padding: 16px;">
    <p>Descrizione pratica edilizia.</p>
  </div>
</mds-card>

<!-- ✅ CORRECT -->
<mds-card>
  <mds-card-content>
    <mds-text typography="body">Descrizione pratica edilizia.</mds-text>
  </mds-card-content>
</mds-card>
```

#### Do Not Try to Style Spacing via `<mds-card-content>` CSS Vars

`<mds-card-content>` exposes no `--mds-card-content-*` custom properties. Setting them has no effect. Spacing is controlled through `--mds-card-gap` and `--mds-card-padding` on the parent `<mds-card>`.

```css
/* 🚫 INCORRECT - has no effect */
mds-card-content {
  --mds-card-content-padding: var(--spacing-600);
  --mds-card-content-gap: var(--spacing-400);
}

/* ✅ CORRECT - set on the parent card host */
mds-card {
  --mds-card-gap: var(--spacing-200);
  --mds-card-padding: var(--spacing-400);
}
```

#### Do Not Place Multiple `<mds-card-content>` Elements in One Card

Only one content region per card is supported. Multiple instances produce overlapping slot assignments and unpredictable grid output; consolidate all body content inside a single `<mds-card-content>`.

```html
<!-- 🚫 INCORRECT -->
<mds-card>
  <mds-card-content>
    <mds-text typography="label">Sezione A</mds-text>
  </mds-card-content>
  <mds-card-content>
    <mds-text typography="label">Sezione B</mds-text>
  </mds-card-content>
</mds-card>

<!-- ✅ CORRECT -->
<mds-card>
  <mds-card-content>
    <mds-text typography="label">Sezione A</mds-text>
    <mds-text typography="label">Sezione B</mds-text>
  </mds-card-content>
</mds-card>
```



## Slots

| Slot        | Description                                                      |
| ----------- | ---------------------------------------------------------------- |
| `"default"` | Add `text string`, `HTML elements` or `components` to this slot. |


----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
