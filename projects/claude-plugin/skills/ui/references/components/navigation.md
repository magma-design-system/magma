<!-- Generated from projects/claude-plugin/templates/ui/references/components/[category].md and the usage/4. When to use.md of the components by scripts/skills.ts: edit those. -->

# Components: navigation

Where the user is and where they can go: breadcrumbs, tabs, steps, pages, trees.

Each row is a need and what answers it: a component (then `get_component` with its tag), a pattern by its id (`get_pattern`), or `gap`, where Magma has nothing for the need yet (path 2). The table holds every need of `mds-stepper-bar` and `mds-tab`, and the needs other components send to this category. For the other components, and for a need no row takes, `find_component` with the need in words.

| Need | Use |
| --- | --- |
| The person must see where a page sits in the hierarchy of the site | `mds-breadcrumb` |
| The person must complete a task they do once or rarely (a sign-up, an application), in 3 to 6 steps that come in a fixed order, and see where they are and how many steps are left | `mds-stepper-bar` |
| The person must go back to a step already done, to change an answer, before finishing | `mds-stepper-bar` |
| The person must switch between related groups of content in the same place, one group at a time, without needing them together (the data, the documents and the history of a record) | `mds-tab` |
| The person must switch the view of a panel that the page draws (a mode, a representation): the strip alone | `mds-tab` |
| The person must move between a few closely related pages of one subject, or between the stages or the sections of a tool they work in over time, going back and forth (an editor, a configuration workspace), the address holding the tab: every item with `href` | `mds-tab` |
| The main navigation of a mobile application | `mds-tab-bar` |
| The sections of the application | `app-shell` |
| The person who knows the object creates it often, or a step holds sections of its own | `form-and-validation`, one form with its sections |
| The task has fewer than 3 steps, or is a short form split into pages | `form-and-validation`, one form with its button |
| Content the person must compare or read together | one page, with a title per part, `page-header` |
| Content the person must not miss | above the strip, outside the tabs, `record-detail` |
| The person does the steps in any order, over several sessions, and needs the status of each step, who does it and by when | `gap`, a task list (the steps in a column with their status, the open step beside them, the summary and the activity on the other side) |

Then the rest of "2. The components", in compose.md.
