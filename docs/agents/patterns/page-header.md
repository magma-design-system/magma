---
# A Magma building block: the format and the commands are in docs/PATTERNS.md, "A building block".
id: page-header
kind: block
title: Page header
group: navigation
layer: magma
status: decided
need: >-
  The person sees at once what the page holds or is about, where they are, and what they can do
  with it.
principle: The head of the page names what it shows, says where it sits, and puts its actions in one place.
keywords: [page header, page title, heading, title bar, back link, page actions, header of the page]
not-for: []
used-by: [list-with-filters, record-detail]
high-stakes: false
components: [mds-button, mds-text, mds-badge]
related: [list-with-filters, record-detail]
validated-on: []

variables:
  level: { values: [top, nested], means: "top: a page reached from the navigation of the application (a list, a settings page); nested: a page under another one (a record under its list, a sub-list under a record)" }
  subject: { values: [set, item], means: "set: the page shows a set of items (a list); item: the page is about one item (a record, a profile)" }

regions:
  - { id: back, when: { level: nested }, what: "a link to the page above, named after it, with an arrow", use: ["mds-button href icon variant=dark tone=text size=sm"] }
  - { id: number, when: { subject: item }, what: "the number or code of the item, small, above the title, when it has one", use: ["mds-text typography=caption tag=p"] }
  - { id: title, required: true, what: "the heading of the page: what the set holds, in the plural, or the subject of the item", use: ["mds-text typography=h3 tag=h1"] }
  - { id: status, when: { subject: item }, what: "the status of the item, next to the title, when it has one", use: ["mds-badge"] }
  - { id: summary, what: "one line: what the set holds, or where the item belongs and when it arrived", use: ["mds-text typography=detail tag=p"] }
  - { id: actions, what: "the actions on what the page shows, the main one last in the strong tone, the others outlined; an action that destroys the item is never in the row: it goes last in the menu of the item, after a separator", use: ["mds-button variant=dark tone=outline", "mds-button tone=strong"] }

always-true:
  - id: one-h1
    rule: The title is the h1 of the page, and the only one.
    checked-by: review
  - id: title-names-the-page
    rule: "The title names what the page holds or is about: the plural of the set, the subject of the item; never the kind of screen (\"Detail\", \"List\")."
    checked-by: review
  - id: back-names-the-parent
    rule: The way back is a link that names the page it returns to ("Requests"), never "Back".
    checked-by: review
  - id: not-the-app-bar
    rule: The page header is the head of the main content, under the bar of the application; the navigation of the application is never in it.
    checked-by: review
  - id: main-action-last
    from: record-detail
  - id: title-content
    from: rhythm
  - id: inline
    from: rhythm
  - id: between-sections
    from: rhythm

open-choices:
  - { id: actions-overflow, default: "every action visible, wrapping under the title on a narrow screen", may: "move the actions used least into a menu next to the main one (mds-button-dropdown)" }

situations:
  - { situation: The list of the requests of an office, level: top, subject: set }
  - { situation: A request opened from the list, level: nested, subject: item }
  - { situation: "The members of a group, on a page of their own", level: nested, subject: set }
  - { situation: The profile of the person signed in, level: top, subject: item }
  - { situation: A contact being edited, level: nested, subject: item, note: "the title says the action (\"Edit Mario Rossi\"); the buttons of the form follow form-and-validation" }
---

# Page header

**The head of the page names what it shows, says where it sits, and puts its actions in one place.**

## When to use it

At the top of the main content of every page of an application, under the bar of the
application (`mds-header`): the list of the requests, the page of a request, the members of a
group, a profile. It came out of the patterns of the group Data, where it comes back in the same
arrangement (`list-with-filters`: the title with New and Export; `record-detail`: back to the
list, the identity of the record, its actions). Not the bar of the application, with the logo
and the navigation (`mds-header`, `mds-header-bar`), and not the views of the page: tabs are a
section of their own, under the header.

## What decides it

Two questions: whether the page sits under another one (then it has a way back), and whether it
shows a set or is about one item (then it may have a number and a status).

## Regions

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

| Variable | Values | Means |
| --- | --- | --- |
| `level` | `top`, `nested` | top: a page reached from the navigation of the application (a list, a settings page); nested: a page under another one (a record under its list, a sub-list under a record) |
| `subject` | `set`, `item` | set: the page shows a set of items (a list); item: the page is about one item (a record, a profile) |

A region shows where its When holds, in this order: a required one always, the others when there is something to put in them.

| Region | When | Required | What | Use |
| --- | --- | --- | --- | --- |
| `back` | level: nested |  | a link to the page above, named after it, with an arrow | `mds-button href icon variant=dark tone=text size=sm` |
| `number` | subject: item |  | the number or code of the item, small, above the title, when it has one | `mds-text typography=caption tag=p` |
| `title` | any | yes | the heading of the page: what the set holds, in the plural, or the subject of the item | `mds-text typography=h3 tag=h1` |
| `status` | subject: item |  | the status of the item, next to the title, when it has one | `mds-badge` |
| `summary` | any |  | one line: what the set holds, or where the item belongs and when it arrived | `mds-text typography=detail tag=p` |
| `actions` | any |  | the actions on what the page shows, the main one last in the strong tone, the others outlined; an action that destroys the item is never in the row: it goes last in the menu of the item, after a separator | `mds-button variant=dark tone=outline`, `mds-button tone=strong` |

## Layout

- The way back first, on its own line, aligned to the start.
- Then the identity (number, title with its status, summary) at the start, and the actions at
  the end, aligned to the top, on a wide screen; on a narrow one the actions go under the
  identity and wrap.
- The status sits next to the title and wraps under it when there is no room; a long title wraps
  too (`min-w-0`), it never pushes the actions out.
- The spaces are relations of the rhythm: `gap-300` inside the identity, between a title and
  what it names (`rhythm/title-content`); `gap-300` between the actions, and between the
  identity and the actions, side by side in one row (`rhythm/inline`).
- The header is the first section of the page: the page puts `gap-1600` between it and the
  content under it, as between two sections (`rhythm/between-sections`), with the gap of the
  container that lays out its sections; the block has no margin of its own.
- A region with nothing to show is left out, with its space: a page with no actions has no empty
  bar.
- The tabs of a page, when it has views, are the first section under the header.

## Always true

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

These hold in every product: a product layer cannot change them.

| Id | Rule | Checked by |
| --- | --- | --- |
| `one-h1` | The title is the h1 of the page, and the only one. | review |
| `title-names-the-page` | The title names what the page holds or is about: the plural of the set, the subject of the item; never the kind of screen ("Detail", "List"). | review |
| `back-names-the-parent` | The way back is a link that names the page it returns to ("Requests"), never "Back". | review |
| `not-the-app-bar` | The page header is the head of the main content, under the bar of the application; the navigation of the application is never in it. | review |
| `main-action-last` | The main action comes last, in the strong tone; the others are outlined, `variant="dark" tone="outline"`; an action that destroys the record is never among them, it goes last in the menu of the record. (from `record-detail`) | review |
| `title-content` | `gap-300` between a title and the content it names (from `rhythm`) |  |
| `inline` | `gap-300` between elements side by side in one row: the actions of a row, a field and the button beside it (from `rhythm`) |  |
| `between-sections` | `gap-1600` between two sections of a page, each with its title (from `rhythm`) |  |

## Open choices

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

The default decides these; a product layer may narrow them.

| Id | Default | A product may |
| --- | --- | --- |
| `actions-overflow` | every action visible, wrapping under the title on a narrow screen | move the actions used least into a menu next to the main one (mds-button-dropdown) |

## Situations

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

Situations every application has, each with the regions it shows: they give the examples, the texts and the keywords. The situations of a product's own domain go in its layer.

| Situation | Regions |
| --- | --- |
| The list of the requests of an office | `title`, `summary`, `actions` |
| A request opened from the list | `back`, `number`, `title`, `status`, `summary`, `actions` |
| The members of a group, on a page of their own | `back`, `title`, `summary`, `actions` |
| The profile of the person signed in | `number`, `title`, `status`, `summary`, `actions` |
| A contact being edited | `back`, `number`, `title`, `status`, `summary`, `actions`: the title says the action ("Edit Mario Rossi"); the buttons of the form follow form-and-validation |

## Accessibility

- The title is the `h1`; a pattern that moves the focus to it after an action gives it
  `tabindex="-1"` (`focus-to-heading` of `record-detail`).
- A `header` element inside `main` is not a landmark: the bar of the application keeps the
  banner.
- The way back is a link with the address of the page above, so it also works in a new tab.
- The number and the summary are text, not headings.

## Content

- The title is the plural of the set ("Requests") or the subject of the item ("Change of
  residence"); the number goes above it, smaller.
- The way back is the name of the page above ("Requests"), with the arrow.
- The summary is one line: what the set holds ("The requests citizens send to the offices"), or
  where the item belongs and when it arrived ("Registry office, received on 3 March 2026").
- Actions are verbs on what the page shows: "New request", "Export", "Close request".

## Magma gaps

- `mds-breadcrumb-item` has no `href`: Magma has no trail of links. The default needs none (one
  link to the page above); a product that needs a trail asks for it with an issue.

## Decisions

| Date | Decision | Why |
| --- | --- | --- |
| 2026-10-24 | A block is a section of a page that comes back in the same arrangement, structure and layout only; it is born when it comes back in two or three patterns; the page header is a candidate | The docs site, `plan/DIRECTION.md`, Building blocks section. |
| 2026-10-29 | The page header is the first block: it comes back in `list-with-filters` and `record-detail` | The threshold of two patterns, reached in the group Data. |
| 2026-10-29 | A block has the base of a pattern, with `regions` in order instead of `cases`: each region says when it shows | Its regions are independent: as cases, the page header would be eight near copies; space is what shows where. |
| 2026-10-29 | A block ships as markup to apply, with its code in HTML, React and Angular, like a pattern | No new API to version; a component is weighed when the block is stable in the layers of two or three products. |
| 2026-10-29 | The tabs of a page are a section of their own, under the header | The header stays short; the views belong to the content they switch. |
| 2026-10-29 | The way back is one link to the page above, named after it; no trail | Management applications have two or three levels, and the navigation of the application says where the person is; `mds-breadcrumb-item` has no links. |
| 2026-10-31 | The group is `navigation` | The docs site, `plan/DIRECTION.md`, Patterns section: Navigation names the page header among the building blocks. |
| 2026-10-31 | The actions other than the main one are `variant="dark" tone="outline"`, no longer weak; an action that destroys the item goes in its menu, never in the row | The design language, #1189: `actions/secondary` and `actions/destructive-in-menu`. |
| 2026-10-31 | The spaces of the Layout are relations of the rhythm, `title-content` and `inline` (`gap-300`), no longer 200 and 400 | The design language, #1189: the rhythm, on main since #1206; the old values came from the previews. |
| 2026-10-31 | The header is the first section of the page: `gap-1600` between it and the content under it (`rhythm/between-sections`), put by the page, not by the block | The header names the whole page: at the step of the sections it belongs to none of them (`step-ratio`), and the rhythm needs no new relation. Rejected: `gap-1000`, which on a page of several sections puts the header nearer to the first one than that one to the next, so it reads as the head of the first section. Chosen live on a record with sections and on a list (#1210). |
