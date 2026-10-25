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
  entry lists, and the entry when its readers or its check change.
- **A choice the contract does not settle** (a spelling, a default, an input it does not cover)
  is written in the producer's section first, then followed by the readers, never guessed by
  one of them (`AGENTS.md`, "A choice with no source").

## `documentation.json` (magma)

- **What**: the API of every component as the build sees it: props and their values, events,
  methods, slots, parts, and the CSS custom properties with their contract (`visibility`
  public or internal, `static`). Beside them, where each component is in the published
  Storybook: `storybook` at the top is its address, `storybook` on a component the id of its
  docs page, which opens at `<storybook>?path=/docs/<id>` (#1148).
- **Produced by**: the stencil build (`--docs-json dist/documentation.json`), then
  `projects/stencil/scripts/component-docs.ts`, which moves the public mark of each `@prop`
  into `visibility` and `static`, and reads the Storybook ids from the stories files
  (`scripts/story-titles-lib.ts`, the id of the meta or its title, through Storybook's own
  `toId`).
- **Contract**: [`projects/stencil/SPEC.md`](../projects/stencil/SPEC.md), "Authoring rules"
  (the styling API and the public mark); [`docs/ARCHITECTURE.md`](ARCHITECTURE.md), 3.5.
- **Read by**: the lint core (`projects/lint/src/core/data.ts`), the component tools of the MCP
  server, the per-component `AGENTS.md` (`component-docs.ts`), `check.usage-docs`, the codemod
  manifest ([`projects/codemod/README.md`](../projects/codemod/README.md), "Regenerating the
  manifest from the docs"), the docs site.
- **Held by**: `component-docs.ts` fails the build on a mark it cannot read
  (`style-contract-lib.spec.ts`) and on a component with no Storybook page of its own
  (`story-titles-lib.spec.ts`); `check.usage-docs`; `check.api-snapshot`.

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
- **Read by**: the token tools of the MCP server (`projects/lint/src/mcp/tokens.ts`: the value
  is `cssValue`, else the DTCG value by its type), the lint core (the raw palette steps), the
  DTCG globals of styles (their aliases), the docs site.
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
- **Contract**: the `mds-icon` usage docs, `2. Pattern.md`;
  [`docs/agents/assets.md`](agents/assets.md), "Tell mds-icon where the icons are".
- **Read by**: the MCP `check_setup` (`icon-path`).
- **Held by**: the `check_setup` test, which collects every line that sets the path from the
  code blocks of the guides.

## The agent guides

- **What**: what the agent of a consumer project reads: the `AGENTS.md` and `agents/*.md` of
  the three entry packages, and the `AGENTS.md`, `pattern.md` and `antipattern.md` of each
  component. Written for a consumer project, never for work on this repository: the root
  `CLAUDE.md` keeps Claude Code from loading the generated ones here.
- **Produced by**: `projects/stencil/scripts/sync-agent-docs.ts` from `docs/agents/`, before the
  stencil build, into the entry packages (gitignored there); `component-docs.ts` from the
  `usage/*.md` of each component, into `dist/collection/components/<tag>/`.
- **Contract**: [`docs/agents/SPEC.md`](agents/SPEC.md) (the entry point and the targets);
  [`projects/stencil/SPEC.md`](../projects/stencil/SPEC.md), "Per-component usage docs".
- **Read by**: the agents of consumer projects, the MCP `get_guide`, the skills of the Claude
  Code plugin (`projects/claude-plugin/scripts/skills.ts`), the docs site.
- **Held by**: `check.usage-docs` (every symbol a guide names exists); `component-docs.ts` fails
  the build on a relative link of a shipped guide that does not resolve inside its package;
  `agent-docs-lib.spec.ts`; `nx run claude-plugin:check`.

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
  Stylelint one), and the tools of the server as data, `dist/lint/mcp/tools.json`, the answer of
  `tools/list`.
- **Produced by**: `projects/lint`; `projects/stencil/scripts/build-lint.ts` writes `tools.json`
  from the compiled server.
- **Contract**: [`projects/lint/README.md`](../projects/lint/README.md), "Where each answer comes
  from".
- **Read by**: the docs site, the reports of ESLint and Stylelint, the MCP clients.
- **Held by**: the lint tests (every rule has a description, the URL of the installed release
  and a heading of `docs/agents/lint.md`; `toolsList` equals the `tools/list` answer).

## Commit scopes and releases

- **What**: the scopes a commit may carry, and which package each one releases.
- **Produced by**: `commitlint.config.js` (the allowed scopes), the `commit-scope` of each
  package in `.github/workflows/publish.yml`, `scripts/release/commit-scopes.mjs`.
- **Contract**: [`docs/COMMITS.md`](COMMITS.md), "Scopes" and "Scopes and releases".
- **Read by**: the release scripts (`scripts/release/`), `check.pr-risk` (the scopes of magma,
  read from `publish.yml`).
- **Held by**: the commit-msg hook (commitlint); `pr-risk-lib.spec.ts`.

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
| The iconsauce plugins (`@iconsauce/material-icons` and the others) | the slug grammar and the Material variants | `projects/lint/src/mcp/icons.ts`, `docs/agents/assets.md` |
| DTCG Format Module 2025.10 | the types and composite types of the token data, and their CSS | `projects/lint/src/mcp/tokens.ts`, the design-tokens README |
| ESLint 9 (`FLAT_CONFIG_FILENAMES`), Stylelint 16 with the search places of cosmiconfig 9 | which configuration file each tool loads | `projects/lint/src/mcp/checks.ts` |
| Tailwind 4, through the consumption map | the colour utilities, and the CSS property each one writes | `projects/lint/src/mcp/tokens.ts` |
| MCP specification 2025-11-25 | the protocol of the server | `projects/lint/src/mcp/protocol.ts` |
| Claude Code memory docs | how `CLAUDE.md` and `AGENTS.md` load, nested ones included | `CLAUDE.md` |
