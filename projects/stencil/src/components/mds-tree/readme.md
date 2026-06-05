# mds-tree



<!-- Auto Generated Below -->


## Usage

### 1. Description

The `<mds-tree>` web component is the root container of the Magma Design System tree view, organizing a hierarchy of slotted `<mds-tree-item>` nodes into an expandable/collapsible structure. It owns no visual row of its own: it is a compound parent that configures, stacks, and propagates state to its children.

#### Semantic Behavior

- **Compound parent**: The default slot accepts only `<mds-tree-item>` elements; the tree itself renders nothing but the slot and acts as the configuration and coordination root for the hierarchy.
- **Depth seeding**: Its direct children are assigned `depth = 0`, so each branch can compute its own indentation downward from the root.
- **Cascading `expanded`**: Toggling `expanded` on the tree propagates the new value to every child item, opening or collapsing the whole hierarchy at once - except children marked `async`, which are left for on-demand resolution.
- **Cascading `toggle` and `truncate`**: Changing the toggle icon or the truncation mode on the tree pushes the value down to all descendant items so the whole tree stays visually consistent.
- **Async branches**: When `async` is set, branches are expected to resolve their children after the click rather than expanding from pre-rendered content; such items are excluded from the bulk `expanded` cascade.

#### Properties & Visual Configurations

- **`appearance`** controls whether the depth-indicating branch decorations (connector lines and dots) are drawn: `'depth'` shows the guide lines that visualize nesting; `'none'` removes them for a flat look.
- **`actions`** governs how per-item action controls are surfaced: `'auto'` reveals them on hover, `'visible'` keeps them always shown.
- **`toggle`** selects the expand/collapse glyph for every item - `'chevron'` for a generic disclosure arrow, `'folder'` for a file-explorer metaphor; **`togglePosition`** places that glyph at the `'left'` or `'right'` of the label.

#### Other behavioral props

- **`truncate`** sets how item labels overflow: `'word'` truncates the line, `'all'` clamps to multiple lines (paired with the `--mds-tree-line-clamp` custom property), `'none'` lets text wrap freely.
- **`expanded`** is the only mutable, reflected state prop; set it on the root to open or close the entire tree programmatically.


### 2. Pattern

Correct and idiomatic ways to use the `<mds-tree>` component, ordered from most common to most specialized. Patterns assume a working knowledge of the compound rules documented in [`docs/COMPONENTS.md`](../../../../../../docs/COMPONENTS.md) and the generic stencil rules in [`projects/stencil/SPEC.md`](../../../../SPEC.md).

#### Minimal Flat List

The simplest usage: a list of root-level nodes with no nesting. Every `<mds-tree-item>` must be a direct child of `<mds-tree>`.

```html
<mds-tree>
  <mds-tree-item label="Bacheca"></mds-tree-item>
  <mds-tree-item label="Documenti"></mds-tree-item>
  <mds-tree-item label="Impostazioni"></mds-tree-item>
</mds-tree>
```

#### Nested Hierarchy

Place `<mds-tree-item>` elements inside other `<mds-tree-item>` elements to build depth. The tree seeds `depth = 0` on direct children and each nested item computes its own indentation downward.

```html
<mds-tree>
  <mds-tree-item label="Direzione generale">
    <mds-tree-item label="Segreteria">
      <mds-tree-item label="Protocollo"></mds-tree-item>
      <mds-tree-item label="Archivio"></mds-tree-item>
    </mds-tree-item>
    <mds-tree-item label="Risorse umane"></mds-tree-item>
  </mds-tree-item>
</mds-tree>
```

#### Programmatic Expand / Collapse

Set `expanded` on `<mds-tree>` to open or close the entire hierarchy at once. This cascades to all descendant items except those marked `async`.

```html
<!-- All nodes expanded on mount -->
<mds-tree expanded>
  <mds-tree-item label="Pratiche in corso">
    <mds-tree-item label="Pratica 001/2025"></mds-tree-item>
    <mds-tree-item label="Pratica 002/2025"></mds-tree-item>
  </mds-tree-item>
</mds-tree>
```

#### Folder Toggle Style

Use `toggle="folder"` for file-explorer metaphors. The toggle icon switches between a closed and open folder glyph when the item is expanded or collapsed.

```html
<mds-tree toggle="folder" actions="visible">
  <mds-tree-item label="Fascicoli">
    <mds-tree-item label="2025">
      <mds-tree-item label="Fascicolo 001"></mds-tree-item>
      <mds-tree-item label="Fascicolo 002"></mds-tree-item>
    </mds-tree-item>
    <mds-tree-item label="2024">
      <mds-tree-item label="Fascicolo 099"></mds-tree-item>
    </mds-tree-item>
  </mds-tree-item>
</mds-tree>
```

#### Right-Positioned Toggle for Navigation Menus

Set `toggle-position="right"` and `appearance="none"` for a flat navigation-menu look where the expand chevron sits at the trailing edge of the row.

```html
<mds-tree toggle="chevron" toggle-position="right" appearance="none">
  <mds-tree-item label="Protocollazione documenti">
    <mds-tree-item label="Nuovo protocollo in arrivo"></mds-tree-item>
    <mds-tree-item label="Nuovo protocollo in partenza"></mds-tree-item>
  </mds-tree-item>
  <mds-tree-item label="Gestione allegati">
    <mds-tree-item label="Scansione multipla"></mds-tree-item>
  </mds-tree-item>
</mds-tree>
```

#### Per-Item Actions via the `action` Slot

Slot `<mds-button>` or `<mds-icon>` elements into each `<mds-tree-item>` with `slot="action"`. Use `actions="auto"` (default) to reveal them on hover, or `actions="visible"` to always show them.

```html
<mds-tree actions="auto">
  <mds-tree-item label="Relazione annuale 2025">
    <mds-button
      slot="action"
      icon="mi/baseline/download"
      variant="dark"
      tone="text"
      title="Scarica"
    ></mds-button>
    <mds-button
      slot="action"
      icon="mi/baseline/more-vert"
      variant="dark"
      tone="text"
      title="Altre opzioni"
    ></mds-button>
    <mds-tree-item label="Capitolo 1"></mds-tree-item>
    <mds-tree-item label="Capitolo 2"></mds-tree-item>
  </mds-tree-item>
</mds-tree>
```

#### Listening to Expand and Collapse Events

`<mds-tree-item>` emits `mdsTreeItemExpand` when opened and `mdsTreeItemCollapse` when closed. Listen via `addEventListener` - do not rely on native `change` / `click` bubbling through shadow DOM.

```html
<mds-tree id="albero-categorie">
  <mds-tree-item label="Categoria A">
    <mds-tree-item label="Sottocategoria A1"></mds-tree-item>
  </mds-tree-item>
</mds-tree>

<script>
  document.getElementById('albero-categorie').addEventListener('mdsTreeItemExpand', (event) => {
    console.log('espanso:', event.detail.element.label);
  });

  document.getElementById('albero-categorie').addEventListener('mdsTreeItemCollapse', (event) => {
    console.log('collassato:', event.detail.element.label);
  });
</script>
```

#### Async Lazy-Loading Branches

Mark a `<mds-tree-item>` with `async` when its children must be fetched on demand. The item shows a loading spinner on click and emits `mdsTreeItemExpand`. Resolve the branch by calling `element.expand()` on the item once data is ready.

```html
<mds-tree>
  <mds-tree-item label="Comune di Rimini" icon="mgg/historic-building">
    <mds-tree-item label="Ufficio" async class="ufficio-item" icon="mi/baseline/desk">
      <!-- children injected dynamically after expand() -->
    </mds-tree-item>
  </mds-tree-item>
</mds-tree>

<script>
  document.querySelector('.ufficio-item').addEventListener('mdsTreeItemExpand', async (event) => {
    const { element } = event.detail;
    if (!element.async) return;
    const children = await fetchChildren(element.label);
    children.forEach((nome) => {
      const item = document.createElement('mds-tree-item');
      item.label = nome;
      element.appendChild(item);
    });
    element.expand();
  });
</script>
```

#### Icon on Individual Items

Use the `icon` prop on `<mds-tree-item>` to show a glyph next to the label. Reference icons by their slug from the Magma icon library.

```html
<mds-tree toggle="chevron">
  <mds-tree-item label="Comune di Rimini" icon="mgg/historic-building">
    <mds-tree-item label="Sindaco" icon="mdi/handshake">
      <mds-tree-item label="Segretario generale" icon="mi/baseline/draw"></mds-tree-item>
    </mds-tree-item>
  </mds-tree-item>
</mds-tree>
```

#### Styling Customization

Style the tree only through the documented `--mds-tree-*` CSS custom properties. Set them on the host element or a parent selector; use Magma color tokens via `rgb(var(--<token>))` so dark mode and high-contrast modes keep working.

```css
.navigazione-laterale mds-tree {
  --mds-tree-label-hover-background: rgb(var(--tone-neutral-09));
  --mds-tree-branch-border-color: rgb(var(--tone-neutral-07));
  --mds-tree-toggle-icon-chevron-default-background: rgb(var(--variant-primary-04));
  --mds-tree-toggle-icon-chevron-default-color: rgb(var(--tone-neutral));
  --mds-tree-transition-duration: 200ms;
}
```


### 3. Antipattern

Common incorrect uses of `<mds-tree>`. Each entry pairs the wrong form with the right one and a one-line reason. System-wide rules (boolean-as-string, shadow piercing, Tailwind color utilities, raw native event listening) live in [`docs/COMPONENTS.md`](../../../../../../docs/COMPONENTS.md#system-level-anti-patterns) - they apply here too but are not repeated.

#### Do Not Put Non-`mds-tree-item` Elements Directly in `<mds-tree>`

The default slot of `<mds-tree>` accepts only `<mds-tree-item>` elements. Placing raw HTML or other components as direct children breaks depth seeding and compound communication.

```html
<!-- 🚫 INCORRECT -->
<mds-tree>
  <li>Voce uno</li>
  <li>Voce due</li>
</mds-tree>

<!-- ✅ CORRECT -->
<mds-tree>
  <mds-tree-item label="Voce uno"></mds-tree-item>
  <mds-tree-item label="Voce due"></mds-tree-item>
</mds-tree>
```

#### Do Not Slot `<mds-tree-item>` Outside `<mds-tree>`

`<mds-tree-item>` is a compound child and depends on `<mds-tree>` for depth seeding and prop cascading. Using it standalone produces undefined indentation and no toggle coordination.

```html
<!-- 🚫 INCORRECT -->
<div class="menu">
  <mds-tree-item label="Impostazioni">
    <mds-tree-item label="Profilo"></mds-tree-item>
  </mds-tree-item>
</div>

<!-- ✅ CORRECT -->
<mds-tree>
  <mds-tree-item label="Impostazioni">
    <mds-tree-item label="Profilo"></mds-tree-item>
  </mds-tree-item>
</mds-tree>
```

#### Do Not Use the `action` Slot on `<mds-tree>` Itself

The `action` slot is defined on `<mds-tree-item>`, not on `<mds-tree>`. Placing content with `slot="action"` on the root container has no effect; the slot is silently discarded.

```html
<!-- 🚫 INCORRECT -->
<mds-tree>
  <mds-button slot="action" icon="mi/baseline/add" title="Aggiungi"></mds-button>
  <mds-tree-item label="Documenti"></mds-tree-item>
</mds-tree>

<!-- ✅ CORRECT -->
<mds-tree>
  <mds-tree-item label="Documenti">
    <mds-button
      slot="action"
      icon="mi/baseline/add"
      variant="dark"
      tone="text"
      title="Aggiungi"
    ></mds-button>
  </mds-tree-item>
</mds-tree>
```

#### Do Not Listen for Native `click` or `change` to Detect Expand/Collapse

Native events may not bubble predictably out of shadow DOM. Use the documented `mdsTreeItemExpand` and `mdsTreeItemCollapse` events emitted by `<mds-tree-item>`.

```html
<!-- 🚫 INCORRECT -->
<mds-tree id="albero">
  <mds-tree-item label="Sezione A">
    <mds-tree-item label="Voce 1"></mds-tree-item>
  </mds-tree-item>
</mds-tree>

<script>
  // unreliable - click bubbles from an internal mds-button shadow DOM
  document.getElementById('albero').addEventListener('click', handler);
</script>

<!-- ✅ CORRECT -->
<script>
  document.getElementById('albero').addEventListener('mdsTreeItemExpand', (event) => {
    console.log('espanso:', event.detail.element.label);
  });
</script>
```

#### Do Not Set `expanded="false"` to Collapse

In HTML/Stencil any non-empty string attribute is truthy. Setting `expanded="false"` keeps the tree expanded. Remove the attribute (or set the prop to `undefined`) to collapse.

```html
<!-- 🚫 INCORRECT -->
<mds-tree expanded="false">
  <mds-tree-item label="Sezione"></mds-tree-item>
</mds-tree>

<!-- ✅ CORRECT -->
<mds-tree>
  <mds-tree-item label="Sezione"></mds-tree-item>
</mds-tree>
```

#### Do Not Use Undocumented `::part()` Targets or `>>>` to Style Internals

The supported customization surface for `<mds-tree>` is the `--mds-tree-*` CSS custom properties. Shadow-DOM piercing (`>>>`, `/deep/`) is not supported and `<mds-tree>` exposes no `::part()`. Coupling to internal selectors will break on minor releases.

```css
/* 🚫 INCORRECT */
mds-tree >>> .header {
  background: red;
}

/* ✅ CORRECT */
mds-tree {
  --mds-tree-label-hover-background: rgb(var(--tone-neutral-09));
  --mds-tree-branch-border-color: rgb(var(--tone-neutral-07));
}
```

#### Do Not Wrap `<mds-tree-item>` in an Extra Div to Add Spacing

Inserting wrapper elements breaks the compound slot protocol - `<mds-tree>` communicates with items via `querySelectorAll` and slot assignment, and wrappers interrupt both. Use the documented CSS custom properties for spacing instead.

```html
<!-- 🚫 INCORRECT -->
<mds-tree>
  <div style="margin-bottom: 8px;">
    <mds-tree-item label="Categoria A"></mds-tree-item>
  </div>
  <div style="margin-bottom: 8px;">
    <mds-tree-item label="Categoria B"></mds-tree-item>
  </div>
</mds-tree>

<!-- ✅ CORRECT -->
<mds-tree>
  <mds-tree-item label="Categoria A"></mds-tree-item>
  <mds-tree-item label="Categoria B"></mds-tree-item>
</mds-tree>
```



## Properties

| Property         | Attribute         | Description                                                                                       | Type                               | Default     |
| ---------------- | ----------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------- | ----------- |
| `actions`        | `actions`         | Show actions on the every tree item on hover or by default.                                       | `"auto" \| "visible" \| undefined` | `'auto'`    |
| `appearance`     | `appearance`      | Specifies if the branches depth decorations are visible.                                          | `"depth" \| "none"`                | `'depth'`   |
| `async`          | `async`           | Specifies the tree should be opened asynchronously when after the click, .                        | `boolean \| undefined`             | `undefined` |
| `expanded`       | `expanded`        | Specifies if the tree is expanded.                                                                | `boolean \| undefined`             | `undefined` |
| `label`          | `label`           | Specifies the selector of the target element, this attribute is used with `querySelector` method. | `string`                           | `undefined` |
| `toggle`         | `toggle`          | Specifies the toggle icon of the element                                                          | `"chevron" \| "folder"`            | `'chevron'` |
| `togglePosition` | `toggle-position` | Specifies the toggle icon position of the element                                                 | `"left" \| "right"`                | `'left'`    |
| `truncate`       | `truncate`        | Truncate the text of the element on one single line.                                              | `"all" \| "none" \| "word"`        | `'word'`    |


## Slots

| Slot        | Description                    |
| ----------- | ------------------------------ |
| `"default"` | Add `mds-tree-item` element/s. |


----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
