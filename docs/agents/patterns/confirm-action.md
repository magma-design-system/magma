---
# A Magma pattern: the format and the commands are in docs/PATTERNS.md.
id: confirm-action
kind: pattern
title: Confirm an action
group: messages-and-states
layer: magma
status: decided
need: >-
  The person is about to do something that cannot be taken back, and must decide knowing what
  will happen.
principle: An action that cannot be taken back asks first, naming the item and the consequence.
keywords: [confirm, are you sure, delete, remove, undo, cannot be undone, irreversible, permanently]
not-for:
  - need: where the outcome of the action is told
    use: message-placement
  - need: payments, signatures and consent
    use: consent-and-legal
assumptions:
  - The action starts from a control the person chose (a button, a menu item).
high-stakes: true
components: [mds-modal, mds-button, mds-banner, mds-toast]
related: [message-placement, error-recovery, notification-center]
validated-on: []

variables:
  reversible: { values: ["yes", "no"], means: "can the person undo it afterwards" }
  reaches-others: { values: ["no", "yes"], means: "does it send something to other people or systems, which cannot be called back" }
  items: { values: [one, many], means: "how many items the action acts on" }
  frequency: { values: [occasional, frequent], means: "how often the same person does it in a working day" }
  stakes: { values: [normal, legal], means: "legal: money, a signature or consent, which have rules of their own" }
  preview: { values: [seen, unseen], means: "does the person see what goes and to whom when acting" }

cases:
  - { id: act-then-undo, reversible: "yes", reaches-others: "no", stakes: normal, where: "act at once, then a toast with Undo, which stays until closed", use: ["mds-toast variant=success duration=0 dismissible", "mds-button slot=action"] }
  - { id: ask-first, reversible: "no", reaches-others: "no", items: one, frequency: occasional, stakes: normal, where: "a dialog before acting: the question names the item, the text says the consequence", use: ["mds-modal"] }
  - { id: make-reversible, reversible: "no", reaches-others: "no", items: one, frequency: frequent, stakes: normal, where: "make it reversible: act at once, then a toast with Undo; the item is kept for a while to restore it", use: ["mds-toast variant=success duration=0 dismissible", "mds-button slot=action"], see: act-then-undo }
  - { id: ask-first-many, reversible: "no", reaches-others: "no", items: many, stakes: normal, where: "a dialog before acting that says how many", use: ["mds-modal"] }
  - { id: send-as-shown, reaches-others: "yes", preview: seen, stakes: normal, where: "no dialog: the Send button, with what and to whom in front of the person, is the confirmation", use: ["mds-button"] }
  - { id: ask-before-sending, reaches-others: "yes", preview: unseen, stakes: normal, where: "a dialog that shows what goes and to whom before sending", use: ["mds-modal"] }
gaps: []
not-applicable:
  - { stakes: legal, why: "payments, signatures and consent have legal rules of their own: the candidate consent-and-legal" }

always-true:
  - id: irreversible-asks
    rule: An action that cannot be taken back asks first.
    checked-by: review
  - id: names-item-and-consequence
    rule: The question names the item, the text says the consequence.
    checked-by: review
  - id: verb-not-ok
    rule: The confirm button repeats the verb ("Delete"), never "OK" or "Yes".
    checked-by: review
    note: a lint on the known words is possible
  - id: cancel-is-safe
    rule: Cancel and Esc never do the action.
    checked-by: review

open-choices:
  - { id: typed-confirmation, default: "none: the dialog that names the item and says how many is enough", may: "ask to type the name or the number for its gravest cases" }

situations:
  - { situation: A document is removed from a draft, case: act-then-undo }
  - { situation: An item is deleted for good, case: ask-first }
  - { situation: 12 items are deleted for good, case: ask-first-many }
  - { situation: "An item is archived, and can be restored", case: act-then-undo }
  - { situation: "An operator closes dozens of tickets a day, for good", case: make-reversible }
  - { situation: "A message is sent from its form, with the text and the recipient on screen", case: send-as-shown }
  - { situation: A reminder is sent to a person from the menu of a row, case: ask-before-sending }
  - { situation: A payment is confirmed, use: consent-and-legal }
---

# Confirm an action

**An action that cannot be taken back asks first, naming the item and the consequence.**

## When to use it

An action the person chose that cannot be taken back, or that sends something to other people:
delete for good, close for good, send. Not where its outcome is told (`message-placement`), not
payments, signatures and consent (`consent-and-legal`).

## What decides it

Six questions: whether the person can undo the action afterwards, whether it sends something
to other people or systems, whether it acts on one item or many, how often the same person does
it in a working day, whether money, a signature or consent is at stake, and whether the person
sees what goes and to whom when acting.

## Cases

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

| Variable | Values | Means |
| --- | --- | --- |
| `reversible` | `yes`, `no` | can the person undo it afterwards |
| `reaches-others` | `no`, `yes` | does it send something to other people or systems, which cannot be called back |
| `items` | `one`, `many` | how many items the action acts on |
| `frequency` | `occasional`, `frequent` | how often the same person does it in a working day |
| `stakes` | `normal`, `legal` | legal: money, a signature or consent, which have rules of their own |
| `preview` | `seen`, `unseen` | does the person see what goes and to whom when acting |

A case that leaves a variable out holds for any of its values.

| Case | When | Where | Use |
| --- | --- | --- | --- |
| `act-then-undo` | reversible: yes; reaches-others: no; stakes: normal | act at once, then a toast with Undo, which stays until closed | `mds-toast variant=success duration=0 dismissible`, `mds-button slot=action` |
| `ask-first` | reversible: no; reaches-others: no; items: one; frequency: occasional; stakes: normal | a dialog before acting: the question names the item, the text says the consequence | `mds-modal` |
| `make-reversible` | reversible: no; reaches-others: no; items: one; frequency: frequent; stakes: normal | make it reversible: act at once, then a toast with Undo; the item is kept for a while to restore it; see `act-then-undo` | `mds-toast variant=success duration=0 dismissible`, `mds-button slot=action` |
| `ask-first-many` | reversible: no; reaches-others: no; items: many; stakes: normal | a dialog before acting that says how many | `mds-modal` |
| `send-as-shown` | reaches-others: yes; stakes: normal; preview: seen | no dialog: the Send button, with what and to whom in front of the person, is the confirmation | `mds-button` |
| `ask-before-sending` | reaches-others: yes; stakes: normal; preview: unseen | a dialog that shows what goes and to whom before sending | `mds-modal` |

Not applicable:

| When | Why |
| --- | --- |
| stakes: legal | payments, signatures and consent have legal rules of their own: the candidate consent-and-legal |

No gaps: every combination has a case or is not applicable.

## Parts

The dialog of `ask-first` and `ask-first-many`:

- the title is the question, with the name of the item ("Delete Mario Rossi?") or how many
  ("Delete 12 items?"); it is also the accessible name of the dialog;
- a sentence with the consequence ("They will no longer be able to sign in. Their changes
  stay, under their name.");
- an error banner, hidden, for when the action fails (`message-placement`,
  `action-failed-in-place`);
- at the end, Cancel (`variant="dark" tone="weak"`), then the action with its verb
  (`variant="error"` when it destroys).

## Behaviour over time

- On the action: `await` on its button, which cannot be pressed again.
- It works: the dialog closes, a success toast; if the element that opened the dialog is gone,
  the focus goes to the title of the page.
- It fails: the banner in the dialog, "Nothing was changed"; the dialog stays open.
- Cancel or Esc: the dialog closes (to verify on `mds-modal`: the focus goes back to what
  opened it).
- On opening, the focus is on Cancel, the safe choice; Esc means Cancel, so the dialog is not
  `strict`.
- The toast with Undo stays until it is closed, as every toast with an action
  (`message-placement`, `toast-action-stays`): the time limit to undo is kept by the
  application, which keeps the item for a while, not by the toast.

## Always true

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

These hold in every product: a product layer cannot change them.

| Id | Rule | Checked by |
| --- | --- | --- |
| `irreversible-asks` | An action that cannot be taken back asks first. | review |
| `names-item-and-consequence` | The question names the item, the text says the consequence. | review |
| `verb-not-ok` | The confirm button repeats the verb ("Delete"), never "OK" or "Yes". | review; a lint on the known words is possible |
| `cancel-is-safe` | Cancel and Esc never do the action. | review |

## Open choices

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

The default decides these; a product layer may narrow them.

| Id | Default | A product may |
| --- | --- | --- |
| `typed-confirmation` | none: the dialog that names the item and says how many is enough | ask to type the name or the number for its gravest cases |

## Situations

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

Situations every application has, each with its case: they give the examples, the texts and the keywords. The situations of a product's own domain go in its layer.

| Situation | Case |
| --- | --- |
| A document is removed from a draft | `act-then-undo` |
| An item is deleted for good | `ask-first` |
| 12 items are deleted for good | `ask-first-many` |
| An item is archived, and can be restored | `act-then-undo` |
| An operator closes dozens of tickets a day, for good | `make-reversible` |
| A message is sent from its form, with the text and the recipient on screen | `send-as-shown` |
| A reminder is sent to a person from the menu of a row | `ask-before-sending` |
| A payment is confirmed | not here: `consent-and-legal` |

## Decisions

| Date | Decision | Why |
| --- | --- | --- |
| 2026-10-16 | Proposed: an irreversible action always asks, naming the item and the consequence | Open decision of the docs site, `agents/patterns.md`. |
| 2026-10-28 | Draft with variables; the frequent irreversible action and the action that reaches others left as gaps | The sources do not settle them. |
| 2026-10-28 | An irreversible action done many times a day is made reversible, with Undo (`make-reversible`) | Asking every time teaches to confirm without reading, where the confirmation matters most. |
| 2026-10-28 | An action that reaches others asks only when the person does not see what goes and to whom (`send-as-shown`, `ask-before-sending`) | With the content and the recipient in front of them, the Send button is already the confirmation. |
| 2026-10-28 | The toast with Undo stays until closed | The rule of every toast with an action, there for accessibility; the time limit is the application's. |
| 2026-10-28 | No typed confirmation in the default; a product may add it (`typed-confirmation`) | The dialog that names the item and says how many is enough for a default. |
