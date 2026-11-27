---
# A Magma pattern: the format and the commands are in docs/PATTERNS.md.
id: list-and-detail
kind: pattern
title: List and detail
group: data
layer: magma
status: decided
need: >-
  The person picks one item of a short list and reads or changes it beside the list, going from
  one item to the next without losing the list.
principle: >-
  The list stays beside the item it opens and marks it as current; the address holds the item,
  and a change holds as it is made.
keywords: [list and detail, master detail, master-detail, list beside, side list, sidebar list, selected item, current item, edit beside the list, groups of items, templates, roles and permissions, recent conversations, inbox, settings of an item, two panes]
not-for:
  - need: the sections of an application, reached from every page
    use: app-shell
  - need: finding items in a long list by searching, filtering and paging, each opening as a page
    use: list-with-filters
  - need: one record read and acted on, on its own page, changed with Edit and saved with a button
    use: record-detail
  - need: the result of an editor kept in view beside the controls that change it
    use: edit-with-preview
  - need: the head of the page, its title and its actions
    use: page-header
assumptions:
  - "The list holds a few dozen items at most, which the person scans with the eye, in groups when they have them: a list to search goes to list-with-filters."
  - "The person goes often from one item to another, so the list is worth its room beside the detail."
  - "A change applies as it is made, to the item or to a draft of the whole set saved elsewhere (the bar of an editor); an item saved with a button of its own opens as a page: record-detail."
high-stakes: false
components: [mds-button, mds-list, mds-list-item, mds-text, mds-details, mds-input-field, mds-input-select, mds-input]
related: [record-detail, list-with-filters, edit-with-preview, empty-state, confirm-action, app-shell, page-header, item-list]
validated-on: [studio]

variables:
  room:
    values: [wide, narrow]
    means: "Is the element that holds the list and the detail wide enough for both side by side: from 768 px (the container 3xl), where the detail keeps the row of actions of its head inside its gutters beside the list?"

cases:
  - id: beside
    room: wide
    where: "the list in a column of `6000` (15rem) at the start edge of the window under the bar, an aside named by what it lists, with a border at its end and its own scroll; at its head the action that adds an item; then each group, its heading and the link to its page elsewhere when it has one, then its items, each a link to its address, the one on screen current; the detail beside it, in the rest of the window with the gutters of the page: the head of the page, then the item, its name with its menu, under it what it does and, closed, what it reaches, then every field in line in the column of a form; choosing an item opens it beside, the list staying as it was"
    use:
      - { role: "Add, the action of the list, at its head", use: "mds-button type=button variant=primary tone=outline" }
      - { role: "the heading of a group of items", use: "mds-text typography=part tag=h2" }
      - { role: "the page of the group elsewhere, when it has one, an icon named by the group and where it opens", use: "mds-button href=<the page of the group> variant=dark tone=text size=sm aria-label=<the group, and where it opens>" }
      - { role: "the items of a group", use: "mds-list marker=none" }
      - { role: "an item of the list", use: mds-list-item }
      - { role: "an item, a link to its address, its mark before its name", use: "mds-button href=<the address of the item> variant=dark tone=text" }
      - { role: "the item on screen, marked as current", use: "mds-button href=<the address of the item> variant=dark tone=text current" }
      - { role: "the name of the item, the heading of the detail", use: "mds-text typography=section tag=h2" }
      - { role: "the actions of the item, in its menu beside its name", use: "mds-button type=button variant=dark tone=text aria-label=<the actions, naming the item>" }
      - { role: "what the item does, a line under its name", use: "mds-text typography=detail tag=p" }
      - { role: "what the item reaches, closed, its count in its title", use: mds-details }
      - { role: "the title of what it reaches", use: "mds-text slot=title typography=detail tag=span" }
      - { role: "a field of the item, in line", use: mds-input-field }
      - { role: "a choice among a few values, inside its field", use: mds-input-select }
      - { role: "a text of the item, inside its field", use: mds-input }
      - { role: "a longer text of the item, inside its field", use: "mds-input type=textarea" }
    magma-gap: "an item takes only an icon before its name, and nothing after it: an avatar, an image or a swatch, and a state or a count at its end, wait on #1518 widened to a slot at the end"
    rules: [widths/workspace, widths/form, titles/page, titles/section, titles/part, actions/part-primary, actions/destructive-in-menu, rhythm/between-fields, rhythm/between-groups]
  - id: folded
    room: narrow
    where: "the list folds into one button above the page, across its column, named by the item on screen with an arrow at its end that says whether the list is open; pressed, the list takes the place of the page, as wide as the page, Add at its head; choosing an item closes it and moves the focus to the heading of the detail; the page under it is the detail of the wide case, in one column"
    use:
      - { role: "the list folded above the page, named by the item on screen; its arrow says whether it is open", use: "mds-button type=button variant=dark tone=weak icon-position=right label=<the name of the item on screen>" }
      - { role: "Add, the action of the list, at its head", use: "mds-button type=button variant=primary tone=outline" }
      - { role: "the heading of a group of items", use: "mds-text typography=part tag=h2" }
      - { role: "the items of a group", use: "mds-list marker=none" }
      - { role: "an item of the list", use: mds-list-item }
      - { role: "an item, a link to its address, its mark before its name", use: "mds-button href=<the address of the item> variant=dark tone=text" }
      - { role: "the item on screen, marked as current", use: "mds-button href=<the address of the item> variant=dark tone=text current" }
      - { role: "the name of the item, the heading of the detail, where the focus lands when the list closes", use: "mds-text typography=section tag=h2 tabindex=-1" }
      - { role: "the actions of the item, in its menu beside its name", use: "mds-button type=button variant=dark tone=text aria-label=<the actions, naming the item>" }
      - { role: "what the item does, a line under its name", use: "mds-text typography=detail tag=p" }
      - { role: "a field of the item, in line", use: mds-input-field }
      - { role: "a text of the item, inside its field", use: mds-input }
      - { role: "a longer text of the item, inside its field", use: "mds-input type=textarea" }
    magma-gap: "an item takes only an icon before its name, and nothing after it: an avatar, an image or a swatch, and a state or a count at its end, wait on #1518 widened to a slot at the end"
    rules: [titles/page, titles/section, titles/part, actions/part-primary, rhythm/between-fields, rhythm/between-groups]

gaps: []
not-applicable: []

always-true:
  - id: current-marked
    rule: "The item on screen is marked in the list by current on its mds-button, one item at a time, the same in the list and in the button that folds it: never by a tone, a class or an aria-current written by hand, never by disabled."
    checked-by: review
  - id: address-holds-item
    rule: "The address holds the item on screen: each item of the list is a link to it, so a reload, Back and a shared link open the same item; an address that names no item opens the first item of the list."
    checked-by: review
  - id: change-holds
    rule: "A change in the detail applies as it is made and is still there when the person comes back to the item: opening another item never asks to save, and never loses what was written."
    checked-by: review
  - id: list-stays
    rule: "The list stays as it was while another item opens: its scroll, its groups and its order; only the mark of the current item moves."
    checked-by: review
  - id: add-at-head
    rule: "The action that adds an item stands at the head of the list, the primary action of that part; the item added opens at once as the current one, its first field ready to fill."
    checked-by: review
  - id: named-regions
    rule: "The list is a region named by what it lists (an aside with its aria-label), its groups headed by their name; the detail is a section named by the heading of the item."
    checked-by: review
  - { id: one-h1, from: titles }
  - { id: start-edge, from: widths }

open-choices:
  - id: opens-first
    default: "the first item of the list, when the address names none"
    may: "open the item the person had open last, kept by the application, when the address names none"

situations:
  - { situation: "The templates of the notices of an office, in groups by service, each changed beside the list", case: beside }
  - { situation: "The roles of an application, each with its permissions, changed one at a time beside the list", case: beside }
  - { situation: "The recent conversations of a chat, each opening beside the list, the open one current", case: beside }
  - { situation: "The same templates on a phone", case: folded }
  - { situation: "An item added to the list", case: beside, note: "it opens at once as the current one, its first field ready to fill; when it needs data before it exists, a dialog asks for it first" }
  - { situation: "The item on screen deleted from its menu", case: beside, note: "the menu holds Delete last (actions, destructive-in-menu) and confirm-action decides whether to ask; then the next item of the list opens, the one before when it was the last" }
  - { situation: "No item yet in the list", use: empty-state }
  - { situation: "An address that names an item deleted meanwhile", use: empty-state }
---

# List and detail

**The list stays beside the item it opens and marks it as current; the address holds the item, and a change holds as it is made.**

## When to use it

A list of a few dozen items that the person goes through one at a time, reading or changing each
beside the list: the templates of the notices of an office, the roles of an application and
their permissions, the colours of a theme in their groups, the recent conversations of a chat.
The list chooses what the page shows, not where to go: it stays beside the item it opens, marks
it, and the person goes from one item to the next without leaving it.

Something else fits better:

- the sections of an application, reached from every page: `app-shell`, whose bar is the
  navigation;
- a long list to search, filter and page, each item opening as a page of its own:
  `list-with-filters` and `record-detail`;
- one record with a process, its actions and its history, changed with Edit and saved with a
  button: `record-detail`;
- an editor whose result is judged while changing it: `edit-with-preview` (the detail of this
  pattern can be one, its result beside the fields where the page has room).

## What decides it

- Whether the list and the detail stand side by side. The list takes `6000` (15rem): the names
  of its items and a mark before them. The detail keeps at least the row of actions of its head
  (`--container-actions`, 23.75rem) inside the gutters of the page (`--magma-width-page-gutter`,
  1.5rem on each side): 41.75rem with the list, which the scale rounds up to its next step, the
  container `3xl` (768 px). From there the list stands beside; under it, it folds above the page.
  The threshold is a container query on the element that holds the two, so it holds inside a
  shell with columns of its own, as in the studio.

## Cases

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

| Variable | Values | Means |
| --- | --- | --- |
| `room` | `wide`, `narrow` | Is the element that holds the list and the detail wide enough for both side by side: from 768 px (the container 3xl), where the detail keeps the row of actions of its head inside its gutters beside the list? |

A case that leaves a variable out holds for any of its values.

| Case | When | Where | Rules |
| --- | --- | --- | --- |
| `beside` | room: wide | the list in a column of `6000` (15rem) at the start edge of the window under the bar, an aside named by what it lists, with a border at its end and its own scroll; at its head the action that adds an item; then each group, its heading and the link to its page elsewhere when it has one, then its items, each a link to its address, the one on screen current; the detail beside it, in the rest of the window with the gutters of the page: the head of the page, then the item, its name with its menu, under it what it does and, closed, what it reaches, then every field in line in the column of a form; choosing an item opens it beside, the list staying as it was; Magma gap: an item takes only an icon before its name, and nothing after it: an avatar, an image or a swatch, and a state or a count at its end, wait on #1518 widened to a slot at the end | `widths/workspace`, `widths/form`, `titles/page`, `titles/section`, `titles/part`, `actions/part-primary`, `actions/destructive-in-menu`, `rhythm/between-fields`, `rhythm/between-groups` |
| `folded` | room: narrow | the list folds into one button above the page, across its column, named by the item on screen with an arrow at its end that says whether the list is open; pressed, the list takes the place of the page, as wide as the page, Add at its head; choosing an item closes it and moves the focus to the heading of the detail; the page under it is the detail of the wide case, in one column; Magma gap: an item takes only an icon before its name, and nothing after it: an avatar, an image or a swatch, and a state or a count at its end, wait on #1518 widened to a slot at the end | `titles/page`, `titles/section`, `titles/part`, `actions/part-primary`, `rhythm/between-fields`, `rhythm/between-groups` |

No gaps: every combination has a case or is not applicable.

The parts of each case, in the order of its preview: what each does in the case, and the component to write. A value in angle brackets is the text of the application, written as it says; the rest of the preview is its stage, the context of the case.

`beside`:

| Role | Use |
| --- | --- |
| Add, the action of the list, at its head | `mds-button type=button variant=primary tone=outline` |
| the heading of a group of items | `mds-text typography=part tag=h2` |
| the page of the group elsewhere, when it has one, an icon named by the group and where it opens | `mds-button href=<the page of the group> variant=dark tone=text size=sm aria-label=<the group, and where it opens>` |
| the items of a group | `mds-list marker=none` |
| an item of the list | `mds-list-item` |
| an item, a link to its address, its mark before its name | `mds-button href=<the address of the item> variant=dark tone=text` |
| the item on screen, marked as current | `mds-button href=<the address of the item> variant=dark tone=text current` |
| the name of the item, the heading of the detail | `mds-text typography=section tag=h2` |
| the actions of the item, in its menu beside its name | `mds-button type=button variant=dark tone=text aria-label=<the actions, naming the item>` |
| what the item does, a line under its name | `mds-text typography=detail tag=p` |
| what the item reaches, closed, its count in its title | `mds-details` |
| the title of what it reaches | `mds-text slot=title typography=detail tag=span` |
| a field of the item, in line | `mds-input-field` |
| a choice among a few values, inside its field | `mds-input-select` |
| a text of the item, inside its field | `mds-input` |
| a longer text of the item, inside its field | `mds-input type=textarea` |

`folded`:

| Role | Use |
| --- | --- |
| the list folded above the page, named by the item on screen; its arrow says whether it is open | `mds-button type=button variant=dark tone=weak icon-position=right label=<the name of the item on screen>` |
| Add, the action of the list, at its head | `mds-button type=button variant=primary tone=outline` |
| the heading of a group of items | `mds-text typography=part tag=h2` |
| the items of a group | `mds-list marker=none` |
| an item of the list | `mds-list-item` |
| an item, a link to its address, its mark before its name | `mds-button href=<the address of the item> variant=dark tone=text` |
| the item on screen, marked as current | `mds-button href=<the address of the item> variant=dark tone=text current` |
| the name of the item, the heading of the detail, where the focus lands when the list closes | `mds-text typography=section tag=h2 tabindex=-1` |
| the actions of the item, in its menu beside its name | `mds-button type=button variant=dark tone=text aria-label=<the actions, naming the item>` |
| what the item does, a line under its name | `mds-text typography=detail tag=p` |
| a field of the item, in line | `mds-input-field` |
| a text of the item, inside its field | `mds-input` |
| a longer text of the item, inside its field | `mds-input type=textarea` |

## Parts

- **The list**: an `aside` named by what it lists, at the start edge, with a border at its end
  and its own scroll, so the detail scrolls apart. At its head the action that adds an item,
  `mds-button variant="primary" tone="outline"` across the column (`actions`, `part-primary`).
  Then each group: its heading (`titles`, `part`) and, when the group has a page of its own (its
  settings), an icon button beside it named by the group and where it opens; then its items, in
  an `mds-list marker="none"`, one `mds-list-item` each.
- **An item**: an `mds-button href variant="dark" tone="text"` across the column, its name after
  its mark (an icon for the kind of item: the channel, the type), the one on screen `current`.
  The items keep the order of their domain (chromatic in the studio), the same at every visit.
- **The detail**: the head of the page (`page-header`), then the item: its name, the heading of
  the detail (`titles`, `section`), with its menu beside it (Duplicate, then Delete last after a
  separator: `actions`, `destructive-in-menu`); under it a line of what the item does and, when
  the item reaches other things, an `mds-details` closed with their count in its title ("Usato
  da 3 servizi"); then every field in line, in the column of a form (`widths`, `form`). A field
  whose value comes from elsewhere (the group, the whole set) says so on a line under it, with a
  link to where it is decided, until `form-and-validation` decides the inherited value.
- **The fold**, under the threshold: one `mds-button tone="weak"` across the column above the
  page, its label the name of the item on screen, its arrow at the end (`icon-position="right"`)
  pointing down when the list is closed and up when it is open, with `aria-expanded` and
  `aria-controls` on the list.

## Behaviour over time

- **Arriving**: the address names the item to open; an address that names none opens the first
  item of the list (a product may open the last one the person had open: `opens-first`).
- **Choosing an item**: its link changes the address and the detail beside shows it; the list
  keeps its scroll and its order, and only the mark of the current item moves. The current item
  does nothing when pressed again (`current`). Where the list is beside, the focus stays on the
  item, as in the studio; where it is folded, the list closes and the focus moves to the heading
  of the detail.
- **Changing it**: a change applies as it is made, to the item or to the draft of the whole set;
  the person opens another item and comes back, and finds what they wrote. Nothing asks to save
  on the way out of an item: an item saved with a button of its own is `record-detail`.
- **Adding one**: Add opens the new item at once as the current one, in its place in the order,
  its first field ready; an item that needs data before it exists asks for it in a dialog first
  (in the studio, the colour and its group).
- **Deleting the one on screen**: from its menu, Delete last; `confirm-action` decides whether
  to ask or to undo; then the next item opens, the one before when it was the last.
- **Empty**: with no item yet there is nothing to list: the empty state of a first use takes the
  place of the list and the detail (`empty-state`, `add-the-first`), its one action adding the
  first item, which opens as after Add. An address that names an item deleted meanwhile is the
  `not-found` of `empty-state`, in the place of the detail.

## Always true

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

These hold in every product: a product layer cannot change them.

| Id | Rule | Checked by |
| --- | --- | --- |
| `current-marked` | The item on screen is marked in the list by current on its mds-button, one item at a time, the same in the list and in the button that folds it: never by a tone, a class or an aria-current written by hand, never by disabled. | review |
| `address-holds-item` | The address holds the item on screen: each item of the list is a link to it, so a reload, Back and a shared link open the same item; an address that names no item opens the first item of the list. | review |
| `change-holds` | A change in the detail applies as it is made and is still there when the person comes back to the item: opening another item never asks to save, and never loses what was written. | review |
| `list-stays` | The list stays as it was while another item opens: its scroll, its groups and its order; only the mark of the current item moves. | review |
| `add-at-head` | The action that adds an item stands at the head of the list, the primary action of that part; the item added opens at once as the current one, its first field ready to fill. | review |
| `named-regions` | The list is a region named by what it lists (an aside with its aria-label), its groups headed by their name; the detail is a section named by the heading of the item. | review |
| `one-h1` | The title of the page is its h1, and the only one. (from `titles`) | review |
| `start-edge` | Capped content (text, forms) stands at the start edge of its frame, never centred inside it: the title, the text, the form and the table of a page start on the edge of the content of the bar. (from `widths`) | review |

## Open choices

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

The default decides these; a product layer may narrow them.

| Id | Default | A product may |
| --- | --- | --- |
| `opens-first` | the first item of the list, when the address names none | open the item the person had open last, kept by the application, when the address names none |

## Situations

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

Situations every application has, each with its case: they give the examples, the texts and the keywords. The situations of a product's own domain go in its layer.

| Situation | Case |
| --- | --- |
| The templates of the notices of an office, in groups by service, each changed beside the list | `beside` |
| The roles of an application, each with its permissions, changed one at a time beside the list | `beside` |
| The recent conversations of a chat, each opening beside the list, the open one current | `beside` |
| The same templates on a phone | `folded` |
| An item added to the list | `beside`: it opens at once as the current one, its first field ready to fill; when it needs data before it exists, a dialog asks for it first |
| The item on screen deleted from its menu | `beside`: the menu holds Delete last (actions, destructive-in-menu) and confirm-action decides whether to ask; then the next item of the list opens, the one before when it was the last |
| No item yet in the list | not here: `empty-state` |
| An address that names an item deleted meanwhile | not here: `empty-state` |

## Accessibility

- The list is a landmark (`aside`, named by what it lists), so a screen reader reaches it from
  anywhere; its groups are headings, its items links in the Tab order, the current one announced
  as the current page (`mds-button` writes `aria-current`).
- The detail is a section named by the heading of the item; the heading takes `tabindex="-1"` so
  the focus can land on it when the folded list closes.
- The fold says what it holds and its state: its label is the item on screen, `aria-expanded`
  says whether the list is open, `aria-controls` names the list.
- The icon button of a group is named by the group and where it opens ("Il servizio Richieste,
  nelle impostazioni"); the menu of the item by the item ("Azioni di Approvata").
- No `role="listbox"` nor arrow keys: as in `mds-tree`, every item stays a Tab stop and a link,
  which a person opens in a new tab too.

## Content

- The name of an item is short and unique in its group, and the same in the list, in the heading
  of the detail, in the fold and in the address.
- The groups are named after what holds the items: the service, the office, the family.
- Add names what it adds: "Aggiungi modello", "Aggiungi colore", not "Nuovo".
- The line under the name says what the item does, for whom, when: "Arriva a chi ha inviato una
  richiesta, quando l'ufficio la approva."
- What it reaches gives its count in the title of its detail: "Usato da 3 servizi".

## Magma gaps

- `mds-button` takes only an icon before its label, and nothing after it: an item with an avatar,
  an image or a swatch (the recent conversations of #1518, the colours of the studio) and an item
  with a state or a count at its end (the badges of the studio) are drawn by hand. #1518 asks for
  the slot at the start; it is widened to a slot at the end. Until then an item shows an icon or
  nothing, and its state stays in its detail.
- `widths` has no box for the list beside a detail, nor a threshold named after it: the list is
  `6000` and the threshold the container `3xl`, values written here with their reason until
  `widths` gets the case (its custom property and its container).
- Two patterns now lay out panels side by side, this one and `edit-with-preview`: whether they
  are one section, the block of a workspace, is a question for a building block.

## Decisions

| Date | Decision | Why |
| --- | --- | --- |
| 2026-11-27 | A pattern of the group data, `list-and-detail` | vittorio, from the kind asked first; the issue #1262: the list chooses what the page shows, not where to go, so it is not `app-shell`; `item-list` opens an item as a page of its own. |
| 2026-11-27 | The source is the stage Colours of the studio, `validated-on: studio` | Its renders, chosen by vittorio on 2026-11-27 (`projects/studio/studio.object-model.md`, section 5, "1. Colori", on #1403, PR #1583). The studio builds it as `record-detail` with the list beside until this pattern, and adopts `current` and the address after it. |
| 2026-11-27 | The item is `mds-button current`, a link, in `mds-list marker="none"`, as it is | vittorio, option A of a rendered comparison with the avatar and the state of #1518: `current` is the mark Magma gives the view you are in (`app-shell`, the switcher of `mds-button`), and its Mistakes forbid one written by hand; `mds-tab direction="vertical"` takes only tab items (no group headings, no Add at its head), `mds-list-item` and `mds-tree-item` have no current state, and a new item would be a second way to mark the current one. The avatar, the swatch and the state at the end wait on #1518, widened. |
| 2026-11-27 | Narrow: the list folds into one button above the page, with no alternative open | vittorio, option A rendered beside B (the list and the item as two pages): one page at every width, one address, one h1; the choice of the studio on 2026-11-27 (`05-colori-stretta`). |
| 2026-11-27 | The threshold: 768 px of the element that holds the two, the container `3xl` | The studio (`src/tailwind.css` on #1403): the detail keeps the row of actions of its head (23.75rem) in its gutters (1.5rem each) beside the list (15rem), 41.75rem, rounded up to the next step of the scale. |
| 2026-11-27 | The address holds the item; each item is a link | vittorio; the rule of `record-detail` (`address-holds-record-and-tab`) and of `list-with-filters`: a reload, Back and a shared link find the same item. The studio keeps the family in memory and adopts it after this pattern. |
| 2026-11-27 | A change applies as it is made; an item saved with its own button is `record-detail` | vittorio; the studio, whose changes go to the draft of the preset; going from one item to the next, the point of the pattern, would otherwise ask to save at every step. |
| 2026-11-27 | The cases `beside` and `folded` as rendered | vittorio, "va bene" on their renders: Add at the head of the list, the groups as headings with the link to their page, the head of the item (its name, its menu, what it does, what it reaches closed), every field in line; the parts of the studio of 2026-11-27, with the words of a product. |
| 2026-11-27 | The focus stays on the item where the list is beside, and moves to the heading of the detail where it folds | The studio, which keeps it on the family; under the threshold the list closes under the focus, which needs a place. |
| 2026-11-27 | An empty list is the empty state of a first use in the place of the list and the detail | `empty-state`, `add-the-first`: one action that adds; a list with nothing in it has nothing to show beside. |
