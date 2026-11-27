---
# A pattern of the studio, not of Magma: Magma has no pattern for the stages of a flow in a fixed
# order (studio.object-model.md, section 8, "Passi in ordine"), and the person decided that the
# product decides. The shape is Magma's (docs/PATTERNS.md); the MCP server of Magma reads it from
# this folder (get_pattern, layerDir) and checks it (layerErrors). Proposed to Magma once a second
# product needs it.
id: stages-in-order
kind: pattern
title: Stages in order
group: navigation
layer: studio
status: decided
need: >-
  The person balances a preset through a few stages in a fixed order and comes back to them over
  time, going back and forth: sees at every step which stage is open and where it stands in the
  order, and opens any stage in one click.
principle: >-
  The stages are a strip of links under the bar, in their order, the open one selected, right
  above the stage; the address holds the stage.
keywords: [stages, steps, order, flow, tabs, strip, links, navigation, stepper, wizard]
not-for:
  - need: the sections of an application, reached from any page
    use: app-shell
  - need: the head of a page, its title and its actions
    use: page-header
assumptions:
  - The work goes through four stages and a full review, in this order, each a page with its address.
  - The person comes back to the stages over time, in any order, after the first round.
  - The person works on a wide desktop, with mouse and keyboard; a narrow window is possible.
high-stakes: false
components: [mds-tab, mds-tab-item, mds-button]
related: [app-shell, page-header, record-detail]
validated-on: []

variables:
  place: { values: [stage, side-page, outside], means: "stage: a stage of the flow; side-page: a page beside a stage, reached from it (Scale beside Colours); outside: a view that is no stage (the introduction, the opening, Groups, the Theme section, the rules)" }

cases:
  - id: on-a-stage
    place: stage
    where: "the strip of the stages under the bar, in a nav named after them (Passi), aligned with the title of the page, right above the stage: one link per stage in their order, the stage of the page selected; the page opens with its own title; no foot"
    use:
      - { role: "the strip, its items all links, so a navigation and not a tablist", use: "mds-tab overflow" }
      - { role: "a stage, its icon before its name, no number", use: "mds-tab-item href=<the address of the stage> icon=<the icon of the stage> label=<its name, Pesi>" }
      - { role: "the stage of the page, announced as the current one", use: "mds-tab-item selected" }
  - id: side-page
    place: side-page
    where: "the strip with the stage the page belongs to selected; the head of the page opens with a link back to where the person came from, named after it"
    use:
      - { role: "the stages in order, the stage of the page selected", use: "mds-tab overflow" }
      - { role: "the way back to where the person came from, above the title", use: "mds-button href=<where they came from> icon=<an arrow back, mi/baseline/arrow-back> variant=dark tone=text size=sm label=<the family or the group, and its stage>" }
  - id: outside-the-flow
    place: outside
    where: "no strip: the work has not started, or the page is no stage; the bar alone"
    see: app-shell
gaps: []
not-applicable: []

always-true:
  - id: stages-not-sections
    rule: "The stages are not sections of the bar: the bar holds the product, the work (the changes, save or download) and the preferences of the person, and the strip of the stages stands under it."
    checked-by: review
  - id: order-in-view
    rule: "On a stage and on a page beside it, the stages are in view in their order, one strip under the bar, the open stage selected."
    checked-by: review
  - id: right-above-the-stage
    rule: "The strip stands right above the stage it opens, aligned with the title of the page: nothing between them; the notices of the preset go above the strip."
    checked-by: review
  - id: address-per-stage
    rule: "Every stage is a page with its address, and every item of the strip a link to it (href), so the back and forward of the browser reach it, and a link opens it in a new tab."
    checked-by: review
  - id: every-stage-one-click
    rule: "Every stage is one click away from the strip, the ones after the open one too: the order is shown by the place in the strip, never imposed by locking a stage."
    checked-by: review
  - id: no-status-per-stage
    rule: "An item of the strip says the name of its stage, never a status (done, changed, to do): the strip shows which stage is open, not how far the work is."
    checked-by: review
  - id: no-foot
    rule: "No stage ends with a way back and a way forward: the strip opens every stage, and the exit, saving or downloading the preset, is the bar's."
    checked-by: review

open-choices: []

situations:
  - { situation: "The person balances the weights, the second stage", case: on-a-stage }
  - { situation: "The person opens the colours, the first stage, from the opening", case: on-a-stage }
  - { situation: "The person goes back to the colours after the full review", case: on-a-stage }
  - { situation: "The person judges every theme in every mode before taking the preset out", case: on-a-stage }
  - { situation: "The person opens the contrast scale of a family", case: side-page }
  - { situation: "The person reads what the studio is for, or chooses the preset to open", case: outside-the-flow }
---

# Stages in order

**The stages are a strip of links under the bar, in their order, the open one selected, right
above the stage; the address holds the stage.**

## When to use it

On every page of the studio that is a stage of the balancing (Colours, Weights, Themes,
Exceptions, the full review) or a page beside one (Scale beside Colours). Not on the
introduction, the opening, Groups, the Theme section and the rules, which are no stage
(`outside-the-flow`), and not for the bar, which stays the one of `app-shell`.

## What decides it

One question: is the page a stage, a page beside one, or neither.

## Parts

- **The strip**: under the bar and the notices of the preset, in the frame of the page, a `nav`
  named after the stages around one `mds-tab` with `overflow`, one `mds-tab-item` per stage with
  `href`. Its start lines up with the title of the page, the gutter of the page at its side.
- **An item**: the icon and the name of the stage ("Pesi"), the icon the one the introduction and
  the changes of the bar show for it; no number, no status. The stage of the page, or the stage a
  page beside one belongs to, is `selected`.
- **The way back of a page beside a stage**: the `back` of `page-header`, named after the family
  or the group the person came from.

## Behaviour over time

Every item is a link: a click opens the address of its stage, as any link does, and the strip
follows the address, the item of the stage shown selected. The back and forward of the browser
move between the stages; a modifier click opens a stage in a new tab and leaves the strip as it
is. Nothing waits and nothing asks between two stages; the exit asks through the contrast gate
when the verification is red (`confirm-action`), from the bar.

On a narrow window the strip keeps one row and scrolls, the selected stage in view, a shadow at
the edge where more stages are (`overflow`). A select in its place on a narrow container waits
for `mds-tab` (#1593, `narrow="select"`).

## Accessibility

Every item has `href`, so `mds-tab` drops the `tablist` role: the items are links in the order
of Tab, the selected one announced as the current one (`aria-current`). The strip is named by the
`nav` around it ("Passi").

## Content

An item says the name of the stage after its icon: "Colori", "Pesi", "Temi", "Eccezioni", "Giro
completo"; no number, the order is the place in the strip. The page of the stage opens with its
own title, the name of the stage.

## Magma gaps

Magma has no pattern for the stages of a flow (`app-shell` makes every section a link from any
page). The studio keeps this one until a second product needs the same: then it is proposed to
Magma. A status per stage (done, changed, to do), if a product needs it, is a task list: the
stages in a column with their status, the open stage beside them; Magma has none.

## Why

- The stages under the bar, not in it (2026-11-27): in the bar, at the desktop breakpoint, the
  name of the studio was squeezed before the rules, the Theme section and the menu were in; the
  strip shows the order and the position at a glance and leaves the bar to the work.
- A strip of links, not a stepper (2026-11-27, #1595): a stepper is a wizard, a task done once in
  a fixed order, 3 to 6 steps; the studio is a tool the person comes back to, moving back and
  forth between its stages, as between the parts of a record (`record-detail`: the parts in
  `mds-tab`, the address holding the part). The research of epic #1579 found no published design
  system that offers a stepper as the navigation of a tool used over time.
- No status per stage (2026-11-27, #1595): the person chose the strip (render A) over a task list
  with a status per stage (render B).
- No foot (2026-11-27, #1595): with every stage one click away in the strip, the way back and the
  way forward at the end of a stage repeated it, and the exit is in the bar.
- Icons, not numbers (2026-11-27, #1595): the person asked for an icon on each tab in place of
  its number; all the items take one form, icon and name, and the order stays the place.

## Decisions

| Date | Decision | Why |
| --- | --- | --- |
| 2026-11-27 | The stepper under the bar (option B of the renders), four cases | The order and the position in view; the bar stays the work's (vittorio) |
| 2026-11-27 | A strip of `mds-tab-item href` in place of the stepper, under the bar, right above the stage; no status per stage, no foot; three cases (#1595) | A stepper is a wizard; the stages of a tool used over time are tabs, as the parts of a record (epic #1579; vittorio, render A over B, the foot dropped) |
| 2026-11-27 | Each item the icon and the name of its stage, no number (#1595) | vittorio: icons in place of the numbers |
