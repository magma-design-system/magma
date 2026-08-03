# mds-card-footer



This is a web-component from Maggioli Design System [Magma](https://magma.maggiolicloud.it), built with StencilJS, TypeScript, Storybook. It's based on the web-component standard and it's designed to be agnostic from the JavaScript framework you are using.

<!-- Auto Generated Below -->


## Usage

### 1. Description

The `<mds-card-footer>` web component is the footer region of a [`<mds-card>`](../../mds-card), grouping the trailing content of a card (typically actions such as buttons or supplementary metadata) into the card's bottom region.

#### Semantic Behavior

- **Compound child only**: `<mds-card-footer>` must be a direct slot child of `<mds-card>`; it is not used standalone, nor mixed in as a different child type.
- **Self-slotting**: Simply placing it inside `<mds-card>` routes it into the parent's footer region without the author setting the slot manually.
- **Pure layout wrapper**: It has a single default slot and no props, no state, no events, and no ARIA role of its own. It contributes only structural placement, not semantics.
- **Presence affects parent layout**: Including or omitting the footer changes how the card arranges its regions.

#### Slot semantics

This component exposes a single default slot and has no configurable properties. Pass any `text`, `HTML elements`, or other components (commonly `<mds-button>` actions) into the default slot; they will be rendered in the card's footer region. Because layout, alignment, and responsive behavior are owned by the parent `<mds-card>`, the footer's only job is to mark its children as the card's footer content.


### 2. Pattern

Correct and idiomatic ways to use the `<mds-card-footer>` component, ordered from most common to most specialized. Patterns assume a working knowledge of the compound component rules documented in [`docs/COMPONENTS.md`](../../../../../../docs/COMPONENTS.md) and the generic stencil rules in [`projects/stencil/SPEC.md`](../../../../SPEC.md).

#### Action Row Inside a Full Card

The typical use: a card with header, content, and footer regions, the footer holding the primary and secondary actions. Place `<mds-card-footer>` as a direct child of `<mds-card>` - it routes itself to the footer region automatically.

```html
<mds-card>
  <mds-card-header label="Riepilogo pratica"></mds-card-header>
  <mds-card-content>
    <mds-text>Verifica i dati prima di procedere.</mds-text>
  </mds-card-content>
  <mds-card-footer>
    <mds-button label="Annulla" variant="dark" tone="outline"></mds-button>
    <mds-button label="Conferma" variant="primary" tone="strong"></mds-button>
  </mds-card-footer>
</mds-card>
```

#### Single Call-to-Action

A card with only a media region and a footer is a valid minimal composition. The footer carries a lone action.

```html
<mds-card>
  <mds-card-media>
    <mds-img src="/images/documento.jpg" alt="Anteprima documento"></mds-img>
  </mds-card-media>
  <mds-card-footer>
    <mds-button label="Scarica" icon="mi/baseline/download" variant="secondary" tone="weak"></mds-button>
  </mds-card-footer>
</mds-card>
```

#### Destructive Action Pattern

Use a `variant="error"` button for destructive operations. Keep the cancel action to the left and the destructive action to the right - the footer's `justify-content: flex-end` naturally aligns both.

```html
<mds-card>
  <mds-card-header label="Elimina archivio"></mds-card-header>
  <mds-card-content>
    <mds-text>Questa operazione non puo essere annullata.</mds-text>
  </mds-card-content>
  <mds-card-footer>
    <mds-button label="Annulla" variant="dark" tone="text"></mds-button>
    <mds-button label="Elimina" variant="error" tone="strong"></mds-button>
  </mds-card-footer>
</mds-card>
```

#### Supplementary Metadata Alongside an Action

The default slot accepts any slottable content - mix an informational label with a button when status context belongs at the bottom of the card.

```html
<mds-card>
  <mds-card-header label="Stato richiesta"></mds-card-header>
  <mds-card-footer>
    <mds-badge label="In attesa" variant="warning" tone="weak"></mds-badge>
    <mds-button label="Visualizza dettagli" variant="secondary" tone="outline"></mds-button>
  </mds-card-footer>
</mds-card>
```

#### Explicit `slot` Attribute on a Plain Element

When you prefer a plain `<div>` or need to place a non-`mds-card-*` wrapper in the footer region, set `slot="footer"` explicitly. The outcome is identical - `<mds-card>` maps any element with `slot="footer"` to the footer grid area.

```html
<mds-card>
  <mds-card-header label="Nota operativa"></mds-card-header>
  <div slot="footer" style="display: flex; gap: var(--spacing-300);">
    <mds-button label="Chiudi" variant="dark" tone="outline"></mds-button>
    <mds-button label="Salva nota" variant="primary" tone="strong"></mds-button>
  </div>
</mds-card>
```


### 3. Antipattern

Common incorrect uses of `<mds-card-footer>`. Each entry pairs the wrong form with the right one and a one-line reason. System-wide rules (boolean-as-string, shadow piercing, Tailwind color utilities, raw native event listening) live in [`docs/COMPONENTS.md`](../../../../../../docs/COMPONENTS.md#system-level-anti-patterns) - they apply here too but are not repeated.

#### Do Not Use `<mds-card-footer>` Outside `<mds-card>`

`<mds-card-footer>` self-routes to the `footer` slot of `<mds-card>` via `<Host slot="footer">`. Outside a card it renders as a bare flex row with no visual context and communicates nothing to screen readers.

```html
<!-- 🚫 INCORRECT -->
<mds-card-footer>
  <mds-button label="Conferma" variant="primary"></mds-button>
</mds-card-footer>

<!-- ✅ CORRECT -->
<mds-card>
  <mds-card-footer>
    <mds-button label="Conferma" variant="primary" tone="strong"></mds-button>
  </mds-card-footer>
</mds-card>
```

#### Do Not Assign `slot="footer"` on `<mds-card-footer>` Manually

`<mds-card-footer>` already sets `slot="footer"` on its host via its own render output. Adding it again as an attribute in your markup is redundant and, in some frameworks, results in double-slotting or hydration mismatches.

```html
<!-- 🚫 INCORRECT -->
<mds-card>
  <mds-card-footer slot="footer">
    <mds-button label="Salva" variant="primary"></mds-button>
  </mds-card-footer>
</mds-card>

<!-- ✅ CORRECT -->
<mds-card>
  <mds-card-footer>
    <mds-button label="Salva" variant="primary" tone="strong"></mds-button>
  </mds-card-footer>
</mds-card>
```

#### Do Not Nest `<mds-card-footer>` Inside a Wrapper Element

Compound component children must be direct slot children of the parent - wrapping `<mds-card-footer>` in a `<div>` prevents `<mds-card>` from detecting the footer region and computing the correct grid layout.

```html
<!-- 🚫 INCORRECT -->
<mds-card>
  <div class="azioni">
    <mds-card-footer>
      <mds-button label="Annulla" variant="dark"></mds-button>
    </mds-card-footer>
  </div>
</mds-card>

<!-- ✅ CORRECT -->
<mds-card>
  <mds-card-footer>
    <mds-button label="Annulla" variant="dark" tone="outline"></mds-button>
  </mds-card-footer>
</mds-card>
```

#### Do Not Place Multiple `<mds-card-footer>` in One Card

`<mds-card>` maps all children with the footer tag to the same grid area; multiple footers stack or overlap unpredictably. Consolidate all footer content into a single `<mds-card-footer>`.

```html
<!-- 🚫 INCORRECT -->
<mds-card>
  <mds-card-footer>
    <mds-button label="Annulla" variant="dark"></mds-button>
  </mds-card-footer>
  <mds-card-footer>
    <mds-button label="Conferma" variant="primary"></mds-button>
  </mds-card-footer>
</mds-card>

<!-- ✅ CORRECT -->
<mds-card>
  <mds-card-footer>
    <mds-button label="Annulla" variant="dark" tone="outline"></mds-button>
    <mds-button label="Conferma" variant="primary" tone="strong"></mds-button>
  </mds-card-footer>
</mds-card>
```

#### Do Not Override Footer Layout via Inline Styles or Undocumented Selectors

`<mds-card-footer>` owns its internal flex layout (alignment, gap, padding). Overriding it with inline `style` or by targeting shadow internals breaks theme consistency and couples code to implementation details. If the parent card's spacing must change, use `<mds-card>`'s documented `--mds-card-gap` and `--mds-card-padding` custom properties on the card host.

```html
<!-- 🚫 INCORRECT -->
<mds-card-footer style="justify-content: flex-start; padding: 0;">
  <mds-button label="Salva" variant="primary"></mds-button>
</mds-card-footer>

<!-- ✅ CORRECT -->
<mds-card style="--mds-card-padding: var(--spacing-400);">
  <mds-card-footer>
    <mds-button label="Salva" variant="primary" tone="strong"></mds-button>
  </mds-card-footer>
</mds-card>
```



## Slots

| Slot | Description                                                      |
| ---- | ---------------------------------------------------------------- |
|      | Add `text string`, `HTML elements` or `components` to this slot. |


----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
