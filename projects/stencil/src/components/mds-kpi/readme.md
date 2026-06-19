# mds-kpi



This is a web-component from Maggioli Design System [Magma](https://magma.maggiolicloud.it), built with StencilJS, TypeScript, Storybook. It's based on the web-component standard and it's designed to be agnostic from the JavaScript framework you are using.

<!-- Auto Generated Below -->


## Usage

### 1. Description

The `<mds-kpi>` web component is the layout container of the Magma Design System for presenting groups of key performance indicators. It is a compound parent with no props of its own: it establishes an accessible list region and hosts one or more `<mds-kpi-item>` children that render the actual figures.

#### Semantic Behavior

- **List semantics**: The host exposes its `<mds-kpi-item>` children as a single semantic list group to assistive technology.
- **Compound relationship**: It carries no value or configuration itself; every metric - label, description, icon, and on-scroll animation - is defined on the slotted `<mds-kpi-item>` children.
- **Default slot is content**: The default slot is meant exclusively for `<mds-kpi-item>` elements; anything else has no styled placement.

#### Properties & Visual Configurations

`<mds-kpi>` itself exposes no props. Configuration happens on the `<mds-kpi-item>` children and through the CSS custom properties this component publishes for them.

#### Other behavioral props

- **`--mds-kpi-text-animation-speed`** and **`--mds-kpi-text-animation-placeholder-char`**: tune the scramble/reveal text effect used by children. The animation only runs when a child sets a non-zero `threshold`, which animates the value in once the item scrolls into view; with the default `threshold` of `0` the figure renders statically.


### 2. Pattern

Correct and idiomatic ways to use the `<mds-kpi>` component, ordered from most common to most specialized. Patterns assume a working knowledge of the variant / tone ladders documented in [`docs/COMPONENTS.md`](../../../../../../docs/COMPONENTS.md) and the generic stencil rules in [`projects/stencil/SPEC.md`](../../../../SPEC.md).

#### Basic KPI Panel

The canonical form. Place one or more [`mds-kpi-item`](../../mds-kpi-item) elements as direct children. `mds-kpi` provides the responsive grid; `mds-kpi-item` owns every visible value.

```html
<mds-kpi>
  <mds-kpi-item label="1.240" description="Pratiche aperte"></mds-kpi-item>
  <mds-kpi-item label="387" description="In lavorazione"></mds-kpi-item>
  <mds-kpi-item label="56" description="Scadute"></mds-kpi-item>
</mds-kpi>
```

#### KPI Item with Icon

Set `icon` to an icon slug to display a glyph above the value. Use slugs from the Magma icon library - `mi/baseline/*` for Material Icons or a semantic `mgg-icons` slug.

```html
<mds-kpi>
  <mds-kpi-item
    icon="mi/baseline/folder-open"
    label="1.240"
    description="Pratiche aperte"
  ></mds-kpi-item>
  <mds-kpi-item
    icon="mi/baseline/pending-actions"
    label="387"
    description="In lavorazione"
  ></mds-kpi-item>
  <mds-kpi-item
    icon="mi/baseline/warning"
    label="56"
    description="Scadute"
  ></mds-kpi-item>
</mds-kpi>
```

#### Scroll-Triggered Animation

Set `threshold` to a value between `0` (exclusive) and `1` to activate the scramble/reveal animation when the item scrolls into the viewport. A threshold of `0.5` triggers once at least half the element is visible. Omit `threshold` (or leave it at the default `0`) for static rendering.

```html
<mds-kpi>
  <mds-kpi-item
    icon="mi/baseline/groups"
    label="4.512"
    description="Dipendenti"
    threshold="0.5"
  ></mds-kpi-item>
  <mds-kpi-item
    icon="mi/baseline/location-city"
    label="38"
    description="Sedi operative"
    threshold="0.5"
  ></mds-kpi-item>
  <mds-kpi-item
    icon="mi/baseline/stars"
    label="12"
    description="Anni di attivita"
    threshold="0.5"
  ></mds-kpi-item>
</mds-kpi>
```

#### Tuning the Animation Speed Globally

Use `--mds-kpi-text-animation-speed` on the `<mds-kpi>` host to slow down or speed up the scramble effect for all children at once. The default is `0.15`. The placeholder character during the scramble phase is controlled by `--mds-kpi-text-animation-placeholder-char` (default: a space).

```css
.hero-section mds-kpi {
  --mds-kpi-text-animation-speed: 0.08;
  --mds-kpi-text-animation-placeholder-char: '-';
}
```

#### Styling Individual Items

Customize a single `<mds-kpi-item>` through its own CSS custom properties. Use Magma color tokens via `rgb(var(--<token>))` so dark mode keeps working.

```css
.progetto-kpi mds-kpi-item {
  --mds-kpi-item-icon-color: rgb(var(--variant-secondary-04));
  --mds-kpi-item-info-background: rgb(var(--tone-neutral-02));
}
```

#### Targeting Shadow Parts

When a CSS custom property is not enough, target the documented shadow parts of `<mds-kpi-item>` - `icon`, `icon-container`, and `content` - via `::part()`. Use this only when deeper visual control is required.

```css
mds-kpi-item::part(icon) {
  width: 30%;
}

mds-kpi-item::part(content) {
  text-align: left;
}
```


### 3. Antipattern

Common incorrect uses of `<mds-kpi>`. Each entry pairs the wrong form with the right one and a one-line reason. System-wide rules (boolean-as-string, shadow piercing, Tailwind color utilities, raw native event listening) live in [`docs/COMPONENTS.md`](../../../../../../docs/COMPONENTS.md#system-level-anti-patterns) - they apply here too but are not repeated.

#### Do Not Place Raw HTML in the Default Slot

The default slot of `<mds-kpi>` is meant exclusively for [`mds-kpi-item`](../../mds-kpi-item) elements. Arbitrary HTML has no styled placement inside the grid and breaks the list semantics the component exposes to assistive technology.

```html
<!-- 🚫 INCORRECT -->
<mds-kpi>
  <div class="metric">
    <h2>1.240</h2>
    <p>Pratiche aperte</p>
  </div>
</mds-kpi>

<!-- ✅ CORRECT -->
<mds-kpi>
  <mds-kpi-item label="1.240" description="Pratiche aperte"></mds-kpi-item>
</mds-kpi>
```

#### Do Not Use `mds-kpi-item` Outside `mds-kpi`

`<mds-kpi-item>` is a compound child and relies on the grid context and CSS custom property cascade provided by its parent. Using it as a standalone element loses the responsive layout and the shared animation-speed variables.

```html
<!-- 🚫 INCORRECT -->
<mds-kpi-item label="387" description="In lavorazione"></mds-kpi-item>

<!-- ✅ CORRECT -->
<mds-kpi>
  <mds-kpi-item label="387" description="In lavorazione"></mds-kpi-item>
</mds-kpi>
```

#### Do Not Set `threshold="0"` Explicitly to Disable Animation

`threshold` defaults to `0`, which means static rendering. Writing `threshold="0"` is redundant and, as a non-boolean numeric prop, the string `"0"` is silently coerced - but relying on string coercion is fragile. Simply omit the attribute.

```html
<!-- 🚫 INCORRECT -->
<mds-kpi-item label="56" description="Scadute" threshold="0"></mds-kpi-item>

<!-- ✅ CORRECT -->
<mds-kpi-item label="56" description="Scadute"></mds-kpi-item>
```

#### Do Not Slot `mds-icon` to Display an Icon

The `icon` prop on `<mds-kpi-item>` renders the glyph in its own styled container above the value. Slotting an `<mds-icon>` or any other element into `mds-kpi-item` puts it in the default slot, which is passed to `mds-kpi` and receives no styled placement.

```html
<!-- 🚫 INCORRECT -->
<mds-kpi>
  <mds-kpi-item label="75" description="Allenatori">
    <mds-icon name="mi/baseline/directions-walk"></mds-icon>
  </mds-kpi-item>
</mds-kpi>

<!-- ✅ CORRECT -->
<mds-kpi>
  <mds-kpi-item
    icon="mi/baseline/directions-walk"
    label="75"
    description="Allenatori"
  ></mds-kpi-item>
</mds-kpi>
```

#### Do Not Override the Animation Speed by Targeting Internal Text Components

`<mds-kpi-item>` forwards `--mds-kpi-text-animation-speed` and `--mds-kpi-text-animation-placeholder-char` to its internal `<mds-text>` elements. Setting `--mds-text-animation-speed` directly from outside the shadow boundary is fragile and bypasses the documented cascade. Use the published `--mds-kpi-*` or `--mds-kpi-item-*` variables instead.

```css
/* 🚫 INCORRECT */
mds-kpi-item {
  --mds-text-animation-speed: 0.05;
}

/* ✅ CORRECT */
mds-kpi {
  --mds-kpi-text-animation-speed: 0.05;
}
```



## Slots

| Slot | Description                   |
| ---- | ----------------------------- |
|      | Add `mds-kpi-item` element/s. |


## CSS Custom Properties

| Name                                        | Description                                     |
| ------------------------------------------- | ----------------------------------------------- |
| `--mds-kpi-text-animation-placeholder-char` | Sets the animation placeholder char of the text |
| `--mds-kpi-text-animation-speed`            | Sets the animation speed of the text            |


----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
