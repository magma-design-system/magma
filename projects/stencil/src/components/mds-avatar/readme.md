# mds-avatar

<!-- Start script-generated Magma Docs -->

# Install

Install the component via `npm` by running the following command

```bash
npm install @maggioli-design-system/mds-avatar
```

This package works also with yarn:

```bash
yarn add @maggioli-design-system/mds-avatar
```

### Import

Import the component in your project via `TypeScript` as follows:

```typescript
import { defineCustomElements as dceMdsAvatar } from '@maggioli-design-system/mds-avatar/loader'

dceMdsAvatar()
```

If you need to support older browsers (i.e. IE or early version of Edge), you can wrap the `defineCustomElements` in another utility awailable in the same package:

```typescript
import { applyPolyfills as apMdsAvatar, defineCustomElements as dceMdsAvatar } from '@maggioli-design-system/mds-avatar/loader'

apMdsAvatar().then(dceMdsAvatar())
```

Use alias for `defineCustomElements` method to initialize multiple web components in the same place:

```typescript
import { defineCustomElements as dceMdsComponentOne } from '@maggioli-design-system/mds-component-one/loader'
import { defineCustomElements as dceMdsComponentTwo } from '@maggioli-design-system/mds-component-two/loader'

dceMdsComponentOne()
dceMdsComponentTwo()
```

You can check how browser support works at [this page][stencil-browser-support].

# Integration

<!-- This section is useful to describe usages and configurations -->

#### How to use it in HTML

<!-- Add information about HTML usage here -->

`MdsAvatar` accepts a path to an image to be displayed via the `src` attribute, or if missing accepts the initials to be displayed via the `initials` attribute. Beware that the text passed via `initials` attribute will be trimmed and truncated up to the second character, so if `cya` is the value passed to the attribute, the final result displayed will be `CY` (the text will be transformed to uppercase via a css class).

An example follows:

```html
<mds-avatar src="https://placehold.co/80" initials="ap"></mds-avatar>
```

You can try it out on the component's [Storybook website][storybook]!

<!-- TODO set correct storybook link, `ui` may need to be changed into something else -->
[storybook]: https://magma.maggiolicloud.it/storybook/?path=/story/ui-avatar--default
[stencil-browser-support]: https://stenciljs.com/docs/browser-support

<!-- End script-generated Magma Docs -->

---

This is a web-component from Maggioli Design System [Magma](https://magma.maggiolicloud.it), built with StencilJS, TypeScript, Storybook. It's based on the web-component standard and it's designed to be agnostic from the JavaScript framework you are using.

<!-- Auto Generated Below -->


## Usage

### 1. Description

The `<mds-avatar>` web component renders a compact, circular representation of a user or entity in the Magma Design System. It resolves a single visual from whichever input is provided - a profile image, textual initials, a numeric overflow count, or an icon - and falls back to a generic person glyph when nothing usable is supplied.

#### Semantic Behavior

- **Content resolution**: Exactly one visual is shown at a time, so set one of `src`, `initials`, `count` or `icon`; the generic person fallback covers the empty case. Combinations do not follow one order: `count` hides `initials` and `icon`, `initials` hides `icon`, `icon` hides `src`, `src` hides `initials`, and `count` with `src` (or `src`, `initials` and `icon` together) renders an empty avatar.
- **Deterministic identity color**: When `initials` is set, the component derives the color from its characters, so the same person always maps to the same color and stays distinguishable from others. Any explicit `variant` is ignored in this case; `count` derives no color and keeps the `variant`.
- **Image load fallback**: If the `src` image fails to load, the avatar automatically swaps to the generic person fallback icon.
- **Auto-fitting initials**: Initials and count text scale to fit the avatar, so they stay legible across every size.
- **Initials display**: The first two characters of `initials` are displayed as they are, uppercased, so pass the initials (`MR`), not the full name. Non-alphanumeric characters are stripped only to compute the color.

#### Properties & Visual Configurations

The shared `variant` / `tone` ladders are defined in [`docs/agents/variants.md`](../../../../../../docs/agents/variants.md). Note that `tone` is limited to the minimal set (`'strong'` / `'weak'`), and any explicit `variant` is ignored whenever `initials` is present, since identity color takes precedence.

#### Other behavioral props

- **`src`** is the path to a profile image; prefer it when a real photo is available. Setting `icon` or `count` as well hides it.
- **`initials`** carries the textual stand-in for a user when no image exists; it drives the deterministic identity color.
- **`count`** renders a `+N` overflow badge and is intended for stacked/grouped avatar scenarios rather than individual users.
- **`icon`** is an SVG filename slug from the Magma icon library, used when the avatar represents a non-personal entity rather than a human.


### 2. Pattern

Correct and idiomatic ways to use the `<mds-avatar>` component, ordered from most common to most specialized. Patterns assume a working knowledge of the variant / tone ladders documented in [`docs/agents/variants.md`](../../../../../../docs/agents/variants.md) and the shared component rules in [`docs/agents/conventions.md`](../../../../../../docs/agents/conventions.md).

#### Profile Image via `src`

The most common form: supply a URL and the component loads the image lazily. If the image fails to load the component falls back to the generic person glyph automatically - no extra wiring needed.

```html
<mds-avatar src="https://example.com/foto-utente.jpg"></mds-avatar>
```

#### Initials Fallback

When no photo is available, provide the user's initials. The component displays the first two characters, uppercased, so pass the initials rather than the full name. It also derives a deterministic color from the characters (ignoring non-alphanumeric ones) so the same person always maps to the same hue.

```html
<mds-avatar initials="MR"></mds-avatar>
<!-- displayed as "MR" with a stable identity color -->

<mds-avatar initials="ab"></mds-avatar>
<!-- displayed as "AB" -->
```

#### Manual Variant and Tone (no initials)

When `initials` is not set, you can control the avatar background and icon color through `variant` and `tone`. Use this for non-personal entity avatars where identity color is not required.

```html
<!-- Primary brand color, filled -->
<mds-avatar variant="primary" tone="strong" icon="mi/baseline/support-agent"></mds-avatar>

<!-- Success semantic, weak tint -->
<mds-avatar variant="success" tone="weak"></mds-avatar>
```

#### Icon Avatar for Non-Personal Entities

Use `icon` when the avatar represents a system, service, or non-human entity. Reference icons by their slug (no `.svg` extension). The generic person fallback is replaced by the provided icon.

```html
<mds-avatar icon="mi/baseline/business" variant="primary"></mds-avatar>
<mds-avatar icon="mi/baseline/pets" variant="info"></mds-avatar>
```

#### Overflow Count in Stacked Groups

Use `count` to render a "+N" overflow badge for the last slot in an avatar stack (e.g. "3 more"). The count display overrides `initials` and `icon` (with `src` set as well the avatar renders empty) and, unlike `initials`, derives no color: it keeps the `variant`. Use inside [`mds-avatar-stack`](../../mds-avatar-stack) and [`mds-avatar-stack-item`](../../mds-avatar-stack-item).

```html
<mds-avatar-stack>
  <mds-avatar-stack-item src="https://example.com/foto-01.jpg"></mds-avatar-stack-item>
  <mds-avatar-stack-item src="https://example.com/foto-02.jpg"></mds-avatar-stack-item>
  <mds-avatar-stack-item count="3"></mds-avatar-stack-item>
</mds-avatar-stack>
```

#### Sizing via Utility Classes

`<mds-avatar>` does not expose a `size` prop - its size is controlled by the host element's `width` (the component uses `aspect-ratio: 1/1` internally). Apply a Magma spacing utility class on the host.

```html
<!-- Small avatar -->
<mds-avatar src="https://example.com/foto.jpg" class="w-600"></mds-avatar>

<!-- Default / medium avatar -->
<mds-avatar src="https://example.com/foto.jpg" class="w-1200"></mds-avatar>

<!-- Large avatar -->
<mds-avatar src="https://example.com/foto.jpg" class="w-2400"></mds-avatar>
```

#### Styling Customization

Style the avatar only through its documented `--mds-avatar-*` CSS custom properties. Use semantic color roles wrapped in `rgb(var(--magma-<role>))` so dark mode and high-contrast modes work correctly.

```css
.profilo-utente mds-avatar {
  --mds-avatar-background-color: rgb(var(--magma-accent-emphasis));
  --mds-avatar-color: rgb(var(--magma-accent-on-emphasis));
  --mds-avatar-radius: var(--magma-radius-md);
  --mds-avatar-initials-padding: 15%;
}
```

#### Square Avatar via `--mds-avatar-radius`

The default shape is fully circular. Override the CSS custom property to get a square or rounded-square avatar - for example when representing a product or brand logo rather than a person.

```css
.logo-azienda mds-avatar {
  --mds-avatar-radius: var(--magma-radius-md);
}
```

```html
<mds-avatar
  class="logo-azienda w-1600"
  src="https://example.com/logo-azienda.png"
></mds-avatar>
```


### 3. Antipattern

Common incorrect uses of `<mds-avatar>`. Each entry pairs the wrong form with the right one and a one-line reason. System-wide rules (boolean-as-string, shadow piercing, Tailwind color utilities, raw native event listening) live in [`docs/agents/anti-patterns.md`](../../../../../../docs/agents/anti-patterns.md) - they apply here too but are not repeated.

#### Do Not Set `variant` When `initials` Is Present

The component derives the background color deterministically from the characters when `initials` is set, and silently overrides any explicit `variant`. Setting `variant` alongside these props is a no-op and misleads readers of the markup.

```html
<!-- INCORRECT -->
<mds-avatar initials="MR" variant="error"></mds-avatar>

<!-- CORRECT -->
<mds-avatar initials="MR"></mds-avatar>
```

#### Do Not Use `count` for Individual Users

`count` is designed for overflow badges in stacked avatar groups ("+3 more"). Using it to represent a single user's identity (e.g. an ID number) produces a "+N" label, which is semantically wrong. Use `initials` for individual users.

```html
<!-- INCORRECT -->
<mds-avatar count="42"></mds-avatar>

<!-- CORRECT - use initials for individual users -->
<mds-avatar initials="GV"></mds-avatar>
```

#### Do Not Override Size with Inline `width` / `height` Styles

`<mds-avatar>` keeps a 1:1 aspect ratio internally. Forcing `width` or `height` via inline styles or arbitrary CSS bypasses the design token grid and can distort the shape. Use a Magma spacing utility class on the host element instead.

```html
<!-- INCORRECT -->
<mds-avatar src="https://example.com/foto.jpg" style="width: 73px; height: 73px;"></mds-avatar>

<!-- CORRECT -->
<mds-avatar src="https://example.com/foto.jpg" class="w-1600"></mds-avatar>
```

#### Do Not Slot `<img>` to Supply a Profile Photo

`<mds-avatar>` has no slots - it is a self-contained shadow component. Putting a raw `<img>` inside it will have no effect; the component will ignore it and show the fallback person glyph. Use the `src` prop instead.

```html
<!-- INCORRECT -->
<mds-avatar>
  <img src="https://example.com/foto.jpg" alt="Mario Bianchi" />
</mds-avatar>

<!-- CORRECT -->
<mds-avatar src="https://example.com/foto.jpg"></mds-avatar>
```

#### Do Not Pierce Shadow DOM to Change Internal Colors

The supported customization surface is the five documented `--mds-avatar-*` CSS custom properties and, for a deep customisation, the documented parts `wrapper`, `media` and `icon`. Using undocumented part names, `>>>`, or internal class names to target internals couples your code to the Shadow DOM implementation and breaks on minor releases.

```css
/* INCORRECT */
mds-avatar::part(initials) {
  background-color: hotpink;
}
mds-avatar >>> .initials-text {
  color: white;
}

/* CORRECT */
mds-avatar {
  --mds-avatar-background-color: rgb(var(--magma-accent-emphasis));
  --mds-avatar-color: rgb(var(--magma-accent-on-emphasis));
}
```

#### Do Not Use a Raw `<img>` or `<div>` as an Avatar

When an avatar-style UI element is needed, reach for `<mds-avatar>` rather than hand-rolling a circular `<img>` or `<div>` with CSS. The component handles lazy loading, load errors, initials fallback, pending state, dark mode, and high-contrast mode automatically.

```html
<!-- INCORRECT -->
<img
  src="https://example.com/foto.jpg"
  alt="Foto di Luca"
  style="border-radius: 50%; width: 48px; height: 48px;"
/>

<!-- CORRECT -->
<mds-avatar src="https://example.com/foto.jpg" class="w-1200"></mds-avatar>
```



## Properties

| Property   | Attribute  | Description                                                                                                                                          | Type                                                                                                                                                                                                         | Default     |
| ---------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- |
| `count`    | `count`    | The user's inizials displayed if there's no image available, initials will override tone and variant senttings to keep user recognizable from others | `number \| undefined`                                                                                                                                                                                        | `undefined` |
| `icon`     | `icon`     | Specifies the path to the icon                                                                                                                       | `string \| undefined`                                                                                                                                                                                        | `undefined` |
| `initials` | `initials` | The user's inizials displayed if there's no image available, initials will override tone and variant senttings to keep user recognizable from others | `string \| undefined`                                                                                                                                                                                        | `undefined` |
| `src`      | `src`      | Specifies the path to the image                                                                                                                      | `string \| undefined`                                                                                                                                                                                        | `undefined` |
| `tone`     | `tone`     | Specifies the color tone of the component                                                                                                            | `"strong" \| "weak" \| undefined`                                                                                                                                                                            | `undefined` |
| `variant`  | `variant`  | Specifies the color variant of the component                                                                                                         | `"amaranth" \| "aqua" \| "blue" \| "error" \| "green" \| "info" \| "lime" \| "orange" \| "orchid" \| "primary" \| "purple" \| "red" \| "sky" \| "success" \| "violet" \| "warning" \| "yellow" \| undefined` | `undefined` |


## Shadow Parts

| Part        | Description                                |
| ----------- | ------------------------------------------ |
| `"icon"`    | The selected icon of the avatar            |
| `"media"`   | The media displayed                        |
| `"wrapper"` | The wrapper which contains media displayed |


## CSS Custom Properties

| Name                                    | Description                                        |
| --------------------------------------- | -------------------------------------------------- |
| `--mds-avatar-background-color`         | The background-color of the component              |
| `--mds-avatar-background-color-pending` | The background-color when an image is loading      |
| `--mds-avatar-color`                    | The color of the placeholder icon                  |
| `--mds-avatar-initials-padding`         | Sets the padding of the initials inside the avatar |
| `--mds-avatar-radius`                   | The border-radius of the element                   |


## Dependencies

### Used by

 - [mds-avatar-stack-item](../mds-avatar-stack-item)
 - [mds-entity](../mds-entity)
 - [mds-push-notification-item](../mds-push-notification-item)

### Depends on

- [mds-img](../mds-img)
- [mds-icon](../mds-icon)

### Graph
```mermaid
graph TD;
  mds-avatar --> mds-img
  mds-avatar --> mds-icon
  mds-img --> mds-icon
  mds-img --> mds-text
  mds-img --> mds-button
  mds-button --> mds-spinner
  mds-button --> mds-icon
  mds-button --> mds-text
  mds-avatar-stack-item --> mds-avatar
  mds-entity --> mds-avatar
  mds-push-notification-item --> mds-avatar
  style mds-avatar fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
