![Built With Stencil](https://img.shields.io/badge/-Built%20With%20Stencil-16161d.svg?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjIuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI%2BCjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI%2BCgkuc3Qwe2ZpbGw6I0ZGRkZGRjt9Cjwvc3R5bGU%2BCjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik00MjQuNywzNzMuOWMwLDM3LjYtNTUuMSw2OC42LTkyLjcsNjguNkgxODAuNGMtMzcuOSwwLTkyLjctMzAuNy05Mi43LTY4LjZ2LTMuNmgzMzYuOVYzNzMuOXoiLz4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTQyNC43LDI5Mi4xSDE4MC40Yy0zNy42LDAtOTIuNy0zMS05Mi43LTY4LjZ2LTMuNkgzMzJjMzcuNiwwLDkyLjcsMzEsOTIuNyw2OC42VjI5Mi4xeiIvPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNDI0LjcsMTQxLjdIODcuN3YtMy42YzAtMzcuNiw1NC44LTY4LjYsOTIuNy02OC42SDMzMmMzNy45LDAsOTIuNywzMC43LDkyLjcsNjguNlYxNDEuN3oiLz4KPC9zdmc%2BCg%3D%3D&colorA=16161d&style=flat-square)

# Maggioli Design System Web-Component

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
Set the path where the `mds-icon` component will get the svg icons

```js
window.sessionStorage.setItem('mdsIconSvgPath', 'assets/img/svg/');
```

If you are using React set this inside `UseEffet` otherwise window is not defined


For greater interoperability between components and frameworks, see the specific libraries for [Angular](https://www.npmjs.com/package/@maggioli-design-system/magma-angular) and [React](https://www.npmjs.com/package/@maggioli-design-system/magma-react)

