# `mds-input` - Lit version

## Install

Install the component via `npm`

```
npm install mds-input
```

Or use `yarn`

```
yarn add mds-input
```

## Use in JavaScript

Import the component in your project

```html
<script type="module">
  import 'mds-input';
</script>
```

His dependencies

```html
<script type="module">
  import { defineCustomElements } from '@maggioli-design-system/mds-text/loader';
  defineCustomElements();
</script>
```

`Maggioli Design System` style in the `head` tag

```html
<link rel="stylesheet" href="./node_modules/@maggioli-design-system/styles/dist/css/colors-rgb.css">
```

The use it in your HTML

```html
<mds-input type="text" placeholder="Write something"></mds-input>
```

---

Built with `lit` and `vite`
