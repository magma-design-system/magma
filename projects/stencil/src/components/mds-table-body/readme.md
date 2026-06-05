# mds-table-body



This is a web-component from Maggioli Design System [Magma](https://magma.maggiolicloud.it), built with StencilJS, TypeScript, Storybook. It's based on the web-component standard and it's designed to be agnostic from the JavaScript framework you are using.

<!-- Auto Generated Below -->


## Usage

### 1. Description

The `<mds-table-body>` web component is the row-group container of the Magma Design System tabular data system, used inside [`<mds-table>`](../../mds-table). It is the equivalent of the native HTML `<tbody>`, grouping the data `mds-table-row` elements and relaying the parent table's interaction and selection styling to those rows.

#### Semantic Behavior

- **Compound child**: Must be a direct slot child of `<mds-table>` and hold only `mds-table-row` elements; it is not used standalone nor interleaved with `mds-table-header` / `mds-table-footer` content.
- **Parent-driven state**: Both `interactive` and `selection` are set by the parent table, so consumers normally do not toggle them by hand.
- **Live rows**: Rows added or removed at runtime are detected and re-wired with the table's interactive/selectable state.
- **Hover relay**: When `interactive` is set, hovering the body highlights its rows.
- **Last-row border trimming**: The last `mds-table-body` in a table clears the bottom border of its final row, so stacked bodies join visually without a doubled separator.

#### Properties & Visual Configurations

This component exposes only two boolean flags, both intended to be managed by the parent `<mds-table>` rather than set directly:

- **`interactive`** enables the mouseover row-highlight styling for the group; it mirrors the table's own `interactive` prop.
- **`selection`** switches the body's default background to its alternate tone to signal that an active selection exists; the parent sets it true while at least one row is selected.


### 2. Pattern

Correct and idiomatic ways to use the `<mds-table-body>` component, ordered from most common to most specialized. Patterns assume a working knowledge of the compound table system documented in [`docs/COMPONENTS.md`](../../../../../../docs/COMPONENTS.md) and the generic stencil rules in [`projects/stencil/SPEC.md`](../../../../SPEC.md).

#### Basic Table Body with Data Rows

The canonical form. Place `<mds-table-body>` as a direct slot child of [`<mds-table>`](../../mds-table) and populate it with [`<mds-table-row>`](../../mds-table-row) elements. The parent table wires `interactive` and `selection` automatically - do not set them by hand in most cases.

```html
<mds-table>
  <mds-table-header>
    <mds-table-header-cell>Nome</mds-table-header-cell>
    <mds-table-header-cell>Ruolo</mds-table-header-cell>
    <mds-table-header-cell>Stato</mds-table-header-cell>
  </mds-table-header>
  <mds-table-body>
    <mds-table-row>
      <mds-table-cell>Marco Rossi</mds-table-cell>
      <mds-table-cell>Amministratore</mds-table-cell>
      <mds-table-cell>Attivo</mds-table-cell>
    </mds-table-row>
    <mds-table-row>
      <mds-table-cell>Laura Bianchi</mds-table-cell>
      <mds-table-cell>Operatore</mds-table-cell>
      <mds-table-cell>Inattivo</mds-table-cell>
    </mds-table-row>
  </mds-table-body>
</mds-table>
```

#### Interactive Table (Row Hover Highlight)

Set `interactive` on the parent `<mds-table>`. The table propagates the flag down to `<mds-table-body>` and every `<mds-table-row>`, applying the hover background without any extra wiring in the body markup.

```html
<mds-table interactive>
  <mds-table-header>
    <mds-table-header-cell>Documento</mds-table-header-cell>
    <mds-table-header-cell>Data</mds-table-header-cell>
  </mds-table-header>
  <mds-table-body>
    <mds-table-row>
      <mds-table-cell>Delibera n. 42</mds-table-cell>
      <mds-table-cell>12/05/2025</mds-table-cell>
    </mds-table-row>
    <mds-table-row>
      <mds-table-cell>Determina n. 07</mds-table-cell>
      <mds-table-cell>03/06/2025</mds-table-cell>
    </mds-table-row>
  </mds-table-body>
</mds-table>
```

#### Selectable Table (Row Checkboxes)

Set `selectable` on `<mds-table>`. The table equips every row with a checkbox and manages the `selection` state on `<mds-table-body>` - switching the body background to the alternate tone while at least one row is checked. Listen to `mdsTableSelectionChange` on the table for the current selection.

```html
<mds-table selectable id="tabella-utenti">
  <mds-table-header>
    <mds-table-header-cell>Utente</mds-table-header-cell>
    <mds-table-header-cell>Reparto</mds-table-header-cell>
  </mds-table-header>
  <mds-table-body>
    <mds-table-row value="u1">
      <mds-table-cell>Giulia Verdi</mds-table-cell>
      <mds-table-cell>Risorse Umane</mds-table-cell>
    </mds-table-row>
    <mds-table-row value="u2">
      <mds-table-cell>Andrea Neri</mds-table-cell>
      <mds-table-cell>Contabilita</mds-table-cell>
    </mds-table-row>
  </mds-table-body>
</mds-table>

<script>
  document.querySelector('#tabella-utenti').addEventListener('mdsTableSelectionChange', (e) => {
    console.log('Righe selezionate:', e.detail.rows);
  });
</script>
```

#### Selectable Table with Batch Actions

When `selectable` is set and at least one `<mds-button>` is assigned to the `batch-action` slot on `<mds-table>`, the table renders a batch-action bar whenever rows are selected. The `<mds-table-body>` does not require any extra attributes for this.

```html
<mds-table selectable>
  <mds-button slot="batch-action" label="Archivia selezionati" variant="primary" tone="strong"></mds-button>
  <mds-button slot="batch-action" label="Elimina selezionati" variant="error" tone="text"></mds-button>
  <mds-table-header>
    <mds-table-header-cell>Pratica</mds-table-header-cell>
    <mds-table-header-cell>Richiedente</mds-table-header-cell>
  </mds-table-header>
  <mds-table-body>
    <mds-table-row value="p1">
      <mds-table-cell>SUAP-2025-001</mds-table-cell>
      <mds-table-cell>Mario Conti</mds-table-cell>
    </mds-table-row>
    <mds-table-row value="p2">
      <mds-table-cell>SUAP-2025-002</mds-table-cell>
      <mds-table-cell>Silvia Ricci</mds-table-cell>
    </mds-table-row>
  </mds-table-body>
</mds-table>
```

#### Table with Header, Body, and Footer

Use [`<mds-table-header>`](../../mds-table-header), `<mds-table-body>`, and [`<mds-table-footer>`](../../mds-table-footer) together inside `<mds-table>`. The body's last-row border is automatically trimmed where it meets the footer, so no manual border removal is needed.

```html
<mds-table>
  <mds-table-header>
    <mds-table-header-cell>Voce</mds-table-header-cell>
    <mds-table-header-cell>Importo</mds-table-header-cell>
  </mds-table-header>
  <mds-table-body>
    <mds-table-row>
      <mds-table-cell>Compenso servizio</mds-table-cell>
      <mds-table-cell>1.200,00 EUR</mds-table-cell>
    </mds-table-row>
    <mds-table-row>
      <mds-table-cell>Rimborso spese</mds-table-cell>
      <mds-table-cell>85,50 EUR</mds-table-cell>
    </mds-table-row>
  </mds-table-body>
  <mds-table-footer>
    <mds-table-row>
      <mds-table-cell>Totale</mds-table-cell>
      <mds-table-cell>1.285,50 EUR</mds-table-cell>
    </mds-table-row>
  </mds-table-footer>
</mds-table>
```

#### Styling Customization via CSS Custom Properties

Override the five documented `--mds-table-body-*` CSS custom properties on the host or a parent selector. Use Magma color tokens wrapped in `rgb(var(...))` so dark mode and high-contrast modes stay consistent.

```css
.tabella-evidenziata mds-table-body {
  --mds-table-body-background: rgb(var(--tone-neutral-10));
  --mds-table-body-background-hover: rgb(var(--variant-primary-09));
  --mds-table-body-background-alt: rgb(var(--variant-primary-09));
  --mds-table-body-color: rgb(var(--tone-neutral-02));
  --mds-table-body-color-alt: rgb(var(--variant-primary-03));
}
```


### 3. Antipattern

Common incorrect uses of `<mds-table-body>`. Each entry pairs the wrong form with the right one and a one-line reason. System-wide rules (boolean-as-string, shadow piercing, Tailwind color utilities, raw native event listening) live in [`docs/COMPONENTS.md`](../../../../../../docs/COMPONENTS.md#system-level-anti-patterns) - they apply here too but are not repeated.

#### Do Not Use `<mds-table-body>` Outside `<mds-table>`

`<mds-table-body>` is a compound child and relies on the parent table for `display: table-row-group` context and for receiving the `interactive` / `selection` flags. Used standalone, layout and state wiring both break.

```html
<!-- 🚫 INCORRECT -->
<mds-table-body>
  <mds-table-row>
    <mds-table-cell>Mario Rossi</mds-table-cell>
  </mds-table-row>
</mds-table-body>

<!-- ✅ CORRECT -->
<mds-table>
  <mds-table-header>
    <mds-table-header-cell>Nome</mds-table-header-cell>
  </mds-table-header>
  <mds-table-body>
    <mds-table-row>
      <mds-table-cell>Mario Rossi</mds-table-cell>
    </mds-table-row>
  </mds-table-body>
</mds-table>
```

#### Do Not Put Raw `<tr>` / `<td>` Inside `<mds-table-body>`

The component's slot accepts only [`<mds-table-row>`](../../mds-table-row) elements. Raw `<tr>` elements are not styled by the design-system tokens, do not receive hover or selection state, and skip accessibility roles.

```html
<!-- 🚫 INCORRECT -->
<mds-table>
  <mds-table-body>
    <tr>
      <td>Laura Bianchi</td>
      <td>Operatore</td>
    </tr>
  </mds-table-body>
</mds-table>

<!-- ✅ CORRECT -->
<mds-table>
  <mds-table-body>
    <mds-table-row>
      <mds-table-cell>Laura Bianchi</mds-table-cell>
      <mds-table-cell>Operatore</mds-table-cell>
    </mds-table-row>
  </mds-table-body>
</mds-table>
```

#### Do Not Set `interactive` or `selection` Directly on the Body

Both flags are managed by the parent `<mds-table>`. Setting them by hand on `<mds-table-body>` will be overwritten the next time the table propagates its own state - and it creates a mismatch between the body state and the individual row states, which are also wired by the table.

```html
<!-- 🚫 INCORRECT -->
<mds-table>
  <mds-table-body interactive selection>
    <mds-table-row>
      <mds-table-cell>Giulia Verdi</mds-table-cell>
    </mds-table-row>
  </mds-table-body>
</mds-table>

<!-- ✅ CORRECT -->
<mds-table interactive selectable>
  <mds-table-body>
    <mds-table-row>
      <mds-table-cell>Giulia Verdi</mds-table-cell>
    </mds-table-row>
  </mds-table-body>
</mds-table>
```

#### Do Not Set Boolean Props as Strings

`interactive="false"` and `selection="false"` are non-empty strings and therefore truthy - the component treats them as the flag being set. Remove the attribute to turn it off; never assign the string `"false"`.

```html
<!-- 🚫 INCORRECT -->
<mds-table-body interactive="false" selection="false">
  ...
</mds-table-body>

<!-- ✅ CORRECT (attribute absent = prop is undefined / false) -->
<mds-table-body>
  ...
</mds-table-body>
```

#### Do Not Customize via Undocumented Internal Selectors

The supported customization surface is the five `--mds-table-body-*` CSS custom properties. Piercing the shadow DOM or targeting undocumented internal classes couples your code to the implementation and breaks on minor releases.

```css
/* 🚫 INCORRECT */
mds-table-body >>> tr {
  background: lightyellow;
}

/* ✅ CORRECT */
mds-table-body {
  --mds-table-body-background: rgb(var(--tone-neutral-09));
  --mds-table-body-background-hover: rgb(var(--variant-primary-09));
}
```



## Properties

| Property      | Attribute     | Description | Type                   | Default     |
| ------------- | ------------- | ----------- | ---------------------- | ----------- |
| `interactive` | `interactive` |             | `boolean \| undefined` | `undefined` |
| `selection`   | `selection`   |             | `boolean \| undefined` | `undefined` |


## Slots

| Slot        | Description                    |
| ----------- | ------------------------------ |
| `"default"` | Put `mds-table-row` element/s. |


----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
