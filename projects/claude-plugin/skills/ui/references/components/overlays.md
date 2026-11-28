<!-- Generated from projects/claude-plugin/templates/ui/references/components/[category].md and the usage/4. When to use.md of the components by scripts/skills.ts: edit those. -->

# Components: overlays

Surfaces that float over the page: dialogs, dropdowns, tooltips, help.

Each row is a need and what answers it: a component (then `get_component` with its tag), a pattern by its id (`get_pattern`), or `gap`, where Magma has nothing for the need yet (path 2). The table holds every need of `mds-modal`, and the needs other components send to this category. For the other components, and for a need no row takes, `find_component` with the need in words.

| Need | Use |
| --- | --- |
| A menu of actions or options | `mds-dropdown` |
| Content anchored to the control that opens it (the notifications under the bell) | `mds-dropdown` |
| The person must confirm an action that cannot be undone, before it happens, as `confirm-action` decides | `mds-modal` |
| The person must answer something that blocks the task they started: a missing piece of information, a warning that work would be lost | `mds-modal` |
| The person must do a short task on one item of the page (a short form, the action of a record) and come back to where they were | `mds-modal` |
| The person manages a short list of one item (who has access, the members and their role): each change holds at once, and the dialog closes with its X or Fatto | `mds-modal` |
| The person changes a few settings of one group (the appearance), with no sections | `mds-modal` |
| The person does a longer task on one item while keeping the page in view: at an edge, with the backdrop | `mds-modal` |
| The person works on something while still using the page (a message being written): at an edge or a corner with `hide-backdrop`, which makes the dialog non-modal | `mds-modal` |
| A short explanation of one part of the page | `mds-tooltip`, `mds-help` |
| Settings in several sections | a page, `app-shell`; a wide dialog with its sections is the choice of a product |
| An action that can be undone | `confirm-action`, act and then offer to undo |
| A dialog over another dialog, such as the confirmation of an action started in a dialog | the question of `confirm-action` takes the place of the content of that dialog, and Annulla brings the content back |
| A long or complex task (many fields, a table, more than three steps) | a page of its own, `form-and-validation` |
| A task the person repeats often | on the page, `form-and-validation` |
| The error of one field | `form-and-validation`, next to the field |
| The filters of a list | `list-with-filters`, the fields of its search form, until the panel of the filters (#1602) |
| Telling the outcome of an action, or a message that asks nothing | `message-placement`; when a task follows the outcome, the dialog is named after the task |

Then the rest of "2. The components", in compose.md.
