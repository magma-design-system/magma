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
components: [mds-input-field, mds-input, mds-banner, mds-text, mds-button, mds-toast, mds-toast-region, mds-modal, mds-card, mds-card-content, mds-card-footer]
related: [confirm-action, error-recovery, loading, empty-state, notification-center, app-shell]
validated-on: []

variables:
  about: { values: [field, region, action, application], means: "what the message talks about" }
  outcome: { values: [success, failure, partial, info], means: "what happened" }
  place: { values: [on-screen, off-screen], means: "is the thing it talks about on screen when the message comes" }
  timing: { values: [now, later], means: "later: the outcome comes after the person moved on" }
  decision: { values: [none, needed, deadline], means: "does the person have to choose before going on" }
  scope: { values: [page, part], means: "what an action changed: data shown across the page, or a part that works on its own" }

cases:
  - id: field-error
    about: field
    outcome: failure
    place: on-screen
    where: "under the field"
    use:
      - { role: "the field: the error goes under it, in its message, written by the validation of its input", use: mds-input-field }
      - { role: "its input, required; on sending, the first one wrong takes the focus", use: "mds-input required" }
      - { role: "an input with a format, required, checked on its format too", use: "mds-input type=<the format it checks> required" }
  - id: field-hint
    about: field
    outcome: info
    place: on-screen
    where: "under the field, its helper text; where an example of the value helps, the empty field shows one as its placeholder (\"Es: Mario Rossi\")"
    use:
      - { role: "a field that an example of its value makes clear, with no hint", use: mds-input-field }
      - { role: "its input, empty, an example of the value as its placeholder", use: "mds-input placeholder=<Es: an example of the value>" }
      - { role: "a field with a rule to say: its hint under it, in its message", use: "mds-input-field short message=<the rule of the value, and where to find it>" }
      - { role: "its input of that format, an example of the value as its placeholder", use: "mds-input type=<the format of the value> placeholder=<Es: an example of the value>" }
    magma-gap: "validation overwrites it"
  - id: field-valid
    about: field
    outcome: success
    place: on-screen
    where: "no message, the field shows its valid state"
    use:
      - { role: "the field, which shows its valid state and no message", use: mds-input-field }
      - { role: "its input, required and of a format it checks when the person leaves it", use: "mds-input type=<the format it checks> required" }
  - id: region-failed
    about: region
    outcome: failure
    where: "in that region, with Try again; what was there stays"
    use:
      - { role: "the error, in the region, under its title, named by what did not load", use: "mds-banner variant=error tone=strong headline=<what did not load>" }
      - { role: "what did not happen and what to do", use: mds-text }
      - { role: "Try again, waiting while the region loads again", use: "mds-button slot=action variant=error tone=strong await" }
  - id: region-info
    about: region
    outcome: info
    where: "in that region"
    use:
      - { role: "the note, at the top of the region it is about, which stays", use: "mds-banner variant=info" }
      - { role: "what the person should know about what the region shows", use: mds-text }
  - id: action-failed-in-place
    about: action
    outcome: failure
    place: on-screen
    timing: now
    where: "in its place, right above the row of actions of the dialog; what was written stays"
    use:
      - { role: "the dialog of the form, which stays open when saving fails", use: "mds-modal aria-label=<the name of the form>" }
      - { role: "the window of the dialog, the form and its row of actions", use: "mds-banner slot=window variant=light tone=box dismissible headline=<the name of the form>" }
      - { role: "the error, not dismissible, last in the form, right above the row of actions", use: "mds-banner variant=error tone=strong headline=<what did not happen>" }
      - { role: "why, and what to do: what was written is still there", use: mds-text }
      - { role: "Cancel, which closes the dialog", use: "mds-button slot=action variant=dark tone=outline" }
      - { role: "Save, the way to try again: the focus stays on it", use: "mds-button slot=action" }
  - id: action-done-elsewhere
    about: action
    outcome: success
    place: off-screen
    timing: now
    where: "toast; the default light toast for a removal (`removal-toast-neutral`)"
    use:
      - { role: "the place of the toasts of the application, once in its shell", use: mds-toast-region }
      - { role: "the toast that names what was done, once the dialog is gone; it goes after its time", use: "mds-toast variant=success" }
  - id: action-done-in-page
    about: action
    outcome: success
    place: on-screen
    timing: now
    scope: page
    where: "toast; the default light toast for a removal (`removal-toast-neutral`)"
    use:
      - { role: "the title of the page, which shows the new data and takes the focus when the form goes", use: "mds-text typography=page tag=h1 tabindex=-1" }
      - { role: "the place of the toasts of the application, once in its shell", use: mds-toast-region }
      - { role: "the toast that names what was saved; it goes after its time", use: "mds-toast variant=success" }
  - id: action-done-in-part
    about: action
    outcome: success
    place: on-screen
    timing: now
    scope: part
    where: "next to the part that was saved, inside it"
    use:
      - { role: "the part that works on its own, with its own Save", use: mds-card }
      - { role: "its content, where the confirmation goes, after the fields", use: mds-card-content }
      - { role: "the confirmation, right above the row of the part; it stays until the next change in it", use: "mds-banner variant=success tone=strong headline=<what was saved>" }
      - { role: "what follows from it", use: mds-text }
      - { role: "the row of actions of the part", use: mds-card-footer }
      - { role: "the Save of the part", use: "mds-button type=submit variant=primary tone=outline" }
    magma-gap: "no light confirmation that goes away"
  - id: action-failed-elsewhere
    about: action
    outcome: failure
    place: off-screen
    timing: now
    where: "a toast that stays, with Try again"
    use:
      - { role: "the place of the toasts of the application, once in its shell", use: mds-toast-region }
      - { role: "the toast that says what did not happen; it stays until closed, its action with it", use: "mds-toast variant=error duration=0 dismissible" }
      - { role: "Try again, in the colour of the toast", use: "mds-button slot=action size=sm variant=error tone=outline" }
  - id: action-partial-in-place
    about: action
    outcome: partial
    place: on-screen
    timing: now
    where: "as a failure in its place: a banner that says how many worked and which did not"
    use:
      - { role: "the outcome, above the items the action was on, named by how many worked and how many did not", use: "mds-banner variant=error tone=strong headline=<how many worked, how many did not>" }
      - { role: "where the ones that did not work are, why, and what to do", use: mds-text }
      - { role: "Try again, for the ones that did not work, saying how many; waiting while it goes", use: "mds-button slot=action variant=error tone=strong await" }
    see: error-recovery
  - id: action-partial-elsewhere
    about: action
    outcome: partial
    place: off-screen
    timing: now
    where: "as a failure elsewhere: a toast that stays, with what to do about the ones that did not work"
    use:
      - { role: "the place of the toasts of the application, once in its shell", use: mds-toast-region }
      - { role: "the toast that says how many worked and how many did not; it stays until closed, its action with it", use: "mds-toast variant=error duration=0 dismissible" }
      - { role: "Try again, for the ones that did not work, saying how many", use: "mds-button slot=action size=sm variant=error tone=outline" }
    see: error-recovery
  - id: action-taken
    about: action
    outcome: info
    timing: now
    where: "toast: taken in charge, and how the outcome will come"
    use:
      - { role: "the place of the toasts of the application, once in its shell", use: mds-toast-region }
      - { role: "the toast that says the request is taken in charge and how the outcome will come; it goes after its time", use: "mds-toast variant=info" }
  - id: action-later
    about: action
    timing: later
    where: "a toast with its action, which therefore stays; then kept in the notification center"
    use:
      - { role: "the place of the toasts of the application, once in its shell", use: mds-toast-region }
      - { role: "the toast that names the outcome come later; it stays until closed, its action with it", use: "mds-toast variant=success duration=0 dismissible" }
      - { role: "the action on the outcome, named by its verb", use: "mds-button slot=action size=sm variant=success tone=outline" }
    see: notification-center
  - id: decision
    decision: needed
    where: "dialog"
    use:
      - { role: "the title of the page, which takes the focus when the dialog closes and what opened it is gone", use: "mds-text typography=page tag=h1 tabindex=-1" }
      - { role: "the dialog, named by its question", use: "mds-modal aria-label=<the question, naming the item>" }
      - { role: "the window of the dialog, its headline the question", use: "mds-banner slot=window variant=light tone=box dismissible headline=<the question, naming the item>" }
      - { role: "the consequence, in a sentence", use: mds-text }
      - { role: "Cancel, the safe choice, focused on opening", use: "mds-button slot=action variant=dark tone=outline autofocus" }
      - { role: "the action, last, named by its verb, in the colour of what destroys", use: "mds-button slot=action variant=error tone=strong" }
    see: confirm-action
  - id: app-info
    about: application
    outcome: info
    decision: none
    where: "a toast that goes after its time: `warning` for a trouble that does not stop the work (the connection dropped), `info` for news"
    use:
      - { role: "the place of the toasts of the application, once in its shell", use: mds-toast-region }
      - { role: "the toast of a trouble that does not stop the work (the connection dropped); it goes after its time", use: "mds-toast variant=warning" }
      - { role: "the toast of news (the connection is back); it goes after its time", use: "mds-toast variant=info" }
  - id: app-failed
    about: application
    outcome: failure
    where: "in place of the content of the page, with Try again; the shell stays"
    use:
      - { role: "the error, in place of the content of the page, under its title; the shell stays", use: "mds-banner variant=error tone=strong headline=<what does not answer>" }
      - { role: "what did not happen and what to do", use: mds-text }
      - { role: "Try again, waiting while the page loads again", use: "mds-button slot=action variant=error tone=strong await" }
    see: region-failed
  - id: app-deadline
    about: application
    decision: deadline
    where: "dialog, also over an open one; closing it means staying (`deadline-close` of actions)"
    use:
      - { role: "the dialog, named by what is about to happen; closing it means staying", use: "mds-modal aria-label=<what is about to happen>" }
      - { role: "the window of the dialog, in the colour of a warning, its headline what is about to happen", use: "mds-banner slot=window variant=warning tone=box dismissible headline=<what is about to happen>" }
      - { role: "when, and what is lost", use: mds-text }
      - { role: "Sign out, the way that ends the session", use: "mds-button slot=action variant=warning tone=outline" }
      - { role: "Stay signed in, last: the choice that keeps the work, focused on opening", use: "mds-button slot=action variant=warning tone=strong autofocus" }
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
  - id: removal-toast-neutral
    rule: "The toast of a removal (an item removed, archived, deleted after a confirmation), with or without Undo, is the default light toast: variant=\"success\" is for what an action creates or completes."
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
  - { situation: An item is deleted from a list, case: action-done-elsewhere, note: "the default light toast (`removal-toast-neutral`)" }
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

| Case | When | Where |
| --- | --- | --- |
| `field-error` | about: field; outcome: failure; place: on-screen | under the field |
| `field-hint` | about: field; outcome: info; place: on-screen | under the field, its helper text; where an example of the value helps, the empty field shows one as its placeholder ("Es: Mario Rossi"); Magma gap: validation overwrites it |
| `field-valid` | about: field; outcome: success; place: on-screen | no message, the field shows its valid state |
| `region-failed` | about: region; outcome: failure | in that region, with Try again; what was there stays |
| `region-info` | about: region; outcome: info | in that region |
| `action-failed-in-place` | about: action; outcome: failure; place: on-screen; timing: now | in its place, right above the row of actions of the dialog; what was written stays |
| `action-done-elsewhere` | about: action; outcome: success; place: off-screen; timing: now | toast; the default light toast for a removal (`removal-toast-neutral`) |
| `action-done-in-page` | about: action; outcome: success; place: on-screen; timing: now; scope: page | toast; the default light toast for a removal (`removal-toast-neutral`) |
| `action-done-in-part` | about: action; outcome: success; place: on-screen; timing: now; scope: part | next to the part that was saved, inside it; Magma gap: no light confirmation that goes away |
| `action-failed-elsewhere` | about: action; outcome: failure; place: off-screen; timing: now | a toast that stays, with Try again |
| `action-partial-in-place` | about: action; outcome: partial; place: on-screen; timing: now | as a failure in its place: a banner that says how many worked and which did not; see `error-recovery` |
| `action-partial-elsewhere` | about: action; outcome: partial; place: off-screen; timing: now | as a failure elsewhere: a toast that stays, with what to do about the ones that did not work; see `error-recovery` |
| `action-taken` | about: action; outcome: info; timing: now | toast: taken in charge, and how the outcome will come |
| `action-later` | about: action; timing: later | a toast with its action, which therefore stays; then kept in the notification center; see `notification-center` |
| `decision` | decision: needed | dialog; see `confirm-action` |
| `app-info` | about: application; outcome: info; decision: none | a toast that goes after its time: `warning` for a trouble that does not stop the work (the connection dropped), `info` for news |
| `app-failed` | about: application; outcome: failure | in place of the content of the page, with Try again; the shell stays; see `region-failed` |
| `app-deadline` | about: application; decision: deadline | dialog, also over an open one; closing it means staying (`deadline-close` of actions) |

Not applicable:

| When | Why |
| --- | --- |
| about: field; place: off-screen | a message about a field goes with its field |
| about: region; outcome: success | a region that loads shows its content, the content is the message |
| about: field or region or action; decision: deadline | a deadline is about the whole application |
| about: field or region or application; outcome: partial | a partial outcome is about an action on several items |
| about: application; outcome: success | an application does not succeed, its actions do |

No gaps: every combination has a case or is not applicable.

The parts of each case, in the order of its preview: what each does in the case, and the component to write. A value in angle brackets is the text of the application, written as it says; the rest of the preview is its stage, the context of the case.

`field-error`:

| Role | Use |
| --- | --- |
| the field: the error goes under it, in its message, written by the validation of its input | `mds-input-field` |
| its input, required; on sending, the first one wrong takes the focus | `mds-input required` |
| an input with a format, required, checked on its format too | `mds-input type=<the format it checks> required` |

`field-hint`:

| Role | Use |
| --- | --- |
| a field that an example of its value makes clear, with no hint | `mds-input-field` |
| its input, empty, an example of the value as its placeholder | `mds-input placeholder=<Es: an example of the value>` |
| a field with a rule to say: its hint under it, in its message | `mds-input-field short message=<the rule of the value, and where to find it>` |
| its input of that format, an example of the value as its placeholder | `mds-input type=<the format of the value> placeholder=<Es: an example of the value>` |

`field-valid`:

| Role | Use |
| --- | --- |
| the field, which shows its valid state and no message | `mds-input-field` |
| its input, required and of a format it checks when the person leaves it | `mds-input type=<the format it checks> required` |

`region-failed`:

| Role | Use |
| --- | --- |
| the error, in the region, under its title, named by what did not load | `mds-banner variant=error tone=strong headline=<what did not load>` |
| what did not happen and what to do | `mds-text` |
| Try again, waiting while the region loads again | `mds-button slot=action variant=error tone=strong await` |

`region-info`:

| Role | Use |
| --- | --- |
| the note, at the top of the region it is about, which stays | `mds-banner variant=info` |
| what the person should know about what the region shows | `mds-text` |

`action-failed-in-place`:

| Role | Use |
| --- | --- |
| the dialog of the form, which stays open when saving fails | `mds-modal aria-label=<the name of the form>` |
| the window of the dialog, the form and its row of actions | `mds-banner slot=window variant=light tone=box dismissible headline=<the name of the form>` |
| the error, not dismissible, last in the form, right above the row of actions | `mds-banner variant=error tone=strong headline=<what did not happen>` |
| why, and what to do: what was written is still there | `mds-text` |
| Cancel, which closes the dialog | `mds-button slot=action variant=dark tone=outline` |
| Save, the way to try again: the focus stays on it | `mds-button slot=action` |

`action-done-elsewhere`:

| Role | Use |
| --- | --- |
| the place of the toasts of the application, once in its shell | `mds-toast-region` |
| the toast that names what was done, once the dialog is gone; it goes after its time | `mds-toast variant=success` |

`action-done-in-page`:

| Role | Use |
| --- | --- |
| the title of the page, which shows the new data and takes the focus when the form goes | `mds-text typography=page tag=h1 tabindex=-1` |
| the place of the toasts of the application, once in its shell | `mds-toast-region` |
| the toast that names what was saved; it goes after its time | `mds-toast variant=success` |

`action-done-in-part`:

| Role | Use |
| --- | --- |
| the part that works on its own, with its own Save | `mds-card` |
| its content, where the confirmation goes, after the fields | `mds-card-content` |
| the confirmation, right above the row of the part; it stays until the next change in it | `mds-banner variant=success tone=strong headline=<what was saved>` |
| what follows from it | `mds-text` |
| the row of actions of the part | `mds-card-footer` |
| the Save of the part | `mds-button type=submit variant=primary tone=outline` |

`action-failed-elsewhere`:

| Role | Use |
| --- | --- |
| the place of the toasts of the application, once in its shell | `mds-toast-region` |
| the toast that says what did not happen; it stays until closed, its action with it | `mds-toast variant=error duration=0 dismissible` |
| Try again, in the colour of the toast | `mds-button slot=action size=sm variant=error tone=outline` |

`action-partial-in-place`:

| Role | Use |
| --- | --- |
| the outcome, above the items the action was on, named by how many worked and how many did not | `mds-banner variant=error tone=strong headline=<how many worked, how many did not>` |
| where the ones that did not work are, why, and what to do | `mds-text` |
| Try again, for the ones that did not work, saying how many; waiting while it goes | `mds-button slot=action variant=error tone=strong await` |

`action-partial-elsewhere`:

| Role | Use |
| --- | --- |
| the place of the toasts of the application, once in its shell | `mds-toast-region` |
| the toast that says how many worked and how many did not; it stays until closed, its action with it | `mds-toast variant=error duration=0 dismissible` |
| Try again, for the ones that did not work, saying how many | `mds-button slot=action size=sm variant=error tone=outline` |

`action-taken`:

| Role | Use |
| --- | --- |
| the place of the toasts of the application, once in its shell | `mds-toast-region` |
| the toast that says the request is taken in charge and how the outcome will come; it goes after its time | `mds-toast variant=info` |

`action-later`:

| Role | Use |
| --- | --- |
| the place of the toasts of the application, once in its shell | `mds-toast-region` |
| the toast that names the outcome come later; it stays until closed, its action with it | `mds-toast variant=success duration=0 dismissible` |
| the action on the outcome, named by its verb | `mds-button slot=action size=sm variant=success tone=outline` |

`decision`:

| Role | Use |
| --- | --- |
| the title of the page, which takes the focus when the dialog closes and what opened it is gone | `mds-text typography=page tag=h1 tabindex=-1` |
| the dialog, named by its question | `mds-modal aria-label=<the question, naming the item>` |
| the window of the dialog, its headline the question | `mds-banner slot=window variant=light tone=box dismissible headline=<the question, naming the item>` |
| the consequence, in a sentence | `mds-text` |
| Cancel, the safe choice, focused on opening | `mds-button slot=action variant=dark tone=outline autofocus` |
| the action, last, named by its verb, in the colour of what destroys | `mds-button slot=action variant=error tone=strong` |

`app-info`:

| Role | Use |
| --- | --- |
| the place of the toasts of the application, once in its shell | `mds-toast-region` |
| the toast of a trouble that does not stop the work (the connection dropped); it goes after its time | `mds-toast variant=warning` |
| the toast of news (the connection is back); it goes after its time | `mds-toast variant=info` |

`app-failed`:

| Role | Use |
| --- | --- |
| the error, in place of the content of the page, under its title; the shell stays | `mds-banner variant=error tone=strong headline=<what does not answer>` |
| what did not happen and what to do | `mds-text` |
| Try again, waiting while the page loads again | `mds-button slot=action variant=error tone=strong await` |

`app-deadline`:

| Role | Use |
| --- | --- |
| the dialog, named by what is about to happen; closing it means staying | `mds-modal aria-label=<what is about to happen>` |
| the window of the dialog, in the colour of a warning, its headline what is about to happen | `mds-banner slot=window variant=warning tone=box dismissible headline=<what is about to happen>` |
| when, and what is lost | `mds-text` |
| Sign out, the way that ends the session | `mds-button slot=action variant=warning tone=outline` |
| Stay signed in, last: the choice that keeps the work, focused on opening | `mds-button slot=action variant=warning tone=strong autofocus` |

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
| `removal-toast-neutral` | The toast of a removal (an item removed, archived, deleted after a confirmation), with or without Undo, is the default light toast: variant="success" is for what an action creates or completes. | review |
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
| An item is deleted from a list | `action-done-elsewhere`: the default light toast (`removal-toast-neutral`) |
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
- The placeholder of a field is an example of the value, "Es: Mario Rossi", never its label
  or its hint: it goes at the first letter typed.

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
| 2026-10-28 | Confirmed: a valid field shows its state and no message (`field-valid`); the session ending is a strict dialog, also over an open one (`app-deadline`); strict superseded on 2026-11-01 | Magma already does the first; a toast over an open dialog can be seen but not used. |
| 2026-10-28 | A success whose place stays on screen depends on what the action changed: data shown across the page, a toast (`action-done-in-page`); a part that works on its own, a confirmation next to it (`action-done-in-part`). `success-after-change` rewritten to match | A change that shows in many places is not "here"; an independent part is, and the confirmation belongs to it. |
| 2026-10-28 | To decide: the two gaps, later and partial | An outcome that comes later may belong to the candidate "Notification center"; a partial one to `error-recovery`. |
| 2026-10-28 | An outcome that comes later is a toast with its action, kept in the notification center (`action-later`); an action taken in charge says so at once (`action-taken`) | The person may have moved on or left: told when it comes, found again later. The notification center becomes a pattern of its own. |
| 2026-10-28 | A partial outcome goes where a failure goes (`action-partial-in-place`, `action-partial-elsewhere`); what to say and how to retry the ones that failed is `error-recovery` | The same places as a failure; the difference is in the text and in the retry. |
| 2026-11-01 | The toast of a removal, with or without Undo, is the default `light` toast; `success` is for what an action creates or completes (`removal-toast-neutral`) | A removal is a loss the person wanted, and green celebrates it; the colour follows the kind of action, not the presence of Undo. Chosen live with the domain Actions of the design language. https://github.com/magma-design-system/magma/issues/1189#issuecomment-6556983924 |
| 2026-11-01 | The session ending is a dialog that closes as Resta collegato: the default `interaction`, the `warning` window with its X; `strict` goes (`app-deadline`) | No gesture loses the work, and Esc closes it as every dialog; the focus and the meaning of closing are `deadline-close` of the domain Actions. Chosen live with the domain Actions of the design language. https://github.com/magma-design-system/magma/issues/1189#issuecomment-6558535505 |
| 2026-11-03 | An error that stops the person is `tone="strong"` in every place: a part that does not load as an action that fails (`region-failed`, `action-failed-in-place`, `action-partial-in-place`, `app-failed`) | One tone for every error; the weak tone of the drafts of 2026-10-29 read as a note. Chosen in review round 2 of the previews (https://github.com/magma-design-system/magma/issues/1233), over the weak tone. |
| 2026-11-03 | The error of a dialog stands right above its row of actions (`action-failed-in-place`) | Where the eye goes to try again; the place `actions` decided for the error of an action. Confirmed in review round 2 of the previews: https://github.com/magma-design-system/magma/issues/1233 |
| 2026-11-03 | The connection that drops is a `warning` toast that goes after its time (`app-info`) | A trouble that does not stop the work is a warning, not news; and what was written stays, so the toast need not stay. Chosen in review round 2 of the previews (https://github.com/magma-design-system/magma/issues/1233), over a toast that stays while the connection is off. |
| 2026-11-03 | Where an example of the value helps, the empty field shows one as its placeholder, "Es: ..." (`field-hint`) | The person sees the shape of the value before typing it; the hint under the field still says the rule. Asked in review round 2 of the previews: https://github.com/magma-design-system/magma/issues/1233 |
| 2026-11-13 | Each case gives the parts of its solution with their role, in the order of its preview, the stage of the preview marked `data-stage` | The `use` of a case named one part in five of what its preview shows, and no role: the agents of the products composed the rest by hand. https://github.com/magma-design-system/magma/issues/1396 |
