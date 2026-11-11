# mds-zero



This is a web-component from Maggioli Design System [Magma](https://magma.maggiolicloud.it), built with StencilJS, TypeScript, Storybook. It's based on the web-component standard and it's designed to be agnostic from the JavaScript framework you are using.

<!-- Auto Generated Below -->


## Usage

### 1. Description

The `<mds-zero>` web component is the empty-state (zero-data) panel of the Magma Design System: a centered, vertically stacked layout that pairs an illustration, explanatory copy, and a call-to-action to guide users when a list, search, or section has no content to show. It is a pure structural container with no props - composition happens entirely through its slots.

#### Semantic Behavior

- **Three-zone layout**: The host stacks its content vertically and centered - the default slot (the visual) on top, the `content` zone in the middle, and the `action` zone in a footer at the bottom - with `--magma-rhythm-content-actions` (600) between the zones.
- **One inset, shared by the zones**: The host pads its zones once, with `--magma-rhythm-inset` (600) on every side, the inset of a container of a part (`rhythm/inset`, `rhythm/shared-inset` in the design language). With no action the footer takes no room, so the inset stays the same at the bottom.
- **Default slot is the visual**: The unnamed default slot holds the illustration or image; it is meant for an `mds-img`/`img`, not text.
- **Content zone is centered text**: The `content` slot is centered, constrained by a max-width, and sets its children `--magma-rhythm-title-content` (300) apart, so a title and its description read as one message with no wrapper of yours (`rhythm/title-content`).
- **Action zone auto-centers children**: Elements placed in `slot="action"` are horizontally centered within the footer, `--magma-rhythm-inline` (300) apart, so a single primary button sits centered by default.
- **A muted surface**: The host paints `--magma-surface-muted`, a step under the page in light and in dark, on the plane where the items would stand; it needs no dark correction, and it picks up the contrast (a ring) and reduced-motion preferences.

#### Properties & Visual Configurations

`<mds-zero>` exposes no props; all configuration is done through slot composition and one CSS custom property.

- **`content` vs. `action` slots**: Put the message in `slot="content"`: a title by its role, `mds-text typography="part"` with the `tag` of its place in the outline (`h2` under the title of the page, `h3` in a section, `h1` with `typography="page"` when the panel takes the place of the page), then the description in `typography="detail"`. Put the recovery action (typically a single `mds-button`) in `slot="action"`. Use the default slot only for the illustration.
- **`--mds-zero-contents-max-width`**: Caps the width of the centered text block (default `400px`) so long descriptions wrap into a balanced column rather than spanning the full panel.

The `contents` and `actions` shadow parts expose the two wrapper zones for consumers that need to override their layout from outside the shadow boundary.


### 2. Examples

Correct and idiomatic ways to use the `<mds-zero>` component, ordered from most common to most specialized. The examples assume a working knowledge of the shared component rules in [`docs/agents/conventions.md`](../../../../../../docs/agents/conventions.md). Which panel an empty part takes, and what it says, is the pattern `empty-state`.

The title of the panel is written by its role, `typography="part"` (`titles/part` of the design language), with the `tag` of its place in the outline: `h2` under the title of the page, `h3` inside a section. Put the title and the description straight in `slot="content"`: the panel sets them apart itself.

#### Full Empty-State Panel

The canonical form, the first use: an illustration in the default slot, a title and a description in `slot="content"`, and the action that adds the first item in `slot="action"`.

```html
<mds-zero>
  <mds-img src="./assets/illustrations/empty-list.svg" alt=""></mds-img>
  <mds-text typography="part" tag="h2" slot="content">Nessuna delega</mds-text>
  <mds-text typography="detail" tag="p" slot="content">
    Con una delega un familiare o un professionista presenta le richieste a tuo nome.
    Aggiungi la prima per iniziare.
  </mds-text>
  <mds-button
    slot="action"
    label="Nuova delega"
    variant="primary"
    tone="strong"
    size="lg"
  ></mds-button>
</mds-zero>
```

#### Filled by Others (No Action)

When the person has nothing to do here, omit `slot="action"` entirely and say who fills the part, and when. The action zone takes no room, so the inset stays the same on every side.

```html
<mds-zero>
  <mds-img src="./assets/illustrations/empty-folder.svg" alt=""></mds-img>
  <mds-text typography="part" tag="h2" slot="content">Nessun documento</mds-text>
  <mds-text typography="detail" tag="p" slot="content">
    L'ufficio anagrafe aggiunge qui i documenti della pratica quando la prende in carico.
  </mds-text>
</mds-zero>
```

#### Message Without Illustration

When no illustration asset is available, omit the default slot. The component stacks the content and action zones directly.

```html
<mds-zero>
  <mds-text typography="part" tag="h2" slot="content">Nessun file</mds-text>
  <mds-text typography="detail" tag="p" slot="content">
    Carica i tuoi file per iniziare a condividerli con il team.
  </mds-text>
  <mds-button
    slot="action"
    label="Carica file"
    icon="mi/baseline/upload"
    variant="primary"
    tone="strong"
  ></mds-button>
</mds-zero>
```

#### Multiple Actions

When two peer actions are offered - for example a primary and a secondary CTA - place both `<mds-button>` elements in `slot="action"`. The action zone centers them and sets them `--magma-rhythm-inline` apart.

```html
<mds-zero>
  <mds-img src="./assets/illustrations/empty-inbox.svg" alt=""></mds-img>
  <mds-text typography="part" tag="h2" slot="content">Nessun messaggio</mds-text>
  <mds-text typography="detail" tag="p" slot="content">
    Inizia una nuova conversazione o invita i tuoi colleghi.
  </mds-text>
  <mds-button
    slot="action"
    label="Nuovo messaggio"
    variant="primary"
    tone="strong"
  ></mds-button>
  <mds-button
    slot="action"
    label="Invita colleghi"
    variant="primary"
    tone="outline"
  ></mds-button>
</mds-zero>
```

#### In Place of a Missing Page

When the panel takes the place of the whole page (the thing asked for does not exist), its title is the title of the page: `typography="page"` with `tag="h1"`, and its action leads back to the list.

```html
<main class="page-frame py-between-sections">
  <mds-zero>
    <mds-text typography="page" tag="h1" slot="content">Richiesta non trovata</mds-text>
    <mds-text typography="detail" tag="p" slot="content">
      La richiesta 2026/0412 non esiste: cercala nell'elenco delle richieste.
    </mds-text>
    <mds-button slot="action" label="Vai alle richieste" href="/richieste"></mds-button>
  </mds-zero>
</main>
```

#### Constraining the Text Block Width

Use `--mds-zero-contents-max-width` when the panel is wide and the default `400px` cap produces too narrow a text column, or when you want a tighter column on a compact layout.

```css
.wide-dashboard mds-zero {
  --mds-zero-contents-max-width: 560px;
}

.compact-sidebar mds-zero {
  --mds-zero-contents-max-width: 280px;
}
```

#### Overriding Zone Layout via Shadow Parts

Use `::part(contents)` or `::part(actions)` only when you need to change the zone's layout itself - for example aligning the content left inside a side-panel context. Prefer `--mds-zero-contents-max-width` for width adjustments.

```css
/* Left-align content for a narrow side panel */
.side-panel mds-zero::part(contents) {
  align-items: flex-start;
  text-align: left;
}
```


### 3. Mistakes

Common incorrect uses of `<mds-zero>`. Each entry pairs the wrong form with the right one and a one-line reason. System-wide rules (boolean-as-string, shadow piercing, Tailwind color utilities, raw native event listening) live in [`docs/agents/mistakes.md`](../../../../../../docs/agents/mistakes.md) - they apply here too but are not repeated.

#### Do Not Put Text in the Default Slot

The default slot is reserved for the illustration or image. Text placed there is not constrained by the `contents` max-width, is not centered consistently, and falls outside the structured three-zone layout. Put headings and descriptions in `slot="content"`.

```html
<!-- INCORRECT -->
<mds-zero>
  <mds-text typography="part" tag="h2">Nessun elemento</mds-text>
  <mds-text typography="detail">Crea il primo elemento per iniziare.</mds-text>
</mds-zero>

<!-- CORRECT -->
<mds-zero>
  <mds-text typography="part" tag="h2" slot="content">Nessun elemento</mds-text>
  <mds-text typography="detail" slot="content">Crea il primo elemento per iniziare.</mds-text>
</mds-zero>
```

#### Do Not Title the Panel by Level

A level picked by its size (`h5`, `h6`) says nothing of what the title names, and its tag follows the style instead of the outline of the page. The title of the panel is a part (`titles/part` of the design language): `typography="part"`, with the `tag` of its place, `h2` under the title of the page, `h3` in a section.

```html
<!-- INCORRECT -->
<mds-zero>
  <mds-text typography="h5" slot="content">Nessuna richiesta da gestire</mds-text>
  <mds-text typography="detail" slot="content">Le nuove arrivano qui appena un cittadino le invia.</mds-text>
</mds-zero>

<!-- CORRECT -->
<mds-zero>
  <mds-text typography="part" tag="h2" slot="content">Nessuna richiesta da gestire</mds-text>
  <mds-text typography="detail" tag="p" slot="content">Le nuove arrivano qui appena un cittadino le invia.</mds-text>
</mds-zero>
```

#### Do Not Wrap the Content to Space It

The content zone already sets its children `--magma-rhythm-title-content` apart. A wrapper with its own gap adds nothing but a second place where the space is decided; put the title and the description straight in `slot="content"`.

```html
<!-- INCORRECT -->
<mds-zero>
  <div slot="content" class="grid gap-title-content">
    <mds-text typography="part" tag="h2">Nessuna delega</mds-text>
    <mds-text typography="detail" tag="p">Aggiungi la prima per iniziare.</mds-text>
  </div>
</mds-zero>

<!-- CORRECT -->
<mds-zero>
  <mds-text typography="part" tag="h2" slot="content">Nessuna delega</mds-text>
  <mds-text typography="detail" tag="p" slot="content">Aggiungi la prima per iniziare.</mds-text>
</mds-zero>
```

#### Do Not Put the Illustration in `slot="content"`

Placing an image or `<mds-img>` inside `slot="content"` wraps it in the max-width-constrained, centered-text zone. The default slot renders above that zone with full layout freedom and is the correct home for illustrations.

```html
<!-- INCORRECT -->
<mds-zero>
  <mds-img src="./assets/illustrations/empty.svg" alt="" slot="content"></mds-img>
  <mds-text typography="part" tag="h2" slot="content">Nessun documento</mds-text>
</mds-zero>

<!-- CORRECT -->
<mds-zero>
  <mds-img src="./assets/illustrations/empty.svg" alt=""></mds-img>
  <mds-text typography="part" tag="h2" slot="content">Nessun documento</mds-text>
</mds-zero>
```

#### Do Not Put the CTA in `slot="content"`

A button placed in `slot="content"` ends up inside the centered-text block rather than the footer zone; it loses the auto-centering and the correct spacing the `actions` zone provides. Use `slot="action"` for any interactive control.

```html
<!-- INCORRECT -->
<mds-zero>
  <mds-img src="./assets/illustrations/empty.svg" alt=""></mds-img>
  <mds-text typography="part" tag="h2" slot="content">Nessun progetto</mds-text>
  <mds-button label="Nuovo progetto" variant="primary" slot="content"></mds-button>
</mds-zero>

<!-- CORRECT -->
<mds-zero>
  <mds-img src="./assets/illustrations/empty.svg" alt=""></mds-img>
  <mds-text typography="part" tag="h2" slot="content">Nessun progetto</mds-text>
  <mds-button label="Nuovo progetto" variant="primary" slot="action"></mds-button>
</mds-zero>
```

#### Do Not Use a Raw `<button>` or `<a>` in the Action Slot

The action slot is designed for `<mds-button>`. A raw `<button>` or `<a>` will not inherit Magma theming, focus styles, or size tokens. Use `<mds-button>` with `href` if link behavior is needed.

```html
<!-- INCORRECT -->
<mds-zero>
  <mds-img src="./assets/illustrations/empty.svg" alt=""></mds-img>
  <mds-text typography="part" tag="h2" slot="content">Nessun report</mds-text>
  <button slot="action" class="btn-primary">Crea report</button>
</mds-zero>

<!-- CORRECT -->
<mds-zero>
  <mds-img src="./assets/illustrations/empty.svg" alt=""></mds-img>
  <mds-text typography="part" tag="h2" slot="content">Nessun report</mds-text>
  <mds-button slot="action" label="Crea report" variant="primary" tone="strong"></mds-button>
</mds-zero>
```

#### Do Not Pierce Shadow DOM to Style Internal Zones

`::part(contents)` and `::part(actions)` are the documented customization surface for the wrapper zones. Do not target internal class names (`.contents`, `.actions`) via `>>>` or `/deep/` - those are implementation details that can change without notice.

```css
/* INCORRECT */
mds-zero >>> .contents {
  max-width: 600px;
}

/* CORRECT */
mds-zero {
  --mds-zero-contents-max-width: 600px;
}
/* or, for layout overrides: */
mds-zero::part(contents) {
  align-items: flex-start;
}
```



## Slots

| Slot        | Description                                                                                                |
| ----------- | ---------------------------------------------------------------------------------------------------------- |
|             | Add `HTML elements` or `components` to this slot, it is **recommended** to use `mds-img` or `img` element. |
| `"action"`  | Add `HTML elements` or `components`, it is **recommended** to use `mds-button` element.                    |
| `"content"` | Put text elements here,                                                                                    |


## Shadow Parts

| Part         | Description                                                          |
| ------------ | -------------------------------------------------------------------- |
| `"actions"`  | Selects the wrapper of the elements with attribute `slot="action"`.  |
| `"contents"` | Selects the wrapper of the elements with attribute `slot="content"`. |


## CSS Custom Properties

| Name                            | Description                                                                 |
| ------------------------------- | --------------------------------------------------------------------------- |
| `--mds-zero-contents-max-width` | Public. Set if the contents has a max width to be centered in the component |


----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
