# mds-accordion-timer



This is a web-component from Maggioli Design System [Magma](https://magma.maggiolicloud.it), built with StencilJS, TypeScript, Storybook. It's based on the web-component standard and it's designed to be agnostic from the JavaScript framework you are using.

<!-- Auto Generated Below -->


## Usage

### 1. Description

The `<mds-accordion-timer>` web component is the orchestrating parent of an auto-advancing accordion in the Magma Design System. It groups one or more `<mds-accordion-timer-item>` children, runs a timed progress cycle over them, and automatically opens the next item when the current one elapses - a behaviour with no native HTML primitive.

#### Semantic Behavior

- **Compound parent**: Drives selection across its slotted `<mds-accordion-timer-item>` children; it is meaningless without item children.
- **Initial selection**: The first child carrying `selected` becomes the active item and starts the timer on load; if none is selected, the timer stays idle until an item is activated.
- **Auto-advance cycle**: When the active item elapses, the next item opens, wrapping back to the first after the last - producing a continuous loop.
- **Per-item duration override**: Each item uses its own `duration` when set, otherwise falling back to the parent `duration`.
- **Pause on hover**: Hovering the active item pauses the countdown and resumes on mouse-leave; this is suppressed while `paused` is set.
- **Manual selection**: Clicking an item stops the running cycle and selects it (left paused), while programmatic selection restarts the timer from the beginning of that item.
- **Emitted event**: `mdsAccordionTimerChange` with the new item `index` whenever the active item changes.

#### Properties & Visual Configurations

This component exposes only timing controls; it has no `variant` / `tone` / `size` ladder of its own.

#### Other behavioral props

- **`duration`** is the fallback cycle length in milliseconds applied to every item that does not declare its own `duration`; it is the global pacing knob for the whole accordion.
- **`paused`** freezes the countdown at its current remaining time when set and resumes it when cleared. While paused, hover-driven pause/resume is disabled, making it the authoritative external stop control.


### 2. Pattern

Correct and idiomatic ways to use the `<mds-accordion-timer>` component, ordered from most common to most specialized. Patterns assume a working knowledge of the variant / tone ladders documented in [`docs/COMPONENTS.md`](../../../../../../docs/COMPONENTS.md) and the generic stencil rules in [`projects/stencil/SPEC.md`](../../../../SPEC.md).

#### Basic Auto-Advancing Accordion

The canonical form. Place `<mds-accordion-timer-item>` children inside the parent, mark exactly one with `selected` to define the initial panel, and provide a `description` for each header. The timer starts automatically on load and cycles through items continuously.

```html
<mds-accordion-timer>
  <mds-accordion-timer-item selected description="Introduzione">
    <mds-text>Contenuto del primo pannello.</mds-text>
  </mds-accordion-timer-item>
  <mds-accordion-timer-item description="Caratteristiche">
    <mds-text>Contenuto del secondo pannello.</mds-text>
  </mds-accordion-timer-item>
  <mds-accordion-timer-item description="Conclusioni">
    <mds-text>Contenuto del terzo pannello.</mds-text>
  </mds-accordion-timer-item>
</mds-accordion-timer>
```

#### Controlling the Global Cycle Duration

Use the `duration` prop (in milliseconds) to set how long each item stays open before the accordion auto-advances. The default is 10000 ms (10 seconds). This applies to all items that do not declare their own `duration`.

```html
<mds-accordion-timer duration="5000">
  <mds-accordion-timer-item selected description="Passo 1">
    <mds-text>Primo contenuto.</mds-text>
  </mds-accordion-timer-item>
  <mds-accordion-timer-item description="Passo 2">
    <mds-text>Secondo contenuto.</mds-text>
  </mds-accordion-timer-item>
</mds-accordion-timer>
```

#### Per-Item Duration Override

Set `duration` on individual `<mds-accordion-timer-item>` children to give each item its own display time. An item-level `duration` takes precedence over the parent's global `duration` for that item only.

```html
<mds-accordion-timer duration="4000">
  <mds-accordion-timer-item selected description="Introduzione rapida" duration="2000">
    <mds-text>Questo pannello rimane aperto per 2 secondi.</mds-text>
  </mds-accordion-timer-item>
  <mds-accordion-timer-item description="Approfondimento" duration="8000">
    <mds-text>Questo pannello rimane aperto per 8 secondi.</mds-text>
  </mds-accordion-timer-item>
  <mds-accordion-timer-item description="Riepilogo">
    <mds-text>Questo pannello usa la durata globale (4 secondi).</mds-text>
  </mds-accordion-timer-item>
</mds-accordion-timer>
```

#### Starting in a Paused State

Set the `paused` attribute on the parent to start the accordion with the timer frozen. The selected item will display without advancing until `paused` is removed. Use this when the auto-advance should not begin until a user action occurs.

```html
<mds-accordion-timer paused>
  <mds-accordion-timer-item selected description="In attesa di avvio">
    <mds-text>Il timer e' in pausa. Rimuovere l'attributo "paused" per avviarlo.</mds-text>
  </mds-accordion-timer-item>
  <mds-accordion-timer-item description="Secondo pannello">
    <mds-text>Secondo contenuto.</mds-text>
  </mds-accordion-timer-item>
</mds-accordion-timer>
```

#### Toggling Pause Programmatically

Toggle the `paused` prop from JavaScript to freeze and resume the countdown at runtime - for example in response to a user preference or a visibility-change event. Remove the attribute (or set the prop to `undefined`) to resume; do not set it to `false`.

```html
<mds-accordion-timer id="slideshow">
  <mds-accordion-timer-item selected description="Novita' del mese">
    <mds-text>Contenuto del primo pannello.</mds-text>
  </mds-accordion-timer-item>
  <mds-accordion-timer-item description="Offerte speciali">
    <mds-text>Contenuto del secondo pannello.</mds-text>
  </mds-accordion-timer-item>
</mds-accordion-timer>

<mds-button id="btn-pause" label="Metti in pausa" variant="secondary" tone="outline"></mds-button>
<mds-button id="btn-resume" label="Riprendi" variant="primary" tone="strong"></mds-button>
```

```javascript
const accordion = document.getElementById('slideshow');
document.getElementById('btn-pause').addEventListener('mdsButtonClick', () => {
  accordion.paused = true;
});
document.getElementById('btn-resume').addEventListener('mdsButtonClick', () => {
  accordion.paused = undefined;
});
```

#### Listening for Item Changes

Listen to the `mdsAccordionTimerChange` event to react whenever the active item changes - for example to synchronise an external indicator or analytics counter. The event detail carries the zero-based `index` of the newly selected item.

```javascript
document.querySelector('mds-accordion-timer').addEventListener('mdsAccordionTimerChange', (e) => {
  console.log('Pannello attivo:', e.detail.index);
});
```

#### Programmatic Item Selection

To jump to a specific item from code, set `selected = true` on that `<mds-accordion-timer-item>` element directly. The parent intercepts the resulting `mdsAccordionTimerItemSelect` event, clears `paused`, and restarts the timer from the beginning of that item.

```javascript
const items = document.querySelectorAll('mds-accordion-timer-item');
// Apre il terzo pannello e riavvia il timer
items[2].selected = true;
```

#### Customizing the Progress Bar via CSS Custom Properties

Style the component only through its documented `--mds-accordion-timer-*` CSS custom properties. Set them on the parent host or a parent selector; use Magma color tokens via `rgb(var(--<token>))` so dark mode continues to work.

```css
.promo-slider mds-accordion-timer {
  --mds-accordion-timer-progress-bar-color: rgb(var(--variant-primary-03));
  --mds-accordion-timer-progress-bar-background: rgb(var(--tone-neutral-09));
  --mds-accordion-timer-progress-bar-thickness: 3px;
  --mds-accordion-timer-duration: 300ms;
}
```


### 3. Antipattern

Common incorrect uses of `<mds-accordion-timer>`. Each entry pairs the wrong form with the right one and a one-line reason. System-wide rules (boolean-as-string, shadow piercing, Tailwind color utilities, raw native event listening) live in [`docs/COMPONENTS.md`](../../../../../../docs/COMPONENTS.md#system-level-anti-patterns) - they apply here too but are not repeated.

#### Do Not Use mds-accordion-timer-item Outside mds-accordion-timer

`<mds-accordion-timer-item>` is a compound child that only works when discovered by the parent at load time; the parent assigns `uuid` values, drives the selection, and feeds `progress`. Outside its parent the item has no timer, no auto-advance, and no sibling coordination.

```html
<!-- 🚫 INCORRECT -->
<mds-accordion-timer-item selected description="Elemento isolato">
  <mds-text>Questo elemento non avra' mai un timer.</mds-text>
</mds-accordion-timer-item>

<!-- ✅ CORRECT -->
<mds-accordion-timer>
  <mds-accordion-timer-item selected description="Elemento corretto">
    <mds-text>Il timer funziona correttamente all'interno del genitore.</mds-text>
  </mds-accordion-timer-item>
</mds-accordion-timer>
```

#### Do Not Mix Child Types Inside mds-accordion-timer

The parent discovers children via `querySelectorAll('mds-accordion-timer-item')` and indexes them by position. Mixing in `<mds-accordion-item>` or other components corrupts the index sequence and breaks rotation; the SPEC explicitly forbids mixing child types in compound components.

```html
<!-- 🚫 INCORRECT -->
<mds-accordion-timer>
  <mds-accordion-timer-item selected description="Timed item">
    <mds-text>Pannello a timer.</mds-text>
  </mds-accordion-timer-item>
  <mds-accordion-item label="Static item">
    <mds-text>Pannello statico non supportato qui.</mds-text>
  </mds-accordion-item>
</mds-accordion-timer>

<!-- ✅ CORRECT -->
<mds-accordion-timer>
  <mds-accordion-timer-item selected description="Primo pannello">
    <mds-text>Pannello a timer.</mds-text>
  </mds-accordion-timer-item>
  <mds-accordion-timer-item description="Secondo pannello">
    <mds-text>Altro pannello a timer.</mds-text>
  </mds-accordion-timer-item>
</mds-accordion-timer>
```

#### Do Not Set paused="false" to Resume the Timer

`paused` is a boolean prop; any non-empty string value - including `"false"` - is truthy in HTML and keeps the timer frozen. Remove the attribute entirely (or set the property to `undefined`) to resume.

```html
<!-- 🚫 INCORRECT -->
<mds-accordion-timer paused="false">
  <mds-accordion-timer-item selected description="Primo pannello">
    <mds-text>Il timer e' ancora fermo.</mds-text>
  </mds-accordion-timer-item>
</mds-accordion-timer>

<!-- ✅ CORRECT -->
<mds-accordion-timer>
  <mds-accordion-timer-item selected description="Primo pannello">
    <mds-text>Il timer e' in esecuzione.</mds-text>
  </mds-accordion-timer-item>
</mds-accordion-timer>
```

```javascript
// ✅ CORRECT (from code)
accordion.paused = undefined; // not accordion.paused = false
```

#### Do Not Set uuid or progress Manually

`uuid` (item position index) and `progress` (0-100 fill value) are owned and continuously rewritten by the parent at runtime. Setting them from outside produces race conditions between your values and the parent's interval writes, leading to erratic progress bars and broken rotation.

```html
<!-- 🚫 INCORRECT -->
<mds-accordion-timer>
  <mds-accordion-timer-item uuid="0" progress="50" selected description="Progresso manuale">
    <mds-text>La barra di progresso verra' sovrascritta dal genitore.</mds-text>
  </mds-accordion-timer-item>
</mds-accordion-timer>

<!-- ✅ CORRECT -->
<mds-accordion-timer>
  <mds-accordion-timer-item selected description="Progresso gestito">
    <mds-text>Il genitore gestisce uuid e progress automaticamente.</mds-text>
  </mds-accordion-timer-item>
</mds-accordion-timer>
```

#### Do Not Pierce the Shadow DOM to Restyle the Progress Bar

The progress bar and label are internal shadow parts. Use the documented `--mds-accordion-timer-*` CSS custom properties on the host (or a parent selector) to change their appearance. Targeting internal class names or undocumented parts couples your code to the implementation and will break on minor releases.

```css
/* 🚫 INCORRECT */
mds-accordion-timer >>> .progress-bar {
  background: red;
}
mds-accordion-timer-item::part(unknown-part) {
  height: 4px;
}

/* ✅ CORRECT */
mds-accordion-timer {
  --mds-accordion-timer-progress-bar-color: rgb(var(--variant-primary-03));
  --mds-accordion-timer-progress-bar-thickness: 3px;
}
```

#### Do Not Listen for Native change Events Instead of mdsAccordionTimerChange

The component emits `mdsAccordionTimerChange` when the active item changes. Native DOM events do not bubble out of shadow DOM the way you might expect. Listen to the documented `mds*` event name.

```javascript
// 🚫 INCORRECT
accordion.addEventListener('change', (e) => { /* may never fire */ });

// ✅ CORRECT
accordion.addEventListener('mdsAccordionTimerChange', (e) => {
  console.log('Indice attivo:', e.detail.index);
});
```



## Properties

| Property   | Attribute  | Description                                    | Type                   | Default     |
| ---------- | ---------- | ---------------------------------------------- | ---------------------- | ----------- |
| `duration` | `duration` | Sets the duration of the single accordion item | `number`               | `10000`     |
| `paused`   | `paused`   | When paused is defined, the timer stops run    | `boolean \| undefined` | `undefined` |


## Events

| Event                     | Description                                | Type                                        |
| ------------------------- | ------------------------------------------ | ------------------------------------------- |
| `mdsAccordionTimerChange` | Emits when the accordion changes it's item | `CustomEvent<MdsAccordionTimerEventDetail>` |


## Slots

| Slot        | Description                               |
| ----------- | ----------------------------------------- |
| `"default"` | Add `mds-accordion-timer-item` element/s. |


## CSS Custom Properties

| Name                                            | Description                                                                                 |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `--mds-accordion-timer-color`                   | Sets the text color of the component mds-accordion-timer-item                               |
| `--mds-accordion-timer-duration`                | Sets the transition duration of open/close animation of the mds-accordion-timer-item        |
| `--mds-accordion-timer-progress-bar-background` | Sets the background-color of the progress bar when the mds-accordion-timer-item is selected |
| `--mds-accordion-timer-progress-bar-color`      | Sets the color of the progress bar when the mds-accordion-timer-item is selected            |
| `--mds-accordion-timer-progress-bar-thickness`  | Sets thickness of the progress bar of the mds-accordion-timer-item                          |


----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
