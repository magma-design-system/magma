---
# A Magma building block: the format and the commands are in docs/PATTERNS.md, "A building block".
id: app-shell
kind: block
title: Application shell
group: navigation
layer: magma
status: decided
need: >-
  The person knows which application they are in, reaches each of its sections from any page,
  and sees who they are signed in as.
principle: One bar names the application and opens its sections at every width; each page lives in one main under it.
keywords: [application shell, app shell, application bar, top bar, navigation bar, main navigation, sections of the application, menu, hamburger, account menu, sign in, sign out, frame of the page]
not-for:
  - need: the head of the content of a page, its title and its actions
    use: page-header
assumptions:
  - Each section of the application is a page of its own, with an address.
  - The application knows who is signed in, or that nobody is.
high-stakes: false
components: [mds-header, mds-header-bar, mds-text, mds-button, mds-dropdown, mds-separator]
used-by: [list-with-filters, record-detail, empty-state, message-placement]
related: [page-header, list-with-filters, record-detail, empty-state, message-placement]
validated-on: []

variables:
  sections: { values: [few, many], means: "few: the sections of the application fit in the bar, five at most with short names; many: more than five, or names too long for the bar" }
  person: { values: [signed-in, guest], means: "signed-in: someone is signed in (a back office, always); guest: nobody is signed in yet (a public service before the sign-in)" }

regions:
  - { id: product, required: true, what: "the name of the application at the start of the bar, as text; a product may put its logo in its place (logo)", use: ["mds-text typography=h6 tag=p"] }
  - { id: sections, when: { sections: few }, what: "the sections of the application as links, in the order of the work, the current one marked with current, or current=section on a page inside it (a record of its list); in the bar from the width of the desktop, in the menu under it", use: ["mds-button slot=nav href variant=dark tone=text current"] }
  - { id: person, when: { person: signed-in }, what: "the last element of the bar: a button named after the person signed in, which opens their menu: their name, Profilo, then Esci after a separator", use: ["mds-button slot=nav icon variant=dark tone=text", "mds-dropdown", "mds-separator"] }
  - { id: sign-in, when: { person: guest }, what: "the last element of the bar: Accedi, a link to the sign-in", use: ["mds-button slot=nav href variant=dark tone=outline"] }
  - { id: menu, what: "the menu of the bar, opened by its button: the sections, the current one marked with current as in the bar, then after a separator the name of the person, Profilo and Esci, or Accedi, which keeps its outline; under the width of the desktop with few sections, at every width with many", use: ["mds-header menu", "mds-button href variant=dark tone=text current", "mds-button href variant=dark tone=outline", "mds-separator"] }
  - { id: main, required: true, what: "the content of the page, under the bar: one main in the frame of the page, its header first (page-header), then its sections" }

always-true:
  - id: one-bar
    rule: "The application has one bar: mds-header with one mds-header-bar, first in the page; the page starts under it, with no room reserved by hand."
    checked-by: review
  - id: sections-are-links
    rule: "The sections are links to their pages (mds-button with href), the current one marked with current, or current=\"section\" on a page inside it; never a button that runs a script to change page, never aria-current or a tone set by hand."
    checked-by: review
  - id: every-width
    rule: "Every section is reached at every width: in the bar from the width of the desktop, in the menu of the bar under it; never menu=\"none\" on a bar with sections."
    checked-by: review
  - id: person-named
    rule: "The button of the person is named after them (\"Account di Mario Rossi\") and their menu opens with their name: the person always sees who is signed in."
    checked-by: review
  - id: one-main
    rule: "The content of a page is one main under the bar, in the frame of the page, its header first; the bar never holds the title or the actions of a page."
    checked-by: review
  - id: not-the-app-bar
    from: page-header
  - id: page
    from: widths
  - id: start-edge
    from: widths
  - id: band
    from: surfaces
  - id: between-sections
    from: rhythm

open-choices:
  - { id: logo, default: "the name of the application, as text", may: "put the logo of the product in its place, an mds-img with the name of the application as its alt" }

situations:
  - { id: back-office, situation: "A back office with four sections, an operator signed in", sections: few, person: signed-in }
  - { id: many-sections, situation: "An application with a dozen sections, an operator signed in", sections: many, person: signed-in }
  - { id: public-service, situation: "A public service a citizen opens before signing in", sections: few, person: guest }
---

# Application shell

**One bar names the application and opens its sections at every width; each page lives in one main under it.**

## When to use it

Around every page of an application: the bar on top, with the name of the application, its
sections and the person signed in, and the main under it, where the page lays out its header
and its sections. It came out of the round of the building blocks (2026-11-03): every
whole-page preview of `list-with-filters`, `record-detail`, `empty-state` (`not-found`) and
`message-placement` (`app-failed`) wrote the bar and the frame by hand, each a little
differently, with the sections as buttons with no address, none of them marked as the current
one, and none reachable on a phone. Not the head of the content of a page, its title and its
actions (`page-header`), and not the views of a page: tabs are a section of their own, under
the header.

## What decides it

Two questions: whether the sections fit in the bar (then they stand in it on a wide screen and
in its menu on a narrow one), and whether someone is signed in (then the bar ends with their
menu, otherwise with Accedi).

## Regions

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

| Variable | Values | Means |
| --- | --- | --- |
| `sections` | `few`, `many` | few: the sections of the application fit in the bar, five at most with short names; many: more than five, or names too long for the bar |
| `person` | `signed-in`, `guest` | signed-in: someone is signed in (a back office, always); guest: nobody is signed in yet (a public service before the sign-in) |

A region shows where its When holds, in this order: a required one always, the others when there is something to put in them.

| Region | When | Required | What | Use |
| --- | --- | --- | --- | --- |
| `product` | any | yes | the name of the application at the start of the bar, as text; a product may put its logo in its place (logo) | `mds-text typography=h6 tag=p` |
| `sections` | sections: few |  | the sections of the application as links, in the order of the work, the current one marked with current, or current=section on a page inside it (a record of its list); in the bar from the width of the desktop, in the menu under it | `mds-button slot=nav href variant=dark tone=text current` |
| `person` | person: signed-in |  | the last element of the bar: a button named after the person signed in, which opens their menu: their name, Profilo, then Esci after a separator | `mds-button slot=nav icon variant=dark tone=text`, `mds-dropdown`, `mds-separator` |
| `sign-in` | person: guest |  | the last element of the bar: Accedi, a link to the sign-in | `mds-button slot=nav href variant=dark tone=outline` |
| `menu` | any |  | the menu of the bar, opened by its button: the sections, the current one marked with current as in the bar, then after a separator the name of the person, Profilo and Esci, or Accedi, which keeps its outline; under the width of the desktop with few sections, at every width with many | `mds-header menu`, `mds-button href variant=dark tone=text current`, `mds-button href variant=dark tone=outline`, `mds-separator` |
| `main` | any | yes | the content of the page, under the bar: one main in the frame of the page, its header first (page-header), then its sections |  |

## Layout

- The bar is `mds-header` with one `mds-header-bar`, the first element of the page: a band that
  stays put at the top, in the flow, so the page starts under it (`surfaces/band`).
- In the bar: the name of the application at the start (the default slot of the bar), then in
  its `nav` slot the sections and, last, the button of the person or Accedi, with the gap the
  bar gives them.
- With few sections, `mds-header` keeps its defaults (`menu="mobile"`, `nav="desktop"`): from
  the width of a tablet (768 px) the sections and the person stand in the bar, and under 1024 px
  the button of the menu opens them too (Magma gaps). With many, `menu="all"`: the sections
  live only in the menu, at every width; the bar keeps the name and, from 768 px, the person,
  who is in the menu under it.
- The menu (`slot="menu"` of `mds-header`) is one column at its inset (`p-inset`): the sections
  as links as wide as the menu, aligned to the start, the current one marked, then an
  `mds-separator`, then the name of the person, Profilo and Esci, or Accedi; `gap-inline` (300)
  between the entries, as between the actions of a row, until the rhythm names a relation for
  a column of links. A long menu scrolls inside its panel.
- The main is `page-frame` (`widths/page`): the column the bar gives its own content, with
  `gap-between-sections` between its sections and as its padding at the top and the bottom
  (`py-between-sections`, `rhythm/between-sections`); its first section is the header of the
  page (`page-header`). Everything in it starts at the start edge of the frame, on the edge of
  the name of the application (`widths/start-edge`).

## Always true

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

These hold in every product: a product layer cannot change them.

| Id | Rule | Checked by |
| --- | --- | --- |
| `one-bar` | The application has one bar: mds-header with one mds-header-bar, first in the page; the page starts under it, with no room reserved by hand. | review |
| `sections-are-links` | The sections are links to their pages (mds-button with href), the current one marked with current, or current="section" on a page inside it; never a button that runs a script to change page, never aria-current or a tone set by hand. | review |
| `every-width` | Every section is reached at every width: in the bar from the width of the desktop, in the menu of the bar under it; never menu="none" on a bar with sections. | review |
| `person-named` | The button of the person is named after them ("Account di Mario Rossi") and their menu opens with their name: the person always sees who is signed in. | review |
| `one-main` | The content of a page is one main under the bar, in the frame of the page, its header first; the bar never holds the title or the actions of a page. | review |
| `not-the-app-bar` | The page header is the head of the main content, under the bar of the application; the navigation of the application is never in it. (from `page-header`) | review |
| `page` | `page-frame` on the page: at most 1280 px, centred in the window, a gutter of `600` outside it, the column the bar gives its own content; everything inside starts at the start edge of the frame, and a table or a list takes the whole frame (from `widths`) |  |
| `start-edge` | Capped content (text, forms) stands at the start edge of its frame, never centred inside it: the title, the text, the form and the table of a page start on the edge of the content of the bar. (from `widths`) | review |
| `band` | a band, a strip of surface as wide as the page, drawn by the component that stays put, which keeps its room: the bar of the application (mds-header-bar in mds-header, `surface-raised`, `shadow-md-sharp`, in the flow at the top and sticky, so the page starts under it), the actions of an edit (mds-status-bar, `surface-overlay`, `shadow-md`, its room kept at the end of the page); never the header of the page (`section`) made sticky (from `surfaces`) |  |
| `between-sections` | `gap-between-sections` (1600) between two sections of a page, each with its title (from `rhythm`) |  |

## Open choices

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

The default decides these; a product layer may narrow them.

| Id | Default | A product may |
| --- | --- | --- |
| `logo` | the name of the application, as text | put the logo of the product in its place, an mds-img with the name of the application as its alt |

## Situations

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

Situations every application has, each with the regions it shows: they give the examples, the texts and the keywords. The situations of a product's own domain go in its layer.

| Id | Situation | Regions |
| --- | --- | --- |
| `back-office` | A back office with four sections, an operator signed in | `product`, `sections`, `person`, `menu`, `main` |
| `many-sections` | An application with a dozen sections, an operator signed in | `product`, `person`, `menu`, `main` |
| `public-service` | A public service a citizen opens before signing in | `product`, `sections`, `sign-in`, `menu`, `main` |

## Accessibility

- `mds-header-bar` draws the `nav` landmark around its `nav` slot; the content of the page is
  the one `main` landmark.
- The current section is `current` on its `mds-button`, which writes `aria-current="page"` and
  keeps the role of link on its host: on the page of the section it does nothing when clicked,
  but stays in the Tab order, so the keyboard reaches where it is. On a page inside the section,
  a record of its list, it is `current="section"`: `aria-current="true"`, and still a link back
  to the list. Its look is not only a colour: the label is bold.
- The button of the person has an `aria-label` that names them, and opens its menu with
  `mds-dropdown`, a `menu` by default: the arrows walk its entries, Esc closes it and gives the
  focus back to the button.
- The menu of the bar opens in the `mds-modal` of `mds-header`, whose button Magma names
  ("Apri il menu" in Italian).

## Content

- The name of the application is what the people who use it call it ("Servizi demografici"),
  not the name of the company or of the product line.
- A section is the plural of what it holds ("Pratiche", "Contatti", "Scadenze"), in the order of
  the work, the most used first.
- The menu of the person: their name and surname, then "Profilo", then "Esci" after the
  separator. Nobody signed in: "Accedi".

## Magma gaps

- No side navigation: with many sections, the menu of the bar holds them at every width, and
  they are not in view beside the page.
- No link that skips the bar to the content: a screen reader jumps to the `main` landmark, a
  keyboard passes the sections first.
- The two breakpoints of `mds-header` do not meet: `nav="desktop"` shows the sections from
  768 px, `menu="mobile"` hides the button of the menu only from 1024 px, so between them the
  bar shows both; at 768 px five sections wrap the name of the application on two lines.
- `mds-dropdown` gives `role="menuitem"` to every child, the name of the person and the
  separator too, so the arrows stop on them, while its `mds-button href` entries keep
  `role="link"` and `tabindex="0"`, in the Tab order of a `menu`.

## Decisions

| Date | Decision | Why |
| --- | --- | --- |
| 2026-11-03 | The application shell is a block: the bar and the frame of the page come back in `list-with-filters`, `record-detail`, `empty-state` and `message-placement` | The round of the building blocks: every whole-page preview wrote them by hand, each a little differently; the docs site already names the app shell among the building blocks (`plan/DIRECTION.md`, Patterns section, Navigation). |
| 2026-11-03 | The sections are links with the current one marked, and they reach a phone through the menu of the bar | The previews had buttons with no address, no current section and `menu="none"`, which hides every section under the width of the desktop (`nav="desktop"` is the default of `mds-header`). |
| 2026-11-03 | The current section is `variant="dark" tone="weak"`, the others `tone="text"`, in the bar and in the menu | A filled shape, not only a colour: `primary text` (B) changed only the ink, and in the dark mode the accent is near the other sections (1.22:1), so the current one could not be seen. Neither reaches 3:1 against the bar: a Magma gap. The maintainer's choice A in the review of round 3. |
| 2026-11-05 | The current section is `current` on its `mds-button` (`current="section"` on a page inside it), which replaces `tone="weak"` and `aria-current` written by hand | The Magma gap closed by #1264: one look for every product, an area that weighs less than the hover of the tone (for `tone="text"` the wash of its hover, `wash-soft` on the bar) and a bold label, which marks the state where the area stays under 3:1. The section of the page on screen does nothing when clicked, so it never reloads the page; on a record it stays a link back to the list. The maintainer's choices on live renders. |
