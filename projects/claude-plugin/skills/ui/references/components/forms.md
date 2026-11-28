<!-- Generated from projects/claude-plugin/templates/ui/references/components/[category].md and the usage/4. When to use.md of the components by scripts/skills.ts: edit those. -->

# Components: forms

Fields that take a value, and the calendar and the filters that help pick one.

Each row is a need and what answers it: a component (then `get_component` with its tag), a pattern by its id (`get_pattern`), or `gap`, where Magma has nothing for the need yet (path 2). The table holds every need of `mds-filter`, and the needs other components send to this category. For the other components, and for a need no row takes, `find_component` with the need in words.

| Need | Use |
| --- | --- |
| The person must narrow the items of a list or a table on screen by one property with a few values (the statuses of the items), seeing how many items each value would show | `mds-filter` |
| The person must clear every filter in one step | `mds-filter` |
| Narrowing the items of a list on screen | `mds-filter`, the strip above the list (renamed with #1601); several properties go in the fields of the search form of `list-with-filters`, until the panel of the filters (#1602) |
| Several values chosen among a few fixed options in a field of a form | `mds-input-select` with `multiple` |
| The property has many values, or the person filters by several properties at once | `list-with-filters`, the fields of its search form (`mds-input-select`), until the panel of the filters (#1602) |
| Choosing one record among many of the same kind (a tab per company, per customer) | `mds-input-select`, or the search of `list-with-filters` when the records are many; the tabs are the parts of one thing, not a list of things |
| One value among a few in a field of a form (a role) | `mds-input-switch` with `type="radio"` |
| Choosing the value of a field of a form | `form-and-validation`, with `mds-input-switch` or `mds-input-select` |
| Choosing items from a list for something else (the members to add to a group) | `choose-items` |
| The list is short enough to read whole | no filter, `item-list` |

Then the rest of "2. The components", in compose.md.
