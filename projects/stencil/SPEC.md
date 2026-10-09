# stencil SPEC.md

## Purpose

Defines the contributor rules that apply to all Magma web components: entry points, tree-shaking, token fallbacks, preference refinements, icons, tests, usage docs and scaffolding. Read this before working on any component.

The rules for **using** the components (naming, boolean props, events, slots, compound components, icons, accessibility, styling from outside) are written once, for consumers and contributors alike, in [`docs/agents/conventions.md`](../../docs/agents/conventions.md); `variant` / `tone` in [`docs/agents/variants.md`](../../docs/agents/variants.md). A component you write must follow them. For a specific component read its `usage/*.md` and `readme.md` (or the generated `AGENTS.md`, see [`docs/COMPONENTS.md`](../../docs/COMPONENTS.md)).

## Public entry points

Every published entry point is tree-shakeable except the lazy loader, which registers all 114 components by design.

| package         | entry                                                             | what it gives                                                                                      | tree-shakeable                    |
| :-------------- | :---------------------------------------------------------------- | :------------------------------------------------------------------------------------------------- | :-------------------------------- |
| `magma`         | `/components`                                                     | `MdsButton`, `defineCustomElementMdsButton`, ...                                                   | ✅                                |
| `magma`         | `/components/mds-button.js`                                       | one component per file                                                                             | ✅                                |
| `magma`         | `/loader`                                                         | `defineCustomElements()`, registers everything lazily                                              | ❌ by design                      |
| `magma`         | `/hydrate`                                                        | `renderToString()` for SSR (server-only bundle)                                                    | ❌ by design (server bundle)      |
| `magma`         | `.`                                                               | lazy runtime + `IconsSetService` (no components)                                                   | n/a                               |
| `magma`         | `/services`                                                       | `IconsSetService`                                                                                  | n/a                               |
| `magma`         | `/AGENTS.md`, `/agents/*`                                         | the agent docs (install guide, `docs/agents/` fragments)                                           | n/a                               |
| `magma`         | `/dist/documentation.json`, `/dist/collection/components/<tag>/*` | the docs JSON, and per component `AGENTS.md`, `pattern.md`, `antipattern.md`, `documentation.json` | n/a                               |
| `magma-react`   | `.`                                                               | barrel of `Mds*` React wrappers                                                                    | ✅                                |
| `magma-react`   | `/mds-button.js`                                                  | one wrapper per file                                                                               | ✅                                |
| `magma-react`   | `/mds-button.server.js`, `/components.server.js`                  | SSR wrappers, one per file or all at once                                                          | server only                       |
| `magma-angular` | `.`                                                               | standalone proxies, CVAs, `MagmaModule`                                                            | ✅ (AOT prunes `MagmaModule` too) |

```javascript
// web components
import { defineCustomElementMdsButton } from '@maggioli-design-system/magma/components';
defineCustomElementMdsButton();

// React
import { MdsButton } from '@maggioli-design-system/magma-react';

// Angular - standalone, self-registering
import { MdsButton } from '@maggioli-design-system/magma-angular';
```

### What keeps this working

Three things hold the tree-shaking together; breaking any one of them silently ships the whole library:

- **No module-level side effects in component sources.** All three packages declare `sideEffects` (`magma` allows only `**/*.css`). Code that must run once belongs in `connectedCallback`, not at module scope. Stencil annotates `proxyCustomElement(...)` with `/*@__PURE__*/`, and the React output target does the same on `createComponent(...)` - keep it that way.
- **One ES module per component.** Both output targets run with `esModules: true`, and `dist-custom-elements` with `customElementsExportBehavior: 'single-export-module'`. The barrels are pure re-exports.
- **No eager `defineCustomElements()` in the wrappers.** The React and Angular proxies register their own custom element on demand. Importing `magma/loader` from wrapper code (as `MagmaModule.forRoot()` used to) pulls in every component: measured on a probe Angular app, 229 kB in 2 files became 1.9 MB in 142.

`scripts/check-treeshaking.ts` (`npm run check.treeshaking`) asserts all three and guards the bundle size; it runs in CI on every stencil build.

## Authoring rules

What a component must do so that the consumer conventions hold:

- **Tag and children**: `mds-` prefix, lowercase kebab-case; compound children share the parent prefix (`mds-accordion` / `mds-accordion-item`).
- **Props**: a prop with a fixed set of values has a TypeScript type and a dictionary, shared in `src/type/*.ts` (e.g. `tone.ts`, `variant.ts`) or component-specific in its `meta/`. Props that CSS or the consumer select on are `reflect: true`. Text goes through a `label` prop; the default slot is a convenience.
- **Booleans** default to `false` or `undefined`, never `true`.
- **Events** are named `mds<Component><Action>` (`mdsInputChange`, `mdsAccordionChange`) and documented with JSDoc.
- **Styling API**: every CSS custom property the consumer may set is documented with `@prop` in the component CSS, every shadow part with `@part` in the JSDoc. Both land in the generated docs, and they are the only styling surface consumers are allowed to use ([`conventions.md`](../../docs/agents/conventions.md#styling-components-from-outside)): rename or remove one only as a breaking change.
- **Colours** come from the semantic roles (`rgb(var(--magma-surface-raised))`, `rgb(var(--magma-accent-emphasis))`), not from a raw palette step; the exceptions are the ones [`docs/agents/color.md`](../../docs/agents/color.md) lists (`label-*` for colours that encode data, the `--tone-neutral-seed` knockout). The contract: `projects/styles/SEMANTIC_COLOR_SPEC.md`.

### Reading a `--magma-*` token: never write its fallback

A component must render at the intended default even when the consumer has not loaded
`@maggioli-design-system/styles`. That fallback is NOT written by hand: at build time
`scripts/postcss-token-fallbacks.ts` turns every bare `var(--magma-x)` into
`var(--magma-x, <default>)`, reading the default from the same place the stylesheet does (the
design-token dist, the semantic layer, the corner axis, `styles/css/globals.css`).

```css
/* correct - the build injects 3000, the value globals.css declares */
z-index: var(--magma-modal-z-index);

/* incorrect - a second copy of the default, free to drift from the first */
z-index: var(--magma-modal-z-index, 4000);
```

A bare `var(--magma-*)` the injector cannot resolve FAILS the build (`failOnMissing`, limited to
`--magma-*` by `checkPrefixes`): it is a typo or a token that does not exist yet. Component-private
names (`--mds-*`, `--private-*`) are not checked.

### Reading `<html>` preference state from inside a component

Some components ship `*-pref-*.css` files (e.g. `mds-modal-pref-mode.css`) that refine their look for dark / high-contrast / reduced-motion on top of the global palette flip (see `projects/styles/SPEC.md`). Because these files are scoped to the component shadow tree, a normal selector cannot reach the `<html>` element where the `pref-*` classes live, so they use `:host-context(:root.pref-...)` - the only selector that lets a shadow stylesheet test an ancestor's state.

Two facts agents must keep in mind before touching these files:

- `:host-context()` is **Chromium-only** (not Firefox, not Safari). These per-component refinements therefore apply only in Chromium; elsewhere the component simply uses the globally-flipped tokens. This is tolerated, not a bug to "fix" with `@container style()` (which crashes WebKit in the shadow + slotted + inherited-custom-property case).
- The only thing that crosses the shadow boundary inward is the **value of an inherited custom property** (e.g. `var(--magma-surface-default)`, `var(--magma-pref-animation)`), never a selector reaching upward. To make a refinement work cross-browser, resolve it to a token at `:root` and consume the value inside the component, instead of branching on a selector. Removing `:host-context` without that value channel deletes the refinement (the rule then matches nothing inside the shadow tree).

## Tone and variant system

The `variant` (color role) and `tone` (visual intensity) axes, their values and how to
check what one component accepts are documented once, for consumers and contributors,
in [`docs/agents/variants.md`](../../docs/agents/variants.md) (shipped as
`agents/variants.md`). Their typed dictionaries live in `src/type/`.

## Icons

Icons are managed by **iconsauce** ([wiki](https://github.com/iconsauce/docs/wiki)), our open-source build tool. The wiki is the source of truth for iconsauce's CLI, plugin API and per-plugin slug naming.

### How it works

Iconsauce works through **plugins**; each plugin wraps an icon set installed as a node module and defines how a slug resolves to a source SVG file inside that module. A slug like `mi/baseline/close` is resolved by [`@iconsauce/plugin-material-icons`](https://github.com/iconsauce/plugin-material-icons) to the matching SVG inside the `material-design-icons` node module; the equivalent for our internal set is [`@iconsauce/plugin-mgg-icons`](https://github.com/iconsauce/plugin-mgg-icons), whose slugs are semantic names under `mgg/` (`mgg/ai-brain`, `mgg/check-small`).

Iconsauce is driven by an iconsauce config (in magma, [`.storybook/iconsauce.config.mjs`](.storybook/iconsauce.config.mjs)) declaring `content` globs to scan and the active plugins. Source is scanned by both the iconsauce CLI and the [PostCSS plugin](https://github.com/iconsauce/docs/wiki/PostCSS-plugin) (`postcss-iconsauce`), so CSS references like `content: url(...)` are picked up alongside `.tsx` / `.ts` / `.json` slug references.

At build time iconsauce emits the resolved icons through one of two output strategies:

1. **Single icon font** bundling every referenced icon, or
2. **Reorganised SVG files** mirroring the slug path - `mi/baseline/close` becomes `public/assets/mi/baseline/close.svg`

**Magma uses strategy 2** (files). At runtime, `mds-icon` fetches `<mdsIconSvgPath><slug>.svg` from a path the host app configures (recommended via `sessionStorage` - see [`src/components/mds-icon/readme.md`](src/components/mds-icon/readme.md) for the `IconsSetService.setSvgPath` / `setSvgPath` / `mdsIconSvgPathUpdate` alternatives).

### Why iconsauce (not inline SVG or direct icon-lib imports)

- **Tree-shaken at build time** - only slugs referenced in source ship; no full icon set in the bundle
- **Multiple icon sets behind one component** - Material Icons, MDI, `mgg-icons` and any other plugin coexist. Each plugin owns its own slug convention (path-style like `mi/baseline/*` for Material, semantic like `action-email-send` for `mgg-icons`); iconsauce dispatches a slug to the right plugin at build time
- **No SVG in component code** - components stay markup-free; host app controls path, caching and theming via `mdsIconSvgPath` and CSS custom properties

Never inline `<svg>` literals in a component template, and never import from an icon-set package directly - always reference by slug.

### Referencing an icon

```html
<!-- mgg-icons: semantic slug -->
<mds-button icon="mgg/ai-brain">Ask</mds-button>

<!-- material-icons: path slug -->
<mds-icon name="mi/baseline/close"></mds-icon>
```

Minimum host-app setup:

```javascript
window.sessionStorage.setItem('mdsIconSvgPath', '/svg/');
```

`mds-icon` also accepts a base64-encoded data URI or a raw `<svg>` string as `name`, for dynamic icons coming from an API.

### Discovering available slugs

The full catalog of slugs exposed by every configured plugin is committed at [`src/fixtures/icons-dictionary.json`](src/fixtures/icons-dictionary.json) - a flat JSON array (~16.5k entries) covering all Material Icons variants (`mi/{baseline,outline,round,sharp}/*`), MDI (`mdi/*`) and `mgg-icons` (semantic slugs). Grep this file to confirm a slug exists before referencing it.

Do **not** confuse it with `src/fixtures/icons.json` - that one is gitignored and contains only the tree-shaken subset of icons currently referenced in source.

Both files are emitted by the same `build.icons` script: `iconsauce ... --output-dictionary ./src/fixtures/icons.json --output-dump-dictionary ./src/fixtures/icons-dictionary.json`. The first is the tree-shaken slug list (used icons only), the second is the full plugin dump (every available slug). Running `build.icons` keeps both in sync with the currently installed plugin versions.

Iconsauce resolves slugs through async plugins, so the dump order is non-deterministic; `build.icons` chains `sort.icons-dictionary` ([`scripts/sort-icons-dictionary.ts`](scripts/sort-icons-dictionary.ts)) as a post-step to normalise the file to a stable lexicographic order. The script is idempotent - running it twice produces byte-identical output - so the committed dictionary will only diff when the underlying icon set actually changes.

### Adding a new icon

1. Reference the slug from source - iconsauce scans `.tsx` / `.ts` / `.json` and CSS (via `postcss-iconsauce`) per [`.storybook/iconsauce.config.mjs`](.storybook/iconsauce.config.mjs)
2. Run `nx run stencil:build.icons` - regenerates `src/fixtures/icons.json` (tree-shaken slugs), `src/fixtures/icons-dictionary.json` (full catalog) and `assets/svg/` (reorganised SVG files)
3. Configured plugins live in [`.storybook/iconsauce.config.mjs`](.storybook/iconsauce.config.mjs) - currently [`@iconsauce/material-icons`](https://github.com/iconsauce/plugin-material-icons), `@iconsauce/mdi-svg`, [`@iconsauce/mgg-icons`](https://github.com/iconsauce/plugin-mgg-icons). To expose a new icon set, install its node module, add the corresponding iconsauce plugin in `content`, and follow its slug convention - each plugin's README lists its slug rules, and the [iconsauce wiki](https://github.com/iconsauce/docs/wiki) has the overall config schema

If a referenced slug isn't resolvable by any configured plugin, iconsauce reports it on build.

## Public API snapshot

`magma.api.txt` is the public API of the components, one sorted line per member: every prop (attribute, reflect, mutable, required, type, default), event (detail, bubbles, cancelable, composed), method signature, slot, part, `@prop`-documented CSS custom property and custom state, then the declarations of the types they reference. Prose is left out, so rewording a JSDoc does not touch it.

- **The build writes it** (`npm run build.api-snapshot`, last step of `npm run build`), like `src/components.d.ts`: commit it with the change that produced it.
- **Review its diff.** It is what the change does to the contract consumers rely on; a PR that leaves it untouched changes no component API. A removed or changed line is a breaking change unless it only widens what is accepted.
- **CI checks it** (`npm run check.api-snapshot`, after a build) and fails when the committed file differs from the built API. The pure reduction is tested in `scripts/api-snapshot-lib.spec.ts`.
- **It sees only what is documented**: a custom property without `@prop` or a part without `@part` is missing from it, as it is from the generated docs.

## Tests

Every component keeps its tests in `test/` next to its sources (see the scaffold below):

- `mds-component-name.e2e.ts` - component tests rendered in a real Chromium (Playwright), for anything that needs the live DOM: rendering, props, events, methods, keyboard and focus handling, form participation
- `*.spec.ts` - unit tests in the mock-doc environment, for pure logic that does not need a rendered component (validators, parsers, helpers)
- `mds-component-name.stories.tsx` - Storybook stories: visual rendering, interaction tests (`play` functions using `expect` / `fn` from `storybook/test` and the `canvas` / `userEvent` of the play context), accessibility checks (`@storybook/addon-a11y`), and integration scenarios showing several components working together on one page

Rules:

1. **Every behaviour change ships with a test that covers it**, in the same branch, so the change is protected against regressions. Behaviour is anything observable beyond presentation: props and their defaults, emitted events, public methods, rendered DOM structure, keyboard/focus handling, form participation, validation, state transitions. The public API of a new component counts as behaviour.
2. **Pure style changes are exempt**: padding, margin, colours, radius, typography, transitions and similar CSS-only adjustments do not need a test.
3. A bug fix's test should reproduce the bug: fail on the previous implementation, pass on the fix.
4. **Split by tool**: Vitest (`spec` / `e2e`) owns the unit and component tests and is the mandatory part of rule 1; Storybook owns the visual, interaction and accessibility tests and the multi-component pages. Add or update a story when necessary: when the change affects the look, the user interaction, the accessibility or the composition with other components. A story never replaces a Vitest test.

How to write and run the tests (Vitest + `@stencil/vitest`, `render` / `userEvent`, shared-page caveats; the stories via `npm run test-storybook`, the `storybook` Vitest project): [`HOWTO.md`](../../projects/stencil/HOWTO.md#tests).

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
- The list of allowed string values for a prop - that lives in the typed dictionaries (`src/type/*.ts`, or the component's `meta/`)
- Rules that apply to every component - those live in [`docs/agents/`](../../docs/agents/) (`conventions.md`, `variants.md`, `anti-patterns.md`): link them instead of restating them

### Auto-generation flow

`usage/*.md` files are bundled by the Stencil build into `dist/documentation.json` and then injected into `readme.md`; after the build, `scripts/component-docs.ts` writes the shipped per-component docs (`AGENTS.md`, `pattern.md`, `antipattern.md`, `documentation.json`) into `dist/collection/components/<tag>/`. As a consequence:

- **Do not edit `readme.md` or a generated file by hand** - they are regenerated on every build
- **`dist/documentation.json`** is a structured JSON mirror of the same content plus full prop type metadata and cross-references. It is **gitignored** and only exists after a local build - do not assume it is present in a fresh clone or on GitHub
- Which file to read for which question: [`docs/COMPONENTS.md`](../../docs/COMPONENTS.md#which-file-should-the-agent-read)

### Checked in CI

`scripts/check-usage-docs.ts` (`npm run check.usage-docs`, after a build) checks every usage doc against the built API and the token layer, outside the INCORRECT half of the antipattern examples, which is wrong on purpose: every `mds-*` tag, attribute, enumerated value, slot, documented part, event, `--mds-*` property, token and icon slug must exist; no palette step (`--tone-*`, `--variant-*`, `--status-*`) where a semantic role belongs ([`docs/agents/color.md`](../../docs/agents/color.md)), no raw `--radius-*`, no `="false"` boolean, no self-closed `<mds-* />` (HTML leaves it open), no `>>>`, `dark:` or preference media query, a language on every fence, no emoji. It runs in CI on every stencil build; the pure checks are tested in `scripts/usage-docs-lib.spec.ts`.

### Storybook

The three files are also the component's **Docs page** in Storybook. `.storybook/usage-docs.jsx` replaces the autodocs template (`parameters.docs.page` in `.storybook/preview.jsx`) with the default blocks around the usage docs: title and subtitle, `1. Description.md` as the **Description** section, the primary story with its Controls table, then **Pattern** (`2. Pattern.md`) and **Antipattern** (`3. Antipattern.md`). The files are read at runtime through a Vite glob (`?raw`), so editing a `.md` updates the open page without a build; a table of contents (`parameters.docs.toc`) lists the sections and their headings. On the way the `####` headings of the files are shifted right below their section heading, and the repository-relative links (`docs/COMPONENTS.md`, `SPEC.md`, a sibling component) are pointed at GitHub, `dev` branch. Code blocks are left untouched. The transforms live in `.storybook/usage-markdown.ts`, with their spec in `src/storybook/test/`.

A component without a stories file (a part of a compound component, e.g. `mds-table-cell`) has no autodocs page: it gets a `test/<name>.mdx` of a few lines that imports its three files and renders them with `UsageDocs`, under the title of its parent (`Layout / Table / Cell`). Copy one of them when adding such a component. The stories file of a use case (`mds-tree-apk.stories.tsx`) keeps the default autodocs page: only the file named after its component folder, or after a prefix of it (`mds-input-tip-item/test/mds-input-tip.stories.tsx`), carries the usage docs.

### Templates

Authoring templates with inline rules and section prompts live in [`template/usage/`](../../projects/stencil/template/usage). Copy these when adding `usage/` docs to an existing component, or rely on the scaffolder for new ones.

## Scaffolding a new component

```bash
nx run stencil:generate mds-component-name
```

This runs the Stencil CLI generator, which creates `mds-component-name.tsx`, `mds-component-name.css` and, in `test/`, a `.spec.tsx` and an `.e2e.ts`. The two tests are the Stencil boilerplate (`newSpecPage` / `newE2EPage` from `@stencil/core/testing`): rewrite them for Vitest as described in [`HOWTO.md`](HOWTO.md#tests).

Then write the usage docs from the templates: `npm run generate.usage` (from `projects/stencil`, with npm and not Nx: the script prompts, and Nx hides the prompts) compiles [`template/usage/`](../../projects/stencil/template/usage) into the component's `usage/`.

A finished component follows this structure:

```
src/components/mds-component-name/
├── mds-component-name.tsx    ← component logic
├── mds-component-name.css    ← component styles
├── css/                      ← split CSS files (variants, sizes, etc.)
├── meta/                     ← component-specific types, dictionaries, locales
├── usage/                    ← 1. Description.md, 2. Pattern.md, 3. Antipattern.md (canonical docs)
└── test/
    ├── mds-component-name.e2e.ts
    └── mds-component-name.stories.tsx
```
