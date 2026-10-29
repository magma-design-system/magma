# claude-plugin

The Claude Code plugin of Magma (#1114): the skills that run a whole job with Magma, and the
entry that starts the Magma MCP server (`.mcp.json`, `npx --no magma-mcp`). It is served
from this repository, not from npm: `.claude-plugin/marketplace.json` at the repository root
is the marketplace `magma`, whose plugin `magma` is this folder.

| Skill | Started by | Does |
| --- | --- | --- |
| `/magma:setup` | the person, or Claude on "install Magma" | brings Magma into a project: the package of its target, then the bootstrap of the installed `AGENTS.md`, ending with `check_setup` |
| `/magma:review` | the person, or Claude after UI work | checks the changed files: the lint, `check_markup`, the rules of the guides |
| `/magma:migrate` | the person | Magma 1 to 2 with the codemod: dry run, report, write, lint |
| `/magma:pattern-layer` | the person, or Claude when a product wants a pattern narrowed | writes the layer of a Magma pattern for the product (`magma/patterns/<id>.md`: its open choices, its situations) and checks it with `get_pattern` until it is applied |
| `/magma:ui` | Claude, on UI work in a Magma project | the procedure for writing UI with the tools of the server |

The skills are procedures, not data: the API, the tokens and the rules come from the MCP
server and the guides of the version installed in the project. So the plugin carries no
`version` and follows the commits of `main` (the validator warns about it, on purpose), and
it stays right for a project on any release.

## How people get it

A project registers it for the whole team in its committed `.claude/settings.json`, as
`agents/mcp.md` shows (`extraKnownMarketplaces` with `autoUpdate`, `enabledPlugins`); the
bootstrap of the packages' `AGENTS.md` writes that entry. Claude Code loads the plugin once
the folder is trusted, in the terminal and in the desktop app. One person alone adds it in a
terminal session with `/plugin marketplace add magma-design-system/magma`, then
`/plugin install magma@magma`.

## Layout

| Path | What |
| --- | --- |
| `.claude-plugin/plugin.json` | the manifest of the plugin `magma` |
| `.mcp.json` | the Magma MCP server, started with `npx --no magma-mcp` (#1112) |
| `templates/<name>.md` | the source of each skill |
| `skills/<name>/SKILL.md` | the skills, generated from the templates: do not edit them |
| `scripts/skills.ts` | the generator and its check |

## Changing a skill

1. Edit its template. What a skill lists is filled in by the generator, never copied: the
   package of each target (`docs/agents/SPEC.md`), the tools of the MCP server
   (`projects/lint/src/mcp`), the rules of the lint (`docs/agents/lint.md`), the codemod
   (`projects/codemod/package.json`). `$ARGUMENTS` is what the person wrote after the command.
2. `nx run claude-plugin:build` writes the skills; commit them with the template.
3. `nx run claude-plugin:check` fails when a skill is out of date or breaks the Agent Skills
   format (portable frontmatter keys only, `name` equal to its folder, a description of at most
   1024 characters, ASCII); the `claude-plugin-ci` workflow runs it when the plugin, the server,
   the guides or the codemod change.
4. With Claude Code installed, `claude plugin validate projects/claude-plugin` and
   `claude plugin validate .` check the manifests as Claude Code reads them.

A new skill is a new template: the generator picks it up. Keep the descriptions precise,
since Claude decides from them when to load a skill on its own.
