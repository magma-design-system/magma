# mds-zero



This is a web-component from Maggioli Design System [Magma](https://magma.maggiolicloud.it), built with StencilJS, TypeScript, Storybook. It's based on the web-component standard and it's designed to be agnostic from the JavaScript framework you are using.

<!-- Auto Generated Below -->


## Usage

### 1. Description

The `<mds-zero>` web component is the empty-state (zero-data) panel of the Magma Design System: a centered, vertically stacked layout that pairs an illustration, explanatory copy, and a call-to-action to guide users when a list, search, or section has no content to show. It is a pure structural container with no props - composition happens entirely through its slots.

#### Semantic Behavior

- **Three-zone layout**: The host stacks its content vertically and centered - the default slot (the visual) on top, the `content` zone in the middle, and the `action` zone in a footer at the bottom.
- **Default slot is the visual**: The unnamed default slot holds the illustration or image; it is meant for an `mds-img`/`img`, not text.
- **Content zone is centered text**: The `content` slot is centered and constrained by a max-width, so headings and descriptions read as a focused message block.
- **Action zone auto-centers children**: Elements placed in `slot="action"` are horizontally centered within the footer, so a single primary button sits centered by default.
- **Themed surface**: The host renders a neutral rounded surface that picks up theme, contrast, and reduced-motion preferences.

#### Properties & Visual Configurations

`<mds-zero>` exposes no props; all configuration is done through slot composition and one CSS custom property.

- **`content` vs. `action` slots**: Put the message (title + description, typically `mds-text`) in `slot="content"`, and the recovery action (typically a single `mds-button`) in `slot="action"`. Use the default slot only for the illustration.
- **`--mds-zero-contents-max-width`**: Caps the width of the centered text block (default `400px`) so long descriptions wrap into a balanced column rather than spanning the full panel.

The `contents` and `actions` shadow parts expose the two wrapper zones for consumers that need to override their layout from outside the shadow boundary.


### 2. Pattern

Correct and idiomatic ways to use the `<mds-zero>` component, ordered from most common to most specialized. Patterns assume a working knowledge of the slot model documented in [`docs/COMPONENTS.md`](../../../../../../docs/COMPONENTS.md) and the generic stencil rules in [`projects/stencil/SPEC.md`](../../../../SPEC.md).

#### Full Empty-State Panel

The canonical form. Pair an illustration in the default slot with a heading and description in `slot="content"`, then provide a recovery action in `slot="action"`.

```html
<mds-zero>
  <mds-img src="./assets/illustrations/empty-list.svg" />
  <mds-text typography="h5" slot="content">Nessun elemento trovato</mds-text>
  <mds-text typography="detail" slot="content">
    Non ci sono elementi che corrispondono alla tua ricerca.
    Modifica i filtri o crea un nuovo elemento.
  </mds-text>
  <mds-button
    slot="action"
    label="Crea elemento"
    variant="primary"
    tone="strong"
    size="lg"
  ></mds-button>
</mds-zero>
```

#### Illustration Only (No Action)

When there is no meaningful recovery action, omit `slot="action"` entirely. The action zone collapses cleanly.

```html
<mds-zero>
  <mds-img src="./assets/illustrations/no-results.svg" />
  <mds-text typography="h5" slot="content">Nessun risultato</mds-text>
  <mds-text typography="detail" slot="content">
    Prova a modificare i criteri di ricerca per trovare cio che cerchi.
  </mds-text>
</mds-zero>
```

#### Message Without Illustration

When no illustration asset is available, omit the default slot. The component stacks the content and action zones directly.

```html
<mds-zero>
  <mds-text typography="h5" slot="content">La cartella e vuota</mds-text>
  <mds-text typography="detail" slot="content">
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

When two peer actions are offered - for example a primary and a secondary CTA - place both `<mds-button>` elements in `slot="action"`. The action zone centers and spaces them automatically.

```html
<mds-zero>
  <mds-img src="./assets/illustrations/empty-inbox.svg" />
  <mds-text typography="h5" slot="content">Nessun messaggio</mds-text>
  <mds-text typography="detail" slot="content">
    La tua casella e vuota. Inizia una nuova conversazione o invita i tuoi colleghi.
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
    variant="secondary"
    tone="outline"
  ></mds-button>
</mds-zero>
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


### 3. Antipattern

Common incorrect uses of `<mds-zero>`. Each entry pairs the wrong form with the right one and a one-line reason. System-wide rules (boolean-as-string, shadow piercing, Tailwind color utilities, raw native event listening) live in [`docs/COMPONENTS.md`](../../../../../../docs/COMPONENTS.md#system-level-anti-patterns) - they apply here too but are not repeated.

#### Do Not Put Text in the Default Slot

The default slot is reserved for the illustration or image. Text placed there is not constrained by the `contents` max-width, is not centered consistently, and falls outside the structured three-zone layout. Put headings and descriptions in `slot="content"`.

```html
<!-- 🚫 INCORRECT -->
<mds-zero>
  <mds-text typography="h5">Nessun elemento</mds-text>
  <mds-text typography="detail">Crea il primo elemento per iniziare.</mds-text>
</mds-zero>

<!-- ✅ CORRECT -->
<mds-zero>
  <mds-text typography="h5" slot="content">Nessun elemento</mds-text>
  <mds-text typography="detail" slot="content">Crea il primo elemento per iniziare.</mds-text>
</mds-zero>
```

#### Do Not Put the Illustration in `slot="content"`

Placing an image or `<mds-img>` inside `slot="content"` wraps it in the max-width-constrained, centered-text zone. The default slot renders above that zone with full layout freedom and is the correct home for illustrations.

```html
<!-- 🚫 INCORRECT -->
<mds-zero>
  <mds-img src="./assets/illustrations/empty.svg" slot="content" />
  <mds-text typography="h5" slot="content">Nessun documento</mds-text>
</mds-zero>

<!-- ✅ CORRECT -->
<mds-zero>
  <mds-img src="./assets/illustrations/empty.svg" />
  <mds-text typography="h5" slot="content">Nessun documento</mds-text>
</mds-zero>
```

#### Do Not Put the CTA in `slot="content"`

A button placed in `slot="content"` ends up inside the centered-text block rather than the footer zone; it loses the auto-centering and the correct spacing the `actions` zone provides. Use `slot="action"` for any interactive control.

```html
<!-- 🚫 INCORRECT -->
<mds-zero>
  <mds-img src="./assets/illustrations/empty.svg" />
  <mds-text typography="h5" slot="content">Nessun progetto</mds-text>
  <mds-button label="Nuovo progetto" variant="primary" slot="content"></mds-button>
</mds-zero>

<!-- ✅ CORRECT -->
<mds-zero>
  <mds-img src="./assets/illustrations/empty.svg" />
  <mds-text typography="h5" slot="content">Nessun progetto</mds-text>
  <mds-button label="Nuovo progetto" variant="primary" slot="action"></mds-button>
</mds-zero>
```

#### Do Not Use a Raw `<button>` or `<a>` in the Action Slot

The action slot is designed for `<mds-button>`. A raw `<button>` or `<a>` will not inherit Magma theming, focus styles, or size tokens. Use `<mds-button>` with `href` if link behavior is needed.

```html
<!-- 🚫 INCORRECT -->
<mds-zero>
  <mds-img src="./assets/illustrations/empty.svg" />
  <mds-text typography="h5" slot="content">Nessun report</mds-text>
  <button slot="action" class="btn-primary">Crea report</button>
</mds-zero>

<!-- ✅ CORRECT -->
<mds-zero>
  <mds-img src="./assets/illustrations/empty.svg" />
  <mds-text typography="h5" slot="content">Nessun report</mds-text>
  <mds-button slot="action" label="Crea report" variant="primary" tone="strong"></mds-button>
</mds-zero>
```

#### Do Not Pierce Shadow DOM to Style Internal Zones

`::part(contents)` and `::part(actions)` are the documented customization surface for the wrapper zones. Do not target internal class names (`.contents`, `.actions`) via `>>>` or `/deep/` - those are implementation details that can change without notice.

```css
/* 🚫 INCORRECT */
mds-zero >>> .contents {
  max-width: 600px;
}

/* ✅ CORRECT */
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
| `"action"`  | Add `HTML elements` or `components`, it is **recommended** to use `mds-button` element.                    |
| `"content"` | Put text elements here,                                                                                    |
| `"default"` | Add `HTML elements` or `components` to this slot, it is **recommended** to use `mds-img` or `img` element. |


## Shadow Parts

| Part         | Description                                                          |
| ------------ | -------------------------------------------------------------------- |
| `"actions"`  | Selects the wrapper of the elements with attribute `slot="action"`.  |
| `"contents"` | Selects the wrapper of the elements with attribute `slot="content"`. |


## CSS Custom Properties

| Name                            | Description                                                         |
| ------------------------------- | ------------------------------------------------------------------- |
| `--mds-zero-contents-max-width` | Set if the contents has a max width to be centered in the component |


----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
