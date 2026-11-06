---
# A domain of the design language (#1189): the format and the commands are in
# docs/PATTERNS.md, "A domain of the design language". The check says what is still missing:
# nx run stencil:check.patterns (after nx run stencil:build).
id: titles
kind: design-language
title: Titles
layer: magma
status: decided
need: >-
  Tell at a glance what a title names, the whole page, a section of it, a dialog, a part or a
  group of fields, and keep the outline of the page true for whoever navigates it by headings.
principle: >-
  A title takes the style of its role, and its tag from the outline of the page: the two never
  follow each other.
keywords: [title, heading, headline, h1, outline, typography, page title, section title, card title, legend, fieldset]
assumptions:
  - "A page of an application: a page to read (an article, a commentary) is a case of its own, not looked at."
  - "The sizes are those of the default theme: a theme moves a role through its tokens, and the markup stays as it is."
components: [mds-text, mds-modal, mds-banner, mds-accordion-item, mds-push-notification-item, mds-file]
related: [rhythm, surfaces, page-header]
validated-on: []

variables:
  role:
    values: [page, section, dialog, part, group]
    means: "What the title names: the whole page, a section of the page, a dialog, a part (a card, a panel, an item of an accordion, a container a component draws), a group of fields of a form."

cases:
  - id: page
    role: page
    where: "the style `h3` (30px), the tag `h1`"
    use: ["mds-text typography=page tag=h1"]
    serves: intuitive
    carried-by: [text-title-page, --text-size-title-page, mds-text typography=page]
  - id: section
    role: section
    where: "the style `h5` (20px), the tag of its place in the outline (`h2` under the page)"
    use: ["mds-text typography=section tag=h2"]
    serves: intuitive
    carried-by: [text-title-section, --text-size-title-section, mds-text typography=section]
  - id: dialog
    role: dialog
    where: "the style `h5`, the headline of the window; the dialog takes its name from aria-label on mds-modal, since the headline is hidden from screen readers. mds-banner draws its headline in h6 today (#1192)"
    use: ["mds-modal aria-label", "mds-banner slot=window headline"]
    serves: intuitive
    carried-by: [text-title-dialog, --text-size-title-dialog, mds-text typography=dialog]
  - id: part
    role: part
    where: "the style `h6` (16px, weight 700), the tag of its place (`h2` under the page, `h3` in a section); the components that draw a part give it already (the headline of mds-banner, mds-push-notification-item, mds-file); an item of an accordion is a part, `h6` by default"
    use: ["mds-text typography=part", "mds-accordion-item"]
    serves: intuitive
    carried-by: [mds-banner, mds-push-notification-item, mds-file, text-title-part, --text-size-title-part, mds-text typography=part]
  - id: group
    role: group
    where: "a `fieldset` with no border and no inset of its own, its title the `legend` in the style `h6`: not a heading of the page; `field-group` on the fieldset draws it, the legend `gap-title-content` (300) from its first field"
    serves: [inclusive, intuitive]
    carried-by: [field-group, text-title-group, --text-size-title-group]

gaps: []
not-applicable: []

always-true:
  - id: one-h1
    rule: The title of the page is its h1, and the only one.
    serves: inclusive
    checked-by: review
  - id: tag-is-structure
    rule: "The tag follows the outline of the page and never skips a level; the style follows the role of the title. With mds-text the tag is written whenever the style is not the level (typography=\"h3\" tag=\"h1\"): left out, the tag follows the style."
    serves: inclusive
    checked-by: review
  - id: by-role
    rule: "A title takes the style of its role, never a level chosen by eye or to get a smaller size: page h3, section and dialog h5, part and group h6 at the default theme; the styles h1, h2 and h4 have no role in a page of an application."
    serves: [intuitive, flexible]
    checked-by: review

open-choices: []

situations:
  - { situation: "The title of a list of requests", case: page }
  - { situation: "The sections Data, Documents and History of the page of a record", case: section }
  - { situation: "The title of the dialog New contact", case: dialog }
  - { situation: "The title of a card of a related record", case: part }
  - { situation: "The questions of an accordion under a section Frequent questions", case: part, note: "the section is h5, its items h6: the section stands above them" }
  - { situation: "Residence, a group of fields of the form of a change of residence", case: group }
---

# Titles

**A title takes the style of its role, and its tag from the outline of the page: the two never follow each other.**

## When to use it

Every time a title names something in a page of an application: the page itself, a section of
it, a dialog, a card or a panel, an item of an accordion, a group of fields. The role picks the
style; the place in the outline picks the tag.

Not here: the text that is not a title (`detail`, `caption`, `label`, the domain of the
components and of typography), and a page to read, an article or a commentary, which has a
ladder of its own not looked at yet.

## What decides it

One question: what does the title name? The whole page; a section of the page; a dialog, which
is the context of the person while it is open; a part, a thing with a boundary of its own; a
group of fields of a form. The tag is a second, separate question: the level of the title in the
outline of the page, never skipped.

## Cases

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

| Variable | Values | Means |
| --- | --- | --- |
| `role` | `page`, `section`, `dialog`, `part`, `group` | What the title names: the whole page, a section of the page, a dialog, a part (a card, a panel, an item of an accordion, a container a component draws), a group of fields of a form. |

A case that leaves a variable out holds for any of its values.

| Case | When | Where | Use | Serves | Carried by |
| --- | --- | --- | --- | --- | --- |
| `page` | role: page | the style `h3` (30px), the tag `h1` | `mds-text typography=page tag=h1` | intuitive | `text-title-page`, `--text-size-title-page`, `mds-text typography=page` |
| `section` | role: section | the style `h5` (20px), the tag of its place in the outline (`h2` under the page) | `mds-text typography=section tag=h2` | intuitive | `text-title-section`, `--text-size-title-section`, `mds-text typography=section` |
| `dialog` | role: dialog | the style `h5`, the headline of the window; the dialog takes its name from aria-label on mds-modal, since the headline is hidden from screen readers. mds-banner draws its headline in h6 today (#1192) | `mds-modal aria-label`, `mds-banner slot=window headline` | intuitive | `text-title-dialog`, `--text-size-title-dialog`, `mds-text typography=dialog` |
| `part` | role: part | the style `h6` (16px, weight 700), the tag of its place (`h2` under the page, `h3` in a section); the components that draw a part give it already (the headline of mds-banner, mds-push-notification-item, mds-file); an item of an accordion is a part, `h6` by default | `mds-text typography=part`, `mds-accordion-item` | intuitive | `mds-banner`, `mds-push-notification-item`, `mds-file`, `text-title-part`, `--text-size-title-part`, `mds-text typography=part` |
| `group` | role: group | a `fieldset` with no border and no inset of its own, its title the `legend` in the style `h6`: not a heading of the page; `field-group` on the fieldset draws it, the legend `gap-title-content` (300) from its first field |  | inclusive, intuitive | `field-group`, `text-title-group`, `--text-size-title-group` |

No gaps: every combination has a case or is not applicable.

## Parts

The ladder at the default theme, and how to write each role:

| Role | Style | Tag | `mds-text` | Without components |
| --- | --- | --- | --- | --- |
| `page` | `h3` (30px) | `h1` | `typography="page" tag="h1"` | `text-title-page` |
| `section` | `h5` (20px) | `h2` | `typography="section" tag="h2"` | `text-title-section` |
| `dialog` | `h5` | the headline of the window | drawn by `mds-banner` (`h6` until #1192) | `text-title-dialog` |
| `part` | `h6` (16px, weight 700) | the level of its place | `typography="part"` with the tag of its place | `text-title-part` |
| `group` | `h6` | `legend` | `field-group` on the `fieldset` | `text-title-group` |

The three levels read apart, 30, 20 and 16px, 1.5 and 1.25 times the level below. A theme moves
a role through its token (`--text-size-title-<role>` and its modifiers), not through the
markup; a theme that applies to a part of the page declares the role tokens again there.

## Always true

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

These hold in every product: a product layer cannot change them.

| Id | Rule | Serves | Carried by | Checked by |
| --- | --- | --- | --- | --- |
| `one-h1` | The title of the page is its h1, and the only one. | inclusive | the guide | review |
| `tag-is-structure` | The tag follows the outline of the page and never skips a level; the style follows the role of the title. With mds-text the tag is written whenever the style is not the level (typography="h3" tag="h1"): left out, the tag follows the style. | inclusive | the guide | review |
| `by-role` | A title takes the style of its role, never a level chosen by eye or to get a smaller size: page h3, section and dialog h5, part and group h6 at the default theme; the styles h1, h2 and h4 have no role in a page of an application. | intuitive, flexible | the guide | review |

## Situations

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

Situations every application has, each with its case: they give the examples, the texts and the keywords. The situations of a product's own domain go in its layer.

| Situation | Case |
| --- | --- |
| The title of a list of requests | `page` |
| The sections Data, Documents and History of the page of a record | `section` |
| The title of the dialog New contact | `dialog` |
| The title of a card of a related record | `part` |
| The questions of an accordion under a section Frequent questions | `part`: the section is h5, its items h6: the section stands above them |
| Residence, a group of fields of the form of a change of residence | `group` |

## Accessibility

- The `h1` is the title of the page and the only one (`one-h1`); the headings never skip a
  level (`tag-is-structure`), so the outline a screen reader lists is the structure of the page.
- A group of fields is a `fieldset` with its `legend`: tabbing into one of its fields, a screen
  reader says the group before the field ("Residence, group. Town, edit"), and two fields
  with the same label in two groups read apart. A heading inside the `legend` would add the
  groups to the outline of the page; a heading with no `fieldset` drops the group.
- The headline of the window of a dialog is hidden from screen readers: the dialog takes its
  name from `aria-label` on `mds-modal`.
- The title of an item of an accordion sits inside the button that opens it, so it is not a
  heading of the page: its `typography` is a style only.

## Magma gaps

- `mds-banner` draws its headline in `h6`, always: the window of a dialog needs `h5`, a choice
  of the style of the headline (#1192).
- The examples of `mds-card-header` give 13 titles `h5` with no `tag`, so a card renders an
  `<h5>` and skips the levels in between; `mds-note` does the same in 4 of its 7: they take
  `h6` with the tag of their place (#1189, the examples of the components aligned).
- The items of `mds-accordion` are not in the headings of the page; the Accordion pattern of
  the WAI-ARIA Authoring Practices wraps each button in a heading with its level. Whether they
  should be, with a tag of their own apart from the style, is a question of the component.
- The Typography page of the docs site says the style `h1` is the title of the page: it moves
  to this ladder with the pull request of the docs site that reads the domains, before this
  domain is released (#1197).

## Decisions

| Date | Decision | Why |
| --- | --- | --- |
| 2026-10-30 | In a page of an application the title of the page is `h3`, a section `h5`, a part `h6`, whatever their tag (`page`, `section`, `part`); the rules of the Foundation they stand on get their ids, `one-h1` and `tag-is-structure`. | `h6` is the style the components that draw a part give their title, so every part has one style; the page takes `h3` as the block `page-header` has it; 30, 20 and 16px read apart, the ladder of the productive applications of Carbon and Primer. Rejected: the Foundation literally (`h1` 48px, `h2`, `h4`), where the head of the page takes the room of the content and a part has two styles; one step per level (`h3`, `h4`, `h5`), where a section and a card read almost alike. Chosen live. https://github.com/magma-design-system/magma/issues/1189#issuecomment-6525993908 |
| 2026-10-30 | The title of a dialog is `h5`, the style of a section (`dialog`). | While it is open the dialog is the context of the person, and its title has to stand above the titles it may hold, `h6`; in `h6` it is as tall as the values of the fields. `h5` is the size of the dialog titles of Carbon and Atlassian and of the examples of `mds-modal`. Rejected: `h6`, the dialog as a part. Chosen live on a form and on a confirmation; `mds-banner` gets a choice of the style of its headline (#1192). https://github.com/magma-design-system/magma/issues/1189#issuecomment-6526234532 |
| 2026-10-30 | A group of fields is a `fieldset` with no border and no inset, its title the `legend` in the style `h6`, not a heading of the page (`group`). | The native grouping of related controls (WCAG technique H71): the group names every field it holds; a heading inside the `legend` adds the groups to the outline, and inside a dialog, whose title is hidden, they open it with no level above. The three forms look the same: one answer, given with its proof (the accessibility tree of Chromium) and confirmed. https://github.com/magma-design-system/magma/issues/1189#issuecomment-6526567780 |
| 2026-10-30 | The title of an item of an accordion is `h6`, the title of a part (`part`); the default of `mds-accordion-item` moves from `h5`. | An accordion stands in a section, and the title of the section (`h5`) has to stand above its items. Rejected: `h5`, the default of today, where the section and its questions read as one level. Chosen live. https://github.com/magma-design-system/magma/issues/1189#issuecomment-6526696932 |
| 2026-10-30 | The titles are carried by role names: `typography="<role>"` on `mds-text`, `text-title-<role>` without components, one token per role, `--text-size-title-<role>` (`by-role`). | The role reads in the code, so a check can tell a section from a dialog though both are `h5`, and a theme moves one role in one place. Rejected: the style of the level written by hand from the table, with a lint on the pairs of tag and style, the form the previews got wrong. https://github.com/magma-design-system/magma/issues/1189#issuecomment-6526876032 |
| 2026-10-31 | The file of the domain: a case per role, `one-h1` and `tag-is-structure` written here from the Typography page of the docs site, which keeps the reasons around them. | The issue of the five domains (#1197): the rules the agents do not read on the docs site move into the package. |
| 2026-11-05 | The kind of the domain is `design-language`, no longer `foundation`. | Named after what the file is, a domain of the design language, not after the item of the docs site that holds it: Foundation there is the umbrella of the decisions Magma stands on (principles, accessibility, color, typography, illustration, content), and the design language is one group of it. The design language, the building blocks and the patterns together are Behavior, as the header of the studio names them (#1253). |
