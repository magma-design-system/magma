# AGENTS.md

Magma is the Maggioli Group Design System: a library of 117 web components (StencilJS), design tokens, SVG icons, brand assets and CSS/Tailwind 4 styles, each published as a separate npm package.

## Stack

- **Monorepo**: NX + npm workspaces
- **Web components**: StencilJS + TypeScript
- **Styles**: Tailwind 4 (CSS custom properties) + CSS cascade layers
- **Tokens**: Style Dictionary + Adobe Leonardo
- **Documentation**: Storybook (Vite builder, `@storybook/react-vite`)
- **Node version**: see `.nvmrc`

## Package manager

Always use **npm**, never Yarn.

## Git governance (read before committing, pushing or opening an issue)

Full rules: `docs/WORKFLOW.md`. Critical constraints for agents:

1. **Never merge into `main` around the queue, never release** - `main` is the only long-lived branch; merging or pushing into it is a manual governance step. Opening a pull request into `main` from your own branch is fine; never merge it, enable auto-merge on it or add it to the merge queue: a maintainer does, with a green pipeline only (a red check is never bypassed, whatever the size of the change), and nobody merges `main` into a branch just to make it mergeable. When the queue removes your pull request (a red check or a conflict), merge `main` into the branch, resolve, rebuild the generated files, run lint and tests, and push. Never open a pull request whose head is `main` (the repository deletes the head branch of a merged pull request). Releases are manual too: a maintainer dispatches the `publish` workflow on `main` (`package` all or one, `channel` stable or beta, or `tag` to publish an existing release again, approved through the `release` environment; it releases, builds and publishes in one run); you may run it with `dry-run: true` to show the plan, nothing more. Before a maintainer queues or auto-merges a pull request, check that no dispatched publish is running (`gh run list --workflow publish.yml --event workflow_dispatch --status in_progress`): a merge that lands on `main` during a stable release makes it fail; warn and wait for the run to end.
2. **One branch per unit of work** - every feature, fix, refactor, etc. lives on its own dedicated branch, branched off `main`. Never work directly on `main`.
3. **Link every branch to its issue** - create work branches from their GitHub issue (Development section button or `gh issue develop <n> --base main`) so they appear in the issue's Development section; a matching name alone does not link. At the latest, the PR body must declare `Closes #<issue>`.
4. **Sync with `main` before pushing** - when committing with intent to push, first check for new commits on `main`; if present, merge `main` into your branch, run the tests, and only then push (always to your branch's own remote, never to `main`).
5. **Label issues by origin** - an issue opened for a problem found in another project carries its `prd-<project>` label (`prd-docs` for the docs site, `prd-mindy` for Mindy) next to the `prg-*` package labels; a new project's label goes into `.github/ISSUE_TEMPLATE/labels.yml` first, or the next `label-sync` run deletes it.

## Tests (read before changing a component)

Full rules: `docs/WORKFLOW.md` rule 5 and the Tests section of `projects/stencil/SPEC.md`. In short:

- **Every behaviour change ships with a test that covers it**, in the same branch, so the change is protected against regressions: props, events, methods, rendered DOM, keyboard/focus handling, form participation, validation, state transitions.
- **Pure style changes are exempt**: padding, margin, colours, radius, typography and similar CSS-only adjustments.
- `*.spec.ts` for logic that does not need a rendered component, `*.e2e.ts` for anything that needs the live DOM. How to write and run them: `projects/stencil/HOWTO.md`.
- **Storybook (`*.stories.tsx`)** adds the visual, interaction (`play` + `storybook/test`) and accessibility (addon-a11y) tests, and the integration scenarios with several components on one page. Add or update a story when necessary; it complements the Vitest tests, it does not replace them. Run them with `nx run stencil:test-storybook` (the `storybook` project of `vitest.config.mts`, via `@storybook/addon-vitest`).

## Mistakes agents make here

The lint and the checks catch most of these; do not write them in the first place:

- Raw Tailwind palette classes (`bg-white`, `text-gray-700`) or palette steps (`--tone-*`) for interface colours: paint with the semantic roles (`bg-surface-raised`, `text-fg-muted`, `rgb(var(--magma-text-muted))`), see `docs/agents/color.md`.
- A literal length, duration or colour in a component sheet: take it from the tokens (`--spacing()`, `var(--duration-*)`, `var(--magma-*)`); `magma/token-values` rejects it.
- `disabled="false"` or `await="false"` to turn a boolean off: remove the attribute.
- Dark mode written by hand (a `dark:` that corrects a role, a bare `@media (prefers-color-scheme: dark)`): the palette flips globally, `dark:` is only for a deliberate per-mode choice in the light DOM (it follows the Magma mode), and a component refines the mode only in its `*-pref-mode.css` sheet, on `:host([pref-mode])` (`projects/stencil/SPEC.md`).
- Typography composed from `font-*` and `text-*` primitives: use the semantic `text-*` utilities (`text-title-h3`, `text-info-detail`).
- Piercing a component's shadow DOM (`>>>`, `/deep/`, an undocumented `::part()` or internal class): style it through its documented custom properties and parts.
- Editing a generated file: a component's `readme.md` (edit its `usage/*.md` and the JSDoc), `magma.api.txt` (rebuild), the packages' `AGENTS.md` and `agents/` (edit `docs/agents/`).
- The commit types `doc` and `refact`: write `docs` and `refactor`, with a scope (`docs/COMMITS.md`).

## Commands

```bash
npm install -g eslint nx                             # global dependencies

npm install                                          # install project dependencies

nx run-many --target=build --all                     # build everything
nx run design-tokens:build                           # build tokens only
nx run styles:build                                  # build styles only
nx run svg-icons:build                               # build the SVG icon set (needed by stencil)
nx run icons:build                                   # build the icon webfont (from svg-icons)
nx run icons:check.dictionary                        # verify dictionary.json matches the SVG sources
nx run icons:add.icons --auto                        # map new SVG sources into the dictionary
nx run stencil:build                                 # build web components
nx run stencil:storybook.start                       # start Storybook
nx run design-tokens:playground                      # start the tokens config playground (port 5177)

nx run stencil:generate mds-component-name           # scaffold a new component
nx run stencil:test                                  # run the unit and browser tests (Vitest)
nx run stencil:test-storybook                        # run the stories' play functions and a11y checks headless (Vitest project `storybook`)
nx run stencil:check.api-snapshot                    # after a build: fail if the committed magma.api.txt differs from the built component API
nx run stencil:check.types                           # after a build: tsc on the tests and stories too (tsconfig.json), as the CI types job
nx run stencil:check.pr-risk                         # the review level of your branch and its semver check against main (what the pr-risk workflow posts)
nx run stencil-react:test                            # run the React wrapper tests (Vitest browser + node projects)
nx run stencil-angular:test                          # run the Angular wrapper tests (Vitest in jsdom, Angular unit-test builder)
nx run lint:build                                    # build the consumer lint (shipped in magma as ./eslint and ./stylelint)
nx run lint:test                                     # run its rule tests on HTML, JSX and Angular templates and on CSS
npm run lint                                         # ESLint + Stylelint on every project (also run in CI)
```

## Sub-projects and build order

```
design-tokens    →  no internal dependencies
identity         →  no internal dependencies
svg-icons        →  no internal dependencies
icons            →  svg-icons (the webfont, not used by the components)
styles           →  design-tokens
stencil          →  design-tokens, styles, svg-icons
stencil-react    →  stencil (wrapper sources generated by the stencil build)
stencil-angular  →  stencil (wrapper sources generated by the stencil build)
```

`lint` (the consumer ESLint and Stylelint rules) ships inside `magma`: the stencil build compiles it into `dist/lint`, so `stencil` depends on it.

**Required build order**: `design-tokens` → `styles`, and `svg-icons`, before `stencil` → `stencil-react`, `stencil-angular` (`nx run-many --target=build --all` follows it)

## Documentation index

| When to consult                                                                        | File                                             |
|----------------------------------------------------------------------------------------|--------------------------------------------------|
| Installing Magma into a consumer app: pick a target, version matrix                    | `docs/agents/SPEC.md`                            |
| Consumer asset setup (styles, fonts, icons, identity) shared by all targets            | `docs/agents/assets.md`                          |
| Install track: plain web components / React / Angular                                  | `docs/agents/{web-components,react,angular}.md`  |
| Rules for using the components and styles, one topic per file (shipped as agents/*.md): conventions, variants, anti-patterns, color, typography, theming, lint | `docs/agents/{conventions,variants,anti-patterns,color,typography,theming,lint}.md` |
| A consumer project's agent reporting a Magma problem: the issue, its labels, the origin label | `docs/agents/reporting.md`               |
| Monorepo architecture, sub-project relationships, component composition patterns, branches, CI and release flow | `docs/ARCHITECTURE.md`           |
| Lint rules for TypeScript/JS and CSS authoring (ESLint + Stylelint)                    | `docs/CODING_STANDARDS.md`                       |
| Commit message convention: allowed types, scopes, special rules                        | `docs/COMMITS.md`                                |
| Contribution workflow and git governance: branching, merge queue, releases, tests, issue labels | `docs/WORKFLOW.md`                      |
| Writing and running tests: Vitest spec, e2e, storybook (play + a11y) and wrapper tests | `projects/stencil/HOWTO.md`                      |
| Navigable catalogue of all 117 components, which per-component file to read, authoring usage docs | `docs/COMPONENTS.md`                  |
| Token families: which ones UI code paints with, how to consume them                    | `docs/TOKENS.md`                                 |
| Editor autocomplete for tokens: setup, generated sheet, extension traps                | `docs/EDITOR_TOKENS.md`                          |
| Design tokens: structure, levels, semantics, naming convention                         | `projects/design-tokens/SPEC.md`                 |
| Adding an icon: dictionary format, source groups, validation, release scopes           | `projects/icons/SPEC.md`                         |
| CSS and Tailwind 4 styles: semantic classes, anti-patterns, dark mode                  | `projects/styles/SPEC.md`                        |
| Web components, contributor rules: entry points, tree-shaking, token fallbacks, icons, tests, usage docs, scaffolding | `projects/stencil/SPEC.md` |
| The consumer lint shipped in magma (`magma/eslint`, `magma/stylelint`): setup per target, what each rule catches; how it is built and how to add a rule | `docs/agents/lint.md`; `projects/lint/README.md` |
| Single component: intent, patterns, anti-patterns (authored)                           | `projects/stencil/src/components/<name>/usage/*.md` |
| Single component: API + usage as shipped (generated by the build)                      | `projects/stencil/dist/collection/components/<name>/AGENTS.md` |

> ⚠️ **Rule**: when you modify a component, update its `usage/*.md` (and the JSDoc of what you changed) too: they generate its shipped docs. When you change tokens or styles with system-wide impact, update `docs/ARCHITECTURE.md`.
