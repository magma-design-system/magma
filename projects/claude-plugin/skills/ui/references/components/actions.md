<!-- Generated from projects/claude-plugin/templates/ui/references/components/[category].md and the usage/4. When to use.md of the components by scripts/skills.ts: edit those. -->

# Components: actions

Controls that make something happen: buttons, links, action bars and menus.

Each row is a need and what answers it: a component (then `get_component` with its tag), a pattern by its id (`get_pattern`), or `gap`, where Magma has nothing for the need yet (path 2). No component of the category has its needs written yet: the rows are the needs other components send to it. For the other components, and for a need no row takes, `find_component` with the need in words.

| Need | Use |
| --- | --- |
| An action of the application or of an agent (send, ask, a suggested prompt, the follow-up of an AI answer) | `mds-button`, with `truncate="none"` for a long label |
| Going to another page | `mds-button` with `href`; in running text, `mds-link` |
| Starting an action | `mds-button` |

Then the rest of "2. The components", in compose.md.
