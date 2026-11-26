# Coding standards

This document is the human- and agent-readable summary of the lint rules enforced across the Magma monorepo. The canonical sources of truth are the config files; if anything here ever conflicts with them, the config wins.

| Layer           | Root config                                       | Project overrides                                                                                                                                                        |
| --------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| TypeScript / JS | [`eslint.config.mjs`](../eslint.config.mjs)       | [`projects/stencil/eslint.config.mjs`](../projects/stencil/eslint.config.mjs), [`projects/design-tokens/eslint.config.mjs`](../projects/design-tokens/eslint.config.mjs) |
| CSS             | [`stylelint.config.mjs`](../stylelint.config.mjs) | [`projects/stencil/stylelint.config.mjs`](../projects/stencil/stylelint.config.mjs)                                                                                      |

Enforcement runs in three places:

- **On save** - if your editor has ESLint and Stylelint extensions installed
- **On commit** - via the `.husky/pre-commit` hook (lint + format on staged files)
- **In CI** - the `lint` workflow ([`.github/workflows/lint.yml`](../.github/workflows/lint.yml)) runs `npm run lint` on every pull request and in the merge queue; a lint error fails the check

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

- **A re-export takes a relative path, never a path alias** (`no-restricted-syntax` on `src/**/*.{ts,tsx}`). Stencil rewrites the aliases of `tsconfig.json` (`@type/*`, `@dictionary/*`, ...) in the `.d.ts` it ships for an import, not for an `export ... from`, so the alias reaches the consumer as a module it cannot resolve (#1357). The rule reads the aliases from `paths`; imports keep using them.

  ```ts
  // ❌ ships as is in dist/types: TS2307 for a consumer with skipLibCheck false
  export * from '@dictionary/file-extensions';
  // ✅
  export * from '../dictionary/file-extensions';
  ```

- **Stencil plugin (`@stencil/eslint-plugin`)** - its `flat/recommended` rule set applies to `src/components/**/*.tsx` (excluding `.storybook/**` and `*.stories.*`).

- **`stencil/strict-mutable` is off** - mutable `@Prop()` is allowed when needed.

- **`stencil/reserved-member-names` is off** - the `autofocus`/`autoFocus` props of mds-button, mds-button-dropdown, mds-input, mds-input-select and mds-input-switch mirror the native attribute on purpose; renaming them would break the public API.

- **Storybook plugin (`eslint-plugin-storybook`)** - `flat/recommended` applies to story files.

- **Ignored directories**: `react`, `angular` (these are auto-generated framework adapters and are not linted).

### Design tokens project

`projects/design-tokens/eslint.config.mjs` adds Jest globals (the token build has test fixtures) and ignores `node_modules`, `dist`, `build`.

### Running ESLint

```bash
# In projects/stencil/
npm run lint.ts       # check
npm run lint:fix      # auto-fix what's fixable

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

In the component sheets `magma/token-values` also rejects `px`, `rem`, `s` and `ms` literals, and literal colours: see [Component sheets: values from the tokens](#component-sheets-values-from-the-tokens).

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

### Component sheets: values from the tokens

`projects/stencil/stylelint.config.mjs` turns on `magma/token-values`, a local plugin ([`projects/stencil/scripts/stylelint-token-values.mjs`](../projects/stencil/scripts/stylelint-token-values.mjs)), for `src/components/**/*.css`: a `px`, `rem`, `s` or `ms` literal in a declaration value is an error, and so is a colour written as a literal (a hex, or an `rgb()` / `hsl()` whose channels are numbers); the message names the token that says it. The rule it enforces is "Values come from the tokens" in [`projects/stencil/SPEC.md`](../projects/stencil/SPEC.md) (Authoring rules).

| Literal                                  | Write instead                                                                                                 |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| a length: `16px`, `1rem`, `3px`, `-8px`  | `--spacing(N)`, N = px x 25 or rem x 400: `--spacing(400)`, `--spacing(400)`, `--spacing(75)`, `--spacing(-200)` |
| a radius                                 | a `var(--magma-radius-*)` step                                                                                |
| a duration on the scale: `300ms`, `0.5s` | `var(--duration-300)`, `var(--duration-500)` (the steps are 75, 100, 150, 200, 300, 500, 700 and 1000 ms)    |
| a colour: `#c4c4c4`, `rgb(73 73 73)`     | a role in the RGB wrapper, whose alpha may stay a literal: `rgb(var(--magma-border-default))`, `rgb(var(--magma-text-muted) / 0.5)` |
| a black shadow: `rgb(0 0 0 / 0.1)`       | `rgb(var(--magma-shadow-ink) / 0.1)`; a black backdrop or scrim is `rgb(var(--magma-backdrop-color) / <alpha>)` |

Not reported: `0` (`0s` keeps its unit, a `<time>` needs it), the `1px` hairline and the `1px` floor of `minmax(1px, 1fr)`, the colours of `mask` and `mask-image` (a mask reads only their alpha), `url()`, and the conditions of `@media` and `@container`, where `var()` is not allowed. The units the plugin does not own (`%`, `fr`, `vw`, `lh`, `deg`) pass. The `initial-value` of a `-property.css` registration is checked too: `projects/styles/scripts/properties.ts` folds `var()` and `--spacing()` down to the literal the registration needs.

A value no token can say keeps its literal under a disable comment that gives the reason, so that review sees it:

```css
:host {
  /* stylelint-disable-next-line magma/token-values -- 725ms, one turn of the spinner, no --duration-* step says it */
  --mds-spinner-duration: 0.725s;
}
```

The kinds so far: a duration off the scale; a length that the component's TypeScript reads with `cssSizeToNumber` (`@common/unit`), which parses `7px` but not the `calc(var(--spacing) * 175)` that `--spacing(175)` compiles to; the white light of a highlight or a glow (`mds-keyboard`), the same in every theme and mode; the paper of a physical object (`mds-book`), which stays paper in dark mode; and the palette of an illustration (`mds-emoji`).

### Component sheets: the design decisions on :host

`magma/host-knobs`, the other local plugin of `projects/stencil/stylelint.config.mjs` ([`projects/stencil/scripts/stylelint-host-knobs.mjs`](../projects/stencil/scripts/stylelint-host-knobs.mjs)), holds "The design decisions on `:host`" and the names of the knobs (Styling API) of [`projects/stencil/SPEC.md`](../projects/stencil/SPEC.md) (Authoring rules, #1499): a colour, a radius, a shadow, a motion (a duration, an easing) or a `z-index` token reaches the rules from a custom property declared on `:host`, so the inspector shows which tokens reach the component.

| Written                                                   | Write instead                                                                                     |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `.box { background-color: rgb(var(--magma-surface-raised)); }` | `:host { --mds-a-box-background: rgb(var(--magma-surface-raised)); }` and `.box { background-color: var(--mds-a-box-background); }` |
| `:host { border-radius: var(--magma-radius-md); }`        | `:host { --mds-a-radius: var(--magma-radius-md); border-radius: var(--mds-a-radius); }`          |
| `:host([variant='info']) .box { color: ... }`             | `:host([variant='info']) { --mds-a-box-color: rgb(var(--magma-info-text-default)); }`, the rule below unchanged |
| `.box { transition-duration: var(--duration-200); }`, `@apply ease-out` | `--mds-a-transition-duration: var(--duration-200)` and `--mds-a-transition-timing-function: var(--ease-out)` on `:host`, read by `.box` |
| `--mds-a-background-selected`, `--mds-a-duration`         | `--mds-a-selected-background`, `--mds-a-transition-duration`: the state before the property, the property in full |
| `--size: --spacing(400)`                                  | a knob `--mds-a-size` with its `@prop`, or a `--private-a-size` for plumbing                      |

Free: spacing, sizes and the rest of the geometry (`gap: --spacing(600)`, `padding: var(--magma-rhythm-inset)`, `aspect-ratio`), the typography classes, `corner-shape: var(--magma-corner-shape)`, the page gutter, the focus ring (`--magma-outline-*`, `@apply focus-bounce`) and `@apply not-hydrated`. Any custom property on `:host` may read a token: a knob, a `--private-*` (the palette of `mds-button`'s variants), a role `--magma-*` declared again. A class applied with `@apply` is of a family by its Tailwind namespace (`ease-*`, `transition*`, `shadow*`, `ring*`, `rounded*`, `z-*`, `bg-*`); a class the component defines with `@utility` in its own sheets is checked where it is written. A token is of a family by its name, read without a build; `scripts/stylelint-host-knobs.spec.ts` holds the names to their source on the real data: a `--magma-*` is a colour when the semantic model (`design-tokens/semantic.model.ts`) declares it a role, or every declaration of it (`styles/css/globals.css`, a component that passes it down) holds a colour; a class is of a family when the CSS Tailwind writes for it on the built theme reads a token of the family.

A knob's name: `--mds-<tag>[-<part>][-<variant>][-<state>]-<property>`, ending with a property stylelint knows (`known-css-properties`, resolved from stylelint itself) or with `radius`, `shadow`, `background`; named by an `@prop` of its component, or of the parent that sets it on its items.

The sheets that do not follow it yet are in [`projects/stencil/scripts/host-knobs-pending.json`](../projects/stencil/scripts/host-knobs-pending.json), relative to `src/components`, each with the count of what the rule reports in it (`"mds-banner/css/mds-banner-cockade.css": 2`): a sheet at its count reports nothing, past it reports everything (the new ones among the rest), below it asks to lower the count. A sheet the file does not name, a new component's included, is held at 0. To bring a component to the rule:

```bash
# In projects/stencil/
npm run list.host-knobs                  # the components, what the rule reports, their count
npm run list.host-knobs -- mds-button    # the reports of one component, sheet by sheet
npm run list.host-knobs -- --lower       # lower the counts to what is reported now (never raises one)
```

A `Public.` knob renamed keeps its old name as a deprecated alias until a major release, read only when the new one is not set and documented as `Deprecated, ...` in its `@prop`, as `mds-modal` keeps `--mds-modal-transition-timing-funciton` (#824).

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

`projects/stencil/stylelint.config.mjs` extends the root and ignores compiled output (`**/dist/*.css`) and non-CSS files (`*.js`, `*.jsx`, `*.svg`). It overrides `import-notation: 'string'` and loads the local plugins `magma/token-values` and `magma/host-knobs`, on for `src/components/**/*.css` only ([Component sheets: values from the tokens](#component-sheets-values-from-the-tokens), [the design decisions on :host](#component-sheets-the-design-decisions-on-host)).

### Running Stylelint

```bash
# In projects/stencil/
npm run lint.css

# Auto-fix where possible
npx stylelint --fix 'src/**/*.css'
```

## Quick reference for AI agents

When writing or editing code in this monorepo:

- **TypeScript**: keep `h` and `Fragment` imports even if unused; respect Stencil plugin rules in `.tsx` files
- **CSS authoring**:
  - Use `rgb(r g b / a)` modern syntax with numeric alpha; never named colors, never `hsl`/`lch`, never short hex
  - Use `px`, `rem`, `%`, `vh`/`vw` for sizing; never `em`/`cm`/`in`/`mm`/`pc`/`pt`
  - In component sheets, lengths, durations and colours come from the tokens (`--spacing(N)`, `var(--magma-radius-*)`, `var(--duration-*)`, `rgb(var(--magma-*) / a)`); a literal only for `0` and the `1px` hairline (`magma/token-values`)
  - In component sheets, a colour, radius, shadow, motion or `z-index` token reaches the rules from a custom property on `:host` (a knob `--mds-<tag>[-<part>][-<variant>][-<state>]-<property>` with its `@prop`); spacing and geometry stay in the rules (`magma/host-knobs`)
  - Sort declarations alphabetically; custom props first; one declaration per line
  - Use specific `background-*` properties, never the `background` shorthand
  - No vendor prefixes (except `-webkit-overflow-scrolling`)
  - Class names lowercase kebab/snake; quote attribute selectors
  - Numeric `font-weight` (`400`, not `normal`)
  - No `todo:` comments; comments must start lowercase
  - Animation/transition durations ≥ 100 ms
- **Before committing**: the pre-commit hook will run lint + format on staged files; fix the issues it reports rather than bypassing the hook.
