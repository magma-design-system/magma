---
# A domain of the design language (#1189): the format and the commands are in
# docs/PATTERNS.md, "A domain of the design language". The check says what is still missing:
# nx run stencil:check.patterns (after nx run stencil:build).
id: surfaces
kind: design-language
title: Surfaces
layer: magma
status: decided
need: >-
  Give a boundary only to what space cannot separate, so that a surface on the screen means
  something: an item of a set, a thing that stays put, a dialog.
principle: >-
  The interface is neutral: the page is one canvas, its sections are bare, and a surface rises
  only for an item of a set, for what stays put, and for the window of a dialog.
keywords: [surface, card, band, sheet, background, elevation, container, sticky, panel, fill, well, canvas]
assumptions:
  - "The surface roles of the palette (surface-default, -raised, -overlay, -muted, -sunken) flip with the mode by themselves."
components: [mds-card, mds-header, mds-header-bar, mds-status-bar, mds-modal, mds-banner, mds-button]
related: [rhythm, titles, widths, actions]
validated-on: []

variables:
  content:
    values: [page, section, item, fixed, edit-actions, dialog]
    means: "What stands on the screen: the page itself; a group of content of one subject (the data of a record, a part of a form, the header of the page); an item of a set of alike things (a related record, a result, a person); something that stays put while the page scrolls (the bar of the application); the row of actions of a form that is the page; the window of a dialog."

cases:
  - id: canvas
    content: page
    where: "`surface-default`, which the base styles already give the body; the content stands on it with no sheet: only the items of a set, what stays put and the window of a dialog rise from it"
    serves: intuitive
    carried-by: [--magma-surface-default]
  - id: section
    content: section
    where: "bare: no surface, no border, no inset of its own; its title (`titles/section`) and `gap-between-sections` (1600) set it apart. The header of the page is the first section, in the flow, and scrolls away with the content"
    serves: intuitive
    carried-by: [gap-between-sections]
  - id: card
    content: item
    where: "a card, whose boundary tells where one item ends and the next begins: `p-inset` (600) inside, `gap-between-containers` (400) between the cards, its title `titles/part`"
    use: ["mds-card"]
    serves: intuitive
    carried-by: [mds-card, gap-between-containers]
  - id: band
    content: fixed
    where: "a band, a strip of surface as wide as the page, drawn by the component that stays put, which keeps its room: the bar of the application (mds-header-bar in mds-header, `surface-raised`, `shadow-md-sharp`, in the flow at the top and sticky, so the page starts under it), the actions of an edit (mds-status-bar, `surface-overlay`, `shadow-md`, its room kept at the end of the page); never the header of the page (`section`) made sticky"
    use: ["mds-header", "mds-header-bar", "mds-status-bar"]
    serves: intuitive
    carried-by: [mds-header, mds-header-bar, mds-status-bar]
  - id: edit-actions
    content: edit-actions
    where: "an mds-status-bar docked at the bottom of the window for the whole edit, in the order of `actions/order` (Annulla, then Salva last); the form has no row at its end. A form inside a page, a dialog or a card keeps its row at its end (`actions/place`)"
    use: ["mds-status-bar", "mds-button variant=dark tone=outline", "mds-button variant=primary tone=strong"]
    serves: enabling
    carried-by: [mds-status-bar]
  - id: dialog
    content: dialog
    where: "the window is `mds-banner slot=\"window\" variant=\"light\" tone=\"box\" dismissible` for a form, a choice and a confirmation; only a dialog that announces a state the person did not ask for, with a decision (the deadline of the application), takes the variant of that state, `box`. The window never changes variant when a state arrives, and no dialog is opened to announce a state that has happened (`message-placement`)"
    use: ["mds-modal", "mds-banner slot=window variant=light tone=box dismissible", "mds-banner slot=window variant=warning tone=box dismissible"]
    serves: [inclusive, intuitive]
    carried-by: [mds-banner slot=window variant=light tone=box]

gaps: []
not-applicable: []

always-true:
  - id: tints-in-components
    rule: "surface-muted and surface-sunken live inside components only (zebra rows, wells, tracks, code), never as the background of a section of a page."
    serves: intuitive
    checked-by: review

open-choices: []

situations:
  - { situation: "The page behind a list of requests", case: canvas }
  - { situation: "The data of a record: its identity, its addresses, its history", case: section }
  - { situation: "The header of a page under the bar of the application", case: section, note: "in the flow, with no surface: it scrolls away with the content" }
  - { situation: "The records related to a request, one card each", case: card }
  - { situation: "The bar of the application, with the logo and the navigation", case: band }
  - { situation: "The edit of a record, a form about four windows long", case: edit-actions }
  - { situation: "The dialog New contact, a form", case: dialog }
  - { situation: "The confirmation of a deletion", case: dialog, note: "the light window too: the red stands on Elimina only (actions/confirm)" }
  - { situation: "The warning that the session is about to end", case: dialog, note: "a warning window, its row follows actions/banner" }
---

# Surfaces

**The interface is neutral: the page is one canvas, its sections are bare, and a surface rises only for an item of a set, for what stays put, and for the window of a dialog.**

## When to use it

Every time something on the screen could get a fill, a border or a shadow of its own: a group
of data, a list of results, the head of the page, a row of actions, a dialog. The domain says
when a boundary is earned; the components draw it.

Not here: the colours of the surfaces and their flip with the mode (the palette and
`docs/agents/color.md`), and the surfaces inside a component (a zebra row, the track of a
switch), which the component draws.

## What decides it

One question: what is it? The page itself; a group of content of one subject; an item of a set
of alike things, which needs a boundary to tell where it ends; something that stays put while
the page scrolls, which needs a surface to stand above it; the row of actions of a form that is
the whole page; the window of a dialog. The rest is space and titles.

## Cases

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

| Variable | Values | Means |
| --- | --- | --- |
| `content` | `page`, `section`, `item`, `fixed`, `edit-actions`, `dialog` | What stands on the screen: the page itself; a group of content of one subject (the data of a record, a part of a form, the header of the page); an item of a set of alike things (a related record, a result, a person); something that stays put while the page scrolls (the bar of the application); the row of actions of a form that is the page; the window of a dialog. |

A case that leaves a variable out holds for any of its values.

| Case | When | Where | Use | Serves | Carried by |
| --- | --- | --- | --- | --- | --- |
| `canvas` | content: page | `surface-default`, which the base styles already give the body; the content stands on it with no sheet: only the items of a set, what stays put and the window of a dialog rise from it |  | intuitive | `--magma-surface-default` |
| `section` | content: section | bare: no surface, no border, no inset of its own; its title (`titles/section`) and `gap-between-sections` (1600) set it apart. The header of the page is the first section, in the flow, and scrolls away with the content |  | intuitive | `gap-between-sections` |
| `card` | content: item | a card, whose boundary tells where one item ends and the next begins: `p-inset` (600) inside, `gap-between-containers` (400) between the cards, its title `titles/part` | `mds-card` | intuitive | `mds-card`, `gap-between-containers` |
| `band` | content: fixed | a band, a strip of surface as wide as the page, drawn by the component that stays put, which keeps its room: the bar of the application (mds-header-bar in mds-header, `surface-raised`, `shadow-md-sharp`, in the flow at the top and sticky, so the page starts under it), the actions of an edit (mds-status-bar, `surface-overlay`, `shadow-md`, its room kept at the end of the page); never the header of the page (`section`) made sticky | `mds-header`, `mds-header-bar`, `mds-status-bar` | intuitive | `mds-header`, `mds-header-bar`, `mds-status-bar` |
| `edit-actions` | content: edit-actions | an mds-status-bar docked at the bottom of the window for the whole edit, in the order of `actions/order` (Annulla, then Salva last); the form has no row at its end. A form inside a page, a dialog or a card keeps its row at its end (`actions/place`) | `mds-status-bar`, `mds-button variant=dark tone=outline`, `mds-button variant=primary tone=strong` | enabling | `mds-status-bar` |
| `dialog` | content: dialog | the window is `mds-banner slot="window" variant="light" tone="box" dismissible` for a form, a choice and a confirmation; only a dialog that announces a state the person did not ask for, with a decision (the deadline of the application), takes the variant of that state, `box`. The window never changes variant when a state arrives, and no dialog is opened to announce a state that has happened (`message-placement`) | `mds-modal`, `mds-banner slot=window variant=light tone=box dismissible`, `mds-banner slot=window variant=warning tone=box dismissible` | inclusive, intuitive | `mds-banner slot=window variant=light tone=box` |

No gaps: every combination has a case or is not applicable.

## Parts

The window of a dialog, by what the dialog does:

| Dialog | Window | Row |
| --- | --- | --- |
| A form, a choice | `variant="light" tone="box"` | the main action `primary strong`, Annulla `dark outline` |
| A confirmation | `variant="light" tone="box"` | Elimina `error strong`, Annulla `dark outline`, the focus on Annulla (`actions/confirm`) |
| A state the person did not ask for, with a decision: the deadline of the application | the variant of the state, `tone="box"` | `actions/banner`: the main action `strong`, the secondary `outline`, in that variant |
| Its action fails | unchanged | the error right above the row (`actions/failed`) |
| A state that has happened | no dialog (`message-placement`) | |

What stays put, and the surface its component draws:

| Component | Surface | Where |
| --- | --- | --- |
| `mds-header-bar` (in `mds-header`) | `surface-raised`, `shadow-md-sharp` | a band across the top of the page, in the flow and sticky: the page starts under it |
| `mds-status-bar` | `surface-overlay`, `shadow-md` | docked to the bottom edge, for the actions of an edit |
| the window of a dialog | the case `dialog` | over the page, which is inert |

## Always true

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

These hold in every product: a product layer cannot change them.

| Id | Rule | Serves | Carried by | Checked by |
| --- | --- | --- | --- | --- |
| `tints-in-components` | surface-muted and surface-sunken live inside components only (zebra rows, wells, tracks, code), never as the background of a section of a page. | intuitive | the guide | review |

## Situations

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

Situations every application has, each with its case: they give the examples, the texts and the keywords. The situations of a product's own domain go in its layer.

| Situation | Case |
| --- | --- |
| The page behind a list of requests | `canvas` |
| The data of a record: its identity, its addresses, its history | `section` |
| The header of a page under the bar of the application | `section`: in the flow, with no surface: it scrolls away with the content |
| The records related to a request, one card each | `card` |
| The bar of the application, with the logo and the navigation | `band` |
| The edit of a record, a form about four windows long | `edit-actions` |
| The dialog New contact, a form | `dialog` |
| The confirmation of a deletion | `dialog`: the light window too: the red stands on Elimina only (actions/confirm) |
| The warning that the session is about to end | `dialog`: a warning window, its row follows actions/banner |

## Accessibility

- A `light` window is `role="presentation"` with no live region, so an ordinary dialog does
  not read itself out; a `warning` window is `role="alert"`, and a screen reader reads its
  message as well as the name of the dialog. An `error` window would interrupt the screen
  reader for a question nothing has gone wrong yet in, which is why a confirmation stays
  `light`.
- A bar that stays put must never hide the field that has the focus (WCAG 2.4.11, Focus Not
  Obscured): the page reserves the room of the bar docked at the bottom while it is visible
  (#1203), and stops a field reached with Shift+Tab under the bar at the top
  (`scroll-padding-top`), rules of the styles of Magma with no script.

## Magma gaps

- `mds-card` pads each of its regions with `p-400`: it moves to one `p-inset` shared by its
  regions (#1201, `rhythm/shared-inset`).
- The example "Custom Window via `window` Slot" of `mds-modal` takes the default variant of
  the banner, `primary` with `tone="box"`, and Annulla `primary text`: it takes the window of
  the case `dialog` (#1189, the examples of the components aligned).

## Decisions

| Date | Decision | Why |
| --- | --- | --- |
| 2026-10-30 | The window of a dialog that announces no state is `mds-banner slot="window" variant="light" tone="box" dismissible` (`dialog`). | The interface is neutral and the accent is the colour of the actions: with `light` the title and the X take the colour of the text; a `light` banner has no live region. Rejected: `primary` `box`, the example of the guide of `mds-modal`, the title and the X in the accent and the whole dialog a live region. Chosen live (Actions, decision 11). https://github.com/magma-design-system/magma/issues/1189#issuecomment-6524036553 |
| 2026-10-30 | The confirmation of a deletion is an ordinary dialog: the `light` window, Elimina `error strong` (`dialog`). | A confirmation asks a question, nothing has happened yet: the red stands on the action with the consequence, the form of Carbon and Primer. Rejected: an `error` window, which says something went wrong, interrupts the screen reader (`role="alert"`) and turns Annulla red. Chosen live (Actions, decision 12). https://github.com/magma-design-system/magma/issues/1189#issuecomment-6524149839 |
| 2026-10-30 | The window never changes variant when a state arrives, and no dialog is opened to announce a state that has happened (`dialog`). | `message-placement` gives a dialog only to a decision and to a deadline of the application: the error of an action stays inside its dialog, a result goes to a toast once it closes (Actions, decision 14). https://github.com/magma-design-system/magma/issues/1189#issuecomment-6524836581 |
| 2026-10-30 | The dialog that warns that the session is about to end has a `warning` window, its row in `actions/banner` (`dialog`). | It announces a state of the application the person did not ask for, a problem, and its actions address it. Rejected: the `light` window, where a warning nobody asked for looks like any form. Chosen live (Actions, decision 15). https://github.com/magma-design-system/magma/issues/1189#issuecomment-6525103424 |
| 2026-10-30 | The groups of content of one subject are bare sections; a card is an item of a set of alike things (`section`, `card`). | The interface is neutral, and a boundary is for what space cannot separate; it is the form of `record-detail`, and the card keeps a meaning, a thing that opens. Rejected: every group in a card, where the boundaries multiply and the title of a group falls to the style of a part. Chosen live on the page of a record. https://github.com/magma-design-system/magma/issues/1189#issuecomment-6527700522 |
| 2026-10-30 | A band exists only where something stays put while the page scrolls, and a component draws it; the header of the page stays in the flow (`band`). | The surface follows from staying put, and the header does not stay: its actions concern the whole set and are taken before scrolling. Measured: the bar alone covers 51 px of a 520 px window, the bar with a page band 189 px, nearly half on a phone. Rejected: the header of the page as a fixed band. Chosen live. https://github.com/magma-design-system/magma/issues/1189#issuecomment-6527997628 |
| 2026-10-30 | When a form is the page, its row is an `mds-status-bar` docked at the bottom for the whole edit; a form inside a page, a dialog or a card keeps its row at its end (`edit-actions`). | Whoever corrects one field saves without scrolling, the edit bar of SAP Fiori and Salesforce, and the bar draws its own surface. Rejected: the row at the end of every form, where a correction costs a scroll of four windows. Chosen live; the recommendation changed on the render. https://github.com/magma-design-system/magma/issues/1189#issuecomment-6530822583 |
| 2026-10-30 | The page is `surface-default` with no sheet (`canvas`); `surface-muted` and `surface-sunken` live inside components only (`tints-in-components`). | A sheet around one subject is a card around one subject, and the cards of a set would stand on their own fill (both `surface-raised`); a tinted section reads as a well, in dark as a hole. Shown live next to the alternatives and confirmed. https://github.com/magma-design-system/magma/issues/1189#issuecomment-6531557197 |
| 2026-10-31 | The file of the domain, with the window of a dialog as one case whose Parts give the table; "a subtle section" goes from `docs/agents/color.md` and `theming.md`. | The issue of the five domains (#1197). |
| 2026-11-02 | A field stands a step off its surface: inside a surface that paints `overlay` (the window of a dialog, `mds-banner`, `mds-status-bar`, `mds-dropdown`, `mds-table`) it paints `surface-default`, passed down as `--magma-field-fill` (#1193). | The fill of a field sets it apart from where it stands, the layers of Carbon; the window keeps `overlay`, the meaning of the ladder in `theming.md`, and stands off the dimmed page in dark. Rejected: the window down a step, and the field as an outline only. Review round 1 of #1189. |
| 2026-11-02 | While an `mds-status-bar` is visible, the styles reserve its room: a box after the body and `scroll-padding-bottom`, the tallest bar for its content plus `rhythm/between-fields`, counted with `:has()` (#1203). | CSS only, no script that measures (the rule of layout); the content of the bar has limits (one line of description, at most three actions), so its tallest is known. A box, not a padding of `html`, which a reset out of any layer would zero. Rejected: a class the page writes, which a page forgets. Review round 1 of #1189. |
| 2026-11-02 | The bar of the application stands in the flow: `mds-header` is sticky at the top, the page starts under its bar, and the styles stop a field reached with Shift+Tab under it (`scroll-padding-top`, `band`). The room is the bar alone: the floating bar stands its margin lower, and the box of the header lets the clicks through. | The bar was fixed and nothing reserved its room: the title of a page stood 13 px under it instead of `gap-between-sections`, and a field could end under it. Sticky takes the room by itself, with no number to keep in step with its height; a room that followed the appearance would move the page when `appearance-set` changes it on scroll. Rejected: the bar fixed with a padding of the page from the styles, as at the bottom (#1203), a number to keep in step. A page that kept the room by hand gets it twice. Review round 1 of #1189. |
| 2026-11-05 | The kind of the domain is `design-language`, no longer `foundation`. | Named after what the file is, a domain of the design language, not after the item of the docs site that holds it: Foundation there is the umbrella of the decisions Magma stands on (principles, accessibility, color, typography, illustration, content), and the design language is one group of it. The design language, the building blocks and the patterns together are Behavior, as the header of the studio names them (#1253). |
