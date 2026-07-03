# GitHub Copilot instructions - Magma

Magma is the Maggioli Group Design System: ~115 web components built with StencilJS, plus design tokens, SVG icons, brand assets, and CSS / Tailwind 4 styles. Each artifact is published as a separate npm package.

When generating, completing, or reviewing code in this repository, follow the rules below. They mirror what is enforced by ESLint, Stylelint, and commitlint, so suggestions that ignore them will be rejected by the pre-commit hook.

## Stack

- **Monorepo**: Nx + Yarn workspaces (always use `yarn`, never `npm`)
- **Web components**: StencilJS + TypeScript (TSX, JSX pragma is `h`)
- **Styles**: Tailwind 4 with CSS custom properties + cascade layers
- **Tokens**: Style Dictionary + Adobe Leonardo
- **Documentation**: Storybook
- **Required build order**: `design-tokens` → `styles` → `icons` → `stencil`

## Component conventions (Stencil)

- All component tags are prefixed `mds-` and lowercase kebab-case (`mds-button`, `mds-accordion-item`).
- Compound child components share the parent name as prefix and must be **direct slot children** of the parent - no wrapper elements.
- Events are camelCase prefixed with the component name (`mdsButtonClick`, `mdsInputChange`).
- The `default` slot accepts plain text only; named slots accept HTML.
- Prefer the `label` prop over the default slot for text content.
- Boolean props default to `false`/`undefined`. **Never** write `disabled="false"` or `await="false"` - remove the attribute or set it to `undefined`. A non-empty string is truthy in HTML.
- External styling is only via the documented CSS Custom Properties. Do not pierce the shadow DOM (`>>>`, `::part()` is allowed only when documented).
- Keep JSX pragma imports even if they look unused: `import { h, Fragment, Component } from '@stencil/core'`.

## Tone / variant system

Many components accept both `variant` (colour role) and `tone` (visual intensity):

- `variant`: `primary`, `secondary`, `error`, `success`, `warning`, `info`, `ai`, `dark`, `light`, plus label colours (`amaranth`, `red`, `blue`, …)
- `tone`: `strong` (filled), `weak` (tinted), `outline` (bordered), `text` (no background)

The old names `ghost` and `quiet` are deprecated - use `outline` and `text`.

## CSS rules (Stylelint enforced)

- Colours: use modern `rgb(r g b / a)` with numeric alpha. **Never** named colours, short hex, `rgba()`, `hsl()`, or `lch()`. Long hex (`#ffffff`) is required if you need hex.
- For Magma colour tokens, use the RGB wrapper: `rgb(var(--tone-neutral-03) / 0.5)`. Use Magma colour classes (`bg-tone-neutral`, `text-status-error`) instead of raw Tailwind primitives.
- Units: only `px`, `rem`, `%`, `vh`, `vw`, `fr`, `s`, `ms`. **Never** `em`, `cm`, `in`, `mm`, `pc`, `pt`, `ex`.
- Properties: alphabetical order inside a block; custom properties (`--foo`) come first; one declaration per line.
- Never use the `background` shorthand - write `background-color`, `background-image`, etc.
- No vendor prefixes (the lone exception is `-webkit-overflow-scrolling`).
- Numeric `font-weight` (`400`, not `normal`).
- Class names lowercase, kebab- or snake-case (`^[a-z-_]+`).
- Attribute selectors must be quoted: `[type="button"]`.
- Animation/transition durations ≥ `100ms`.
- Comments: lowercase first letter, no `todo:`, whitespace inside `/* foo */`.
- `@import` uses bare-string form: `@import 'foo.css'`, not `@import url('foo.css')`.

## Typography utilities

Use semantic `text-*` utilities, never compose `font-*` + `text-*` primitives manually. Examples: `text-title-h1`…`text-title-h6`, `text-title-action`, `text-info-paragraph`, `text-info-detail`, `text-info-caption`, `text-read-paragraph`, `text-code-snippet`.

## Dark mode

Dark mode is handled at the palette level via `<html>` classes (`pref-theme-system`, `pref-theme-light`, `pref-theme-dark`). Do not write `color-scheme` declarations or `@media (prefers-color-scheme)` queries manually. The same applies to contrast, animation, and consumption preferences (`pref-contrast-*`, `pref-animation-*`, `pref-consumption-*`).

## Per-component documentation

Every component documents its semantic intent in three markdown files inside `projects/stencil/src/components/<name>/usage/`:

- `description.md` - purpose, runtime behaviour, prop intent
- `pattern.md` - numbered list of correct usage patterns with code examples
- `antipattern.md` - numbered list of incorrect uses with `🚫 INCORRECT` / `✅ CORRECT` pairs

These are the **canonical source of truth**. The component's `readme.md` is auto-generated from them by the Stencil build (`usage/*.md` → `documentation.json` → `readme.md`), so **never edit `readme.md` by hand**. Templates for new components live in `projects/stencil/template/usage/*.md.hbs`; the scaffolder is `yarn generate.usage`.

## Commit messages

Format: `type(scope): subject`. Enforced by `commitlint.config.js` via `.husky/commit-msg`.

- Allowed types: `build`, `change`, `chore`, `ci`, `docs`, `feat`, `fix`, `hotfix`, `merge`, `perf`, `refactor`, `revert`, `style`, `test`. Use the standard spellings **`docs`** and **`refactor`** (not `doc` / `refact`).
- Scope is **required**. Use a project name (`design-tokens`, `icons`, `identity`, `lit`, `magma`, `react`, `stencil`, `storybook`, `styles`, `svg-icons`) or a component directory name (`mds-button`, `mds-input`, …).
- `revert` must have an empty scope.
- `style` type cannot be used with `magma`, `icons`, `identity`, `svg-icons` (no CSS in those projects), or `styles` (use `fix(styles)` / `change(styles)` instead).
- Subject is short, imperative, lowercase first word, no trailing period, ≤ 72 characters.

Full rules and examples: [`docs/COMMITS.md`](../docs/COMMITS.md).

## Git governance

The `dev` and `main` branches are protected governance targets integrated **manually** by a maintainer. When generating or automating git actions:

- **Never** merge into `dev` or `main`, push to them directly, or auto-merge a pull request into them.
- Do every unit of work (feature, fix, etc.) on its own dedicated branch, branched off `dev` - never work directly on `dev` or `main`.
- Before pushing, check whether `dev` has new commits; if so, merge `dev` into your branch, run the tests, and only then push to the branch's own remote.

Full rules: [`docs/WORKFLOW.md`](../docs/WORKFLOW.md).

## Where to look for deeper context

| When you need                                                            | Read                                                                  |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| Repo entry point and high-level overview                                 | [`AGENTS.md`](../AGENTS.md)                                           |
| Monorepo architecture and sub-project relationships                      | [`docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md)                     |
| Full lint rule reference (TypeScript + CSS)                              | [`docs/CODING_STANDARDS.md`](../docs/CODING_STANDARDS.md)             |
| Full commit message rules                                                | [`docs/COMMITS.md`](../docs/COMMITS.md)                               |
| Contribution workflow and git governance (branch, merge, push)          | [`docs/WORKFLOW.md`](../docs/WORKFLOW.md)                             |
| Design tokens (structure, levels, semantics, naming)                     | [`projects/design-tokens/SPEC.md`](../projects/design-tokens/SPEC.md) |
| CSS and Tailwind 4 conventions, semantic classes, dark mode, layer order | [`projects/styles/SPEC.md`](../projects/styles/SPEC.md)               |
| Stencil component conventions, composition, accessibility                | [`projects/stencil/SPEC.md`](../projects/stencil/SPEC.md)             |
| A single component's intent, patterns, and anti-patterns                 | `projects/stencil/src/components/<name>/usage/`                       |

## When suggesting a new component

1. Scaffold with `nx run stencil:generate mds-component-name`.
2. Generate the `usage/` triplet with `yarn generate.usage` and fill in the three files (templates in `projects/stencil/template/usage/`).
3. Add Storybook stories under `test/`.
4. Run `yarn lint` before committing.

## Anti-patterns Copilot must avoid

- Suggesting `bg-white`, `bg-gray-500`, or other raw Tailwind colour primitives - use Magma token classes.
- Suggesting `disabled="false"` or `await="false"` - remove the attribute instead.
- Hand-writing `@media (prefers-color-scheme: dark)` - use `pref-theme-*` classes.
- Editing the generated `readme.md` directly - edit `usage/*.md`.
- Suggesting `refact` or `doc` in commit messages - use `refactor` and `docs`.
- Suggesting `em`, `cm`, `pt`, or other disallowed units in CSS.
- Using the `background` shorthand or any vendor-prefixed property.
- Composing typography with raw `font-*` + `text-*` primitives - use semantic `text-*` utilities.
- Piercing the shadow DOM of a component with `>>>` or undocumented internal selectors.
