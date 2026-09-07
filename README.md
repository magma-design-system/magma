# Magma — Maggioli Design System

Magma is the [Maggioli Design System][docs]: a library of ~115 web components (StencilJS), design tokens, SVG icons, brand assets and CSS/Tailwind 4 styles, each published as a separate npm package.

[docs]: https://design-system.maggiolicloud.it/

## Stack

- **Monorepo**: [NX](https://nx.dev/) + npm workspaces
- **Web components**: [StencilJS](https://stenciljs.com/) + TypeScript
- **Styles**: Tailwind 4 (CSS custom properties) + CSS cascade layers
- **Design tokens**: Style Dictionary + Adobe Leonardo
- **Documentation**: Storybook

## Repository structure

```
.
├── docs/                  # Cross-project documentation (architecture, workflow, standards)
│   └── agents/            # Install/usage guides for consumer apps (web components, React, Angular)
├── docker/                # nginx config used by the Storybook Docker image
├── projects/              # The sub-projects (npm workspaces, published npm packages)
│   ├── codemod/           # @maggioli-design-system/magma-codemods — v1 → v2 consumer migration
│   ├── design-tokens/     # @maggioli-design-system/design-tokens — token source + build + playground
│   ├── icons/             # @maggioli-design-system/icons — icon font (Material Design based)
│   ├── identity/          # @maggioli-design-system/identity — Maggioli brand identity assets
│   ├── stencil/           # @maggioli-design-system/magma — the web components library
│   │   ├── react/         # @maggioli-design-system/magma-react — React wrappers
│   │   └── angular/       # Angular wrappers / test app
│   ├── styles/            # @maggioli-design-system/styles — CSS + Tailwind config
│   └── svg-icons/         # @maggioli-design-system/svg-icons — optimized SVG icon set
├── scripts/               # Repo-level utility scripts (release helpers, logging)
├── Dockerfile             # Serves the built Storybook through nginx
├── nx.json                # NX workspace configuration
└── package.json           # Root workspace: shared devDependencies, lint-staged, changelog scripts
```

### Sub-projects

| Project         | Package                                    | What it contains                                                                              |
| --------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------- |
| `design-tokens` | `@maggioli-design-system/design-tokens`    | Design token source (Style Dictionary), Figma token export, a CLI and a Vite-based playground |
| `styles`        | `@maggioli-design-system/styles`           | CSS layers, reset, typography utilities and the Tailwind configuration built on the tokens    |
| `icons`         | `@maggioli-design-system/icons`            | Icon font generated from Google Material Design / Material Design Icons community sets        |
| `svg-icons`     | `@maggioli-design-system/svg-icons`        | The same icon set as optimized standalone SVG files (SVGO)                                    |
| `identity`      | `@maggioli-design-system/identity`         | Maggioli brand identity assets (logos, favicons, fonts)                                       |
| `stencil`       | `@maggioli-design-system/magma`            | The web components library, its Storybook, and the React/Angular wrapper packages            |
| `codemod`       | `@maggioli-design-system/magma-codemods`   | Codemods that migrate consumer code (HTML, React, Angular, CSS) from Magma v1 to v2          |

### Dependencies between projects

```
design-tokens  →  no internal dependencies
identity       →  no internal dependencies
svg-icons      →  no internal dependencies
styles         →  design-tokens
stencil        →  design-tokens, styles, svg-icons, identity
```

**Required build order**: `design-tokens` → `styles` → `icons` → `stencil`

## Getting started

### Requirements

- **Node**: see [.nvmrc](.nvmrc) (minimum `22.15.0`); with NVM run `nvm use`
- **npm** as package manager — always npm, never Yarn
- **NX** and **ESLint** installed globally

```bash
npm install -g eslint nx
```

> Note: if you are using NVM and you change the Node version, you must reinstall global packages for the version you are using.

### Installation

Clone the repository and install the dependencies from the project root:

```bash
git clone git@github.com:magma-design-system/magma.git
cd magma
npm install
```

### Build

Build everything (NX resolves the dependency graph and build order):

```bash
nx run magma:all
# Or
nx run-many --target=build --all
```

The `magma:all` target (defined in the root `project.json`) depends on every project's `build`, so NX schedules them topologically: `design-tokens`, `svg-icons`, `identity` and `codemod` first, then `styles` and `icons`, then `stencil`, and finally `stencil-react` and `stencil-angular`.

Or build a single project:

```bash
nx run design-tokens:build
nx run styles:build
nx run icons:build
nx run svg-icons:build
nx run identity:build
nx run stencil:build
```

NX caches build results. If you need to bypass the cache (e.g. to verify a clean build), add `--skip-nx-cache` — be aware it will slow the build down considerably.

## Running the projects

### Storybook (web components)

The main development environment: it builds the components in watch mode and serves the Storybook documentation on <http://localhost:6006>.

```bash
nx run stencil:storybook.start
```

Make sure `design-tokens`, `styles` and `icons` have been built at least once first (see [Build](#build)).

Other useful `stencil` targets:

```bash
nx run stencil:dev                          # Stencil build in watch mode (dev config, no Storybook)
nx run stencil:generate mds-component-name  # scaffold a new component
nx run stencil:test                         # unit + browser tests (Vitest)
nx run stencil:build.docs                   # regenerate component readme docs
```

### Design tokens playground

An interactive playground to explore and tune the token configuration, served on <http://localhost:5177>:

```bash
nx run design-tokens:playground
```

The project also ships a CLI (`nx run design-tokens:cli`) and a test suite (`nx run design-tokens:test`, Vitest).

### Codemods (v1 → v2 migration)

Migrates consumer code from Magma v1 to v2. Runs in dry-run mode by default; see [projects/codemod/README.md](projects/codemod/README.md) for all the options.

```bash
npx @maggioli-design-system/magma-codemods --path ./src
```

### Lint and format

From the repo root:

```bash
npm run lint          # ESLint + Stylelint on every project
npm run lint:fix      # same, autofixing what it can
npm run format        # Prettier on the whole repo
npm run format:check
```

CI runs the same `npm run lint` on every pull request (`lint` workflow), so a lint error fails the `lint` check.

## Development setup

Using VSCode you should install at least the ESLint extension (Dirk Baeumer) and configure the editor: create `.vscode/settings.json` with the following content:

```json
{
  "eslint.workingDirectories": [
    { "pattern": "./projects/*/" }
  ]
}
```

Commits follow the [Conventional Commits](https://www.conventionalcommits.org/) convention, enforced by commitlint + husky — see [docs/COMMITS.md](docs/COMMITS.md).

## Documentation

| Topic                                                          | File                                                     |
| -------------------------------------------------------------- | -------------------------------------------------------- |
| Monorepo architecture and sub-project relationships            | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)             |
| Contribution workflow and git governance                       | [docs/WORKFLOW.md](docs/WORKFLOW.md)                     |
| Commit message convention                                      | [docs/COMMITS.md](docs/COMMITS.md)                       |
| Lint rules for TypeScript/JS and CSS                           | [docs/CODING_STANDARDS.md](docs/CODING_STANDARDS.md)     |
| Navigable catalogue of all components                          | [docs/COMPONENTS.md](docs/COMPONENTS.md)                 |
| Design token system: structure, naming, semantic levels        | [docs/TOKENS.md](docs/TOKENS.md)                         |
| Installing Magma into a consumer app (all targets)             | [docs/agents/SPEC.md](docs/agents/SPEC.md)               |
| Guidance for AI coding agents working on this repo             | [AGENTS.md](AGENTS.md)                                   |

Each sub-project also has its own `README.md`, and `design-tokens`, `styles` and `stencil` have a `SPEC.md` with in-depth conventions.
