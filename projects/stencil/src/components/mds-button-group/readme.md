# mds-button-group



<!-- Auto Generated Below -->


## Usage

### 1. Description

The `<mds-button-group>` web component is a layout container of the Magma Design System that clusters related `<mds-button>` controls into a single, evenly-spaced horizontal group such as toolbars, action bars, or segmented sets of actions. It is a presentation-only wrapper with no props, events, or state - its sole job is to arrange its slotted children consistently.

#### Semantic Behavior

- **Default slot is content**: Whatever buttons (or button-like controls) you place inside are projected in source order. The group joins its `<mds-button>` / `<mds-button-dropdown>` members: it flattens their inner corners and sets them 2px apart, so only the outer corners of the cluster stay rounded.
- **Inline layout**: The group shrinks to fit its content with consistent spacing and stays inline with surrounding elements rather than spanning the full row width.
- **No own semantics**: It exposes no role, ARIA attributes, form association, focus management, or keyboard handling of its own - accessibility and interaction live entirely in the slotted children. It is purely a visual grouping primitive.

#### Properties & Visual Configurations

This component has no configurable properties. Visual outcome is determined entirely by the slotted children - typically a set of `<mds-button>` elements sharing a common `variant` / `tone` (see the shared ladder in [`docs/agents/variants.md`](../../../../../../docs/agents/variants.md)) so the group reads as a cohesive cluster of actions.


### 2. Pattern

Correct and idiomatic ways to use the `<mds-button-group>` component, ordered from most common to most specialized. Patterns assume a working knowledge of the shared component rules in [`docs/agents/conventions.md`](../../../../../../docs/agents/conventions.md).

#### Toolbar of Icon-Only Actions

The primary use case. Group icon-only `<mds-button>` elements that act on the same target - a text selection, a table row, or an editor surface. Each button must carry an explicit `aria-label` because no visible label is present.

```html
<mds-button-group>
  <mds-button icon="mi/baseline/format-bold" aria-label="Grassetto" variant="dark" tone="text"></mds-button>
  <mds-button icon="mi/baseline/format-italic" aria-label="Corsivo" variant="dark" tone="text"></mds-button>
  <mds-button icon="mi/baseline/format-underlined" aria-label="Sottolineato" variant="dark" tone="text"></mds-button>
</mds-button-group>
```

#### Segmented Set of Labelled Actions

Use labelled buttons when the actions benefit from visible text - for example a primary / secondary / destructive trio at the bottom of a form section.

```html
<mds-button-group>
  <mds-button label="Salva" variant="primary" tone="strong"></mds-button>
  <mds-button label="Annulla" variant="dark" tone="outline"></mds-button>
</mds-button-group>
```

#### Mixed Emphasis Within a Group

Pair a high-emphasis primary button with lower-emphasis supporting actions. Keep the same `variant` family and vary only the `tone` so the group reads as a cohesive cluster, not a random set of buttons.

```html
<mds-button-group>
  <mds-button label="Pubblica" variant="primary" tone="strong"></mds-button>
  <mds-button label="Salva come bozza" variant="primary" tone="outline"></mds-button>
  <mds-button label="Elimina" variant="error" tone="text"></mds-button>
</mds-button-group>
```

#### Inside a Toolbar or Action Bar

`<mds-button-group>` is `inline-flex` by default, so multiple groups sit naturally beside other inline controls in a toolbar without extra CSS.

```html
<div class="toolbar">
  <mds-button-group>
    <mds-button icon="mi/baseline/undo" aria-label="Annulla" variant="dark" tone="text"></mds-button>
    <mds-button icon="mi/baseline/redo" aria-label="Ripristina" variant="dark" tone="text"></mds-button>
  </mds-button-group>

  <mds-button-group>
    <mds-button icon="mi/baseline/format-bold" aria-label="Grassetto" variant="dark" tone="text"></mds-button>
    <mds-button icon="mi/baseline/format-italic" aria-label="Corsivo" variant="dark" tone="text"></mds-button>
    <mds-button icon="mi/baseline/format-underlined" aria-label="Sottolineato" variant="dark" tone="text"></mds-button>
  </mds-button-group>
</div>
```

#### Including a `<mds-button-dropdown>` in the Group

The default slot accepts any `<mds-button>` or `<mds-button-dropdown>` sibling component. Place the dropdown last or first depending on visual priority.

```html
<mds-button-group>
  <mds-button label="Esporta CSV" variant="primary" tone="weak"></mds-button>
  <mds-button-dropdown label="Altre opzioni" variant="primary" tone="weak">
    <mds-button variant="dark" tone="text" label="Esporta PDF"></mds-button>
    <mds-button variant="dark" tone="text" label="Esporta Excel"></mds-button>
  </mds-button-dropdown>
</mds-button-group>
```

#### Disabled Buttons Inside a Group

Disable individual buttons with the `disabled` boolean attribute. Never use `disabled="false"` - remove the attribute to re-enable. The group itself has no `disabled` prop.

```html
<mds-button-group>
  <mds-button label="Approva" variant="success" tone="strong"></mds-button>
  <mds-button label="Rifiuta" variant="error" tone="outline" disabled></mds-button>
</mds-button-group>
```


### 3. Antipattern

Common incorrect uses of `<mds-button-group>`. Each entry pairs the wrong form with the right one and a one-line reason. System-wide rules (boolean-as-string, shadow piercing, Tailwind color utilities, raw native event listening) live in [`docs/agents/anti-patterns.md`](../../../../../../docs/agents/anti-patterns.md) - they apply here too but are not repeated.

#### Do Not Nest Raw `<button>` Elements Inside the Group

The group is part of the Magma component system and is designed to host `<mds-button>` (and sibling `mds-*` action) components. Raw `<button>` elements bypass theming, focus styles, and accessibility defaults.

```html
<!-- INCORRECT -->
<mds-button-group>
  <button class="btn">Salva</button>
  <button class="btn">Annulla</button>
</mds-button-group>

<!-- CORRECT -->
<mds-button-group>
  <mds-button label="Salva" variant="primary" tone="strong"></mds-button>
  <mds-button label="Annulla" variant="dark" tone="outline"></mds-button>
</mds-button-group>
```

#### Do Not Wrap the Group in an Anchor

`<mds-button-group>` contains interactive controls; nesting the whole group inside `<a>` creates nested interactives, breaks keyboard semantics, and fails accessibility audits. Use the `href` prop on individual `<mds-button>` elements instead.

```html
<!-- INCORRECT -->
<a href="/azioni">
  <mds-button-group>
    <mds-button label="Vai" variant="primary"></mds-button>
  </mds-button-group>
</a>

<!-- CORRECT -->
<mds-button-group>
  <mds-button label="Vai" href="/azioni" variant="primary"></mds-button>
</mds-button-group>
```

#### Do Not Omit `aria-label` on Icon-Only Buttons Inside a Group

Grouping icon-only buttons does not remove the requirement for an accessible name on each child. Without it `mds-button` falls back to the last segment of the icon slug ("undo"), which names the icon, not the action.

```html
<!-- INCORRECT -->
<mds-button-group>
  <mds-button icon="mi/baseline/undo" variant="dark" tone="text"></mds-button>
  <mds-button icon="mi/baseline/redo" variant="dark" tone="text"></mds-button>
</mds-button-group>

<!-- CORRECT -->
<mds-button-group>
  <mds-button icon="mi/baseline/undo" aria-label="Annulla" variant="dark" tone="text"></mds-button>
  <mds-button icon="mi/baseline/redo" aria-label="Ripristina" variant="dark" tone="text"></mds-button>
</mds-button-group>
```

#### Do Not Nest `<mds-button-group>` Inside Another Group

The component is a flat layout primitive; nesting groups creates redundant flex containers that break the consistent spacing and group visual coherence. Keep the hierarchy flat.

```html
<!-- INCORRECT -->
<mds-button-group>
  <mds-button-group>
    <mds-button label="Salva" variant="primary" tone="strong"></mds-button>
    <mds-button label="Bozza" variant="primary" tone="outline"></mds-button>
  </mds-button-group>
  <mds-button label="Annulla" variant="dark" tone="text"></mds-button>
</mds-button-group>

<!-- CORRECT -->
<mds-button-group>
  <mds-button label="Salva" variant="primary" tone="strong"></mds-button>
  <mds-button label="Bozza" variant="primary" tone="outline"></mds-button>
  <mds-button label="Annulla" variant="dark" tone="text"></mds-button>
</mds-button-group>
```

#### Do Not Override Spacing with Inline Styles

The component manages its own gap via a design-token-backed CSS value. Setting inline `gap`, `margin`, or `padding` on the host or child buttons breaks the token contract and may produce inconsistent spacing across themes.

```css
/* INCORRECT */
mds-button-group {
  gap: 16px;
}
mds-button-group mds-button {
  margin-right: 8px;
}

/* CORRECT - let the component handle spacing; style only what it exposes */
mds-button-group {
  /* no gap or margin overrides needed */
}
```



## Slots

| Slot | Description                                                      |
| ---- | ---------------------------------------------------------------- |
|      | Add `mds-button` or `mds-button-dropdown` elements to this slot. |


----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
