# install assets.md

## Purpose

Canonical setup for the assets every Magma consumer needs, **identical for all three
targets** (web components, React, Angular): styles, fonts, icons and optional brand
identity. The per-target tracks ([`web-components.md`](web-components.md),
[`react.md`](react.md), [`angular.md`](angular.md)) link here instead of repeating
this. If something about styles/fonts/icons setup is unclear, this file wins.

For the deeper styles reference (Tailwind config, color classes, typography
utilities, dark mode, `--magma-*` global vars) see
[`../../projects/styles/SPEC.md`](../../projects/styles/SPEC.md). This file is the
minimum to get a consumer running.

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
@import '@fontsource/merriweather/400.css' layer(vendor);
@import '@fontsource/merriweather/700.css' layer(vendor);
@import '@fontsource/roboto/500.css' layer(vendor);
@import '@fontsource/roboto/700.css' layer(vendor);
@import '@fontsource/roboto-mono/400.css' layer(vendor);

/* Magma styles */
@import '@maggioli-design-system/styles/dist/css/colors-rgb.css' layer(theme);
@import '@maggioli-design-system/styles/dist/css/reset.css' layer(reset);
@import '@maggioli-design-system/styles/dist/css/hydrated.css' layer(base);
@import '@maggioli-design-system/styles/dist/css/transitions.css' layer(base);
@import '@maggioli-design-system/styles/dist/css/animations.css' layer(base);
@import '@maggioli-design-system/styles/dist/css/globals.css' layer(theme);
@import '@maggioli-design-system/styles/dist/css/base.css' layer(base);

/* your Tailwind entry point, if any */
@import './tailwind.css';
```

What each file provides:

| File | Purpose |
| ---- | ------- |
| `colors-rgb.css` | RGB color tokens (`--tone-*`, `--status-*`, ...). Required by components and Tailwind. Also redefines tokens for dark / high-contrast |
| `reset.css` | Opinionated CSS reset |
| `hydrated.css` | Anti-FOUC for Stencil - hides components until hydrated |
| `transitions.css`, `animations.css` | Shared motion |
| `globals.css` | Global `--magma-*` design decisions |
| `base.css` | Base element styles (sets `--font-info` body font, etc.) |

DO NOT import `colors-hex-*.css` when using components or Tailwind - they cannot be
used with opacity modifiers and bypass dark mode. Use `colors-rgb.css`.

### Tailwind (optional)

If the consumer uses Tailwind, extend Magma's preset:

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{ts,tsx,html}'],
  presets: [require('@maggioli-design-system/styles')],
};
```

Tailwind 3 layers are also published under
`@maggioli-design-system/styles/dist/tailwind3/`.

## 2. Fonts

Magma does NOT bundle webfonts. The typography tokens point to **Roboto** (title),
**Karla** (info / UI), **Merriweather** (read / editorial) and **Roboto Mono**
(code), each with a system fallback. The consumer must load the actual fonts, easiest
via [`@fontsource`](https://fontsource.org/):

```bash
npm i @fontsource/karla @fontsource/merriweather @fontsource/roboto @fontsource/roboto-mono
```

The `@import` lines are already in the section 1 block (under `layer(vendor)`). The
weights listed (Karla 400/700, Merriweather 400/700, Roboto 500/700, Roboto Mono 400)
are the minimum used by the type scale; add more weights as needed.

Self-hosting via `@fontsource` is preferred over a CDN `<link>` so the fonts respect
the `vendor` cascade layer and ship offline.

## 3. Icons

Icons are managed by **iconsauce** and consumed at runtime by `mds-icon`, which
fetches each icon as an SVG file from a path the host app configures. See the icons
section in [`../../projects/stencil/SPEC.md`](../../projects/stencil/SPEC.md) for how
slugs resolve; this section is only the consumer-side wiring.

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

Alternatives (after `defineCustomElements()` has run), documented in
[`../../projects/stencil/src/components/mds-icon/readme.md`](../../projects/stencil/src/components/mds-icon/readme.md):

- `mdsIcon.setSvgPath('/svg/')` - instance method on a temporary `mds-icon` node
- `MdsIcon.setSvgPathStatic('/svg/')` - static class method
- dispatch `new CustomEvent('mdsIconSvgPathUpdate')` on `window` to force a refresh
  after changing the path

Reference an icon by slug, never inline SVG and never import from an icon-set package:

```html
<mds-icon name="action-email-send"></mds-icon>
<mds-button icon="action-email-send">Send</mds-button>
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
