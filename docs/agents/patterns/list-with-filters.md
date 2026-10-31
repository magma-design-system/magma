---
# A Magma pattern: the format and the commands are in docs/PATTERNS.md.
id: list-with-filters
kind: pattern
title: List with filters
group: data
layer: magma
status: decided
need: >-
  The person finds the items they need in a long list, by searching, filtering and paging.
principle: The back end finds the items, the address keeps the query, and nothing on screen moves until the person asks.
keywords: [list, search, filter, filters, results, table, pages, pagination, sort, select rows, bulk actions, batch actions, queue, new items]
not-for:
  - need: choosing items from a list for something else (members to add to a group, documents to attach)
    use: choose-items
  - need: choosing one value for a field of a form (the recipient of a message)
    use: form-and-validation
  - need: a list with nothing to show
    use: empty-state
  - need: a list that is loading
    use: loading
  - need: a list that could not be loaded
    use: error-recovery
  - need: where the outcome of an action on the list is told
    use: message-placement
  - need: what a role may not see or do in the list
    use: permissions
assumptions:
  - The back end can search, count, sort and page the set.
  - The application knows whether other people or systems change the set while it is on screen.
high-stakes: false
components: [mds-input, mds-input-field, mds-input-select, mds-filter, mds-filter-item, mds-table, mds-table-header-cell, mds-paginator, mds-text, mds-badge, mds-button, mds-card]
related: [loading, empty-state, error-recovery, message-placement, confirm-action, record-detail, choose-items, page-header]
validated-on: []

variables:
  goal: { values: [open, act], means: "open: the person opens one item at a time (a request, to work on it); act: the person acts on several items at once (archive, assign, delete)" }
  changes: { values: ["no", by-others], means: "by-others: other people or systems add or change items while the list is on screen (a queue of incoming requests)" }

cases:
  - { id: find-and-open, goal: open, changes: "no", where: "the title of the list, a search form, the summary, the results and the pages; the name or the number of each item is the link to its page", use: ["mds-input type=search", "mds-filter", "mds-input-select", "mds-table sorting=external", "mds-table-header-cell sortable sort-key", "mds-paginator"] }
  - { id: act-on-many, goal: act, changes: "no", where: "a checkbox on each row and the bar of the batch actions, with how many are selected; the selection is the page on screen; an action that cannot be taken back asks first, saying how many; the outcome is told as message-placement says, a partial one as error-recovery says", use: ["mds-table selectable", "mds-button slot=batch-action"], see: confirm-action }
  - { id: show-new-items, changes: by-others, where: "nothing on screen moves by itself: at the end of the line of the summary, a dot that pulses three times when the count grows (once Magma carries it, see Magma gaps; until then none), how many items are new or changed in the info colour, and Show, which loads the list again with the same query; the line keeps its place while there is nothing new, so the results never move; the count is read out without moving the focus", use: ["mds-text typography=detail", "mds-button variant=info tone=outline size=sm"] }
gaps: []
not-applicable: []

always-true:
  - id: server-does-the-work
    rule: The back end searches, counts, sorts and pages the items; the page receives one page of results.
    checked-by: review
  - id: query-in-address
    rule: "Search, filters, order and page are in the address, the defaults left out: a reload, a link or Back shows the same results."
    checked-by: review
  - id: filters-reset-page
    rule: Any change but the page goes back to the first page; a page past the end gives the last one.
    checked-by: review
  - id: sort-the-whole-set
    rule: A list with pages is sorted by the back end, never only the rows on screen.
    checked-by: review
  - id: summary-says-how-many
    rule: The summary says which items are on screen out of how many, and is read out after every change.
    checked-by: review
  - id: link-names-the-item
    rule: Each item is opened by a link that names it, never by an Open repeated on every row.
    checked-by: review
  - id: selection-on-screen
    rule: "A selection holds only items on screen: a new page, filter or search empties it."
    checked-by: review
  - id: nothing-moves-by-itself
    rule: Items added or changed by others never move what is on screen; they wait until the person asks for them.
    checked-by: review
  - id: newest-wins
    from: loading
  - id: no-flash-empty
    from: loading
  - id: not-an-error
    from: empty-state

open-choices:
  - { id: page-size, default: "10 items, as the example of the docs site", may: "show more items in a page, the same in every list of the product" }
  - { id: select-all-matching, default: "none: the selection is the page on screen", may: "offer Select all N that match, for an action the back end runs on the query" }

situations:
  - { situation: A person opens the list of their requests and searches one by number, case: find-and-open }
  - { situation: "Back from a request, the list is as it was", case: find-and-open }
  - { situation: "The documents of a case, in a section of its page", case: find-and-open, note: "under the heading of the section; its query in the address too, with names of its own" }
  - { situation: Export the requests that match the filters, case: find-and-open, note: "Export acts on the query, from the header of the page; a long export runs in the background (loading)" }
  - { situation: An operator archives 12 requests at once, case: act-on-many }
  - { situation: 12 items are deleted for good, case: act-on-many, note: "the dialog says how many (confirm-action)" }
  - { situation: New requests arrive while an operator works through the queue, case: show-new-items }
  - { situation: Members are added to a group from the list of users, use: choose-items }
  - { situation: "A recipient is chosen for a message, in a form", use: form-and-validation }
---

# List with filters

**The back end finds the items, the address keeps the query, and nothing on screen moves until the person asks.**

## When to use it

People look for items in a set too large to read through: dozens of items or more, with a few
properties worth filtering on (the requests of an office, the documents of a case, the users of
an organisation). With a handful of items, show them all: search, filters and pages only get in
the way. When the items are seen rather than read (images, documents to preview), the results
are cards in a grid; the search, the filters and the pages stay the same. Not choosing items for
something else (`choose-items`), not an empty list (`empty-state`), a list that is loading
(`loading`) or one that failed (`error-recovery`): this pattern sends to them.

## What decides it

Two questions: what the person does with the items (opens one at a time, or acts on several at
once), and whether other people change the set while it is on screen.

## Cases

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

| Variable | Values | Means |
| --- | --- | --- |
| `goal` | `open`, `act` | open: the person opens one item at a time (a request, to work on it); act: the person acts on several items at once (archive, assign, delete) |
| `changes` | `no`, `by-others` | by-others: other people or systems add or change items while the list is on screen (a queue of incoming requests) |

A case that leaves a variable out holds for any of its values.

| Case | When | Where | Use |
| --- | --- | --- | --- |
| `find-and-open` | goal: open; changes: no | the title of the list, a search form, the summary, the results and the pages; the name or the number of each item is the link to its page | `mds-input type=search`, `mds-filter`, `mds-input-select`, `mds-table sorting=external`, `mds-table-header-cell sortable sort-key`, `mds-paginator` |
| `act-on-many` | goal: act; changes: no | a checkbox on each row and the bar of the batch actions, with how many are selected; the selection is the page on screen; an action that cannot be taken back asks first, saying how many; the outcome is told as message-placement says, a partial one as error-recovery says; see `confirm-action` | `mds-table selectable`, `mds-button slot=batch-action` |
| `show-new-items` | changes: by-others | nothing on screen moves by itself: at the end of the line of the summary, a dot that pulses three times when the count grows (once Magma carries it, see Magma gaps; until then none), how many items are new or changed in the info colour, and Show, which loads the list again with the same query; the line keeps its place while there is nothing new, so the results never move; the count is read out without moving the focus | `mds-text typography=detail`, `mds-button variant=info tone=outline size=sm` |

No gaps: every combination has a case or is not applicable.

## Parts

- **The title** of the list, in the plural, as the heading of the page (`h1`), or of its section.
  Actions on the whole set (New, Export) sit next to it: the block `page-header`.
- **The search form**, `role="search"`: a field that searches the number and the name
  (`mds-input type="search"` in `mds-input-field`), a select for each property with a few values
  (`mds-input-select`), the order.
- **The status filter**: the statuses as `mds-filter`, one at a time, each with the number of
  items it would show (`count` on `mds-filter-item`).
- **The summary**: which items are on screen out of how many ("11-20 of 46 requests"), with
  Clear filters when there are any; `role="status"`.
- **The results**: one row per item in `mds-table`, its number or name the link to its page; or
  cards in a grid (`mds-card`) when the items are seen rather than read.
- **The pages**: `mds-paginator`, only when there is more than one page.
- When the person acts on several items: `selectable` on `mds-table`, and the actions as
  `mds-button` in its `batch-action` slot; the bar says how many are selected.
- When others change the set: at the end of the line of the summary, a dot that pulses, how many
  items are new in the info colour (`--magma-info-fg`) and Show (`mds-button variant="info"
  tone="outline" size="sm"`). The line keeps its place while there is nothing new: Show is
  hidden (`visibility: hidden`), not removed, and on a narrow screen the line sits under the
  summary from the start, so neither its arrival nor its count moves the results. The dot waits
  for Magma (Magma gaps): until then, the line without it.

## Behaviour over time

- The search waits for a pause in the typing (300 ms); a new query cancels the one still
  running (`newest-wins`).
- The results stay while the next ones load: `await` on the search field, `aria-busy` on the
  table (`no-flash-empty`).
- Any change of the filters goes back to the first page; the address is replaced, not pushed,
  so Back leaves the list instead of walking through every filter.
- The counts of the statuses follow the search and the other filters, so an empty status shows
  before it is picked.
- A new page, filter or search empties the selection: an action never reaches items the person
  cannot see.
- After an action on several items, the list loads again on the same page, with the same query.
- Items added or changed by others: the line says how many ("3 new requests"), and its count
  grows while they come; at each new count the dot pulses three times and stops (3 seconds,
  under the 5 of WCAG 2.2.2), and not at all when the animation is reduced
  (`pref-animation-reduce`, or the system with no preference of Magma). Show loads the list
  again, with the same query, empties the selection and empties the line. Nothing moves before
  that.
- Nothing matches: the `clear-filters` case of `empty-state`, never an error. The request fails:
  `retry-content` of `error-recovery`, never "No requests match".

## Always true

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

These hold in every product: a product layer cannot change them.

| Id | Rule | Checked by |
| --- | --- | --- |
| `server-does-the-work` | The back end searches, counts, sorts and pages the items; the page receives one page of results. | review |
| `query-in-address` | Search, filters, order and page are in the address, the defaults left out: a reload, a link or Back shows the same results. | review |
| `filters-reset-page` | Any change but the page goes back to the first page; a page past the end gives the last one. | review |
| `sort-the-whole-set` | A list with pages is sorted by the back end, never only the rows on screen. | review |
| `summary-says-how-many` | The summary says which items are on screen out of how many, and is read out after every change. | review |
| `link-names-the-item` | Each item is opened by a link that names it, never by an Open repeated on every row. | review |
| `selection-on-screen` | A selection holds only items on screen: a new page, filter or search empties it. | review |
| `nothing-moves-by-itself` | Items added or changed by others never move what is on screen; they wait until the person asks for them. | review |
| `newest-wins` | An older answer never replaces a newer one. (from `loading`) | review |
| `no-flash-empty` | A reload never empties what is on screen. (from `loading`) | review |
| `not-an-error` | A part that failed to load is an error, never an empty state. (from `empty-state`) | review |

## Open choices

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

The default decides these; a product layer may narrow them.

| Id | Default | A product may |
| --- | --- | --- |
| `page-size` | 10 items, as the example of the docs site | show more items in a page, the same in every list of the product |
| `select-all-matching` | none: the selection is the page on screen | offer Select all N that match, for an action the back end runs on the query |

## Situations

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

Situations every application has, each with its case: they give the examples, the texts and the keywords. The situations of a product's own domain go in its layer.

| Situation | Case |
| --- | --- |
| A person opens the list of their requests and searches one by number | `find-and-open` |
| Back from a request, the list is as it was | `find-and-open` |
| The documents of a case, in a section of its page | `find-and-open`: under the heading of the section; its query in the address too, with names of its own |
| Export the requests that match the filters | `find-and-open`: Export acts on the query, from the header of the page; a long export runs in the background (loading) |
| An operator archives 12 requests at once | `act-on-many` |
| 12 items are deleted for good | `act-on-many`: the dialog says how many (confirm-action) |
| New requests arrive while an operator works through the queue | `show-new-items` |
| Members are added to a group from the list of users | not here: `choose-items` |
| A recipient is chosen for a message, in a form | not here: `form-and-validation` |

## Accessibility

- The search form is a landmark (`role="search"`); every control has a visible label given by
  `mds-input-field`: the placeholder is an example, not the label.
- The summary is a status region: after each change screen readers read out which items are
  shown out of how many, while the focus stays on the control just used.
- The line of the new items is read out when it appears and when its count changes, without
  moving the focus: its count sits in a status region that is always on the page (a live region
  added together with its text is not read reliably); the dot is decorative (`aria-hidden`).
- The status of each item is the text of its badge, not only its colour.
- The table keeps its column headers; on a narrow screen it scrolls sideways instead of
  squeezing the columns.

## Content

- The list is named after what it holds, in the plural: "Requests", not "Request list" or
  "Search".
- The label of the search field says what it is; the placeholder says what it searches:
  "Number or subject".
- The statuses have the names the page of an item gives them, in the order of the process.
- Count the results, with the singular for one: "1 request", "11-20 of 46 requests".
- The line of the new items says how many and of what: "3 new requests", "1 request changed".
- Dates in the format of the language of the page.

## Magma gaps

- No combobox: a search with facets (many properties, values to search among) waits for it;
  until then, a select for each property with a few values.
- `mds-card` has no selection: acting on several items works on rows (`mds-table`) only.
- The bar of the batch actions of `mds-table` is a column at the end of the table, about 190 px
  wide, taken from the columns: without `white-space: nowrap` on the cells, words break inside
  ("Anagraf-e") and `mds-badge` breaks its own label (seen on the render of 2026-10-29).
- `mds-table` sorts the rows in the DOM by default (`sorting="internal"`): a list with pages
  must set `sorting="external"`, or a click on a header sorts only the page on screen.
- No dot that calls attention: the dot of `show-new-items` (the info colour, three pulses,
  stopped by a reduced animation) is drawn by the page in the render of 2026-10-31, with values
  of its own. `mds-notification` draws a dot (`value="0"`), but in the danger colour only (its
  background is not public) and with no pulse. Until Magma carries it (#1216), the line goes
  without the dot; a product never writes the animation itself.

## Decisions

| Date | Decision | Why |
| --- | --- | --- |
| 2026-10-29 | The back end does the work, the query is in the address, a new filter goes back to the first page, one query at a time, the results stay while the next load, no results is not an error | The draft page of the docs site, `patterns/list-with-filters`, and its example. |
| 2026-10-29 | Draft with variables; the items added by others and choosing items left as gaps; how far a selection reaches to decide | The sources do not settle them. |
| 2026-10-29 | A selection holds only the page on screen; a new page, filter or search empties it; Select all N that match is a product's choice (`select-all-matching`) | An action never reaches items the person cannot see; `mds-table` selects the rows it shows. |
| 2026-10-29 | Items added or changed by others wait behind a line with how many and Show (`show-new-items`) | What the person is about to click never moves; the person decides when the list changes. |
| 2026-10-31 | The line of the new items sits at the end of the line of the summary, no longer an info `mds-banner` above the results: a dot that pulses three times when the count grows, the count in the info colour, Show `variant="info" tone="outline" size="sm"`; the line keeps its place while empty | The banner pushed the results down by 167 px when it appeared, against the case itself; in the line of the summary nothing moves, on a phone too. A line with no dot was too quiet (vittorio); the pulse stops after three beats (WCAG 2.2.2) and honours a reduced animation. Show is outlined as the action of a toast (`actions/toast`, #1189). Chosen live against the banner and the plain line (#1210). |
| 2026-10-29 | Choosing items for something else is a pattern of its own, the candidate `choose-items` | The selection lives across searches and ends in a choice, not in work on the items; each pattern stays shorter. |
