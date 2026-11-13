---
# A Magma building block: the format and the commands are in docs/PATTERNS.md, "A building block".
id: item-list
kind: block
title: Item list
group: data
layer: magma
status: decided
need: >-
  The person sees a set of items, narrows it to the ones they need, knows how many there are,
  and reaches the rest.
principle: "The search on top, then how many, then the items, then the pages: the same order in every list."
keywords: [list, list of items, results, search form, filter bar, filters, results summary, how many, table of items, list of cards, pages, pagination, sub-list, select rows, batch actions, new items]
not-for:
  - need: the head of the page that holds the list, its title and its actions (New, Export)
    use: page-header
  - need: choosing items from a list for something else (members to add to a group, documents to attach)
    use: choose-items
assumptions:
  - The back end can search, count, sort and page the set (list-with-filters).
high-stakes: false
components: [mds-input, mds-input-field, mds-input-select, mds-filter, mds-filter-item, mds-notification, mds-text, mds-button, mds-table, mds-table-header, mds-table-header-cell, mds-table-body, mds-table-row, mds-table-cell, mds-link, mds-badge, mds-file, mds-paginator]
used-by: [list-with-filters, empty-state, loading]
related: [list-with-filters, empty-state, loading, error-recovery, page-header, choose-items]
validated-on: []

variables:
  size: { values: [few, many], means: "few: the items fit in one page and are read at a glance (the documents of a request, the members of a small group); many: more than a page, to search and to page through" }
  goal: { values: [open, act], means: "open: the person opens one item at a time; act: the person acts on several items at once (assign, archive)" }
  changes: { values: ["no", by-others], means: "by-others: other people or systems add or change items while the list is on screen (a queue of incoming requests)" }

regions:
  - { id: search, when: { size: many }, what: "the search form: a field that searches the number and the name, then a select for each property with a few values, as short fields under it, two to a row, in a group of fields at the width of a form", use: ["mds-input type=search", "mds-input-field", "mds-input-field short", "mds-input-select"] }
  - { id: filters, when: { size: many }, what: "the statuses as one filter, each with how many items it would show, in the search form under its fields, when the items have a status", use: ["mds-filter", "mds-filter-item"] }
  - { id: summary, when: { size: many }, what: "one line: which items are on screen out of how many (\"11-20 di 46 pratiche\"), read out after every change, with Rimuovi i filtri when there are any", use: ["mds-text typography=detail tag=p role=status", "mds-button variant=dark tone=text size=sm"] }
  - { id: new-items, when: { changes: by-others }, what: "at the end of the line of the summary: how many items are new, the count in an info dot that pulses when it grows and the words in the info colour, and Mostra; the line keeps its place while nothing is new; Mostra hides once pressed and the focus goes to the heading of the list (list-with-filters, show-new-items)", use: ["mds-notification variant=info pulse", "mds-text typography=detail", "mds-button variant=info tone=outline size=sm"] }
  - { id: selection, when: { goal: act }, what: "a checkbox on each row and the bar of the batch actions, with how many are selected (list-with-filters, act-on-many)", use: ["mds-table selectable sorting=external", "mds-button slot=batch-action variant=dark tone=outline size=sm", "mds-button slot=batch-action variant=primary tone=outline size=sm"] }
  - { id: results, required: true, what: "the items: one row each, its number or its name the link to its page; the columns that can order the list order it from their headers; files as mds-file, one per file, in a grid; cards in a grid when the items are seen rather than read (results-as-cards)", use: ["mds-table sorting=external", "mds-table-header", "mds-table-header-cell label=<the name of the column> sortable sort-key=<what the back end orders by>", "mds-table-header-cell label=<the name of the column> sortable sort-key=<what the back end orders by> direction=descending", "mds-table-header-cell label=<the name of the column> sortable sort-key=<what the back end orders by> direction=ascending", "mds-table-header-cell label=<the name of the column>", "mds-table-body", "mds-table-row", "mds-table-cell", "mds-text typography=detail", "mds-link href=<the page of the item>", "mds-badge variant=<the tone of its status> label=<the status>", "mds-file"] }
  - { id: pages, when: { size: many }, what: "the pages, under the items, only when there is more than one", use: ["mds-paginator pages=<the number of pages> current-page=<the page shown>"] }

always-true:
  - id: same-order
    rule: "The search form, the summary, the items, the pages: in this order in every list; a region with nothing to show is left out, with its space."
    checked-by: review
  - id: order-in-the-headers
    rule: "The order of the list is set from the headers of the columns that can sort it, never by a field of the search form."
    checked-by: review
  - id: frame-wide-results
    rule: "The fields of the search form stand at the width of a form, the filter of the statuses as wide as its statuses; the items take the whole frame of the page or of their section."
    checked-by: review
  - id: summary-says-how-many
    from: list-with-filters
  - id: link-names-the-item
    from: list-with-filters
  - id: nothing-moves-by-itself
    from: list-with-filters
  - id: form
    from: widths
  - id: between-groups
    from: rhythm
  - id: between-fields
    from: rhythm
  - id: title-content
    from: rhythm

open-choices:
  - { id: results-as-cards, default: "a table, one row per item", may: "show the items as cards in a grid (mds-card) when they are seen rather than read: pictures, documents, people" }

situations:
  - { id: requests-of-an-office, situation: "The requests of an office, opened one at a time", size: many, goal: open, changes: "no" }
  - { id: requests-to-assign, situation: "Requests to assign to an operator, several at once", size: many, goal: act, changes: "no" }
  - { id: queue-of-a-desk, situation: "The queue of a front desk, where requests arrive while it is open", size: many, goal: open, changes: by-others }
  - { id: documents-of-a-request, situation: "The documents of a request, a section of its page", size: few, goal: open, changes: "no" }
---

# Item list

**The search on top, then how many, then the items, then the pages: the same order in every list.**

## When to use it

Wherever a page shows a set of items: the list of the requests of an office, the queue of a
desk, the documents of a request in a section of its page. It came out of the round of the
building blocks (2026-11-03): the search form, the summary and the results come back in the same
arrangement in `list-with-filters`, in `empty-state` (`clear-filters`: the panel takes the place
of the results, the search and the summary stay) and in `loading` (`keep-while-reloading`: the
results stay while the search reloads them). One block, not a bar of filters and a summary
apart: the regions always come together, in one order, and their spaces relate. The behaviour
over time (the query in the address, the first page after a change, the newest answer wins) is
`list-with-filters`; the block is where each part stands. Not the head of the page that holds
the list (`page-header`).

## What decides it

Three questions: whether the items fit in one page (then there is nothing to search nor to
page), whether the person acts on several at once (then they select them), and whether others
change the set while it is on screen (then the new items wait behind a line).

## Regions

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

| Variable | Values | Means |
| --- | --- | --- |
| `size` | `few`, `many` | few: the items fit in one page and are read at a glance (the documents of a request, the members of a small group); many: more than a page, to search and to page through |
| `goal` | `open`, `act` | open: the person opens one item at a time; act: the person acts on several items at once (assign, archive) |
| `changes` | `no`, `by-others` | by-others: other people or systems add or change items while the list is on screen (a queue of incoming requests) |

A region shows where its When holds, in this order: a required one always, the others when there is something to put in them.

| Region | When | Required | What | Use |
| --- | --- | --- | --- | --- |
| `search` | size: many |  | the search form: a field that searches the number and the name, then a select for each property with a few values, as short fields under it, two to a row, in a group of fields at the width of a form | `mds-input type=search`, `mds-input-field`, `mds-input-field short`, `mds-input-select` |
| `filters` | size: many |  | the statuses as one filter, each with how many items it would show, in the search form under its fields, when the items have a status | `mds-filter`, `mds-filter-item` |
| `summary` | size: many |  | one line: which items are on screen out of how many ("11-20 di 46 pratiche"), read out after every change, with Rimuovi i filtri when there are any | `mds-text typography=detail tag=p role=status`, `mds-button variant=dark tone=text size=sm` |
| `new-items` | changes: by-others |  | at the end of the line of the summary: how many items are new, the count in an info dot that pulses when it grows and the words in the info colour, and Mostra; the line keeps its place while nothing is new; Mostra hides once pressed and the focus goes to the heading of the list (list-with-filters, show-new-items) | `mds-notification variant=info pulse`, `mds-text typography=detail`, `mds-button variant=info tone=outline size=sm` |
| `selection` | goal: act |  | a checkbox on each row and the bar of the batch actions, with how many are selected (list-with-filters, act-on-many) | `mds-table selectable sorting=external`, `mds-button slot=batch-action variant=dark tone=outline size=sm`, `mds-button slot=batch-action variant=primary tone=outline size=sm` |
| `results` | any | yes | the items: one row each, its number or its name the link to its page; the columns that can order the list order it from their headers; files as mds-file, one per file, in a grid; cards in a grid when the items are seen rather than read (results-as-cards) | `mds-table sorting=external`, `mds-table-header`, `mds-table-header-cell label=<the name of the column> sortable sort-key=<what the back end orders by>`, `mds-table-header-cell label=<the name of the column> sortable sort-key=<what the back end orders by> direction=descending`, `mds-table-header-cell label=<the name of the column> sortable sort-key=<what the back end orders by> direction=ascending`, `mds-table-header-cell label=<the name of the column>`, `mds-table-body`, `mds-table-row`, `mds-table-cell`, `mds-text typography=detail`, `mds-link href=<the page of the item>`, `mds-badge variant=<the tone of its status> label=<the status>`, `mds-file` |
| `pages` | size: many |  | the pages, under the items, only when there is more than one | `mds-paginator pages=<the number of pages> current-page=<the page shown>` |

## Layout

- The block is one column of two groups, `gap-between-groups` (1000) between them
  (`rhythm/between-groups`): the search form, then the items.
- The search form is a `form role="search"`, its fields in a `field-group` at `max-w-form`
  (`widths/form`): the search field, then the selects as `short` fields under it, two to a
  row; the filter of the statuses under them, aligned to the start, as wide as its statuses;
  `gap-between-fields` (600) between the fields and the filter.
- The items group: the summary line, then the items, `gap-title-content` (300) between them, as
  a title and the content it names (`rhythm/title-content`); the pages under the items,
  `gap-between-fields` (600), aligned to the start.
- The summary line is a row: the summary, Rimuovi i filtri beside it (`gap-inline`), and at its
  end the line of the new items; on a narrow screen the line of the new items sits under the
  summary from the start, so neither its arrival nor its count moves the items.
- The items take the whole width of the frame or of their section (`w-full`); a table wider
  than a phone scrolls inside its own border, never the page, with its cells on one line
  (`[&_mds-table-cell]:text-nowrap`, as the usage of `mds-table` says).
- With few items there is no search, no summary and no pages: the items stand right under the
  title of their section.
- Files are `mds-file`, one per file, in a grid at `gap-between-containers` (400): one column,
  two from `@2xl` of their section, as `record-detail` lays out its documents.
- When nothing matches, the panel of `empty-state` (`clear-filters`) takes the place of the
  items, and the search and the summary stay; on the first load, the well of `loading` takes it.

## Always true

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

These hold in every product: a product layer cannot change them.

| Id | Rule | Checked by |
| --- | --- | --- |
| `same-order` | The search form, the summary, the items, the pages: in this order in every list; a region with nothing to show is left out, with its space. | review |
| `order-in-the-headers` | The order of the list is set from the headers of the columns that can sort it, never by a field of the search form. | review |
| `frame-wide-results` | The fields of the search form stand at the width of a form, the filter of the statuses as wide as its statuses; the items take the whole frame of the page or of their section. | review |
| `summary-says-how-many` | The summary says which items are on screen out of how many, and is read out after every change. (from `list-with-filters`) | review |
| `link-names-the-item` | Each item is opened by a link that names it, never by an Open repeated on every row. (from `list-with-filters`) | review |
| `nothing-moves-by-itself` | Items added or changed by others never move what is on screen; they wait until the person asks for them. (from `list-with-filters`) | review |
| `form` | `max-w-form` on the form, the width of the text around it (`56ch`, 532 px at 16 px); its fields take the whole column, and its row of actions stands at the end of the column (`actions/place`) (from `widths`) |  |
| `between-groups` | `gap-between-groups` (1000) between two groups of fields of one form (the fieldsets of personal data and of residence) (from `rhythm`) |  |
| `between-fields` | `gap-between-fields` (600) between two fields of a form, or two rows of data (from `rhythm`) |  |
| `title-content` | `gap-title-content` (300) between a title and the content it names (from `rhythm`) |  |

## Open choices

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

The default decides these; a product layer may narrow them.

| Id | Default | A product may |
| --- | --- | --- |
| `results-as-cards` | a table, one row per item | show the items as cards in a grid (mds-card) when they are seen rather than read: pictures, documents, people |

## Situations

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

Situations every application has, each with the regions it shows: they give the examples, the texts and the keywords. The situations of a product's own domain go in its layer.

| Id | Situation | Regions |
| --- | --- | --- |
| `requests-of-an-office` | The requests of an office, opened one at a time | `search`, `filters`, `summary`, `results`, `pages` |
| `requests-to-assign` | Requests to assign to an operator, several at once | `search`, `filters`, `summary`, `selection`, `results`, `pages` |
| `queue-of-a-desk` | The queue of a front desk, where requests arrive while it is open | `search`, `filters`, `summary`, `new-items`, `results`, `pages` |
| `documents-of-a-request` | The documents of a request, a section of its page | `results` |

## Accessibility

- The search form has `role="search"`; each field has its label (`mds-input-field`).
- The summary has `role="status"`: it is read out after every change, without moving the focus.
- Each item is opened by a link that names it, never by an Open repeated on every row.
- The selection of a row is a checkbox named after its item (`mds-table selectable`).

## Content

- The summary says which items out of how many, with the noun of the set: "11-20 di 46
  pratiche". When nothing matches it says so ("Nessuna pratica corrisponde") and the panel of
  `empty-state` takes the place of the items, with Rimuovi i filtri only in the panel
  (`clear-filters`).
- Rimuovi i filtri, the words of `mds-filter`.
- The new items: "2 nuove pratiche", the 2 in the dot, then Mostra.

## Magma gaps

- None for the default: every region is a component of Magma or a class of its Tailwind layer.

## Decisions

| Date | Decision | Why |
| --- | --- | --- |
| 2026-11-03 | The list of items is a block: the search, the summary, the items and the pages come back in `list-with-filters`, `empty-state` and `loading` | The round of the building blocks, from the previews of the three patterns; the docs site names the filter bar and the results summary among the candidates (`plan/DIRECTION.md`, Building blocks section). |
| 2026-11-03 | One block, not a bar of filters and a summary apart | The maintainer's choice: the regions always come together, in one order, with related spaces, so one answer of `get_pattern` gives the whole list; the regions with a When cover the list of a section, with no search. |
| 2026-11-03 | The line of the new items carries the dot that pulses when the count grows, from `mds-notification` once #1216 lands; until then, none | The maintainer's note in the review of round 3 ("l'elemento dovrebbe avere una icona pulsante"); asked whether to draw it by hand meanwhile, he chose #1216 first: a product never writes the animation itself (`list-with-filters`, Magma gaps). |
| 2026-11-04 | The dot of the new items is `mds-notification variant="info" pulse`, the count its `value` | #1216 landed (PR #1239), as the decision of 2026-11-03 waited for: the pulse follows `value`, so the dot carries the count (`list-with-filters`). |
| 2026-11-13 | Each region names in its use every part the previews of its situations show, the texts of the application as placeholders, the stage of the previews marked `data-stage` | The `use` of the regions named part of what their previews show, the rows and cells of the table none of them: the agents of the products composed the rest by hand. https://github.com/magma-design-system/magma/issues/1396 |
