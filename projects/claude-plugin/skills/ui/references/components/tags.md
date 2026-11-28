<!-- Generated from projects/claude-plugin/templates/ui/references/components/[category].md and the usage/4. When to use.md of the components by scripts/skills.ts: edit those. -->

# Components: tags

Short markers attached to other content: badges, chips, labels, mentions, keys.

Each row is a need and what answers it: a component (then `get_component` with its tag), a pattern by its id (`get_pattern`), or `gap`, where Magma has nothing for the need yet (path 2). The table holds every need of `mds-chip`, and the needs other components send to this category. For the other components, and for a need no row takes, `find_component` with the need in words.

| Need | Use |
| --- | --- |
| The status of a record (in progress, done, critical) | `mds-badge` |
| A count or a number on another element | `mds-badge` |
| The person must see a short piece of metadata of a record (a tag, a category, the value of a property) beside the record: in a list, a table, the page of the record | `mds-chip` |
| The person must take off a label that they or someone gave the record (a tag of an entity, an active filter) | `mds-chip` |
| The person must open the content of what the chip names (the office, the person a record refers to) | `mds-chip` |
| The person must choose values from a set shown whole, several at a time, with a limit if there is one: the tags or the categories a record will carry (the tags of a cafe, the skills of a profile), or the values of a property in the panel of the filters | `mds-chip` |
| A person named in the content | `mds-mention` |
| Several values searched in a list or typed in a field (the emails to invite, the recipients of a message) | `gap`, a field of values as removable chips (#1607) |

Then the rest of "2. The components", in compose.md.
