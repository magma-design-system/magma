# Magma lint

> Scope: checking the code you write against the installed Magma, with the ESLint and
> Stylelint rules that ship inside `@maggioli-design-system/magma`. Set them up once, when
> you install Magma, and run them after every change.

The rules make the prose of these guides executable: a prop value the component does not
take, a boolean turned "off" with `"false"`, an icon-only control without a name, a colour
painted with Tailwind's palette or a raw palette step, a hand-written dark mode. They read
the API and the tokens of the installed version, the same release as the components, so
they follow every update with nothing to keep in sync.

## Set it up

Nothing to install from Magma: the rules are in `@maggioli-design-system/magma`, which
`magma-react` and `magma-angular` require too. The project needs ESLint 9 and Stylelint 16
(`npm i -D eslint stylelint` when it has none) and the parser of its templates:

| Templates | Parser |
| --- | --- |
| HTML | `@html-eslint/parser` |
| Angular (external `.html` templates) | `@angular-eslint/template-parser` (with angular-eslint) |
| React (JSX, TSX) | the one the project already uses |

MERGE the blocks below into the project's `eslint.config.js` and `stylelint.config.mjs`:
never replace an existing configuration. Each ESLint preset sets rules only, so it goes in
the block that parses the templates.

### HTML and web components

```js
// eslint.config.js
import html from '@html-eslint/parser';
import magma from '@maggioli-design-system/magma/eslint';

export default [
  { files: ['**/*.html'], languageOptions: { parser: html }, ...magma.configs.recommended },
];
```

### React

```js
// eslint.config.js
import magma from '@maggioli-design-system/magma/eslint';

export default [
  // ...the block that parses .jsx and .tsx
  { files: ['**/*.{jsx,tsx}'], ...magma.configs.recommended },
];
```

The rules read both `<mds-button>` and the wrappers of `magma-react` (`<MdsButton>`), and the
classes of a `className` wherever its expression writes them, `clsx()` and ternaries included
(see [`no-raw-palette-classes`](#no-raw-palette-classes)).

### Angular

```js
// eslint.config.js, next to the blocks of angular-eslint
import angularTemplate from '@angular-eslint/template-parser';
import magma from '@maggioli-design-system/magma/eslint';

export default [
  { files: ['**/*.html'], languageOptions: { parser: angularTemplate }, ...magma.configs.recommended },
];
```

With the inline-template processor of angular-eslint, the inline `template` of a component
is linted as an `.html` file too.

### CSS and SCSS

```js
// stylelint.config.mjs
export default {
  extends: ['@maggioli-design-system/magma/stylelint/recommended'],
};
```

### Presets

- `recommended`, for a product that already exists: what is broken or not accessible is an
  error, the palette and an internal custom property a warning;
- `strict` (`magma.configs.strict`, `@maggioli-design-system/magma/stylelint/strict`), for a
  new product: every rule is an error.

## Run it after writing

After every change, run ESLint on the templates you touched and Stylelint on the
stylesheets, and fix what they report before you hand the work over:

```bash
npx eslint src
npx stylelint "src/**/*.{css,scss}"
```

An error is something broken or not accessible; a warning of `recommended` is a colour that
does not follow the mode, the named theme and the contrast preference, a custom property a
component may change in any release, or a prop the next major removes. When a rule is wrong about Magma itself, report it
([`reporting.md`](reporting.md)) instead of disabling it.

## Rules

| Rule | Tool | `recommended` | `strict` |
| --- | --- | --- | --- |
| [`valid-attribute-values`](#valid-attribute-values) | ESLint | error | error |
| [`no-false-boolean`](#no-false-boolean) | ESLint | error | error |
| [`accessible-name`](#accessible-name) | ESLint | error | error |
| [`no-deprecated`](#no-deprecated) | ESLint | warn | error |
| [`no-raw-palette-classes`](#no-raw-palette-classes) | ESLint, Stylelint | warn | error |
| [`no-color-scheme-override`](#no-color-scheme-override) | Stylelint | error | error |
| [`no-raw-color`](#no-raw-color) | Stylelint | warning | error |
| [`no-internal-tokens`](#no-internal-tokens) | ESLint, Stylelint | warn | error |

The ESLint rules are named `magma/<rule>` once the preset is loaded, the Stylelint rules
`magma/<rule>` once the plugin (`@maggioli-design-system/magma/stylelint`) is.

### valid-attribute-values

A prop whose type is a union of literals takes one of them (the values each prop takes are
in the component's `AGENTS.md`).

```html
<!-- INCORRECT: tone takes "box", "strong" or "weak" -->
<mds-banner tone="outline">Saved</mds-banner>

<!-- CORRECT -->
<mds-banner tone="weak">Saved</mds-banner>
```

A value bound to an expression (`[tone]="tone"`, `tone={tone}`) is known only at run time and
is not checked; a literal binding (`[tone]="'box'"`) is.

### no-false-boolean

A boolean prop is turned off by removing its attribute
([`conventions.md`](conventions.md#boolean-disabled-and-await-props)): a form-associated
component reads any value as on, `"false"` included.

```html
<!-- INCORRECT -->
<mds-button disabled="false">Save</mds-button>

<!-- CORRECT -->
<mds-button>Save</mds-button>
```

Reported: the string `"false"` in any form, and an Angular attribute binding
(`[attr.disabled]="false"`), which writes the attribute `"false"`. Bind a real boolean to the
property instead: `<MdsButton disabled={isDisabled}>`, `[disabled]="isDisabled"`.

### accessible-name

A component that takes an `icon` next to a `label` or a default slot, shown with its icon
alone, needs a name: without `label` or `aria-label`, `mds-button` is announced by the slug of
its icon, which names the icon and not the action. An `mds-img` with a `src` and no `alt` is
named after its file: describe the image, or set `alt=""` when it is decorative.

```html
<!-- INCORRECT -->
<mds-button icon="mi/baseline/send"></mds-button>
<mds-img src="/img/report-2024.jpg"></mds-img>

<!-- CORRECT -->
<mds-button icon="mi/baseline/send" label="Send"></mds-button>
<mds-img src="/img/report-2024.jpg" alt="Annual report 2024"></mds-img>
```

Left alone, because one element does not show its name: an element with an `id` (an
`mds-tooltip` with `relation="label"`, or an `aria-labelledby` elsewhere, may name it) and
one that spreads its props (`{...props}`).

### no-deprecated

A deprecated prop still works, and the next major removes it. The message quotes its
`@deprecated` text, which says what to use instead; the component's `AGENTS.md` marks the
same props as **Deprecated**.

```html
<!-- INCORRECT: deletable is the old name of dismissible -->
<mds-toast visible deletable duration="0">Invio non riuscito</mds-toast>

<!-- CORRECT -->
<mds-toast visible dismissible duration="0">Invio non riuscito</mds-toast>
```

A prop set by a binding is reported too (`[deletable]="true"`, `deletable={true}`): the name is
deprecated, whatever its value.

### no-raw-palette-classes

A colour class names a role ([`color.md`](color.md)), never Tailwind's palette (`bg-white`,
`text-gray-700`), which ignores Magma, nor a raw Magma step (`bg-tone-neutral-03`,
`border-surface-neutral-default`), which follows the mode only. Variants, `!` and opacity are
read through: `dark:hover:bg-white/50` is `bg-white`.

```html
<!-- INCORRECT -->
<section class="bg-white text-gray-700">...</section>

<!-- CORRECT -->
<section class="bg-surface-raised text-fg-default">...</section>
```

Not reported: `label-*` and `brand-*`, for colour that encodes data, and the seed of a tone,
the pure extreme of the mode.

A class is read wherever the project writes one, in the forms the codemod migrates:

- the `class` attribute of HTML and Angular templates;
- React: every string in a `className` (or `class`) expression, the arguments and object keys
  of `clsx()` or `classnames()`, both branches of a ternary, a `||` fallback, and the fixed
  parts of a template literal;
- Angular: the key of `[class.<name>]` and the quoted strings of `[ngClass]`, `[class]` and
  `[attr.class]`;
- Stylelint: the classes of `@apply`.

```tsx
// INCORRECT
<div className={clsx('p-400', active && 'bg-white')} />

// CORRECT
<div className={clsx('p-400', active && 'bg-surface-raised')} />
```

Not read: a class put together at run time (`bg-${tone}-03`, of which only the fixed parts are
read), classes kept in a variable outside the attribute (`const card = clsx(...)`), and HTML
written as a string in a script (`el.innerHTML = ...`). A string compared in a condition is
read too, and reported only when it is itself a palette class.

### no-color-scheme-override

A `prefers-color-scheme` media query follows the OS, not the mode the user picked
(`mds-pref-mode`). The roles follow both: paint with them, and dark mode comes with no
query. For a deliberate choice that differs per mode, use the `dark` variant of the Magma
Tailwind theme, which follows the Magma mode ([`theming.md`](theming.md)).

```css
/* INCORRECT */
@media (prefers-color-scheme: dark) {
  .panel {
    background: rgb(var(--magma-surface-overlay));
  }
}

/* CORRECT */
.panel {
  background: rgb(var(--magma-surface-raised));
}
```

### no-raw-color

A hex, `rgb()`, `hsl()`, `oklch()` or other colour literal where a role belongs. A colour that
names a token is fine (`rgb(var(--magma-text-muted) / 0.5)`), and so are the keywords
(`currentColor`, `transparent`). In a shadow the hint is the shadow ink,
`rgb(var(--magma-shadow-ink) / <alpha>)`. Not read: `mask` and `mask-image`, and the
`initial-value` of an `@property`.

Not reported either: the public custom properties marked **Static** in a component's
`AGENTS.md`, which take a colour of their own, not a role (the skin of an illustration, the
cover of a book from its catalogue record):

```css
mds-emoji[name='simi'] {
  --mds-emoji-simi-skin: #f5c8a0;
}
```

Any other colour that is not a role keeps its literal under a disable comment that says why:
`/* stylelint-disable-next-line magma/no-raw-color -- <the reason> */`.

### no-internal-tokens

An `--mds-*` custom property, set or read, that no component promises. A component's
`AGENTS.md` lists its public custom properties, the only ones a product sets; the others are
internal, its implementation, and may change or go in any release without notice. A name no
component documents is reported too. Stylelint reads the stylesheets, the classes of `@apply`
included; ESLint reads the inline styles of the templates (a `style` attribute, a React
`style={{ '--mds-<name>': ... }}` object, an Angular `[style.--mds-<name>]` binding) and their
Tailwind classes, wherever [`no-raw-palette-classes`](#no-raw-palette-classes) reads a class,
through variants and `!`: an arbitrary property that sets one
(`[--mds-<name>:<value>]`, on the component or on a parent that sets it for its descendants)
and an arbitrary value that reads one (`bg-[var(--mds-<name>)]`, `bg-(--mds-<name>)`).

```css
/* INCORRECT: internal, it may change in any release */
mds-chip {
  --mds-chip-icon-color: rgb(var(--magma-accent-fg));
}

/* CORRECT: a public custom property of the chip */
mds-chip {
  --mds-chip-icon-background: rgb(var(--magma-accent-surface));
}
```

When no public custom property does what you need, use a prop, a documented part, or a role
on the markup around the component; if none does, ask for one ([`reporting.md`](reporting.md))
rather than setting an internal one.

## Settings

The rules need no settings: they read the `documentation.json` beside them in the installed
`magma`, and the tokens of the `design-tokens` and `styles` it depends on. To check against
other files, set their paths under `settings.magma` in the ESLint configuration (relative to
`root`, the project by default): `documentation`, `tokens`, `consumption`. The Stylelint rules
take the paths they read as secondary options, `root` and `documentation` for `no-internal-tokens`
and `no-raw-color`, `root`, `tokens` and `consumption` for `no-raw-palette-classes`:
`'magma/no-internal-tokens': [true, { documentation: './documentation.json' }]`.
