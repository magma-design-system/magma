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
components: [mds-zero, mds-text, mds-button, mds-img]
related: [list-with-filters, record-detail, loading, error-recovery]
validated-on: []

variables:
  cause: { values: [first-use, filtered, cleared, gone], means: "first-use: nothing yet; filtered: nothing matches the search or the filters; cleared: all handled; gone: the thing asked for does not exist" }
  can-add: { values: ["yes", "no"], means: "can this person add what is missing" }
  room: { values: [panel, line], means: "is there room for a panel, or only for a line (a menu, a dropdown, a cell)" }

cases:
  - { id: add-the-first, cause: first-use, can-add: "yes", room: panel, where: "a panel that says what is missing and what it is for, with the action that adds the first one; an illustration may welcome", use: ["mds-zero", "mds-button slot=action"] }
  - { id: filled-by-others, cause: first-use, can-add: "no", room: panel, where: "a panel that says who or what fills the part, and when; no button", use: ["mds-zero"] }
  - { id: clear-filters, cause: filtered, room: panel, where: "a panel that says nothing matches, with Clear filters only; the summary of the results says it too", use: ["mds-zero", "mds-button slot=action"] }
  - { id: all-done, cause: cleared, room: panel, where: "a panel that says all is done and what will come here; no button", use: ["mds-zero"] }
  - { id: not-found, cause: gone, room: panel, where: "the panel takes the place of the page: its title is the h1, its action leads to the list", use: ["mds-zero", "mds-button slot=action href"] }
  - { id: one-line, cause: [first-use, filtered, cleared], room: line, where: "one line of text where the items would be; the control that opened it is the way out", use: ["mds-text"] }
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

| Case | When | Where | Use |
| --- | --- | --- | --- |
| `add-the-first` | cause: first-use; can-add: yes; room: panel | a panel that says what is missing and what it is for, with the action that adds the first one; an illustration may welcome | `mds-zero`, `mds-button slot=action` |
| `filled-by-others` | cause: first-use; can-add: no; room: panel | a panel that says who or what fills the part, and when; no button | `mds-zero` |
| `clear-filters` | cause: filtered; room: panel | a panel that says nothing matches, with Clear filters only; the summary of the results says it too | `mds-zero`, `mds-button slot=action` |
| `all-done` | cause: cleared; room: panel | a panel that says all is done and what will come here; no button | `mds-zero` |
| `not-found` | cause: gone; room: panel | the panel takes the place of the page: its title is the h1, its action leads to the list | `mds-zero`, `mds-button slot=action href` |
| `one-line` | cause: first-use or filtered or cleared; room: line | one line of text where the items would be; the control that opened it is the way out | `mds-text` |

Not applicable:

| When | Why |
| --- | --- |
| cause: gone; room: line | a thing that does not exist is reached by its address: the whole page |

No gaps: every combination has a case or is not applicable.

## Parts

The panel, `mds-zero`:

- the default slot: an illustration, only in `add-the-first` and optional; Magma has none to
  give, the product brings its own;
- `slot="content"`: a title that says what is missing ("No requests match"), with the heading
  level of its place (`h1` when it takes the place of the page), then one sentence with why and
  what comes next;
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

- `mds-zero`, example "Illustration Only (No Action)": its text is "Nessun risultato", a
  search, which has Clear filters and no illustration; to rewrite as `filled-by-others`.
- `mds-zero`, example "Full Empty-State Panel": the text mixes "edit the filters" and
  "create", the action is only Create; to rewrite as `add-the-first`.
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
