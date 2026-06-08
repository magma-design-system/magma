# mds-tab-bar



This is a web-component from Maggioli Design System [Magma](https://magma.maggiolicloud.it), built with StencilJS, TypeScript, Storybook. It's based on the web-component standard and it's designed to be agnostic from the JavaScript framework you are using.

<!-- Auto Generated Below -->


## Usage

### 1. Description

The `<mds-tab-bar>` web component is the compound container of the Magma Design System that groups a set of `<mds-tab-bar-item>` children into a single selectable navigation bar, owning the mutual-exclusion logic that keeps exactly one item active at a time.

#### Semantic Behavior

- **Compound parent/child**: It accepts only `<mds-tab-bar-item>` elements in its default slot and acts purely as their coordinator.
- **Single active selection**: When one item reports selection, the others are deselected - enforcing one-active-at-a-time behavior.
- **Change notification**: After resolving the new selection it emits `mdsTabBarChange` whose detail carries the zero-based `index` of the newly selected item, intended to drive panel/view switching by the consumer.
- **Default-slot semantics**: The slot is structural (it expects components, not text); the textual label lives inside each `<mds-tab-bar-item>` instead.

#### Properties & Visual Configurations

`<mds-tab-bar>` itself exposes no configuration props - its appearance and content are entirely determined by the `<mds-tab-bar-item>` children it wraps. The relevant intent lives on those children:

- **`selected`** marks which item is active. The parent rewrites it during selection changes; set it on a single child to define the initial active tab.
- **`icon`** is an SVG filename slug from the Magma icon library, rendered above the item's text label.
- **`typography`** selects the text scale of the item label from the smaller-typography ladder (defaulting to `'tip'`), letting authors match tab density to surrounding chrome.

This component does not use the shared `variant` / `tone` ladders defined in [`projects/stencil/SPEC.md`](../../../../SPEC.md#tone-and-variant-system).


### 2. Pattern

Correct and idiomatic ways to use the `<mds-tab-bar>` component, ordered from most common to most specialized. Patterns assume a working knowledge of the compound-component rules documented in [`docs/COMPONENTS.md`](../../../../../../docs/COMPONENTS.md) and the generic stencil rules in [`projects/stencil/SPEC.md`](../../../../SPEC.md).

#### Basic Navigation Bar

The canonical form. Place one `<mds-tab-bar-item>` per destination. Provide `icon` as a slug from the Magma icon library and the text via the `label` prop. Mark the initially active item with `selected`.

```html
<mds-tab-bar>
  <mds-tab-bar-item icon="mi/baseline/home" label="Home" selected></mds-tab-bar-item>
  <mds-tab-bar-item icon="mi/baseline/search" label="Cerca"></mds-tab-bar-item>
  <mds-tab-bar-item icon="mi/baseline/notifications" label="Notifiche"></mds-tab-bar-item>
  <mds-tab-bar-item icon="mi/baseline/person" label="Profilo"></mds-tab-bar-item>
</mds-tab-bar>
```

#### Reacting to Tab Changes

Listen for `mdsTabBarChange` on the host. The event detail carries `index` - the zero-based position of the newly selected item - which you use to switch the visible view or panel.

```html
<mds-tab-bar id="app-nav">
  <mds-tab-bar-item icon="mi/baseline/home" label="Home" selected></mds-tab-bar-item>
  <mds-tab-bar-item icon="mi/baseline/inbox" label="Messaggi"></mds-tab-bar-item>
  <mds-tab-bar-item icon="mi/baseline/settings" label="Impostazioni"></mds-tab-bar-item>
</mds-tab-bar>

<script>
  document.querySelector('#app-nav').addEventListener('mdsTabBarChange', (e) => {
    const activeIndex = e.detail.index;
    showView(activeIndex);
  });
</script>
```

#### Setting the Initial Active Tab Programmatically

Set `selected` on exactly one child to control the starting state. If you later need to change the active item from outside - for example, after a router navigation - update the `selected` attribute on the correct item directly; the parent will sync all siblings.

```html
<!-- Second item active on load -->
<mds-tab-bar>
  <mds-tab-bar-item icon="mi/baseline/home" label="Home"></mds-tab-bar-item>
  <mds-tab-bar-item icon="mi/baseline/explore" label="Scopri" selected></mds-tab-bar-item>
  <mds-tab-bar-item icon="mi/baseline/favorite" label="Preferiti"></mds-tab-bar-item>
</mds-tab-bar>
```

#### Adjusting Label Typography

Use `typography` on individual items to match the text density to the surrounding chrome. The prop accepts `"tip"` (default, smaller) or `"option"` (slightly larger). You can mix values if items carry different visual weight.

```html
<mds-tab-bar>
  <mds-tab-bar-item icon="mi/baseline/home" label="Home" typography="option" selected></mds-tab-bar-item>
  <mds-tab-bar-item icon="mi/baseline/inbox" label="Posta" typography="option"></mds-tab-bar-item>
  <mds-tab-bar-item
    icon="mi/baseline/settings"
    label="Impostazioni"
    typography="option"
  ></mds-tab-bar-item>
</mds-tab-bar>
```

#### Styling Customization via CSS Custom Properties

Style individual items through the documented `--mds-tab-bar-item-*` CSS custom properties. Set them on the specific item or on a parent selector. Use Magma token wrappers `rgb(var(--<token>))` so dark mode and high-contrast keep working.

```css
/* Brand-specific active color for the whole bar */
mds-tab-bar mds-tab-bar-item {
  --mds-tab-bar-item-color-selected: rgb(var(--variant-secondary-03));
}

/* A single item with a distinct idle color */
mds-tab-bar-item.priority {
  --mds-tab-bar-item-color: rgb(var(--status-warning-04));
}
```


### 3. Antipattern

Common incorrect uses of `<mds-tab-bar>`. Each entry pairs the wrong form with the right one and a one-line reason. System-wide rules (boolean-as-string, shadow piercing, Tailwind color utilities, raw native event listening) live in [`docs/COMPONENTS.md`](../../../../../../docs/COMPONENTS.md#system-level-anti-patterns) - they apply here too but are not repeated.

#### Do Not Place HTML Elements or Text Directly in the Bar's Default Slot

`<mds-tab-bar>` only coordinates `<mds-tab-bar-item>` children; arbitrary HTML or text in its slot breaks the mutual-exclusion logic and the change event.

```html
<!-- 🚫 INCORRECT -->
<mds-tab-bar>
  <button>Home</button>
  <a href="/cerca">Cerca</a>
</mds-tab-bar>

<!-- ✅ CORRECT -->
<mds-tab-bar>
  <mds-tab-bar-item icon="mi/baseline/home" label="Home" selected></mds-tab-bar-item>
  <mds-tab-bar-item icon="mi/baseline/search" label="Cerca"></mds-tab-bar-item>
</mds-tab-bar>
```

#### Do Not Use the Deprecated Default Slot for an Item's Text

Setting an item's text via the default slot is deprecated. Slotted text is read into `label` with a console warning, and nested HTML is stripped - use the `label` prop for the text and the `icon` prop for the glyph.

```html
<!-- 🚫 INCORRECT -->
<mds-tab-bar-item icon="mi/baseline/inbox">Messaggi</mds-tab-bar-item>
<mds-tab-bar-item>
  <span class="bold">Messaggi</span>
  <small>(3)</small>
</mds-tab-bar-item>

<!-- ✅ CORRECT -->
<mds-tab-bar-item icon="mi/baseline/inbox" label="Messaggi"></mds-tab-bar-item>
```

#### Do Not Slot `<mds-icon>` to Add an Icon

The item's `icon` prop renders the glyph through the shared icon service and positions it correctly above the label. Slotting `<mds-icon>` puts it in the deprecated default slot, where it is misaligned or stripped.

```html
<!-- 🚫 INCORRECT -->
<mds-tab-bar-item>
  <mds-icon name="mi/baseline/home"></mds-icon>
  Home
</mds-tab-bar-item>

<!-- ✅ CORRECT -->
<mds-tab-bar-item icon="mi/baseline/home" label="Home"></mds-tab-bar-item>
```

#### Do Not Set `selected="false"` to Deselect an Item

`selected` is a boolean attribute - any non-empty string value (including `"false"`) is truthy in HTML. Remove the attribute entirely to deselect an item, or let the parent coordinate selection automatically.

```html
<!-- 🚫 INCORRECT -->
<mds-tab-bar-item icon="mi/baseline/home" label="Home" selected="false"></mds-tab-bar-item>

<!-- ✅ CORRECT -->
<mds-tab-bar-item icon="mi/baseline/home" label="Home"></mds-tab-bar-item>
```

#### Do Not Listen for the Item's Internal Event on the Bar's Children

`mdsTabBarItemSelect` is an internal coordination event consumed by `<mds-tab-bar>` itself. To react to selection changes from outside, listen for `mdsTabBarChange` on the parent instead.

```html
<!-- 🚫 INCORRECT -->
<script>
  document.querySelector('mds-tab-bar-item').addEventListener('mdsTabBarItemSelect', handler);
</script>

<!-- ✅ CORRECT -->
<script>
  document.querySelector('mds-tab-bar').addEventListener('mdsTabBarChange', (e) => {
    handler(e.detail.index);
  });
</script>
```

#### Do Not Style Items by Piercing Shadow DOM

The only supported customization surface is the four `--mds-tab-bar-item-*` CSS custom properties. Targeting internal nodes via `::part()`, `>>>`, or undocumented class names couples your code to the Shadow DOM implementation and will break on minor releases.

```css
/* 🚫 INCORRECT */
mds-tab-bar-item >>> mds-icon {
  fill: hotpink;
}

/* ✅ CORRECT */
mds-tab-bar mds-tab-bar-item {
  --mds-tab-bar-item-color-selected: rgb(var(--variant-secondary-03));
}
```



## Events

| Event             | Description                  | Type                                |
| ----------------- | ---------------------------- | ----------------------------------- |
| `mdsTabBarChange` | Emits when a step is changed | `CustomEvent<MdsTabBarEventDetail>` |


## Slots

| Slot        | Description                       |
| ----------- | --------------------------------- |
| `"default"` | Add `mds-tab-bar-item` element/s. |


----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
