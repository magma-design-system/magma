# @maggioli-design-system/lint

ESLint and Stylelint rules that check your code against the installed version of
[`@maggioli-design-system/magma`](https://www.npmjs.com/package/@maggioli-design-system/magma): a prop value
the component does not take, a boolean turned "off" with `"false"`, an icon-only control without a name, a
colour painted with Tailwind's palette or a raw palette step, a hand-written dark mode.

The rules read the data of the packages you have installed, never a list written by hand: the props and their
values from the `documentation.json` of `@maggioli-design-system/magma`, the palette from the DTCG tokens of
`@maggioli-design-system/design-tokens` and the consumption map of `@maggioli-design-system/styles`. When you
update Magma, the rules follow.

They make the prose rules of Magma's agent guides executable (`agents/conventions.md`, `agents/color.md`,
`agents/theming.md` in the `magma` package): run them after writing, whether you or an agent wrote the code.

ESM package, Node >= 22, ESLint 9, Stylelint 16.

## Install

```bash
npm install --save-dev @maggioli-design-system/lint
```

Plus the parser of your templates, if your project does not have it yet:

| Templates | Parser |
| --- | --- |
| HTML | `@html-eslint/parser` |
| Angular (external `.html` templates) | `@angular-eslint/template-parser` |
| React (JSX, TSX) | the one the project already uses (`typescript-eslint`, or ESLint's own for `.jsx`) |

## ESLint

The plugin is `@maggioli-design-system/lint/eslint`. Its two presets set the rules under the name `magma/`:

- `recommended`, for a product that already exists: what is broken or not accessible is an error, the palette a
  warning;
- `strict`, for a new one: every rule is an error.

A preset sets rules only: add it to the block that parses your templates.

```js
// eslint.config.js - plain HTML
import html from '@html-eslint/parser';
import magma from '@maggioli-design-system/lint/eslint';

export default [
  { files: ['**/*.html'], languageOptions: { parser: html }, ...magma.configs.recommended },
];
```

```js
// eslint.config.js - Angular, next to the configuration of angular-eslint
import angularTemplate from '@angular-eslint/template-parser';
import magma from '@maggioli-design-system/lint/eslint';

export default [
  // ...the blocks of angular-eslint
  { files: ['**/*.html'], languageOptions: { parser: angularTemplate }, ...magma.configs.recommended },
];
```

With the inline-template processor of angular-eslint, the inline `template:` of a component is linted as an
`.html` file too.

```js
// eslint.config.js - React
import magma from '@maggioli-design-system/lint/eslint';

export default [
  // ...the block that parses .jsx / .tsx
  { files: ['**/*.{jsx,tsx}'], ...magma.configs.recommended },
];
```

In JSX the rules read both `<mds-button>` and the wrappers of `@maggioli-design-system/magma-react`
(`<MdsButton>`), and a `className` written as a string or a template literal.

To set one rule instead of a preset:

```js
import magma from '@maggioli-design-system/lint/eslint';

export default [
  {
    files: ['**/*.html'],
    plugins: { magma },
    rules: { 'magma/valid-attribute-values': 'error' },
  },
];
```

## Stylelint

```js
// stylelint.config.mjs
export default {
  extends: ['@maggioli-design-system/lint/stylelint/recommended'],
};
```

`recommended` stops on a `prefers-color-scheme` query and warns on a raw colour; `strict` (`.../stylelint/strict`)
makes both errors. To set the rules by hand, load the plugin, `@maggioli-design-system/lint/stylelint`, and name
them under `magma/`.

## Settings

The data is resolved from the directory ESLint runs in, the way Node resolves an import, and from the directory of
the installed `magma` when a package manager nests its dependencies there. Point the rules elsewhere with
`settings.magma` (paths relative to `root`):

```js
{
  settings: {
    magma: {
      root: './apps/portal',
      documentation: 'node_modules/@maggioli-design-system/magma/dist/documentation.json',
      tokens: 'node_modules/@maggioli-design-system/design-tokens/dist/dtcg/base.tokens.json',
      consumption: 'node_modules/@maggioli-design-system/styles/dist/tailwind/consumption.json',
    },
  },
}
```

## Rules

| Rule | Tool | `recommended` | `strict` |
| --- | --- | --- | --- |
| [`valid-attribute-values`](#valid-attribute-values) | ESLint | error | error |
| [`no-false-boolean`](#no-false-boolean) | ESLint | error | error |
| [`accessible-name`](#accessible-name) | ESLint | error | error |
| [`no-raw-palette-classes`](#no-raw-palette-classes) | ESLint | warn | error |
| [`no-color-scheme-override`](#no-color-scheme-override) | Stylelint | error | error |
| [`no-raw-color`](#no-raw-color) | Stylelint | warning | error |

### valid-attribute-values

A prop whose type is a union of literals takes one of them. The values are the ones of the installed version, so
a value a release removed is reported after the update.

```html
<!-- INCORRECT: tone takes "box", "strong" or "weak" -->
<mds-banner tone="outline">Saved</mds-banner>

<!-- CORRECT -->
<mds-banner tone="weak">Saved</mds-banner>
```

A value bound to an expression (`[tone]="tone"`, `tone={tone}`) is known only at run time and is not checked; a
literal binding (`[tone]="'box'"`) is.

### no-false-boolean

A boolean prop is turned off by removing its attribute. A form-associated component (`mds-button`, the
`mds-input-*` family...) reads any value as on, `"false"` included, as a native control does.

```html
<!-- INCORRECT -->
<mds-button disabled="false">Save</mds-button>

<!-- CORRECT -->
<mds-button>Save</mds-button>
```

From a framework, bind a real boolean to the property: `<MdsButton disabled={isDisabled}>`,
`[disabled]="isDisabled"`. Reported: the string `"false"` in any form, and an Angular attribute binding
(`[attr.disabled]="false"`), which writes the attribute `"false"`.

### accessible-name

A component that takes an `icon` next to a `label` or a default slot, shown with its icon alone, needs a name:
without `label` or `aria-label`, `mds-button` is announced by the slug of its icon (`mi/baseline/send` -> "send"),
which names the icon and not the action. A component with an `alt` and a `src` (`mds-img`) without `alt` is named
after its file: describe the image, or set `alt=""` when it is decorative.

```html
<!-- INCORRECT -->
<mds-button icon="mi/baseline/send"></mds-button>
<mds-img src="/img/report-2024.jpg"></mds-img>

<!-- CORRECT -->
<mds-button icon="mi/baseline/send" label="Send"></mds-button>
<mds-img src="/img/report-2024.jpg" alt="Annual report 2024"></mds-img>
```

Left alone, because one element does not show its name: an element with an `id` (an
`mds-tooltip relation="label"` or an `aria-labelledby` elsewhere may name it) and one that spreads its props
(`{...props}`).

### no-raw-palette-classes

A colour class names a role (`bg-surface-raised`, `text-fg-muted`, `border-border-muted`), never Tailwind's palette
(`bg-white`, `text-gray-700`), which ignores Magma, nor a raw Magma step (`bg-tone-neutral-03`,
`text-status-error-04`, `border-surface-neutral-default`), which follows the mode only and not the named theme
nor the contrast preference. Variants, `!` and opacity are read through: `dark:hover:bg-white/50` is `bg-white`.

```html
<!-- INCORRECT -->
<section class="bg-white text-gray-700 border-tone-neutral-09">...</section>

<!-- CORRECT -->
<section class="bg-surface-raised text-fg-default border border-border-muted">...</section>
```

Legitimate, and not reported: `label-*` and `brand-*`, for colour that encodes data (a category, a tag, a brand),
and `tone-*-seed`, the pure extreme of the mode, for the rare knockout. The utilities that take a colour and the
raw steps come from the installed `styles` and `design-tokens`. Only class names written in the template are read:
a class built at run time (`clsx(...)`, an Angular `[ngClass]`) is not.

### no-color-scheme-override

A `prefers-color-scheme` media query follows the OS, not the mode the user picked in Magma (`mds-pref-mode`). The
roles already follow both: paint with them, and the dark mode comes with no query.

```css
/* INCORRECT */
@media (prefers-color-scheme: dark) {
  .panel { background: #111; }
}

/* CORRECT */
.panel { background: rgb(var(--magma-surface-raised)); }
```

### no-raw-color

A hex, `rgb()`, `hsl()`, `oklch()` or other colour literal where a role belongs. A colour that names a token is
fine (`rgb(var(--magma-text-muted) / 0.5)`, relative colours from a `var()`), and so are the keywords
(`currentColor`, `transparent`). In a shadow the hint is the shadow ink:
`rgb(var(--magma-shadow-ink) / <alpha>)`. Not read: `mask` and `mask-image`, which paint with the alpha of their
image, and the `initial-value` of an `@property`, which cannot name a token.

A colour that is not a role, such as the palette of an illustration, keeps its literal under a disable comment
that says why:

```css
mds-emoji[name='simi'] {
  /* stylelint-disable magma/no-raw-color -- the palette of an illustration */
  --mds-emoji-simi-skin: #f5c8a0;
  /* stylelint-enable magma/no-raw-color */
}
```

## The core

The package entry, `@maggioli-design-system/lint`, exposes what the plugins share, for tools that run the same
checks elsewhere (an agent's tool, a script): the loaders of the installed data, the element the rules work on and
one check per rule.
