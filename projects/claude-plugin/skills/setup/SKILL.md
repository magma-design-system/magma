---
name: setup
description: Bring the Magma design system (the @maggioli-design-system packages) into a project. Pick the package of its framework (web components, React, Angular), install it, then run the bootstrap of the installed AGENTS.md (styles, fonts, icons, registration, editor, lint, MCP server) and check the result. Use when asked to install, add or set up Magma, or to fix a Magma setup that does not work.
license: MIT
compatibility: A Node.js project with npm, pnpm or yarn. Uses the magma MCP server of this plugin once Magma is installed.
metadata:
  source: https://github.com/magma-design-system/magma/tree/main/projects/claude-plugin
---

<!-- Generated from projects/claude-plugin/templates/setup.md by scripts/skills.ts: edit the template. -->

# Set up Magma in this project

Arguments given with the command, if any (a framework, a folder): $ARGUMENTS. Without them, detect the framework and work in the project's root.

## 1. Pick the target

Read `package.json` and the sources. One package per target:

| Target | Package |
| --- | --- |
| Plain HTML / vanilla JS | `@maggioli-design-system/magma` |
| React / Next.js | `@maggioli-design-system/magma-react` |
| Angular >= 20 | `@maggioli-design-system/magma-angular` |

Ask the person only what detection leaves open (which framework, when several are present).

## 2. Install, then follow the installed bootstrap

1. Install the package of the target with the project's package manager (React and Angular install `@maggioli-design-system/magma` too).
2. Open the `AGENTS.md` of the installed package (`node_modules/@maggioli-design-system/<package>/AGENTS.md`) and follow its steps 1 to 4: they are the bootstrap of this version (the version matrix, styles in their cascade-layer order, fonts, icons, registration, editor autocomplete, the lint, the MCP server). Do not set Magma up from memory: the installed guide is the source.
3. For the MCP server in Claude Code, prefer this plugin, which already starts it, to an `.mcp.json` entry: register the plugin for the whole team in the project's committed `.claude/settings.json`, merged into what is there:

```json
{
  "extraKnownMarketplaces": {
    "magma": { "source": { "source": "github", "repo": "magma-design-system/magma" }, "autoUpdate": true }
  },
  "enabledPlugins": { "magma@magma": true }
}
```

   Write the `.vscode/mcp.json` or `.cursor/mcp.json` entry of `agents/mcp.md` only for the people of the team who use those clients.

## 3. Check

1. The magma MCP server of this plugin starts only once Magma is installed: if it did not start at the beginning of the session, reconnect it (`/mcp`).
2. Call its `check_setup` tool and fix what it reports, each item with the guide it names.
3. Build the app and confirm that an `mds-*` component renders and that the icons it names load.
4. Report what was installed, the cascade order used, the icon route and path, and the lint and MCP configuration.
