# magma-dev

The Claude Code plugin of the maintainers of this repository: the skills that work on Magma
itself. Its skills are invoked as `/magma-dev:<skill>`. The plugin that ships to the products is
another one, `projects/claude-plugin` (`/magma:<skill>`), and never takes a maintainer skill.

## How it loads

A folder of `.claude/skills/` that holds a `.claude-plugin/plugin.json` is a skills-directory
plugin: Claude Code loads it for everyone who works in the repository, with no marketplace, no
install and no setting, once the folder is trusted, and reads it in place, so an edit counts at
the next session or after `/reload-plugins`. Its skills, under `skills/`, take the `name` of the
manifest as their prefix. Sources: https://code.claude.com/docs/en/plugins/create.md
("skills-directory plugin") and https://code.claude.com/docs/en/plugins/loading.md ("Plugins
shared through a repository").

Two cases where the copy you see is not the one you edit:

- **A worktree of the desktop app** loads the plugin from the main checkout's `.claude/skills/`,
  not the worktree's. To try a change of a skill on a branch, start a session with the
  worktree's copy, which takes precedence for that session:
  `claude --plugin-dir .claude/skills/magma-dev`.
- **A session started in a subfolder** does not load it: start it at the root of the
  repository.

## The skills

| Skill | What for |
|---|---|
| `component-new` | Build a new component from the proposal a pattern made |
| `context-review` | Bring the agent context up to date before a pull request |
| `epic` | Where an epic stands, its preview, the merges a person approves |
| `magma-figma-component` | Align a component of the Figma library with the code |
| `paradigm-check` | Judge the issues and pull requests of contributors, and reply; launched by a maintainer only |
| `pattern-change`, `pattern-list`, `pattern-new`, `pattern-preview` | Define, change, list and preview the patterns |

## Adding or changing a skill

A skill is `skills/<name>/SKILL.md`, its frontmatter `name` equal to its folder; the files it
reads sit next to it. A skill with side effects or a high cost that only a person should launch
takes `disable-model-invocation: true`: its description then stays out of what every session
loads. Name the new skill in `AGENTS.md` as `/magma-dev:<name>`.

`nx run magma:check.agent-context` holds the plugin (`scripts/agent-context.ts`, "projects and
skills"): every skill named in `AGENTS.md`, its name and description valid, its description
within the budget of what every session loads, and the copies a skill keeps of what another file
decides (the scales and the store of `paradigm-check`).
