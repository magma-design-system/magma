# lint

The source of the agent tooling that ships inside Magma: the consumer lint (the ESLint and
Stylelint rules that check a project's code against the installed version of Magma) and the
MCP server that answers an agent from the same data (`src/mcp`). Neither is published on its
own: the stencil build compiles them into `@maggioli-design-system/magma` (`dist/lint`, by
`projects/stencil/scripts/build-lint.ts`), which exports the lint and runs the server as its
`magma-mcp` command:

| Export of `@maggioli-design-system/magma` | What |
| --- | --- |
| `./eslint` | the ESLint plugin, with `configs.recommended` and `configs.strict` |
| `./stylelint` | the Stylelint plugins |
| `./stylelint/recommended`, `./stylelint/strict` | the Stylelint presets |
| `./lint` | the core, for tools that run the same checks |
| `magma-mcp` (bin) | the MCP server on stdio: `dist/lint/mcp/cli.js` |
| `./dist/lint/mcp/tools.json` | the tools of the server as data, the answer of `tools/list`, for the documentation |

So both arrive with the components, at the same version, with nothing for a project to
install or keep aligned. How a project sets them up is in the consumer guides,
[`docs/agents/lint.md`](../../docs/agents/lint.md) and [`docs/agents/mcp.md`](../../docs/agents/mcp.md),
shipped in the packages as `agents/lint.md` and `agents/mcp.md`; the packages' `AGENTS.md`
sets both up at bootstrap.

## Layout

| Folder | What |
| --- | --- |
| `src/core/data.ts` | the data of the installed version: props and values from `documentation.json`, raw palette steps from the DTCG of design-tokens, colour utilities from the consumption map of styles |
| `src/core/element.ts` | the element the template rules check, whatever the template language |
| `src/core/checks.ts` | one check per template rule, pure |
| `src/core/colors.ts` | the colour literals of a CSS value |
| `src/eslint/adapters.ts` | one adapter per parser: HTML (`@html-eslint/parser`), JSX, Angular templates (`@angular-eslint/template-parser`) |
| `src/eslint/index.ts` | the ESLint rules and presets |
| `src/stylelint/` | the Stylelint rules and presets |
| `src/mcp/protocol.ts` | the part of the Model Context Protocol the server speaks, written here so magma carries no SDK: JSON-RPC over stdio, `initialize`, `tools/list`, `tools/call` |
| `src/mcp/*.ts` | the ten read-only tools (components, tokens, icons, guides, checks), the server and its command |

The data is never a list written by hand. Inside magma, the core reads the
`documentation.json` beside it (`dist/documentation.json`) and resolves design-tokens and
styles from where magma is installed, so a rule always checks against the release it ships
in; `settings.magma` points elsewhere.

## Where each answer comes from

The rules and the tools answer what an agent would otherwise guess, so they must not guess
either. Wherever the code has to choose (a spelling, a default, the forms of input a check
accepts), the choice is read from the source that decides it: the guide the check enforces,
the installed data, the upstream package that does the work, the specification. Each choice
and its source is written below and next to the code. An input the source does not cover
answers that it is unknown (no match, no value, an error that says why), never a default
that looks right. A new tool or rule adds its line here, and its test runs on the real data
or on the guide it enforces, not only on fixtures picked by hand.

- **Icon slugs** (`find_icon`, the copy script of `agents/assets.md`): the slug is what
  iconsauce writes, as `mds-icon` documents, not the name of the file in the package.
  `@iconsauce/material-icons` turns the underscores of a Material folder into hyphens
  (`check_circle/baseline.svg` is `mi/baseline/check-circle`) and serves the variants
  `baseline`, `outline`, `round` and `sharp` only. The stencil build dumps every slug the
  plugins serve into `projects/stencil/src/fixtures/icons-dictionary.json`
  ([`projects/stencil/SPEC.md`](../stencil/SPEC.md), "Discovering available slugs"): the tests
  hold `find_icon` to it both ways, and run the routes of the guide
  (`projects/stencil/scripts/agent-docs-icons.spec.ts`) on a multi-word slug.
- **What `check_setup` accepts**: every way its guide documents and every file the tool
  itself loads, not one form picked among them, or the agent adds a second setup to a project
  that has one. The icon path is set where `IconsSetService` reads it: its `setSvgPath()` (or
  the one of an `mds-icon`) and the `mdsIconSvgPath` key of `sessionStorage`, and nowhere
  else; the test collects those lines from the code blocks of the guides. The lint
  configuration is the first file the tool loads: ESLint 9 `FLAT_CONFIG_FILENAMES`, then for
  Stylelint 16 the `stylelint` key of `package.json` and the search places of cosmiconfig 9.
- **Token values** (`list_tokens`, `explain_class`): the value is what the CSS writes. Where the
  package records a `cssValue` (the CSS writes the quantity differently from the JSON:
  `em` letter spacing, ratios, elevations on `--depth`, design-tokens README, "Token data")
  that is the value; otherwise the DTCG value is serialised by its `$type`, as DTCG 2025.10
  defines each type and composite type (a shadow is one `[inset] x y blur spread color` layer
  per item), aliases resolved inside composites too. A type with no single CSS value
  (`typography`, `gradient`) has none, and so does a part with no serialiser: never
  `[object Object]`. The fixtures hold one token of every `$type` and shape the published
  data has, and a test runs every value of the built data when there is one.
- **What a colour paints** (`suggest_role`): each root of the `--color` namespace of the
  consumption map is classified by the CSS property Tailwind writes for it (text, border,
  background, shadow; the masks read only the alpha, no role), in a table a test holds to the
  map, so a new root fails a test instead of reading as a background. A role is matched in
  its family, `--magma-shadow-ink` for a shadow (or a fill, for a glow), and the class keeps
  the utility and the opacity of the class given.
- **Where a rule looks** (`no-internal-tokens`, `no-raw-palette-classes`): everywhere a
  project writes the thing it checks, with the stack Magma ships, not only the first form that
  comes to mind. A custom property is written in an inline style, in a framework binding, in a
  Tailwind class (an arbitrary property or value, behind variants and `!`, read with
  `utilityOf` like the palette classes) and in `@apply`; the tests cover each form on each
  parser. The forms a class is written in, and what in each is a class, are those of the
  codemod, which migrates the same classes (`projects/codemod/src/surfaces`), and both rules
  read them all: the static `class`; every string literal of a JSX `className` or `class`
  expression, so the arguments and object keys of `clsx()` and `classnames()`, both branches
  of a ternary and a `||` fallback (`react.ts`), and every template literal by its fixed parts
  (the codemod reports one with `${}` instead of rewriting it); the key of an Angular
  `[class.x]` and the quoted strings of `[ngClass]`, `[class]` and `[attr.class]`, matched
  with the expression of `angular.ts`; the classes of `@apply` (`css.ts`). As in the codemod,
  a string compared in a condition is read too (it is reported only when it is itself a class
  the rule rejects) and an unquoted `[ngClass]` key is not (a single word, never such a
  class). The palette check of `@apply` is a Stylelint rule named as the ESLint one, as
  `no-internal-tokens` is, not a case of `no-raw-color`: the codemod migrates the palette
  classes of `@apply` as those of markup
  (`projects/codemod/fixtures/css/apply-semantic-utility-classes`), to a role class, the fix
  `no-raw-palette-classes` gives and `no-raw-color` (a colour literal, fixed with
  `rgb(var(--magma-*))`) does not; one name also keeps one switch for one finding. Of
  `inline-templates.ts`, the inline `template` of an Angular component is read through the
  inline-template processor of angular-eslint (`agents/lint.md`); HTML written as a string in
  a script (`el.innerHTML`) is not, since ESLint parses a script with a script parser, which
  sees that HTML as a string.
- **What a tool or a rule says about itself** (the documentation site reads it from the
  installed package, magma-design-system/docs#1): the same fields on both plugins, a
  description and the URL of its section of `agents/lint.md` (an ESLint rule in
  `meta.docs`, a Stylelint rule in its `meta`, which Stylelint gives no description field);
  the tools as `tools.json`, the very object `tools/list` answers. A link a shipped file
  prints points at the release it ships in, the tag `magma@<version>` (`lintGuideUrl`), so
  an older project reads the rule it runs; only the sources, which belong to no release,
  link `main`. The tests hold every rule to a description, its URL and an existing heading
  of the guide.

## Tests

```bash
nx run lint:test
```

The tests run on fixtures cut from the real data (`test/fixtures`: a few components of
`documentation.json`, a few palette tokens, the colour utilities), so they need no build of
the other projects: every template rule on HTML, JSX and Angular templates through ESLint's
`RuleTester`, the CSS rules through Stylelint. The `magma-lint-ci` workflow runs them; the
stencil pipeline builds the package with the lint inside.

## Adding a rule

1. Write the check: a template rule in `src/core/checks.ts` on the element of
   `src/core/element.ts`, a CSS rule in `src/stylelint/`. Read what it needs from the
   installed data (`src/core/data.ts`), not from a list.
2. Register it in `src/eslint/index.ts` or `src/stylelint/index.ts`, with a one-sentence
   description (`createRule`, `metaOf`: the documentation site prints it), and in the
   presets: `recommended` makes what is broken or not accessible an error and token
   discipline a warning, `strict` makes everything an error.
3. Test it on every parser it supports, valid and invalid cases.
4. Document it in [`docs/agents/lint.md`](../../docs/agents/lint.md), with an INCORRECT and a
   CORRECT example, and check that the guides' own examples pass it: the strict preset run
   on every `html` and `css` block of the usage docs reports nothing outside the INCORRECT
   halves.

## The MCP server

`src/mcp/server.ts` puts the ten tools behind the protocol of `src/mcp/protocol.ts`; the
command, `src/mcp/cli.ts`, serves them on stdio from the project it starts in (`--root`
points elsewhere; `--documentation`, `--tokens`, `--consumption`, `--globals` and
`--icons-<set>` point the data elsewhere). The server writes only protocol messages to
stdout. The icon it shows its clients is the Magma mark of identity, copied into
`dist/lint/mcp/icon.svg` by the stencil build, which also writes the tools as data into
`dist/lint/mcp/tools.json`: the answer of `tools/list` (`toolsList`), from the compiled server.

A tool is read-only and answers from data the packages ship: add one in the file of its area,
give it an `outputSchema` its result matches (the official client checks it), register it in
`toolsOf` of `src/mcp/server.ts`, test it on the fixtures (`test/mcp-tools.test.ts`) and in
the call through the official client (`test/mcp-stdio.test.ts`), and list it in
[`docs/agents/mcp.md`](../../docs/agents/mcp.md). Keep the tools few: an agent picks one by its
name and description.

What the server lacks is learned from the agents that use it (#1137). An answer that finds
nothing for a well-formed question, or a tool that says it does not know, carries `gap`
(`GAP` of `src/mcp/context.ts`), and the instructions of the server tell the agent, then,
to propose an issue on Magma as `agents/reporting.md` describes ("A tool or an answer the
MCP server is missing"), only with the user's agreement. An input error never carries
`gap`, and neither does a weak match: the agent judges that one from the instructions.
