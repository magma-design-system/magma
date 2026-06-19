# mds-details



This is a web-component from Maggioli Design System [Magma](https://magma.maggiolicloud.it), built with StencilJS, TypeScript, Storybook. It's based on the web-component standard and it's designed to be agnostic from the JavaScript framework you are using.

<!-- Auto Generated Below -->


## Usage

### 1. Description

The `<mds-details>` web component is the disclosure widget of the Magma Design System: a collapsible block with a clickable header that shows or hides its content on demand. It is the styled, accessible equivalent of the native HTML `<details>`/`<summary>` pair, structured into dedicated `title`, `icon`, `action` and content regions.

#### Semantic Behavior

- **Open/closed state**: The `opened` prop expands or collapses the content region with a transition.
- **Header activation**: Clicking the header or the leading icon toggles the open state, and the header is keyboard-activatable (Enter/Space).
- **Change event**: Each toggle emits `mdsDetailsChange` carrying the new boolean open state.
- **Icon slot presence**: The leading icon area auto-hides when no `icon` slot is provided.
- **Default slot vs. named slots**: The default (unnamed) slot is the collapsible body. The `title` slot is the always-visible header label, `icon` is the optional leading glyph, and `action` is a footer region inside the expandable content meant for action controls.

#### Properties & Visual Configurations

This component intentionally exposes a single behavioral prop. Visual surface is driven through slots and the exposed CSS custom properties rather than through variant/tone props.

- **`opened`** controls and reflects the expanded state. Set it to pre-expand the block on first render, or read/bind it to drive the disclosure programmatically; it stays in sync with user-driven toggles.

#### Other behavioral props

- The **`title`** slot is recommended to hold an `mds-text`; the **`icon`** slot an `mds-icon`; and the **`action`** slot an `mds-button` for the primary action tied to the disclosed content.


### 2. Pattern

Correct and idiomatic ways to use the `<mds-details>` component, ordered from most common to most specialized. Patterns assume a working knowledge of the variant / tone ladders documented in [`docs/COMPONENTS.md`](../../../../../../docs/COMPONENTS.md) and the generic stencil rules in [`projects/stencil/SPEC.md`](../../../../SPEC.md).

#### Basic Disclosure Block

The minimal form: a `title` slot for the always-visible header and a default slot for the collapsible body. Use `mds-text` in both slots so typography tokens are applied consistently.

```html
<mds-details>
  <mds-text typography="h6" slot="title">Descrizione del progetto</mds-text>
  <mds-text typography="detail">
    Questa sezione raccoglie le informazioni principali relative all'ambito e agli obiettivi del
    progetto.
  </mds-text>
</mds-details>
```

#### Pre-expanded State via `opened`

Pass the `opened` boolean attribute to expand the block on first render. The prop is mutable and reflected, so it stays in sync with subsequent user-driven toggles.

```html
<mds-details opened>
  <mds-text typography="h6" slot="title">Note operative</mds-text>
  <mds-text typography="body">
    Le note operative sono visibili fin dal caricamento della pagina per garantire una lettura
    immediata.
  </mds-text>
</mds-details>
```

#### Leading Icon via the `icon` Slot

Place an `mds-icon` in the `icon` slot to add a leading glyph that also acts as a toggle. The icon area auto-hides when the slot is empty, so leaving it out does not leave an empty gap.

```html
<mds-details>
  <mds-icon slot="icon" name="mi/baseline/info"></mds-icon>
  <mds-text typography="h6" slot="title">Requisiti di accesso</mds-text>
  <mds-text typography="detail">
    Per accedere al servizio e necessario disporre di credenziali SPID di livello 2 o superiore.
  </mds-text>
</mds-details>
```

#### Action Button via the `action` Slot

The `action` slot sits at the bottom of the expandable content region. Use `mds-button` (recommended) for the primary action tied to the disclosed content.

```html
<mds-details>
  <mds-icon slot="icon" name="mi/baseline/check-circle"></mds-icon>
  <mds-text typography="h6" slot="title">Modulistica richiesta</mds-text>
  <mds-text typography="detail">
    Scarica e compila il modulo A3 prima di procedere con la richiesta.
  </mds-text>
  <mds-button slot="action" size="sm" variant="primary" tone="outline">
    Scarica il modulo
  </mds-button>
</mds-details>
```

#### Listening to Toggle Events

Subscribe to `mdsDetailsChange` to react to open/close transitions. The event detail carries the new boolean state. Do not listen for native `click` on the host.

```html
<mds-details id="faq-1">
  <mds-text typography="h6" slot="title">Come posso rinnovare il contratto?</mds-text>
  <mds-text typography="detail">
    Il rinnovo puo essere effettuato online dall'area personale almeno 30 giorni prima della
    scadenza.
  </mds-text>
</mds-details>

<script>
  document.getElementById('faq-1').addEventListener('mdsDetailsChange', (event) => {
    console.log('Stato apertura:', event.detail); // true | false
  });
</script>
```

#### Programmatic Control

Because `opened` is a reflected, mutable prop you can drive the disclosure from code - for example to expand all items at once or to implement accordion logic manually.

```html
<mds-details id="step-1">
  <mds-text typography="h6" slot="title">Passo 1: Verifica dei dati</mds-text>
  <mds-text typography="detail">
    Controlla che tutti i dati anagrafici siano corretti prima di procedere.
  </mds-text>
</mds-details>

<mds-button id="expand-btn" label="Espandi tutti" variant="secondary" tone="text"></mds-button>

<script>
  document.getElementById('expand-btn').addEventListener('mdsButtonClick', () => {
    document.querySelectorAll('mds-details').forEach((el) => {
      el.opened = true;
    });
  });
</script>
```

#### CSS Customization

Style the component only through its documented `--mds-details-*` CSS custom properties. Set them on the host or a parent selector; use Magma color tokens via `rgb(var(--<token>))` so dark mode and high-contrast modes keep working.

```css
.custom-faq mds-details {
  --mds-details-duration: 500ms;
  --mds-details-icon-color: rgb(var(--variant-secondary-04));
  --mds-details-helper-icon-color: rgb(var(--tone-neutral-04));
}
```

#### Styling Shadow Parts

When CSS custom properties are not sufficient, use the documented shadow `::part()` names: `header`, `title`, and `content`. Do not target undocumented internals.

```css
/* Increase header padding for a spacious FAQ layout */
.faq-section mds-details::part(header) {
  padding: var(--spacing-300) 0;
}

/* Give the title extra weight */
.faq-section mds-details::part(title) {
  font-weight: var(--font-weight-600);
}
```


### 3. Antipattern

Common incorrect uses of `<mds-details>`. Each entry pairs the wrong form with the right one and a one-line reason. System-wide rules (boolean-as-string, shadow piercing, Tailwind color utilities, raw native event listening) live in [`docs/COMPONENTS.md`](../../../../../../docs/COMPONENTS.md#system-level-anti-patterns) - they apply here too but are not repeated.

#### Do Not Put the Title Text in the Default Slot

The default slot is the collapsible body. Text placed there is hidden until the user expands the block, so it cannot serve as the visible header. Use the `title` slot for the header label.

```html
<!-- 🚫 INCORRECT -->
<mds-details>
  Requisiti di accesso
</mds-details>

<!-- ✅ CORRECT -->
<mds-details>
  <mds-text typography="h6" slot="title">Requisiti di accesso</mds-text>
</mds-details>
```

#### Do Not Replace `<mds-details>` with a Raw `<details>` Element

The native `<details>` lacks Magma theming, the leading icon slot, the `action` slot, smooth CSS grid transitions, preference support (reduced-motion, high-contrast), and the `mdsDetailsChange` event contract. Always use `<mds-details>` inside a Magma application.

```html
<!-- 🚫 INCORRECT -->
<details>
  <summary>Modulistica richiesta</summary>
  <p>Scarica il modulo A3 prima di procedere.</p>
</details>

<!-- ✅ CORRECT -->
<mds-details>
  <mds-text typography="h6" slot="title">Modulistica richiesta</mds-text>
  <mds-text typography="detail">Scarica il modulo A3 prima di procedere.</mds-text>
</mds-details>
```

#### Do Not Set `opened="false"` to Collapse the Component

`opened` is a boolean attribute. Any non-empty string value - including `"false"` - is truthy in HTML and keeps the block expanded. Remove the attribute entirely to collapse it, or set the property to `undefined` / `false` in JavaScript.

```html
<!-- 🚫 INCORRECT -->
<mds-details opened="false">
  <mds-text typography="h6" slot="title">Note operative</mds-text>
</mds-details>

<!-- ✅ CORRECT -->
<mds-details>
  <mds-text typography="h6" slot="title">Note operative</mds-text>
</mds-details>
```

#### Do Not Inline an `<mds-icon>` in the `title` Slot to Fake a Leading Glyph

The `icon` slot is the dedicated region for the leading glyph; it also participates in the toggle click area. Putting `mds-icon` inside the `title` slot bypasses this layout and leaves the icon area empty.

```html
<!-- 🚫 INCORRECT -->
<mds-details>
  <span slot="title">
    <mds-icon name="mi/baseline/info"></mds-icon>
    Informazioni sul servizio
  </span>
</mds-details>

<!-- ✅ CORRECT -->
<mds-details>
  <mds-icon slot="icon" name="mi/baseline/info"></mds-icon>
  <mds-text typography="h6" slot="title">Informazioni sul servizio</mds-text>
</mds-details>
```

#### Do Not Listen for Native `click` to Detect Toggle

Clicking the header triggers `mdsDetailsChange` with the new state. Listening for raw `click` on the host or its shadow parts is fragile - it fires on every sub-element click, may not bubble out of shadow DOM as expected, and gives you no reliable open/closed state.

```html
<!-- 🚫 INCORRECT -->
<mds-details id="det">
  <mds-text typography="h6" slot="title">Dettaglio</mds-text>
</mds-details>

<script>
  // Do not do this - fires on any click, no open/closed state
  document.getElementById('det').addEventListener('click', () => {
    console.log('click rilevato');
  });
</script>

<!-- ✅ CORRECT -->
<script>
  document.getElementById('det').addEventListener('mdsDetailsChange', (e) => {
    console.log('Aperto:', e.detail); // true | false
  });
</script>
```

#### Do Not Pierce the Shadow DOM to Style Internals

The only supported customization surface is the three documented `--mds-details-*` CSS custom properties and the three documented shadow parts (`header`, `title`, `content`). Targeting undocumented class names or using `>>>` couples your code to the internal implementation and will break on minor releases.

```css
/* 🚫 INCORRECT */
mds-details >>> .helper-icon {
  fill: red;
}
mds-details >>> .header {
  background: yellow;
}

/* ✅ CORRECT */
mds-details {
  --mds-details-helper-icon-color: rgb(var(--variant-error-04));
  --mds-details-duration: 200ms;
}
mds-details::part(header) {
  background: rgb(var(--tone-neutral-01));
}
```



## Properties

| Property | Attribute | Description                          | Type      | Default |
| -------- | --------- | ------------------------------------ | --------- | ------- |
| `opened` | `opened`  | Specifies if the component is opened | `boolean` | `false` |


## Events

| Event              | Description                        | Type                   |
| ------------------ | ---------------------------------- | ---------------------- |
| `mdsDetailsChange` | Emits when the component is opened | `CustomEvent<boolean>` |


## Slots

| Slot       | Description                                                                                                       |
| ---------- | ----------------------------------------------------------------------------------------------------------------- |
|            | Add `text string`, `HTML elements` or `components` to this slot.                                                  |
| `"action"` | Add `HTML elements` or `components`, it is **recommended** to use `mds-button` element.                           |
| `"icon"`   | Insert an icon image, it can be `HTML elements` or `components`, it is **recommended** to add `mds-icon` element. |
| `"title"`  | Add a `text string`, `HTML elements` or `components`, it is **recommended** to use `mds-text` element.            |


## Shadow Parts

| Part        | Description                                              |
| ----------- | -------------------------------------------------------- |
| `"content"` | The content wrapper of the `default` and `content` slots |
| `"header"`  | The header of the component                              |
| `"title"`   | The title of the component                               |


## CSS Custom Properties

| Name                              | Description                                                |
| --------------------------------- | ---------------------------------------------------------- |
| `--mds-details-duration`          | Sets the transition duration for details component         |
| `--mds-details-helper-icon-color` | Sets the color of the helper icon in the details component |
| `--mds-details-icon-color`        | Sets the color of the details icon                         |


----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
