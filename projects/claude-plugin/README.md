# claude-plugin

The Claude Code plugin of Magma (#1114): the skills that run a whole job with Magma, and the
entry that starts the Magma MCP server (`.mcp.json`, through the launcher `bin/magma-mcp.mjs`,
#1524). It is served
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

## Architecture

The generator fills each template with what it lists, read from where it is decided. Claude Code
gets the plugin from the marketplace of this repository, loads the skills when a job comes up and
starts the server of the magma version installed in the project.

```mermaid
flowchart LR
  MCP["mcp<br/>src/server.ts: toolsOf"]
  AG["docs/agents<br/>SPEC.md, lint.md"]
  CM["codemod<br/>package.json"]
  MKT[".claude-plugin/marketplace.json<br/>at the repository root"]
  subgraph cp["claude-plugin<br/>served from main, not on npm"]
    GEN["scripts/skills.ts<br/>fills templates/, checks"]
    SK["skills/*/SKILL.md<br/>generated, one per template"]
    MAN[".claude-plugin/plugin.json<br/>.mcp.json: bin/magma-mcp.mjs"]
    GEN --> SK
  end
  MCP & AG & CM --> GEN
  MKT --> MAN
  SERVER["stencil<br/>package magma, installed: magma-mcp"] <-.->|"tool calls, stdio"| CC(["Claude Code in the consumer project"])
  MAN -.->|"magma@magma, starts the server"| CC
  SK -.->|"loaded on demand"| CC
  class MCP,AG,MKT,GEN,SK,MAN,CC ai
  class SERVER components
  class CM tooling
  class cp area
  classDef ai fill:#efe5ff,stroke:#8250df,color:#3e1f79
  classDef assets fill:#fff1d6,stroke:#bf8700,color:#5c3d00
  classDef visual fill:#dcf5ec,stroke:#1a7f64,color:#0b4a3a
  classDef components fill:#ddf0ff,stroke:#0969da,color:#0a3069
  classDef tooling fill:#eceff3,stroke:#57606a,color:#24292f
  classDef outside fill:#ffffff,stroke:#8c959f,color:#24292f
  classDef area fill:none,stroke:#8c959f
```

Rectangles: this repository; rounded boxes: outside it. Solid arrows: inside the repository;
dashed: where the package is installed. Labels: the file, export or command that crosses.
Colours: purple ai, amber assets, teal visual, blue components, grey tooling, white outside
([convention](../../docs/ARCHITECTURE.md#diagrams-of-the-projects)).

## Why an MCP server and skills

They are not alternatives: they answer different questions, and the skills call the server.

- **A skill is a procedure**: what to do, and in which order, for a whole job (setting Magma
  up, reviewing, migrating, writing UI). It is Markdown that Claude Code loads when the job
  comes up, by itself (`ui`) or on a command (`/magma:setup`).
- **The server is data and computation**: what is true in the version of Magma installed in the
  project. The skills call its tools; without it, they fall back to the guides installed with
  the package.

Why the data is not in the skills:

1. **The version.** The plugin follows `main` and serves projects on any release, while the
   API, the tokens and the icon slugs change from one release to the next. The server is a
   command of the magma package (`magma-mcp`), so it answers from the `documentation.json`, the
   DTCG data and the consumption map of the version the project installed (#1083).
2. **Computation, not text.** `check_markup` runs the project's ESLint and Stylelint on a
   snippet, `suggest_role` finds the role nearest to a colour, `check_setup` reads the files of
   the project, `explain_class` resolves a class with the Magma theme. A skill could carry
   scripts, but they would be code at the version of `main`, not at the project's.
3. **Other clients.** MCP is a standard: VS Code (GitHub Copilot) and Cursor start the same
   server ([`docs/agents/mcp.md`](../../docs/agents/mcp.md)); the plugin is for Claude Code.
4. **Fewer tokens.** A tool answers one question, where the agent would otherwise read the
   catalogue, the `AGENTS.md` of a component or a whole guide (the "Instead of" column of
   `agents/mcp.md`).

The server is not a remote service: the plugin's launcher starts it from the project's
`node_modules` and Claude Code speaks JSON-RPC to it on stdio, with no network. The order was decided
in #1083: the lint first (deterministic), then the server on the same data core, then the skills
on top.

## How people get it

A person installs it at a scope: for the team (`project`, declared in the committed
`.claude/settings.json`), for themselves in every project (`user`), or in one project only
(`local`, in `.claude/settings.local.json`), with
`claude plugin marketplace add magma-design-system/magma --scope <scope>`, then
`claude plugin install magma@magma --scope <scope>` ([`agents/mcp.md`](../../docs/agents/mcp.md)).
The committed file turns the plugin on for the colleagues but does not download it: Claude Code
downloads a plugin only when the user's settings or an untracked `.claude/settings.local.json`
enable it, so each colleague installs it once per clone
([plugins/loading](https://code.claude.com/docs/en/plugins/loading.md), "Enabled in project
settings but not installed"). A plugin installed in a session loads with `/reload-plugins` or in
the next session.

The bootstrap of the packages' `AGENTS.md` proposes it (#1524): Claude Code, installing Magma
without the `magma:*` skills, says what the plugin gives, asks the scope and installs it, and
asks before writing the `.mcp.json` entry on a no. It also writes a Magma block into the
project's root `AGENTS.md` (and `CLAUDE.md`, when Claude Code reads that instead), so that the
agent of a colleague who opens the project without the plugin proposes it there.

### The launcher

`.mcp.json` starts `bin/magma-mcp.mjs`, not `npx --no magma-mcp`: at scope `user` the plugin runs
in every project of the person, and npx fails where Magma is not installed (it asks the registry
for a package of that name), so Claude Code would show a failed server there. The launcher looks
for `@maggioli-design-system/magma` from the project (`CLAUDE_PROJECT_DIR`) upwards, as Node
resolves a package, and runs its `dist/mcp/cli.js` with `MAGMA_MCP_STARTED_BY=claude-plugin`, so
`check_setup` counts the plugin at any scope. Without it, it answers as a server with no tools,
with instructions only when the project declares magma and has not installed it. Plain Node and
no dependency: Claude Code runs the plugin from its copy of this repository.

## Layout

| Path | What |
| --- | --- |
| `.claude-plugin/plugin.json` | the manifest of the plugin `magma` |
| `.mcp.json` | the Magma MCP server, started through the launcher (#1112, #1524) |
| `bin/magma-mcp.mjs` | the launcher: the server of the magma installed in the project, or a server with no tools |
| `test/` | the tests of the launcher, run as a process on stdio (`nx run claude-plugin:test`) |
| `templates/<name>.md` | the source of each skill |
| `skills/<name>/SKILL.md` | the skills, generated from the templates: do not edit them |
| `scripts/skills.ts` | the generator and its check |

## Changing a skill

1. Edit its template. What a skill lists is filled in by the generator, never copied: the
   package of each target (`docs/agents/SPEC.md`), the tools of the MCP server
   (`projects/mcp/src`), the rules of the lint (`docs/agents/lint.md`), the codemod
   (`projects/codemod/package.json`). `$ARGUMENTS` is what the person wrote after the command.
2. `nx run claude-plugin:build` writes the skills; commit them with the template.
3. `nx run claude-plugin:check` fails when a skill is out of date or breaks the Agent Skills
   format (portable frontmatter keys only, `name` equal to its folder, a description of at most
   1024 characters, ASCII); the `claude-plugin-ci` workflow runs it when the plugin, the server,
   the guides, the codemod or the root toolchain (`package.json`, `package-lock.json`, `.nvmrc`)
   change.
4. With Claude Code installed, `claude plugin validate projects/claude-plugin` and
   `claude plugin validate .` check the manifests as Claude Code reads them.

A new skill is a new template: the generator picks it up. Keep the descriptions precise,
since Claude decides from them when to load a skill on its own.
