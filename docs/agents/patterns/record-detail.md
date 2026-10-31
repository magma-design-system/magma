---
# A Magma pattern: the format and the commands are in docs/PATTERNS.md.
id: record-detail
kind: pattern
title: Record detail
group: data
layer: magma
status: decided
need: >-
  The person opens one record to read it and act on it, then goes back to the list as it was.
principle: The page shows the record as the back end saved it, and only the actions its status allows.
keywords: [detail, record, details page, view, status, actions, tabs, documents, history, edit, back to list]
not-for:
  - need: finding the record in a long list
    use: list-with-filters
  - need: an action that cannot be taken back
    use: confirm-action
  - need: what a role may not see or do on the record
    use: permissions
  - need: two people changing the same record at the same time
    use: concurrent-editing
  - need: a record that does not exist
    use: empty-state
  - need: a record that is loading, or could not be loaded
    use: loading
assumptions:
  - The back end returns the record after every action, with its status and the actions the status allows.
  - The application knows whether other people or systems change the record while it is on screen.
high-stakes: false
components: [mds-text, mds-badge, mds-button, mds-dropdown, mds-separator, mds-tab, mds-tab-item, mds-file, mds-author, mds-modal, mds-input-field, mds-input, mds-banner]
related: [list-with-filters, message-placement, confirm-action, empty-state, loading, error-recovery, form-and-validation, concurrent-editing, permissions, page-header]
validated-on: []

variables:
  process: { values: ["yes", "no"], means: "yes: the record moves through a process, with a status, the actions the status allows and a history (a request, a payment); no: a record of data with no process (a contact, a product)" }
  action: { values: [none, at-once, with-words, edit], means: "what the person is doing: none, reading; at-once, an action that needs nothing (take in charge); with-words, an action that needs a note or a reason (request documents, close with a reason); edit, changing the data of the record" }
  changes: { values: ["no", by-others], means: "by-others: other people or systems change the record while it is on screen" }

cases:
  - { id: work-on-it, process: "yes", action: none, changes: "no", where: "back to the list; the number, the subject as the heading, the status, where it belongs and when it arrived; the actions the status allows, the main one last; the parts in tabs (data, documents, history)", use: ["mds-text tag=h1", "mds-badge", "mds-button", "mds-tab", "mds-tab-item href", "mds-file", "mds-author"] }
  - { id: read-the-data, process: "no", action: none, changes: "no", where: "back to the list; the name as the heading; Edit, and Delete last in the menu of the record, after a separator, in the error text tone with its icon (it asks first); the data as labels and values, the parts in tabs when there is more than one", use: ["mds-text tag=h1", "mds-button", "mds-dropdown", "mds-separator", "mds-button variant=error tone=text icon", "mds-text tag=dl"], see: confirm-action }
  - { id: run-at-once, action: at-once, changes: "no", where: "the button waits; then the page shows the record the back end returns, the outcome is a toast, and the focus goes to the heading when the button is gone", use: ["mds-button await"], see: message-placement }
  - { id: ask-for-words, action: with-words, changes: "no", where: "a dialog named after the action, with a required field; left empty, the field says what is missing and takes the focus; the confirm button repeats the action; a failure stays in the dialog with what was written", use: ["mds-modal", "mds-input-field", "mds-input type=textarea required", "mds-button type=submit await"] }
  - { id: edit-data, action: edit, changes: "no", where: "Edit, one of the actions the status allows, turns the page into the form, at the address of the record with /edit; Save returns to the detail with a toast and the focus on the heading; Cancel or Back return to it as it was", use: ["mds-button"], see: form-and-validation }
  - { id: record-changed, changes: by-others, action: [none, at-once, with-words], where: "nothing on screen moves by itself: a line under the identity says who changed the record and when, with Show, which loads it again; the actions on screen may no longer hold, and the line says so before the click", use: ["mds-banner variant=info", "mds-button slot=action"] }
gaps: []
not-applicable:
  - { action: edit, changes: by-others, why: "two people changing the same record at the same time is the candidate concurrent-editing" }

always-true:
  - id: status-decides-actions
    rule: Only the actions the status allows are on screen; never an action shown disabled to guess about.
    checked-by: review
  - id: main-action-last
    rule: "The main action comes last, in the strong tone; the others are outlined, `variant=\"dark\" tone=\"outline\"`; an action that destroys the record is never among them, it goes last in the menu of the record."
    checked-by: review
  - id: shows-what-was-saved
    rule: After an action the page shows the record the back end returns, never a guess of the page.
    checked-by: review
  - id: address-holds-record-and-tab
    rule: "The address holds the record and the tab: a link to the history of a record opens on its history."
    checked-by: review
  - id: back-as-it-was
    rule: Back to the list returns to it with its search, its filters and its page.
    checked-by: review
  - id: focus-to-heading
    rule: When the control of an action is gone, the focus goes to the heading of the page, never to the top of the page.
    checked-by: review
  - id: keep-the-work
    from: error-recovery
  - id: verb-not-ok
    from: confirm-action
  - id: not-an-error
    from: empty-state
  - id: nothing-moves-by-itself
    from: list-with-filters

open-choices:
  - { id: next-record, default: "none: Back returns to the list as it was", may: "add Previous and Next, which follow the query of the list, for a product that works through a queue" }

situations:
  - { situation: An operator opens a request from the list and reads its documents, case: work-on-it }
  - { situation: "A colleague sends a link to the history of a request", case: work-on-it, note: "it opens on the History tab" }
  - { situation: A contact opens from the address book, case: read-the-data }
  - { situation: A request is taken in charge, case: run-at-once }
  - { situation: "Documents are requested from the applicant, with a note", case: ask-for-words }
  - { situation: A request is closed with a reason, case: ask-for-words }
  - { situation: "An operator works through a queue of requests, one after the other", case: work-on-it, note: "Previous and Next are a choice of the product (next-record)" }
  - { situation: The address of a contact is corrected, case: edit-data }
  - { situation: A colleague takes the request in charge while it is open, case: record-changed }
  - { situation: A contact is deleted, use: confirm-action }
  - { situation: Two people change the same contact at the same time, use: concurrent-editing }
  - { situation: An address leads to a request that was deleted, use: empty-state }
---

# Record detail

**The page shows the record as the back end saved it, and only the actions its status allows.**

## When to use it

The page of one record people work on over time, opened from a list (`list-with-filters`) or a
link: a request, a payment, a document; or a record of data with no process, a contact, a
product. Something else fits better: a record with a few fields and nothing to do with it goes
in its row of the list, or in a panel next to it, with no page of its own; records to compare go
in the list, side by side in its columns.

## What decides it

Three questions: whether the record moves through a process (a status, actions, a history),
what the person is doing on it (reading, an action that needs nothing, an action that needs
words, changing its data), and whether other people change it while it is on screen.

## Cases

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

| Variable | Values | Means |
| --- | --- | --- |
| `process` | `yes`, `no` | yes: the record moves through a process, with a status, the actions the status allows and a history (a request, a payment); no: a record of data with no process (a contact, a product) |
| `action` | `none`, `at-once`, `with-words`, `edit` | what the person is doing: none, reading; at-once, an action that needs nothing (take in charge); with-words, an action that needs a note or a reason (request documents, close with a reason); edit, changing the data of the record |
| `changes` | `no`, `by-others` | by-others: other people or systems change the record while it is on screen |

A case that leaves a variable out holds for any of its values.

| Case | When | Where | Use |
| --- | --- | --- | --- |
| `work-on-it` | process: yes; action: none; changes: no | back to the list; the number, the subject as the heading, the status, where it belongs and when it arrived; the actions the status allows, the main one last; the parts in tabs (data, documents, history) | `mds-text tag=h1`, `mds-badge`, `mds-button`, `mds-tab`, `mds-tab-item href`, `mds-file`, `mds-author` |
| `read-the-data` | process: no; action: none; changes: no | back to the list; the name as the heading; Edit, and Delete last in the menu of the record, after a separator, in the error text tone with its icon (it asks first); the data as labels and values, the parts in tabs when there is more than one; see `confirm-action` | `mds-text tag=h1`, `mds-button`, `mds-dropdown`, `mds-separator`, `mds-button variant=error tone=text icon`, `mds-text tag=dl` |
| `run-at-once` | action: at-once; changes: no | the button waits; then the page shows the record the back end returns, the outcome is a toast, and the focus goes to the heading when the button is gone; see `message-placement` | `mds-button await` |
| `ask-for-words` | action: with-words; changes: no | a dialog named after the action, with a required field; left empty, the field says what is missing and takes the focus; the confirm button repeats the action; a failure stays in the dialog with what was written | `mds-modal`, `mds-input-field`, `mds-input type=textarea required`, `mds-button type=submit await` |
| `edit-data` | action: edit; changes: no | Edit, one of the actions the status allows, turns the page into the form, at the address of the record with /edit; Save returns to the detail with a toast and the focus on the heading; Cancel or Back return to it as it was; see `form-and-validation` | `mds-button` |
| `record-changed` | action: none or at-once or with-words; changes: by-others | nothing on screen moves by itself: a line under the identity says who changed the record and when, with Show, which loads it again; the actions on screen may no longer hold, and the line says so before the click | `mds-banner variant=info`, `mds-button slot=action` |

Not applicable:

| When | Why |
| --- | --- |
| action: edit; changes: by-others | two people changing the same record at the same time is the candidate concurrent-editing |

No gaps: every combination has a case or is not applicable.

## Parts

- **Back to the list**: a link that returns to the list as it was.
- **The identity**: the number of the record, small, above its subject, which is the heading of
  the page (`h1`, `tabindex="-1"` so the focus can go to it); the status as `mds-badge`; a line
  with where it belongs and when it arrived.
- **The actions**: the ones the status allows, as `mds-button`, the main one last in the strong
  tone. Back to the list, the identity and the actions are the block `page-header`.
- **The tabs**: the data, the documents and the history, one at a time (`mds-tab`), only when
  there is more than one part; a section of their own, right under the header.
- **The data**: labels and values, in two columns when there is room: a `dl` of `mds-text`
  (`tag="dt"`, `tag="dd"`).
- **The documents**: one `mds-file` for each file.
- **The history**: who did what, and when (`mds-author`), the newest first, with the note written
  with the action.

## Behaviour over time

- The first load is `loading`; a record that does not exist is the `not-found` case of
  `empty-state`; a record that could not be loaded is `retry-content` of `error-recovery`.
- An action that needs nothing runs at once; one that needs words asks for them in a dialog
  first.
- After an action the status, the actions and the history come from the answer of the back end;
  the outcome is a toast (`message-placement`); the button that ran it may be gone, so the focus
  goes to the heading.
- A failed action changes nothing: the record stays as it was, the dialog stays open with what
  was written, and a banner in it says to try again.
- When the list opened the record, Back to the list goes back in the history of the browser, and
  the list comes back with its query; from a link, it opens the list with no filters.
- A record that is deleted takes the person back to the list, with a toast (`message-placement`).
- Edit turns the page into the form, at its own address: Back leaves it, a reload keeps it. What
  is checked and when, and what happens to changes not saved, is `form-and-validation`.
- Someone else changes the record: the line says who and when ("Anna Bianchi took the request
  in charge at 10:42"), and Show loads it again. Nothing moves before that. An action sent
  meanwhile, from the page or from an open dialog, that the new status no longer allows is
  refused by the back end: `changed-meanwhile` of `error-recovery`.

## Always true

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

These hold in every product: a product layer cannot change them.

| Id | Rule | Checked by |
| --- | --- | --- |
| `status-decides-actions` | Only the actions the status allows are on screen; never an action shown disabled to guess about. | review |
| `main-action-last` | The main action comes last, in the strong tone; the others are outlined, `variant="dark" tone="outline"`; an action that destroys the record is never among them, it goes last in the menu of the record. | review |
| `shows-what-was-saved` | After an action the page shows the record the back end returns, never a guess of the page. | review |
| `address-holds-record-and-tab` | The address holds the record and the tab: a link to the history of a record opens on its history. | review |
| `back-as-it-was` | Back to the list returns to it with its search, its filters and its page. | review |
| `focus-to-heading` | When the control of an action is gone, the focus goes to the heading of the page, never to the top of the page. | review |
| `keep-the-work` | A failure never loses what the person wrote or chose. (from `error-recovery`) | review |
| `verb-not-ok` | The confirm button repeats the verb ("Delete"), never "OK" or "Yes". (from `confirm-action`) | review; a lint on the known words is possible |
| `not-an-error` | A part that failed to load is an error, never an empty state. (from `empty-state`) | review |
| `nothing-moves-by-itself` | Items added or changed by others never move what is on screen; they wait until the person asks for them. (from `list-with-filters`) | review |

## Open choices

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

The default decides these; a product layer may narrow them.

| Id | Default | A product may |
| --- | --- | --- |
| `next-record` | none: Back returns to the list as it was | add Previous and Next, which follow the query of the list, for a product that works through a queue |

## Situations

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

Situations every application has, each with its case: they give the examples, the texts and the keywords. The situations of a product's own domain go in its layer.

| Situation | Case |
| --- | --- |
| An operator opens a request from the list and reads its documents | `work-on-it` |
| A colleague sends a link to the history of a request | `work-on-it`: it opens on the History tab |
| A contact opens from the address book | `read-the-data` |
| A request is taken in charge | `run-at-once` |
| Documents are requested from the applicant, with a note | `ask-for-words` |
| A request is closed with a reason | `ask-for-words` |
| An operator works through a queue of requests, one after the other | `work-on-it`: Previous and Next are a choice of the product (next-record) |
| The address of a contact is corrected | `edit-data` |
| A colleague takes the request in charge while it is open | `record-changed` |
| A contact is deleted | not here: `confirm-action` |
| Two people change the same contact at the same time | not here: `concurrent-editing` |
| An address leads to a request that was deleted | not here: `empty-state` |

## Accessibility

- The subject is the heading of the page; the number above it and the line below are text.
- The outcome of an action is a toast in the `mds-toast-region`, read out without moving the
  focus.
- The dialog is named by its title and takes the focus when it opens; the required field says in
  words what is missing.
- The data is a description list, so every value is read with its label.
- The line of a change made by others is read out when it appears, without moving the focus.
- The documents are buttons, announced as such and opened from the keyboard (`mds-file`).

## Content

- The heading is what the record is about, "Change of residence"; the number goes above it,
  smaller: people recognise a subject, and copy a number.
- Actions are named after what they do to the record, with a verb: "Request documents", "Close
  request", never "OK" or "Proceed"; the confirm button of a dialog repeats it.
- The text of a dialog says what follows: who receives what, and whether it can be undone.
- A line of the history says who did what, and when; the note stays as it was written.
- The outcome of an action is in the past: "The request was closed."

## Magma gaps

- No component for labels and values in two columns: a `dl` of `mds-text` with `tag="dt"` and
  `tag="dd"`, laid out by the product.

## Decisions

| Date | Decision | Why |
| --- | --- | --- |
| 2026-10-29 | The status decides the actions, an action that needs words asks for them first, the page shows what the back end returns, a failed action changes nothing, the address holds the record and the tab, Back returns to the list as it was, not found is not an error | The draft page of the docs site, `patterns/record-detail`, and its example. |
| 2026-10-29 | Draft with variables; changing the data and the record changed by others left as gaps | The sources do not settle them. |
| 2026-10-29 | Edit turns the page into the form, at its own address (`edit-data`) | One rule for any length of form; Back and a reload work; the form follows `form-and-validation`. |
| 2026-10-29 | A change made by others waits behind a line with who, when and Show (`record-changed`) | As in `list-with-filters`: nothing moves under the pointer, and the person learns before the click that an action may no longer hold. |
| 2026-10-29 | Previous and Next are a product's choice (`next-record`) | Most records are opened one at a time; a product that works through a queue adds them. |
| 2026-10-31 | The actions other than the main one are outlined (`variant="dark" tone="outline"`); Delete leaves the row for the menu of the record, last after a separator, in the error text tone with its icon | The design language, #1189: `actions/secondary`, `actions/destructive-in-menu` and the severity of a deletion (level 2: the menu of the item, and a confirmation that names it). |
