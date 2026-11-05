---
id: rhythm
kind: design-language
title: Rhythm
layer: magma
status: decided
need: >-
  Space two elements of a composition by how they relate, so that each one stands nearer to
  what it belongs to than to its neighbour.
principle: >-
  The space between two elements says how they relate: one step of a ladder for each relation,
  never a value of your own.
keywords: [rhythm, spacing, space, gap, padding, margin, proximity, distance, inset, ladder]
assumptions:
  - "The values are those of the standard density: a denser or a roomier screen scales every step by one factor (the domain density)."
  - "The space inside a control (the padding of a button, of an input) is the component's own, not a relation."
components: [mds-input-field, mds-banner, mds-note, mds-dropdown, mds-card]
related: []
validated-on: []

variables:
  relation:
    values: [inline, title-content, label-control, between-fields, content-actions, between-groups, between-sections, inset, between-containers]
    means: "How the two elements relate: side by side in one row, a title and what it names, a label and its control, two fields of a group, the content of a container and the row of actions that closes it, two groups of a section, two sections of the page, the content and the edge of its container, two containers with a boundary of their own."

cases:
  - id: inline
    relation: inline
    where: "`gap-inline` (300) between elements side by side in one row: the actions of a row, a field and the button beside it"
    serves: intuitive
    carried-by: [--magma-rhythm-inline, gap-inline]
  - id: title-content
    relation: title-content
    where: "`gap-title-content` (300) between a title and the content it names"
    serves: intuitive
    carried-by: [--magma-rhythm-title-content, gap-title-content]
  - id: label-control
    relation: label-control
    where: "`gap-label-control` (300) between the label of a field, its control and its message"
    serves: intuitive
    carried-by: [mds-input-field, --magma-rhythm-label-control, gap-label-control]
  - id: between-fields
    relation: between-fields
    where: "`gap-between-fields` (600) between two fields of a form, or two rows of data"
    serves: intuitive
    carried-by: [--magma-rhythm-between-fields, gap-between-fields]
  - id: content-actions
    relation: content-actions
    where: "`gap-content-actions` (600) between the content of a container and the row of actions that closes it: the footer of a card, the row of a form, the actions of the window of a dialog"
    serves: intuitive
    carried-by: [mds-card, --magma-rhythm-content-actions, gap-content-actions]
  - id: between-groups
    relation: between-groups
    where: "`gap-between-groups` (1000) between two groups of fields of one form (the fieldsets of personal data and of residence)"
    serves: intuitive
    carried-by: [--magma-rhythm-between-groups, gap-between-groups]
  - id: between-sections
    relation: between-sections
    where: "`gap-between-sections` (1600) between two sections of a page, each with its title"
    serves: intuitive
    carried-by: [--magma-rhythm-between-sections, gap-between-sections]
  - id: inset
    relation: inset
    where: "`p-inset` (600) inside a container of a part (a card, a banner, a note, a dropdown, the window of a dialog), shared by its regions"
    serves: intuitive
    carried-by: [mds-card, mds-banner, mds-note, mds-dropdown, --magma-rhythm-inset, p-inset]
  - id: between-containers
    relation: between-containers
    where: "`gap-between-containers` (400) between containers with a boundary of their own (the cards of a section, of a grid, of a list of cards)"
    serves: intuitive
    carried-by: [--magma-rhythm-between-containers, gap-between-containers]

gaps: []
not-applicable: []

always-true:
  - id: step-ratio
    rule: "Between relations with no boundary, each step is at least 1.5 times the step it contains: an element stands nearer to what it belongs to than to its neighbour."
    serves: intuitive
    checked-by: review
  - id: shared-inset
    rule: "The regions of a container share its inset: the title, the content and the actions of a card stand inside one p-600, their paddings never add up."
    serves: intuitive
    carried-by: [mds-card, mds-banner]
    checked-by: review
  - id: media-bleed
    rule: "The media of a container (the image of a card) reaches the edges of the container it touches and stands from the other regions as they stand from each other: the inset keeps text away from the edge, and an image has no text to keep away."
    serves: intuitive
    carried-by: [mds-card]
    checked-by: review
  - id: ladder-only
    rule: "Every space between the elements of a composition is the step of its relation: 300, 400 between containers only, 600, 1000, 1600 at the standard density. No other value, no Tailwind t-shirt name (gap-lg)."
    serves: [intuitive, flexible]
    checked-by: review
    note: "check.patterns will hold the previews to it (#1189, the previews redone on the rules)"

open-choices: []

situations:
  - { situation: "Annulla and Salva side by side at the end of a form", case: inline }
  - { situation: "The title of a card and its text", case: title-content }
  - { situation: "The label of a field above its input", case: label-control }
  - { situation: "The fields of a form in a dialog", case: between-fields }
  - { situation: "Apri under the data of a card in a list of requests", case: content-actions }
  - { situation: "The personal data and the residence of a long form, each in its fieldset", case: between-groups }
  - { situation: "The sections of the page of a record", case: between-sections }
  - { situation: "The header of a page and the content under it", case: between-sections, note: "the header (the block page-header) is the first section of the page" }
  - { situation: "The content of a card, a banner or the window of a dialog", case: inset }
  - { situation: "The cards of a list of results", case: between-containers }
---

# Rhythm

**The space between two elements says how they relate: one step of a ladder for each relation, never a value of your own.**

## When to use it

Every time two elements stand together in a composition: in a page, a form, a dialog, a card,
a banner. The relation between them picks the step; the step is never chosen by eye.

Not here: the space inside a control (the padding of a button, the height of an input), which
the component draws and the density scales; the width of a column or of a dialog, which is the
domain of the widths.

## What decides it

One question: how do the two elements relate? Side by side in one row; a title and the content
it names; a label and its control; two fields of one group; the content of a container and the
row of actions that closes it; two groups of one form; two sections of the page; the content and
the edge of the container around it; two containers that have a boundary of their own (a border,
a shadow, a surface). An image is not text: it reaches the edges of its container instead of
keeping the inset from them (`media-bleed`).

## Cases

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

| Variable | Values | Means |
| --- | --- | --- |
| `relation` | `inline`, `title-content`, `label-control`, `between-fields`, `content-actions`, `between-groups`, `between-sections`, `inset`, `between-containers` | How the two elements relate: side by side in one row, a title and what it names, a label and its control, two fields of a group, the content of a container and the row of actions that closes it, two groups of a section, two sections of the page, the content and the edge of its container, two containers with a boundary of their own. |

A case that leaves a variable out holds for any of its values.

| Case | When | Where | Use | Serves | Carried by |
| --- | --- | --- | --- | --- | --- |
| `inline` | relation: inline | `gap-inline` (300) between elements side by side in one row: the actions of a row, a field and the button beside it |  | intuitive | `--magma-rhythm-inline`, `gap-inline` |
| `title-content` | relation: title-content | `gap-title-content` (300) between a title and the content it names |  | intuitive | `--magma-rhythm-title-content`, `gap-title-content` |
| `label-control` | relation: label-control | `gap-label-control` (300) between the label of a field, its control and its message |  | intuitive | `mds-input-field`, `--magma-rhythm-label-control`, `gap-label-control` |
| `between-fields` | relation: between-fields | `gap-between-fields` (600) between two fields of a form, or two rows of data |  | intuitive | `--magma-rhythm-between-fields`, `gap-between-fields` |
| `content-actions` | relation: content-actions | `gap-content-actions` (600) between the content of a container and the row of actions that closes it: the footer of a card, the row of a form, the actions of the window of a dialog |  | intuitive | `mds-card`, `--magma-rhythm-content-actions`, `gap-content-actions` |
| `between-groups` | relation: between-groups | `gap-between-groups` (1000) between two groups of fields of one form (the fieldsets of personal data and of residence) |  | intuitive | `--magma-rhythm-between-groups`, `gap-between-groups` |
| `between-sections` | relation: between-sections | `gap-between-sections` (1600) between two sections of a page, each with its title |  | intuitive | `--magma-rhythm-between-sections`, `gap-between-sections` |
| `inset` | relation: inset | `p-inset` (600) inside a container of a part (a card, a banner, a note, a dropdown, the window of a dialog), shared by its regions |  | intuitive | `mds-card`, `mds-banner`, `mds-note`, `mds-dropdown`, `--magma-rhythm-inset`, `p-inset` |
| `between-containers` | relation: between-containers | `gap-between-containers` (400) between containers with a boundary of their own (the cards of a section, of a grid, of a list of cards) |  | intuitive | `--magma-rhythm-between-containers`, `gap-between-containers` |

No gaps: every combination has a case or is not applicable.

## Always true

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

These hold in every product: a product layer cannot change them.

| Id | Rule | Serves | Carried by | Checked by |
| --- | --- | --- | --- | --- |
| `step-ratio` | Between relations with no boundary, each step is at least 1.5 times the step it contains: an element stands nearer to what it belongs to than to its neighbour. | intuitive | the guide | review |
| `shared-inset` | The regions of a container share its inset: the title, the content and the actions of a card stand inside one p-600, their paddings never add up. | intuitive | `mds-card`, `mds-banner` | review |
| `media-bleed` | The media of a container (the image of a card) reaches the edges of the container it touches and stands from the other regions as they stand from each other: the inset keeps text away from the edge, and an image has no text to keep away. | intuitive | `mds-card` | review |
| `ladder-only` | Every space between the elements of a composition is the step of its relation: 300, 400 between containers only, 600, 1000, 1600 at the standard density. No other value, no Tailwind t-shirt name (gap-lg). | intuitive, flexible | the guide | review; check.patterns will hold the previews to it (#1189, the previews redone on the rules) |

## Situations

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

Situations every application has, each with its case: they give the examples, the texts and the keywords. The situations of a product's own domain go in its layer.

| Situation | Case |
| --- | --- |
| Annulla and Salva side by side at the end of a form | `inline` |
| The title of a card and its text | `title-content` |
| The label of a field above its input | `label-control` |
| The fields of a form in a dialog | `between-fields` |
| Apri under the data of a card in a list of requests | `content-actions` |
| The personal data and the residence of a long form, each in its fieldset | `between-groups` |
| The sections of the page of a record | `between-sections` |
| The header of a page and the content under it | `between-sections`: the header (the block page-header) is the first section of the page |
| The content of a card, a banner or the window of a dialog | `inset` |
| The cards of a list of results | `between-containers` |

## Magma gaps

- `mds-banner` draws its 600 (the inset, the space between its body and its actions) with
  `--spacing(600)`, not with the roles: a density theme does not move it (`inset`,
  `content-actions`).
- The previews of the patterns use other steps (300 between fields, 200 between actions): they
  are redone on these rules (#1189, "The previews and the Layout of the blocks redone on the
  rules").

## Decisions

| Date | Decision | Why |
| --- | --- | --- |
| 2026-10-29 | The space by relation, in steps of `--spacing`: in a row 200, a title and its content 300, between fields 600, between groups 1000, between sections 1600; each step at least 1.5 times the one it contains (`step-ratio`). | An element stands nearer to what it belongs to than to its neighbour; the ladder starts from the 300 that `mds-input-field` puts between a label and its control. Rejected: the scale of the previews (200, 200, 300, 600, 600), with fields as near as a label to its control. Comment on #1189: https://github.com/magma-design-system/magma/issues/1189#issuecomment-6510058376 |
| 2026-10-30 | The inset of a container of a part is `p-600`, shared by its regions (`inset`, `shared-inset`). | Banner, note and dropdown already pad 600; a card that pads 400 in each region puts its title 800 from its content, farther than two fields. Rejected: the card of today; `p-400` shared. https://github.com/magma-design-system/magma/issues/1189#issuecomment-6510576013 |
| 2026-10-30 | In a row 300, not 200: the ladder has four steps, 300, 600, 1000, 1600 (`inline`). | The 200 between the actions of a row came from the previews, and no rule had chosen it; next to an inset of 600 and fields at 600 it was too tight. Rejected: 200; 400, the cap of the 1.5 rule. https://github.com/magma-design-system/magma/issues/1189#issuecomment-6510635910 |
| 2026-10-30 | The ids: a domain of `kind: foundation`, the file `rhythm`, its relations the cases and its rules the always-true entries, cited `{ id, from: rhythm }`, in short `rhythm/<id>`. | An id is a contract in the format of the patterns, and every decision names the id it decides. https://github.com/magma-design-system/magma/issues/1189#issuecomment-6516863055 |
| 2026-10-30 | Between containers with a boundary `gap-400`; the 400 joins the ladder for this relation only, and `step-ratio` holds for the relations with no boundary (`between-containers`, `ladder-only`). | A boundary (a border, a shadow, a surface) separates by itself. Chosen live against 600 (as the inset) and 1000 (as between groups). https://github.com/magma-design-system/magma/issues/1189#issuecomment-6517707506 |
| 2026-10-30 | The carriers: a role token per relation, `--magma-rhythm-<id>`, bridged to Tailwind as `--spacing-<id>` (`gap-<id>`, `p-<id>`); the components paint with the tokens, and a density redefines them. | An agent writes the relation, never its step, and a density or a theme moves every space from one place. Rejected: utilities with a fixed property (`rhythm-inset`); numeric steps with a guide and a lint rule. https://github.com/magma-design-system/magma/issues/1189#issuecomment-6518548217 |
| 2026-10-31 | The principle each rule serves (`serves`), written with the format (#1196): intuitive for every relation and rule, since the relation reads from the space without being learned, the same in every product; `ladder-only` flexible too, one ladder a density or a theme moves at once. | Foundation asks every decision to say the principle it serves (the Principles page of the docs site). Proposed with the format, to confirm in its review. |
| 2026-10-31 | The header of a page and the content under it are two sections: `between-sections`, `gap-1600`; the header is the first section of the page. | The header names the whole page, so at the step of the sections it belongs to none of them (`step-ratio`); no new relation. Rejected: `gap-1000`, which puts the header nearer to the first section than that one to the next. Chosen live on a record with sections and on a list (#1210, `page-header`). |
| 2026-11-02 | The media of a card reaches the edges of the card it touches and stands 300 from the other regions (`media-bleed`); the sides follow the layout the card picks with its container query, never a class or the order of the slots. | The inset keeps text away from the edge, and an image has no text to protect; the title stays 300 from what it names (`step-ratio`); the cards with an image of today stay edge to edge. Rejected: the media inside the inset with a radius of its own (48 px narrower, two nested radii); the media at the edges with the text 600 from it, as from an edge, which puts the title of a card 600 from the image it names. Chosen live on a set of cards at two widths (#1201). https://github.com/magma-design-system/magma/issues/1189#issuecomment-6571508146 |
| 2026-11-02 | The row of actions that closes a container stands 600 from its content, a relation of its own (`content-actions`), as the row of a form and the actions of the window of a dialog. | The actions act on the whole container, not on its last line: at 300 the footer of a card stood nearer to the last row of data than the rows to each other (`step-ratio`). Rejected: one gap of 300 between every region of a card. Chosen live on cards with rows of data and with an image (#1201). https://github.com/magma-design-system/magma/issues/1189#issuecomment-6571508481 |
| 2026-11-05 | The kind of the domain is `design-language`, no longer `foundation`. | Named after what the file is, a domain of the design language, not after the item of the docs site that holds it: Foundation there is the umbrella of the decisions Magma stands on (principles, accessibility, color, typography, illustration, content), and the design language is one group of it. The design language, the building blocks and the patterns together are Behavior, as the header of the studio names them (#1253). |
