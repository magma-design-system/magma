---
id: rhythm
kind: foundation
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
    values: [inline, title-content, label-control, between-fields, between-groups, between-sections, inset, between-containers]
    means: "How the two elements relate: side by side in one row, a title and what it names, a label and its control, two fields of a group, two groups of a section, two sections of the page, the content and the edge of its container, two containers with a boundary of their own."

cases:
  - id: inline
    relation: inline
    where: "`gap-300` between elements side by side in one row: the actions of a row, a field and the button beside it"
    serves: intuitive
    carried-by-planned: [--magma-rhythm-inline, gap-inline]
  - id: title-content
    relation: title-content
    where: "`gap-300` between a title and the content it names"
    serves: intuitive
    carried-by-planned: [--magma-rhythm-title-content, gap-title-content]
  - id: label-control
    relation: label-control
    where: "`gap-300` between the label of a field, its control and its message"
    serves: intuitive
    carried-by: [mds-input-field]
    carried-by-planned: [--magma-rhythm-label-control, gap-label-control]
  - id: between-fields
    relation: between-fields
    where: "`gap-600` between two fields of a form, or two rows of data"
    serves: intuitive
    carried-by-planned: [--magma-rhythm-between-fields, gap-between-fields]
  - id: between-groups
    relation: between-groups
    where: "`gap-1000` between two groups of fields of one form (the fieldsets of personal data and of residence)"
    serves: intuitive
    carried-by-planned: [--magma-rhythm-between-groups, gap-between-groups]
  - id: between-sections
    relation: between-sections
    where: "`gap-1600` between two sections of a page, each with its title"
    serves: intuitive
    carried-by-planned: [--magma-rhythm-between-sections, gap-between-sections]
  - id: inset
    relation: inset
    where: "`p-600` inside a container of a part (a card, a banner, a note, a dropdown, the window of a dialog), shared by its regions"
    serves: intuitive
    carried-by: [mds-banner, mds-note, mds-dropdown]
    carried-by-planned: [--magma-rhythm-inset, p-inset]
  - id: between-containers
    relation: between-containers
    where: "`gap-400` between containers with a boundary of their own (the cards of a section, of a grid, of a list of cards)"
    serves: intuitive
    carried-by-planned: [--magma-rhythm-between-containers, gap-between-containers]

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
it names; a label and its control; two fields of one group; two groups of one form; two sections
of the page; the content and the edge of the container around it; two containers that have a
boundary of their own (a border, a shadow, a surface).

## Cases

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

| Variable | Values | Means |
| --- | --- | --- |
| `relation` | `inline`, `title-content`, `label-control`, `between-fields`, `between-groups`, `between-sections`, `inset`, `between-containers` | How the two elements relate: side by side in one row, a title and what it names, a label and its control, two fields of a group, two groups of a section, two sections of the page, the content and the edge of its container, two containers with a boundary of their own. |

A case that leaves a variable out holds for any of its values.

| Case | When | Where | Use | Serves | Carried by |
| --- | --- | --- | --- | --- | --- |
| `inline` | relation: inline | `gap-300` between elements side by side in one row: the actions of a row, a field and the button beside it |  | intuitive | planned: --magma-rhythm-inline, gap-inline |
| `title-content` | relation: title-content | `gap-300` between a title and the content it names |  | intuitive | planned: --magma-rhythm-title-content, gap-title-content |
| `label-control` | relation: label-control | `gap-300` between the label of a field, its control and its message |  | intuitive | `mds-input-field`; planned: --magma-rhythm-label-control, gap-label-control |
| `between-fields` | relation: between-fields | `gap-600` between two fields of a form, or two rows of data |  | intuitive | planned: --magma-rhythm-between-fields, gap-between-fields |
| `between-groups` | relation: between-groups | `gap-1000` between two groups of fields of one form (the fieldsets of personal data and of residence) |  | intuitive | planned: --magma-rhythm-between-groups, gap-between-groups |
| `between-sections` | relation: between-sections | `gap-1600` between two sections of a page, each with its title |  | intuitive | planned: --magma-rhythm-between-sections, gap-between-sections |
| `inset` | relation: inset | `p-600` inside a container of a part (a card, a banner, a note, a dropdown, the window of a dialog), shared by its regions |  | intuitive | `mds-banner`, `mds-note`, `mds-dropdown`; planned: --magma-rhythm-inset, p-inset |
| `between-containers` | relation: between-containers | `gap-400` between containers with a boundary of their own (the cards of a section, of a grid, of a list of cards) |  | intuitive | planned: --magma-rhythm-between-containers, gap-between-containers |

No gaps: every combination has a case or is not applicable.

## Always true

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

These hold in every product: a product layer cannot change them.

| Id | Rule | Serves | Carried by | Checked by |
| --- | --- | --- | --- | --- |
| `step-ratio` | Between relations with no boundary, each step is at least 1.5 times the step it contains: an element stands nearer to what it belongs to than to its neighbour. | intuitive | the guide | review |
| `shared-inset` | The regions of a container share its inset: the title, the content and the actions of a card stand inside one p-600, their paddings never add up. | intuitive | the guide | review |
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
| The personal data and the residence of a long form, each in its fieldset | `between-groups` |
| The sections of the page of a record | `between-sections` |
| The header of a page and the content under it | `between-sections`: the header (the block page-header) is the first section of the page |
| The content of a card, a banner or the window of a dialog | `inset` |
| The cards of a list of results | `between-containers` |

## Magma gaps

- The role tokens and their utilities are planned (decision 4 of the rhythm on #1189): until they
  ship, write the step of the case (`gap-600`), never a Tailwind t-shirt name (`gap-lg`) nor a
  value of your own.
- `mds-card` pads each of its regions with `p-400`, so its title stands 800 from its content,
  farther than two fields: it moves to one `p-600` shared by its regions (`inset`,
  `shared-inset`).
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
