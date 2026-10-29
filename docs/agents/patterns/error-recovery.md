---
# A Magma pattern: the format and the commands are in docs/PATTERNS.md.
id: error-recovery
kind: pattern
title: When something fails
group: messages-and-states
layer: magma
status: decided
need: >-
  Something did not work, and the person must understand what did not happen and go on without
  losing their work.
principle: >-
  A failure keeps what the person did, says what did not happen, and gives a way on: Try again
  when it may work, another way when it cannot.
keywords: [error, failed, could not load, could not save, try again, retry, connection lost, not saved, session expired, conflict]
not-for:
  - need: where the error message goes
    use: message-placement
  - need: a field with a wrong value
    use: form-and-validation
  - need: a list with no results
    use: empty-state
  - need: merging the changes of two people on the same record
    use: concurrent-editing
assumptions:
  - The application can tell a failure that trying again may fix from one it cannot.
high-stakes: false
components: [mds-banner, mds-toast, mds-button, mds-zero, mds-input-field]
related: [message-placement, loading, empty-state, confirm-action, form-and-validation, concurrent-editing]
validated-on: []

variables:
  what: { values: [content, action], means: "content: data a part of the page loads; action: an operation the person started" }
  cause: { values: [transient, lasting, conflict, session], means: "transient: the network or the server failed, trying again may work; lasting: trying again fails the same way (no permission, the item is gone, the data is refused); conflict: someone else changed the same thing meanwhile; session: the session ended" }
  known: { values: ["yes", "no"], means: "does the application know what happened (no: the connection dropped after sending)" }
  items: { values: [one, many], means: "how many items the action acts on" }

cases:
  - { id: retry-content, what: content, cause: transient, known: "yes", where: "what was there stays; an error banner in that part with Try again; when it works, the banner goes", use: ["mds-banner variant=error", "mds-button slot=action await"] }
  - { id: content-another-way, what: content, cause: lasting, known: "yes", where: "no Try again: says why and gives another way (the not-found of empty-state for a thing that is gone; who can give access)", use: ["mds-banner variant=error", "mds-zero"] }
  - { id: retry-action, what: action, cause: transient, known: "yes", items: one, where: "says nothing was changed; what was written stays; Try again, in the place message-placement gives: a banner in place, or a toast that stays", use: ["mds-banner variant=error", "mds-toast variant=error duration=0 dismissible"] }
  - { id: action-another-way, what: action, cause: lasting, known: "yes", items: one, where: "no Try again: says why and gives another way (the errors on the fields for refused data; who can do it; back to the list for a thing that is gone)", use: ["mds-banner variant=error", "mds-input-field message"] }
  - { id: check-or-repeat, what: action, cause: transient, known: "no", where: "Try again at once when repeating does no harm (saving the same values); otherwise the application first asks the server what happened, then tells it: done as a success, not done with Try again", use: ["mds-banner variant=error", "mds-toast variant=error duration=0 dismissible"] }
  - { id: changed-meanwhile, what: action, cause: conflict, known: "yes", where: "never overwrite in silence: says who changed it and when, that nothing was saved, and the changes of the person stay on screen", use: ["mds-banner variant=error"], see: concurrent-editing }
  - { id: sign-in-again, cause: session, known: "yes", where: "says the session ended and nothing was saved; Sign in opens the sign-in in a new tab; back on the page, Try again: the work never leaves the page", use: ["mds-banner variant=error", "mds-button href target=blank", "mds-button await"] }
  - { id: partial, what: action, cause: [transient, lasting], known: "yes", items: many, where: "says how many worked and which did not, and why; Try again acts only on those that failed for a transient cause", use: ["mds-banner variant=error", "mds-toast variant=error duration=0 dismissible"] }
gaps: []
not-applicable:
  - { what: content, cause: conflict, why: "loading changes nothing: there is nothing to conflict with" }
  - { what: content, known: "no", why: "loading changes nothing: the outcome is always known" }
  - { cause: [lasting, conflict, session], known: "no", why: "the server answered: the outcome is known" }

always-true:
  - id: keep-the-work
    rule: A failure never loses what the person wrote or chose.
    checked-by: review
  - id: says-what-did-not-happen
    rule: The error says what did not happen and what to do.
    checked-by: review
  - id: retry-only-if-it-may-work
    rule: Try again only when trying again may work; otherwise another way.
    checked-by: review
  - id: no-raw-error
    rule: Never the raw text of an HTTP status or an exception.
    checked-by: review
  - id: no-repeat-by-itself
    rule: An action is never repeated by itself, unless repeating it does no harm.
    checked-by: review
  - id: no-silent-overwrite
    rule: A save never overwrites a change made by someone else without saying so.
    checked-by: review
  - id: no-dismissible-banner-in-dialog
    from: message-placement

open-choices:
  - { id: support-contact, default: "none: the text says to try again later", may: "say who to contact when the problem stays (\"If the problem stays, write to the help desk\")" }

situations:
  - { situation: A list does not load, case: retry-content }
  - { situation: "A record opens, and the person may not see it", case: content-another-way }
  - { situation: Saving a form fails on the server, case: retry-action }
  - { situation: A form is refused by the server because a code is already in use, case: action-another-way }
  - { situation: "12 items are archived, 3 fail", case: partial }
  - { situation: A save fails because the session ended, case: sign-in-again }
  - { situation: The connection drops while a message is being sent, case: check-or-repeat, note: the application checks first }
  - { situation: The connection drops while a form is saved, case: check-or-repeat, note: Try again at once }
  - { situation: "A record is saved, and someone else had changed it meanwhile", case: changed-meanwhile }
---

# When something fails

**A failure keeps what the person did, says what did not happen, and gives a way on: Try again when it may work, another way when it cannot.**

## When to use it

A load or an action that failed: the network, the server, a permission, a thing that is gone,
a change made by someone else, a session that ended. Where the message goes is
`message-placement`; this pattern is what follows. Not a field with a wrong value
(`form-and-validation`), not a list with no results (`empty-state`): no results is not an error.

## What decides it

Four questions: whether a load or an action failed, why (trying again may work, it will fail
the same way, someone else changed the same thing, the session ended), whether the application
knows what happened, and whether the action was on one item or many.

## Cases

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

| Variable | Values | Means |
| --- | --- | --- |
| `what` | `content`, `action` | content: data a part of the page loads; action: an operation the person started |
| `cause` | `transient`, `lasting`, `conflict`, `session` | transient: the network or the server failed, trying again may work; lasting: trying again fails the same way (no permission, the item is gone, the data is refused); conflict: someone else changed the same thing meanwhile; session: the session ended |
| `known` | `yes`, `no` | does the application know what happened (no: the connection dropped after sending) |
| `items` | `one`, `many` | how many items the action acts on |

A case that leaves a variable out holds for any of its values.

| Case | When | Where | Use |
| --- | --- | --- | --- |
| `retry-content` | what: content; cause: transient; known: yes | what was there stays; an error banner in that part with Try again; when it works, the banner goes | `mds-banner variant=error`, `mds-button slot=action await` |
| `content-another-way` | what: content; cause: lasting; known: yes | no Try again: says why and gives another way (the not-found of empty-state for a thing that is gone; who can give access) | `mds-banner variant=error`, `mds-zero` |
| `retry-action` | what: action; cause: transient; known: yes; items: one | says nothing was changed; what was written stays; Try again, in the place message-placement gives: a banner in place, or a toast that stays | `mds-banner variant=error`, `mds-toast variant=error duration=0 dismissible` |
| `action-another-way` | what: action; cause: lasting; known: yes; items: one | no Try again: says why and gives another way (the errors on the fields for refused data; who can do it; back to the list for a thing that is gone) | `mds-banner variant=error`, `mds-input-field message` |
| `check-or-repeat` | what: action; cause: transient; known: no | Try again at once when repeating does no harm (saving the same values); otherwise the application first asks the server what happened, then tells it: done as a success, not done with Try again | `mds-banner variant=error`, `mds-toast variant=error duration=0 dismissible` |
| `changed-meanwhile` | what: action; cause: conflict; known: yes | never overwrite in silence: says who changed it and when, that nothing was saved, and the changes of the person stay on screen; see `concurrent-editing` | `mds-banner variant=error` |
| `sign-in-again` | cause: session; known: yes | says the session ended and nothing was saved; Sign in opens the sign-in in a new tab; back on the page, Try again: the work never leaves the page | `mds-banner variant=error`, `mds-button href target=blank`, `mds-button await` |
| `partial` | what: action; cause: transient or lasting; known: yes; items: many | says how many worked and which did not, and why; Try again acts only on those that failed for a transient cause | `mds-banner variant=error`, `mds-toast variant=error duration=0 dismissible` |

Not applicable:

| When | Why |
| --- | --- |
| what: content; cause: conflict | loading changes nothing: there is nothing to conflict with |
| what: content; known: no | loading changes nothing: the outcome is always known |
| cause: lasting or conflict or session; known: no | the server answered: the outcome is known |

No gaps: every combination has a case or is not applicable.

## Parts

- An error banner, `mds-banner` with `variant="error"`, in the place `message-placement` gives:
  a title that says what did not happen, a sentence with what to do, and Try again
  (`mds-button` in its `action` slot) when trying again may work.
- When the place is gone, a toast that stays, with Try again (`message-placement`,
  `action-failed-elsewhere`).
- For a thing that is gone, the not-found panel of `empty-state`.
- For an ended session, Sign in next to Try again: the sign-in opens in a new tab, so the page
  and what was written stay where they are.

## Behaviour over time

- What was on screen stays, and what was written stays.
- Try again waits (`await`), and when it works the banner goes.
- From the third failure in a row on the same thing, the text says to try again later; Try
  again stays.
- An action whose outcome is unknown is repeated at once only when repeating does no harm;
  otherwise the application asks the server first. A payment follows the rule of high-stakes
  flows: no default decides for the person.

## Always true

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

These hold in every product: a product layer cannot change them.

| Id | Rule | Checked by |
| --- | --- | --- |
| `keep-the-work` | A failure never loses what the person wrote or chose. | review |
| `says-what-did-not-happen` | The error says what did not happen and what to do. | review |
| `retry-only-if-it-may-work` | Try again only when trying again may work; otherwise another way. | review |
| `no-raw-error` | Never the raw text of an HTTP status or an exception. | review |
| `no-repeat-by-itself` | An action is never repeated by itself, unless repeating it does no harm. | review |
| `no-silent-overwrite` | A save never overwrites a change made by someone else without saying so. | review |
| `no-dismissible-banner-in-dialog` | A banner inside an mds-modal is not dismissible: closing it closes the dialog, and what the person wrote is lost. (from `message-placement`) | review; lint `magma/no-dismissible-banner-in-modal` to write |

## Open choices

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

The default decides these; a product layer may narrow them.

| Id | Default | A product may |
| --- | --- | --- |
| `support-contact` | none: the text says to try again later | say who to contact when the problem stays ("If the problem stays, write to the help desk") |

## Situations

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

Situations every application has, each with its case: they give the examples, the texts and the keywords. The situations of a product's own domain go in its layer.

| Situation | Case |
| --- | --- |
| A list does not load | `retry-content` |
| A record opens, and the person may not see it | `content-another-way` |
| Saving a form fails on the server | `retry-action` |
| A form is refused by the server because a code is already in use | `action-another-way` |
| 12 items are archived, 3 fail | `partial` |
| A save fails because the session ended | `sign-in-again` |
| The connection drops while a message is being sent | `check-or-repeat`: the application checks first |
| The connection drops while a form is saved | `check-or-repeat`: Try again at once |
| A record is saved, and someone else had changed it meanwhile | `changed-meanwhile` |

## Accessibility

- An error banner is read out at once (`role="alert"`, `mds-banner` error).
- The focus stays on the control that was waiting; Try again takes it only when the person
  moves to it.

## Content

- What did not happen, then what to do: "The users could not be loaded. Check the connection,
  then try again." "Nothing was changed."
- For many items, how many and which: "9 archived, 3 not: they are open in another window."

## Magma gaps

None blocking: retrying is logic of the application.

## Decisions

| Date | Decision | Why |
| --- | --- | --- |
| 2026-10-16 | Where the error goes is `message-placement`; this pattern is what follows | One answers where, the other what stays, how to retry, when to stop. |
| 2026-10-28 | Draft with variables; the ended session, the unknown outcome, the conflict and several failures in a row left as gaps | The sources do not settle them. |
| 2026-10-28 | An ended session signs in again in a new tab, then Try again (`sign-in-again`) | The work never leaves the page; it works with an external single sign-on too. |
| 2026-10-28 | An unknown outcome is repeated at once only when repeating does no harm; otherwise the server is asked first (`check-or-repeat`) | A blind Try again can send or create twice. |
| 2026-10-28 | A change made by someone else meanwhile: here only the rule (`no-silent-overwrite`, `changed-meanwhile`); merging is the candidate `concurrent-editing` | Locks, versions and merging are a pattern of their own. |
| 2026-10-28 | From the third failure in a row, the text says to try again later; who to contact is a product's choice (`support-contact`) | Insisting with the same text does not help; the help desk differs by product. |
