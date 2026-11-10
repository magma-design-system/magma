# Data contracts between projects

Code in one project of this monorepo often reads what another one produces: the lint and the
MCP server read `documentation.json` and the token data, the codemod reads the component API,
the skills and the docs site read the guides. Each of these artifacts has a contract, written
once, by its producer. This file is the way in: one entry per artifact, with the section where
its contract is written, who reads it, what must hold and the check that holds it. It holds
pointers only: the contract stays in the section it points to, so there is no second copy to
keep in step.

- **Before writing code that reads an artifact**, read its entry and the section it names, and
  cite that section next to the code.
- **When an artifact changes** what it holds, update the producer's section, every reader the
  entry lists, and the entry when its readers or its check change. When a reader comes or goes,
  or the artifact moves to another file, export or command, update the `Architecture` diagrams
  of the producer and of the readers too ([`ARCHITECTURE.md`](ARCHITECTURE.md), "Diagrams of the
  projects").
- **A choice the contract does not settle** (a spelling, a default, an input it does not cover)
  is written in the producer's section first, then followed by the readers, never guessed by
  one of them (`AGENTS.md`, "A choice with no source").

## `documentation.json` (magma)

- **What**: the API of every component as the build sees it: props and their values, events,
  methods, slots, parts, and the CSS custom properties with their contract (`visibility`
  public or internal, `static`). Beside them, where each component is in the published
  Storybook: `storybook` at the top is its address, `storybook` on a component the id of its
  docs page, which opens at `<storybook>?path=/docs/<id>` (#1148). Beside it, `studio` is the
  address of the published studio, whose pages open at `<studio>#/<page>` (`#/theme`,
  `#/colors/palette`, #1294). Both are folders of the GitHub Pages site of the repository, where
  `deploy-site.yml` publishes the site of `main`, and both stand at the top of the
  `documentation.json` of each component too. And `usage` on each
  component: its hand-written files, keyed by the file name without `.md`, `1. Description`,
  `2. Examples` and `3. Mistakes` (the number only sets the order; `USAGE_FILES` in
  `projects/stencil/scripts/agent-docs-lib.ts`), their links rewritten for the shipped layout.
  The first `html` block of `2. Examples` is the canonical form of the component. Before #1169
  the last two were `2. Pattern` and `3. Antipattern`: a reader that supports a version from
  before the rename accepts both names.
- **Produced by**: the stencil build (`--docs-json dist/documentation.json`), then
  `projects/stencil/scripts/component-docs.ts`, which moves the public mark of each `@prop`
  into `visibility` and `static`, and reads the Storybook ids from the stories files
  (`scripts/story-titles-lib.ts`, the id of the meta or its title, through Storybook's own
  `toId`). The addresses at the top are `PUBLISHED_SITE` of the same file: the Pages site read
  from `repository.url` of the package, the folders the ones `deploy-site.yml` moves the two
  builds into.
- **Contract**: [`projects/stencil/SPEC.md`](../projects/stencil/SPEC.md), "Authoring rules"
  (the styling API and the public mark) and "Per-component usage docs" (the usage files);
  [`docs/ARCHITECTURE.md`](ARCHITECTURE.md), 3.5.
- **Read by**: the lint core (`projects/lint/src/core/data.ts`), the component tools of the MCP
  server, the per-component `AGENTS.md` (`component-docs.ts`), `check.usage-docs`, the codemod
  manifest ([`projects/codemod/README.md`](../projects/codemod/README.md), "Regenerating the
  manifest from the docs"), the studio (`projects/studio/magma-api.ts`: the `variant` and the
  `tone` of each component, for the previews of a colour), the docs site. The docs site reads
  `usage` in
  `src/loaders/components.ts` of `magma-design-system/docs`: the description is the overview of
  a component, the other two its sub-pages, and the first example its preview; it leaves out a
  name it does not know. It links the Storybook from `storybook`, and the studio from a
  constant of its own (`STUDIO` in `src/lib/nav.mjs`) until a release of magma carries
  `studio`.
- **Held by**: `component-docs.ts` fails the build on a mark it cannot read
  (`style-contract-lib.spec.ts`), on a component with no Storybook page of its own
  (`story-titles-lib.spec.ts`) and on a usage file outside `USAGE_FILES`
  (`agent-docs-lib.spec.ts`); `check.usage-docs`; `check.api-snapshot`.
  `story-titles-lib.spec.ts` holds `storybook` and `studio` to the folders of `deploy-site.yml`,
  the studio to the `og:url` of its page and to its link in `docs/agents/theming.md`, and reads
  both in the built file.

## `magma.api.txt` (magma)

- **What**: the public API of magma as text, one member per line, each CSS custom property with
  its contract (`INTERNAL`, `[static]`).
- **Produced by**: `build.api-snapshot`, the last step of the stencil build; committed, never
  edited by hand.
- **Contract**: [`projects/stencil/SPEC.md`](../projects/stencil/SPEC.md), "Public API
  snapshot"; [`docs/WORKFLOW.md`](WORKFLOW.md), "6. Review by risk level".
- **Read by**: `check.pr-risk` (the review level and the semver check posted on every pull
  request), the reviewers.
- **Held by**: `check.api-snapshot` (the committed file equals the built API);
  `api-snapshot-lib.spec.ts`, `pr-risk-lib.spec.ts`.

## The DTCG sets of design-tokens

- **What**: `dist/dtcg/*.tokens.json` and `magma.resolver.json`, every global token in DTCG
  2025.10, each with `$extensions["it.maggioli.magma"]`: `css` (the custom property), `tier`
  (primitive, semantic, internal) and `cssValue` (the CSS, where the CSS writes the quantity
  differently from the JSON).
- **Produced by**: the design-tokens build.
- **Contract**: [`projects/design-tokens/README.md`](../projects/design-tokens/README.md),
  "Token data (DTCG)", with the list of the values the JSON and the CSS write differently;
  [`projects/design-tokens/SPEC.md`](../projects/design-tokens/SPEC.md) for the levels and the
  naming.
- **Read by**: the token tools of the MCP server (`projects/mcp/src/tokens.ts`: the value
  is `cssValue`, else the DTCG value by its type), the lint core (the raw palette steps; the
  custom properties a domain of the design language names as carriers, `css` of the tokens that
  are not internal and of the `cssOnly` entries), the DTCG globals of styles (their aliases), the
  docs site.
- **Held by**: the design-tokens build fails on a group with no `$description` or a stale one
  (`describeGroups`, `staleDescriptions`); the lint tests run every value of the built data
  when it is there.

## The DTCG globals and the consumption map of styles

- **What**: `dist/dtcg/globals.tokens.json` (the `--magma-*` globals, the corner and depth
  axes, in the shape of design-tokens) and `dist/tailwind/consumption.json` (how Tailwind reads
  each token: its namespace and key, the utilities of each namespace, the keywords).
- **Produced by**: the styles build.
- **Contract**: [`projects/styles/README.md`](../projects/styles/README.md), "Token data" and
  "consumption.json"; [`projects/styles/SPEC.md`](../projects/styles/SPEC.md).
- **Read by**: the lint core (the colour utilities of `no-raw-palette-classes`), the token tools
  of the MCP server (`explain_class`; `suggest_role`, whose `USE_OF_UTILITY` says what each
  colour utility paints), the docs site.
- **Held by**: the lint tests hold `USE_OF_UTILITY` to the roots of the `--color` namespace, in
  the fixtures and in the built map.

## `typography.css` (design-tokens)

- **What**: `dist/css/typography.css`, the non-colour tokens (fonts, type sizes, leading,
  spacing, containers, breakpoints, aspect ratios, motion, borders, radii, shadows) and the roles
  of the design language (`--magma-rhythm-*`, `--magma-width-*`, `--magma-container-*`,
  `--text-size-title-<role>`) as custom properties of one `:root {}`: the plain-CSS twin of
  `tailwind-theme-typography.css` (#513), which styles ships unchanged as
  `dist/css/typography.css`.
- **Produced by**: the design-tokens build, format `css/vars-typography`
  (`src/formats/css-vars-typography`) in the `css` platform of
  `src/config/styledictionary/tailwind4.json`, next to the Tailwind theme; the copy step of
  styles (`scripts/copy.ts`).
- **Contract**: [`projects/design-tokens/SPEC.md`](../projects/design-tokens/SPEC.md), "The two
  typography sheets" (what the twin shares with the Tailwind theme and where it differs) and
  "Design language roles"; [`docs/agents/assets.md`](agents/assets.md), "Import order
  (mandatory)", for the page.
- **Read by**: the consumer page, through styles (the import block of the guide, layer
  `theme`); the MCP `render_preview` (`projects/mcp/src/render.ts`: the import block, and the
  `--breakpoint-*` it sizes a render by); the styles build (`scripts/editor-tokens.ts`, the
  `scale` group of the editor sheet; `scripts/properties.ts`, the values that resolve the
  `@property` registrations); the stencil e2e tests that put the tokens on their page
  (`src/test/design-language.e2e.ts`, the `?raw` imports of the component tests).
- **Held by**: `test/typography-root.test.mts` of design-tokens (one `:root` with no Tailwind
  at-rule, the values of the Tailwind theme, and the differences only the bridges, the roles and
  the Tailwind namespaces); `test/roles.test.mts` (the values of the roles and their bridges);
  `test/dtcg-export.test.mts` (the scale and motion of the DTCG export equal the sheet); the
  `render_preview` tests (the widths from the installed styles).

## The mode of a theme

- **What**: `--magma-color-modes`, the one colour mode (`light` or `dark`) a theme can be used
  in, declared first in its `:root[data-theme-name]` block of `themes.css` and of the studio
  export; a theme of both modes declares nothing.
- **Produced by**: design-tokens, `namedThemeCss` and `COLOR_MODES_PROPERTY` of
  `semantic.model.ts`, from `color.modes` of the theme file; the styles build prints
  `themes.css` with it.
- **Contract**: [`projects/styles/SEMANTIC_COLOR_SPEC.md`](../projects/styles/SEMANTIC_COLOR_SPEC.md),
  section 8 ("A theme can lock the mode"); the field in
  [`projects/design-tokens/SPEC.md`](../projects/design-tokens/SPEC.md), "Themes: the public
  format".
- **Read by**: `mds-pref-theme` (`COLOR_MODES_PROPERTY` and `lockedSchemeOf` of
  `projects/stencil/src/common/preference.ts`), which writes `pref-theme-scheme-<mode>` from it.
- **Held by**: `test/theme-manifest.test.mts` of design-tokens (the block of a single-mode
  theme, the shipped themes declare nothing); `src/common/test/preference-modes.spec.ts` of
  stencil (the name the producer exports, the values read); the `mds-pref-theme` e2e;
  `test/themes.test.mts` of the studio (the export of a theme of one mode, the base one under its
  name, each choice of the modes a value of `color.modes`).

## Icon slugs

- **What**: the name `mds-icon` fetches, `mi/<variant>/<name>`, `mdi/<name>` or `mgg/<name>`,
  served at `<path><slug>.svg`.
- **Produced by**: the iconsauce plugins, which decide the grammar (a Material slug has hyphens
  where its folder has underscores; the variants are `baseline`, `outline`, `round` and
  `sharp`). Every slug they serve is dumped into
  `projects/stencil/src/fixtures/icons-dictionary.json` by `nx run stencil:build.icons`.
- **Contract**: [`docs/agents/assets.md`](agents/assets.md), "The contract" (for consumers);
  [`projects/stencil/SPEC.md`](../projects/stencil/SPEC.md), "Icons" and "Discovering available
  slugs".
- **Read by**: `mds-icon`, `check.usage-docs` (`unknown-icon`), the MCP `find_icon`, the copy
  script of `assets.md` (Route 2).
- **Held by**: `agent-docs-icons.spec.ts` (both routes of the guide, with a multi-word slug);
  the `find_icon` tests, held to the dictionary both ways.

## The icon path

- **What**: where `mds-icon` fetches the SVG files from.
- **Produced by**: `IconsSetService`
  (`projects/stencil/src/components/mds-icon/services/icons-set.service.ts`), which reads
  `setSvgPath()` (of the service, or the method of an `mds-icon`) and, as a fallback, the
  `mdsIconSvgPath` key of `sessionStorage`. Nothing else.
- **Contract**: the `mds-icon` usage docs, `2. Examples.md`;
  [`docs/agents/assets.md`](agents/assets.md), "Tell mds-icon where the icons are".
- **Read by**: the MCP `check_setup` (`icon-path`).
- **Held by**: the `check_setup` test, which collects every line that sets the path from the
  code blocks of the guides.

## The agent guides

- **What**: what the agent of a consumer project reads: the `AGENTS.md` and `agents/*.md` of
  the three entry packages, and the `AGENTS.md`, `examples.md` and `mistakes.md` of each
  component. Written for a consumer project, never for work on this repository: the root
  `CLAUDE.md` keeps Claude Code from loading the generated ones here.
- **Produced by**: `projects/stencil/scripts/sync-agent-docs.ts` from `docs/agents/`, before the
  stencil build, into the entry packages (gitignored there); `component-docs.ts` from the
  `usage/*.md` of each component, into `dist/collection/components/<tag>/`.
- **Contract**: [`docs/agents/SPEC.md`](agents/SPEC.md) (the entry point and the targets);
  [`projects/stencil/SPEC.md`](../projects/stencil/SPEC.md), "Per-component usage docs".
- **Read by**: the agents of consumer projects, the MCP `get_guide`, the skills of the Claude
  Code plugin (`projects/claude-plugin/scripts/skills.ts`), the docs site; the studio reads the
  tables of the section Variants of `docs/agents/variants.md` and of its section Tones, from the
  repository (`projects/studio/src/paints.ts`: the colour variants, their kinds, the order of
  the tones).
- **Held by**: `check.usage-docs` (every symbol a guide names exists); `component-docs.ts` fails
  the build on a relative link of a shipped guide that does not resolve inside its package;
  `agent-docs-lib.spec.ts`; `nx run claude-plugin:check`; for the studio,
  `projects/studio/test/paints.test.mts` (the kinds and the tones it reads).

## The patterns

- **What**: the solutions to a task across components that Magma ships as its default, one file
  each (`agents/patterns/<id>.md`, its frontmatter the data, its body the text), with their
  catalogue `agents/patterns.md` and the preview of each case
  (`agents/patterns/previews/<id>/<case>.html`, of a rule of a domain `<domain>/<rule>.html`, of
  a situation of a block `<block>/<situation>.html`, the other examples of each `<id>.<n>.html`
  from 2, #1221: the stage, what to try in it, an optional
  height and `whole-page`, a stage with a frame of its own that takes no inset; never a page,
  the reader adds the stylesheets and the loader, compiles its Tailwind classes with the entry
  point of `agents/assets.md`, "Tailwind (optional)" (#1220), and runs it in a document of its
  own); in magma only, the two images of each preview beside it, `<case>.light.webp` and
  `<case>.dark.webp` (#1243): WebP, every one in the same frame, 1440 x 900 pixels of a layout
  960 x 600 CSS pixels wide, the default theme, for a reader that cannot run the stage; the
  domains of the design language (`kind: design-language`, #1189; `foundation` in magma 2.11
  and before, #1253), the rules of composition the patterns stand on, in the same folder and
  catalogue, each case and rule with the principle it serves (`serves`) and where it lives
  (`carried-by`, `carried-by-planned`);
  the building blocks (`kind: block`, #1210), the sections of a page that come back in two
  patterns or more, with `regions` in the order of the page in place of cases and the patterns
  that use them (`used-by`);
  and the layer a product keeps in its own repository, `magma/patterns/<id>.md`, of the same
  shape.
- **Produced by**: the maintainers, in `docs/agents/patterns/` (the template
  `projects/stencil/template/pattern.md`, `nx run stencil:generate.pattern`, the skills of
  `.claude/skills/`); `projects/stencil/scripts/sync-agent-docs.ts` copies them into the entry
  packages and writes the catalogue; `projects/stencil/scripts/preview-images.ts`, the last step
  of the build of magma, renders the images of the previews (`renderPreviewImages` of
  `projects/mcp/src/render.ts`, the frame `PREVIEW_IMAGE` of the core).
- **Contract**: [`docs/PATTERNS.md`](PATTERNS.md), "The format", "A domain of the design
  language", "The preview of a case" and "Product layers"; the reader side in
  `projects/lint/src/core/patterns.ts` and
  [`projects/lint/README.md`](../projects/lint/README.md), "Where each answer comes from" (what
  `get_pattern` answers of them: [`projects/mcp/README.md`](../projects/mcp/README.md), the same
  section).
- **Read by**: `get_pattern` and `render_preview` (the previews of a case and of a rule of a
  domain, by example) of the MCP server, `get_guide` (each domain as a guide, with its previews) and `get_component` (the rules of the domains that govern
  a component), the `ui`, `review` and `pattern-layer` skills of the Claude Code plugin, `pr-risk`
  (`patternChanges` of `projects/stencil/scripts/pr-risk-lib.ts`), the agents of the products,
  the docs site (the previews: magma-design-system/docs#89; the images, in the cards of the
  galleries: magma-design-system/docs#101), `get_pattern` again (the paths of the images, in
  `images` on the preview of an answer), `mcp:serve.previews` (the previews, live,
  `projects/mcp/scripts/serve-previews.ts`).
- **Held by**: `check.patterns` (the format, every combination in one case, the components,
  attributes, lint rules and links named, the rules of the domains a case names, the carriers
  of a domain in the release and the planned ones not yet, the generated sections; a product's folder with
  `--layer`, which `get_pattern` checks too in the product; each preview of a case, of a rule of
  a domain or of a situation of a block that exists, its examples in sequence,
  only a stage, its markup clean for the strict lint, the cases and the situations of a decided
  block without one as a warning; each preview with its two images of the frame in the build,
  and no image of no preview);
  the build of magma itself, which fails on an image with a problem;
  `check.usage-docs` on their bodies; `test/patterns.test.ts` of `projects/lint` on the files
  of the repository, and `test/mcp-tools.test.ts` of `projects/mcp`, which renders every preview on the build and
  fails on a problem of the image, and renders two into their images; `pr-risk` sets the review
  level to contract on a change to what a pattern promises.

## The surfaces of a class

- **What**: the places a project writes a CSS class: markup, the expressions of a React
  `className` (`clsx()`, ternaries, `||`), Angular `[ngClass]`, `[class]` and `[attr.class]`,
  `@apply`, inline templates.
- **Produced by**: the codemod, `projects/codemod/src/surfaces/` (one module per surface), which
  decides what in an expression is a class.
- **Contract**: the surface modules; [`projects/codemod/README.md`](../projects/codemod/README.md),
  "Usage" (`--framework`).
- **Read by**: the codemod; the class rules of the lint
  ([`projects/lint/README.md`](../projects/lint/README.md), "Where each answer comes from").
- **Held by**: the codemod tests (`src/surfaces/*.test.ts`); the lint tests, one per form and
  parser.

## What the lint and the MCP server say about themselves

- **What**: the description and the URL of each rule (`meta.docs` of an ESLint rule, `meta` of a
  Stylelint one), and the tools of the server as data, `dist/mcp/tools.json`, the answer of
  `tools/list`. The same file is also at `dist/lint/mcp/tools.json`, where the docs site has read
  it since #1127, until the site reads the new path (#1244): the site first, then this path goes.
- **Produced by**: `projects/lint` (the rules) and `projects/mcp` (the tools);
  `projects/stencil/scripts/build-lint.ts` writes `tools.json` from the compiled server.
- **Contract**: [`projects/lint/README.md`](../projects/lint/README.md) and
  [`projects/mcp/README.md`](../projects/mcp/README.md), "Where each answer comes from".
- **Read by**: the docs site, the reports of ESLint and Stylelint, the MCP clients.
- **Held by**: the lint tests (every rule has a description, the URL of the installed release
  and a heading of `docs/agents/lint.md`); the tests of mcp (`toolsList` equals the
  `tools/list` answer; on the build, both files equal `toolsList` and the compiled server
  answers them).

## Commit scopes and releases

- **What**: the scopes a commit may carry, and which package each one releases.
- **Produced by**: `commitlint.config.js` (the allowed scopes), the `commit-scope` of each
  package in `.github/workflows/publish.yml`, `scripts/release/commit-scopes.mjs`.
- **Contract**: [`docs/COMMITS.md`](COMMITS.md), "Scopes" and "Scopes and releases".
- **Read by**: the release scripts (`scripts/release/`), `check.pr-risk` (the scopes of magma,
  read from `publish.yml`).
- **Held by**: the commit-msg hook (commitlint); `pr-risk-lib.spec.ts`.

## The page a render loads

- **What**: what `render_preview` puts on its page and reads off it: the import block of the
  stylesheets, the Tailwind entry point compiled on the classes of the markup with the
  project's Tailwind 4, the lazy loader of the components (`dist/magma-components`), the flag of a
  hydrated component, the Magma breakpoints (`--breakpoint-*` of `typography.css`) and the named
  themes (the previews `--magma-preview-<name>-wash` of `themes.css`, which name every theme with
  the base one, #692, then its `data-theme-name` rules).
- **Produced by**: `docs/agents/assets.md` (the import block, and the Tailwind entry point of
  "Tailwind (optional)" with `projects/styles/dist/tailwind`); the stencil build (the loader, and
  Stencil's `appload` event and `hydrated` flag, `hydratedFlag` of `stencil.config.ts`);
  `projects/styles` (`hydrated.css`, which hides a component until the flag, `typography.css`,
  `themes.css`).
- **Contract**: [`docs/agents/assets.md`](agents/assets.md), "Import order (mandatory)", "Tell
  mds-icon where the icons are" and "Tailwind (optional)";
  [`projects/mcp/README.md`](../projects/mcp/README.md), "Where each answer comes from" (what
  a render loads, and when it is ready).
- **Read by**: the MCP `render_preview` (`projects/mcp/src/render.ts`, `render-page.ts`);
  `mcp:serve.previews` (`projects/mcp/scripts/serve-previews.ts`), on the same page; the pages
  of the studio (`projects/studio/vendor.ts`), through `stylesheetImports`, `loaderOf` and
  `fileOf` of the render, with paths relative to the page; the static site of the studio
  (`projects/studio/site.ts`, on GitHub Pages), which writes as files what `fileOf` serves: the
  stylesheets its pages import and what they load, the folder of the loader, and every icon slug
  of the installed sets (`slugFiles` of `projects/mcp/src/icons.ts`).
- **Held by**: the `render_preview` tests: `STYLESHEETS` and `TAILWIND` equal the blocks of the
  guide, the Magma utilities compile on the classes of the markup, the widths
  and the themes come from the installed styles, and `mds-button` renders hydrated and
  representative on the build of this repository (the `consumer-lint` job, on the build
  artifact); `projects/studio/test/vendor.test.mts` (the imports of a page of the studio in the
  order and the layers of the list, the files served from the installed packages);
  `projects/studio/test/site.test.mts` (the static site, served by a server of files only,
  opens each page with the icons and the fonts and nothing missing); the test of `slugFiles`
  in `projects/mcp/test/mcp-tools.test.ts` (each slug is the file `fileOf` serves).

## The sources of the wrappers

- **What**: the React and Angular wrapper components.
- **Produced by**: the output targets of the stencil build, into `projects/stencil-react/src`
  and `projects/stencil-angular/magma-angular/src/stencil-generated`.
- **Contract**: [`docs/ARCHITECTURE.md`](ARCHITECTURE.md), 2.6 `stencil`.
- **Read by**: the wrapper packages.
- **Held by**: `nx run stencil-react:test`, `nx run stencil-angular:test`.

## External sources

What the code follows from outside the repository, and where each is cited. When a new version
of one of them changes what it decides, the code and the line that cites it change together.

| Source | Decides | Cited in |
| --- | --- | --- |
| The iconsauce plugins (`@iconsauce/material-icons` and the others) | the slug grammar and the Material variants | `projects/mcp/src/icons.ts`, `docs/agents/assets.md` |
| DTCG Format Module 2025.10 | the types and composite types of the token data, and their CSS | `projects/mcp/src/tokens.ts`, the design-tokens README |
| ESLint 9 (`FLAT_CONFIG_FILENAMES`), Stylelint 16 with the search places of cosmiconfig 9 | which configuration file each tool loads | `projects/mcp/src/checks.ts` |
| Tailwind 4, through the consumption map | the colour utilities, and the CSS property each one writes | `projects/mcp/src/tokens.ts` |
| MCP specification 2025-11-25 | the protocol of the server, the image content of a result | `projects/mcp/src/protocol.ts` |
| Playwright (playwright.dev/docs/browsers, docs/api) | the browser channels a render tries, the API floor of the peer range (1.9) | `projects/mcp/src/render.ts` |
| Claude Code (CHANGELOG 2.1.122, MCP docs), Anthropic vision docs | the 2000 px cap on a side of an image, the 25,000 tokens of a tool result | `projects/mcp/src/render.ts` |
| Claude Code memory docs | how `CLAUDE.md` and `AGENTS.md` load, nested ones included | `CLAUDE.md` |
