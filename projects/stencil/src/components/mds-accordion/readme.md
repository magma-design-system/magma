# mds-accordion


This is a web-component from Maggioli Design System [Magma](https://magma.maggiolicloud.it), built with StencilJS, TypeScript, Storybook. It's based on the web-component standard and it's designed to be agnostic from the JavaScript framework you are using.

<!-- Auto Generated Below -->


## Usage

### 1. Description

The `<mds-accordion>` web component is the compound container of the Magma Design System that groups and orchestrates a set of collapsible `<mds-accordion-item>` panels. It acts as the coordination layer that decides which children are selected.

#### Semantic Behavior

- **Compound parent/child**: The default slot accepts only `<mds-accordion-item>` elements.
- **Single vs. multiple selection**: By default opening one item collapses the others. With `multiple` set, any number of children may stay open at once and selection state is reported as a comma-separated list of indices.
- **Mandatory selection**: When `closable` is `false`, the user cannot collapse the currently open item by clicking it again - one panel always remains open.
- **Emitted event**: `mdsAccordionChange` whenever the selected child set changes, carrying the live `children` NodeList and the `selected` index/indices as a string.

#### Properties & Visual Configurations

This component has no shared `variant` / `tone` / `size` props; its two booleans control selection semantics rather than appearance.

#### Other behavioral props

- **`multiple`** switches the group from accordion behavior (one panel at a time) to independent toggles, allowing several panels open simultaneously.
- **`closable`** governs whether the active panel can be dismissed; set it to `false` to force at least one panel to stay expanded at all times.

Per-panel presentation - the visible `label`, heading `typography`, and the slotted body content - is configured on each `<mds-accordion-item>` child, not on the accordion itself.


### 2. Pattern

Correct and idiomatic ways to use the `<mds-accordion>` component, ordered from most common to most specialized. Patterns assume a working knowledge of compound component rules documented in [`docs/COMPONENTS.md`](../../../../../../docs/COMPONENTS.md) and the generic stencil rules in [`projects/stencil/SPEC.md`](../../../../SPEC.md).

#### Basic Accordion

The canonical form. Place one or more [`mds-accordion-item`](../../mds-accordion-item) elements as direct children. Each item requires a `label` for its always-visible header.

```html
<mds-accordion>
  <mds-accordion-item label="Informazioni generali">
    <mds-text>Contenuto della prima sezione.</mds-text>
  </mds-accordion-item>
  <mds-accordion-item label="Requisiti tecnici">
    <mds-text>Contenuto della seconda sezione.</mds-text>
  </mds-accordion-item>
  <mds-accordion-item label="Contatti">
    <mds-text>Contenuto della terza sezione.</mds-text>
  </mds-accordion-item>
</mds-accordion>
```

#### Pre-selected Item on Load

Set the `selected` attribute on a child to have that panel start open. Only one item should be pre-selected in single-selection mode (the default).

```html
<mds-accordion>
  <mds-accordion-item label="Panoramica" selected>
    <mds-text>Questa sezione e' aperta per impostazione predefinita.</mds-text>
  </mds-accordion-item>
  <mds-accordion-item label="Dettagli">
    <mds-text>Questa sezione e' chiusa inizialmente.</mds-text>
  </mds-accordion-item>
</mds-accordion>
```

#### Multiple Selection Mode

Set `multiple` to allow any number of panels to be open at the same time. The `mdsAccordionChange` event then reports a comma-separated list of open indices.

```html
<mds-accordion multiple>
  <mds-accordion-item label="Documentazione" selected>
    <mds-text>Scarica la guida utente in formato PDF.</mds-text>
  </mds-accordion-item>
  <mds-accordion-item label="Video tutorial" selected>
    <mds-text>Guarda i video di formazione nel portale.</mds-text>
  </mds-accordion-item>
  <mds-accordion-item label="FAQ">
    <mds-text>Consulta le domande frequenti.</mds-text>
  </mds-accordion-item>
</mds-accordion>
```

#### Mandatory Selection (Non-closable)

Set `closable="false"` to prevent the open panel from being collapsed. The currently expanded item stays open even when the user clicks its header again - exactly one panel is always visible.

```html
<mds-accordion closable="false">
  <mds-accordion-item label="Passaggio 1 - Dati anagrafici" selected>
    <mds-text>Inserisci nome, cognome e codice fiscale.</mds-text>
  </mds-accordion-item>
  <mds-accordion-item label="Passaggio 2 - Residenza">
    <mds-text>Inserisci indirizzo e comune di residenza.</mds-text>
  </mds-accordion-item>
  <mds-accordion-item label="Passaggio 3 - Riepilogo">
    <mds-text>Verifica i dati inseriti prima di inviare.</mds-text>
  </mds-accordion-item>
</mds-accordion>
```

#### Heading Typography on Items

Set `typography` on each `mds-accordion-item` to align the header level with the document outline. Defaults to `h5`; use a heavier heading for more prominent section headers.

```html
<mds-accordion>
  <mds-accordion-item label="Sezione principale" typography="h3">
    <mds-text>Contenuto della sezione principale.</mds-text>
  </mds-accordion-item>
  <mds-accordion-item label="Sottosezione" typography="h4">
    <mds-text>Contenuto della sottosezione.</mds-text>
  </mds-accordion-item>
</mds-accordion>
```

#### Listening to the Change Event

Listen for `mdsAccordionChange` to react when the active panel changes. The event detail carries `children` (the full NodeList) and `selected` (a string index or comma-separated indices when `multiple` is set).

```html
<mds-accordion id="faq-accordion">
  <mds-accordion-item label="Cos'e' Magma?">
    <mds-text>Magma e' il design system di Maggioli.</mds-text>
  </mds-accordion-item>
  <mds-accordion-item label="Come si installa?">
    <mds-text>Segui le istruzioni nel file README del pacchetto.</mds-text>
  </mds-accordion-item>
</mds-accordion>

<script>
  document.getElementById('faq-accordion').addEventListener('mdsAccordionChange', (event) => {
    console.log('Pannello aperto:', event.detail.selected);
  });
</script>
```

#### Rich Slotted Content in Items

The default slot of each `mds-accordion-item` accepts text, HTML elements, and other Magma components - use this to build complex content panels.

```html
<mds-accordion>
  <mds-accordion-item label="Dettagli del documento">
    <mds-text typography="label">Nome file</mds-text>
    <mds-text>Relazione_annuale_2024.pdf</mds-text>
    <mds-hr></mds-hr>
    <mds-text typography="label">Dimensione</mds-text>
    <mds-text>2,4 MB</mds-text>
  </mds-accordion-item>
  <mds-accordion-item label="Azioni disponibili">
    <mds-button label="Scarica" icon="mi/baseline/download" variant="primary"></mds-button>
    <mds-button label="Condividi" icon="mi/baseline/share" variant="secondary" tone="outline"></mds-button>
  </mds-accordion-item>
</mds-accordion>
```

#### Styling Customization

Style the accordion only through its documented `--mds-accordion-*` CSS custom properties. The properties cascade into all child `mds-accordion-item` elements from the host.

```css
.custom-faq mds-accordion {
  --mds-accordion-border-color: rgb(var(--variant-primary-05));
  --mds-accordion-border-width: 1px;
  --mds-accordion-color: rgb(var(--tone-neutral-02));
  --mds-accordion-description-color: rgb(var(--tone-neutral-04));
  --mds-accordion-duration: 200ms;
  --mds-accordion-padding-selected: var(--spacing-600) 0 var(--spacing-800) 0;
  --mds-accordion-padding-unselected: var(--spacing-400) 0;
}
```


### 3. Antipattern

Common incorrect uses of `<mds-accordion>`. Each entry pairs the wrong form with the right one and a one-line reason. System-wide rules (boolean-as-string, shadow piercing, Tailwind color utilities, raw native event listening) live in [`docs/COMPONENTS.md`](../../../../../../docs/COMPONENTS.md#system-level-anti-patterns) - they apply here too but are not repeated.

#### Do Not Place Non-Item Children Directly in the Accordion Slot

The default slot of `<mds-accordion>` is designed exclusively for `<mds-accordion-item>` elements. Placing raw HTML or other components there bypasses the parent's selection coordination and breaks the compound component communication.

```html
<!-- 🚫 INCORRECT -->
<mds-accordion>
  <div>
    <h3>Sezione uno</h3>
    <p>Contenuto della sezione.</p>
  </div>
</mds-accordion>

<!-- ✅ CORRECT -->
<mds-accordion>
  <mds-accordion-item label="Sezione uno">
    <mds-text>Contenuto della sezione.</mds-text>
  </mds-accordion-item>
</mds-accordion>
```

#### Do Not Use `mds-accordion-item` Outside `mds-accordion`

`<mds-accordion-item>` is a compound child and relies on the parent to assign its `id` and manage selection state. Used standalone it has no coordinator and its `mdsAccordionItemSelect` / `mdsAccordionItemUnselect` events go unanswered.

```html
<!-- 🚫 INCORRECT -->
<mds-accordion-item label="Domanda frequente">
  <mds-text>Risposta alla domanda.</mds-text>
</mds-accordion-item>

<!-- ✅ CORRECT -->
<mds-accordion>
  <mds-accordion-item label="Domanda frequente">
    <mds-text>Risposta alla domanda.</mds-text>
  </mds-accordion-item>
</mds-accordion>
```

#### Do Not Set `closable` to the String `"false"`

`closable` is a boolean prop. In HTML, any non-empty attribute value - including the string `"false"` - is truthy, so `closable="false"` does NOT disable the closable behavior; it is identical to `closable="true"`. Remove the attribute entirely to let the default (`true`) apply, or omit it on purpose when you want `closable` enforced.

```html
<!-- 🚫 INCORRECT - still closable, this is a no-op -->
<mds-accordion closable="false">
  <mds-accordion-item label="Passaggio obbligatorio" selected>
    <mds-text>Questo pannello dovrebbe restare sempre aperto.</mds-text>
  </mds-accordion-item>
</mds-accordion>

<!-- ✅ CORRECT - use the attribute without a value (boolean form) -->
<!-- Note: to DISABLE closable, set the prop to false in JS, or use a framework binding -->
<!-- In plain HTML there is no boolean "false" form; control it via JS: -->
<mds-accordion id="mandatory-accordion">
  <mds-accordion-item label="Passaggio obbligatorio" selected>
    <mds-text>Questo pannello resta sempre aperto.</mds-text>
  </mds-accordion-item>
</mds-accordion>
<script>
  document.getElementById('mandatory-accordion').closable = false;
</script>
```

#### Do Not Listen to Native `click` or `toggle` Instead of `mdsAccordionChange`

The selection logic lives inside shadow DOM. Native `click` events from inside the shadow root may not propagate as expected, and there is no native `toggle` event on this component. Always listen for `mdsAccordionChange` to react to open/close changes.

```html
<!-- 🚫 INCORRECT -->
<mds-accordion id="my-accordion">
  <mds-accordion-item label="Sezione A">
    <mds-text>Contenuto A.</mds-text>
  </mds-accordion-item>
</mds-accordion>
<script>
  document.getElementById('my-accordion').addEventListener('click', (e) => {
    // unreliable - shadow DOM events may not surface correctly
    console.log('clicked');
  });
</script>

<!-- ✅ CORRECT -->
<mds-accordion id="my-accordion">
  <mds-accordion-item label="Sezione A">
    <mds-text>Contenuto A.</mds-text>
  </mds-accordion-item>
</mds-accordion>
<script>
  document.getElementById('my-accordion').addEventListener('mdsAccordionChange', (e) => {
    console.log('Selezione corrente:', e.detail.selected);
  });
</script>
```

#### Do Not Mix `mds-accordion-item` and `mds-accordion-timer-item`

[`mds-accordion-timer`](../../mds-accordion-timer) and its child [`mds-accordion-timer-item`](../../mds-accordion-timer-item) are a separate compound pair. Slotting timer items into a plain accordion (or vice versa) breaks internal event wiring because each parent only listens for its own child's events.

```html
<!-- 🚫 INCORRECT -->
<mds-accordion>
  <mds-accordion-timer-item label="Avanzamento automatico">
    <mds-text>Contenuto con timer.</mds-text>
  </mds-accordion-timer-item>
</mds-accordion>

<!-- ✅ CORRECT - use mds-accordion-timer with mds-accordion-timer-item -->
<mds-accordion-timer>
  <mds-accordion-timer-item label="Avanzamento automatico">
    <mds-text>Contenuto con timer.</mds-text>
  </mds-accordion-timer-item>
</mds-accordion-timer>
```

#### Do Not Pierce Shadow DOM to Style Internals

The only supported customization surface is the `--mds-accordion-*` CSS custom properties and the documented `::part()` names on `mds-accordion-item` (`content`, `icon`, `label`). Targeting undocumented internals via `>>>` or deep class selectors couples code to the Shadow DOM implementation and breaks on minor releases.

```css
/* 🚫 INCORRECT */
mds-accordion >>> .action {
  font-weight: bold;
}
mds-accordion-item::part(spinner) {
  display: none;
}

/* ✅ CORRECT */
mds-accordion {
  --mds-accordion-color: rgb(var(--tone-neutral-02));
  --mds-accordion-border-color: rgb(var(--variant-primary-05));
}
mds-accordion-item::part(label) {
  font-style: italic;
}
```



## Properties

| Property   | Attribute  | Description                                                | Type                   | Default |
| ---------- | ---------- | ---------------------------------------------------------- | ---------------------- | ------- |
| `closable` | `closable` | Specifies if an item can be closed by user                 | `boolean \| undefined` | `true`  |
| `multiple` | `multiple` | Choose if multiple siblings can be selected simultaneously | `boolean \| undefined` | `false` |


## Events

| Event                | Description                                            | Type                                   |
| -------------------- | ------------------------------------------------------ | -------------------------------------- |
| `mdsAccordionChange` | Emits when the component attribute selected is changed | `CustomEvent<MdsAccordionEventDetail>` |


## Slots

| Slot | Description                         |
| ---- | ----------------------------------- |
|      | Add `mds-accordion-item` element/s. |


## CSS Custom Properties

| Name                                 | Description                                                                                           |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `--mds-accordion-border-color`       | Sets the border-color of the component children mds-accordion-item                                    |
| `--mds-accordion-color`              | Sets the text-color of the component children mds-accordion-item                                      |
| `--mds-accordion-description-color`  | Sets the color of the always visible title description                                                |
| `--mds-accordion-duration`           | Sets the transition duration of the close/open animation of the component children mds-accordion-item |
| `--mds-accordion-padding-selected`   | Sets the vertical padding of the component children mds-accordion-item when it's selected             |
| `--mds-accordion-padding-unselected` | Sets the vertical padding of the component children mds-accordion-item when it's unselected           |


----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
