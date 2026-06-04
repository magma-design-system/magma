# AGENTS.md

Magma is the Maggioli Group Design System: a library of ~115 web components (StencilJS), design tokens, SVG icons, brand assets and CSS/Tailwind 4 styles, each published as a separate npm package.

## Stack

- **Monorepo**: NX + Yarn workspaces
- **Web components**: StencilJS + TypeScript
- **Styles**: Tailwind 4 (CSS custom properties) + CSS cascade layers
- **Tokens**: Style Dictionary + Adobe Leonardo
- **Documentation**: Storybook
- **Node version**: see `.nvmrc`

## Package manager

Always use **Yarn**, never npm.

## Commands

```bash
npm install -g eslint nx yarn                        # global dependencies

yarn install                                         # install project dependencies

nx run-many --target=build --all                     # build everything
nx run design-tokens:build                           # build tokens only
nx run styles:build                                  # build styles only
nx run icons:build                                   # build icons only
nx run stencil:build                                 # build web components
nx run stencil:storybook.start                       # start Storybook

nx run stencil:generate mds-component-name           # scaffold a new component
nx run stencil:test                                  # run spec and e2e tests
```

## Sub-projects and build order

```
design-tokens  →  no internal dependencies
identity       →  no internal dependencies
svg-icons      →  no internal dependencies
styles         →  design-tokens
stencil        →  design-tokens, styles, svg-icons, identity
```

**Required build order**: `design-tokens` → `styles` → `icons` → `stencil`

## Documentation index

| When to consult                                                                        | File                                             |
|----------------------------------------------------------------------------------------|--------------------------------------------------|
| Monorepo architecture, sub-project relationships, component composition patterns       | `docs/ARCHITECTURE.md`                           |
| Lint rules for TypeScript/JS and CSS authoring (ESLint + Stylelint)                    | `docs/CODING_STANDARDS.md`                       |
| Commit message convention: allowed types, scopes, special rules                        | `docs/COMMITS.md`                                |
| Navigable catalogue of all 115 components                                              | `docs/COMPONENTS.md`                             |
| Design token system: structure, naming convention, semantic levels                     | `docs/TOKENS.md`                                 |
| Design tokens: structure, levels, semantics, naming convention                         | `projects/design-tokens/SPEC.md`                 |
| CSS and Tailwind 4 styles: semantic classes, anti-patterns, dark mode                  | `projects/styles/SPEC.md`                        |
| Web components: general Stencil conventions, composition patterns, accessibility rules | `projects/stencil/SPEC.md`                       |
| Single component spec: props, slots, usage examples, anti-patterns                     | `projects/stencil/src/components/<name>/SPEC.md` |

> ⚠️ **Rule**: when you modify a component, update its `SPEC.md` too. When you change tokens or styles with system-wide impact, update `docs/ARCHITECTURE.md`.
