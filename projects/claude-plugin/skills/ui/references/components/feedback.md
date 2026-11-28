<!-- Generated from projects/claude-plugin/templates/ui/references/components/[category].md and the usage/4. When to use.md of the components by scripts/skills.ts: edit those. -->

# Components: feedback

Messages, progress and empty states that tell the user what is happening.

Each row is a need and what answers it: a component (then `get_component` with its tag), a pattern by its id (`get_pattern`), or `gap`, where Magma has nothing for the need yet (path 2). No component of the category has its needs written yet: the rows are the needs other components send to it. For the other components, and for a need no row takes, `find_component` with the need in words.

| Need | Use |
| --- | --- |
| The number of steps changes with the answers | `mds-progress` |
| The person waits for a process the system runs (an upload, an import) | `mds-progress` |

Then the rest of "2. The components", in compose.md.
