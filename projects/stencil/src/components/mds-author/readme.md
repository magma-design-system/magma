# mds-author


# Installation

Install the component via `npm` by running the following command:

```bash
npm i @maggioli-design-system/mds-author
```

This package works also with yarn:

```bash
yarn add @maggioli-design-system/mds-author
```

#### Import

Import the component in your project via `TypeScript` as follows:

```typescript
import { defineCustomElements as dceMdsAuthor } from '@maggioli-design-system/mds-author/loader'

dceMdsAuthor()
```

If you need to support older browsers (i.e. IE or early version of Edge), you can wrap the `defineCustomElements` in another utility available in the same package:

```typescript
import { applyPolyfills as apMdsAuthor, defineCustomElements as dceMdsAuthor } from '@maggioli-design-system/mds-author/loader'

apMdsAuthor().then(dceMdsAuthor())
```

Use alias for `defineCustomElements` method to initialize multiple web components in the same place:

```typescript
import { defineCustomElements as dceMdsComponentOne } from '@maggioli-design-system/mds-component-one/loader'
import { defineCustomElements as dceMdsComponentTwo } from '@maggioli-design-system/mds-component-two/loader'

dceMdsComponentOne()
dceMdsComponentTwo()
```

You can check how browser support works at [this page][stencil-browser-support].

---

# Integration

#### How to use it in HTML

`MdsAuthor` accepts a specific slot named `avatar` which is used to display an element on the left side (usually an image, or the initials of the author if no `src` is provided), while accepts multiple slots to be displayed on the right side for author's name and description. An example follow:

```html
<mds-author>
  <mds-avatar slot="avatar" initials="jd" src="<some-url>"></mds-avatar>
  <mds-text typography="h6">John Doe</mds-text>
  <mds-text typography="caption">Associated professor</mds-text>
</mds-author>
```

You can try it out on the component's [Storybook website][storybook]!

[storybook]: https://magma.maggiolicloud.it/storybook/?path=/story/ui-author--default
[stencil-browser-support]: https://stenciljs.com/docs/browser-support

This is a web-component from Maggioli Design System [Magma](https://magma.maggiolicloud.it), built with StencilJS, TypeScript, Storybook. It's based on the web-component standard and it's designed to be agnostic from the JavaScript framework you are using.

<!-- Auto Generated Below -->


## Usage

### 1. Description

The `<mds-author>` web component is the layout primitive of the Magma Design System for presenting a person's identity: it pairs an avatar with author information (name, role, or any related details). It exposes no props and acts purely as a slotted container, arranging an optional `avatar` slot beside a default content slot.

#### Semantic Behavior

- **Conditional avatar rendering**: The avatar column appears only when a direct child assigned to `slot="avatar"` is present, so omitting it produces no empty column.
- **Default slot is content, not text**: The default slot is meant to hold structured author information (typically stacked `mds-text` elements for name and role) rather than a single inline label.
- **Responsive collapse**: Below ~200px wide the avatar stacks above the info and they center, so the same markup adapts from a horizontal row to a compact vertical card.
- **Compound usage**: It is designed to wrap an `mds-avatar` in the `avatar` slot; the avatar element owns initials/image fallback logic, while `<mds-author>` only positions it.

#### Properties & Visual Configurations

This component has no properties. All configuration is expressed through its two slots:

- **`avatar` slot**: the leading element, recommended to be an `mds-avatar`. Its presence is what toggles the two-column layout.
- **default slot**: the trailing block holding the author's textual details, laid out so multiple lines stack cleanly and truncate within the available width.

See [`projects/stencil/SPEC.md`](../../../../SPEC.md) for the shared compound-component conventions and [`docs/COMPONENTS.md`](../../../../../../docs/COMPONENTS.md) for the usage contract.


### 2. Pattern

Correct and idiomatic ways to use the `<mds-author>` component, ordered from most common to most specialized. Patterns assume a working knowledge of compound-component conventions documented in [`projects/stencil/SPEC.md`](../../../../SPEC.md) and the component catalogue in [`docs/COMPONENTS.md`](../../../../../../docs/COMPONENTS.md).

#### Full Byline with Avatar

The canonical form. Place an [`mds-avatar`](../../mds-avatar) in the `avatar` slot and stack the author's name and role in the default slot using [`mds-text`](../../mds-text).

```html
<mds-author>
  <mds-avatar slot="avatar" initials="mg" src="/assets/avatars/mario-gomez.webp"></mds-avatar>
  <mds-text typography="h6">Mario Gomez</mds-text>
  <mds-text typography="caption">Responsabile editoriale</mds-text>
</mds-author>
```

#### Avatar with Initials Fallback

When no profile image is available, omit `src` and rely on `initials`. The avatar component derives a deterministic identity color from the initials, keeping people visually distinguishable.

```html
<mds-author>
  <mds-avatar slot="avatar" initials="ag"></mds-avatar>
  <mds-text typography="h6">Anna Grandi</mds-text>
  <mds-text typography="caption">Giornalista</mds-text>
</mds-author>
```

#### Multiple Info Lines

The default slot is a grid container - any number of stacked lines render cleanly and truncate within the available width.

```html
<mds-author>
  <mds-avatar slot="avatar" initials="fb" src="/assets/avatars/fred-brooks.webp"></mds-avatar>
  <mds-text typography="h6">Fred Brooks</mds-text>
  <mds-text typography="caption">Ingegnere del software</mds-text>
  <mds-text typography="caption">Dipartimento IT</mds-text>
</mds-author>
```

#### Text-Only Author (No Avatar)

Omitting the `avatar` slot entirely collapses the avatar column. No empty space is left - the info block fills the full width.

```html
<mds-author>
  <mds-text typography="h6">Luca Ferretti</mds-text>
  <mds-text typography="caption">Redattore capo</mds-text>
</mds-author>
```

#### Author Card Inside an Article Header

`<mds-author>` is typically embedded inside a card or article header, paired with a date or category label.

```html
<mds-card>
  <mds-card-header slot="header">
    <mds-author>
      <mds-avatar slot="avatar" initials="cs" src="/assets/avatars/chiara-sala.webp"></mds-avatar>
      <mds-text typography="h6">Chiara Sala</mds-text>
      <mds-text typography="caption">Pubblicato il 3 giugno 2026</mds-text>
    </mds-author>
  </mds-card-header>
</mds-card>
```

#### Avatar with Icon for Non-Human Entities

When the author represents an organization or system - rather than a person - pass an icon slug to `mds-avatar` instead of initials or a photo.

```html
<mds-author>
  <mds-avatar slot="avatar" icon="mi/baseline/business"></mds-avatar>
  <mds-text typography="h6">Redazione Magma</mds-text>
  <mds-text typography="caption">Contenuto istituzionale</mds-text>
</mds-author>
```

#### Narrow-Container Responsive Behavior

`<mds-author>` uses a CSS container query: inside a container narrower than 200px the avatar stacks above the info and both center automatically. No extra markup is needed - size the parent container to trigger it.

```html
<!-- In a sidebar widget constrained to ~160px wide, the layout collapses automatically -->
<aside style="width: 160px;">
  <mds-author>
    <mds-avatar slot="avatar" initials="gv"></mds-avatar>
    <mds-text typography="label">Giulia Verdi</mds-text>
    <mds-text typography="caption">Moderatrice</mds-text>
  </mds-author>
</aside>
```


### 3. Antipattern

Common incorrect uses of `<mds-author>`. Each entry pairs the wrong form with the right one and a one-line reason. System-wide rules (boolean-as-string, shadow piercing, Tailwind color utilities, raw native event listening) live in [`docs/COMPONENTS.md`](../../../../../../docs/COMPONENTS.md#system-level-anti-patterns) - they apply here too but are not repeated.

#### Do Not Put Plain Text Directly in the Default Slot

The default slot is a grid container designed for structured elements like `mds-text`. Bare text nodes render without typography tokens, scale inconsistently, and cannot be truncated reliably.

```html
<!-- 🚫 INCORRECT -->
<mds-author>
  <mds-avatar slot="avatar" initials="lr"></mds-avatar>
  Luca Rossi
  Redattore
</mds-author>

<!-- ✅ CORRECT -->
<mds-author>
  <mds-avatar slot="avatar" initials="lr"></mds-avatar>
  <mds-text typography="h6">Luca Rossi</mds-text>
  <mds-text typography="caption">Redattore</mds-text>
</mds-author>
```

#### Do Not Place the Avatar in the Default Slot

Assigning an `mds-avatar` without `slot="avatar"` puts it in the text/info region. The component only wires up the two-column layout when a child is assigned to the named `avatar` slot.

```html
<!-- 🚫 INCORRECT -->
<mds-author>
  <mds-avatar initials="ab"></mds-avatar>
  <mds-text typography="h6">Anna Bianchi</mds-text>
</mds-author>

<!-- ✅ CORRECT -->
<mds-author>
  <mds-avatar slot="avatar" initials="ab"></mds-avatar>
  <mds-text typography="h6">Anna Bianchi</mds-text>
</mds-author>
```

#### Do Not Inline an `<img>` Instead of `mds-avatar`

Using a raw `<img>` in the avatar slot skips the initials fallback, image-load error handling, and consistent sizing that `mds-avatar` provides.

```html
<!-- 🚫 INCORRECT -->
<mds-author>
  <img slot="avatar" src="/assets/foto.jpg" alt="Foto autore" />
  <mds-text typography="h6">Paolo Neri</mds-text>
</mds-author>

<!-- ✅ CORRECT -->
<mds-author>
  <mds-avatar slot="avatar" src="/assets/foto.jpg" initials="pn"></mds-avatar>
  <mds-text typography="h6">Paolo Neri</mds-text>
</mds-author>
```

#### Do Not Force Layout via Inline Styles

`<mds-author>` manages its own flex and container-query layout. Overriding `display`, `flex-direction`, or `align-items` on the host breaks the responsive collapse at narrow widths.

```html
<!-- 🚫 INCORRECT -->
<mds-author style="flex-direction: column; align-items: flex-start;">
  <mds-avatar slot="avatar" initials="sv"></mds-avatar>
  <mds-text typography="h6">Sara Vitale</mds-text>
</mds-author>

<!-- ✅ CORRECT -->
<!-- Constrain the parent container width to let the built-in container query handle the collapse -->
<div style="width: 160px;">
  <mds-author>
    <mds-avatar slot="avatar" initials="sv"></mds-avatar>
    <mds-text typography="h6">Sara Vitale</mds-text>
  </mds-author>
</div>
```

#### Do Not Use `<mds-author>` as a Generic Flex Row

`<mds-author>` is specifically designed for author bylines. For other avatar-plus-text combinations (entity cards, mention chips, user list rows) use [`mds-entity`](../../mds-entity) or [`mds-mention`](../../mds-mention) instead.

```html
<!-- 🚫 INCORRECT - using mds-author to display a product or file entry -->
<mds-author>
  <mds-avatar slot="avatar" icon="mi/baseline/folder"></mds-avatar>
  <mds-text typography="h6">Documento strategico.pdf</mds-text>
  <mds-text typography="caption">1.2 MB</mds-text>
</mds-author>

<!-- ✅ CORRECT -->
<mds-entity
  name="Documento strategico.pdf"
  description="1.2 MB"
  icon="mi/baseline/folder"
></mds-entity>
```



## Slots

| Slot       | Description                                                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------ |
|            | Add `text string`, `HTML elements` or `components` to this slot. Insert author information, name, role or other useful author infos. |
| `"avatar"` | Insert an avatar image, it is **recommended** to add `mds-avatar` element.                                                           |


----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
