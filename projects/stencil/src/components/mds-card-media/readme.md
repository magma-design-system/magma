# mds-card-media



This is a web-component from Maggioli Design System [Magma](https://magma.maggiolicloud.it), built with StencilJS, TypeScript, Storybook. It's based on the web-component standard and it's designed to be agnostic from the JavaScript framework you are using.

<!-- Auto Generated Below -->


## Usage

### 1. Description

The `<mds-card-media>` web component is the media region of a [`<mds-card>`](../../mds-card): it wraps an image, video or other visual asset and provides an optional overlay layer for text or controls rendered on top of that asset. It is a layout child with no HTML primitive equivalent - it exists purely to occupy and style the card's `media` region.

#### Semantic Behavior

- **Compound child only**: `<mds-card-media>` is designed to live as a direct child of `<mds-card>` and must not be used standalone or mixed in as a different card region.
- **Self-slotting into the parent**: It lands in the card's `media` region automatically without the author setting any `slot`, and its presence is factored into the card layout.
- **Two-layer composition**: The default slot holds the media asset itself (recommended `mds-img` or another media component), while the named `content` slot overlays that asset, bottom-aligned and centered, so overlay text/actions float in front of the media.
- **No interactive state**: The component holds no props, state, events, ARIA roles or focus behavior of its own - it is a passive presentational wrapper, and any semantics come from the elements slotted into it.

#### Slot semantics and layout role

`<mds-card-media>` exposes no configurable properties; its behavior is entirely defined by its two slots and its position inside the card.

- **default slot**: the media surface. Place the actual visual asset here (an `mds-img`, video, or equivalent component). This layer fills the host.
- **`content` slot**: an overlay layer (exposed as the `content` shadow part) positioned over the media, aligned to the bottom and horizontally centered, intended for captions, titles, or action controls that should appear in front of the media rather than beside it.

The host paints a neutral background, so the media region keeps a defined surface even before its asset loads. For the shared variant/tone system that governs the parent card, see [`projects/stencil/SPEC.md`](../../../../SPEC.md#tone-and-variant-system).


### 2. Pattern

Correct and idiomatic ways to use the `<mds-card-media>` component, ordered from most common to most specialized. Patterns assume a working knowledge of the compound-component rules in [`docs/COMPONENTS.md`](../../../../../../docs/COMPONENTS.md) and the generic stencil rules in [`projects/stencil/SPEC.md`](../../../../SPEC.md).

#### Basic Media Region with `mds-img`

Place `<mds-card-media>` as a direct child of `<mds-card>`. No `slot` attribute is needed - the component self-assigns into the card's `media` region. Put the visual asset in the default slot; `mds-img` is the recommended choice.

```html
<mds-card>
  <mds-card-media>
    <mds-img src="/img/copertina.jpg" alt="Copertina articolo"></mds-img>
  </mds-card-media>
</mds-card>
```

#### Media with an Overlay Caption via the `content` Slot

Use the named `content` slot for text or controls that should float in front of the media asset. The overlay is absolutely positioned over the media, bottom-aligned and horizontally centered.

```html
<mds-card>
  <mds-card-media>
    <mds-img src="/img/evento.jpg" alt="Evento annuale"></mds-img>
    <mds-text slot="content" typography="label">12 giugno 2026</mds-text>
  </mds-card-media>
</mds-card>
```

#### Media with an Overlay Action Control

The `content` slot accepts any element or component. Use it to place a badge, chip, or button on top of the media when the design calls for an interactive overlay.

```html
<mds-card>
  <mds-card-media>
    <mds-img src="/img/prodotto.jpg" alt="Scheda prodotto"></mds-img>
    <mds-badge slot="content" label="Novita'" variant="primary" tone="strong"></mds-badge>
  </mds-card-media>
</mds-card>
```

#### Card with All Regions Composed Together

`<mds-card-media>` composes alongside `mds-card-header`, `mds-card-content`, and `mds-card-footer` inside `mds-card`. Each region self-assigns its slot; the card's `auto-grid` prop drives the responsive layout automatically.

```html
<mds-card>
  <mds-card-media>
    <mds-img src="/img/notizia.jpg" alt="Immagine della notizia"></mds-img>
  </mds-card-media>
  <mds-card-header label="Titolo della notizia"></mds-card-header>
  <mds-card-content>
    <mds-text>Descrizione breve della notizia.</mds-text>
  </mds-card-content>
  <mds-card-footer>
    <mds-button label="Leggi di piu'" variant="primary" tone="text"></mds-button>
  </mds-card-footer>
</mds-card>
```

#### Video in the Default Slot

The default slot accepts any media element or component. Use a native `<video>` when the design calls for motion content rather than a still image.

```html
<mds-card>
  <mds-card-media>
    <video src="/media/presentazione.mp4" autoplay muted loop playsinline></video>
  </mds-card-media>
</mds-card>
```

#### Styling the Overlay Part via `::part(content)`

The `content` overlay div is exposed as the `content` shadow part. Use it for layout adjustments that the host's positioning rules do not cover - for example, changing alignment or adding a gradient scrim. Set the style on the host or a parent selector; do not pierce shadow DOM with `>>>` or undocumented class names.

```css
.card-destacada mds-card-media::part(content) {
  align-items: flex-start;
  background: linear-gradient(to top, rgb(var(--tone-neutral-01) / 0.7), transparent);
  padding: var(--spacing-600);
}
```


### 3. Antipattern

Common incorrect uses of `<mds-card-media>`. Each entry pairs the wrong form with the right one and a one-line reason. System-wide rules (boolean-as-string, shadow piercing, Tailwind color utilities, raw native event listening) live in [`docs/COMPONENTS.md`](../../../../../../docs/COMPONENTS.md#system-level-anti-patterns) - they apply here too but are not repeated.

#### Do Not Use `<mds-card-media>` Outside `<mds-card>`

`<mds-card-media>` is a compound child designed to live inside `<mds-card>`. Using it standalone produces unstyled output and breaks the card layout algorithm, which derives its responsive grid from the presence of its region children.

```html
<!-- 🚫 INCORRECT -->
<mds-card-media>
  <mds-img src="/img/foto.jpg" alt="Foto"></mds-img>
</mds-card-media>

<!-- ✅ CORRECT -->
<mds-card>
  <mds-card-media>
    <mds-img src="/img/foto.jpg" alt="Foto"></mds-img>
  </mds-card-media>
</mds-card>
```

#### Do Not Set `slot="media"` Manually

`<mds-card-media>` self-assigns into the card's `media` region via its internal `Host slot="media"`. Adding `slot="media"` on the element is redundant and signals a misunderstanding of the component's self-slotting contract.

```html
<!-- 🚫 INCORRECT -->
<mds-card>
  <mds-card-media slot="media">
    <mds-img src="/img/copertina.jpg" alt="Copertina"></mds-img>
  </mds-card-media>
</mds-card>

<!-- ✅ CORRECT -->
<mds-card>
  <mds-card-media>
    <mds-img src="/img/copertina.jpg" alt="Copertina"></mds-img>
  </mds-card-media>
</mds-card>
```

#### Do Not Put the Overlay Text in the Default Slot

Text or controls that should appear in front of the media must go in the `content` named slot. Content placed in the default slot renders behind or beside the media asset, not as an overlay.

```html
<!-- 🚫 INCORRECT -->
<mds-card>
  <mds-card-media>
    <mds-img src="/img/foto.jpg" alt="Foto"></mds-img>
    <mds-text>Didascalia</mds-text>
  </mds-card-media>
</mds-card>

<!-- ✅ CORRECT -->
<mds-card>
  <mds-card-media>
    <mds-img src="/img/foto.jpg" alt="Foto"></mds-img>
    <mds-text slot="content">Didascalia</mds-text>
  </mds-card-media>
</mds-card>
```

#### Do Not Place `<mds-card-media>` Inside a Wrapper Element

`mds-card` reads its direct children to compute the layout grid. Wrapping `<mds-card-media>` in a `<div>` or any other element hides it from that detection pass and breaks the responsive layout.

```html
<!-- 🚫 INCORRECT -->
<mds-card>
  <div class="media-wrapper">
    <mds-card-media>
      <mds-img src="/img/foto.jpg" alt="Foto"></mds-img>
    </mds-card-media>
  </div>
</mds-card>

<!-- ✅ CORRECT -->
<mds-card>
  <mds-card-media>
    <mds-img src="/img/foto.jpg" alt="Foto"></mds-img>
  </mds-card-media>
</mds-card>
```

#### Do Not Use a Raw `<img>` Instead of `<mds-img>`

Placing a raw `<img>` in the default slot works visually but bypasses the lazy loading, error state, consumption-preference handling, and accessible-name fallback that `mds-img` provides.

```html
<!-- 🚫 INCORRECT -->
<mds-card>
  <mds-card-media>
    <img src="/img/prodotto.jpg" alt="Prodotto">
  </mds-card-media>
</mds-card>

<!-- ✅ CORRECT -->
<mds-card>
  <mds-card-media>
    <mds-img src="/img/prodotto.jpg" alt="Prodotto"></mds-img>
  </mds-card-media>
</mds-card>
```

#### Do Not Pierce Shadow DOM to Style the Overlay Container

The `content` div inside the shadow root is exposed as the `content` shadow part. Use `::part(content)` for style overrides, not `>>>`, `/deep/`, or internal class selectors - the latter couple your code to the implementation and break on minor releases.

```css
/* 🚫 INCORRECT */
mds-card-media >>> .content {
  align-items: flex-start;
}

/* ✅ CORRECT */
mds-card-media::part(content) {
  align-items: flex-start;
}
```



## Slots

| Slot        | Description                                                                                                                                          |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
|             | Add `HTML elements` or `components` to this slot, it is **recommended** to add `mds-img` element or other component which represents media contents. |
| `"content"` | Add `text string`, `HTML elements` or `components` to this slot, contents will be shown in front of the media element.                               |


## Shadow Parts

| Part        | Description |
| ----------- | ----------- |
| `"content"` |             |


----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
