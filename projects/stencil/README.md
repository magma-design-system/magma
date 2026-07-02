![Built With Stencil](https://img.shields.io/badge/-Built%20With%20Stencil-16161d.svg?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjIuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI%2BCjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI%2BCgkuc3Qwe2ZpbGw6I0ZGRkZGRjt9Cjwvc3R5bGU%2BCjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik00MjQuNywzNzMuOWMwLDM3LjYtNTUuMSw2OC42LTkyLjcsNjguNkgxODAuNGMtMzcuOSwwLTkyLjctMzAuNy05Mi43LTY4LjZ2LTMuNmgzMzYuOVYzNzMuOXoiLz4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTQyNC43LDI5Mi4xSDE4MC40Yy0zNy42LDAtOTIuNy0zMS05Mi43LTY4LjZ2LTMuNkgzMzJjMzcuNiwwLDkyLjcsMzEsOTIuNyw2OC42VjI5Mi4xeiIvPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNDI0LjcsMTQxLjdIODcuN3YtMy42YzAtMzcuNiw1NC44LTY4LjYsOTIuNy02OC42SDMzMmMzNy45LDAsOTIuNywzMC43LDkyLjcsNjguNlYxNDEuN3oiLz4KPC9zdmc%2BCg%3D%3D&colorA=16161d&style=flat-square)

# Magma 2
---

## Install with an AI agent

This package ships an agent-readable install guide, versioned with the package. Point
your coding agent (Claude Code, etc.) at it and let it wire up styles, fonts, icons and
component registration, asking you only for what it cannot detect from your project:

> Read `node_modules/@maggioli-design-system/magma/AGENTS.md` and follow it to install
> Magma into this project.

The detailed steps live under `agents/` in this package.

#### Required versions

Use the versions of `@maggioli-design-system/design-tokens` and `@maggioli-design-system/styles` matching your magma major version:

| magma | design-tokens | styles |
| :--- | :--- | :--- |
| `1.x` (before Magma 2) | `13.x` (latest `13.7.2`) | `15.x` (latest `15.11.1`) |
| `2.x` and later | `>= 14` | `>= 16` |

#### Tones name changes

Now tones have new names to make them more consistent with the rest of the system and to be more semantiaclly correct.

| V1 | V2 | V1 compatibility |
|---------|---------|-------------|
| `strong`  | `strong`  | ✅ |
| `weak`    | `weak`    | ✅ |
| `ghost`   | `outline` | ⚠️ |
| `quiet`   | `text`    | ⚠️ |

#### Design tokens

- ⚠️ added `text-box` css module with vertically treats text nodes with a better optical alignment.
- ✅ Added additional box shadow tokens.
- ✅ CSS tokens are now dynamically calculated with `calc()` method instead of hardcoded values.

#### Styles changes

- ⚠️ Library is now using tailwind 4 instead of 3, this means the config is now CSS custom properties based instad of pure javascript configuration.
- ✅ Added `--magma-corner-shape` to style the corner shape of the components globally.

#### Component changes

| Change | Component | Description |
|---------|---------|-------------|
| ⚠️ | `mds-text`                 | added `text-box` css module with vertically treats text nodes with a better optical alignment.
| ⚠️ | `mds-banner`               | Removed old `quiet` tone which is NOT replaced with `text` tone. |
| ⚠️ | `mds-breadcrumb`           | Now item requires `label` attribute to be set. |
| ✅ | `mds-file`                  | Added download icon on hover to make component more explicit. |
| ✅ | `mds-table`                | Added batch actions to the table when rows are selectable. |
| ✅ | `mds-header-bar`           | The overlay blur effect is now applied progressively rather than sharply outlined. |
| ✅ | `mds-button`               | Added `label` attribute to the component. |
| ✅ | `mds-modal`                | Added a fixed position to `header` and `footer` slotted elements |
| ✅ | `mds-input-range`          | Changed appearance of the component to be more consistent with the rest of the system. |
| ✅ | `mds-accordion-item`       | Changed the toggle arrow icon to be more visually constent and semantically clear. |
| ✅ | `mds-accordion-timer-item` | Changed the toggle arrow icon to be more visually constent and semantically clear. |
| ✅ | `mds-details`              | Changed the toggle arrow icon to be more visually constent and semantically clear. |


### Breaking changes

---

## Maggioli Design System Web-Component

Questa libreria fornisce una lista di componenti basati sullo standard web-component agnostici rispetto ai framework Javascript

Fa uso della libreria [@maggioli-design-system/styles](https://www.npmjs.com/package/@maggioli-design-system/styles) per gli sitli dei componenti

## Installation

```
npm i '@maggioli-design-system/magma'
```

## Define Components

```js
// insert in bootstrap file of client part of your application

import { defineCustomElements } from "@maggioli-design-system/magma/loader";

defineCustomElements();
```

Alternatively, if you wanted to take advantage of ES Modules, you could include the components using an import statement.

```html
<html>
  <head>
    <script type="module">
      import { defineCustomElements } from '@maggioli-design-system/magma/loader/index.es2017.mjs';
      defineCustomElements();
    </script>
  </head>
  <body>
    <mds-text>Hello world</mds-text>
  </body>
</html>
```

## Style
Import style used by components

```css
/* global.css */

// color
@import "@maggioli-design-system/styles/dist/css/colors-rgb.css";

// font
@import '@fontsource/karla/400.css';
@import '@fontsource/karla/700.css';
@import '@fontsource/merriweather/400.css';
@import '@fontsource/merriweather/700.css';
@import '@fontsource/roboto-mono/400.css';
@import '@fontsource/roboto/500.css';
@import '@fontsource/roboto/700.css';
@import '@fontsource/roboto/900.css';
```

For more details see the [library](https://www.npmjs.com/package/@maggioli-design-system/styles)


## Icon
Tell the `mds-icon` component where to load the SVG icons from. The recommended way is the shared `IconsSetService` singleton, imported from the package's `services` entry point. It sets the path in memory (no `sessionStorage`) and makes every mounted icon (re)load - so it works even where storage is blocked (incognito, sandboxed iframes, storage partitioning).

```js
import { IconsSetService } from '@maggioli-design-system/magma/services';

IconsSetService.setSvgPath('/assets/img/svg/');
```

Pass an absolute path (starting with `/`, resolved against the origin) or a full URL. It can be called before or after the icons mount.

Alternatively, set the `mdsIconSvgPath` key in `sessionStorage` before any icon mounts. This is optional and **may be blocked** by some browsers/contexts - prefer `IconsSetService` above.

```js
window.sessionStorage.setItem('mdsIconSvgPath', 'assets/img/svg/');
```

If you are using React, set either inside `useEffect`, otherwise `window` is not defined.


For greater interoperability between components and frameworks, see the specific libraries for [Angular](https://www.npmjs.com/package/@maggioli-design-system/magma-angular) and [React](https://www.npmjs.com/package/@maggioli-design-system/magma-react)

