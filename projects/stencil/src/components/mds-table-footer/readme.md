# mds-table-footer



This is a web-component from Maggioli Design System [Magma](https://magma.maggiolicloud.it), built with StencilJS, TypeScript, Storybook. It's based on the web-component standard and it's designed to be agnostic from the JavaScript framework you are using.

<!-- Auto Generated Below -->


## Usage

### 1. Description

The `<mds-table-footer>` web component is a structural child of [`<mds-table>`](../../mds-table) that groups the footer rows of a table - typically used for totals, summaries, or pagination rows. It is the design-system equivalent of the native `<tfoot>` element, exposing a single slot that accepts `mds-table-row` children.

#### Semantic Behavior

- **Compound child only**: Must be placed as a direct slot child of `<mds-table>`, alongside `mds-table-header` and `mds-table-body`; it is not used standalone or nested inside another child type.
- **Structural passthrough**: It renders nothing but a single default slot - a purely structural wrapper with no rendered chrome of its own.
- **No selection/interactive wiring**: Unlike `mds-table-body`, the footer does not participate in the parent's `selectable`/`interactive` orchestration - footer rows are layout/summary content rather than selectable data rows.

#### Properties & Visual Configurations

`<mds-table-footer>` exposes no configurable props; it is a pure layout grouping element. Its only API is its **default slot**, into which you place one or more `mds-table-row` elements that form the footer section of the table. Visual styling (background, borders, cell padding) is inherited from the CSS custom properties defined on the parent `<mds-table>`.


### 2. Pattern

Correct and idiomatic ways to use the `<mds-table-footer>` component, ordered from most common to most specialized. Patterns assume a working knowledge of the table family documented in [`docs/COMPONENTS.md`](../../../../../../docs/COMPONENTS.md) and the generic stencil rules in [`projects/stencil/SPEC.md`](../../../../SPEC.md).

#### Summary Row with Column Labels

The most common pattern: a footer row that repeats the column headings as a visual anchor at the bottom of a long table. Place `mds-table-footer` as a direct child of [`mds-table`](../../mds-table), after `mds-table-body`, containing one `mds-table-cell` per column.

```html
<mds-table>
  <mds-table-header>
    <mds-table-header-cell label="Cognome e nome"></mds-table-header-cell>
    <mds-table-header-cell label="Email"></mds-table-header-cell>
    <mds-table-header-cell label="Data"></mds-table-header-cell>
  </mds-table-header>
  <mds-table-body>
    <mds-table-row>
      <mds-table-cell><mds-text typography="detail">Rossi Mario</mds-text></mds-table-cell>
      <mds-table-cell><mds-text typography="detail">m.rossi@example.it</mds-text></mds-table-cell>
      <mds-table-cell><mds-text typography="detail">12 ott 1985</mds-text></mds-table-cell>
    </mds-table-row>
    <mds-table-row>
      <mds-table-cell><mds-text typography="detail">Verdi Luigi</mds-text></mds-table-cell>
      <mds-table-cell><mds-text typography="detail">l.verdi@example.it</mds-text></mds-table-cell>
      <mds-table-cell><mds-text typography="detail">3 mar 1993</mds-text></mds-table-cell>
    </mds-table-row>
  </mds-table-body>
  <mds-table-footer>
    <mds-table-cell><mds-text typography="action">Cognome e nome</mds-text></mds-table-cell>
    <mds-table-cell><mds-text typography="action">Email</mds-text></mds-table-cell>
    <mds-table-cell><mds-text typography="action">Data</mds-text></mds-table-cell>
  </mds-table-footer>
</mds-table>
```

#### Totals Row

Use the footer to display computed totals or aggregated values that summarize the body rows. Cell content can be any component accepted by `mds-table-cell`.

```html
<mds-table>
  <mds-table-header>
    <mds-table-header-cell label="Voce di spesa"></mds-table-header-cell>
    <mds-table-header-cell label="Importo"></mds-table-header-cell>
    <mds-table-header-cell label="Stato"></mds-table-header-cell>
  </mds-table-header>
  <mds-table-body>
    <mds-table-row>
      <mds-table-cell><mds-text typography="detail">Licenze software</mds-text></mds-table-cell>
      <mds-table-cell><mds-text typography="detail">1.200,00 EUR</mds-text></mds-table-cell>
      <mds-table-cell><mds-badge variant="success" tone="weak">Approvato</mds-badge></mds-table-cell>
    </mds-table-row>
    <mds-table-row>
      <mds-table-cell><mds-text typography="detail">Consulenza</mds-text></mds-table-cell>
      <mds-table-cell><mds-text typography="detail">3.500,00 EUR</mds-text></mds-table-cell>
      <mds-table-cell><mds-badge variant="warning" tone="weak">In attesa</mds-badge></mds-table-cell>
    </mds-table-row>
  </mds-table-body>
  <mds-table-footer>
    <mds-table-cell><mds-text typography="action">Totale</mds-text></mds-table-cell>
    <mds-table-cell><mds-text typography="action">4.700,00 EUR</mds-text></mds-table-cell>
    <mds-table-cell></mds-table-cell>
  </mds-table-footer>
</mds-table>
```

#### Multiple Footer Rows via `mds-table-row`

When you need more than one footer row - for example a subtotal row followed by a grand total row - wrap each row in `mds-table-row` and place both inside `mds-table-footer`.

```html
<mds-table>
  <mds-table-header>
    <mds-table-header-cell label="Descrizione"></mds-table-header-cell>
    <mds-table-header-cell label="Imponibile"></mds-table-header-cell>
    <mds-table-header-cell label="IVA 22%"></mds-table-header-cell>
  </mds-table-header>
  <mds-table-body>
    <mds-table-row>
      <mds-table-cell><mds-text typography="detail">Servizio A</mds-text></mds-table-cell>
      <mds-table-cell><mds-text typography="detail">800,00 EUR</mds-text></mds-table-cell>
      <mds-table-cell><mds-text typography="detail">176,00 EUR</mds-text></mds-table-cell>
    </mds-table-row>
  </mds-table-body>
  <mds-table-footer>
    <mds-table-row>
      <mds-table-cell><mds-text typography="detail">Subtotale</mds-text></mds-table-cell>
      <mds-table-cell><mds-text typography="detail">800,00 EUR</mds-text></mds-table-cell>
      <mds-table-cell><mds-text typography="detail">176,00 EUR</mds-text></mds-table-cell>
    </mds-table-row>
    <mds-table-row>
      <mds-table-cell><mds-text typography="action">Totale</mds-text></mds-table-cell>
      <mds-table-cell><mds-text typography="action">976,00 EUR</mds-text></mds-table-cell>
      <mds-table-cell></mds-table-cell>
    </mds-table-row>
  </mds-table-footer>
</mds-table>
```

#### Cell-Level Styling via Parent `--mds-table-*` Custom Properties

`mds-table-footer` inherits visual styling from the CSS custom properties defined on the parent `mds-table`. Set those properties on `mds-table` (or a wrapping selector) to restyle borders, backgrounds, and cell padding uniformly across the whole table - including the footer.

```css
.bilancio-table mds-table {
  --mds-table-background: rgb(var(--tone-neutral-01));
  --mds-table-border-color: rgb(var(--tone-neutral-04));
  --mds-table-border-width: 2px;
  --mds-table-cell-padding: var(--spacing-300) var(--spacing-400);
}
```


### 3. Antipattern

Common incorrect uses of `<mds-table-footer>`. Each entry pairs the wrong form with the right one and a one-line reason. System-wide rules (boolean-as-string, shadow piercing, Tailwind color utilities, raw native event listening) live in [`docs/COMPONENTS.md`](../../../../../../docs/COMPONENTS.md#system-level-anti-patterns) - they apply here too but are not repeated.

#### Do Not Use `mds-table-footer` Outside `mds-table`

`mds-table-footer` is a compound child and must be a direct slot child of [`mds-table`](../../mds-table). Using it outside its parent breaks the internal layout communication and produces unstyled, structurally invalid output.

```html
<!-- 🚫 INCORRECT -->
<div class="table-wrapper">
  <mds-table-footer>
    <mds-table-cell>Totale</mds-table-cell>
  </mds-table-footer>
</div>

<!-- ✅ CORRECT -->
<mds-table>
  <mds-table-body><!-- ... --></mds-table-body>
  <mds-table-footer>
    <mds-table-cell><mds-text typography="action">Totale</mds-text></mds-table-cell>
  </mds-table-footer>
</mds-table>
```

#### Do Not Put Raw Text or `<td>` Elements in the Footer Slot

The default slot of `mds-table-footer` accepts `mds-table-cell` elements (or `mds-table-row` elements containing cells). Raw text, `<td>`, or arbitrary HTML bypasses the shared border and padding tokens and yields a visually broken footer.

```html
<!-- 🚫 INCORRECT -->
<mds-table-footer>
  <td>Cognome e nome</td>
  <td>Email</td>
</mds-table-footer>

<!-- ✅ CORRECT -->
<mds-table-footer>
  <mds-table-cell><mds-text typography="action">Cognome e nome</mds-text></mds-table-cell>
  <mds-table-cell><mds-text typography="action">Email</mds-text></mds-table-cell>
</mds-table-footer>
```

#### Do Not Replace `mds-table-footer` with a `<tfoot>` Element

Using the native `<tfoot>` inside `mds-table` bypasses the shared CSS token cascade, border transition, and reduced-motion handling that `mds-table-footer` wires up. Always use the Magma component.

```html
<!-- 🚫 INCORRECT -->
<mds-table>
  <mds-table-body><!-- ... --></mds-table-body>
  <tfoot>
    <tr><td>Totale</td><td>4.700,00 EUR</td></tr>
  </tfoot>
</mds-table>

<!-- ✅ CORRECT -->
<mds-table>
  <mds-table-body><!-- ... --></mds-table-body>
  <mds-table-footer>
    <mds-table-cell><mds-text typography="action">Totale</mds-text></mds-table-cell>
    <mds-table-cell><mds-text typography="action">4.700,00 EUR</mds-text></mds-table-cell>
  </mds-table-footer>
</mds-table>
```

#### Do Not Style the Footer by Piercing Shadow DOM

`mds-table-footer` has no documented `--mds-table-footer-*` custom properties. Styling changes (background, border color, cell spacing) must go through the `--mds-table-*` custom properties on the parent `mds-table`. Targeting internals via `>>>` or undocumented selectors will break on future releases.

```css
/* 🚫 INCORRECT */
mds-table-footer >>> :host {
  background: rgb(var(--tone-neutral-02));
}

/* ✅ CORRECT */
mds-table {
  --mds-table-background: rgb(var(--tone-neutral-02));
  --mds-table-border-color: rgb(var(--tone-neutral-05));
}
```

#### Do Not Use `mds-table-footer` as the Only Section of a Table

`mds-table-footer` provides summary or totals context and is meaningful only when accompanied by `mds-table-body` (and usually `mds-table-header`). A footer-only table has no data for the summary to refer to.

```html
<!-- 🚫 INCORRECT -->
<mds-table>
  <mds-table-footer>
    <mds-table-cell>Nessun dato disponibile</mds-table-cell>
  </mds-table-footer>
</mds-table>

<!-- ✅ CORRECT: use mds-zero for empty states, or include mds-table-body -->
<mds-table>
  <mds-table-header>
    <mds-table-header-cell label="Voce"></mds-table-header-cell>
  </mds-table-header>
  <mds-table-body>
    <mds-table-row>
      <mds-table-cell><mds-text typography="detail">Nessun record</mds-text></mds-table-cell>
    </mds-table-row>
  </mds-table-body>
</mds-table>
```



## Slots

| Slot | Description                    |
| ---- | ------------------------------ |
|      | Add `mds-table-row` element/s. |


----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
