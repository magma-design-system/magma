# mds-price-table



This is a web-component from Maggioli Design System [Magma](https://magma.maggiolicloud.it), built with StencilJS, TypeScript, Storybook. It's based on the web-component standard and it's designed to be agnostic from the JavaScript framework you are using.

<!-- Auto Generated Below -->


## Usage

### 1. Description

The `<mds-price-table>` web component is the layout container of the Magma Design System pricing-table family. It owns no logic or visual chrome of its own: it stacks its slotted compound children (the plan columns, header and feature matrix) into a coherent pricing comparison surface.

#### Semantic Behavior

- **Default slot only**: Any markup placed between the tags is projected verbatim. It expects the dedicated compound children (`mds-price-table-list`, `mds-price-table-header`, `mds-price-table-features`, `mds-price-table-features-row`, `mds-price-table-features-cell`) rather than free-form content.
- **Grid layout host**: Projected blocks are spaced consistently regardless of how many plans or feature rows are supplied.
- **Responsive composition**: It does not switch layouts internally. Two arrangements are expressed through the children and utility classes - a stacked, per-plan layout (each `mds-price-table-list` carrying its own feature matrix) for narrow viewports, and a shared `mds-price-table-header` + single `mds-price-table-features` matrix for wide viewports.
- **No props, events, or state**: All configuration lives on the child components.

#### Properties & Visual Configurations

This component is a pure compound parent and intentionally has no configurable props. Visual variation comes from the children it wraps - for example the `type` attribute on `mds-price-table-features-cell` (`'label'`, `'text'`, `'supported'`, `'unsupported'`) drives what each matrix cell renders, and the named slots on `mds-price-table-list` (`header`, `price`, `action`) position each plan's heading, price and call-to-action. Refer to those child components' own documentation for their value ladders.


### 2. Pattern

Correct and idiomatic ways to use the `<mds-price-table>` family, ordered from most common to most specialized. Patterns assume a working knowledge of the compound-component rules documented in [`docs/COMPONENTS.md`](../../../../../../docs/COMPONENTS.md) and the generic stencil rules in [`projects/stencil/SPEC.md`](../../../../SPEC.md).

#### Single-Plan Card (Mobile Layout)

Use one `<mds-price-table>` per plan on narrow viewports. Each instance contains one `<mds-price-table-list>` (the plan card) followed by one `<mds-price-table-features>` (its feature matrix). The `header`, `price`, and `action` slots of `<mds-price-table-list>` position plan heading, price, and call-to-action respectively.

```html
<mds-price-table>
  <mds-price-table-list>
    <mds-text typography="h5" tag="h4" slot="header">Piano Base</mds-text>
    <mds-text typography="detail" slot="header">Ideale per liberi professionisti.</mds-text>
    <mds-text typography="h2" tag="h4" slot="price">49 EUR</mds-text>
    <mds-button slot="action" variant="dark">Inizia ora</mds-button>
  </mds-price-table-list>
  <mds-price-table-features>
    <mds-price-table-features-row>
      <mds-price-table-features-cell type="label">Utenti</mds-price-table-features-cell>
      <mds-price-table-features-cell type="text">10</mds-price-table-features-cell>
    </mds-price-table-features-row>
    <mds-price-table-features-row>
      <mds-price-table-features-cell type="label">Supporto</mds-price-table-features-cell>
      <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
    </mds-price-table-features-row>
    <mds-price-table-features-row>
      <mds-price-table-features-cell type="label">Report avanzati</mds-price-table-features-cell>
      <mds-price-table-features-cell type="unsupported"></mds-price-table-features-cell>
    </mds-price-table-features-row>
  </mds-price-table-features>
</mds-price-table>
```

#### Multi-Plan Comparison (Desktop Layout)

Use a single `<mds-price-table>` wrapping one `<mds-price-table-header>` and one shared `<mds-price-table-features>`. The header holds a heading element plus one `<mds-price-table-list>` per plan. Each `<mds-price-table-features-row>` then carries one `label` cell followed by one data cell per plan - the row component distributes them evenly.

```html
<mds-price-table>
  <mds-price-table-header class="tablet:grid-cols-3 desktop:grid-cols-4">
    <mds-text typography="h1" tag="h3" class="desktop:py-600">Scegli il tuo piano</mds-text>

    <mds-price-table-list>
      <mds-text typography="h5" tag="h4" slot="header">Base</mds-text>
      <mds-text typography="h2" tag="h4" slot="price">49 EUR</mds-text>
      <mds-button slot="action" variant="dark">Inizia</mds-button>
    </mds-price-table-list>

    <mds-price-table-list class="bg-label-amaranth-10">
      <mds-text typography="h5" tag="h4" slot="header">Professional</mds-text>
      <mds-text typography="h2" tag="h4" slot="price">99 EUR</mds-text>
      <mds-button slot="action" variant="dark">Inizia</mds-button>
    </mds-price-table-list>
  </mds-price-table-header>

  <mds-price-table-features label="Caratteristiche">
    <mds-price-table-features-row>
      <mds-price-table-features-cell type="label">Utenti</mds-price-table-features-cell>
      <mds-price-table-features-cell type="text">10</mds-price-table-features-cell>
      <mds-price-table-features-cell type="text">20</mds-price-table-features-cell>
    </mds-price-table-features-row>
    <mds-price-table-features-row>
      <mds-price-table-features-cell type="label">Automazione</mds-price-table-features-cell>
      <mds-price-table-features-cell type="unsupported"></mds-price-table-features-cell>
      <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
    </mds-price-table-features-row>
  </mds-price-table-features>
</mds-price-table>
```

#### Feature Matrix Section with a Label

Pass the `label` prop to `<mds-price-table-features>` to render a bold section heading above the feature rows. Use this when the comparison is split across multiple thematic groups (for example "Funzionalita base" and "Report e analisi").

```html
<mds-price-table-features label="Report e analisi">
  <mds-price-table-features-row>
    <mds-price-table-features-cell type="label">Export report</mds-price-table-features-cell>
    <mds-price-table-features-cell type="unsupported"></mds-price-table-features-cell>
    <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
  </mds-price-table-features-row>
  <mds-price-table-features-row>
    <mds-price-table-features-cell type="label">Report avanzati</mds-price-table-features-cell>
    <mds-price-table-features-cell type="unsupported"></mds-price-table-features-cell>
    <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
  </mds-price-table-features-row>
</mds-price-table-features>
```

#### Feature Cell Types

`<mds-price-table-features-cell>` drives what each matrix cell renders through its `type` attribute. The five accepted values are: `label` (plain row heading), `text` (detail string), `supported` (check icon), `unsupported` (dash icon), and `custom` (arbitrary slotted content).

```html
<mds-price-table-features-row>
  <!-- Row heading - typically the first cell -->
  <mds-price-table-features-cell type="label">Archiviazione</mds-price-table-features-cell>

  <!-- Text value cell -->
  <mds-price-table-features-cell type="text">10 GB</mds-price-table-features-cell>

  <!-- Supported / unsupported icon cells (no slotted content needed) -->
  <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
  <mds-price-table-features-cell type="unsupported"></mds-price-table-features-cell>

  <!-- Custom cell for arbitrary content -->
  <mds-price-table-features-cell type="custom">
    <mds-badge variant="success" tone="weak">Nuovo</mds-badge>
  </mds-price-table-features-cell>
</mds-price-table-features-row>
```

#### Contextual Help on a Feature Cell

Slot an `<mds-help>` inside a `label` or `text` cell to add an inline tooltip explaining a feature. Place it directly after the label text so the icon appears inline.

```html
<mds-price-table-features-row>
  <mds-price-table-features-cell type="label">
    Funzionalita automatizzate
    <mds-help>Includono notifiche, workflow e integrazioni API.</mds-help>
  </mds-price-table-features-cell>
  <mds-price-table-features-cell type="unsupported"></mds-price-table-features-cell>
  <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
</mds-price-table-features-row>
```

#### List Items Inside a Plan Card

Use `<mds-price-table-list-item>` via the `item` slot for a bulleted feature list inside a plan card. Set `supported` to `true` for included features and leave it `false` (default) for excluded ones. The `typography` prop controls the text size.

```html
<mds-price-table-list>
  <mds-text typography="h5" tag="h4" slot="header">Piano Base</mds-text>
  <mds-text typography="h2" tag="h4" slot="price">49 EUR</mds-text>

  <mds-price-table-list-item supported>Accesso base</mds-price-table-list-item>
  <mds-price-table-list-item supported>Supporto clienti</mds-price-table-list-item>
  <mds-price-table-list-item>Automazione</mds-price-table-list-item>
  <mds-price-table-list-item>Export report</mds-price-table-list-item>

  <mds-button slot="action" variant="dark">Inizia ora</mds-button>
</mds-price-table-list>
```

#### Highlighted Plan Card

Apply a Magma label-color utility class directly to `<mds-price-table-list>` to visually distinguish a recommended or featured plan. Do not set a background color through inline styles or custom CSS; use the documented background tokens.

```html
<mds-price-table>
  <mds-price-table-list>
    <mds-text typography="h5" tag="h4" slot="header">Base</mds-text>
    <mds-text typography="h2" tag="h4" slot="price">49 EUR</mds-text>
    <mds-button slot="action" variant="dark">Inizia</mds-button>
  </mds-price-table-list>

  <!-- Highlighted plan -->
  <mds-price-table-list class="bg-label-amaranth-10">
    <mds-text typography="h5" tag="h4" slot="header">Professional</mds-text>
    <mds-text typography="h2" tag="h4" slot="price">99 EUR</mds-text>
    <mds-button slot="action" variant="dark">Inizia</mds-button>
  </mds-price-table-list>
</mds-price-table>
```

#### Separator Color Customization

`<mds-price-table-list>` exposes one CSS custom property, `--mds-price-table-list-separator-color`, to style the horizontal rule that separates the header from the item list. Set it on the host using Magma color tokens.

```css
.featured-plan mds-price-table-list {
  --mds-price-table-list-separator-color: rgb(var(--variant-primary-03));
}
```


### 3. Antipattern

Common incorrect uses of the `<mds-price-table>` family. Each entry pairs the wrong form with the right one and a one-line reason. System-wide rules (boolean-as-string, shadow piercing, Tailwind color utilities, raw native event listening) live in [`docs/COMPONENTS.md`](../../../../../../docs/COMPONENTS.md#system-level-anti-patterns) - they apply here too but are not repeated.

#### Do Not Use Child Components Outside Their Parent

`<mds-price-table-features-row>` and `<mds-price-table-features-cell>` communicate with `<mds-price-table-features>` through the slot mechanism. Placing them in free-form HTML breaks that relationship and the row loses its column-width distribution logic.

```html
<!-- 🚫 INCORRECT -->
<mds-price-table-features-row>
  <mds-price-table-features-cell type="label">Utenti</mds-price-table-features-cell>
  <mds-price-table-features-cell type="text">10</mds-price-table-features-cell>
</mds-price-table-features-row>

<!-- ✅ CORRECT -->
<mds-price-table-features>
  <mds-price-table-features-row>
    <mds-price-table-features-cell type="label">Utenti</mds-price-table-features-cell>
    <mds-price-table-features-cell type="text">10</mds-price-table-features-cell>
  </mds-price-table-features-row>
</mds-price-table-features>
```

#### Do Not Omit the Slot Name on Plan Card Children

`<mds-price-table-list>` routes content through named slots: `header`, `price`, and `action`. Content without a `slot` attribute falls into the default slot, which is reserved for `<mds-price-table-list-item>` via the `item` slot name, and will not appear in the header or footer regions.

```html
<!-- 🚫 INCORRECT - heading rendered in wrong region -->
<mds-price-table-list>
  <mds-text typography="h5" tag="h4">Piano Base</mds-text>
  <mds-text typography="h2" tag="h4">49 EUR</mds-text>
  <mds-button variant="dark">Inizia</mds-button>
</mds-price-table-list>

<!-- ✅ CORRECT -->
<mds-price-table-list>
  <mds-text typography="h5" tag="h4" slot="header">Piano Base</mds-text>
  <mds-text typography="h2" tag="h4" slot="price">49 EUR</mds-text>
  <mds-button slot="action" variant="dark">Inizia</mds-button>
</mds-price-table-list>
```

#### Do Not Pass `supported="false"` as a String on `mds-price-table-list-item`

`supported` is a boolean prop. Any non-empty string value, including `"false"`, is truthy in HTML and will mark the item as included. Remove the attribute to express a missing feature.

```html
<!-- 🚫 INCORRECT -->
<mds-price-table-list-item supported="false">Export report</mds-price-table-list-item>

<!-- ✅ CORRECT -->
<mds-price-table-list-item>Export report</mds-price-table-list-item>
```

#### Do Not Use an Invalid `type` on `mds-price-table-features-cell`

`type` accepts exactly five values: `label`, `text`, `supported`, `unsupported`, `custom`. An unrecognised value silently renders nothing because the component matches each value with a conditional render branch.

```html
<!-- 🚫 INCORRECT (not a valid type value) -->
<mds-price-table-features-cell type="check"></mds-price-table-features-cell>
<mds-price-table-features-cell type="icon"></mds-price-table-features-cell>

<!-- ✅ CORRECT -->
<mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
```

#### Do Not Place Free-Form HTML Directly Inside `mds-price-table`

`<mds-price-table>` is a pure layout host - its slot expects the dedicated compound children. Arbitrary HTML breaks the grid spacing contract and produces unstyled content because the component applies no visual treatment to unknown children.

```html
<!-- 🚫 INCORRECT -->
<mds-price-table>
  <div class="piano">
    <h3>Piano Base</h3>
    <p>49 EUR/mese</p>
  </div>
</mds-price-table>

<!-- ✅ CORRECT -->
<mds-price-table>
  <mds-price-table-list>
    <mds-text typography="h5" tag="h4" slot="header">Piano Base</mds-text>
    <mds-text typography="h2" tag="h4" slot="price">49 EUR/mese</mds-text>
    <mds-button slot="action" variant="dark">Inizia</mds-button>
  </mds-price-table-list>
</mds-price-table>
```

#### Do Not Put Slotted Content Inside `supported` or `unsupported` Cells

`<mds-price-table-features-cell type="supported">` and `type="unsupported"` render a fixed icon and ignore any slotted content. Only `type="text"`, `type="label"`, and `type="custom"` project slotted nodes.

```html
<!-- 🚫 INCORRECT - slotted text is silently ignored -->
<mds-price-table-features-cell type="supported">Si</mds-price-table-features-cell>
<mds-price-table-features-cell type="unsupported">No</mds-price-table-features-cell>

<!-- ✅ CORRECT - leave icon cells empty or use text/custom for values -->
<mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
<mds-price-table-features-cell type="text">Non disponibile</mds-price-table-features-cell>
```

#### Do Not Pierce Shadow Parts of Child Components to Restyle Cells

`<mds-price-table-features-cell>` exposes two documented shadow parts: `icon` (the check or dash icon) and `text` (the detail text wrapper). Targeting undocumented internals via `>>>` or unlisted `::part()` names couples app code to implementation details that may change.

```css
/* 🚫 INCORRECT */
mds-price-table-features-cell >>> .icon {
  fill: red;
}
mds-price-table-features-cell::part(cell-wrapper) {
  padding: 1rem;
}

/* ✅ CORRECT */
mds-price-table-features-cell::part(icon) {
  fill: rgb(var(--variant-success-04));
}
```



## Slots

| Slot | Description                                                       |
| ---- | ----------------------------------------------------------------- |
|      | Add `mds-price-table-list` elements or `components` to this slot. |


----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
