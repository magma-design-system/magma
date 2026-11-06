---
# A Magma pattern: the format and the commands are in docs/PATTERNS.md.
id: message-placement
kind: pattern
title: Where a message goes
group: messages-and-states
layer: magma
status: decided
need: >-
  The person did something or opened a view, and must know what happened without looking for
  it.
principle: A message goes where the thing it talks about is.
keywords: [message, toast, banner, error message, saved, deleted, copied, failed, could not load, try again, connection lost, session ending]
not-for:
  - need: deciding whether to ask before acting
    use: confirm-action
  - need: what an empty part of the page says
    use: empty-state
  - need: what stays on screen and how to try again after a failure
    use: error-recovery
assumptions:
  - The application has a shell, with one mds-toast-region in it.
  - Desktop and mobile; on mobile with the keyboard open the bottom edge is still to verify.
high-stakes: false
components: [mds-input-field, mds-banner, mds-toast, mds-toast-region, mds-modal]
related: [confirm-action, error-recovery, loading, empty-state, notification-center]
validated-on: []

variables:
  about: { values: [field, region, action, application], means: "what the message talks about" }
  outcome: { values: [success, failure, partial, info], means: "what happened" }
  place: { values: [on-screen, off-screen], means: "is the thing it talks about on screen when the message comes" }
  timing: { values: [now, later], means: "later: the outcome comes after the person moved on" }
  decision: { values: [none, needed, deadline], means: "does the person have to choose before going on" }
  scope: { values: [page, part], means: "what an action changed: data shown across the page, or a part that works on its own" }

cases:
  - { id: field-error, about: field, outcome: failure, place: on-screen, where: "under the field", use: ["mds-input-field message"] }
  - { id: field-hint, about: field, outcome: info, place: on-screen, where: "under the field, its helper text", use: ["mds-input-field message"], magma-gap: "validation overwrites it" }
  - { id: field-valid, about: field, outcome: success, place: on-screen, where: "no message, the field shows its valid state", use: ["mds-input-field"] }
  - { id: region-failed, about: region, outcome: failure, where: "in that region, with Try again; what was there stays", use: ["mds-banner variant=error"] }
  - { id: region-info, about: region, outcome: info, where: "in that region", use: ["mds-banner variant=info"] }
  - { id: action-failed-in-place, about: action, outcome: failure, place: on-screen, timing: now, where: "in its place (the dialog); what was written stays", use: ["mds-banner variant=error"] }
  - { id: action-done-elsewhere, about: action, outcome: success, place: off-screen, timing: now, where: "toast", use: ["mds-toast variant=success"] }
  - { id: action-done-in-page, about: action, outcome: success, place: on-screen, timing: now, scope: page, where: "toast", use: ["mds-toast variant=success"] }
  - { id: action-done-in-part, about: action, outcome: success, place: on-screen, timing: now, scope: part, where: "next to the part that was saved, inside it", use: ["mds-banner variant=success"], magma-gap: "no light confirmation that goes away" }
  - { id: action-failed-elsewhere, about: action, outcome: failure, place: off-screen, timing: now, where: "a toast that stays, with Try again", use: ["mds-toast variant=error duration=0 dismissible"] }
  - { id: action-partial-in-place, about: action, outcome: partial, place: on-screen, timing: now, where: "as a failure in its place: a banner that says how many worked and which did not", use: ["mds-banner variant=error"], see: error-recovery }
  - { id: action-partial-elsewhere, about: action, outcome: partial, place: off-screen, timing: now, where: "as a failure elsewhere: a toast that stays, with what to do about the ones that did not work", use: ["mds-toast variant=error duration=0 dismissible"], see: error-recovery }
  - { id: action-taken, about: action, outcome: info, timing: now, where: "toast: taken in charge, and how the outcome will come", use: ["mds-toast variant=info"] }
  - { id: action-later, about: action, timing: later, where: "a toast with its action, which therefore stays; then kept in the notification center", use: ["mds-toast duration=0 dismissible"], see: notification-center }
  - { id: decision, decision: needed, where: "dialog", use: ["mds-modal"], see: confirm-action }
  - { id: app-info, about: application, outcome: info, decision: none, where: "toast", use: ["mds-toast"] }
  - { id: app-failed, about: application, outcome: failure, where: "in place of the content of the page, with Try again; the shell stays", use: ["mds-banner variant=error"], see: region-failed }
  - { id: app-deadline, about: application, decision: deadline, where: "dialog, also over an open one", use: ["mds-modal interaction=strict"] }
gaps: []
not-applicable:
  - { about: field, place: off-screen, why: "a message about a field goes with its field" }
  - { about: region, outcome: success, why: "a region that loads shows its content, the content is the message" }
  - { about: [field, region, action], decision: deadline, why: "a deadline is about the whole application" }
  - { about: [field, region, application], outcome: partial, why: "a partial outcome is about an action on several items" }
  - { about: application, outcome: success, why: "an application does not succeed, its actions do" }

always-true:
  - id: no-toast-over-dialog
    rule: "Never a toast over an open dialog: what is about a dialog goes inside it."
    checked-by: review
  - id: one-toast-region
    rule: One mds-toast-region per application.
    checked-by: review
  - id: toast-action-stays
    rule: A toast with an action has duration="0" and dismissible.
    checked-by: review
    lint-planned: magma/toast-action-stays
  - id: no-dismissible-banner-in-dialog
    rule: "A banner inside an mds-modal is not dismissible: closing it closes the dialog, and what the person wrote is lost."
    checked-by: review
    lint-planned: magma/no-dismissible-banner-in-modal
  - id: success-after-change
    rule: "After every create, edit and delete the person is told it worked: a toast, or a confirmation next to the part when that part works on its own."
    checked-by: review
  - id: no-internal-text
    rule: Never internal messages, HTTP status text or "coming soon".
    checked-by: review

open-choices:
  - { id: success-toast-duration, default: 5000 ms, may: "choose up to 8000 ms" }
  - { id: message-wording, default: the texts under Content, may: "write its own, in its voice" }

situations:
  - { situation: A form is sent with a required field empty, case: field-error }
  - { situation: A field explains its format before it is filled, case: field-hint }
  - { situation: The field is filled in correctly, case: field-valid }
  - { situation: A list does not load, case: region-failed }
  - { situation: A list shows data that are updated once a night, case: region-info }
  - { situation: Saving a form in a dialog fails, case: action-failed-in-place }
  - { situation: "Saving a form in a dialog works, and the dialog closes", case: action-done-elsewhere }
  - { situation: An item is deleted from a list, case: action-done-elsewhere }
  - { situation: A link is copied, case: action-done-elsewhere }
  - { situation: "Saving the details of a record, shown in its header and its tabs too, works", case: action-done-in-page }
  - { situation: "Saving a card of settings that has its own Save, on a page that stays open, works", case: action-done-in-part }
  - { situation: "Sending something from the menu of a row fails, after the menu closed", case: action-failed-elsewhere }
  - { situation: An item is about to be deleted for good, case: decision }
  - { situation: "The connection drops, then comes back", case: app-info }
  - { situation: The server answers nothing at all, case: app-failed }
  - { situation: "The session is about to end, with work not saved", case: app-deadline }
  - { situation: "An export is ready minutes later, while the person works elsewhere", case: action-later }
  - { situation: "A request is taken in charge; the answer comes by email", case: [action-taken, action-later], note: "the first at once, the second when the answer comes" }
  - { situation: "An action on 20 items of a list on screen: 3 fail", case: action-partial-in-place }
  - { situation: "An action on 20 items from a menu that closed: 3 fail", case: action-partial-elsewhere }
---

# Where a message goes

**A message goes where the thing it talks about is.**

## When to use it

Every message the application gives the person: the outcome of an action, a part of the page
that failed, the state of the whole application. Never internal messages, the raw text of an
HTTP status, or "coming soon".

## What decides it

Six questions about the message: what it talks about (a field, a region of the page, an
action, the whole application), its outcome (success, failure, partial, information), whether
the thing it talks about is on screen when the message comes, whether the message comes now
or later, after the person moved on, whether the person has to choose before going on, and,
for an action, what it changed: data shown across the page, or a part that works on its own.

## Cases

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

| Variable | Values | Means |
| --- | --- | --- |
| `about` | `field`, `region`, `action`, `application` | what the message talks about |
| `outcome` | `success`, `failure`, `partial`, `info` | what happened |
| `place` | `on-screen`, `off-screen` | is the thing it talks about on screen when the message comes |
| `timing` | `now`, `later` | later: the outcome comes after the person moved on |
| `decision` | `none`, `needed`, `deadline` | does the person have to choose before going on |
| `scope` | `page`, `part` | what an action changed: data shown across the page, or a part that works on its own |

A case that leaves a variable out holds for any of its values, except `decision`, which then means `none`.

| Case | When | Where | Use |
| --- | --- | --- | --- |
| `field-error` | about: field; outcome: failure; place: on-screen | under the field | `mds-input-field message` |
| `field-hint` | about: field; outcome: info; place: on-screen | under the field, its helper text; Magma gap: validation overwrites it | `mds-input-field message` |
| `field-valid` | about: field; outcome: success; place: on-screen | no message, the field shows its valid state | `mds-input-field` |
| `region-failed` | about: region; outcome: failure | in that region, with Try again; what was there stays | `mds-banner variant=error` |
| `region-info` | about: region; outcome: info | in that region | `mds-banner variant=info` |
| `action-failed-in-place` | about: action; outcome: failure; place: on-screen; timing: now | in its place (the dialog); what was written stays | `mds-banner variant=error` |
| `action-done-elsewhere` | about: action; outcome: success; place: off-screen; timing: now | toast | `mds-toast variant=success` |
| `action-done-in-page` | about: action; outcome: success; place: on-screen; timing: now; scope: page | toast | `mds-toast variant=success` |
| `action-done-in-part` | about: action; outcome: success; place: on-screen; timing: now; scope: part | next to the part that was saved, inside it; Magma gap: no light confirmation that goes away | `mds-banner variant=success` |
| `action-failed-elsewhere` | about: action; outcome: failure; place: off-screen; timing: now | a toast that stays, with Try again | `mds-toast variant=error duration=0 dismissible` |
| `action-partial-in-place` | about: action; outcome: partial; place: on-screen; timing: now | as a failure in its place: a banner that says how many worked and which did not; see `error-recovery` | `mds-banner variant=error` |
| `action-partial-elsewhere` | about: action; outcome: partial; place: off-screen; timing: now | as a failure elsewhere: a toast that stays, with what to do about the ones that did not work; see `error-recovery` | `mds-toast variant=error duration=0 dismissible` |
| `action-taken` | about: action; outcome: info; timing: now | toast: taken in charge, and how the outcome will come | `mds-toast variant=info` |
| `action-later` | about: action; timing: later | a toast with its action, which therefore stays; then kept in the notification center; see `notification-center` | `mds-toast duration=0 dismissible` |
| `decision` | decision: needed | dialog; see `confirm-action` | `mds-modal` |
| `app-info` | about: application; outcome: info; decision: none | toast | `mds-toast` |
| `app-failed` | about: application; outcome: failure | in place of the content of the page, with Try again; the shell stays; see `region-failed` | `mds-banner variant=error` |
| `app-deadline` | about: application; decision: deadline | dialog, also over an open one | `mds-modal interaction=strict` |

Not applicable:

| When | Why |
| --- | --- |
| about: field; place: off-screen | a message about a field goes with its field |
| about: region; outcome: success | a region that loads shows its content, the content is the message |
| about: field or region or action; decision: deadline | a deadline is about the whole application |
| about: field or region or application; outcome: partial | a partial outcome is about an action on several items |
| about: application; outcome: success | an application does not succeed, its actions do |

No gaps: every combination has a case or is not applicable.

## Parts

The toasts live in one `mds-toast-region` per application, at `bottom-center`, three at most.

## Behaviour over time

- A toast never takes the focus: the region reads it out.
- Its timer stops while the pointer or the focus is on it.
- A toast with an action has no timer and can be sent away (`dismissible`).
- When a toast leaves with the focus inside it, the focus goes to the title of the page.
- When the element that opened a dialog is gone (the item just deleted), the focus goes to
  the title of the page when the dialog closes: an `h1` with `tabindex="-1"`.

## Always true

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

These hold in every product: a product layer cannot change them.

| Id | Rule | Checked by |
| --- | --- | --- |
| `no-toast-over-dialog` | Never a toast over an open dialog: what is about a dialog goes inside it. | review |
| `one-toast-region` | One mds-toast-region per application. | review |
| `toast-action-stays` | A toast with an action has duration="0" and dismissible. | review; lint `magma/toast-action-stays` to write |
| `no-dismissible-banner-in-dialog` | A banner inside an mds-modal is not dismissible: closing it closes the dialog, and what the person wrote is lost. | review; lint `magma/no-dismissible-banner-in-modal` to write |
| `success-after-change` | After every create, edit and delete the person is told it worked: a toast, or a confirmation next to the part when that part works on its own. | review |
| `no-internal-text` | Never internal messages, HTTP status text or "coming soon". | review |

## Open choices

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

The default decides these; a product layer may narrow them.

| Id | Default | A product may |
| --- | --- | --- |
| `success-toast-duration` | 5000 ms | choose up to 8000 ms |
| `message-wording` | the texts under Content | write its own, in its voice |

## Situations

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

Situations every application has, each with its case: they give the examples, the texts and the keywords. The situations of a product's own domain go in its layer.

| Situation | Case |
| --- | --- |
| A form is sent with a required field empty | `field-error` |
| A field explains its format before it is filled | `field-hint` |
| The field is filled in correctly | `field-valid` |
| A list does not load | `region-failed` |
| A list shows data that are updated once a night | `region-info` |
| Saving a form in a dialog fails | `action-failed-in-place` |
| Saving a form in a dialog works, and the dialog closes | `action-done-elsewhere` |
| An item is deleted from a list | `action-done-elsewhere` |
| A link is copied | `action-done-elsewhere` |
| Saving the details of a record, shown in its header and its tabs too, works | `action-done-in-page` |
| Saving a card of settings that has its own Save, on a page that stays open, works | `action-done-in-part` |
| Sending something from the menu of a row fails, after the menu closed | `action-failed-elsewhere` |
| An item is about to be deleted for good | `decision` |
| The connection drops, then comes back | `app-info` |
| The server answers nothing at all | `app-failed` |
| The session is about to end, with work not saved | `app-deadline` |
| An export is ready minutes later, while the person works elsewhere | `action-later` |
| A request is taken in charge; the answer comes by email | `action-taken`, `action-later`: the first at once, the second when the answer comes |
| An action on 20 items of a list on screen: 3 fail | `action-partial-in-place` |
| An action on 20 items from a menu that closed: 3 fail | `action-partial-elsewhere` |

## Accessibility

- The region is a status region, in the page before any message: a toast is read out without
  moving the focus. The button of a toast is reachable with the keyboard.
- An error banner is read out at once (`role="alert"`).
- An urgent message that is not a toast goes through a hidden `role="alert"` region.

## Content

- An outcome names the object: "Mario Rossi deleted."
- An error says what did not happen and what to do: "Nothing was changed. Try again in a
  moment."

## Magma gaps

- The hidden region for urgent messages is written by hand: an announcer next to
  `mds-toast-region`? (to decide)
- `mds-toast` shows its text only when it has one at load, a gap left by #688 (to verify).
- The helper text of a field goes in the `message` of `mds-input-field`, which the validation
  overwrites: the help is gone at the first check. A hint of its own, kept next to the errors?
  (an issue to open)
- A light confirmation next to a part ("Saved" by its button), read out and then gone: Magma
  has none, only `mds-banner`, which stays. (to decide whether it is needed)
- The notification center: `mds-push-notification` is a stack of messages with its own
  "Clear notifications"; whether it can be a list to come back to is for the pattern
  `notification-center` to verify.

## Decisions

| Date | Decision | Why |
| --- | --- | --- |
| 2026-10-16 | The rule and the table of cases | A message read far from what it is about is missed or misread. |
| 2026-10-16 | To confirm: the session ending is a strict dialog, also over an open one; agreed first as a toast | A toast over an open dialog can be seen but not used. |
| 2026-10-27 | Id `message-placement`, group Messages and states (was Feedback) | "Feedback" read as the person telling the product something. |
| 2026-10-27 | `toast-action-stays` and `no-dismissible-banner-in-dialog` become lint rules | Both show in the markup; the second one loses data. |
| 2026-10-28 | The default is defined on variables of the situation, with situations every application has; no domain; real cases come later, as a validation | A domain scenario brought business rules into a default. |
| 2026-10-28 | To confirm: `field-valid` and `action-done-in-place`, two cases the variables showed and the table did not say | The table covered a field that fails and an action whose place is gone, not their other halves. |
| 2026-10-28 | A deadline is about the whole application; a partial outcome is about an action on several items; the cases of a field hold with the field on screen | Found by the check: 58 combinations that had no answer and no meaning. |
| 2026-10-28 | Information about a region goes in that region, as an info banner (`region-info`) | The rule: a message goes where the thing it talks about is. |
| 2026-10-28 | The whole application failing is a region that failed, the largest one: the shell stays (`app-failed`) | No new case for the same answer; the person keeps the menu and the way out. |
| 2026-10-28 | Information about a field is its helper text; an application does not succeed; information about an action joins the gap "later" | The last combinations the check found with no answer. |
| 2026-10-28 | Confirmed: a valid field shows its state and no message (`field-valid`); the session ending is a strict dialog, also over an open one (`app-deadline`) | Magma already does the first; a toast over an open dialog can be seen but not used. |
| 2026-10-28 | A success whose place stays on screen depends on what the action changed: data shown across the page, a toast (`action-done-in-page`); a part that works on its own, a confirmation next to it (`action-done-in-part`). `success-after-change` rewritten to match | A change that shows in many places is not "here"; an independent part is, and the confirmation belongs to it. |
| 2026-10-28 | To decide: the two gaps, later and partial | An outcome that comes later may belong to the candidate "Notification center"; a partial one to `error-recovery`. |
| 2026-10-28 | An outcome that comes later is a toast with its action, kept in the notification center (`action-later`); an action taken in charge says so at once (`action-taken`) | The person may have moved on or left: told when it comes, found again later. The notification center becomes a pattern of its own. |
| 2026-10-28 | A partial outcome goes where a failure goes (`action-partial-in-place`, `action-partial-elsewhere`); what to say and how to retry the ones that failed is `error-recovery` | The same places as a failure; the difference is in the text and in the retry. |
