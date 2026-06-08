# mds-price-table-features-row



This is a web-component from Maggioli Design System [Magma](https://magma.maggiolicloud.it), built with StencilJS, TypeScript, Storybook. It's based on the web-component standard and it's designed to be agnostic from the JavaScript framework you are using.

<!-- Auto Generated Below -->


## Usage

### 1. Description

The `<mds-price-table-features-row>` web component is a layout child of [`<mds-price-table-features>`](../../mds-price-table-features) that represents a single horizontal row inside the feature-comparison table, conceptually playing the role of a table row (`<tr>`).

#### Semantic Behavior

- **Compound constraint**: Must be a direct default-slot child of `<mds-price-table-features>`; it is not used standalone or mixed with other child component types.
- **Default slot for cells**: Its default slot expects `<mds-price-table-features-cell>` children only - each cell becomes one column of the row.
- **Automatic equal-width columns**: It distributes the available width equally across its cells so columns are aligned without manual sizing.
- **No role/ARIA overrides**: It is a pure presentational/layout wrapper with no added role, state props, events, or focus handling.

#### Properties & Visual Configurations

This component has no configurable props. Its only responsibility is layout: it groups one or more `<mds-price-table-features-cell>` elements into a single row and guarantees they share the available horizontal space equally. Visual appearance (background, text color, and their hover variants) is tuned through the CSS custom properties documented in `readme.md` (`--mds-price-table-features-row-background`, `--mds-price-table-features-row-color`, and their `-hover` counterparts). For the shared design-system conventions on compound components, refer to [`projects/stencil/SPEC.md`](../../../../SPEC.md#tone-and-variant-system).


### 2. Pattern

Correct and idiomatic ways to use the `<mds-price-table-features-row>` component, ordered from most common to most specialized. Patterns assume a working knowledge of the compound-component rules documented in [`docs/COMPONENTS.md`](../../../../../../docs/COMPONENTS.md) and the generic stencil rules in [`projects/stencil/SPEC.md`](../../../../SPEC.md).

#### Standard Feature Row with Supported / Unsupported Cells

The most common pattern: one label cell followed by one boolean cell per plan column. Use `type="label"` for the feature name and `type="supported"` or `type="unsupported"` for each plan's availability. The row distributes the cells equally across the available width automatically.

```html
<mds-price-table>
  <mds-price-table-features label="Funzionalita' incluse">
    <mds-price-table-features-row>
      <mds-price-table-features-cell type="label">Supporto clienti</mds-price-table-features-cell>
      <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
      <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
      <mds-price-table-features-cell type="unsupported"></mds-price-table-features-cell>
    </mds-price-table-features-row>
  </mds-price-table-features>
</mds-price-table>
```

#### Feature Row with Text Values

When a feature has a measurable limit rather than a simple yes/no, use `type="text"` cells to display the value as a formatted string. The cell wraps the text in `<mds-text typography="detail">` automatically.

```html
<mds-price-table>
  <mds-price-table-features label="Limiti di utilizzo">
    <mds-price-table-features-row>
      <mds-price-table-features-cell type="label">Utenti massimi</mds-price-table-features-cell>
      <mds-price-table-features-cell type="text">10</mds-price-table-features-cell>
      <mds-price-table-features-cell type="text">50</mds-price-table-features-cell>
      <mds-price-table-features-cell type="text">Illimitati</mds-price-table-features-cell>
    </mds-price-table-features-row>
    <mds-price-table-features-row>
      <mds-price-table-features-cell type="label">Spazio di archiviazione</mds-price-table-features-cell>
      <mds-price-table-features-cell type="text">5 GB</mds-price-table-features-cell>
      <mds-price-table-features-cell type="text">50 GB</mds-price-table-features-cell>
      <mds-price-table-features-cell type="text">1 TB</mds-price-table-features-cell>
    </mds-price-table-features-row>
  </mds-price-table-features>
</mds-price-table>
```

#### Mixed Row with Text and Boolean Cells

A single row can mix `type="text"`, `type="supported"`, and `type="unsupported"` cells when some plans have a value and others have a boolean flag. All cells still receive equal widths.

```html
<mds-price-table>
  <mds-price-table-features label="Reportistica">
    <mds-price-table-features-row>
      <mds-price-table-features-cell type="label">Report avanzati</mds-price-table-features-cell>
      <mds-price-table-features-cell type="unsupported"></mds-price-table-features-cell>
      <mds-price-table-features-cell type="text">Solo esportazione</mds-price-table-features-cell>
      <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
    </mds-price-table-features-row>
  </mds-price-table-features>
</mds-price-table>
```

#### Custom Cell Content with `type="custom"`

Use `type="custom"` when none of the standard cell types is adequate - for example to embed a component or styled content. The cell renders its default slot as-is without any wrapping element.

```html
<mds-price-table>
  <mds-price-table-features label="Assistenza">
    <mds-price-table-features-row>
      <mds-price-table-features-cell type="label">Canale di supporto</mds-price-table-features-cell>
      <mds-price-table-features-cell type="custom">
        <mds-badge variant="info" tone="weak">Email</mds-badge>
      </mds-price-table-features-cell>
      <mds-price-table-features-cell type="custom">
        <mds-badge variant="success" tone="weak">Chat</mds-badge>
      </mds-price-table-features-cell>
      <mds-price-table-features-cell type="custom">
        <mds-badge variant="primary" tone="strong">Dedicato</mds-badge>
      </mds-price-table-features-cell>
    </mds-price-table-features-row>
  </mds-price-table-features>
</mds-price-table>
```

#### Text Cell with Inline Help Tooltip

A `type="text"` cell accepts arbitrary HTML in its slot, so you can pair the value with an [`<mds-help>`](../../mds-help) component when additional context is needed.

```html
<mds-price-table>
  <mds-price-table-features label="Archiviazione">
    <mds-price-table-features-row>
      <mds-price-table-features-cell type="label">Capacita' massima</mds-price-table-features-cell>
      <mds-price-table-features-cell type="text">5 GB</mds-price-table-features-cell>
      <mds-price-table-features-cell type="text">100 GB</mds-price-table-features-cell>
      <mds-price-table-features-cell type="text">
        1 TB
        <mds-help auto-placement="false" placement="top">
          La capacita' puo' variare in base allo stato del server.
        </mds-help>
      </mds-price-table-features-cell>
    </mds-price-table-features-row>
  </mds-price-table-features>
</mds-price-table>
```

#### Styling Customization

Override the row's background and text colors for resting and hover states through the documented `--mds-price-table-features-row-*` CSS custom properties. Always use Magma color tokens via `rgb(var(--<token>))` so dark mode and high-contrast modes keep working.

```css
.pricing-section mds-price-table-features-row {
  --mds-price-table-features-row-background: rgb(var(--tone-neutral-09));
  --mds-price-table-features-row-background-hover: rgb(var(--tone-neutral-08));
  --mds-price-table-features-row-color: rgb(var(--tone-neutral-02));
  --mds-price-table-features-row-color-hover: rgb(var(--tone-neutral-01));
}
```


### 3. Antipattern

Common incorrect uses of `<mds-price-table-features-row>`. Each entry pairs the wrong form with the right one and a one-line reason. System-wide rules (boolean-as-string, shadow piercing, Tailwind color utilities, raw native event listening) live in [`docs/COMPONENTS.md`](../../../../../../docs/COMPONENTS.md#system-level-anti-patterns) - they apply here too but are not repeated.

#### Do Not Use the Row Outside Its Parent

`<mds-price-table-features-row>` is a compound child that must be a direct slot child of [`<mds-price-table-features>`](../../mds-price-table-features). Using it standalone or inside any other element breaks the layout and the equal-width column calculation.

```html
<!-- 🚫 INCORRECT -->
<div class="my-table">
  <mds-price-table-features-row>
    <mds-price-table-features-cell type="label">Funzione</mds-price-table-features-cell>
    <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
  </mds-price-table-features-row>
</div>

<!-- ✅ CORRECT -->
<mds-price-table>
  <mds-price-table-features label="Funzionalita'">
    <mds-price-table-features-row>
      <mds-price-table-features-cell type="label">Funzione</mds-price-table-features-cell>
      <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
    </mds-price-table-features-row>
  </mds-price-table-features>
</mds-price-table>
```

#### Do Not Slot Arbitrary HTML Directly into the Row

The row's default slot expects only [`<mds-price-table-features-cell>`](../../mds-price-table-features-cell) children. Raw HTML elements bypass the automatic equal-width distribution and break column alignment across rows.

```html
<!-- 🚫 INCORRECT -->
<mds-price-table-features-row>
  <span>Funzione avanzata</span>
  <span>Si'</span>
  <span>No</span>
</mds-price-table-features-row>

<!-- ✅ CORRECT -->
<mds-price-table-features-row>
  <mds-price-table-features-cell type="label">Funzione avanzata</mds-price-table-features-cell>
  <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
  <mds-price-table-features-cell type="unsupported"></mds-price-table-features-cell>
</mds-price-table-features-row>
```

#### Do Not Omit the Label Cell

Every row should begin with a `type="label"` cell that names the feature. Omitting it leaves the row without a readable identifier, which makes the comparison table unusable for sighted users and screen readers alike.

```html
<!-- 🚫 INCORRECT -->
<mds-price-table-features-row>
  <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
  <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
  <mds-price-table-features-cell type="unsupported"></mds-price-table-features-cell>
</mds-price-table-features-row>

<!-- ✅ CORRECT -->
<mds-price-table-features-row>
  <mds-price-table-features-cell type="label">Backup automatico</mds-price-table-features-cell>
  <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
  <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
  <mds-price-table-features-cell type="unsupported"></mds-price-table-features-cell>
</mds-price-table-features-row>
```

#### Do Not Customize via Inline Styles or Undocumented Parts

The only supported customization surface is the four `--mds-price-table-features-row-*` CSS custom properties. Applying inline `style` attributes or targeting shadow internals couples your code to the implementation and breaks on minor releases.

```css
/* 🚫 INCORRECT */
mds-price-table-features-row {
  background-color: #f5f5f5;
}

mds-price-table-features-row >>> .internal-row-class {
  color: red;
}
```

```css
/* ✅ CORRECT */
mds-price-table-features-row {
  --mds-price-table-features-row-background: rgb(var(--tone-neutral-09));
  --mds-price-table-features-row-color: rgb(var(--tone-neutral-02));
}
```

#### Do Not Mismatch Cell Count Across Rows

All rows inside a [`<mds-price-table-features>`](../../mds-price-table-features) must have the same number of cells. The equal-width calculation runs per row in isolation, so mismatched counts produce misaligned columns.

```html
<!-- 🚫 INCORRECT - row A has 4 cells, row B has 3 -->
<mds-price-table-features>
  <mds-price-table-features-row>
    <mds-price-table-features-cell type="label">Funzione A</mds-price-table-features-cell>
    <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
    <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
    <mds-price-table-features-cell type="unsupported"></mds-price-table-features-cell>
  </mds-price-table-features-row>
  <mds-price-table-features-row>
    <mds-price-table-features-cell type="label">Funzione B</mds-price-table-features-cell>
    <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
    <mds-price-table-features-cell type="unsupported"></mds-price-table-features-cell>
  </mds-price-table-features-row>
</mds-price-table-features>

<!-- ✅ CORRECT - every row has the same number of cells -->
<mds-price-table-features>
  <mds-price-table-features-row>
    <mds-price-table-features-cell type="label">Funzione A</mds-price-table-features-cell>
    <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
    <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
    <mds-price-table-features-cell type="unsupported"></mds-price-table-features-cell>
  </mds-price-table-features-row>
  <mds-price-table-features-row>
    <mds-price-table-features-cell type="label">Funzione B</mds-price-table-features-cell>
    <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
    <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
    <mds-price-table-features-cell type="unsupported"></mds-price-table-features-cell>
  </mds-price-table-features-row>
</mds-price-table-features>
```



## Slots

| Slot        | Description                                               |
| ----------- | --------------------------------------------------------- |
| `"default"` | Expects to slot `mds-price-table-features-cell` component |


## CSS Custom Properties

| Name                                              | Description                                  |
| ------------------------------------------------- | -------------------------------------------- |
| `--mds-price-table-features-row-background`       | Default background color of a features row.  |
| `--mds-price-table-features-row-background-hover` | Background color of a features row on hover. |
| `--mds-price-table-features-row-color`            | Default text color of a features row.        |
| `--mds-price-table-features-row-color-hover`      | Text color of a features row on hover.       |


----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
