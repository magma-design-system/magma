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
  The person balances a preset through a few stages in a fixed order, sees at every step where
  they are in it, and moves to the stage before or after it.
principle: >-
  The stages stand in order under the bar, the current one marked; each stage ends with the way
  back and the way forward, named after where they lead.
keywords: [stages, steps, order, flow, forward, back, next, previous, stepper, wizard]
not-for:
  - need: the sections of an application, reached from any page
    use: app-shell
  - need: the head of a page, its title and its actions
    use: page-header
assumptions:
  - The work goes through four stages and a full review, in this order, each a page with its address.
  - The person works on a wide desktop, with mouse and keyboard.
high-stakes: false
components: [mds-stepper-bar, mds-stepper-bar-item, mds-button]
related: [app-shell, page-header, confirm-action]
validated-on: []

variables:
  place: { values: [stage, side-page, outside], means: "stage: a stage of the flow; side-page: a page beside a stage, reached from it (Scale and Group beside Colours); outside: a view that is no stage (the introduction, the opening, the rules)" }
  position: { values: [first, middle, last], means: "where the stage stands in the order: the first (Colours), one between, the last (the full review)" }

cases:
  - id: on-a-stage
    place: stage
    position: [first, middle]
    where: "the stepper under the bar, the stage current by its position; after the content of the stage, a foot of two links: back to the view before it (from Colours, the opening), forward to the stage after it, the main one"
    use:
      - { role: "the stages in order, under the bar, the current one by its position", use: "mds-stepper-bar items-done=<the position of the stage, from 1>" }
      - { role: "a stage, its number above its name", use: "mds-stepper-bar-item step icon=<the icon of the stage> icon-checked=<done, mi/baseline/done> label=<the name of the stage>" }
      - { role: "the full review, last, with no number", use: "mds-stepper-bar-item icon=<the icon of the review> icon-checked=<done, mi/baseline/done> label=<Giro completo>" }
      - { role: "the way back, first, named after the view before", use: "mds-button href=<the view before> variant=dark tone=outline icon=<an arrow back, mi/baseline/arrow-back> label=<its number and name>" }
      - { role: "the way forward, last, the main action of the foot", use: "mds-button href=<the stage after> icon=<an arrow forward, mi/baseline/arrow-forward> icon-position=right label=<its number and name>" }
  - id: last-stage
    place: stage
    position: last
    where: "the stepper with the full review current, every stage before it done; the foot ends with the exit in place of the way forward: save on a command, download on the site, through the contrast gate"
    use:
      - { role: "the stages in order, the review current", use: "mds-stepper-bar items-done=<the number of the stages>" }
      - { role: "the way back, first, named after the stage before", use: "mds-button href=<the stage before> variant=dark tone=outline icon=<an arrow back, mi/baseline/arrow-back> label=<its number and name>" }
      - { role: "the exit, last, the action of the bar that saves or downloads the preset", use: "mds-button icon=<download, mi/baseline/file-download, or save> label=<Scarica il preset, or Salva il preset>" }
    see: confirm-action
  - id: side-page
    place: side-page
    where: "the stepper with the stage the page belongs to current; the head of the page opens with a link back to where the person came from, named after it; no foot: the way forward is the stage's"
    use:
      - { role: "the stages in order, the stage of the page current", use: "mds-stepper-bar items-done=<the position of its stage>" }
      - { role: "the way back to where the person came from, above the title", use: "mds-button href=<where they came from> icon=<an arrow back, mi/baseline/arrow-back> variant=dark tone=text size=sm label=<the family or the group, and its stage>" }
  - id: outside-the-flow
    place: outside
    where: "no stepper: the work has not started, or the page is no stage; the bar alone"
    see: app-shell
gaps: []
not-applicable: []

always-true:
  - id: stages-not-sections
    rule: "The stages are not sections of the bar: the bar holds the product, the work (the changes, save or download) and the preferences of the person, and the stages stand under it."
    checked-by: review
  - id: order-in-view
    rule: "On a stage and on a page beside it, the stages are in view in their order, one mds-stepper-bar under the bar: the current one marked, the ones before it done."
    checked-by: review
  - id: address-per-stage
    rule: "Every stage is a page with its address: a done stage of the stepper, the way back and the way forward open it as a link does, so the back and forward of the browser reach it too."
    checked-by: review
  - id: names-the-view
    rule: "The way back and the way forward name the view they open, its number and name (\"3. Temi\"), never \"Avanti\" or \"Indietro\" alone."
    checked-by: review
  - id: forward-is-main
    rule: "The way forward is the main action of the foot, last, in the strong tone; the way back comes first, outlined."
    checked-by: review
  - id: never-blocks
    rule: "Moving between stages never asks nor waits: the verification does not stop the way forward; only the exit asks, when the verification is red."
    checked-by: review
  - id: ahead-by-forward
    rule: "A stage after the current one is reached by the way forward, never from the stepper: the stepper opens only the stages done."
    checked-by: review

open-choices: []

situations:
  - { situation: "The person balances the weights, the second stage", case: on-a-stage }
  - { situation: "The person opens the colours, the first stage, from the opening", case: on-a-stage }
  - { situation: "The person judges every theme in every mode before taking the preset out", case: last-stage }
  - { situation: "The person opens the contrast scale of a family", case: side-page }
  - { situation: "The person reads what the studio is for, or chooses the preset to open", case: outside-the-flow }
---

# Stages in order

**The stages stand in order under the bar, the current one marked; each stage ends with the way
back and the way forward, named after where they lead.**

## When to use it

On every page of the studio that is a stage of the balancing (Colours, Weights, Themes,
Exceptions, the full review) or a page beside one (Scale and Group beside Colours). Not on the
introduction, the opening and the rules, which are no stage (`outside-the-flow`), and not for the
bar, which stays the one of `app-shell`.

## What decides it

Two questions: is the page a stage, a page beside one, or neither; and where the stage stands in
the order, the last one ending with the exit instead of a stage after it.

## Parts

- **The stepper**: `mds-stepper-bar` under the bar, in the frame of the page, one
  `mds-stepper-bar-item` per stage with its number (`step`), the full review last without one.
  `items-done` is the position of the stage shown: the stages before it are done, it is current.
- **The foot of a stage**: after its content, a `nav` named after the stages, the way back
  first (outlined), the way forward last (strong), each named after the view it opens.
- **The way back of a page beside a stage**: the `back` of `page-header`, named after the family
  or the group the person came from.

## Behaviour over time

A done stage of the stepper emits `mdsStepperBarItemDone`: the studio opens its address, as a
link would, and the stepper follows the address. The way back and the way forward are links.
Nothing waits and nothing asks between two stages; the exit asks through the contrast gate when
the verification is red (`confirm-action`).

## Accessibility

The done stages of the stepper are buttons in the order of Tab (Enter opens them); the current one
and the ones after it are not reachable from the stepper. The foot is a `nav` with its name, its
links named after the view they open.

## Content

The way back and forward say the number and the name of the view: "1. Colori", "3. Temi"; from
Colours the way back says "Partenza". The exit says what it does with the preset: "Scarica il
preset" on the site, "Salva il preset" on a command.

## Magma gaps

Magma has no pattern for the stages of a flow (`app-shell` makes every section a link from any
page). The studio keeps this one until a second product needs the same: then it is proposed to
Magma.

## Why

- The stages under the bar, not in it (2026-11-27): in the bar, at the desktop breakpoint, the
  name of the studio was squeezed before the rules, the Theme section and the menu were in; the
  stepper shows the order and the position at a glance and leaves the bar to the work.
- The badges of the stepper off (2026-11-27): "Completato" and "In coda" promise a state the
  stages do not have; done only means before the current one.
- The way forward only by the foot (2026-11-27): the studio balances in order (object model,
  section 1); a stage after the current one is never one click away in the stepper.

## Decisions

| Date | Decision | Why |
| --- | --- | --- |
| 2026-11-27 | The stepper under the bar (option B of the renders), four cases | The order and the position in view; the bar stays the work's (vittorio) |
