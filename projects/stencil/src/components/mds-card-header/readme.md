# mds-card-header



This is a web-component from Maggioli Design System [Magma](https://magma.maggiolicloud.it), built with StencilJS, TypeScript, Storybook. It's based on the web-component standard and it's designed to be agnostic from the JavaScript framework you are using.

<!-- Auto Generated Below -->


## Usage

### 1. Description

The `<mds-card-header>` web component is the header region of a [`<mds-card>`](../../mds-card), grouping the card's title, supporting text, and optional inline actions. It carries no styling of its own beyond layout: its job is to occupy the parent card's `header` region and arrange its content alongside any action controls.

#### Semantic Behavior

- **Compound child only**: `<mds-card-header>` must be placed as a direct child of `<mds-card>`; it is not used standalone, and a card expects at most one header alongside its sibling card regions (`mds-card-media`, `mds-card-content`, `mds-card-footer`), not mixed with arbitrary elements.
- **Self-slotting into the parent**: It automatically lands in the card's `header` region without the author setting any `slot` attribute, and its presence is factored into the card's responsive layout.
- **Action slot presence**: The dedicated actions wrapper is rendered only when a direct child assigned to the `action` slot exists, so a header without actions produces no empty action container.
- **No role/ARIA of its own**: It exposes no implicit role, state, or events; it is a passive layout grouping.

#### Properties & Visual Configurations

`<mds-card-header>` has no configurable properties - it is a pure layout child driven entirely by its two slots:

- **Default (unnamed) slot**: Holds the primary header content (title text, HTML, or components such as a heading element).
- **`action` slot**: Holds inline action controls, rendered in a separate region next to the header content; `mds-button` is the recommended element here. Provide content to this slot only when the header needs actions, since the wrapper is conditional on its presence.


### 2. Pattern

Correct and idiomatic ways to use the `<mds-card-header>` component, ordered from most common to most specialized. Patterns assume a working knowledge of the variant / tone ladders documented in [`docs/COMPONENTS.md`](../../../../../../docs/COMPONENTS.md) and the generic stencil rules in [`projects/stencil/SPEC.md`](../../../../SPEC.md).

#### Plain Title in the Default Slot

The most common use: pass heading text (or a heading element) into the default slot to set the card's title. The header arranges it in the card's top region automatically.

```html
<mds-card>
  <mds-card-header>
    <mds-text typography="h5">Dettagli account</mds-text>
  </mds-card-header>
  <mds-card-content>
    <mds-text>Contenuto principale della card.</mds-text>
  </mds-card-content>
</mds-card>
```

#### Header with Inline Action

Place one or more `<mds-button>` elements in the `action` slot when the header needs an inline control. The actions wrapper is only rendered when at least one element is assigned to this slot - omit the slot entirely when no actions are needed.

```html
<mds-card>
  <mds-card-header>
    <mds-text typography="h5">Impostazioni notifiche</mds-text>
    <mds-button
      slot="action"
      icon="mi/baseline/edit"
      aria-label="Modifica impostazioni"
      variant="secondary"
      tone="text"
    ></mds-button>
  </mds-card-header>
  <mds-card-content>
    <mds-text>Gestisci le preferenze di notifica.</mds-text>
  </mds-card-content>
</mds-card>
```

#### Header with Multiple Actions

Add multiple elements to the `action` slot when several inline controls are needed. They are rendered in the single actions region next to the header content.

```html
<mds-card>
  <mds-card-header>
    <mds-text typography="h5">Documento di progetto</mds-text>
    <mds-button
      slot="action"
      label="Modifica"
      icon="mi/baseline/edit"
      variant="primary"
      tone="outline"
    ></mds-button>
    <mds-button
      slot="action"
      icon="mi/baseline/delete"
      aria-label="Elimina documento"
      variant="error"
      tone="text"
    ></mds-button>
  </mds-card-header>
  <mds-card-content>
    <mds-text>Specifiche tecniche rev. 3.</mds-text>
  </mds-card-content>
</mds-card>
```

#### Header with Supporting Text

Pass additional descriptive text below the title by adding a second element to the default slot. The header lays both out as a single flex column.

```html
<mds-card>
  <mds-card-header>
    <mds-text typography="h5">Report mensile</mds-text>
    <mds-text typography="caption">Aggiornato il 1 giugno 2026</mds-text>
  </mds-card-header>
  <mds-card-content>
    <mds-text>Riepilogo delle attivita del mese.</mds-text>
  </mds-card-content>
</mds-card>
```

#### Full Card Composition

`<mds-card-header>` is designed to compose with the other card sub-parts. Each sub-part self-slots into its region; the card infers which regions are present and adjusts its layout accordingly.

```html
<mds-card>
  <mds-card-media>
    <mds-img src="/images/copertina.jpg" alt="Copertina articolo"></mds-img>
  </mds-card-media>
  <mds-card-header>
    <mds-text typography="h4">Novita dal team</mds-text>
    <mds-button
      slot="action"
      icon="mi/baseline/share"
      aria-label="Condividi"
      variant="secondary"
      tone="text"
    ></mds-button>
  </mds-card-header>
  <mds-card-content>
    <mds-text>Aggiornamenti sul rilascio di Magma 3.0.</mds-text>
  </mds-card-content>
  <mds-card-footer>
    <mds-button label="Leggi di piu" variant="primary" tone="strong"></mds-button>
  </mds-card-footer>
</mds-card>
```

#### Header Without a Title - Using the Action Slot Alone

When the card header exists only to host action controls and carries no title text, leave the default slot empty and place the controls in the `action` slot. The component renders just the actions container.

```html
<mds-card>
  <mds-card-header>
    <mds-button
      slot="action"
      icon="mi/baseline/more-vert"
      aria-label="Altre opzioni"
      variant="dark"
      tone="text"
    ></mds-button>
  </mds-card-header>
  <mds-card-content>
    <mds-text>Scheda con solo azione nell'intestazione.</mds-text>
  </mds-card-content>
</mds-card>
```


### 3. Antipattern

Common incorrect uses of `<mds-card-header>`. Each entry pairs the wrong form with the right one and a one-line reason. System-wide rules (boolean-as-string, shadow piercing, Tailwind color utilities, raw native event listening) live in [`docs/COMPONENTS.md`](../../../../../../docs/COMPONENTS.md#system-level-anti-patterns) - they apply here too but are not repeated.

#### Do Not Use `<mds-card-header>` Outside `<mds-card>`

`<mds-card-header>` is a compound child; it must be a direct child of `<mds-card>`. Using it standalone renders nothing useful - the host card's slot plumbing drives all layout.

```html
<!-- 🚫 INCORRECT -->
<mds-card-header>
  <mds-text typography="h5">Titolo</mds-text>
</mds-card-header>

<!-- ✅ CORRECT -->
<mds-card>
  <mds-card-header>
    <mds-text typography="h5">Titolo</mds-text>
  </mds-card-header>
</mds-card>
```

#### Do Not Set `slot="header"` Manually on `<mds-card-header>`

The component sets its own `slot="header"` in its `render()` host binding. Adding the attribute again on the element in the light DOM is redundant and can cause double-slotting in some framework renders.

```html
<!-- 🚫 INCORRECT -->
<mds-card>
  <mds-card-header slot="header">
    <mds-text typography="h5">Titolo</mds-text>
  </mds-card-header>
</mds-card>

<!-- ✅ CORRECT -->
<mds-card>
  <mds-card-header>
    <mds-text typography="h5">Titolo</mds-text>
  </mds-card-header>
</mds-card>
```

#### Do Not Put Action Controls in the Default Slot

`<mds-button>` and other action controls belong in the `action` named slot, not in the default slot. Placing them in the default slot breaks the layout - no actions wrapper is created, and the controls appear inline with title text rather than aligned to the far end.

```html
<!-- 🚫 INCORRECT -->
<mds-card>
  <mds-card-header>
    <mds-text typography="h5">Rapporto annuale</mds-text>
    <mds-button label="Modifica" variant="primary"></mds-button>
  </mds-card-header>
</mds-card>

<!-- ✅ CORRECT -->
<mds-card>
  <mds-card-header>
    <mds-text typography="h5">Rapporto annuale</mds-text>
    <mds-button slot="action" label="Modifica" variant="primary" tone="outline"></mds-button>
  </mds-card-header>
</mds-card>
```

#### Do Not Use a Raw `<div>` as the Card Header Instead of `<mds-card-header>`

Using a plain `<div slot="header">` bypasses the component's conditional action wrapper, its shadow layout, and the parent's compound-child detection. The component also ensures correct alignment and spacing between title and actions.

```html
<!-- 🚫 INCORRECT -->
<mds-card>
  <div slot="header">
    <h5>Riepilogo ordini</h5>
    <button>Modifica</button>
  </div>
</mds-card>

<!-- ✅ CORRECT -->
<mds-card>
  <mds-card-header>
    <mds-text typography="h5">Riepilogo ordini</mds-text>
    <mds-button slot="action" label="Modifica" variant="primary" tone="outline"></mds-button>
  </mds-card-header>
</mds-card>
```

#### Do Not Invent a Custom `slot` Name on Children of `<mds-card-header>`

`<mds-card-header>` exposes exactly two slots: the default (unnamed) slot and `action`. Assigning any other slot name silently discards the element.

```html
<!-- 🚫 INCORRECT -->
<mds-card>
  <mds-card-header>
    <mds-text typography="h5">Dashboard</mds-text>
    <mds-button slot="actions" label="Aggiungi" variant="primary"></mds-button>
  </mds-card-header>
</mds-card>

<!-- ✅ CORRECT -->
<mds-card>
  <mds-card-header>
    <mds-text typography="h5">Dashboard</mds-text>
    <mds-button slot="action" label="Aggiungi" variant="primary" tone="strong"></mds-button>
  </mds-card-header>
</mds-card>
```



## Slots

| Slot       | Description                                                                             |
| ---------- | --------------------------------------------------------------------------------------- |
|            | Add `text string`, `HTML elements` or `components` to this slot.                        |
| `"action"` | Add `HTML elements` or `components`, it is **recommended** to use `mds-button` element. |


----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
