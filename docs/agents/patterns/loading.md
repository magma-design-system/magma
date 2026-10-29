---
# A Magma pattern: the format and the commands are in docs/PATTERNS.md.
id: loading
kind: pattern
title: Waiting for something
group: messages-and-states
layer: magma
status: decided
need: >-
  The person waits for content or for the end of an action, and must know that it is coming and
  whether they can do something else meanwhile.
principle: The wait shows where the person looked, keeps what is on screen, and always ends.
keywords: [loading, spinner, progress, please wait, busy, in progress, uploading, exporting, skeleton]
not-for:
  - need: where the outcome of the action is told
    use: message-placement
  - need: a load that ended with nothing to show
    use: empty-state
  - need: a load that failed
    use: error-recovery
assumptions:
  - The application knows before starting whether an operation is long and whether it can tell how far it is.
high-stakes: false
components: [mds-spinner, mds-progress, mds-button, mds-input, mds-text, mds-toast]
related: [message-placement, empty-state, error-recovery, list-with-filters, record-detail]
validated-on: []

variables:
  what: { values: [content, action], means: "content: data a part of the page shows; action: an operation the person started from a control" }
  on-screen: { values: [nothing, previous], means: "for content: is there something to keep while it loads (a reload, a new search)" }
  length: { values: [short, long], means: "long: an operation that can take more than 10 s, known before it starts (an export, an upload, many items, a report)" }
  measurable: { values: ["no", "yes"], means: "can the application tell how far it is (bytes sent, items done)" }
  needed: { values: ["yes", "no"], means: "does the person need the result before going on" }

cases:
  - { id: first-load, what: content, on-screen: nothing, length: short, where: "a skeleton with the shape of the content, in its place; until Magma has one, a spinner in the middle of the part; aria-busy on the part", use: ["mds-spinner"], magma-gap: "no skeleton" }
  - { id: keep-while-reloading, what: content, on-screen: previous, length: short, where: "what was there stays; the region has aria-busy; the control that started it waits; a newer request cancels the older", use: ["mds-input await"] }
  - { id: long-load, what: content, length: long, measurable: "no", where: "the indicator of the short case, with a sentence that says what is happening", use: ["mds-text"] }
  - { id: long-load-measured, what: content, length: long, measurable: "yes", where: "a progress bar in the region, with a sentence that says what is happening", use: ["mds-progress steps"] }
  - { id: await-the-control, what: action, length: short, where: "the control that started it waits: its spinner, no second press, aria-busy, the focus stays on it", use: ["mds-button await"] }
  - { id: progress-in-place, what: action, length: long, measurable: "yes", needed: "yes", where: "a progress bar next to the control, with a sentence that says what is happening", use: ["mds-progress steps", "mds-button await"] }
  - { id: await-and-say, what: action, length: long, measurable: "no", needed: "yes", where: "the control waits, and a sentence next to it says what is happening", use: ["mds-button await", "mds-text"] }
  - { id: run-in-background, what: action, length: long, needed: "no", where: "the control stops waiting at once and a toast says it started; the outcome comes later, as action-later", use: ["mds-toast"], see: message-placement }
gaps: []
not-applicable: []

always-true:
  - id: no-flash-empty
    rule: A reload never empties what is on screen.
    checked-by: review
  - id: control-waits
    rule: The control that started an action shows the wait and cannot be pressed again.
    checked-by: review
    note: a double payment is what it prevents
  - id: busy-region
    rule: "The region being updated has aria-busy: mds-spinner has no role and leaves it to the context."
    checked-by: review
  - id: newest-wins
    rule: An older answer never replaces a newer one.
    checked-by: review
  - id: always-ends
    rule: A wait ends in content, an empty state or an error.
    checked-by: review
  - id: long-says-what
    rule: A long wait says what is happening, not only an icon that turns.
    checked-by: review
  - id: cancel-only-if-it-stops
    rule: Cancel is offered only when it stops the operation; it never only hides the wait.
    checked-by: review

situations:
  - { situation: A list opens for the first time, case: first-load }
  - { situation: A search narrows a list already on screen, case: keep-while-reloading }
  - { situation: "A report takes a minute to compute, with no measure of how far it is", case: long-load }
  - { situation: A dashboard loads twelve widgets and counts them, case: long-load-measured }
  - { situation: A form is saved, case: await-the-control }
  - { situation: A file is uploaded and the form needs it, case: progress-in-place, note: with Cancel }
  - { situation: A payment is sent and its answer is slow, case: await-and-say, note: without Cancel }
  - { situation: An export of ten thousand rows is asked for, case: run-in-background }
---

# Waiting for something

**The wait shows where the person looked, keeps what is on screen, and always ends.**

## When to use it

Every wait the person sees: the first load of a part of the page, a reload of what is on
screen (a new search, a new page of results), an action started from a control (save, send,
delete), a long operation (an upload, an export, a report). Not the outcome of the wait: it is
told by `message-placement`, and it may be an empty state (`empty-state`) or an error
(`error-recovery`).

## What decides it

Five questions: whether the person waits for content or for an action, whether something is
already on screen to keep, whether the wait is short or long, whether the application can tell
how far it is, and whether the person needs the result before going on.

## Cases

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

| Variable | Values | Means |
| --- | --- | --- |
| `what` | `content`, `action` | content: data a part of the page shows; action: an operation the person started from a control |
| `on-screen` | `nothing`, `previous` | for content: is there something to keep while it loads (a reload, a new search) |
| `length` | `short`, `long` | long: an operation that can take more than 10 s, known before it starts (an export, an upload, many items, a report) |
| `measurable` | `no`, `yes` | can the application tell how far it is (bytes sent, items done) |
| `needed` | `yes`, `no` | does the person need the result before going on |

A case that leaves a variable out holds for any of its values.

| Case | When | Where | Use |
| --- | --- | --- | --- |
| `first-load` | what: content; on-screen: nothing; length: short | a skeleton with the shape of the content, in its place; until Magma has one, a spinner in the middle of the part; aria-busy on the part; Magma gap: no skeleton | `mds-spinner` |
| `keep-while-reloading` | what: content; on-screen: previous; length: short | what was there stays; the region has aria-busy; the control that started it waits; a newer request cancels the older | `mds-input await` |
| `long-load` | what: content; length: long; measurable: no | the indicator of the short case, with a sentence that says what is happening | `mds-text` |
| `long-load-measured` | what: content; length: long; measurable: yes | a progress bar in the region, with a sentence that says what is happening | `mds-progress steps` |
| `await-the-control` | what: action; length: short | the control that started it waits: its spinner, no second press, aria-busy, the focus stays on it | `mds-button await` |
| `progress-in-place` | what: action; length: long; measurable: yes; needed: yes | a progress bar next to the control, with a sentence that says what is happening | `mds-progress steps`, `mds-button await` |
| `await-and-say` | what: action; length: long; measurable: no; needed: yes | the control waits, and a sentence next to it says what is happening | `mds-button await`, `mds-text` |
| `run-in-background` | what: action; length: long; needed: no | the control stops waiting at once and a toast says it started; the outcome comes later, as action-later; see `message-placement` | `mds-toast` |

No gaps: every combination has a case or is not applicable.

## Parts

- The first load of a part: a skeleton with the shape of the content (rows of a list, the
  blocks of a detail), so the layout does not jump when the data comes; until Magma has one,
  `mds-spinner` in the middle of the part.
- A reload: the content stays, the region has `aria-busy="true"`, the control that started it
  waits (`await` on `mds-input` shows the spinner in the search field).
- An action: `await` on `mds-button`, which shows its spinner, refuses a second press, sets
  `aria-busy` and keeps the focus.
- A long wait: a sentence that says what is happening ("Preparing the PDF..."), next to the
  indicator; `mds-progress` when the application can tell how far it is, with `steps` in the
  language of the page.
- A long action the person does not need to wait for: a toast that says it started, then the
  outcome as `action-later` of `message-placement`.

## Behaviour over time

- A newer request cancels the one still running: an older, slower answer never replaces a
  newer one (`list-with-filters`).
- The wait ends in content, in an empty state or in an error, never in an indicator that runs
  for ever.
- A long wait the person needs has Cancel next to it when the operation can be stopped without
  harm: it stops, and the message says what was done and what was not (`message-placement`,
  partial outcome). An operation that cannot be called back, a payment already sent, offers
  none.

## Always true

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

These hold in every product: a product layer cannot change them.

| Id | Rule | Checked by |
| --- | --- | --- |
| `no-flash-empty` | A reload never empties what is on screen. | review |
| `control-waits` | The control that started an action shows the wait and cannot be pressed again. | review; a double payment is what it prevents |
| `busy-region` | The region being updated has aria-busy: mds-spinner has no role and leaves it to the context. | review |
| `newest-wins` | An older answer never replaces a newer one. | review |
| `always-ends` | A wait ends in content, an empty state or an error. | review |
| `long-says-what` | A long wait says what is happening, not only an icon that turns. | review |
| `cancel-only-if-it-stops` | Cancel is offered only when it stops the operation; it never only hides the wait. | review |

## Situations

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

Situations every application has, each with its case: they give the examples, the texts and the keywords. The situations of a product's own domain go in its layer.

| Situation | Case |
| --- | --- |
| A list opens for the first time | `first-load` |
| A search narrows a list already on screen | `keep-while-reloading` |
| A report takes a minute to compute, with no measure of how far it is | `long-load` |
| A dashboard loads twelve widgets and counts them | `long-load-measured` |
| A form is saved | `await-the-control` |
| A file is uploaded and the form needs it | `progress-in-place`: with Cancel |
| A payment is sent and its answer is slow | `await-and-say`: without Cancel |
| An export of ten thousand rows is asked for | `run-in-background` |

## Accessibility

- `aria-busy` on the region tells assistive technologies that it is being updated; the result
  is read out by the status region of `message-placement`, or the summary of the results.
- The spinner is decorative; with reduced motion it slows down and never stops (`mds-spinner`).
- `mds-progress` reads out the step reached, not a raw number.

## Content

- A long wait says what is happening, in the words of the person: "Preparing the PDF...", not
  "Processing request".

## Magma gaps

- No skeleton, neither a component nor a utility: an issue to open; until then, the spinner.
- `mds-progress`: the default `steps` are in Italian (`Inizio,Un quarto,...`) whatever the
  language of the page.

## Decisions

| Date | Decision | Why |
| --- | --- | --- |
| 2026-10-16 | Proposed: a skeleton for the first load of a region, `await` on the control that started an action, the results stay while the next ones load | Open decision of the docs site, `agents/patterns.md`. |
| 2026-10-28 | Draft with variables; the first load, when a wait is long, and Cancel left as gaps | The sources do not settle them. |
| 2026-10-28 | The first load shows a skeleton with the shape of the content; a spinner until Magma has one (`first-load`) | The layout does not jump when the data comes; the open decision of the docs site. |
| 2026-10-28 | A wait is long when the operation can take more than 10 s, known before it starts | The application picks the form of the wait before starting; 10 s is the limit of attention (Nielsen). |
| 2026-10-28 | Cancel next to a long wait the person needs, only when the operation can be stopped | A Cancel that only hides the wait lies about what happens. |
