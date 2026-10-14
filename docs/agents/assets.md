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
| `hydrated.css` | Anti-FOUC for Stencil - hides components until hydrated, then keeps the margin, padding and border they give themselves against a page reset such as Tailwind's preflight. Import it into `base`, as above |
| `transitions.css`, `animations.css` | Shared motion |
| `globals.css` | Global `--magma-*` design decisions |
| `semantic.css` | The semantic color roles (`--magma-surface-*`, `--magma-text-*`, ..., see [`color.md`](color.md)). Required: without it the page `body` has no colour, the Tailwind role utilities are stuck on their light default (the fallback that gives editors a swatch), and components lose dark mode, named themes and high contrast |
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
a path the host app configures. The components' own icons are inlined, so what needs
serving is the icons the app names.

### The contract

Every slug the app uses must be served at `<mdsIconSvgPath><slug>.svg`: with the path
`/svg/`, `mi/baseline/email` is fetched from `/svg/mi/baseline/email.svg`. A slug starts
with its icon set, and each set comes from its own package, with its own layout:

| Slug | Set | Package | File in the package |
| ---- | --- | ------- | ------------------- |
| `mi/<variant>/<name>` | Material Icons | `@material-icons/svg` | `svg/<name>/<variant>.svg` |
| `mdi/<name>` | Material Design Icons | `@mdi/svg` | `svg/<name>.svg` |
| `mgg/<name>` | Maggioli | `@maggioli-design-system/svg-icons` | `dist/svg/<name>.svg` |

Magma ships only the `mgg/` set, and none of these packages is a dependency of `magma`,
`magma-react` or `magma-angular`: the route you pick installs what it needs. Copying the
`svg-icons` folder as it is does NOT follow the contract: its files sit directly in
`dist/svg/`, while `mds-icon` asks for them under `mgg/`.

`mds-usage` still fetches `mi/baseline/info` for its header: serve it too if the app
uses that component.

Any setup that follows the contract works. Two tested routes, both run before every dev
start and build, with the output folder kept out of git:

### Route 1: iconsauce (what Magma uses)

iconsauce reads the sources the way Tailwind reads class names and writes only the icons
they use, one SVG file per slug, in the folders `mds-icon` expects. Its plugins know the
three sets and bring their packages along.

```bash
npm i -D @iconsauce/core @iconsauce/material-icons @iconsauce/mdi-svg @iconsauce/mgg-icons
```

```js
// iconsauce.config.mjs
import mi from '@iconsauce/material-icons';
import mdi from '@iconsauce/mdi-svg';
import mgg from '@iconsauce/mgg-icons';

export default {
  content: ['./index.html', './src/**/*.{html,js,jsx,ts,tsx}'], // every file where icon slugs are written
  plugin: [mi, mdi, mgg],
};
```

```json
"scripts": {
  "icons": "iconsauce --config ./iconsauce.config.mjs --output-svg ./public/svg",
  "predev": "npm run icons",
  "prebuild": "npm run icons"
}
```

A slug built at runtime (`'mi/baseline/' + name`) is invisible to iconsauce: write slugs
in full, or list the computed ones in a file that `content` reads.

### Route 2: serve the files yourself

One renaming step: `@material-icons/svg` stores `<name>/<variant>.svg`, while the slug
wants `mi/<variant>/<name>`. `mdi/` and `mgg/` are plain folder copies. This script covers
the three sets with Node built-ins only, so it fits any bundler:

```bash
npm i -D @maggioli-design-system/svg-icons @material-icons/svg @mdi/svg
```

```js
// scripts/copy-icons.mjs
// Copies Magma's icon sets where mds-icon fetches them: <OUT>/<slug>.svg.
//   node scripts/copy-icons.mjs icons.json   only the slugs listed in icons.json
//   node scripts/copy-icons.mjs              every icon of the three sets (18,720 files, 73 MB)
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const OUT = 'public/svg'; // served at /svg/ by Vite, Next.js and the Angular CLI
const require = createRequire(import.meta.url);
const root = (pkg) => dirname(require.resolve(`${pkg}/package.json`));
const MI = join(root('@material-icons/svg'), 'svg'); // <name>/<variant>.svg
const MDI = join(root('@mdi/svg'), 'svg'); // <name>.svg
const MGG = join(root('@maggioli-design-system/svg-icons'), 'dist/svg'); // <name>.svg

// Source file of a slug: mi/<variant>/<name>, mdi/<name>, mgg/<name>.
function source(slug) {
  const [set, ...rest] = slug.split('/');
  if (set === 'mi' && rest.length === 2) return join(MI, rest[1], `${rest[0]}.svg`);
  if (set === 'mdi' && rest.length === 1) return join(MDI, `${rest[0]}.svg`);
  if (set === 'mgg' && rest.length === 1) return join(MGG, `${rest[0]}.svg`);
  throw new Error(`Not a Magma icon slug: ${slug}`);
}

function allSlugs() {
  const names = (dir) => readdirSync(dir).map((file) => file.replace(/\.svg$/, ''));
  return [
    ...readdirSync(MI).flatMap((name) => names(join(MI, name)).map((variant) => `mi/${variant}/${name}`)),
    ...names(MDI).map((name) => `mdi/${name}`),
    ...names(MGG).map((name) => `mgg/${name}`),
  ];
}

const slugs = process.argv[2] ? JSON.parse(readFileSync(process.argv[2], 'utf8')) : allSlugs();
for (const slug of slugs) {
  const file = source(slug);
  if (!existsSync(file)) throw new Error(`No such icon: ${slug} (${file})`);
  const target = join(OUT, `${slug}.svg`);
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(file, target);
}
console.log(`${slugs.length} icons in ${OUT}/`);
```

`icons.json` lists the slugs the app uses:

```json
["mi/baseline/email", "mi/baseline/send", "mdi/github", "mgg/abitazione-principale"]
```

```json
"scripts": {
  "icons": "node scripts/copy-icons.mjs icons.json",
  "predev": "npm run icons",
  "prebuild": "npm run icons"
}
```

A slug that does not exist stops the script with an error. A slug used in the code but
missing from `icons.json` gives a 404 at runtime: iconsauce avoids that by reading the
sources. Without `icons.json` the script copies every icon of the three sets, all of
them deployed: 18,720 files and 73 MB (`mi` 43 MB in five variants, `mdi` 29 MB, `mgg`
1.3 MB).

### Only the `mgg/` set

An app that uses only Maggioli icons can copy the `svg-icons` folder, into `mgg/` under
the served path: `@maggioli-design-system/svg-icons/dist/svg/` to `public/svg/mgg/`. With
the Angular CLI that is an `assets` entry in `angular.json`:

```json
{ "glob": "**/*.svg", "input": "node_modules/@maggioli-design-system/svg-icons/dist/svg", "output": "/svg/mgg" }
```

### Tell mds-icon where the icons are

Set the public URL of the folder the icons are served from, before the first `mds-icon`
renders. Two ways:

- `IconsSetService.setSvgPath('/svg/')`, imported from
  `@maggioli-design-system/magma/services` (recommended): sets the path in code, without
  `sessionStorage`, and reloads the icons already mounted.
- the `mdsIconSvgPath` key in `sessionStorage`, a one-liner the install tracks use. Some
  browsers block storage (private windows, sandboxed iframes, storage partitioning): there
  only `IconsSetService` works.

```javascript
import { IconsSetService } from '@maggioli-design-system/magma/services';

IconsSetService.setSvgPath('/svg/');
// or: window.sessionStorage.setItem('mdsIconSvgPath', '/svg/');
```

Icons mounted before a path set through `sessionStorage` reload on
`window.dispatchEvent(new CustomEvent('mdsIconSvgPathUpdate'))`. Every option, with its
snippet, is in the
[`mds-icon` pattern](../../projects/stencil/src/components/mds-icon/usage/2.%20Pattern.md).

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
- [ ] Every icon slug the app uses served at `<mdsIconSvgPath><slug>.svg` (iconsauce or
      the copy script, run before dev and build, output folder out of git)
- [ ] `mdsIconSvgPath` set to that public path before hydration
- [ ] (optional) `identity` installed if brand assets are used
- [ ] Components registered per your target track
