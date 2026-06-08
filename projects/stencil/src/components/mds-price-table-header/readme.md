# mds-price-table-header



This is a web-component from Maggioli Design System [Magma](https://magma.maggiolicloud.it), built with StencilJS, TypeScript, Storybook. It's based on the web-component standard and it's designed to be agnostic from the JavaScript framework you are using.

<!-- Auto Generated Below -->


## Usage

### 1. Description

The `<mds-price-table-header>` web component is the layout child that forms the top band of a [`<mds-price-table>`](../../mds-price-table), aligning an optional leading title cell with the per-plan `<mds-price-table-list>` columns so the header sits in the same column grid as the feature rows below it. It is a pure presentational wrapper.

#### Semantic Behavior

- **Compound child only**: Must be placed as a direct slot child of `<mds-price-table>`; it is not used standalone, and it expects its own children to be the price-plan columns (typically a leading `<mds-text>` title plus one `<mds-price-table-list>` per plan) so they line up with the `<mds-price-table-features>` columns underneath.
- **Auto-fit column grid**: Every direct child becomes an equal-width column by default.
- **Layout overridden via classes**: Because the column count is content-driven, the explicit per-breakpoint layout (e.g. `tablet:grid-cols-3 desktop:grid-cols-4`, plus `col-span` on a leading title) is applied through utility classes on the host and its children rather than through props.
- **Single default slot**: Passes content straight through; it has no named slots, no internal ARIA role, no state, and emits no events.

#### Properties & Visual Configurations

This component exposes no configurable props. It is a layout-only child: its sole job is to project its slotted children into an equal-column grid that matches the rest of the price table. Control the arrangement through CSS utility classes (grid column counts per breakpoint, column spans on the leading title) on the host and on the slotted elements, not through component attributes. See the shared compound-component and layout conventions in [`projects/stencil/SPEC.md`](../../../../SPEC.md#tone-and-variant-system).


### 2. Pattern

Correct and idiomatic ways to use the `<mds-price-table-header>` component, ordered from most common to most specialized. Patterns assume a working knowledge of the compound-component rules documented in [`docs/COMPONENTS.md`](../../../../../../docs/COMPONENTS.md) and the generic stencil rules in [`projects/stencil/SPEC.md`](../../../../SPEC.md).

#### Standard Three-Plan Header

The most common form: a leading title column followed by one [`<mds-price-table-list>`](../../mds-price-table-list) per plan. Apply responsive grid-column utilities directly on the host to align the header with the feature rows below it.

```html
<mds-price-table-header class="tablet:grid-cols-3 desktop:grid-cols-4">
  <mds-text typography="h1" class="tablet:col-span-3 desktop:col-span-1 desktop:py-600">
    Scegli il piano per te
  </mds-text>

  <mds-price-table-list>
    <mds-text typography="h5" slot="header">Piano Base</mds-text>
    <mds-text typography="detail" slot="header">
      Ideale per liberi professionisti.
    </mds-text>
    <mds-text typography="h2" slot="price">49 EUR / mese</mds-text>
    <mds-button slot="action" variant="dark">Inizia ora</mds-button>
  </mds-price-table-list>

  <mds-price-table-list>
    <mds-text typography="h5" slot="header">Piano Professional</mds-text>
    <mds-text typography="detail" slot="header">
      Per studi di medie dimensioni.
    </mds-text>
    <mds-text typography="h2" slot="price">99 EUR / mese</mds-text>
    <mds-button slot="action" variant="dark">Inizia ora</mds-button>
  </mds-price-table-list>

  <mds-price-table-list>
    <mds-text typography="h5" slot="header">Piano Enterprise</mds-text>
    <mds-text typography="detail" slot="header">
      Soluzioni su misura per grandi organizzazioni.
    </mds-text>
    <mds-text typography="h2" slot="price">149 EUR / mese</mds-text>
    <mds-button slot="action" variant="dark">Inizia ora</mds-button>
  </mds-price-table-list>
</mds-price-table-header>
```

#### Header Without a Leading Title Column

When the layout does not need a title column on the left, omit the leading element and let the auto-fit grid divide space equally among the plan columns. Update the grid-column count to match the number of plans.

```html
<mds-price-table-header class="tablet:grid-cols-2 desktop:grid-cols-3">
  <mds-price-table-list>
    <mds-text typography="h5" slot="header">Starter</mds-text>
    <mds-text typography="h2" slot="price">Gratuito</mds-text>
    <mds-button slot="action" variant="primary" tone="strong">Registrati</mds-button>
  </mds-price-table-list>

  <mds-price-table-list>
    <mds-text typography="h5" slot="header">Business</mds-text>
    <mds-text typography="h2" slot="price">79 EUR / mese</mds-text>
    <mds-button slot="action" variant="primary" tone="strong">Abbonati</mds-button>
  </mds-price-table-list>

  <mds-price-table-list>
    <mds-text typography="h5" slot="header">Enterprise</mds-text>
    <mds-text typography="h2" slot="price">Su richiesta</mds-text>
    <mds-button slot="action" variant="dark">Contattaci</mds-button>
  </mds-price-table-list>
</mds-price-table-header>
```

#### Highlighted Plan Column

Apply a background utility class directly to an [`<mds-price-table-list>`](../../mds-price-table-list) child to visually emphasize a recommended plan. No extra wrapper is needed.

```html
<mds-price-table-header class="tablet:grid-cols-3 desktop:grid-cols-4">
  <mds-text typography="h1" class="tablet:col-span-3 desktop:col-span-1">
    Trova il piano giusto
  </mds-text>

  <mds-price-table-list>
    <mds-text typography="h5" slot="header">Base</mds-text>
    <mds-text typography="h2" slot="price">29 EUR / mese</mds-text>
    <mds-button slot="action" variant="dark">Inizia</mds-button>
  </mds-price-table-list>

  <!-- Recommended plan - highlighted via background utility -->
  <mds-price-table-list class="bg-label-amaranth-10">
    <mds-text typography="h5" slot="header">Consigliato</mds-text>
    <mds-text typography="h2" slot="price">69 EUR / mese</mds-text>
    <mds-button slot="action" variant="primary" tone="strong">Inizia</mds-button>
  </mds-price-table-list>

  <mds-price-table-list>
    <mds-text typography="h5" slot="header">Premium</mds-text>
    <mds-text typography="h2" slot="price">129 EUR / mese</mds-text>
    <mds-button slot="action" variant="dark">Inizia</mds-button>
  </mds-price-table-list>
</mds-price-table-header>
```

#### Matching Column Count to Feature Rows

When combined with [`<mds-price-table-features>`](../../mds-price-table-features) below the header, the breakpoint grid-column classes on `<mds-price-table-header>` and on [`<mds-price-table-features>`](../../mds-price-table-features) must match so columns align visually. Apply the same class string to both.

```html
<mds-price-table>
  <mds-price-table-header class="tablet:grid-cols-3 desktop:grid-cols-4">
    <mds-text typography="h1" class="tablet:col-span-3 desktop:col-span-1">
      Prezzi e funzionalita
    </mds-text>
    <mds-price-table-list>
      <mds-text typography="h5" slot="header">Base</mds-text>
      <mds-text typography="h2" slot="price">49 EUR</mds-text>
      <mds-button slot="action" variant="dark">Abbonati</mds-button>
    </mds-price-table-list>
    <mds-price-table-list>
      <mds-text typography="h5" slot="header">Pro</mds-text>
      <mds-text typography="h2" slot="price">99 EUR</mds-text>
      <mds-button slot="action" variant="dark">Abbonati</mds-button>
    </mds-price-table-list>
    <mds-price-table-list>
      <mds-text typography="h5" slot="header">Enterprise</mds-text>
      <mds-text typography="h2" slot="price">199 EUR</mds-text>
      <mds-button slot="action" variant="dark">Contattaci</mds-button>
    </mds-price-table-list>
  </mds-price-table-header>

  <mds-price-table-features class="tablet:grid-cols-3 desktop:grid-cols-4">
    <!-- feature rows go here -->
  </mds-price-table-features>
</mds-price-table>
```

#### Mobile Collapse with Responsive Classes

On narrow viewports, collapse the multi-column header into a single-column stack using a `max-mobile:grid-cols-1` utility. The leading title then occupies the full row before the plan cards.

```html
<mds-price-table-header
  class="max-mobile:grid-cols-1 tablet:grid-cols-3 desktop:grid-cols-4"
>
  <mds-text typography="h1" class="tablet:col-span-3 desktop:col-span-1">
    Confronta i piani
  </mds-text>

  <mds-price-table-list>
    <mds-text typography="h5" slot="header">Individuale</mds-text>
    <mds-text typography="h2" slot="price">19 EUR / mese</mds-text>
    <mds-button slot="action" variant="dark">Scegli</mds-button>
  </mds-price-table-list>

  <mds-price-table-list>
    <mds-text typography="h5" slot="header">Team</mds-text>
    <mds-text typography="h2" slot="price">49 EUR / mese</mds-text>
    <mds-button slot="action" variant="dark">Scegli</mds-button>
  </mds-price-table-list>

  <mds-price-table-list>
    <mds-text typography="h5" slot="header">Azienda</mds-text>
    <mds-text typography="h2" slot="price">149 EUR / mese</mds-text>
    <mds-button slot="action" variant="dark">Scegli</mds-button>
  </mds-price-table-list>
</mds-price-table-header>
```


### 3. Antipattern

Common incorrect uses of `<mds-price-table-header>`. Each entry pairs the wrong form with the right one and a one-line reason. System-wide rules (boolean-as-string, shadow piercing, Tailwind color utilities, raw native event listening) live in [`docs/COMPONENTS.md`](../../../../../../docs/COMPONENTS.md#system-level-anti-patterns) - they apply here too but are not repeated.

#### Do Not Use Outside `<mds-price-table>`

`<mds-price-table-header>` is a structural child of [`<mds-price-table>`](../../mds-price-table). Using it standalone breaks the compound component communication and the shared column grid that aligns header columns with feature rows below.

```html
<!-- 🚫 INCORRECT -->
<mds-price-table-header class="tablet:grid-cols-3">
  <mds-price-table-list>...</mds-price-table-list>
</mds-price-table-header>

<!-- ✅ CORRECT -->
<mds-price-table>
  <mds-price-table-header class="tablet:grid-cols-3">
    <mds-price-table-list>...</mds-price-table-list>
  </mds-price-table-header>
</mds-price-table>
```

#### Do Not Add Extra Wrapper Elements Around Plan Columns

The auto-fit grid counts direct children; adding `<div>` wrappers around plan cards breaks the equal-column distribution and misaligns the header with feature rows.

```html
<!-- 🚫 INCORRECT -->
<mds-price-table-header class="tablet:grid-cols-3">
  <div class="plans">
    <mds-price-table-list>...</mds-price-table-list>
    <mds-price-table-list>...</mds-price-table-list>
  </div>
</mds-price-table-header>

<!-- ✅ CORRECT -->
<mds-price-table-header class="tablet:grid-cols-3">
  <mds-price-table-list>...</mds-price-table-list>
  <mds-price-table-list>...</mds-price-table-list>
  <mds-price-table-list>...</mds-price-table-list>
</mds-price-table-header>
```

#### Do Not Set Column Layout With Inline Styles

The column count is expressed through Magma utility classes, not inline `style` attributes. Inline styles bypass the responsive utility cascade and are impossible to override with breakpoint tokens.

```html
<!-- 🚫 INCORRECT -->
<mds-price-table-header style="grid-template-columns: 1fr 1fr 1fr;">
  ...
</mds-price-table-header>

<!-- ✅ CORRECT -->
<mds-price-table-header class="tablet:grid-cols-3 desktop:grid-cols-4">
  ...
</mds-price-table-header>
```

#### Do Not Mismatch Column Count Between Header and Feature Section

If `<mds-price-table-header>` and [`<mds-price-table-features>`](../../mds-price-table-features) use different breakpoint grid-column classes, plan columns do not line up. Always apply the same column count to both.

```html
<!-- 🚫 INCORRECT: header has 4 columns, features has 3 -->
<mds-price-table>
  <mds-price-table-header class="desktop:grid-cols-4">
    <mds-text typography="h1">Piani</mds-text>
    <mds-price-table-list>...</mds-price-table-list>
    <mds-price-table-list>...</mds-price-table-list>
    <mds-price-table-list>...</mds-price-table-list>
  </mds-price-table-header>
  <mds-price-table-features class="desktop:grid-cols-3">
    ...
  </mds-price-table-features>
</mds-price-table>

<!-- ✅ CORRECT: same column class on both -->
<mds-price-table>
  <mds-price-table-header class="tablet:grid-cols-3 desktop:grid-cols-4">
    <mds-text typography="h1" class="tablet:col-span-3 desktop:col-span-1">Piani</mds-text>
    <mds-price-table-list>...</mds-price-table-list>
    <mds-price-table-list>...</mds-price-table-list>
    <mds-price-table-list>...</mds-price-table-list>
  </mds-price-table-header>
  <mds-price-table-features class="tablet:grid-cols-3 desktop:grid-cols-4">
    ...
  </mds-price-table-features>
</mds-price-table>
```

#### Do Not Place Non-Plan Content in the Header Without a Spanning Utility

The component places every direct child in its own equal-width column. A leading title or label that should span multiple columns must carry the appropriate `col-span` utility; without it, it shrinks to one narrow column and pushes the plan cards out of alignment.

```html
<!-- 🚫 INCORRECT: leading title takes one column, disrupting plan alignment -->
<mds-price-table-header class="desktop:grid-cols-4">
  <mds-text typography="h1">Scegli il piano</mds-text>
  <mds-price-table-list>...</mds-price-table-list>
  <mds-price-table-list>...</mds-price-table-list>
  <mds-price-table-list>...</mds-price-table-list>
</mds-price-table-header>

<!-- ✅ CORRECT: on tablet the title spans the full row; on desktop it takes one column -->
<mds-price-table-header class="tablet:grid-cols-3 desktop:grid-cols-4">
  <mds-text
    typography="h1"
    class="tablet:col-span-3 desktop:col-span-1 desktop:py-600"
  >
    Scegli il piano
  </mds-text>
  <mds-price-table-list>...</mds-price-table-list>
  <mds-price-table-list>...</mds-price-table-list>
  <mds-price-table-list>...</mds-price-table-list>
</mds-price-table-header>
```



----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
