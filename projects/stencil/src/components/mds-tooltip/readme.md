# mds-tooltip



This is a web-component from Maggioli Design System [Magma](https://magma.maggiolicloud.it), built with StencilJS, TypeScript, Storybook. It's based on the web-component standard and it's designed to be agnostic from the JavaScript framework you are using.

<!-- Auto Generated Below -->


## Usage

### 1. Description

The `<mds-tooltip>` web component is the floating contextual hint of the Magma Design System. It renders a small text bubble that attaches to a separate trigger element identified by a CSS selector, rather than relying on the native `title` attribute.

#### Semantic Behavior

- **Detached trigger model**: The tooltip is not wrapped around its trigger; the required `target` selector is resolved and the component binds itself to the first matching caller.
- **Hover and focus visibility**: The bubble shows while the pointer is over the trigger or the trigger has the focus, and hides when neither holds; Escape hides it until the trigger is hovered or focused again. The tooltip takes `role="tooltip"` and, when it shares a DOM tree with the trigger, writes `aria-describedby` on it, or `aria-labelledby` with `relation="label"`; an attribute the trigger already has is left alone.
- **Visibility is the source of truth**: Setting `visible` programmatically shows or dismisses the bubble, allowing the tooltip to be controlled without a hover.
- **Live repositioning**: Changing any layout prop (`placement`, `offset`, `disableShift`, `shiftPadding`, `strategy`, `flip`, `disableAutoPlacement`) recomputes the floating position on the fly.
- **Text-only default slot**: The default slot is meant for a plain text string (exposed as the `text` shadow part); HTML elements or components should not be slotted in.

#### Properties & Visual Configurations

- **`target`** (required) is the CSS selector of the trigger element the tooltip listens to and anchors against; the first match wins.
- **`placement`** chooses the preferred side and alignment relative to the caller (e.g. `'top'`, `'bottom-start'`), taken whenever it has room; by default the tooltip moves to the opposite side, then to the sides across, only when it does not fit there (**`disableAutoPlacement`** opts out and pins to `placement`, and **`flip`** then allows the fallback to the opposite side only).
- the bubble is kept inside the viewport by default (**`disableShift`** opts out), with **`shiftPadding`** reserving a safe gap from the viewport edges; **`offset`** sets the distance between the bubble and the caller.
- **`strategy`** selects the CSS positioning strategy: `'fixed'` (default) escapes clipping ancestors, `'absolute'` anchors within the nearest positioned ancestor.
- **`relation`** says what the tooltip is to its trigger: its `'description'` (default, `aria-describedby`), or its `'label'` (`aria-labelledby`), when the tooltip text is the only visible name of the trigger, as on an icon-only button. Changing it moves the attribute on the trigger.
- **`typography`** picks the text scale of the bubble (`'tip'`, `'caption'`, `'detail'`), where `'tip'` is the default compact hint sizing.


### 2. Examples

Correct and idiomatic ways to use the `<mds-tooltip>` component, ordered from most common to most specialized. The examples assume a working knowledge of the shared component rules in [`docs/agents/conventions.md`](../../../../../../docs/agents/conventions.md).

#### Basic Tooltip on a Button

The most common form. Give the trigger element an `id` (or any unique CSS selector) and point `target` at it. The tooltip listens for hover events on the trigger and positions itself automatically.

```html
<mds-button id="salva-btn" label="Salva documento" variant="primary" tone="strong"></mds-button>
<mds-tooltip target="#salva-btn">Salva le modifiche correnti</mds-tooltip>
```

#### Naming an Icon-Only Button

On an icon-only button the tooltip usually shows the name of the button. Set `relation="label"` so that the tooltip is the name (`aria-labelledby`) and not a description: the button needs no `aria-label`, and a screen reader does not read the same text twice. Use it only on an interactive trigger, a button or a link: ARIA does not allow a name on a generic element.

```html
<mds-button id="tokens-btn" icon="mi/baseline/palette" variant="dark" tone="text"></mds-button>
<mds-tooltip target="#tokens-btn" relation="label">Tokens</mds-tooltip>
```

#### Tooltip on a Non-Interactive Element

`target` accepts any CSS selector, not just `#id`. Use a class or attribute selector when the trigger is a static element such as a status icon.

```html
<mds-icon class="stato-icona" name="mi/baseline/info"></mds-icon>
<mds-tooltip target=".stato-icona">Ultima sincronizzazione: oggi alle 08:30</mds-tooltip>
```

#### Placement and Preferred Side

Override the default `top` placement with `placement` when layout requires a different side. Auto placement is on by default: the tooltip takes `placement` whenever it has room and moves to another side only when it does not fit; `disable-auto-placement` locks the side.

```html
<mds-button id="dettagli-btn" label="Dettagli" variant="primary" tone="outline"></mds-button>
<mds-tooltip target="#dettagli-btn" placement="right" disable-auto-placement>
  Apre il pannello laterale con i dettagli completi
</mds-tooltip>
```

Accepted values: `top`, `top-start`, `top-end`, `bottom`, `bottom-start`, `bottom-end`, `left`, `left-start`, `left-end`, `right`, `right-start`, `right-end`.

#### Flip Fallback When Space is Tight

Enable `flip` together with `disable-auto-placement` so the pinned tooltip moves to the opposite side, and to no other, if the preferred placement collides with the viewport edge. Auto placement already includes that fallback.

```html
<mds-button id="azione-btn" label="Azione" variant="primary"></mds-button>
<mds-tooltip target="#azione-btn" placement="top" disable-auto-placement flip>
  Esegui l'operazione selezionata
</mds-tooltip>
```

#### Viewport-Safe Shift

By default the tooltip slides along its axis so it stays inside the viewport (set `disable-shift` to opt out). Increase `shift-padding` to keep a wider safe margin from the viewport edges.

```html
<mds-button id="bordo-btn" label="Vicino al bordo" variant="dark" tone="outline"></mds-button>
<mds-tooltip target="#bordo-btn" shift-padding="24">
  Questa azione e' irreversibile
</mds-tooltip>
```

#### Custom Offset Distance

Increase `offset` when additional breathing room between the trigger and the bubble is required - for example inside dense toolbars or on elements with large focus rings.

```html
<mds-button id="info-btn" label="Info" variant="info" tone="weak"></mds-button>
<mds-tooltip target="#info-btn" offset="20">
  Informazioni aggiuntive sul campo
</mds-tooltip>
```

#### Programmatic Visibility

Set the `visible` attribute (or property) to control the tooltip without hover. Useful for guided tours, onboarding hints, or error annotations that appear on demand.

```html
<mds-button id="primo-accesso" label="Inizia" variant="primary"></mds-button>
<mds-tooltip id="hint" target="#primo-accesso" visible>
  Benvenuto! Clicca qui per iniziare la configurazione.
</mds-tooltip>

<script>
  const hint = document.querySelector('#hint');
  // Dismiss programmatically when the user acknowledges the hint
  document.querySelector('#primo-accesso').addEventListener('click', () => {
    hint.visible = false;
  });
</script>
```

#### Typography Scale

`typography` adjusts the text scale inside the bubble. Use `'tip'` (default) for compact hints, `'caption'` for slightly larger labels, and `'detail'` for the largest, body-size text.

```html
<!-- Default compact hint -->
<mds-tooltip target="#campo-nome" typography="tip">Massimo 64 caratteri</mds-tooltip>

<!-- Slightly larger label -->
<mds-tooltip target="#campo-data" typography="caption">Formato: GG/MM/AAAA</mds-tooltip>
```

#### Positioning Strategy

Use `strategy="absolute"` when the tooltip must be contained within a scrolling ancestor instead of the viewport. The default `strategy="fixed"` escapes any clipping or overflow-hidden parent.

```html
<!-- Inside a scrollable panel with overflow:hidden ancestors -->
<mds-tooltip target="#voce-lista" strategy="absolute">Trascina per riordinare</mds-tooltip>
```

#### Styling Customization

Style the tooltip only through its public `--mds-tooltip-*` CSS custom properties: the background (the arrow follows it), the delay and the z-index. Set them on the host element or a parent selector; use the semantic color roles via `rgb(var(--magma-<role>))` so dark mode and high-contrast modes keep working.

```css
.onboarding-hint mds-tooltip {
  --mds-tooltip-background: rgb(var(--magma-accent-surface));
  --mds-tooltip-delay: 0.25s;
  --mds-tooltip-z-index: 5000;
}
```


### 3. Mistakes

Common incorrect uses of `<mds-tooltip>`. Each entry pairs the wrong form with the right one and a one-line reason. System-wide rules (boolean-as-string, shadow piercing, Tailwind color utilities, raw native event listening) live in [`docs/agents/mistakes.md`](../../../../../../docs/agents/mistakes.md) - they apply here too but are not repeated.

#### Do Not Use a Bare ID String as `target`

The value of `target` is passed directly to `querySelector`, so a CSS selector is required: a bare id (`hint-trigger`) looks for an element named `<hint-trigger>`, finds nothing, and the tooltip never attaches.

```html
<!-- INCORRECT -->
<span id="hint-trigger">Aiuto</span>
<mds-tooltip target="hint-trigger">Testo di aiuto</mds-tooltip>

<!-- CORRECT -->
<span id="hint-trigger">Aiuto</span>
<mds-tooltip target="#hint-trigger">Testo di aiuto</mds-tooltip>
```

#### Do Not Slot HTML Elements or Components

The default slot is text-only. Nesting HTML elements or Magma components breaks the inner layout and may produce unexpected rendering because the slot is wrapped in `<mds-text>`.

```html
<!-- INCORRECT -->
<mds-tooltip target="#voce">
  <mds-icon name="mi/baseline/warning"></mds-icon>
  <strong>Attenzione:</strong> campo obbligatorio
</mds-tooltip>

<!-- CORRECT -->
<mds-tooltip target="#voce">Attenzione: campo obbligatorio</mds-tooltip>
```

#### Do Not Wrap the Trigger Inside the Tooltip

`<mds-tooltip>` uses a detached trigger model - the tooltip is placed as a sibling in the DOM and linked via `target`, not wrapped around its trigger. Nesting the trigger breaks the floating position logic.

```html
<!-- INCORRECT -->
<mds-tooltip target="#btn">
  <mds-button id="btn" label="Elimina"></mds-button>
  Elimina il record selezionato
</mds-tooltip>

<!-- CORRECT -->
<mds-button id="btn" label="Elimina" variant="error" tone="text"></mds-button>
<mds-tooltip target="#btn">Elimina il record selezionato</mds-tooltip>
```

#### Do Not Set `visible="false"` to Hide the Tooltip

`visible` is a boolean attribute; setting it to the string `"false"` leaves the attribute on the element. The tooltip itself reads it as hidden, but every presence check (`[visible]`, `hasAttribute('visible')`) still reads it as visible. Remove the attribute (or set the property to `false`) to hide it.

```html
<!-- INCORRECT -->
<mds-tooltip target="#campo" visible="false">Testo nascosto</mds-tooltip>

<!-- CORRECT -->
<mds-tooltip target="#campo">Testo nascosto</mds-tooltip>
```

```js
// CORRECT (programmatic)
document.querySelector('mds-tooltip').visible = false;
```

#### Do Not Pierce the Shadow DOM to Style Internal Parts

The only supported customization surface is the set of public `--mds-tooltip-*` CSS custom properties and the documented `text` shadow part. Targeting undocumented internal selectors couples your code to the implementation and will break on minor releases.

```css
/* INCORRECT */
mds-tooltip >>> .text {
  font-style: italic;
}
mds-tooltip::part(arrow) {
  fill: red;
}

/* CORRECT */
mds-tooltip {
  --mds-tooltip-background: rgb(var(--magma-accent-surface));
  --mds-tooltip-delay: 0.5s;
}
mds-tooltip::part(text) {
  font-style: italic;
}
```

#### Do Not Repeat the Name of the Trigger as Its Description

A tooltip describes its trigger by default. When its text is the name of the trigger, as on an icon-only button, an `aria-label` with the same text makes a screen reader read it twice, as the name and as the description. Make the tooltip the name instead.

```html
<!-- INCORRECT -->
<mds-button id="tokens-btn" icon="mi/baseline/palette" aria-label="Tokens"></mds-button>
<mds-tooltip target="#tokens-btn">Tokens</mds-tooltip>

<!-- CORRECT -->
<mds-button id="tokens-btn" icon="mi/baseline/palette"></mds-button>
<mds-tooltip target="#tokens-btn" relation="label">Tokens</mds-tooltip>
```

#### Do Not Replace `<mds-tooltip>` with a Native `title` Attribute

The native `title` tooltip is not styleable and not announced consistently by screen readers on touch devices. Use `<mds-tooltip>` for all contextual hints.

```html
<!-- INCORRECT -->
<mds-button label="Elimina" title="Elimina il record selezionato"></mds-button>

<!-- CORRECT -->
<mds-button id="elimina-btn" label="Elimina" variant="error" tone="text"></mds-button>
<mds-tooltip target="#elimina-btn">Elimina il record selezionato</mds-tooltip>
```



## Properties

| Property               | Attribute                | Description                                                                                                                                                                                                | Type                                                                                                                                                                 | Default         |
| ---------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| `disableAutoPlacement` | `disable-auto-placement` | Pins the component to `placement`: without it, the component moves to another side of the caller when `placement` has no room.                                                                             | `boolean`                                                                                                                                                            | `false`         |
| `disableShift`         | `disable-shift`          | If set, the component will not be kept inside the viewport.                                                                                                                                                | `boolean`                                                                                                                                                            | `false`         |
| `flip`                 | `flip`                   | With `disableAutoPlacement`, moves the component to the opposite side of the caller when `placement` has no room. Auto-placement, the default, already does it.                                            | `boolean`                                                                                                                                                            | `false`         |
| `offset`               | `offset`                 | Sets distance between the tooltip and the caller.                                                                                                                                                          | `number`                                                                                                                                                             | `12`            |
| `placement`            | `placement`              | Specifies where the component should be placed relative to the caller: the side it takes whenever it has room there.                                                                                       | `"bottom" \| "bottom-end" \| "bottom-start" \| "left" \| "left-end" \| "left-start" \| "right" \| "right-end" \| "right-start" \| "top" \| "top-end" \| "top-start"` | `'top'`         |
| `relation`             | `relation`               | Sets what the tooltip is to its caller: its `description` (`aria-describedby`), or its `label` (`aria-labelledby`), when the tooltip holds the only visible name of the caller, as on an icon-only button. | `"description" \| "label"`                                                                                                                                           | `'description'` |
| `shiftPadding`         | `shift-padding`          | Sets a safe area distance between the tooltip and the viewport.                                                                                                                                            | `number`                                                                                                                                                             | `12`            |
| `strategy`             | `strategy`               | Sets the CSS position strategy of the component.                                                                                                                                                           | `"absolute" \| "fixed"`                                                                                                                                              | `'fixed'`       |
| `target` _(required)_  | `target`                 | Specifies the selector of the target element, this attribute is used with `querySelector` method.                                                                                                          | `string`                                                                                                                                                             | `undefined`     |
| `typography`           | `typography`             | Specifies the font typography of the element                                                                                                                                                               | `"caption" \| "detail" \| "tip"`                                                                                                                                     | `'tip'`         |
| `visible`              | `visible`                | Specifies the visibility of the component.                                                                                                                                                                 | `boolean`                                                                                                                                                            | `false`         |


## Slots

| Slot | Description                                                                            |
| ---- | -------------------------------------------------------------------------------------- |
|      | Add `text string` to this slot, **avoid** to add `HTML elements` or `components` here. |


## Shadow Parts

| Part     | Description                                      |
| -------- | ------------------------------------------------ |
| `"text"` | The text of the tooltip, around the default slot |


## CSS Custom Properties

| Name                             | Description                                              |
| -------------------------------- | -------------------------------------------------------- |
| `--mds-tooltip-arrow-background` | Background color of the tooltip arrow.                   |
| `--mds-tooltip-background`       | Public. Background color of the tooltip body.            |
| `--mds-tooltip-delay`            | Public. Delay before showing the tooltip.                |
| `--mds-tooltip-dot-padding`      | Padding around the tooltip dot (if present).             |
| `--mds-tooltip-drop-shadow`      | Drop shadow applied to the tooltip.                      |
| `--mds-tooltip-duration`         | Duration of the tooltip animation.                       |
| `--mds-tooltip-ease`             | Timing function for the tooltip animation.               |
| `--mds-tooltip-transform-from`   | Transform applied at the start of the tooltip animation. |
| `--mds-tooltip-transform-to`     | Transform applied at the end of the tooltip animation.   |
| `--mds-tooltip-z-index`          | Public. z-index of the tooltip container.                |


## Dependencies

### Used by

 - [mds-help](../mds-help)
 - [mds-keyboard](../mds-keyboard)
 - [mds-radial-menu-item](../mds-radial-menu-item)

### Depends on

- [mds-text](../mds-text)

### Graph
```mermaid
graph TD;
  mds-tooltip --> mds-text
  mds-help --> mds-tooltip
  mds-keyboard --> mds-tooltip
  mds-radial-menu-item --> mds-tooltip
  style mds-tooltip fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
