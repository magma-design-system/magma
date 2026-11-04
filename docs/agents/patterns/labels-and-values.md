---
# A Magma building block: the format and the commands are in docs/PATTERNS.md, "A building block".
id: labels-and-values
kind: block
title: Labels and values
group: data
layer: magma
status: decided
need: >-
  The person reads the data of an item, each value under the name of what it is.
principle: Each value stands under its label, row by row, in two columns where there is room.
keywords: [labels and values, data, details, description list, dl, key value, key-value pairs, fields of a record, read-only data, summary of the data, properties]
not-for:
  - need: changing the data (a form, its fields and their errors)
    use: form-and-validation
  - need: many items, each with the same properties (a table)
    use: item-list
high-stakes: false
components: [mds-text]
used-by: [record-detail, confirm-action]
related: [record-detail, confirm-action, item-list, form-and-validation]
validated-on: []

variables:
  place: { values: [section, inside], means: "section: the data is a section of a page, with a title of its own; inside: the data is inside a container that names it already (the window of a dialog, a card, a form above its row of actions)" }

regions:
  - { id: title, when: { place: section }, what: "the title of the section, which names the group of data (\"Dati anagrafici\", \"Recapiti\")", use: ["mds-text typography=section tag=h2"] }
  - { id: pairs, required: true, what: "the list of the data: for each one its label, then its value, in the order the person reads them; a long value takes the whole row; a value not given says so", use: ["mds-text typography=label tag=dt", "mds-text tag=dd"] }

always-true:
  - id: label-above-value
    rule: "Each value stands under its label: a dl with one div for each pair, the label (dt) in the muted foreground, the value (dd) in the default one; never a table of two columns, never a form."
    checked-by: review
  - id: columns-by-room
    rule: "Two columns where the list has room, one under it, at the threshold of the halves of a form (28rem, field-group): the data and the fields that change it go to one column together; never a number of columns fixed on the page."
    checked-by: review
  - id: long-value-whole-row
    rule: "A long value (a text, an address on several lines, a list) takes the whole row, at every width."
    checked-by: review
  - id: missing-says-so
    rule: "A value not given says so, \"Non indicato\", in the muted foreground; never an empty space or a dash."
    checked-by: review
  - id: read-not-disabled
    rule: "Data the person cannot change here is read as labels and values, never shown as fields disabled or read-only; changing it is a form of its own (record-detail, edit-data)."
    checked-by: review
  - id: section
    from: titles
  - id: title-content
    from: rhythm
  - id: label-control
    from: rhythm
  - id: between-fields
    from: rhythm

open-choices: []

situations:
  - { id: data-of-a-contact, situation: "The personal data of a contact, a section of its page", place: section }
  - { id: what-is-sent, situation: "What a reminder sends and to whom, in the dialog that asks before sending it", place: inside }
  - { id: payment-before-paying, situation: "The data of a payment, above the button that pays it", place: inside }
---

# Labels and values

**Each value stands under its label, row by row, in two columns where there is room.**

## When to use it

Wherever a page or a container shows the data of one item to read: the personal data of a
contact, what a message sends and to whom before it goes, the amount of a payment above the
button that pays it. It came out of the round of the building blocks (2026-11-03): the list of
labels and values comes back in `record-detail` (the data of the record, section by section)
and in `confirm-action` (`ask-before-sending`: the recipient and the text), and the previews of
`error-recovery` and `loading` write it too. Not for changing the data (a form,
`form-and-validation`), and not for many items with the same properties (a table, `item-list`).

## What decides it

One question: whether the data is a section of the page, with a title of its own, or stands
inside a container that names it already.

## Regions

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

| Variable | Values | Means |
| --- | --- | --- |
| `place` | `section`, `inside` | section: the data is a section of a page, with a title of its own; inside: the data is inside a container that names it already (the window of a dialog, a card, a form above its row of actions) |

A region shows where its When holds, in this order: a required one always, the others when there is something to put in them.

| Region | When | Required | What | Use |
| --- | --- | --- | --- | --- |
| `title` | place: section |  | the title of the section, which names the group of data ("Dati anagrafici", "Recapiti") | `mds-text typography=section tag=h2` |
| `pairs` | any | yes | the list of the data: for each one its label, then its value, in the order the person reads them; a long value takes the whole row; a value not given says so | `mds-text typography=label tag=dt`, `mds-text tag=dd` |

## Layout

- The list is a `dl` with one `div` for each pair; in each pair the label, then the value,
  `gap-label-control` (300) between them (`rhythm/label-control`), as the label and the control
  of a field.
- The pairs are rows of data: `gap-between-fields` (600) between them (`rhythm/between-fields`),
  in both directions.
- Two columns from 28rem of the list, one under it: the threshold of `field-group`, so the data
  and the form that changes it break at the same width; the pairs fill the rows in reading
  order, each starting at the top of its row (`items-start`, as `field-group`). A long value
  spans the row (`col-span-full`, never `col-span-2`, which adds a track on one column).
- Until Magma carries the columns (Magma gaps): `@md:grid-cols-2` on the `dl`, measured by a
  container as wide as the list: a `section` is one; any other parent takes `@container` (a
  `form`, the `div` that holds the tabs of a record and their panels); inside `mds-banner` a
  `div class="@container"` wraps the list (the banner measures its close button too).
- In a section of a page the list stands in the column of a form (`max-w-form`): the shape it
  has in a dialog and in the form that changes it.
- With a title (`place: section`), the title and the list are `gap-title-content` (300) apart
  (`rhythm/title-content`), and the section stands from the next one as the sections of a page
  do (`rhythm/between-sections`).
- Inside a container, the list takes its width and its inset; in a form, it stands above the
  fields or the row of actions, `gap-content-actions` from the row (`rhythm/content-actions`).

## Always true

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

These hold in every product: a product layer cannot change them.

| Id | Rule | Checked by |
| --- | --- | --- |
| `label-above-value` | Each value stands under its label: a dl with one div for each pair, the label (dt) in the muted foreground, the value (dd) in the default one; never a table of two columns, never a form. | review |
| `columns-by-room` | Two columns where the list has room, one under it, at the threshold of the halves of a form (28rem, field-group): the data and the fields that change it go to one column together; never a number of columns fixed on the page. | review |
| `long-value-whole-row` | A long value (a text, an address on several lines, a list) takes the whole row, at every width. | review |
| `missing-says-so` | A value not given says so, "Non indicato", in the muted foreground; never an empty space or a dash. | review |
| `read-not-disabled` | Data the person cannot change here is read as labels and values, never shown as fields disabled or read-only; changing it is a form of its own (record-detail, edit-data). | review |
| `section` | the style `h5` (20px), the tag of its place in the outline (`h2` under the page) (from `titles`) |  |
| `title-content` | `gap-title-content` (300) between a title and the content it names (from `rhythm`) |  |
| `label-control` | `gap-label-control` (300) between the label of a field, its control and its message (from `rhythm`) |  |
| `between-fields` | `gap-between-fields` (600) between two fields of a form, or two rows of data (from `rhythm`) |  |

## Situations

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

Situations every application has, each with the regions it shows: they give the examples, the texts and the keywords. The situations of a product's own domain go in its layer.

| Id | Situation | Regions |
| --- | --- | --- |
| `data-of-a-contact` | The personal data of a contact, a section of its page | `title`, `pairs` |
| `what-is-sent` | What a reminder sends and to whom, in the dialog that asks before sending it | `pairs` |
| `payment-before-paying` | The data of a payment, above the button that pays it | `pairs` |

## Accessibility

- A `dl` with `dt` and `dd` (`mds-text tag="dt"`, `tag="dd"`): a screen reader announces a
  list of terms and reads each label with its value.
- The title of a section is a heading of the outline of the page (`h2` under the `h1` of the
  page, `titles/section`).
- A value that is a link names where it goes; a status is an `mds-badge` with its label.

## Content

- A label names the datum in a few words, with a capital and no colon: "Codice fiscale",
  "Nato il", "Destinatario".
- A value is written as the person reads it, not as the system stores it: "1 gennaio 1980",
  "16,00 euro", never `1980-01-01` or `16.0`.
- A value not given: "Non indicato".

## Magma gaps

- No component nor carrier for labels and values: a `dl` of `mds-text`, laid out with Tailwind.
  `@md` copies the threshold of `field-group` by its value, which `widths/by-role` forbids, and
  in px (448): with a root font other than 16 px the two part (measured at 17 px: a list of
  449 px, one column in `field-group`, two with `@md`). A class with the tracks of
  `field-group`, whose children take one track unless they span the row, would carry them; or
  a container size in rem with a variant of its own, as `--magma-container-actions` does.
- The base styles of Magma keep the margins the browser gives `dl` and `dd` (the indent of
  `dd`): `m-0` on both.

## Decisions

| Date | Decision | Why |
| --- | --- | --- |
| 2026-11-03 | Labels and values are a block: they come back in `record-detail` and `confirm-action` | The round of the building blocks, from the previews of the patterns; `record-detail` listed the missing component among its Magma gaps. |
| 2026-11-03 | Two columns from the threshold of `field-group`, one under it | The previews fixed two columns on the page, which squeeze a long value on a phone; the threshold of the halves of a form keeps the data and its form together. |
| 2026-11-03 | In a section of a page the list stands in the column of a form, `max-w-form` | The shape it has in a dialog and in the form that changes it; across the whole section at 1024 px its columns were 476 px for values of a few words. The maintainer's choice A in the review of round 3. |
