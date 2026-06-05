# mds-card



This is a web-component from Maggioli Design System [Magma](https://magma.maggiolicloud.it), built with StencilJS, TypeScript, Storybook. It's based on the web-component standard and it's designed to be agnostic from the JavaScript framework you are using.

<!-- Auto Generated Below -->


## Usage

### 1. Description

The `<mds-card>` web component is the surface container of the Magma Design System: a styled, self-contained panel that groups related media, heading, body and action content into a single bounded region. It is a pure layout shell built on named slots and compound children rather than a replacement for any single HTML primitive.

#### Semantic Behavior

- **Layout is inferred, not declared**: The card detects which of the `media` / `header` / `content` / `footer` regions are present and reshapes itself to whatever content you provide.
- **Compound parent/child relationship**: `<mds-card-media>`, `<mds-card-header>`, `<mds-card-content>` and `<mds-card-footer>` are recognized by tag name and mapped onto the corresponding region, so they slot in without an explicit `slot` attribute. Plain elements still work when given the matching `slot` value.
- **Responsive by width**: The card's internal layout switches between stacked and media-beside-content arrangements based on the card's own width, independent of viewport or theme.
- **Slot regions are fixed**: Only the four named regions are rendered; there is no default (unnamed) slot, so loose text or elements without a recognized slot/tag are not laid out.

#### Properties & Visual Configurations

`<mds-card>` does not use the shared `variant` / `tone` ladders defined in [`projects/stencil/SPEC.md`](../../../../SPEC.md#tone-and-variant-system); it exposes a single behavioral prop.

- **`autoGrid`** (default `true`) toggles the intrinsic responsive grid. Leave it enabled to let the card own the placement and reflow of its regions; set it to `false` to opt out of the managed grid and lay the slotted content out yourself.

Spacing is tuned through the `--mds-card-gap` and `--mds-card-padding` CSS custom properties rather than props.


### 2. Pattern

Correct and idiomatic ways to use the `<mds-card>` component, ordered from most common to most specialized. Patterns assume a working knowledge of the compound-component rules documented in [`docs/COMPONENTS.md`](../../../../../../docs/COMPONENTS.md) and the generic stencil rules in [`projects/stencil/SPEC.md`](../../../../SPEC.md).

#### Full Card with All Four Regions

The most common form. Use `<mds-card-header>`, `<mds-card-media>`, `<mds-card-content>`, and `<mds-card-footer>` as direct children. Each compound child self-assigns to its slot - no explicit `slot` attribute needed.

```html
<mds-card>
  <mds-card-header>
    <mds-text typography="h6">Titolo della scheda</mds-text>
  </mds-card-header>
  <mds-card-media>
    <mds-img src="/immagini/copertina.jpg" class="object-cover"></mds-img>
  </mds-card-media>
  <mds-card-content>
    <mds-text>
      Descrizione dettagliata del contenuto della scheda.
    </mds-text>
  </mds-card-content>
  <mds-card-footer>
    <mds-button variant="dark" tone="text" label="Annulla"></mds-button>
    <mds-button variant="primary" tone="strong" label="Conferma"></mds-button>
  </mds-card-footer>
</mds-card>
```

#### Header + Content (No Media)

Omit the regions you do not need - the card detects which regions are present and adapts its grid layout accordingly. A header-and-content-only card stays single-column.

```html
<mds-card>
  <mds-card-header>
    <mds-text typography="h6">Riepilogo ordine</mds-text>
  </mds-card-header>
  <mds-card-content>
    <mds-text>
      Il tuo ordine e' stato elaborato correttamente.
    </mds-text>
  </mds-card-content>
</mds-card>
```

#### Media + Content + Footer (No Header)

Omitting the header region shifts media to the top and content immediately below. Useful for image-led catalog cards.

```html
<mds-card>
  <mds-card-media>
    <mds-img src="/immagini/prodotto.jpg" class="object-cover"></mds-img>
  </mds-card-media>
  <mds-card-content>
    <mds-text>Descrizione prodotto disponibile nella gamma autunnale.</mds-text>
  </mds-card-content>
  <mds-card-footer>
    <mds-button variant="primary" label="Aggiungi al carrello"></mds-button>
  </mds-card-footer>
</mds-card>
```

#### Header with Action Button via `mds-card-header`

`<mds-card-header>` has a dedicated `action` slot for icon buttons placed in the trailing position. Use it instead of laying out the button manually.

```html
<mds-card>
  <mds-card-header>
    <mds-text typography="h6">Profilo utente</mds-text>
    <mds-button
      slot="action"
      icon="mi/round/more-vert"
      aria-label="Altre azioni"
      variant="dark"
      tone="text"
    ></mds-button>
  </mds-card-header>
  <mds-card-content>
    <mds-text>Mario Rossi - Amministratore di sistema</mds-text>
  </mds-card-content>
</mds-card>
```

#### Media with Overlay Content via `mds-card-media`

`<mds-card-media>` exposes a `content` slot that renders in front of the media element. Use it for captions, badges, or status chips overlaid on an image.

```html
<mds-card>
  <mds-card-media>
    <mds-img src="/immagini/evento.jpg" class="object-cover"></mds-img>
    <mds-badge slot="content" variant="primary" tone="strong">In corso</mds-badge>
  </mds-card-media>
  <mds-card-content>
    <mds-text typography="h6">Conferenza annuale 2025</mds-text>
  </mds-card-content>
</mds-card>
```

#### Using Raw Slot Attributes Instead of Compound Children

When the compound children (`mds-card-*`) do not fit the use case, assign the `slot` attribute directly on any element. The layout engine recognizes the same four values: `media`, `header`, `content`, and `footer`.

```html
<mds-card>
  <div slot="header" class="flex items-center gap-400 px-400 py-400">
    <mds-avatar initials="LB"></mds-avatar>
    <mds-text typography="h6">Luca Bianchi</mds-text>
  </div>
  <mds-img slot="media" src="/immagini/lavoro.jpg" class="object-cover"></mds-img>
  <mds-text slot="content" class="px-400">
    Responsabile del progetto infrastrutture.
  </mds-text>
</mds-card>
```

#### Disabling the Auto-Grid

Set `auto-grid="false"` to opt out of the managed responsive grid. All four regions stack in document order and you own all layout decisions.

```html
<mds-card auto-grid="false">
  <mds-card-header>
    <mds-text typography="h6">Layout personalizzato</mds-text>
  </mds-card-header>
  <mds-card-content>
    <mds-text>Il contenuto e' disposto senza griglia automatica.</mds-text>
  </mds-card-content>
</mds-card>
```

#### Styling Customization via CSS Custom Properties

Set `--mds-card-gap` and `--mds-card-padding` on the host or a parent selector. Use Magma spacing tokens so the values remain consistent across themes.

```css
.scheda-articolo mds-card {
  --mds-card-gap: var(--spacing-200);
  --mds-card-padding: var(--spacing-400);
}
```

#### Customizing the Layout Part

The inner grid element is exposed as `::part(layout)`. Use it only for layout-level overrides that the CSS custom properties cannot cover, such as overriding the `border-radius` of the inner container.

```css
.scheda-highlight mds-card::part(layout) {
  border-radius: var(--radius-xl);
}
```


### 3. Antipattern

Common incorrect uses of `<mds-card>`. Each entry pairs the wrong form with the right one and a one-line reason. System-wide rules (boolean-as-string, shadow piercing, Tailwind color utilities, raw native event listening) live in [`docs/COMPONENTS.md`](../../../../../../docs/COMPONENTS.md#system-level-anti-patterns) - they apply here too but are not repeated.

#### Do Not Put Content Outside the Four Named Slots

`<mds-card>` has no default (unnamed) slot. Loose text or elements placed without a recognized `slot` attribute - or without using an `mds-card-*` compound child - are silently ignored and never rendered.

```html
<!-- 🚫 INCORRECT -->
<mds-card>
  <p>Questo testo non verra' mai visualizzato.</p>
  <mds-button label="Azione"></mds-button>
</mds-card>

<!-- ✅ CORRECT -->
<mds-card>
  <mds-card-content>
    <mds-text>Questo testo e' correttamente posizionato nel content slot.</mds-text>
  </mds-card-content>
  <mds-card-footer>
    <mds-button label="Azione" variant="primary"></mds-button>
  </mds-card-footer>
</mds-card>
```

#### Do Not Use `mds-card-*` Children Outside `<mds-card>`

Compound children (`mds-card-header`, `mds-card-media`, `mds-card-content`, `mds-card-footer`) rely on `<mds-card>` for layout context. Used standalone they render without the managed grid and without the card's visual chrome.

```html
<!-- 🚫 INCORRECT -->
<div class="mia-sezione">
  <mds-card-header>
    <mds-text typography="h6">Titolo standalone</mds-text>
  </mds-card-header>
</div>

<!-- ✅ CORRECT -->
<mds-card>
  <mds-card-header>
    <mds-text typography="h6">Titolo nella scheda</mds-text>
  </mds-card-header>
</mds-card>
```

#### Do Not Pierce the Shadow DOM with Undocumented Selectors

The only supported customization surface is `--mds-card-gap`, `--mds-card-padding`, and `::part(layout)`. Targeting internal class names with `>>>`, `/deep/`, or any selector that reaches inside the shadow root couples your code to implementation details and will break on minor releases.

```css
/* 🚫 INCORRECT */
mds-card >>> .layout {
  padding: 16px;
}
mds-card .layout--cfhm {
  grid-template-columns: 1fr 1fr;
}

/* ✅ CORRECT */
mds-card {
  --mds-card-padding: var(--spacing-400);
}
mds-card::part(layout) {
  border-radius: var(--radius-xl);
}
```

#### Do Not Assign an Explicit `slot` Attribute to `mds-card-*` Children

`mds-card-header`, `mds-card-media`, `mds-card-content`, and `mds-card-footer` already set their own `slot` attribute on the host element from inside the component. Adding it again from the outside is redundant and may conflict with internal wiring.

```html
<!-- 🚫 INCORRECT -->
<mds-card>
  <mds-card-header slot="header">...</mds-card-header>
  <mds-card-content slot="content">...</mds-card-content>
</mds-card>

<!-- ✅ CORRECT -->
<mds-card>
  <mds-card-header>...</mds-card-header>
  <mds-card-content>...</mds-card-content>
</mds-card>
```

#### Do Not Put Media Elements Directly in the `header` Slot

The `header` slot is intended for title and action controls. Placing an `<mds-img>` or `<img>` directly there bypasses the media region's responsive two-column behavior. Use the `media` slot (or `<mds-card-media>`) for images and videos.

```html
<!-- 🚫 INCORRECT -->
<mds-card>
  <mds-card-header>
    <mds-img src="/immagini/banner.jpg"></mds-img>
  </mds-card-header>
</mds-card>

<!-- ✅ CORRECT -->
<mds-card>
  <mds-card-media>
    <mds-img src="/immagini/banner.jpg" class="object-cover"></mds-img>
  </mds-card-media>
  <mds-card-header>
    <mds-text typography="h6">Titolo della scheda</mds-text>
  </mds-card-header>
</mds-card>
```

#### Do Not Override Card Dimensions with Inline Styles

`<mds-card>` manages its own min-height and responsive grid. Overriding `width`, `height`, or `min-height` inline breaks the container-query breakpoints and the proportional media column.

```html
<!-- 🚫 INCORRECT -->
<mds-card style="width: 300px; height: 200px;">
  ...
</mds-card>

<!-- ✅ CORRECT: size the card from a parent container or CSS custom properties -->
<div class="w-[300px]">
  <mds-card>
    ...
  </mds-card>
</div>
```



## Properties

| Property   | Attribute   | Description                                                      | Type      | Default |
| ---------- | ----------- | ---------------------------------------------------------------- | --------- | ------- |
| `autoGrid` | `auto-grid` | Enables automatic responsive behavior based on container queries | `boolean` | `true`  |


## Slots

| Slot        | Description                                                                                                                                                                                                                                                                                |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `"content"` | Add `HTML elements` or `components`, it's responsive behaviour based on container queries is handled with `auto-grid` enabled                                                                                                                                                              |
| `"footer"`  | Add `HTML elements` or `components`, it's responsive behaviour based on container queries is handled with `auto-grid` enabled                                                                                                                                                              |
| `"header"`  | Add `HTML elements` or `components`, it's responsive behaviour based on container queries is handled with `auto-grid` enabled                                                                                                                                                              |
| `"media"`   | Add `HTML elements` or `components`Add `HTML elements` or `components`, it is **recommended** to use `mds-img` element or other component to represent media contents, used for images or videos, it's responsive behaviour based on container queries is handled with `auto-grid` enabled |


## Shadow Parts

| Part       | Description                                       |
| ---------- | ------------------------------------------------- |
| `"layout"` | The layout element that wraps the slotted content |


## CSS Custom Properties

| Name                 | Description                            |
| -------------------- | -------------------------------------- |
| `--mds-card-gap`     | Sets the spacing between card elements |
| `--mds-card-padding` | Sets the spacing around card elements  |


----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
