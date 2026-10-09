# install assets.md

## Purpose

Canonical setup for the assets every Magma consumer needs, **identical for all three
targets** (web components, React, Angular): styles, fonts, icons and optional brand
identity. The per-target tracks ([`web-components.md`](web-components.md),
[`react.md`](react.md), [`angular.md`](angular.md)) link here instead of repeating
this. If something about styles/fonts/icons setup is unclear, this file wins.

This file is the minimum to get a consumer running. Once it runs: coloring your own UI
in [`color.md`](color.md), the typography utilities in [`typography.md`](typography.md),
dark mode, preferences, named themes, the `--magma-*` global decisions and the corner
geometry in [`theming.md`](theming.md).

## 1. Styles

### Packages

```bash
npm i @maggioli-design-system/styles @maggioli-design-system/design-tokens
```

Pin both to the row matching your `magma` major (see [`SPEC.md`](SPEC.md) matrix).

### Import order (mandatory)

Magma styles rely on a fixed cascade-layer order. Import them in exactly this order
in your global CSS entry point, or specificity conflicts and dark mode will break:

```css
@layer reset, vendor, theme, base, components, utilities, overrides;
/* or @import '@maggioli-design-system/styles/dist/css/layer.css'; */

@import 'normalize.css' layer(reset);

/* Fonts - see section 2 */
@import '@fontsource/karla/400.css' layer(vendor);
@import '@fontsource/karla/700.css' layer(vendor);
@import '@fontsource/merriweather/300.css' layer(vendor);
@import '@fontsource/merriweather/400.css' layer(vendor);
@import '@fontsource/merriweather/700.css' layer(vendor);
@import '@fontsource/roboto/500.css' layer(vendor);
@import '@fontsource/roboto/700.css' layer(vendor);
@import '@fontsource/roboto/900.css' layer(vendor);
@import '@fontsource/roboto-mono/400.css' layer(vendor);

/* Magma styles */
@import '@maggioli-design-system/styles/dist/css/colors-rgb.css' layer(theme);
@import '@maggioli-design-system/styles/dist/css/typography.css' layer(theme);
@import '@maggioli-design-system/styles/dist/css/reset.css' layer(reset);
@import '@maggioli-design-system/styles/dist/css/hydrated.css' layer(base);
@import '@maggioli-design-system/styles/dist/css/transitions.css' layer(base);
@import '@maggioli-design-system/styles/dist/css/animations.css' layer(base);
@import '@maggioli-design-system/styles/dist/css/globals.css' layer(theme);
@import '@maggioli-design-system/styles/dist/css/semantic.css' layer(theme);
@import '@maggioli-design-system/styles/dist/css/themes.css' layer(theme);
@import '@maggioli-design-system/styles/dist/css/base.css' layer(base);

/* your Tailwind entry point, if any */
@import './tailwind.css';
```

What each file provides:

| File | Purpose |
| ---- | ------- |
| `colors-rgb.css` | RGB color tokens (`--tone-*`, `--status-*`, ...). Required by components and Tailwind. Also redefines tokens for dark / high-contrast |
| `typography.css` | The non-color tokens as CSS vars: fonts, type sizes, spacing, radius, shadows (`--shadow-md-sharp`, ...). Components carry their own fallbacks; your CSS needs this file for `var(--shadow-*)`, `var(--radius-*)` and the `--magma-radius-*` corner scale |
| `reset.css` | Opinionated CSS reset |
| `hydrated.css` | Anti-FOUC for Stencil - hides components until hydrated |
| `transitions.css`, `animations.css` | Shared motion |
| `globals.css` | Global `--magma-*` design decisions |
| `semantic.css` | The semantic color roles (`--magma-surface-*`, `--magma-text-*`, ..., see [`color.md`](color.md)). Required: without it the page `body` has no colour, the Tailwind role utilities paint nothing, and components lose named themes and high contrast |
| `themes.css` | The named themes (`data-theme-name`): retint the semantic roles. Import it after `semantic.css` |
| `base.css` | Base element styles (sets `--font-info` body font, etc.) |

DO NOT import `colors-hex-*.css` when using components or Tailwind - they cannot be
used with opacity modifiers and bypass dark mode. Use `colors-rgb.css`.

### Tailwind (optional)

With Tailwind 4, import Magma's Tailwind layer in your Tailwind entry point (the
`./tailwind.css` of the block above), after Tailwind's own theme and utilities. Leave out
`@import 'tailwindcss'`: its preflight would duplicate Magma's reset.

```css
/* tailwind.css */
@import 'tailwindcss/theme.css' layer(theme);
@import 'tailwindcss/utilities.css' layer(utilities);
@import '@maggioli-design-system/styles/dist/tailwind/theme.css';
@import '@maggioli-design-system/styles/dist/tailwind/typography.css';
@import '@maggioli-design-system/styles/dist/tailwind/utilities.css';
```

`theme.css` brings the palette, the typography tokens and the semantic color utilities
(`bg-surface-raised`, `text-fg-muted`, ..., see [`color.md`](color.md)), `typography.css`
the `text-title-*` / `text-info-*` / `text-read-*` / `text-code-*` utilities,
`utilities.css` the `focus-bounce` / `focus-zoom` helpers.

Do not use the JS preset (`presets: [require('@maggioli-design-system/styles')]`) with
Tailwind 4: it is the Tailwind 3 path (with the layers in
`@maggioli-design-system/styles/dist/tailwind3/`), its colours are Tailwind 3 colour
functions, and Tailwind 4 generates none of the Magma utilities from it.

## 2. Fonts

Magma does NOT bundle webfonts. The typography tokens point to **Roboto** (title),
**Karla** (info / UI), **Merriweather** (read / editorial) and **Roboto Mono**
(code), each with a system fallback. The consumer must load the actual fonts, easiest
via [`@fontsource`](https://fontsource.org/):

```bash
npm i @fontsource/karla @fontsource/merriweather @fontsource/roboto @fontsource/roboto-mono
```

The `@import` lines are already in the section 1 block (under `layer(vendor)`). They
are the weights the type scale uses: Roboto 500/700/900 (actions, h6, h1-h5), Karla
400/700, Merriweather 300/400 (reading paragraph and detail, caption) plus 700 for bold in
reading text, Roboto Mono 400. Add more weights as needed.

Self-hosting via `@fontsource` is preferred over a CDN `<link>` so the fonts respect
the `vendor` cascade layer and ship offline.

## 3. Icons

Icons are consumed at runtime by `mds-icon`, which fetches each icon as an SVG file from
a path the host app configures. A slug starts with its icon set (`mi/` Material Icons,
`mdi/` Material Design Icons, `mgg/` Maggioli) and resolves to
`<mdsIconSvgPath><slug>.svg`: with the path `/svg/`, `mi/baseline/email` is fetched from
`/svg/mi/baseline/email.svg`.

### Package and asset copy

```bash
npm i @maggioli-design-system/svg-icons
```

Copy the SVG library to a publicly served path. The package ships the files under
`@maggioli-design-system/svg-icons/dist/svg/`. Copy them to e.g. `public/svg/` (the
mechanism depends on the bundler - see each track file).

### Tell mds-icon where the icons are

The simplest way: set `mdsIconSvgPath` in `sessionStorage` before components hydrate.
The value is the public URL of the folder you copied the SVGs into:

```javascript
window.sessionStorage.setItem('mdsIconSvgPath', '/svg/');
```

Alternatives, documented in
[`../../projects/stencil/src/components/mds-icon/readme.md`](../../projects/stencil/src/components/mds-icon/readme.md):

- `IconsSetService.setSvgPath('/svg/')`, imported from
  `@maggioli-design-system/magma/services`: sets the path in code, without
  `sessionStorage`, and reloads the icons already mounted
- `mdsIcon.setSvgPath('/svg/')` - instance method on a temporary `mds-icon` node, after
  `defineCustomElements()` has run
- dispatch `new CustomEvent('mdsIconSvgPathUpdate')` on `window` to force a refresh
  after changing the path

Reference an icon by slug, never inline SVG and never import from an icon-set package:

```html
<mds-icon name="mi/baseline/email"></mds-icon>
<mds-button icon="mi/baseline/send">Send</mds-button>
```

The mgg-icons webfont (`@maggioli-design-system/icons`) is an alternative output and
is NOT used by Magma at runtime - prefer the SVG-file strategy above.

## 4. Identity / brand (optional)

Logos and avatars for Maggioli Group products. Install only if the app renders brand
assets:

```bash
npm i @maggioli-design-system/identity
```

Assets live under `@maggioli-design-system/identity/dist/`:

- `dist/brand/` - logos per brand (gruppo-maggioli, maggioli-editore, rnd, ...)
- `dist/avatar/` - avatar illustrations (svg / webp / png / pdf)
- `dist/illustrations/`, `dist/products/` - additional brand imagery

These are static read-only files - serve them like any other asset, do not modify
them in the consumer project.

## Checklist

- [ ] `styles` + `design-tokens` installed on the matching version row
- [ ] Global CSS imports in the exact cascade-layer order above
- [ ] `@fontsource` fonts installed and imported in the `vendor` layer
- [ ] `svg-icons` SVGs copied to a public path
- [ ] `mdsIconSvgPath` set to that public path before hydration
- [ ] (optional) `identity` installed if brand assets are used
- [ ] Components registered per your target track
