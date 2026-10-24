# Magma MCP server

> Scope: asking Magma precise questions while you work, through the MCP server that ships
> inside `@maggioli-design-system/magma`. Set it up once, when you install Magma; then reach
> for its tools instead of reading whole files.

The server answers from the version installed in the project: the components and their
API, the roles and tokens with what each one is for, the classes of the Magma Tailwind
theme, the icon slugs that exist, the sections of these guides, and the lint
([`lint.md`](lint.md)) on a snippet before it is written. It is read-only: no tool changes
a file.

## Set it up

Nothing to install: the server is the `magma-mcp` command of `@maggioli-design-system/magma`,
which `magma-react` and `magma-angular` require too. The agent's client starts it on stdio
from the project's root; MERGE the entry into the client's configuration, never replace
the file.

### Claude Code: the Magma plugin

In Claude Code, the Magma plugin starts the server for you and adds the skills that run a
whole job: `/magma:setup`, `/magma:review`, `/magma:migrate`, and `ui`, which Claude loads by
itself for UI work. Register it for the whole team in the project's committed
`.claude/settings.json`; Claude Code loads it once the folder is trusted, in the terminal and
in the desktop app, which reads the same settings:

```json
{
  "extraKnownMarketplaces": {
    "magma": { "source": { "source": "github", "repo": "magma-design-system/magma" }, "autoUpdate": true }
  },
  "enabledPlugins": { "magma@magma": true }
}
```

On one machine only, in a Claude Code session in the terminal:
`/plugin marketplace add magma-design-system/magma`, then `/plugin install magma@magma`.

With the plugin, do not also add the `.mcp.json` entry below: the server would run twice.

### Claude Code without the plugin, and the other clients

Claude Code, `.mcp.json` at the project root (committed, so the whole team gets it; Claude
Code asks once before it starts a project server):

```json
{
  "mcpServers": {
    "magma": { "command": "npx", "args": ["--no", "magma-mcp"] }
  }
}
```

VS Code (GitHub Copilot), `.vscode/mcp.json`:

```json
{
  "servers": {
    "magma": { "type": "stdio", "command": "npx", "args": ["--no", "magma-mcp"] }
  }
}
```

Cursor, `.cursor/mcp.json`: the same entry as Claude Code, under `mcpServers`.

`npx --no magma-mcp` runs the installed version, so the answers always match the components
the project uses. Keep `--no`: without it, a client that starts the server before
`npm install` (a fresh clone with the configuration committed) lets `npx` download and run
whatever package the npm registry has under that name; with it, `npx` stops instead. When the
client starts servers elsewhere than the project's root, pass it:
`"args": ["--no", "magma-mcp", "--root", "<the project's folder>"]`.

## The tools

| Tool | Ask it | Instead of |
| --- | --- | --- |
| `find_component` | which component fits a need ("a date range picker") | reading the catalogue |
| `get_component` | the API of one component: props with their values and default, events, methods, slots, parts, public CSS custom properties | reading its `AGENTS.md` |
| `get_usage` | how HTML, React or Angular writes it: import, props, events (`onMdsInputChange`, `(mdsInputChange)`) | guessing the names |
| `list_tokens` | the role for a need ("secondary text"), with its value and class | reading [`color.md`](color.md) |
| `suggest_role` | the role for a colour, a raw class or a palette step | picking a role by eye |
| `explain_class` | what a class does with the Magma theme | the trap of the scale: `p-4` is 0.01rem, `p-400` is 1rem |
| `find_icon` | a slug that exists, by meaning, or whether a slug exists | an `icon="..."` that renders nothing |
| `get_guide` | one section of a guide | reading the whole file |
| `check_markup` | whether a snippet passes the lint, before it is written | a lint run after the fact |
| `check_setup` | what the Magma integration of the project misses | checking the install steps by hand |

`check_markup` uses the ESLint, Stylelint and template parsers the project installed with
the lint ([`lint.md`](lint.md)).

## When to call them

- Before writing a component: `find_component`, then `get_component` and `get_usage`.
- Before a colour, a spacing or a class: `list_tokens`, `suggest_role`, `explain_class`.
- Before an icon: `find_icon`.
- After writing: `check_markup`, then the project's lint ([`lint.md`](lint.md)).
- After the bootstrap, or when something does not render: `check_setup`.
