# Magma MCP server

> Scope: asking Magma precise questions while you work, through the MCP server that ships
> inside `@maggioli-design-system/magma`. Set it up once, when you install Magma; then reach
> for its tools instead of reading whole files.

The server answers from the version installed in the project: the components and their
API, the roles and tokens with what each one is for, the classes of the Magma Tailwind
theme, the icon slugs that exist, the sections of these guides, the lint
([`lint.md`](lint.md)) on a snippet before it is written, and an image of markup rendered
with the installed components. No tool changes the project's code: only `render_preview`
writes, its images, into `node_modules/.cache/magma/previews/`.

## Set it up

Nothing to install: the server is the `magma-mcp` command of `@maggioli-design-system/magma`,
which `magma-react` and `magma-angular` require too. The agent's client starts it on stdio
from the project's root; MERGE the entry into the client's configuration, never replace
the file.

### Claude Code: the Magma plugin

In Claude Code, the Magma plugin starts the server for you and adds the skills that run a
whole job: `/magma:setup`, `/magma:review`, `/magma:migrate`, `/magma:pattern-layer` (the
layer of a pattern for the product, [`patterns.md`](patterns.md)), and `ui`, which Claude loads
by itself for UI work. Register it for the whole team in the project's committed
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

OpenCode, `opencode.json` (or `opencode.jsonc`) at the project root: a `local` server, whose
`command` lists the program and its arguments. OpenCode 2 reads the servers under
`mcp.servers`:

```json
{
  "mcp": {
    "servers": {
      "magma": { "type": "local", "command": ["npx", "--no", "magma-mcp"] }
    }
  }
}
```

OpenCode 1 reads them right under `mcp` (`"mcp": { "magma": { ... } }`), a form OpenCode 2
still reads but deprecates.

`render_preview` also needs a browser driver, which Magma does not install:
`npm i -D playwright-core` (a project with `@playwright/test` has it already). It drives the
Google Chrome or Microsoft Edge of the machine and downloads no browser; on a machine with
neither, `npx playwright install chromium`.

`npx --no magma-mcp` runs the installed version, so the answers always match the components
the project uses. Keep `--no`: without it, a client that starts the server before
`npm install` (a fresh clone with the configuration committed) lets `npx` download and run
whatever package the npm registry has under that name; with it, `npx` stops instead. When the
client starts servers elsewhere than the project's root, pass it:
`"args": ["--no", "magma-mcp", "--root", "<the project's folder>"]` (in OpenCode, at the end
of `command`).

## The tools

| Tool | Ask it | Instead of |
| --- | --- | --- |
| `find_component` | which component fits a need ("a date range picker") | reading the catalogue |
| `get_component` | the API of one component: props with their values and default, events, methods, slots, parts, public CSS custom properties | reading its `AGENTS.md` |
| `get_usage` | how HTML, React or Angular writes it: import, props, events (`onMdsInputChange`, `(mdsInputChange)`) | guessing the names |
| `list_tokens` | the role for a need ("secondary text"), with its value and class | reading [`color.md`](color.md) |
| `suggest_role` | the role for a colour, a raw class or a palette step, as a class of the same utility (`shadow-*/80` stays a shadow class) | picking a role by eye |
| `explain_class` | what a class does with the Magma theme | the trap of the scale: `p-4` is 0.01rem, `p-400` is 1rem |
| `find_icon` | a slug that exists, by meaning, or whether a slug exists | an `icon="..."` that renders nothing |
| `get_guide` | one section of a guide | reading the whole file |
| `get_pattern` | how a task across components is solved in every product (where a message goes, confirming an action, an empty, a loading or a failed part): the list, the patterns for a need, or, with the values of the variables of a pattern, the one case to follow; the layer of the project (`magma/patterns/<id>.md`) applied | inventing the flow, or reading [`patterns.md`](patterns.md) and each pattern by hand |
| `check_markup` | whether a snippet passes the lint, before it is written | a lint run after the fact |
| `check_setup` | what the Magma integration of the project misses | checking the install steps by hand |
| `render_preview` | an image of markup with Magma components, at the widths (pixels or Magma breakpoints), the mode and the theme you give, with a report of what in it is not representative | describing an interface in words, or a wireframe of your own |

`check_markup` uses the ESLint, Stylelint and template parsers the project installed with
the lint ([`lint.md`](lint.md)). The same definitions, for a tool that documents them, are in
`@maggioli-design-system/magma/dist/lint/mcp/tools.json`: what `tools/list` answers.

## When to call them

- Before writing a component: `find_component`, then `get_component` and `get_usage`.
- Before a colour, a spacing or a class: `list_tokens`, `suggest_role`, `explain_class`.
- Before a flow that tells the person something or makes them wait or decide: `get_pattern`.
- Before an icon: `find_icon`.
- After writing: `check_markup`, then the project's lint ([`lint.md`](lint.md)).
- After the bootstrap, or when something does not render: `check_setup`.
- Before asking the person to decide on an interface: `render_preview`, one render per
  option ([Show the person what you mean](#show-the-person-what-you-mean)).
- When no tool gives you what the task needs, or an answer carries `gap`: tell the user,
  and at the end of the task propose an issue on Magma
  ([`reporting.md`](reporting.md), "A tool or an answer the MCP server is missing").

## Show the person what you mean

A decision on an interface taken from words is taken blind: the person reads the concept and
imagines a screen of their own. Show the real components instead, rendered on the version the
project installed.

1. **Render each option.** `render_preview` with the markup of the option, as the product
   would write it: the real components, the real texts, the layout around them. A modal, a
   drawer or a toast sits on the viewport: give a `height`. One width is enough unless the
   option changes with it (`["mobile", "desktop"]`).
2. **Read the report before the image.** `representative: false` names what is wrong,
   element by element: a component unknown or not hydrated, an element with no size, a
   component that is one flat colour, a console error, an icon, a font or an image that did
   not load, a word broken across lines, content cut. Fix your markup and render again; show
   an image with a problem only with the problem said next to it.
3. **Show the images.** The tool returns each image as image content and as a file. VS Code
   and Cursor show the image to the person; Claude Code passes it to you and may not show it,
   so there attach the file (`file`) the way your client sends a file to the person, or give
   its path. Never copy the image data by hand.
4. **Ask.** Each option with its image, a name and one line on what it means, the one you
   recommend first and marked as such. Ask with your client's question tool when it has one.
   Always offer:
   - a way to flag an image ("the second one did not render", "this is not what I meant");
   - an empty field for an answer of the person's own.
5. **Render the free answer before acting on it.** What the person writes in the empty field
   is an instruction you interpret: render what you understood, show it and ask whether that
   is it. Act only once they confirm; otherwise render again with their correction.
6. **A flagged image.** Render it again and compare the report. When the markup was yours
   to fix, fix it. When the markup is right and the image still does not show it (the
   report says representative, the person sees something else), the render is at fault: tell
   the person and propose an issue on Magma ([`reporting.md`](reporting.md), "A tool or an
   answer the MCP server is missing").
