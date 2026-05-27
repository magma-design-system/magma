# Coding standards

This document is the human- and agent-readable summary of the lint rules enforced across the Magma monorepo. The canonical sources of truth are the config files; if anything here ever conflicts with them, the config wins.

| Layer           | Root config                                       | Project overrides                                                                                                                                                        |
| --------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| TypeScript / JS | [`eslint.config.mjs`](../eslint.config.mjs)       | [`projects/stencil/eslint.config.mjs`](../projects/stencil/eslint.config.mjs), [`projects/design-tokens/eslint.config.mjs`](../projects/design-tokens/eslint.config.mjs) |
| CSS             | [`stylelint.config.mjs`](../stylelint.config.mjs) | [`projects/stencil/stylelint.config.mjs`](../projects/stencil/stylelint.config.mjs)                                                                                      |

Enforcement runs in three places:

- **On save** - if your editor has ESLint and Stylelint extensions installed
- **On commit** - via the `.husky/pre-commit` hook (lint + format on staged files)
- **In CI** - `nx run <project>:lint`

## TypeScript / JavaScript

### Base rules

The root config extends:

- `@eslint/js` recommended
- `typescript-eslint` recommended

Common settings:

- **Target**: ECMAScript 2021 (`ecmaVersion: 12`), `module` source type
- **Globals**: browser + node
- **Ignored**: `**/node_modules`, `**/dist`, `**/.cache`, `**/*.config.*js`, plus everything in `.gitignore`

### Stencil project

`projects/stencil/eslint.config.mjs` layers additional rules on top of the base:

- **JSX pragmas not unused** - `h` and `Fragment` imports are not flagged as unused. They're required for Stencil's TSX compilation.

  ```ts
  // ✅ allowed even if `h` looks unused - Stencil's JSX needs it
  import { h, Fragment, Component } from '@stencil/core';
  ```

- **`@typescript-eslint/no-unused-vars` is `warn`, not error** - drift won't block commits, but should be cleaned up.

- **Stencil plugin (`@stencil/eslint-plugin`)** - its `flat/recommended` rule set applies to `src/components/**/*.tsx` (excluding `.storybook/**` and `*.stories.*`).

- **`stencil/strict-mutable` is off** - mutable `@Prop()` is allowed when needed.

- **Storybook plugin (`eslint-plugin-storybook`)** - `flat/recommended` applies to story files.

- **Ignored directories**: `react`, `angular` (these are auto-generated framework adapters and are not linted).

### Design tokens project

`projects/design-tokens/eslint.config.mjs` adds Jest globals (the token build has test fixtures) and ignores `node_modules`, `dist`, `build`.

### Running ESLint

```bash
# In projects/stencil/
yarn lint.ts          # check
yarn lint:fix         # auto-fix what's fixable

# Monorepo-wide
nx run-many --target=lint --all
```

## CSS

`stylelint.config.mjs` extends:

- `stylelint-config-standard`
- `stylelint-config-recess-order`
- `stylelint-order`

The rules below are the ones that constrain authoring decisions. Many additional internal-correctness rules are also enforced - see the config for the full list.

### Property ordering and layout

| Rule                                                | Effect                                                                                               |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `order/order`                                       | Custom properties (`--foo: …`) come before regular declarations within a block                       |
| `order/properties-alphabetical-order`               | Declarations inside a block are sorted A→Z                                                           |
| `declaration-block-single-line-max-declarations: 1` | One declaration per line                                                                             |
| `block-no-empty`                                    | Empty blocks are forbidden                                                                           |
| `declaration-empty-line-before`                     | Blank line before declarations, with exceptions for first-nested / after-comment / after-declaration |
| `custom-property-empty-line-before`                 | Blank line before custom properties, with same exceptions plus after-custom-property                 |
| `rule-empty-line-before`                            | Blank line before multi-line rules, except first-nested                                              |

```css
/* ✅ correct */
.foo {
  --foo-bg: rgb(0 0 0);

  background-color: rgb(255 255 255);
  color: rgb(0 0 0);
  display: flex;
}

/* 🚫 wrong: property order, multiple decls on one line, empty block */
.bar {
  display: flex;
  color: rgb(0 0 0);
  background-color: rgb(255 255 255);
}

.baz {
}
```

### Colors

| Rule                                       | Effect                                                                          |
| ------------------------------------------ | ------------------------------------------------------------------------------- |
| `color-function-notation: 'modern'`        | Use `rgb(0 0 0 / 0.5)`, not `rgba(0, 0, 0, 0.5)`                                |
| `color-hex-length: 'long'`                 | Use `#ffffff`, not `#fff`                                                       |
| `color-named: 'never'`                     | No CSS named colors (`red`, `white`, `aliceblue`, …)                            |
| `alpha-value-notation: 'number'`           | Use `/ 0.5`, not `/ 50%`                                                        |
| `hue-degree-notation: 'number'`            | Use `hsl(120 …)`, not `hsl(120deg …)` - though `hsl` is also disallowed (below) |
| `function-disallowed-list: ['hsl', 'lch']` | Use `rgb()` (typically with token vars), not `hsl()` or `lch()`                 |
| `function-no-unknown`                      | Unknown color functions are rejected                                            |

```css
/* ✅ correct */
.foo {
  background-color: rgb(255 255 255);
  color: rgb(var(--tone-neutral-03) / 0.5);
}

/* 🚫 wrong */
.foo {
  background-color: white; /* named color */
  background-color: #fff; /* short hex */
  color: rgba(0, 0, 0, 0.5); /* legacy notation */
  color: rgb(0 0 0 / 50%); /* percentage alpha */
  color: hsl(0 0% 0%); /* hsl disallowed */
}
```

### Units

| Rule                                                         | Effect                                                              |
| ------------------------------------------------------------ | ------------------------------------------------------------------- |
| `unit-disallowed-list: ['cm','em','ex','in','mm','pc','pt']` | Only `px`, `rem`, `%`, `vh`, `vw`, `fr`, `s`, `ms`, etc. Never `em` |
| `number-max-precision: 4`                                    | Max 4 decimal places (units `%` and unitless are exempt)            |
| `time-min-milliseconds: 100`                                 | Animation/transition durations must be ≥ 100 ms                     |
| `length-zero-no-unit: null`                                  | `0px` is allowed (rule is disabled)                                 |

```css
/* ✅ correct */
.foo {
  font-size: 1rem;
  padding: 16px;
  transition: opacity 200ms ease;
}

/* 🚫 wrong */
.foo {
  font-size: 1em; /* em disallowed */
  padding: 1in; /* in disallowed */
  transition: opacity 50ms; /* below 100ms minimum */
}
```

### Selectors

| Rule                                  | Effect                                                                                  |
| ------------------------------------- | --------------------------------------------------------------------------------------- |
| `selector-class-pattern: '^[a-z-_]+'` | Class names are lowercase, kebab- or snake-case                                         |
| `selector-attribute-quotes: 'always'` | Always quote attribute selectors: `[type="button"]`, not `[type=button]`                |
| `selector-type-case: 'lower'`         | Element selectors lowercase                                                             |
| `selector-pseudo-class-no-unknown`    | Unknown pseudo-classes rejected                                                         |
| `selector-pseudo-element-no-unknown`  | Unknown pseudo-elements rejected                                                        |
| `selector-type-no-unknown`            | Unknown element selectors rejected, **except** custom elements (`mds-*`) and namespaces |
| `no-duplicate-selectors`              | Same selector cannot appear twice in a file                                             |

```css
/* ✅ correct */
.my-button { … }
mds-button[type="primary"] { … }

/* 🚫 wrong */
.MyButton { … }                /* PascalCase */
[type=button] { … }            /* unquoted attribute */
```

### Properties and values

| Rule                                                | Effect                                                                                 |
| --------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `property-disallowed-list: ['background']`          | Don't use the `background` shorthand. Use `background-color`, `background-image`, etc. |
| `property-no-vendor-prefix`                         | No `-webkit-`, `-moz-`, etc. Exception: `-webkit-overflow-scrolling`                   |
| `value-no-vendor-prefix`                            | No vendor-prefixed values either                                                       |
| `value-keyword-case: 'lower'`                       | Keyword values lowercase: `display: flex`, not `display: Flex`                         |
| `font-weight-notation: 'numeric'`                   | Use `font-weight: 400`, not `font-weight: normal`                                      |
| `shorthand-property-no-redundant-values`            | `padding: 0 0 0 0` is rejected - use `padding: 0`                                      |
| `declaration-block-no-shorthand-property-overrides` | Don't override a longhand with a later shorthand (and vice versa) in the same block    |
| `at-rule-no-vendor-prefix`                          | No vendor-prefixed at-rules                                                            |

```css
/* ✅ correct */
.foo {
  background-color: rgb(255 255 255);
  background-image: url('hero.png');
  font-weight: 400;
}

/* 🚫 wrong */
.foo {
  background: white url('hero.png'); /* shorthand disallowed */
  -webkit-transform: scale(1); /* vendor prefix */
  font-weight: bold; /* must be numeric */
}
```

### At-rules

`@import`, `@layer`, `@apply`, `@include`, `@tailwind`, `@reference`, `@use`, `@container`, `@custom-variant`, `@function`, etc. are allowed and recognised. The full list of permitted custom at-rules is in `at-rule-no-unknown` in the config. Stick to recognised at-rules; if you need a new one, add it to the config first.

```css
/* ✅ correct */
@import 'normalize.css' layer(reset);

@layer base {
  body {
    color: rgb(0 0 0);
  }
}
```

`import-notation: 'string'` requires the bare-string form (`@import 'foo.css'`), not the `url()` form (`@import url('foo.css')`). This is reiterated in `projects/stencil/stylelint.config.mjs`.

### Comments

| Rule                                               | Effect                                                                    |
| -------------------------------------------------- | ------------------------------------------------------------------------- |
| `comment-word-disallowed-list: ['/A-Z/', 'todo:']` | Comments cannot start with an uppercase letter and cannot contain `todo:` |
| `comment-empty-line-before: 'always'`              | Blank line before comments                                                |
| `comment-no-empty`                                 | No empty comments                                                         |
| `comment-whitespace-inside: 'always'`              | Whitespace inside the delimiters: `/* foo */`, not `/*foo*/`              |

```css
/* ✅ correct */

/* base layout overrides */
.foo {
  display: flex;
}

/* 🚫 wrong: leading uppercase, todo, no whitespace */
/* Base layout */
/* todo: change later */
/*foo*/
```

### Animations and timing

- Durations must be ≥ `100ms` (`time-min-milliseconds`)
- `keyframe-declaration-no-important` - never `!important` inside `@keyframes`
- `function-linear-gradient-no-nonstandard-direction` - gradients use modern direction syntax

### Project-specific notes

`projects/stencil/stylelint.config.mjs` extends the root and ignores compiled output (`**/dist/*.css`) and non-CSS files (`*.js`, `*.jsx`, `*.svg`). The only rule override is `import-notation: 'string'`.

### Running Stylelint

```bash
# In projects/stencil/
yarn lint.css

# Auto-fix where possible
npx stylelint --fix 'src/**/*.css'
```

## Quick reference for AI agents

When writing or editing code in this monorepo:

- **TypeScript**: keep `h` and `Fragment` imports even if unused; respect Stencil plugin rules in `.tsx` files
- **CSS authoring**:
  - Use `rgb(r g b / a)` modern syntax with numeric alpha; never named colors, never `hsl`/`lch`, never short hex
  - Use `px`, `rem`, `%`, `vh`/`vw` for sizing; never `em`/`cm`/`in`/`mm`/`pc`/`pt`
  - Sort declarations alphabetically; custom props first; one declaration per line
  - Use specific `background-*` properties, never the `background` shorthand
  - No vendor prefixes (except `-webkit-overflow-scrolling`)
  - Class names lowercase kebab/snake; quote attribute selectors
  - Numeric `font-weight` (`400`, not `normal`)
  - No `todo:` comments; comments must start lowercase
  - Animation/transition durations ≥ 100 ms
- **Before committing**: the pre-commit hook will run lint + format on staged files; fix the issues it reports rather than bypassing the hook.
