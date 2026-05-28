# stencil SPEC.md

## Purpose

Defines general rules, conventions and composition patterns that apply to all Magma web components. Read this before working on any component. For a specific component, also read its own `SPEC.md`.

## Registering components

```javascript
import { defineCustomElements } from '@maggioli-design-system/magma/loader';
defineCustomElements();
```

For React:

```javascript
import { defineCustomElements } from '@maggioli-design-system/magma-react/loader';
```

For Angular, import `MagmaModule` in your `AppModule`:

```typescript
import { MagmaModule } from '@maggioli-design-system/magma-angular';
```

## Naming convention

All components are prefixed with `mds-`. Tag names are lowercase kebab-case. Compound child components share the parent name as a prefix:

```
mds-accordion
mds-accordion-item       ← child of mds-accordion
mds-accordion-timer
mds-accordion-timer-item ← child of mds-accordion-timer
```

## Props

- Props that accept a fixed set of values always have a TypeScript type and a corresponding dictionary exported from `@type/*`
- The `label` prop is the preferred way to pass text content; the default slot is supported for convenience but may be deprecated in future versions
- Props marked `reflect: true` are mirrored as HTML attributes and are safe to use in CSS attribute selectors

### Boolean values

- Boolean props default to `false` or `undefined`, not `true`
- When possible, prefer removing attribute or set it `undefined` instead of set it `false`.

## Events

All custom events are named in camelCase with the component name as prefix:

```
mdsButtonClick      ← from mds-button
mdsInputChange      ← from mds-input
mdsAccordionChange  ← from mds-accordion
```

Listen to events via `addEventListener` or framework-specific bindings:

```javascript
document.querySelector('mds-input').addEventListener('mdsInputChange', (e) => {
  console.log(e.detail.value);
});
```

## Slots

- The `default` slot accepts plain text strings only unless the component explicitly states otherwise
- Named slots (e.g. `slot="header"`, `slot="footer"`) accept HTML elements and components
- Add arbitrary HTML wrappers around slot content only when is not avoidable - it can break component layout and compound component communication

## Styling components from outside

The only supported customisation mechanism is **CSS custom properties** exposed by the component. Each component documents its available properties in `readme.md` under "CSS Custom Properties".

```css
/* correct */
mds-button {
  --mds-button-radius: 999px;
}

/* warning - use it when a deep customization is required */
mds-button::part(icon) {
  fill: rgb(var(--variant-primary-03));
}

/* incorrect - do not pierce shadow DOM */
mds-button >>> .internal-class {
  color: red;
}
```

## Tone and variant system

Many components accept both `variant` and `tone` props. These are independent axes:

- `variant` controls the **color role**: `primary`, `secondary`, `error`, `success`, `warning`, `info`, `ai`, `dark`, `light`
- `tone` controls the **visual intensity**: `strong` (filled), `weak` (tinted), `outline` (bordered), `text` (no background)

#### Variants

| Variant name | Semantic meaning | Description                                                        |
| ------------ | ---------------- | ------------------------------------------------------------------ |
| `primary`    | Theme            | Should be used for most important actions, or messages             |
| `secondary`  | Theme            | Supporting actions or messages that complement the primary variant |
| `error`      | Status           | Communicates failures, destructive actions, or validation issues   |
| `success`    | Status           | Communicates successful operations or positive confirmation        |
| `warning`    | Status           | Communicates caution or non-blocking issues that require attention |
| `info`       | Status           | Communicates neutral informational content or guidance             |
| `ai`         | Service          | Identifies AI-generated content or AI-powered features             |
| `dark`       | Neutral          | Dark neutral coloring, typically for use over light backgrounds    |
| `light`      | Neutral          | Light neutral coloring, typically for use over dark backgrounds    |
| `amaranth`   | Label            | Decorative amaranth label for tags, categories, or visual grouping |
| `red`        | Label            | Decorative red label for tags, categories, or visual grouping      |
| `aqua`       | Label            | Decorative aqua label for tags, categories, or visual grouping     |
| `blue`       | Label            | Decorative blue label for tags, categories, or visual grouping     |
| `green`      | Label            | Decorative green label for tags, categories, or visual grouping    |
| `lime`       | Label            | Decorative lime label for tags, categories, or visual grouping     |
| `orange`     | Label            | Decorative orange label for tags, categories, or visual grouping   |
| `orchid`     | Label            | Decorative orchid label for tags, categories, or visual grouping   |
| `purple`     | Label            | Decorative purple label for tags, categories, or visual grouping   |
| `sky`        | Label            | Decorative sky label for tags, categories, or visual grouping      |
| `violet`     | Label            | Decorative violet label for tags, categories, or visual grouping   |
| `yellow`     | Label            | Decorative yellow label for tags, categories, or visual grouping   |

#### Tones

| Tone name | Description | Additional note                                                       |
| --------- | ----------- | --------------------------------------------------------------------- |
| `strong`  | Theme       | Should be used for most important actions, or messages                |
| `weak`    | Theme       | Subtle background tint for supporting context or medium emphasis      |
| `outline` | Theme       | Bordered without background fill for medium-low emphasis              |
| `text`    | Theme       | Borderless and background-less for lowest emphasis or in-text actions |

> ⚠️ Magma 2.0 breaking rename: `ghost` → `outline`, `quiet` → `text`

## Disabled state

Set `disabled` as a boolean attribute. Never use `disabled="false"` - remove the attribute instead, or set the prop to `undefined`.

```html
<!-- correct -->
<mds-button disabled>...</mds-button>
<mds-button>...</mds-button>

<!-- incorrect -->
<mds-button disabled="false">...</mds-button>
```

## Await / loading state

Components that trigger async operations expose an `await` prop. Setting `await` to `true` shows a loading spinner and prevents interaction.

```html
<mds-button await>Saving...</mds-button>
```

Remove `await` (set to `undefined`, not `false`) when the operation completes.

## Icons

Icons are managed by **iconsauce** ([wiki](https://github.com/iconsauce/docs/wiki)), our open-source build tool. The wiki is the source of truth for iconsauce's CLI, plugin API and per-plugin slug naming.

### How it works

Iconsauce works through **plugins**; each plugin wraps an icon set installed as a node module and defines how a slug resolves to a source SVG file inside that module. A slug like `mi/baseline/close` is resolved by [`@iconsauce/plugin-material-icons`](https://github.com/iconsauce/plugin-material-icons) to the matching SVG inside the `material-design-icons` node module; the equivalent for our internal set is [`@iconsauce/plugin-mgg-icons`](https://github.com/iconsauce/plugin-mgg-icons), which uses semantic slugs like `action-email-send`.

Iconsauce is driven by an `iconsauce.config.js` (in magma, [`.storybook/iconsauce.config.js`](.storybook/iconsauce.config.js)) declaring `content` globs to scan and the active plugins. Source is scanned by both the iconsauce CLI and the [PostCSS plugin](https://github.com/iconsauce/docs/wiki/PostCSS-plugin) (`postcss-iconsauce`), so CSS references like `content: url(...)` are picked up alongside `.tsx` / `.ts` / `.json` slug references.

At build time iconsauce emits the resolved icons through one of two output strategies:

1. **Single icon font** bundling every referenced icon, or
2. **Reorganised SVG files** mirroring the slug path - `mi/baseline/close` becomes `public/assets/mi/baseline/close.svg`

**Magma uses strategy 2** (files). At runtime, `mds-icon` fetches each SVG by slug from a path the host app configures (recommended via `sessionStorage` - see [`src/components/mds-icon/readme.md`](src/components/mds-icon/readme.md) for the `setSvgPath` / `setSvgPathStatic` / `mdsIconSvgPathUpdate` alternatives).

### Why iconsauce (not inline SVG or direct icon-lib imports)

- **Tree-shaken at build time** - only slugs referenced in source ship; no full icon set in the bundle
- **Multiple icon sets behind one component** - Material Icons, MDI, `mgg-icons` and any other plugin coexist. Each plugin owns its own slug convention (path-style like `mi/baseline/*` for Material, semantic like `action-email-send` for `mgg-icons`); iconsauce dispatches a slug to the right plugin at build time
- **No SVG in component code** - components stay markup-free; host app controls path, caching and theming via `mdsIconSvgPath` and CSS custom properties

Never inline `<svg>` literals in a component template, and never import from an icon-set package directly - always reference by slug.

### Referencing an icon

```html
<!-- mgg-icons: semantic slug -->
<mds-button icon="action-email-send">Send</mds-button>

<!-- material-icons: path slug -->
<mds-icon name="mi/baseline/close"></mds-icon>
```

Minimum host-app setup:

```javascript
window.sessionStorage.setItem('mdsIconSvgPath', 'assets/img/svg/');
```

`mds-icon` also accepts a base64-encoded data URI or a raw `<svg>` string as `name`, for dynamic icons coming from an API.

### Discovering available slugs

The full catalog of slugs exposed by every configured plugin is committed at [`src/fixtures/icons-dictionary.json`](src/fixtures/icons-dictionary.json) - a flat JSON array (~16.5k entries) covering all Material Icons variants (`mi/{baseline,outline,round,sharp}/*`), MDI (`mdi/*`) and `mgg-icons` (semantic slugs). Grep this file to confirm a slug exists before referencing it.

Do **not** confuse it with `src/fixtures/icons.json` - that one is gitignored and contains only the tree-shaken subset of icons currently referenced in source.

Both files are emitted by the same `build.icons` script: `iconsauce ... --output-dictionary ./src/fixtures/icons.json --output-dump-dictionary ./src/fixtures/icons-dictionary.json`. The first is the tree-shaken slug list (used icons only), the second is the full plugin dump (every available slug). Running `build.icons` keeps both in sync with the currently installed plugin versions.

### Adding a new icon

1. Reference the slug from source - iconsauce scans `.tsx` / `.ts` / `.json` and CSS (via `postcss-iconsauce`) per [`.storybook/iconsauce.config.js`](.storybook/iconsauce.config.js)
2. Run `nx run stencil:build.icons` - regenerates `src/fixtures/icons.json` (tree-shaken slugs), `src/fixtures/icons-dictionary.json` (full catalog) and `assets/svg/` (reorganised SVG files)
3. Configured plugins live in [`.storybook/iconsauce.config.js`](.storybook/iconsauce.config.js) - currently [`@iconsauce/material-icons`](https://github.com/iconsauce/plugin-material-icons), `@iconsauce/mdi-svg`, [`@iconsauce/mgg-icons`](https://github.com/iconsauce/plugin-mgg-icons). To expose a new icon set, install its node module, add the corresponding iconsauce plugin in `content`, and follow its slug convention - each plugin's README lists its slug rules, and the [iconsauce wiki](https://github.com/iconsauce/docs/wiki) has the overall config schema

If a referenced slug isn't resolvable by any configured plugin, iconsauce reports it on build.

## Accessibility

- `mds-button` automatically sets `role="button"`, `aria-label`, and `title` from the `label` prop or slot content
- Icon-only buttons must have either `label` or an explicit `aria-label` attribute
- Form components (`mds-input`, `mds-input-select`, etc.) are form-associated and participate natively in form submission
- Use `mds-pref-contrast` to let users activate high-contrast mode; do not hard-code high-contrast styles

## Compound component rules

Parent/child component pairs communicate via internal Stencil mechanisms. Rules:

1. Child components must be **direct slot children** of the parent - no wrappers
2. Never use a child component outside its parent (e.g. `mds-accordion-item` without `mds-accordion`)
3. Never mix child types (e.g. do not put `mds-accordion-item` inside `mds-accordion-timer`)

## Per-component usage docs

Every component documents its **semantic intent** in a `usage/` folder containing three markdown files. These are the **canonical source of truth** - agents and developers should read these to understand how a component is meant to be used.

```
src/components/mds-component-name/
└── usage/
    ├── 1. Description.md   ← purpose, semantic behaviour, prop intent
    ├── 2. Pattern.md       ← numbered list of correct usage patterns with code examples
    └── 3. Antipattern.md   ← numbered list of incorrect uses with INCORRECT/CORRECT pairs
```

The `1. ` / `2. ` / `3. ` numeric prefixes exist to control the order of sections in the auto-generated `readme.md` — Stencil sorts usage files alphabetically by filename, and the headings it emits (`### 1. Description`, etc.) double as a deterministic table of contents.

### What each file contains

| File                | Owns                                                                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `1. Description.md` | One-sentence purpose, runtime/semantic behaviour, the **intent** of each prop's values (when to pick `tone="strong"` vs `weak`) |
| `2. Pattern.md`     | 5-12 numbered patterns showing correct, idiomatic use. Each has a "use this when…" line and one code block                      |
| `3. Antipattern.md` | 3-8 numbered anti-patterns. Each pairs an INCORRECT example with the CORRECT alternative and a one-line "why"                   |

### What `usage/` must NOT contain

- The full props table - it is auto-generated into `readme.md` from JSDoc
- The list of allowed string values for a prop - that lives in `meta/*.ts` dictionaries
- Generic stencil rules that apply to every component - those live in this SPEC

### Auto-generation flow

`usage/*.md` files are bundled by the Stencil build into `documentation.json` and then injected into `readme.md`. As a consequence:

- **Do not edit `readme.md` by hand** - it is regenerated on every build
- **`documentation.json`** is a structured JSON mirror of the same content plus full prop type metadata and cross-references. It is **gitignored** (`projects/stencil/.gitignore`) and only exists after a local build - do not assume it is present in a fresh clone or on GitHub
- **Agents reading components** should pick by task:
  - Semantic intent → `usage/*.md` (smallest, always present)
  - Props / events / slots / CSS vars → `readme.md` (always present, ~3-4× smaller than `documentation.json`)
  - Typed prop value sets → `components.d.ts` + `src/type/*.ts`
  - Full type metadata / cross-references (codemods, tooling) → `documentation.json` **if present**; otherwise build first or fall back to `components.d.ts`

### Templates

Authoring templates with inline rules and section prompts live in [`template/usage/`](../../projects/stencil/template/usage). Copy these when adding `usage/` docs to an existing component, or rely on the scaffolder for new ones.

## Scaffolding a new component

```bash
nx run stencil:generate mds-component-name
```

This creates the component folder with the standard file structure:

```
src/components/mds-component-name/
├── mds-component-name.tsx    ← component logic
├── mds-component-name.css    ← component styles
├── css/                      ← split CSS files (variants, sizes, etc.)
├── meta/                     ← TypeScript enums and dictionaries
├── usage/                    ← 1. Description.md, 2. Pattern.md, 3. Antipattern.md (canonical docs)
└── test/
    ├── mds-component-name.e2e.ts
    ├── mds-component-name.stories.tsx
    └── mds-component-name.mdx
```

After scaffolding, fill in the three `usage/*.md` files following the templates in [`template/usage/`](../../projects/stencil/template/usage).

## Regression tests

Always run regression tests after visual changes:

```bash
# Before starting work - create fresh references
nx run stencil:test.regression.reference

# After your changes - review differences
nx run stencil:test.regression.review
```

Tests require Docker to ensure consistent Chrome rendering across machines.
