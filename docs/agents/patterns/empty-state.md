---
# A Magma pattern: the format and the commands are in docs/PATTERNS.md.
id: empty-state
kind: pattern
title: An empty part of the page
group: messages-and-states
layer: magma
status: decided
need: >-
  The person reaches a part of the page with nothing in it, and must understand why and what
  to do next.
principle: An empty part says why it is empty and what comes next, never in a warning tone.
keywords: [empty state, empty list, no results, nothing found, no items yet, not found, all done, zero data]
not-for:
  - need: a part that could not be loaded
    use: error-recovery
  - need: a part that is still loading
    use: loading
  - need: what a role is not allowed to see
    use: permissions
  - need: where the outcome of an action is told
    use: message-placement
assumptions:
  - The application knows why the part is empty (nothing yet, nothing matches, all done, does not exist).
high-stakes: false
components: [mds-zero, mds-text, mds-button, mds-img, mds-dropdown]
related: [list-with-filters, record-detail, loading, error-recovery, item-list, app-shell]
validated-on: []

variables:
  cause: { values: [first-use, filtered, cleared, gone], means: "first-use: nothing yet; filtered: nothing matches the search or the filters; cleared: all handled; gone: the thing asked for does not exist" }
  can-add: { values: ["yes", "no"], means: "can this person add what is missing" }
  room: { values: [panel, line], means: "is there room for a panel, or only for a line (a menu, a dropdown, a cell)" }

cases:
  - id: add-the-first
    cause: first-use
    can-add: "yes"
    room: panel
    where: "a panel that says what is missing and what it is for, with the action that adds the first one; an illustration may welcome"
    use:
      - { role: "the panel, where the items would be", use: mds-zero }
      - { role: "the title, what is missing, a title of a part at the level of its place", use: "mds-text slot=content typography=part tag=h2" }
      - { role: "what it is for, and that the first one starts it", use: "mds-text slot=content typography=detail tag=p" }
      - { role: "the action that adds the first one, outlined: the strong one stays in the header of the page", use: "mds-button slot=action variant=primary tone=outline" }
  - id: filled-by-others
    cause: first-use
    can-add: "no"
    room: panel
    where: "a panel that says who or what fills the part, and when; no button"
    use:
      - { role: "the panel, where the items would be", use: mds-zero }
      - { role: "the title, what is missing, a title of a part at the level of its place", use: "mds-text slot=content typography=part tag=h3" }
      - { role: "who or what fills the part, and when", use: "mds-text slot=content typography=detail tag=p" }
  - id: clear-filters
    cause: filtered
    room: panel
    where: "a panel that says nothing matches, with Clear filters only; the summary of the results says it too"
    use:
      - { role: "the summary of the results, which says it too, read out", use: "mds-text typography=detail tag=p role=status" }
      - { role: "the panel, in the place of the results", use: mds-zero }
      - { role: "the title, that nothing matches", use: "mds-text slot=content typography=part tag=h2" }
      - { role: "what to try: other words, or clearing the filters", use: "mds-text slot=content typography=detail tag=p" }
      - { role: "Clear filters, the only action, outlined: Create stays in the header of the page", use: "mds-button slot=action variant=primary tone=outline" }
  - id: all-done
    cause: cleared
    room: panel
    where: "a panel that says all is done and what will come here; no button"
    use:
      - { role: "the panel, where the items would be", use: mds-zero }
      - { role: "the title, that nothing is left to do", use: "mds-text slot=content typography=part tag=h2" }
      - { role: "that all is done, and what will come here", use: "mds-text slot=content typography=detail tag=p" }
  - id: not-found
    cause: gone
    room: panel
    where: "the panel takes the place of the page: its title is the h1, its action leads to the list"
    use:
      - { role: "the panel, in the place of the page", use: mds-zero }
      - { role: "the title of the page, what was not found", use: "mds-text slot=content typography=page tag=h1" }
      - { role: "why it is not there, and where to look for it", use: "mds-text slot=content typography=detail tag=p" }
      - { role: "the way to the list, a link named after it", use: "mds-button slot=action href=<the list>" }
  - id: one-line
    cause: [first-use, filtered, cleared]
    room: line
    where: "one line of text where the items would be; the control that opened it is the way out"
    use:
      - { role: "the panel of the options, under the control that opened it, which reads the line out", use: "mds-dropdown target=<the control that opened it> interaction=none placement=bottom-start role=status" }
      - { role: "one line where the items would be, in the muted foreground: nothing matches what was typed", use: "mds-text typography=detail" }
gaps: []
not-applicable:
  - { cause: gone, room: line, why: "a thing that does not exist is reached by its address: the whole page" }

always-true:
  - id: says-what-next
    rule: The panel says what to do next, or, when the person has nothing to do, who or what fills the part.
    checked-by: review
  - id: no-warning-tone
    rule: Nothing inside the panel has a warning or error tone.
    checked-by: review
    lint-planned: magma/no-warning-in-zero
  - id: not-an-error
    rule: A part that failed to load is an error, never an empty state.
    checked-by: review
  - id: one-cause-one-action
    rule: "The action answers the cause: Clear filters for a search, never Create."
    checked-by: review
  - id: illustration-on-first-use
    rule: An illustration only on first use; never on a search, an all-done or a missing page, where the person is working.
    checked-by: review

situations:
  - { situation: A new account opens its list of projects, case: add-the-first }
  - { situation: "A reader opens the documents of a case, which the office has not added yet", case: filled-by-others }
  - { situation: A search on a list finds nothing, case: clear-filters }
  - { situation: "An operator searches for a contact by name, finds none, and may create contacts", case: clear-filters, note: "Create stays in the header of the page" }
  - { situation: "The list of tasks to do is empty: all done", case: all-done }
  - { situation: An address leads to a request that was deleted, case: not-found }
  - { situation: A combobox finds no option for the text typed, case: one-line }
---

# An empty part of the page

**An empty part says why it is empty and what comes next, never in a warning tone.**

## When to use it

A list, a section or a page with nothing to show, and the reason is known: nothing yet,
nothing matches, all handled, or the thing asked for does not exist. Not a part that failed to
load (`error-recovery`): no results is not an error. Not a part that is still loading
(`loading`). Not what a role may not see (`permissions`).

## What decides it

Three questions: why the part is empty, whether this person can add what is missing, and
whether there is room for a panel or only for a line.

## Cases

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

| Variable | Values | Means |
| --- | --- | --- |
| `cause` | `first-use`, `filtered`, `cleared`, `gone` | first-use: nothing yet; filtered: nothing matches the search or the filters; cleared: all handled; gone: the thing asked for does not exist |
| `can-add` | `yes`, `no` | can this person add what is missing |
| `room` | `panel`, `line` | is there room for a panel, or only for a line (a menu, a dropdown, a cell) |

A case that leaves a variable out holds for any of its values.

| Case | When | Where |
| --- | --- | --- |
| `add-the-first` | cause: first-use; can-add: yes; room: panel | a panel that says what is missing and what it is for, with the action that adds the first one; an illustration may welcome |
| `filled-by-others` | cause: first-use; can-add: no; room: panel | a panel that says who or what fills the part, and when; no button |
| `clear-filters` | cause: filtered; room: panel | a panel that says nothing matches, with Clear filters only; the summary of the results says it too |
| `all-done` | cause: cleared; room: panel | a panel that says all is done and what will come here; no button |
| `not-found` | cause: gone; room: panel | the panel takes the place of the page: its title is the h1, its action leads to the list |
| `one-line` | cause: first-use or filtered or cleared; room: line | one line of text where the items would be; the control that opened it is the way out |

Not applicable:

| When | Why |
| --- | --- |
| cause: gone; room: line | a thing that does not exist is reached by its address: the whole page |

No gaps: every combination has a case or is not applicable.

The parts of each case, in the order of its preview: what each does in the case, and the component to write. A value in angle brackets is the text of the application, written as it says; the rest of the preview is its stage, the context of the case.

`add-the-first`:

| Role | Use |
| --- | --- |
| the panel, where the items would be | `mds-zero` |
| the title, what is missing, a title of a part at the level of its place | `mds-text slot=content typography=part tag=h2` |
| what it is for, and that the first one starts it | `mds-text slot=content typography=detail tag=p` |
| the action that adds the first one, outlined: the strong one stays in the header of the page | `mds-button slot=action variant=primary tone=outline` |

`filled-by-others`:

| Role | Use |
| --- | --- |
| the panel, where the items would be | `mds-zero` |
| the title, what is missing, a title of a part at the level of its place | `mds-text slot=content typography=part tag=h3` |
| who or what fills the part, and when | `mds-text slot=content typography=detail tag=p` |

`clear-filters`:

| Role | Use |
| --- | --- |
| the summary of the results, which says it too, read out | `mds-text typography=detail tag=p role=status` |
| the panel, in the place of the results | `mds-zero` |
| the title, that nothing matches | `mds-text slot=content typography=part tag=h2` |
| what to try: other words, or clearing the filters | `mds-text slot=content typography=detail tag=p` |
| Clear filters, the only action, outlined: Create stays in the header of the page | `mds-button slot=action variant=primary tone=outline` |

`all-done`:

| Role | Use |
| --- | --- |
| the panel, where the items would be | `mds-zero` |
| the title, that nothing is left to do | `mds-text slot=content typography=part tag=h2` |
| that all is done, and what will come here | `mds-text slot=content typography=detail tag=p` |

`not-found`:

| Role | Use |
| --- | --- |
| the panel, in the place of the page | `mds-zero` |
| the title of the page, what was not found | `mds-text slot=content typography=page tag=h1` |
| why it is not there, and where to look for it | `mds-text slot=content typography=detail tag=p` |
| the way to the list, a link named after it | `mds-button slot=action href=<the list>` |

`one-line`:

| Role | Use |
| --- | --- |
| the panel of the options, under the control that opened it, which reads the line out | `mds-dropdown target=<the control that opened it> interaction=none placement=bottom-start role=status` |
| one line where the items would be, in the muted foreground: nothing matches what was typed | `mds-text typography=detail` |

## Parts

The panel, `mds-zero`:

- the default slot: an illustration, only in `add-the-first` and optional; Magma has none to
  give, the product brings its own;
- `slot="content"`: a title that says what is missing ("No requests match"), in the style of a
  part (`typography="part"`, `titles/part`) with the heading level of its place (`h1` with
  `typography="page"` when it takes the place of the page), then one sentence with why and what
  comes next; straight in the slot, which sets them `gap-title-content` apart;
- `slot="action"`: one `mds-button`, when the person has something to do; none in
  `filled-by-others` and `all-done`.

The line: one `mds-text` in the place of the items, in the muted foreground.

## Behaviour over time

- While a new search loads, the results that were there stay: the empty state does not flash
  (`loading`).
- After Clear filters, the panel is gone with its button: the focus goes to the title of the
  list, as after any action whose control is gone (`record-detail`, `confirm-action`).

## Always true

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

These hold in every product: a product layer cannot change them.

| Id | Rule | Checked by |
| --- | --- | --- |
| `says-what-next` | The panel says what to do next, or, when the person has nothing to do, who or what fills the part. | review |
| `no-warning-tone` | Nothing inside the panel has a warning or error tone. | review; lint `magma/no-warning-in-zero` to write |
| `not-an-error` | A part that failed to load is an error, never an empty state. | review |
| `one-cause-one-action` | The action answers the cause: Clear filters for a search, never Create. | review |
| `illustration-on-first-use` | An illustration only on first use; never on a search, an all-done or a missing page, where the person is working. | review |

## Situations

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

Situations every application has, each with its case: they give the examples, the texts and the keywords. The situations of a product's own domain go in its layer.

| Situation | Case |
| --- | --- |
| A new account opens its list of projects | `add-the-first` |
| A reader opens the documents of a case, which the office has not added yet | `filled-by-others` |
| A search on a list finds nothing | `clear-filters` |
| An operator searches for a contact by name, finds none, and may create contacts | `clear-filters`: Create stays in the header of the page |
| The list of tasks to do is empty: all done | `all-done` |
| An address leads to a request that was deleted | `not-found` |
| A combobox finds no option for the text typed | `one-line` |

## Accessibility

- The summary of the results is a status region: when a search finds nothing, screen readers
  read out "No requests match" while the focus stays on the field (`list-with-filters`).
- An illustration is decorative: its alternative text is empty, the message is in the text.

## Content

- What is missing, then why, then what comes next: "No requests match. Try other words, or
  clear the filters."
- When the person has nothing to do, who fills the part and when: "No documents yet. The
  office adds them when it takes up the case."
- No blame: "No requests match the filters", not "You found nothing".

## Magma gaps

- No illustration for empty states in `identity` (only a logo set of Maggioli Editore): the
  product brings its own.

## Decisions

| Date | Decision | Why |
| --- | --- | --- |
| 2026-10-16 | Proposed: `mds-zero` with a way out, never a warning tone | Open decision of the docs site, `agents/patterns.md`. |
| 2026-10-28 | Draft with variables; the part this person cannot fill, the all-done and the search where the person may create left as gaps | The sources do not settle them. |
| 2026-10-28 | "Always a way out" becomes `says-what-next`: an action when there is something to do, otherwise who or what fills the part (`filled-by-others`, `all-done`) | A button with nothing to do sends the person away from where they are. |
| 2026-10-28 | A search with no results offers Clear filters only, even when the person may create | One action that answers the cause; Create stays in the header of the page. |
| 2026-10-28 | An illustration only on first use, optional | It welcomes; where the person is working, the space belongs to the data (Illustration guide of the docs site). |
| 2026-11-10 | `mds-zero` takes the roles of the design language: `p-inset` around its zones, `gap-title-content` in its content, `gap-content-actions` between the zones, `gap-inline` between the actions, no footer with no action; its fill is `surface-muted` in both modes, and its examples title the panel `typography="part"` (#1231). | The previews corrected the panel by hand. The fill is a step under the page in light and in dark, where the items would stand (`surfaces/tints-in-components`); the wash it had stood under the page in light and over it in dark, a light card. Rejected: `surface-sunken`, a hole in dark, and `surface-raised` with a shadow, a card, which `surfaces` keeps for an item of a set. Chosen by vittorio on the render. |
| 2026-11-13 | Each case gives the parts of its solution with their role, in the order of its preview, the stage of the preview marked `data-stage` | The `use` of a case named one part in five of what its preview shows, and no role: the agents of the products composed the rest by hand. https://github.com/magma-design-system/magma/issues/1396 |
