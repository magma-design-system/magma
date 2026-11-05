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
keywords: [application shell, app shell, application bar, top bar, navigation bar, main navigation, sections of the application, menu, hamburger, account menu, sign in, sign out, frame of the page, section menu, dropdown menu, submenu, pages of a section]
not-for:
  - need: the head of the content of a page, its title and its actions
    use: page-header
assumptions:
  - Each page of the application has an address; a section is one page, or a few pages of one subject that it opens from its menu.
  - The application knows who is signed in, or that nobody is.
high-stakes: false
components: [mds-header, mds-header-bar, mds-text, mds-button, mds-dropdown, mds-separator]
used-by: [list-with-filters, record-detail, empty-state, message-placement]
related: [page-header, list-with-filters, record-detail, empty-state, message-placement]
validated-on: []

variables:
  sections: { values: [few, many], means: "few: the sections of the application fit in the bar, five at most with short names; many: more than five, or names too long for the bar" }
  person: { values: [signed-in, guest], means: "signed-in: someone is signed in (a back office, always); guest: nobody is signed in yet (a public service before the sign-in)" }
  section-pages: { values: [one, several], means: "one: every section is one page, a link; several: one section or more hold several pages of one subject, which the section opens from a menu" }

regions:
  - { id: product, required: true, what: "the name of the application at the start of the bar, as text; a product may put its logo in its place (logo)", use: ["mds-text typography=h6 tag=p"] }
  - { id: sections, when: { sections: few }, what: "the sections of the application in the order of the work, each a link to its page or, with several pages, the button of its menu (section-menus), the current one marked: aria-current=page and a look of its own; in the bar from the width of the desktop, in the menu under it", use: ["mds-button slot=nav href variant=dark tone=text"] }
  - { id: section-menus, when: { sections: few, section-pages: several }, what: "a section with several pages: in the bar, a button named after the section with an arrow at its end, which only opens the panel of its pages, right after it: the pages as links in the order of the work, the main page of the section first, the current one marked; the button of the section that holds the current page is marked too, aria-current=true and the look of the current section", use: ["mds-button slot=nav icon=mi/baseline/expand-more icon-position=right variant=dark tone=text", "mds-dropdown slot=nav role=group placement=bottom-start strategy=fixed", "mds-button href variant=dark tone=text"] }
  - { id: person, when: { person: signed-in }, what: "the last element of the bar: a button named after the person signed in, which opens their menu: their name, Profilo, then Esci after a separator", use: ["mds-button slot=nav icon variant=dark tone=text", "mds-dropdown", "mds-separator"] }
  - { id: sign-in, when: { person: guest }, what: "the last element of the bar: Accedi, a link to the sign-in", use: ["mds-button slot=nav href variant=dark tone=outline"] }
  - { id: menu, what: "the menu of the bar, opened by its button: the sections, the current one marked, a section with several pages as a group of its pages under its name, a separator before and after it; then after a separator the name of the person, Profilo and Esci, or Accedi, which keeps its outline; under the width of the desktop with few sections, at every width with many", use: ["mds-header menu", "mds-button href variant=dark tone=text", "mds-button href variant=dark tone=outline", "mds-text typography=detail tag=p", "mds-separator"] }
  - { id: main, required: true, what: "the content of the page, under the bar: one main in the frame of the page, its header first (page-header), then its sections" }

always-true:
  - id: one-bar
    rule: "The application has one bar: mds-header with one mds-header-bar, first in the page; the page starts under it, with no room reserved by hand."
    checked-by: review
  - id: sections-are-links
    rule: "The sections are links to their pages (mds-button with href), the current one marked with aria-current=\"page\"; a section with several pages opens a menu of links instead (link-or-menu); never a button that runs a script to change page."
    checked-by: review
  - id: link-or-menu
    rule: "A section is a link to its page or the button of a menu of its pages, never both: the button only opens the menu and carries an arrow at its end (icon-position=\"right\"), and the main page of the section is the first entry of the menu."
    checked-by: review
  - id: current-in-menu
    rule: "The section that holds the current page is marked on its button, aria-current=\"true\" and the look of the current section, and the page in its menu with aria-current=\"page\": the bar says where the person is with the menu closed."
    checked-by: review
  - id: menu-of-links
    rule: "The menu of a section is navigation, not a menu of actions: mds-dropdown with role=\"group\", right after the button of the section in the nav slot, its pages links in the order of Tab; never the default role=\"menu\", which belongs to the menu of the person."
    checked-by: review
  - id: every-width
    rule: "Every section and every page of a section is reached at every width: in the bar from the width of the desktop, in the menu of the bar under it, the pages of a section under its name; never menu=\"none\" on a bar with sections."
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
  - { id: back-office, situation: "A back office with four sections, an operator signed in", sections: few, person: signed-in, section-pages: one }
  - { id: many-sections, situation: "An application with a dozen sections, an operator signed in", sections: many, person: signed-in, section-pages: one }
  - { id: public-service, situation: "A public service a citizen opens before signing in", sections: few, person: guest, section-pages: one }
  - { id: section-menus, situation: "A back office with four sections, two of them with several pages, an operator signed in", sections: few, person: signed-in, section-pages: several }
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

Three questions: whether the sections fit in the bar (then they stand in it on a wide screen and
in its menu on a narrow one), whether someone is signed in (then the bar ends with their
menu, otherwise with Accedi), and whether a section holds several pages of one subject (then
it opens them from a menu, and the menu of the bar lists them under its name).

## Regions

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

| Variable | Values | Means |
| --- | --- | --- |
| `sections` | `few`, `many` | few: the sections of the application fit in the bar, five at most with short names; many: more than five, or names too long for the bar |
| `person` | `signed-in`, `guest` | signed-in: someone is signed in (a back office, always); guest: nobody is signed in yet (a public service before the sign-in) |
| `section-pages` | `one`, `several` | one: every section is one page, a link; several: one section or more hold several pages of one subject, which the section opens from a menu |

A region shows where its When holds, in this order: a required one always, the others when there is something to put in them.

| Region | When | Required | What | Use |
| --- | --- | --- | --- | --- |
| `product` | any | yes | the name of the application at the start of the bar, as text; a product may put its logo in its place (logo) | `mds-text typography=h6 tag=p` |
| `sections` | sections: few |  | the sections of the application in the order of the work, each a link to its page or, with several pages, the button of its menu (section-menus), the current one marked: aria-current=page and a look of its own; in the bar from the width of the desktop, in the menu under it | `mds-button slot=nav href variant=dark tone=text` |
| `section-menus` | sections: few; section-pages: several |  | a section with several pages: in the bar, a button named after the section with an arrow at its end, which only opens the panel of its pages, right after it: the pages as links in the order of the work, the main page of the section first, the current one marked; the button of the section that holds the current page is marked too, aria-current=true and the look of the current section | `mds-button slot=nav icon=mi/baseline/expand-more icon-position=right variant=dark tone=text`, `mds-dropdown slot=nav role=group placement=bottom-start strategy=fixed`, `mds-button href variant=dark tone=text` |
| `person` | person: signed-in |  | the last element of the bar: a button named after the person signed in, which opens their menu: their name, Profilo, then Esci after a separator | `mds-button slot=nav icon variant=dark tone=text`, `mds-dropdown`, `mds-separator` |
| `sign-in` | person: guest |  | the last element of the bar: Accedi, a link to the sign-in | `mds-button slot=nav href variant=dark tone=outline` |
| `menu` | any |  | the menu of the bar, opened by its button: the sections, the current one marked, a section with several pages as a group of its pages under its name, a separator before and after it; then after a separator the name of the person, Profilo and Esci, or Accedi, which keeps its outline; under the width of the desktop with few sections, at every width with many | `mds-header menu`, `mds-button href variant=dark tone=text`, `mds-button href variant=dark tone=outline`, `mds-text typography=detail tag=p`, `mds-separator` |
| `main` | any | yes | the content of the page, under the bar: one main in the frame of the page, its header first (page-header), then its sections |  |

## Layout

- The bar is `mds-header` with one `mds-header-bar`, the first element of the page: a band that
  stays put at the top, in the flow, so the page starts under it (`surfaces/band`).
- In the bar: the name of the application at the start (the default slot of the bar), then in
  its `nav` slot the sections and, last, the button of the person or Accedi, with the gap the
  bar gives them.
- A section with several pages (`section-pages: several`) is an `mds-button` with no `href`,
  named after the section, `icon="mi/baseline/expand-more" icon-position="right"`, in the tone
  of the other sections; right after it in the `nav` slot, its `mds-dropdown` (`role="group"`,
  `placement="bottom-start"`, `strategy="fixed"`) opens under it: one column of links
  (`grid gap-inline`), as wide as the panel and aligned to the start (`w-full justify-start`),
  the main page of the section first, the current one marked. The bar mixes links and menus in
  the order of the work; the panel sits in the `nav` slot, so it goes with the sections under
  the width of a tablet, where the menu of the bar holds the pages.
- With few sections, `mds-header` keeps its defaults (`menu="mobile"`, `nav="desktop"`): from
  the width of a tablet (768 px) the sections and the person stand in the bar, and under 1024 px
  the button of the menu opens them too (Magma gaps). With many, `menu="all"`: the sections
  live only in the menu, at every width; the bar keeps the name and, from 768 px, the person,
  who is in the menu under it.
- The menu (`slot="menu"` of `mds-header`) is one column at its inset (`p-inset`): the sections
  as links as wide as the menu, aligned to the start, the current one marked, then an
  `mds-separator`, then the name of the person, Profilo and Esci, or Accedi; `gap-inline` (300)
  between the entries, as between the actions of a row, until the rhythm names a relation for
  a column of links. A section with several pages is a group in it (`grid gap-inline`,
  `role="group"`): its name first, `mds-text typography="detail"` in `text-fg-muted` as the
  name of the person, then its pages, the current one marked; an `mds-separator` before and
  after the group. A long menu scrolls inside its panel.
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
| `sections-are-links` | The sections are links to their pages (mds-button with href), the current one marked with aria-current="page"; a section with several pages opens a menu of links instead (link-or-menu); never a button that runs a script to change page. | review |
| `link-or-menu` | A section is a link to its page or the button of a menu of its pages, never both: the button only opens the menu and carries an arrow at its end (icon-position="right"), and the main page of the section is the first entry of the menu. | review |
| `current-in-menu` | The section that holds the current page is marked on its button, aria-current="true" and the look of the current section, and the page in its menu with aria-current="page": the bar says where the person is with the menu closed. | review |
| `menu-of-links` | The menu of a section is navigation, not a menu of actions: mds-dropdown with role="group", right after the button of the section in the nav slot, its pages links in the order of Tab; never the default role="menu", which belongs to the menu of the person. | review |
| `every-width` | Every section and every page of a section is reached at every width: in the bar from the width of the desktop, in the menu of the bar under it, the pages of a section under its name; never menu="none" on a bar with sections. | review |
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
| `section-menus` | A back office with four sections, two of them with several pages, an operator signed in | `product`, `sections`, `section-menus`, `person`, `menu`, `main` |

## Accessibility

- `mds-header-bar` draws the `nav` landmark around its `nav` slot; the content of the page is
  the one `main` landmark.
- The current section carries `aria-current="page"` on its `mds-button`, which keeps the role
  of link on its host; its look is not the only sign of it.
- The button of the person has an `aria-label` that names them, and opens its menu with
  `mds-dropdown`, a `menu` by default: the arrows walk its entries, Esc closes it and gives the
  focus back to the button.
- The menu of a section is the disclosure navigation of the WAI-ARIA APG (a button that shows a
  list of links), not a `menu`, whose arrows and `menuitem` entries are for actions: with
  `role="group"`, `mds-dropdown` leaves the pages their role of link and writes `aria-expanded`
  and `aria-controls` on the button of the section, which names the panel (`aria-labelledby`).
  Enter opens the panel and leaves the focus on the button, Tab walks the pages, since the panel
  comes right after the button, and Esc closes it and gives the focus back to the button.
- The button of the section that holds the current page carries `aria-current="true"`, not
  `"page"`: it is not the page; the page in its menu carries `aria-current="page"`.
- In the menu of the bar, a section with several pages is a `role="group"` named by its name
  (`aria-labelledby`).
- The menu of the bar opens in the `mds-modal` of `mds-header`, whose button Magma names
  ("Apri il menu" in Italian).

## Content

- The name of the application is what the people who use it call it ("Servizi demografici"),
  not the name of the company or of the product line.
- A section is the plural of what it holds ("Pratiche", "Contatti", "Scadenze"), in the order of
  the work, the most used first.
- A section with several pages is named after their subject ("Anagrafe", "Stato civile"), each
  page after what it holds ("Residenti", "Famiglie", "Cambi di residenza"), the main one first.
- The menu of the person: their name and surname, then "Profilo", then "Esci" after the
  separator. Nobody signed in: "Accedi".

## Magma gaps

- `mds-button` has no state for the current section of a bar: `active` is the pressed look, which
  the button clears when the pointer is released. The look of the current section is a decision
  of the round of the building blocks, written with the props Magma has: `tone="weak"`, a filled shape, which still stands at 1.45:1 against the bar in the light mode and 2.48:1 in the dark, under the 3:1 of a state.
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
- `mds-dropdown` leaves a panel that is not a `menu` open when the focus leaves it by Tab: the
  menu of a section closes with Esc, a click outside it or the opening of another menu of the
  bar, so a keyboard can pass the next sections with the panel still open.

## Decisions

| Date | Decision | Why |
| --- | --- | --- |
| 2026-11-03 | The application shell is a block: the bar and the frame of the page come back in `list-with-filters`, `record-detail`, `empty-state` and `message-placement` | The round of the building blocks: every whole-page preview wrote them by hand, each a little differently; the docs site already names the app shell among the building blocks (`plan/DIRECTION.md`, Patterns section, Navigation). |
| 2026-11-03 | The sections are links with the current one marked, and they reach a phone through the menu of the bar | The previews had buttons with no address, no current section and `menu="none"`, which hides every section under the width of the desktop (`nav="desktop"` is the default of `mds-header`). |
| 2026-11-03 | The current section is `variant="dark" tone="weak"`, the others `tone="text"`, in the bar and in the menu | A filled shape, not only a colour: `primary text` (B) changed only the ink, and in the dark mode the accent is near the other sections (1.22:1), so the current one could not be seen. Neither reaches 3:1 against the bar: a Magma gap. The maintainer's choice A in the review of round 3. |
| 2026-11-05 | A section with several pages opens them from a menu (`section-pages: several`): a button with an arrow at its end that only opens it, an `mds-dropdown role="group"` right after it, the section marked on its button and the page in the menu; the menu of the bar holds every page under the name of its section; a section is a link or a menu, never both | The studio of Magma (#695, PR #1255) is the first application whose sections hold several pages. The maintainer chose from live renders of one back office: every page under its section in the menu of the bar (A), one tap away, over sections that open inside the menu with `mds-details` (B, two taps); a section that only opens its menu, its main page first (A), over a link with an arrow beside it (B: two small targets side by side, and `mds-button-dropdown`, the split button of Magma, has no `tone="text"`). `role="group"` and not `menu`: the menu of a section is the navigation of a site, which the WAI-ARIA APG writes as a disclosure of links (Disclosure Navigation Menu); Enter, Tab and Esc verified on Magma 2.11.0. |
