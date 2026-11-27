---
# A Magma pattern: the format and the commands are in docs/PATTERNS.md.
id: edit-with-preview
kind: pattern
title: Edit with a preview
group: input
layer: magma
status: decided
need: >-
  The person changes something and must judge the result while changing it, without leaving the
  controls.
principle: >-
  The result stays in view beside the controls that change it, follows every change, and says
  what it shows.
keywords: [preview, live preview, editor, side by side, split view, workspace, scene, theme editor, template editor, form builder, what you see is what you get, settings with a preview]
not-for:
  - need: the head of the page, its title and its actions
    use: page-header
  - need: the data of one record, read or changed on its own page
    use: record-detail
  - need: choosing one item of a list and changing it beside the list
    use: list-and-detail
  - need: a result that takes time to compute
    use: loading
  - need: where the outcome of saving the changes is told
    use: message-placement
assumptions:
  - "The result can be computed as the person changes a value: in the browser, or by the back end in about a second; a longer one follows loading."
  - "The changes are a draft until the person saves them; undoing one follows confirm-action (act at once, then undo)."
high-stakes: false
components: [mds-input-field, mds-input, mds-input-select, mds-text, mds-tab, mds-tab-item, mds-preview]
related: [page-header, app-shell, record-detail, list-and-detail, loading, message-placement, confirm-action, widths]
validated-on: []

variables:
  reach:
    values: [page, part]
    means: "Does the change, or a condition the result is judged under (a theme, a mode, a language, the styles of the page), reach what the whole page stands on, or only a part of it (a message, a card, a form)?"
  room:
    values: [wide, narrow]
    means: "Is the window wide enough for the column of the controls and the result side by side: from the desktop breakpoint (1024 px)?"

cases:
  - id: beside-own-page
    reach: page
    room: wide
    where: "the controls in the column of a form at the start edge (`max-w-form`), the result beside them, an `mds-preview` drawn at the width of the desktop and scaled down to its panel, holding a document of its own, an `<iframe>` its `label` titles with what it shows and under which conditions; the two across the whole window under the bar, the content of the bar with them, since the result is a page judged at the widths of a window; two panels as tall as the window under the bar: only the column of the controls scrolls, the result keeps the whole height; the conditions in the head of the result"
    use:
      - { role: "a control that changes the result, in the column of the controls", use: mds-input-field }
      - { role: "a choice among a few values, inside its field", use: mds-input-select }
      - { role: "a text the result shows, inside its field", use: mds-input }
      - { role: "a longer text the result shows, inside its field", use: "mds-input type=textarea" }
      - { role: "the result, a region named by what it shows and under which conditions, its title at the start of its head", use: "mds-preview label=<what the result shows and under which conditions, in the language of the page> headline=<the title of the result, in the language of the page>" }
      - { role: "the conditions the result is judged under, one at a time, at the end of the head of the result", use: "mds-tab slot=conditions size=sm" }
      - { role: "a condition, named in the language of the page", use: "mds-tab-item label=<the condition, in the language of the page>" }
    rules: [widths/form, widths/start-edge, widths/workspace]
  - id: beside-in-page
    reach: part
    room: wide
    where: "the controls in the column of a form at the start edge (`max-w-form`), the result beside them as a region of the page named by its heading, written with the components themselves, at the width it will have; the two in the frame of the page (`page-frame`)"
    use:
      - { role: "a control that changes the result, in the column of the controls", use: mds-input-field }
      - { role: "a text the result shows, inside its field", use: mds-input }
      - { role: "a longer text the result shows, inside its field", use: "mds-input type=textarea" }
      - { role: "the title of the result, the head of its region", use: "mds-text typography=section tag=h2" }
    rules: [widths/form, widths/page, widths/start-edge]

  - id: docked-small
    room: narrow
    where: "under the desktop breakpoint the result (`mds-preview`, the same markup as beside the controls) docks at the bottom of the window, in a tray on its bottom edge at the end side, over the controls and always in view: drawn at the width of the desktop and scaled to its card, its title and a lens; the lens zooms it to the width of the window between the gutters, its conditions coming in once it has grown, and the focus moving back to a control shrinks it; the controls take the window, scroll under it, and leave room for it under the last one"
    use:
      - { role: "a control that changes the result, in the column of the controls", use: mds-input-field }
      - { role: "a choice among a few values, inside its field", use: mds-input-select }
      - { role: "a text the result shows, inside its field", use: mds-input }
      - { role: "a longer text the result shows, inside its field", use: "mds-input type=textarea" }
      - { role: "the result, docked small at the bottom of the window with its title and its lens, which zooms it to the width of the window", use: "mds-preview label=<what the result shows and under which conditions, in the language of the page> headline=<the title of the result, in the language of the page>" }
      - { role: "the conditions the result is judged under, shown when zoomed", use: "mds-tab slot=conditions size=sm" }
      - { role: "a condition, named in the language of the page", use: "mds-tab-item label=<the condition, in the language of the page>" }
    rules: [widths/form, widths/workspace]

gaps: []
not-applicable: []

always-true:
  - id: result-in-view
    rule: "The result stays in view while the person changes a control: it never scrolls away from the controls that move it."
    checked-by: review
  - id: follows-every-change
    rule: "The result follows every change at once, with no button to refresh it; a result that takes time keeps the previous one on screen while it computes (loading, keep-while-reloading)."
    checked-by: review
  - id: own-document
    rule: "A change or a condition that reaches the page is shown in a document of its own (an iframe), so it never moves the controls: the editor keeps its own theme, mode and language."
    checked-by: review
  - id: says-what-it-shows
    rule: "The result says what it shows and under which conditions: the heading of its region and, for a document of its own, the title of the iframe, kept current as they change (\"The theme Warm on a page of a product, dark mode\")."
    checked-by: review
  - id: conditions-as-tabs
    rule: "The conditions the result is judged under (the modes, the contrast, the surface beneath) are an mds-tab in the head of the result, one at a time; a condition the result cannot take is a disabled tab."
    checked-by: review
  - id: controls-first
    rule: "The controls come first in reading and Tab order, at the start edge; the result follows them."
    checked-by: review
  - { id: no-flash-empty, from: loading }
  - { id: newest-wins, from: loading }

open-choices:
  - id: narrow-window
    default: "docked-small"
    may: "a product used on the desktop only may leave the editor out under the desktop breakpoint and say that the window is too narrow for it"

situations:
  - { situation: "The colours of the theme of an application, judged on a page in light and dark mode", case: beside-own-page }
  - { situation: "The language of the texts of an application, judged on one of its pages", case: beside-own-page }
  - { situation: "The text of an email notice, edited with the message as it will arrive", case: beside-in-page }
  - { situation: "The fields of a form being built, with the form as people will fill it", case: beside-in-page }
  - { situation: "The header and the margins of a document to print, with its first page", case: beside-in-page }
  - { situation: "The colours of a theme, changed on a tablet held upright", case: docked-small }
---

# Edit with a preview

**The result stays in view beside the controls that change it, follows every change, and says what it shows.**

## When to use it

An editor whose result the person judges while changing it: the colours of a theme on a page
of the product, the text of an email notice as it will arrive, a form being built as people
will fill it, the header of a document to print. The controls and the result stand side by side,
and every change shows at once, so the person never goes back and forth between a form and a
page that shows what it did.

Something else fits better:

- choosing one item of a list and changing it beside the list: `list-and-detail` (the editor of
  one item can be this pattern);
- choosing among alternatives the application generated for one choice: the comparison of
  #1489, of the same epic;
- a page of another site shown to the person: `mds-url-view`, in a dialog;
- the data of one record, read or changed on its page: `record-detail`.

## What decides it

Two questions: whether the change, or a condition the result is judged under, reaches what the
whole page stands on (its theme, its mode, its language, its styles), and whether the window is
wide enough for the two side by side. A change that reaches the page needs a document of its
own, or it would repaint the controls too; a change of a part is shown with the components
themselves, at the width the part will have.

## Cases

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

| Variable | Values | Means |
| --- | --- | --- |
| `reach` | `page`, `part` | Does the change, or a condition the result is judged under (a theme, a mode, a language, the styles of the page), reach what the whole page stands on, or only a part of it (a message, a card, a form)? |
| `room` | `wide`, `narrow` | Is the window wide enough for the column of the controls and the result side by side: from the desktop breakpoint (1024 px)? |

A case that leaves a variable out holds for any of its values.

| Case | When | Where | Rules |
| --- | --- | --- | --- |
| `beside-own-page` | reach: page; room: wide | the controls in the column of a form at the start edge (`max-w-form`), the result beside them, an `mds-preview` drawn at the width of the desktop and scaled down to its panel, holding a document of its own, an `<iframe>` its `label` titles with what it shows and under which conditions; the two across the whole window under the bar, the content of the bar with them, since the result is a page judged at the widths of a window; two panels as tall as the window under the bar: only the column of the controls scrolls, the result keeps the whole height; the conditions in the head of the result | `widths/form`, `widths/start-edge`, `widths/workspace` |
| `beside-in-page` | reach: part; room: wide | the controls in the column of a form at the start edge (`max-w-form`), the result beside them as a region of the page named by its heading, written with the components themselves, at the width it will have; the two in the frame of the page (`page-frame`) | `widths/form`, `widths/page`, `widths/start-edge` |
| `docked-small` | room: narrow | under the desktop breakpoint the result (`mds-preview`, the same markup as beside the controls) docks at the bottom of the window, in a tray on its bottom edge at the end side, over the controls and always in view: drawn at the width of the desktop and scaled to its card, its title and a lens; the lens zooms it to the width of the window between the gutters, its conditions coming in once it has grown, and the focus moving back to a control shrinks it; the controls take the window, scroll under it, and leave room for it under the last one | `widths/form`, `widths/workspace` |

No gaps: every combination has a case or is not applicable.

The parts of each case, in the order of its preview: what each does in the case, and the component to write. A value in angle brackets is the text of the application, written as it says; the rest of the preview is its stage, the context of the case.

`beside-own-page`:

| Role | Use |
| --- | --- |
| a control that changes the result, in the column of the controls | `mds-input-field` |
| a choice among a few values, inside its field | `mds-input-select` |
| a text the result shows, inside its field | `mds-input` |
| a longer text the result shows, inside its field | `mds-input type=textarea` |
| the result, a region named by what it shows and under which conditions, its title at the start of its head | `mds-preview label=<what the result shows and under which conditions, in the language of the page> headline=<the title of the result, in the language of the page>` |
| the conditions the result is judged under, one at a time, at the end of the head of the result | `mds-tab slot=conditions size=sm` |
| a condition, named in the language of the page | `mds-tab-item label=<the condition, in the language of the page>` |

`beside-in-page`:

| Role | Use |
| --- | --- |
| a control that changes the result, in the column of the controls | `mds-input-field` |
| a text the result shows, inside its field | `mds-input` |
| a longer text the result shows, inside its field | `mds-input type=textarea` |
| the title of the result, the head of its region | `mds-text typography=section tag=h2` |

`docked-small`:

| Role | Use |
| --- | --- |
| a control that changes the result, in the column of the controls | `mds-input-field` |
| a choice among a few values, inside its field | `mds-input-select` |
| a text the result shows, inside its field | `mds-input` |
| a longer text the result shows, inside its field | `mds-input type=textarea` |
| the result, docked small at the bottom of the window with its title and its lens, which zooms it to the width of the window | `mds-preview label=<what the result shows and under which conditions, in the language of the page> headline=<the title of the result, in the language of the page>` |
| the conditions the result is judged under, shown when zoomed | `mds-tab slot=conditions size=sm` |
| a condition, named in the language of the page | `mds-tab-item label=<the condition, in the language of the page>` |

## Parts

- **The controls**: the fields of a form (`mds-input-field` and its control), in the column of a
  form at the start edge (`widths/form`, `widths/start-edge`), in the order of the result they
  change.
- **The result**: a region after the controls. A result that is a page is an `mds-preview`: a
  region named by its `label` (what it shows and under which conditions), its `headline` at the
  start of its head and, when the result is judged under several conditions, the `mds-tab` of the
  conditions (`slot="conditions"`) at the end, beside its lens; under the head, the `<iframe>` its
  `label` titles. A part is a region of the page named by its heading (`mds-text
  typography="section" tag="h2"`), written with the components themselves.
- **The width**: a result that is a page goes across the whole window under the bar, the content
  of the bar with it, since it is judged at the widths of a window; `mds-preview` draws it at the
  width of the desktop and scales it down to its panel, never enlarged. A part stays in the frame
  of the page (`widths/page`), at the width it will have: not in `mds-preview`, which would draw it
  wider in a wider panel.
- **The height**: for a result that is a page, two panels as tall as the window under the bar;
  only the column of the controls scrolls, and the result keeps the whole height.
- **Docked**: under the desktop breakpoint `mds-preview` docks by itself, with the same markup: a
  card in a tray on the bottom edge of the window, at the end side, as the one of `mds-status-bar`;
  small, its headline and its lens, a toggle of 48px, which zooms it to the width of the window
  between the gutters; its conditions come in once it has grown. The column of the controls leaves
  room under its last control for the docked card (`max-desktop:pb-7000`).

## Behaviour over time

- **A change**: the result follows it at once, with no button to refresh it; the focus stays on
  the control.
- **A result that takes time**: the previous one stays on screen and the region has `aria-busy`
  until the new one is ready (`loading`, `keep-while-reloading`); an older answer never replaces a
  newer one.
- **A condition**: choosing another tab changes what the result is judged under, never the
  changes; the title of the iframe follows it.
- **The controls scroll**: only their column moves; the result stays in view beside them, or
  docked in its corner on a narrow window (`result-in-view`).
- **The lens**: zooms the docked result and shrinks it back; the focus stays on the lens, and the
  controls behind stay usable. Escape, or the focus moving back to a control of the page, shrinks
  it too, so a control never takes the focus under the tray.

## Always true

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

These hold in every product: a product layer cannot change them.

| Id | Rule | Checked by |
| --- | --- | --- |
| `result-in-view` | The result stays in view while the person changes a control: it never scrolls away from the controls that move it. | review |
| `follows-every-change` | The result follows every change at once, with no button to refresh it; a result that takes time keeps the previous one on screen while it computes (loading, keep-while-reloading). | review |
| `own-document` | A change or a condition that reaches the page is shown in a document of its own (an iframe), so it never moves the controls: the editor keeps its own theme, mode and language. | review |
| `says-what-it-shows` | The result says what it shows and under which conditions: the heading of its region and, for a document of its own, the title of the iframe, kept current as they change ("The theme Warm on a page of a product, dark mode"). | review |
| `conditions-as-tabs` | The conditions the result is judged under (the modes, the contrast, the surface beneath) are an mds-tab in the head of the result, one at a time; a condition the result cannot take is a disabled tab. | review |
| `controls-first` | The controls come first in reading and Tab order, at the start edge; the result follows them. | review |
| `no-flash-empty` | A reload never empties what is on screen. (from `loading`) | review |
| `newest-wins` | An older answer never replaces a newer one. (from `loading`) | review |

## Open choices

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

The default decides these; a product layer may narrow them.

| Id | Default | A product may |
| --- | --- | --- |
| `narrow-window` | docked-small | a product used on the desktop only may leave the editor out under the desktop breakpoint and say that the window is too narrow for it |

## Situations

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

Situations every application has, each with its case: they give the examples, the texts and the keywords. The situations of a product's own domain go in its layer.

| Situation | Case |
| --- | --- |
| The colours of the theme of an application, judged on a page in light and dark mode | `beside-own-page` |
| The language of the texts of an application, judged on one of its pages | `beside-own-page` |
| The text of an email notice, edited with the message as it will arrive | `beside-in-page` |
| The fields of a form being built, with the form as people will fill it | `beside-in-page` |
| The header and the margins of a document to print, with its first page | `beside-in-page` |
| The colours of a theme, changed on a tablet held upright | `docked-small` |

## Accessibility

- The result is a region named by its heading; an iframe also has a `title` that names what it
  shows and under which conditions, kept current.
- The controls come first in the Tab order, the conditions and the result after them; the
  content of an iframe is reachable with the keyboard, as a page is.
- The conditions are an `mds-tab`: a `tablist`, the arrows move between its tabs.
- The result is not a live region: each step of a slider would be read out. What a change did
  that the person must know (a pair of colours under the contrast it needs) is said in text, next
  to the control.
- Under reduced motion the result changes without a transition.

## Content

- The heading of the result names what it is: "Anteprima", "Il messaggio come arriva", "Il
  modulo come si compila".
- The title of an iframe says what it shows and under which conditions: "Il tema Warm su una
  pagina di un prodotto, in scuro".
- A condition is named by itself, in the language of the page: "Chiaro", "Scuro",
  "Contrasto alto".

## Magma gaps

- `widths` had no box wider than the frame of the page: the result of a page needs the whole
  window. Its case `workspace` comes with this pattern (epic #1487, #1488).
- No building block for the panels of an editor: written here. `list-and-detail` lays out panels
  side by side too (#1262); whether the two are one section, the block of a workspace, is the
  question of that block.
- The Mistakes of `mds-url-view` forbid a bare `<iframe>` with no exception: they should point
  the result of an editor here.

## Decisions

| Date | Decision | Why |
| --- | --- | --- |
| 2026-11-23 | A pattern of the group Input, not a building block: the layout of the panels is written in it, and becomes a block once a second pattern lays out the same section. | `docs/PATTERNS.md`, "A building block": a block needs two defined patterns in its `used-by`, and none was defined. The maintainer's choice on #1488. |
| 2026-11-23 | A result that reaches the page stands in a native `<iframe>`, inside a region of the pattern, not in `mds-url-view`. | Rendered side by side on the build: `mds-url-view` is the window of a page of another site (the explore icon, the host name, a close button that closes only an `mds-modal` around it, a host as tall as the viewport, an absolute `src`, the iframe named by its domain). The studio of Magma shows its scene so (`projects/studio/src/frame.ts`). The maintainer's choice on #1488. |
| 2026-11-23 | The column of the controls is the column of a form, at the start edge. | `widths/form` and `widths/start-edge`: the controls of an editor are a form. |
| 2026-11-23 | Side by side from the desktop breakpoint (1024 px). | The object model of the studio (`projects/studio/studio.object-model.md`, section 8, "Spazio di lavoro"); `app-shell` shows the sections in the bar from the same width. |
| 2026-11-23 | Two panels as tall as the window under the bar: only the column of the controls scrolls. | Rendered beside a result that sticks while the page scrolls: the sticky one needs the height of the bar written by hand, which `mds-header` avoids ("no number to keep in step with its height"). The maintainer's choice on #1488. |
| 2026-11-23 | On a page with a result that is a page, the content of the bar follows the window. | `widths/start-edge`: the name of the application and the title start on one edge; rendered at 1600 px, the bar left in the frame started 135 px after the title. The maintainer's choice on #1488. |
| 2026-11-23 | Under the desktop breakpoint the result docks small in a corner, always in view, and a lens zooms it; small, only the image and the lens. | The maintainer's answer on #1488, over a result stuck at the top or a switch between the controls and the result: the preview is never lost while the person corrects. |
| 2026-11-23 | The result of `beside-own-page` and `docked-small` is `mds-preview` (#1491): the same markup stands beside the controls from the desktop breakpoint and docks under it; the stand-in markup and the gap of `docked-small` go. `beside-in-page` keeps a region of the page. | The component this pattern proposed is built (#1491, with the maintainer): drawn at the width of its box or of the desktop, whichever is wider, scaled down, docked in a tray as the one of `mds-status-bar`, its lens zooming it. A part in it would be drawn wider than it will be in a wider panel. The previews rendered before and after and kept by the maintainer. |
| 2026-11-23 | A result that is a page goes across the whole window; a part stays in the frame of the page. | The principle of `widths`, a box as wide as its role: a page is judged at the widths of a window, a part at its own; the object model, section 8: the scene does not fit beside the controls in 1280 px. |
| 2026-11-27 | Points to `list-and-detail` where it named the candidate list and detail of #1262 | The pattern of #1262 is written; the two name each other in `not-for` and `related`. |
