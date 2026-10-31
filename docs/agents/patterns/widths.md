---
# A domain of Foundation, the design language (#1189): the format and the commands are in
# docs/PATTERNS.md, "A domain of Foundation". The check says what is still missing:
# nx run stencil:check.patterns (after nx run stencil:build).
id: widths
kind: foundation
title: Widths and alignment
layer: magma
status: decided
need: >-
  Give text, forms, pages and dialogs a width that keeps them readable at every size of window
  and of text, and line them up on one edge.
principle: >-
  A box is as wide as its role: text and forms at the reading measure, the page in the frame of
  the bar, a dialog the column of a form plus its inset; whatever is capped starts at the start
  edge.
keywords: [width, max-width, measure, line length, column, container, alignment, frame, gutter, half field, dialog width]
assumptions:
  - "The text is set at 16 px in Karla; the measures in ch grow with the text when the person enlarges it."
  - "The rhythm is at the standard density: the dialog adds the inset of its density."
components: [mds-text, mds-input-field, mds-modal, mds-banner]
related: [rhythm, actions, surfaces, page-header]
validated-on: []

variables:
  box:
    values: [text, form, short-field, page, collection, dialog]
    means: "The box to size: text to be read (paragraphs, list items, captions); the column of a form; a field whose answer is short (a street number, a postcode, a tax code, a date); the page; a table or a list; the window of a dialog."

cases:
  - id: reading
    box: text
    where: "the reading measure, `56ch` (65 to 80 characters on a full line in Karla): the reset caps `p`, `li` and `figcaption`, and mds-text caps itself with those tags, so whoever writes a page writes nothing; `max-w-text` elsewhere"
    serves: inclusive
    carried-by: [mds-text, --magma-width-reading, max-w-text]
  - id: form
    box: form
    where: "`max-w-form` on the form, the width of the text around it (`56ch`, 532 px at 16 px); its fields take the whole column, and its row of actions stands at the end of the column (`actions/place`)"
    serves: [inclusive, enabling]
    carried-by: [max-w-form, --magma-width-form]
  - id: field
    box: short-field
    where: "half the column of its form: the whole mds-input-field (label, control, message), not the control inside it; two short fields of one subject share a row, in reading order, and under a column of `28rem` the halves take the whole column. `field-group` on the group lays them out and reads the attribute `short` on its children, so the attribute works before mds-input-field takes it as a property (#1202)"
    use: ["mds-input-field"]
    serves: [enabling, intuitive]
    carried-by: [field-group]
    carried-by-planned: [mds-input-field short]
  - id: page
    box: [page, collection]
    where: "`page-frame` on the page: at most 1280 px, centred in the window, a gutter of `600` outside it, the column the bar gives its own content; everything inside starts at the start edge of the frame, and a table or a list takes the whole frame"
    serves: intuitive
    carried-by: [page-frame, --magma-width-page, --magma-width-page-gutter]
  - id: dialog
    box: dialog
    where: "at most the column of a form plus its inset, `--magma-width-dialog` (580 px at 16 px), one width for every dialog, confirmations included; on a phone the window takes the screen, as mds-modal does under 480 px. Until mds-modal gives it to its window (#1202) the window takes `w-full max-w-(--magma-width-dialog)`"
    use: ["mds-modal", "mds-banner slot=window"]
    serves: [enabling, intuitive]
    carried-by: [--magma-width-dialog]

gaps: []
not-applicable: []

always-true:
  - id: start-edge
    rule: "Capped content (text, forms) stands at the start edge of its frame, never centred inside it: the title, the text, the form and the table of a page start on the edge of the content of the bar."
    serves: intuitive
    checked-by: review
  - id: by-role
    rule: "A width is written by its role, never by its value: max-w-form, page-frame, short with field-group, the default of mds-modal; never container-sm, a max-w of a value of your own, or the threshold of the halves and the sum of the dialog copied by hand."
    serves: [intuitive, flexible]
    checked-by: review

open-choices: []

situations:
  - { situation: "The description of a service, paragraphs to read", case: reading }
  - { situation: "The form Report a problem under its introduction", case: form }
  - { situation: "The street number and the postcode of an address", case: field }
  - { situation: "The tax code and the date of birth of a person", case: field }
  - { situation: "A list of requests in a table of six columns", case: page, note: "the table takes the whole frame" }
  - { situation: "The page of a record in a window 1920 px wide", case: page, note: "the frame stops at 1280 px, the sides stay empty" }
  - { situation: "The dialog New contact, a form with two short fields", case: dialog }
  - { situation: "The confirmation of a deletion", case: dialog, note: "the same width as every dialog" }
---

# Widths and alignment

**A box is as wide as its role: text and forms at the reading measure, the page in the frame of the bar, a dialog the column of a form plus its inset; whatever is capped starts at the start edge.**

## When to use it

Every time a box could run as wide as its container: a paragraph, a form, a short field, the
content of a page, a table, the window of a dialog. The role picks the width; the edge is
always the start edge of the frame.

Not here: the space between the elements (the rhythm), and the width of a column of a table,
which the table sets from its content.

## What decides it

One question: what is the box? Text to be read; the column of a form; a field whose answer has
a known, short length; the page; a table or a list, which use the whole frame; the window of a
dialog. A form in a dialog is the same column as a form in a page, so it moves between the two
without changing shape.

## Cases

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

| Variable | Values | Means |
| --- | --- | --- |
| `box` | `text`, `form`, `short-field`, `page`, `collection`, `dialog` | The box to size: text to be read (paragraphs, list items, captions); the column of a form; a field whose answer is short (a street number, a postcode, a tax code, a date); the page; a table or a list; the window of a dialog. |

A case that leaves a variable out holds for any of its values.

| Case | When | Where | Use | Serves | Carried by |
| --- | --- | --- | --- | --- | --- |
| `reading` | box: text | the reading measure, `56ch` (65 to 80 characters on a full line in Karla): the reset caps `p`, `li` and `figcaption`, and mds-text caps itself with those tags, so whoever writes a page writes nothing; `max-w-text` elsewhere |  | inclusive | `mds-text`, `--magma-width-reading`, `max-w-text` |
| `form` | box: form | `max-w-form` on the form, the width of the text around it (`56ch`, 532 px at 16 px); its fields take the whole column, and its row of actions stands at the end of the column (`actions/place`) |  | inclusive, enabling | `max-w-form`, `--magma-width-form` |
| `field` | box: short-field | half the column of its form: the whole mds-input-field (label, control, message), not the control inside it; two short fields of one subject share a row, in reading order, and under a column of `28rem` the halves take the whole column. `field-group` on the group lays them out and reads the attribute `short` on its children, so the attribute works before mds-input-field takes it as a property (#1202) | `mds-input-field` | enabling, intuitive | `field-group`; planned: mds-input-field short |
| `page` | box: page or collection | `page-frame` on the page: at most 1280 px, centred in the window, a gutter of `600` outside it, the column the bar gives its own content; everything inside starts at the start edge of the frame, and a table or a list takes the whole frame |  | intuitive | `page-frame`, `--magma-width-page`, `--magma-width-page-gutter` |
| `dialog` | box: dialog | at most the column of a form plus its inset, `--magma-width-dialog` (580 px at 16 px), one width for every dialog, confirmations included; on a phone the window takes the screen, as mds-modal does under 480 px. Until mds-modal gives it to its window (#1202) the window takes `w-full max-w-(--magma-width-dialog)` | `mds-modal`, `mds-banner slot=window` | enabling, intuitive | `--magma-width-dialog` |

No gaps: every combination has a case or is not applicable.

## Parts

The widths at 16 px, and what an agent writes:

| Role | Width | Writes | Token |
| --- | --- | --- | --- |
| `reading` | `56ch`, 532 px | nothing (the reset, `mds-text`); `max-w-text` elsewhere | `--magma-width-reading` |
| `form` | `56ch`, the column of the text | `max-w-form` on the form | `--magma-width-form` |
| `field` | half the column; the whole column under `28rem` | `short` on `mds-input-field`, `field-group` on the group | none: `28rem` lives in the utility |
| `page` | at most 1280 px, gutter `600` outside | `page-frame` on the page | `--magma-width-page`, `--magma-width-page-gutter` |
| `dialog` | `56ch` plus twice the inset, 580 px | nothing once `mds-modal` carries it (#1202) | `--magma-width-dialog` |

Why `56ch`: the zero of Karla is 9.5 px at 16 px, wider than an average character, so a measure
in `ch` holds fewer characters than its number says. `56ch` is the one value whose full lines
stay inside 60 to 80 characters, under the 80 of WCAG 1.4.8.

Why `28rem`: a half has to hold the longest short answer `mds-input` knows, the tax code (16
characters, a control of 203 px); two halves and the gap need about 430 px.

A theme moves a role through its token: a theme with the page at 1024 px and the reading
measure at `65ch` moves the frame, the form and the dialog with them, and the markup stays.

## Always true

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

These hold in every product: a product layer cannot change them.

| Id | Rule | Serves | Carried by | Checked by |
| --- | --- | --- | --- | --- |
| `start-edge` | Capped content (text, forms) stands at the start edge of its frame, never centred inside it: the title, the text, the form and the table of a page start on the edge of the content of the bar. | intuitive | the guide | review |
| `by-role` | A width is written by its role, never by its value: max-w-form, page-frame, short with field-group, the default of mds-modal; never container-sm, a max-w of a value of your own, or the threshold of the halves and the sum of the dialog copied by hand. | intuitive, flexible | the guide | review |

## Situations

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

Situations every application has, each with its case: they give the examples, the texts and the keywords. The situations of a product's own domain go in its layer.

| Situation | Case |
| --- | --- |
| The description of a service, paragraphs to read | `reading` |
| The form Report a problem under its introduction | `form` |
| The street number and the postcode of an address | `field` |
| The tax code and the date of birth of a person | `field` |
| A list of requests in a table of six columns | `page`: the table takes the whole frame |
| The page of a record in a window 1920 px wide | `page`: the frame stops at 1280 px, the sides stay empty |
| The dialog New contact, a form with two short fields | `dialog` |
| The confirmation of a deletion | `dialog`: the same width as every dialog |

## Accessibility

- The measures are in `ch`, so text and forms grow with the text when the person enlarges it,
  and the lines stay inside the 80 characters of WCAG 1.4.8.
- The halves of short fields take the whole column under `28rem`, so a tax code is never cut on
  a phone, and the message of a half stays on one line.

## Magma gaps

- `mds-input-field` has no property `short` yet (#1202): `field-group` reads the attribute all
  the same, but the lint and the API do not know it.
- `mds-modal` does not size its window (#1202): until it does, the window takes
  `w-full max-w-(--magma-width-dialog)`, and the example of the guide of `mds-modal` drops
  `max-w-md w-full mx-400`.
- `mds-header-bar` caps its content at `--breakpoint-wide` with a padding of its own: it moves
  to `--magma-width-page` and `--magma-width-page-gutter`, so a theme that moves the page moves
  the bar with it (#1202).
- `mds-banner` keeps its close button in a column beside the whole body, so in a window the
  fields end before the row of actions; with the X in the title row (`actions/dismiss`) the body
  of the window is the column of a form exactly.
- In a narrow box (a dialog on a phone) `mds-banner` lets its content shrink to its text, so a
  short form ends up narrower than the window. Kept aside.
- The previews of the patterns size their forms with `container-sm` (384 px): they move to
  `max-w-form` (#1189, the previews redone on the rules).

## Decisions

| Date | Decision | Why |
| --- | --- | --- |
| 2026-10-30 | Text to be read stops at `max-w-text`, and `--spacing-text` goes from `75ch` to `56ch` (`reading`). | The Foundation already writes the rule, about 60 to 80 characters; `56ch` is the value that keeps it, measured on the build: 65 to 80 characters on a full line in Karla, average 72. Rejected: `75ch`, 86 to 104 characters, over the rule and over WCAG 1.4.8. One answer, shown live. https://github.com/magma-design-system/magma/issues/1189#issuecomment-6531852144 |
| 2026-10-30 | The column of a form is the reading measure; its fields take the whole column, its row the end of it (`form`). | The messages under the fields are text to read and stay on one line; text and form end on one edge; in `ch` the column grows with the text. Rejected: `container-sm` (384 px), the width the widgets used without deciding it, where 2 of 3 messages wrapped. Chosen live. https://github.com/magma-design-system/magma/issues/1189#issuecomment-6532026182 |
| 2026-10-30 | A short field is half the column, the whole `mds-input-field`; two of one subject share a row; under `28rem` the halves take the whole column (`field`). | Two widths only, so the form keeps one grid; whoever writes chooses "short" and counts no characters; the form is shorter (654 px against 837). Rejected: the control as wide as its answer (GOV.UK), one edge per field; every control on the whole column; a short field beside a free one, whose error took 5 lines. The proposal of the maintainer, chosen live over the first recommendation. https://github.com/magma-design-system/magma/issues/1189#issuecomment-6532384527 |
| 2026-10-30 | A page stands in a frame of at most 1280 px, centred, with a gutter of `600`, the column of `mds-header-bar`; everything starts at its start edge, and tables and lists take the whole frame (`page`, `start-edge`). | The bar carries it already: the name of the application, the title and the table start on one edge at every width. Rejected: page and bar at the full width of the window, rows across the whole screen and text against the left edge. Chosen live at 1024, 1440 and 1920 px. https://github.com/magma-design-system/magma/issues/1189#issuecomment-6532525783 |
| 2026-10-30 | The window of a dialog is the column of a form plus its inset, 580 px, one width for every dialog (`dialog`). | A form moves between a page and a dialog without changing shape: the halves stay side by side, the messages on one line. Rejected: `container-md` (448 px), whose body falls under `28rem`, so a form takes its phone shape. Chosen live. https://github.com/magma-design-system/magma/issues/1189#issuecomment-6532648084 |
| 2026-10-30 | The widths are carried by roles: `--magma-width-*`, `max-w-form`, `page-frame`, `short` with `field-group`, the default of `mds-modal` (`by-role`). | The role reads in the code, a check can hold it, a theme moves it in one place, and the threshold and the sum of the dialog live in one place instead of in every product (the previews copied a width and got 384 px). Rejected: the values by hand, the same render with nothing a check can tell apart; the pair as a wrapper, where "short" is not on the field. https://github.com/magma-design-system/magma/issues/1189#issuecomment-6533809808 |
| 2026-10-31 | The file of the domain; tables and lists are a value of their own in the case `page`. | The issue of the five domains (#1197); `widths/page` names tables and lists among its answers. |
