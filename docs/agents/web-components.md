# install web-components.md

## Purpose

Install Magma as plain custom elements - for static HTML, vanilla JS, or any
framework that can render custom elements directly. For React or Angular use the
dedicated wrappers ([`react.md`](react.md), [`angular.md`](angular.md)).

First do the shared asset setup in [`assets.md`](assets.md) (styles, fonts, icons).
This file only covers package install and registration.

## 1. Install

```bash
npm i @maggioli-design-system/magma
```

Then install the assets from [`assets.md`](assets.md):

```bash
npm i @maggioli-design-system/styles @maggioli-design-system/design-tokens @maggioli-design-system/svg-icons
npm i @fontsource/karla @fontsource/merriweather @fontsource/roboto @fontsource/roboto-mono
```

## 2. Register the components

Two entry points, with different bundle-size trade-offs. Pick one - do not mix them
in the same app, or a tag ends up registered from two different builds.

### Per component (recommended, tree-shakeable)

Import only the components you use from `@maggioli-design-system/magma/components`
and call their `defineCustomElement*` function. Everything else is dropped by the
bundler:

```javascript
import {
  defineCustomElementMdsButton,
  defineCustomElementMdsIcon,
} from '@maggioli-design-system/magma/components';

defineCustomElementMdsButton();
defineCustomElementMdsIcon();
```

Each `defineCustomElement*` also registers the component's own children
recursively, so you only list the tags you write yourself.

A deep import is available too, when you want the bundler to resolve one file:

```javascript
import { defineCustomElement } from '@maggioli-design-system/magma/components/mds-button.js';
```

### All at once (lazy loader)

Simplest to wire up, but it ships every `mds-*` component: the loader resolves
chunks at runtime, so nothing can be tree-shaken away. Use it for prototypes, or
when the app genuinely uses most of the library.

```javascript
import { defineCustomElements } from '@maggioli-design-system/magma/loader';

defineCustomElements();
```

Either way, the tags are then plain HTML:

```html
<mds-button variant="primary" tone="strong">Save</mds-button>
<mds-icon name="action-email-send"></mds-icon>
```

### Without a bundler (CDN / static page)

If you cannot bundle, load the loader from the package's `loader/` entry and serve
`@maggioli-design-system/magma/dist/` as a static folder. The recommended path is
still a bundler - the lazy loader resolves component chunks relative to its own
location.

## 3. Set the icon path

Before components hydrate (see [`assets.md`](assets.md) section 3):

```javascript
window.sessionStorage.setItem('mdsIconSvgPath', '/svg/');
```

Make sure the SVG files from `@maggioli-design-system/svg-icons/dist/svg/` are served
at that path.

## 4. Anti-FOUC

`hydrated.css` (imported in the [`assets.md`](assets.md) block) hides components
until Stencil sets the hydrated attribute. Keep it in the `base` layer and load it
before the first render to avoid a flash of unstyled custom elements.

## Gotchas

- Call `defineCustomElements()` exactly once. Calling it twice is harmless but
  pointless; never call it after manually defining the same tags.
- Do not mix `/loader` and `/components` in the same app: they are two separate
  builds of the same components, and loading both doubles the bytes.
- `mdsIconSvgPath` must be set before the first `mds-icon` renders, or icons will
  fetch from the wrong path. If you set it late, dispatch
  `window.dispatchEvent(new CustomEvent('mdsIconSvgPathUpdate'))` to refresh.
- The default slot accepts plain text only unless a component's own `SPEC.md` says
  otherwise - see [`../../projects/stencil/SPEC.md`](../../projects/stencil/SPEC.md).

## See also

- [`assets.md`](assets.md) - styles / fonts / icons / identity (canonical)
- [`../../projects/stencil/SPEC.md`](../../projects/stencil/SPEC.md) - component conventions
