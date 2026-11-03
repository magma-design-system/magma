---
# A domain of Foundation, the design language (#1189): the format and the commands are in
# docs/PATTERNS.md, "A domain of Foundation". The check says what is still missing:
# nx run stencil:check.patterns (after nx run stencil:build).
id: actions
kind: foundation
title: Actions
layer: magma
status: decided
need: >-
  Tell at a glance which action moves the task forward, which ones stand beside it, and which
  ones destroy, and find them in the same place on every screen.
principle: >-
  The weight of an action says its role: one primary action per view in the accent, the others
  outlined, a destructive one away from the row of an edit; the main action of a row is always
  the last.
keywords: [action, button, primary action, secondary action, cancel, delete, destructive, danger zone, dismiss, close, order of buttons, button row, toast action, banner action]
assumptions:
  - "The actions are mds-button; a link that only navigates is a link."
  - "A view is the page, or a dialog while it is open."
components: [mds-button, mds-separator, mds-modal, mds-banner, mds-toast, mds-card-footer, mds-status-bar]
related: [surfaces, widths, titles, confirm-action, message-placement]
validated-on: []

variables:
  region:
    values: [page, part, dialog, banner, toast]
    means: "Where the action stands: a page (the column of a form, the header of the page); a part (a card, a panel with an action of its own); a dialog whose window announces no state (a form, a choice, a confirmation); a banner that announces a state, or a dark one, the window of the deadline dialog included; a toast."
  role:
    values: [main, secondary, destructive, dismiss]
    means: "What the action does: moves the task of its region forward; stands beside the main action and destroys nothing (Annulla, Salva come bozza, Anteprima); destroys or removes something; closes the region."
  severity:
    values: [remove, delete, delete-with-consequences]
    means: "For a destructive action, from the model: it can be put back (an attachment off a draft, an item off a list); it deletes an entity alone (a note); it takes other things with it, linked records or the data of other people (a request with its attachments, contacts and protocol)."

cases:
  - id: primary
    region: [page, dialog]
    role: main
    where: "`variant=\"primary\" tone=\"strong\"`, the default of mds-button, one per view at most: the view and its parts count, the actions of a banner do not (they belong to its state); a page made only of cards, each with its own action, has none"
    use: ["mds-button variant=primary tone=strong"]
    serves: intuitive
    carried-by: [mds-button]
  - id: part-primary
    region: part
    role: main
    where: "`variant=\"primary\" tone=\"outline\"`, in the accent one tone under strong; a part whose action is the primary action of the view (the only card of a sign-in page) keeps `strong`"
    use: ["mds-button variant=primary tone=outline"]
    serves: intuitive
  - id: secondary
    region: [page, part, dialog]
    role: secondary
    where: "`variant=\"dark\" tone=\"outline\"`, right before the main action"
    use: ["mds-button variant=dark tone=outline"]
    serves: intuitive
  - id: remove
    region: [page, part]
    role: destructive
    severity: remove
    where: "next to the item, a neutral icon button `variant=\"dark\" tone=\"text\"` whose aria-label names the item; no confirmation: a toast says what was removed and offers Ripristina (`toast`)"
    use: ["mds-button variant=dark tone=text icon aria-label"]
    serves: enabling
  - id: destructive-in-menu
    region: [page, part]
    role: destructive
    severity: delete
    where: "in the contextual menu of the entity, the last entry after an mds-separator: Elimina `variant=\"error\" tone=\"text\"` with its icon; the confirmation is a dialog (`confirm`)"
    use: ["mds-separator", "mds-button variant=error tone=text icon"]
    serves: enabling
  - id: danger-zone
    region: [page, part]
    role: destructive
    severity: delete-with-consequences
    where: "in the danger zone of the page or of the settings of the entity: the last section, with a border of its own, one row per action with its title, its consequence written next to it and its button `variant=\"error\" tone=\"outline\"`; the confirmation is a dialog that lists what goes with the entity and asks to type its name or number (`confirm`)"
    use: ["mds-button variant=error tone=outline"]
    serves: enabling
  - id: confirm
    region: dialog
    role: destructive
    severity: [delete, delete-with-consequences]
    where: "the dialog that confirms it names the entity and says it cannot be recovered: Elimina `variant=\"error\" tone=\"strong\"` last, Annulla `variant=\"dark\" tone=\"outline\"` before it with `autofocus`; for delete-with-consequences it lists what goes with the entity, Elimina stays disabled until the name or number typed matches, and the focus goes to the field"
    use: ["mds-button variant=error tone=strong", "mds-button variant=dark tone=outline"]
    serves: enabling
  - id: dismiss
    region: dialog
    role: dismiss
    where: "an X inside the window, at the end of the title row: the window is `mds-banner slot=\"window\" dismissible`, whose X closes the mds-modal around it; a dialog with a row of actions also has Annulla in the row"
    use: ["mds-modal", "mds-banner slot=window dismissible"]
    serves: intuitive
    carried-by: [mds-banner slot=window dismissible]
  - id: banner
    region: banner
    role: [main, secondary]
    where: "the variant of the banner (`primary`, `ai`, `info`, `success`, `warning`, `error`), the main action `tone=\"strong\"`, the secondary `tone=\"outline\"`; on a `dark` banner the opposite neutral, `variant=\"light\"`; a `light` banner announces nothing, and as the window of a dialog its row follows the dialog"
    use: ["mds-button slot=action tone=strong", "mds-button slot=action tone=outline"]
    serves: intuitive
  - id: toast
    region: toast
    role: main
    where: "`size=\"sm\" tone=\"outline\"` in the variant of the toast; on the default `light` toast the opposite neutral, `variant=\"dark\"`; a toast with an action stays until the person acts, `duration=\"0\"` and `dismissible` (`toast-action-stays` of message-placement)"
    use: ["mds-toast duration=0 dismissible", "mds-button slot=action size=sm tone=outline"]
    serves: intuitive
  - id: dismiss-message
    region: [banner, toast]
    role: dismiss
    where: "the X the component draws, `dismissible`, in the colour that reads on its variant; a banner inside a dialog is never dismissible, its window apart (`no-dismissible-banner-in-dialog` of message-placement)"
    use: ["mds-banner dismissible", "mds-toast dismissible"]
    serves: intuitive
    carried-by: [mds-banner dismissible, mds-toast dismissible]

gaps: []
not-applicable:
  - { region: page, role: dismiss, why: "a page is left by its way back or by the navigation of the application, never dismissed" }
  - { region: part, role: dismiss, why: "a card or a panel is not dismissed: a message that can be is a banner or a toast" }
  - { region: dialog, role: destructive, severity: remove, why: "removing what can be put back asks no confirmation (severity)" }
  - { region: [banner, toast], role: destructive, why: "a destructive action has two places, the menu of its entity and its danger zone (destructive): a message is neither" }
  - { region: toast, role: secondary, why: "a toast offers one follow-up of its message; a choice between two actions is a decision, which message-placement gives to a dialog" }

always-true:
  - id: place
    rule: "The row of actions that closes a form, a dialog, a card or a banner stands at the end of its container; in the form of a page, at the end of its column (widths/form). A form that is the whole page docks its row in mds-status-bar (surfaces/edit-actions)."
    serves: intuitive
    checked-by: review
    carried-by: [mds-card-footer, mds-banner]
  - id: order
    rule: "In a row of actions the main action is the last, on the edge, with the secondary action right before it: the order of the code, which is the order of Tab."
    serves: [intuitive, inclusive]
    checked-by: review
  - id: stacked
    rule: "A row stacks under 380 px of its container (`--magma-container-actions`, `@max-actions:` in a class), a container query, the same threshold for every row: every button at the full width, in the order of the row, the main action at the bottom; above it the row stays on one line, never a ragged wrap where one button drops to a line of its own."
    serves: inclusive
    checked-by: review
    carried-by: [mds-banner, mds-card-footer, mds-status-bar]
  - id: at-most-three
    rule: "A row has at most three actions, and the labels of a row of three fit in 380 px with their gaps: the threshold of `stacked` is computed on them. Beyond three, the menu of the item takes one of the places (`more-in-menu`)."
    serves: intuitive
    checked-by: review
  - id: more-in-menu
    rule: "When an item has more than three actions, its row keeps the main action, the secondary used most and the menu of the item, at the start of the row: an icon-only mds-button (more_vert, variant=\"dark\" tone=\"text\", an aria-label that names the item) with mds-dropdown. The menu holds the other actions, and Elimina last after an mds-separator (`destructive-in-menu`): one menu per item."
    serves: intuitive
    checked-by: review
  - id: destructive
    rule: "A destructive action never stands in the row of the actions of an edit in progress: it has two places, the contextual menu of its entity and the danger zone of its page, and its distance from the other actions grows with the severity of its consequences."
    serves: enabling
    checked-by: review
  - id: severity
    rule: "The level of a destructive action comes from the model, with two questions: can it be put back (remove)? does it take other things with it, linked records or the data of other people (delete-with-consequences, otherwise delete)? Place, confirmation and words grow with the level."
    serves: enabling
    checked-by: review
  - id: failed
    rule: "When the action of a dialog fails, its error stands right above the row of actions, an mds-banner variant=\"error\" tone=\"strong\" that is not dismissible; what was written stays, and the focus stays on the action, which is the retry: no Riprova button."
    serves: [enabling, inclusive]
    checked-by: review
  - id: deadline-close
    rule: "The deadline dialog opens with the focus on Resta collegato (`autofocus`), the simple action that extends the session, and closing it, with its X, Esc or the backdrop, means Resta collegato: mds-modal keeps the default interaction, relaxed, the window keeps its X, and the application extends the session on mdsModalClose; only Esci ends it."
    serves: [inclusive, enabling]
    checked-by: review

open-choices: []

situations:
  - { situation: "Salva at the end of the form New request", case: primary }
  - { situation: "Annulla next to Salva", case: secondary }
  - { situation: "Salva come bozza next to Invia", case: secondary }
  - { situation: "Scarica, the action of the card of a document", case: part-primary }
  - { situation: "An attachment taken off a draft", case: remove }
  - { situation: "Delete a note", case: destructive-in-menu }
  - { situation: "Delete a request with its attachments, contacts and protocol", case: danger-zone }
  - { situation: "Elimina in the dialog that confirms the deletion of a note", case: confirm }
  - { situation: "The X of the dialog New contact", case: dismiss }
  - { situation: "Resta collegato in the warning that the session is about to end", case: banner, note: "a warning window: Resta collegato warning strong, Esci warning outline; the focus on Resta collegato, and closing the dialog means it (`deadline-close`)" }
  - { situation: "Usa la descrizione in an ai banner that offers a text written by the assistant", case: banner }
  - { situation: "Riprova in an error toast", case: toast }
  - { situation: "Ripristina in the toast of an attachment removed", case: toast, note: "dark outline on the default light toast, the toast of a removal (`removal-toast-neutral` of message-placement)" }
  - { situation: "Close an info banner on a page", case: dismiss-message }
---

# Actions

**The weight of an action says its role: one primary action per view in the accent, the others outlined, a destructive one away from the row of an edit; the main action of a row is always the last.**

## When to use it

Every time a screen offers an action: the row that closes a form, a dialog, a card or a banner;
the action of a toast; the X that closes a dialog or a message; an action that removes or
deletes. The region and the role pick the form; the place and the order are the same
everywhere.

Not here: when an action needs a confirmation and what follows it (`confirm-action`), where a
message goes (`message-placement`), and the spacing of a row (`rhythm/inline`).

## What decides it

Two questions, and a third for what destroys. Where does the action stand: a page, a part with
an action of its own, a dialog, a banner, a toast? What does it do: move the task forward, stand
beside the main action, destroy, close? A destructive action is placed by its severity, found
from the model: whether it can be put back, and whether it takes other things with it.

## Cases

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

| Variable | Values | Means |
| --- | --- | --- |
| `region` | `page`, `part`, `dialog`, `banner`, `toast` | Where the action stands: a page (the column of a form, the header of the page); a part (a card, a panel with an action of its own); a dialog whose window announces no state (a form, a choice, a confirmation); a banner that announces a state, or a dark one, the window of the deadline dialog included; a toast. |
| `role` | `main`, `secondary`, `destructive`, `dismiss` | What the action does: moves the task of its region forward; stands beside the main action and destroys nothing (Annulla, Salva come bozza, Anteprima); destroys or removes something; closes the region. |
| `severity` | `remove`, `delete`, `delete-with-consequences` | For a destructive action, from the model: it can be put back (an attachment off a draft, an item off a list); it deletes an entity alone (a note); it takes other things with it, linked records or the data of other people (a request with its attachments, contacts and protocol). |

A case that leaves a variable out holds for any of its values.

| Case | When | Where | Use | Serves | Carried by |
| --- | --- | --- | --- | --- | --- |
| `primary` | region: page or dialog; role: main | `variant="primary" tone="strong"`, the default of mds-button, one per view at most: the view and its parts count, the actions of a banner do not (they belong to its state); a page made only of cards, each with its own action, has none | `mds-button variant=primary tone=strong` | intuitive | `mds-button` |
| `part-primary` | region: part; role: main | `variant="primary" tone="outline"`, in the accent one tone under strong; a part whose action is the primary action of the view (the only card of a sign-in page) keeps `strong` | `mds-button variant=primary tone=outline` | intuitive | the guide |
| `secondary` | region: page or part or dialog; role: secondary | `variant="dark" tone="outline"`, right before the main action | `mds-button variant=dark tone=outline` | intuitive | the guide |
| `remove` | region: page or part; role: destructive; severity: remove | next to the item, a neutral icon button `variant="dark" tone="text"` whose aria-label names the item; no confirmation: a toast says what was removed and offers Ripristina (`toast`) | `mds-button variant=dark tone=text icon aria-label` | enabling | the guide |
| `destructive-in-menu` | region: page or part; role: destructive; severity: delete | in the contextual menu of the entity, the last entry after an mds-separator: Elimina `variant="error" tone="text"` with its icon; the confirmation is a dialog (`confirm`) | `mds-separator`, `mds-button variant=error tone=text icon` | enabling | the guide |
| `danger-zone` | region: page or part; role: destructive; severity: delete-with-consequences | in the danger zone of the page or of the settings of the entity: the last section, with a border of its own, one row per action with its title, its consequence written next to it and its button `variant="error" tone="outline"`; the confirmation is a dialog that lists what goes with the entity and asks to type its name or number (`confirm`) | `mds-button variant=error tone=outline` | enabling | the guide |
| `confirm` | region: dialog; role: destructive; severity: delete or delete-with-consequences | the dialog that confirms it names the entity and says it cannot be recovered: Elimina `variant="error" tone="strong"` last, Annulla `variant="dark" tone="outline"` before it with `autofocus`; for delete-with-consequences it lists what goes with the entity, Elimina stays disabled until the name or number typed matches, and the focus goes to the field | `mds-button variant=error tone=strong`, `mds-button variant=dark tone=outline` | enabling | the guide |
| `dismiss` | region: dialog; role: dismiss | an X inside the window, at the end of the title row: the window is `mds-banner slot="window" dismissible`, whose X closes the mds-modal around it; a dialog with a row of actions also has Annulla in the row | `mds-modal`, `mds-banner slot=window dismissible` | intuitive | `mds-banner slot=window dismissible` |
| `banner` | region: banner; role: main or secondary | the variant of the banner (`primary`, `ai`, `info`, `success`, `warning`, `error`), the main action `tone="strong"`, the secondary `tone="outline"`; on a `dark` banner the opposite neutral, `variant="light"`; a `light` banner announces nothing, and as the window of a dialog its row follows the dialog | `mds-button slot=action tone=strong`, `mds-button slot=action tone=outline` | intuitive | the guide |
| `toast` | region: toast; role: main | `size="sm" tone="outline"` in the variant of the toast; on the default `light` toast the opposite neutral, `variant="dark"`; a toast with an action stays until the person acts, `duration="0"` and `dismissible` (`toast-action-stays` of message-placement) | `mds-toast duration=0 dismissible`, `mds-button slot=action size=sm tone=outline` | intuitive | the guide |
| `dismiss-message` | region: banner or toast; role: dismiss | the X the component draws, `dismissible`, in the colour that reads on its variant; a banner inside a dialog is never dismissible, its window apart (`no-dismissible-banner-in-dialog` of message-placement) | `mds-banner dismissible`, `mds-toast dismissible` | intuitive | `mds-banner dismissible`, `mds-toast dismissible` |

Not applicable:

| When | Why |
| --- | --- |
| region: page; role: dismiss | a page is left by its way back or by the navigation of the application, never dismissed |
| region: part; role: dismiss | a card or a panel is not dismissed: a message that can be is a banner or a toast |
| region: dialog; role: destructive; severity: remove | removing what can be put back asks no confirmation (severity) |
| region: banner or toast; role: destructive | a destructive action has two places, the menu of its entity and its danger zone (destructive): a message is neither |
| region: toast; role: secondary | a toast offers one follow-up of its message; a choice between two actions is a decision, which message-placement gives to a dialog |

No gaps: every combination has a case or is not applicable.

## Parts

The weights of a view:

| Action | Form | Rule |
| --- | --- | --- |
| The primary action of the view, one at most | `variant="primary" tone="strong"` | `primary` |
| The main action of a part | `variant="primary" tone="outline"` | `part-primary` |
| An action beside a main one, that destroys nothing | `variant="dark" tone="outline"` | `secondary` |

The actions of a banner, by its variant:

| Banner | Main action | Secondary action |
| --- | --- | --- |
| `primary`, `ai`, `info`, `success`, `warning`, `error` | the variant of the banner, `tone="strong"` | the variant of the banner, `tone="outline"` |
| `dark` | `variant="light" tone="strong"` | `variant="light" tone="outline"` |
| `light` (the window of a dialog) | the dialog: `primary strong` | `dark outline` |

A destructive action, by its severity:

| Level | When | Place | Confirmation | Form |
| --- | --- | --- | --- | --- |
| `remove` | it can be put back | next to the item | none: a toast with Ripristina | `variant="dark" tone="text"`, an icon, an `aria-label` that names the item |
| `delete` | an entity alone, that takes nothing with it | the menu of the entity, last after a separator | a dialog that names it and says it cannot be recovered | Elimina `variant="error" tone="text"`; in the dialog `error strong` |
| `delete-with-consequences` | it takes linked records or the data of other people | the danger zone of the page of the entity | a dialog that lists what goes with it and asks to type its name or number | `variant="error" tone="outline"`; in the dialog `error strong` |

## Behaviour over time

- A confirmation opens with the focus on Annulla, the least destructive control, one Tab from
  Elimina; at `delete-with-consequences` the focus goes to the field to type in, and Elimina
  stays disabled until the text matches.
- When the action of a dialog fails, the error appears right above the row, where the focus and
  the eye already are (`failed`); the window keeps its variant.
- A toast with an action stays until the person acts or closes it.
- The deadline dialog opens with the focus on Resta collegato; its X, Esc and the backdrop close
  it as Resta collegato does, and only Esci ends the session (`deadline-close`).

## Always true

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

These hold in every product: a product layer cannot change them.

| Id | Rule | Serves | Carried by | Checked by |
| --- | --- | --- | --- | --- |
| `place` | The row of actions that closes a form, a dialog, a card or a banner stands at the end of its container; in the form of a page, at the end of its column (widths/form). A form that is the whole page docks its row in mds-status-bar (surfaces/edit-actions). | intuitive | `mds-card-footer`, `mds-banner` | review |
| `order` | In a row of actions the main action is the last, on the edge, with the secondary action right before it: the order of the code, which is the order of Tab. | intuitive, inclusive | the guide | review |
| `stacked` | A row stacks under 380 px of its container (`--magma-container-actions`, `@max-actions:` in a class), a container query, the same threshold for every row: every button at the full width, in the order of the row, the main action at the bottom; above it the row stays on one line, never a ragged wrap where one button drops to a line of its own. | inclusive | `mds-banner`, `mds-card-footer`, `mds-status-bar` | review |
| `at-most-three` | A row has at most three actions, and the labels of a row of three fit in 380 px with their gaps: the threshold of `stacked` is computed on them. Beyond three, the menu of the item takes one of the places (`more-in-menu`). | intuitive | the guide | review |
| `more-in-menu` | When an item has more than three actions, its row keeps the main action, the secondary used most and the menu of the item, at the start of the row: an icon-only mds-button (more_vert, variant="dark" tone="text", an aria-label that names the item) with mds-dropdown. The menu holds the other actions, and Elimina last after an mds-separator (`destructive-in-menu`): one menu per item. | intuitive | the guide | review |
| `destructive` | A destructive action never stands in the row of the actions of an edit in progress: it has two places, the contextual menu of its entity and the danger zone of its page, and its distance from the other actions grows with the severity of its consequences. | enabling | the guide | review |
| `severity` | The level of a destructive action comes from the model, with two questions: can it be put back (remove)? does it take other things with it, linked records or the data of other people (delete-with-consequences, otherwise delete)? Place, confirmation and words grow with the level. | enabling | the guide | review |
| `failed` | When the action of a dialog fails, its error stands right above the row of actions, an mds-banner variant="error" tone="strong" that is not dismissible; what was written stays, and the focus stays on the action, which is the retry: no Riprova button. | enabling, inclusive | the guide | review |
| `deadline-close` | The deadline dialog opens with the focus on Resta collegato (`autofocus`), the simple action that extends the session, and closing it, with its X, Esc or the backdrop, means Resta collegato: mds-modal keeps the default interaction, relaxed, the window keeps its X, and the application extends the session on mdsModalClose; only Esci ends it. | inclusive, enabling | the guide | review |

## Situations

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

Situations every application has, each with its case: they give the examples, the texts and the keywords. The situations of a product's own domain go in its layer.

| Situation | Case |
| --- | --- |
| Salva at the end of the form New request | `primary` |
| Annulla next to Salva | `secondary` |
| Salva come bozza next to Invia | `secondary` |
| Scarica, the action of the card of a document | `part-primary` |
| An attachment taken off a draft | `remove` |
| Delete a note | `destructive-in-menu` |
| Delete a request with its attachments, contacts and protocol | `danger-zone` |
| Elimina in the dialog that confirms the deletion of a note | `confirm` |
| The X of the dialog New contact | `dismiss` |
| Resta collegato in the warning that the session is about to end | `banner`: a warning window: Resta collegato warning strong, Esci warning outline; the focus on Resta collegato, and closing the dialog means it (`deadline-close`) |
| Usa la descrizione in an ai banner that offers a text written by the assistant | `banner` |
| Riprova in an error toast | `toast` |
| Ripristina in the toast of an attachment removed | `toast`: dark outline on the default light toast, the toast of a removal (`removal-toast-neutral` of message-placement) |
| Close an info banner on a page | `dismiss-message` |

## Accessibility

- The visual order of a row is the order of the code and of Tab (WCAG 2.4.3): the main action
  last in the row, at the bottom when the row stacks, never moved with `column-reverse`.
- The icon button that removes an item has an `aria-label` that names the item ("Rimuovi
  allegato verbale.pdf"), not only the verb.
- The focus of a confirmation goes to Annulla, as the WAI-ARIA Authoring Practices advise for a
  step that cannot be undone: `autofocus` on the button, which the `dialog` of `mds-modal`
  honours.
- The button of the menu of an item is an icon with an `aria-label` that names the item
  ("Azioni della pratica"), not a bare "Altro".
- The error of a failed action is the only live region of an ordinary dialog
  (`role="alert"`): a screen reader reads the error, not the whole form.
- The deadline dialog warns before the time runs out and extends it with one simple action,
  Invio on Resta collegato (WCAG 2.2.1); Esc closes it as every dialog (WAI-ARIA Authoring
  Practices), without ending the session.

## Content

- Actions are verbs on what they act on: "Salva", "Invia pratica", "Elimina nota".
- The confirmation of a deletion names the entity and says it cannot be recovered; at
  `delete-with-consequences` it lists what goes with it.
- The way out of a dialog is "Annulla" in the row; the X closes and is named "Chiudi".
- A row has at most three actions, with short labels: the three fit in 380 px
  (`at-most-three`); the others go in the menu of the item (`more-in-menu`).

## Magma gaps

- The X of `mds-banner` is named after the locale key `cancel` ("Annulla"), so a dialog with
  Annulla in its row has two buttons with the same name: the X closes, and its name is the key
  `close` ("Chiudi"), as the X of `mds-modal`.
- `mds-banner` keeps its X in a column beside the whole body: `dismiss` puts it at the end of
  the title row (`widths/dialog`).
- The guide of `mds-modal` calls the slot `window` a bespoke surface: the banner window becomes
  its first pattern, and the examples that write their own bands move to it.
- The planned lint `magma/no-dismissible-banner-in-modal` leaves out the banner of the window
  (`slot="window"`), whose X is there to close the dialog.
- The examples of the components teach other forms, and move with the step "the examples of the
  components aligned" of #1189: the secondary action as `dark weak` (`mds-status-bar`),
  `dark text` (`mds-card`, `mds-card-footer`, `mds-button-group`), `primary text` (`mds-modal`)
  or `primary outline` (`mds-input-upload`, `mds-button-group`); the pattern "Variant and Tone
  for Emphasis" of `mds-button`; the forms of a page with the main action first (`mds-button`,
  `mds-input`, `mds-input-upload`, `mds-button-group`); Elimina in a row of `mds-button-group`
  and the menus of `mds-dropdown` with no separator; the action of `mds-toast` in
  `tone="weak"`, two of them with no `duration="0"`; the subscription to renew of `mds-banner`
  (a `primary` banner, not `warning`) and its decorative actions in `light text`; the single
  call to action of `mds-card-footer` in `primary weak`.

## Decisions

| Date | Decision | Why |
| --- | --- | --- |
| 2026-10-30 | An action beside the primary action of its group that destroys nothing is `variant="dark" tone="outline"` (`secondary`); the rule of the docs site, one primary action per view in the accent, gets its id (`primary`). | It stays a button, as tall as the primary action, one tone under `strong`; the most frequent form in the examples of the components, and it leaves `tone="text"` the actions inside text and toolbars. Rejected: `dark text`, a target with no shape; `dark weak`, two filled surfaces side by side. Chosen live, in light and in dark. https://github.com/magma-design-system/magma/issues/1189#issuecomment-6520476709 |
| 2026-10-30 | The main action of a part that is not the primary action of the view is `variant="primary" tone="outline"` (`part-primary`). | The primary action of the view, the action of a part and the secondary one read apart; a view has at most one `strong`. Accepted: in dark the action of a part weighs as a secondary one. Rejected: `dark outline`; `primary weak`, whose fill outweighs the primary action in dark. Chosen live. https://github.com/magma-design-system/magma/issues/1189#issuecomment-6520574528 |
| 2026-10-30 | The actions of a warning banner take its variant, `warning strong` and `warning outline` (`banner`). | Its actions deal with the problem it announces; the variant follows the meaning of the message, not its urgency: a subscription to renew is a `primary` banner. Chosen live against the rules of every part. https://github.com/magma-design-system/magma/issues/1189#issuecomment-6520774348 |
| 2026-10-30 | The actions of every banner take its variant, the main `strong`, the secondary `outline`; they are not counted among the actions of the view (`banner`, `primary`). | The actions address the state of the banner, whatever it is. Rejected: the variant for problems only. Chosen live. https://github.com/magma-design-system/magma/issues/1189#issuecomment-6521007819 |
| 2026-10-30 | A destructive action never stands in the row of an edit: it goes in the menu of its entity, Elimina `error text` with its icon, last after a separator (`destructive`, `destructive-in-menu`). | Editing an entity and managing it are two levels; the colour states the consequence before the gesture, with every input. Rejected: a neutral entry that turns red on hover and focus, which touch never shows. Chosen live; the first comparison, Elimina in the row, was discarded as the wrong situation. https://github.com/magma-design-system/magma/issues/1189#issuecomment-6521407269 |
| 2026-10-30 | The second place of a destructive action is a danger zone of the page or the settings of the entity (`danger-zone`). | The proposal of the maintainer, after the Danger Zone of the settings of a GitHub repository: the last section, one row per action with its consequence. https://github.com/magma-design-system/magma/issues/1189#issuecomment-6521463304 |
| 2026-10-30 | Three levels of severity, from two questions on the model: remove, delete, delete with consequences, each with its place, confirmation and form (`severity`, `remove`, `confirm`). | Place, confirmation and words grow with the severity, and an agent finds the level from the model instead of judging it; removing what can be put back is neutral, not red. Rejected: two levels by reversibility only. Chosen live. https://github.com/magma-design-system/magma/issues/1189#issuecomment-6521616698 |
| 2026-10-30 | Ripristina, in the toast of level 1, is `dark weak` on the default toast. Superseded by `toast` the same day: `dark outline`. | On the `light` toast a `light weak` button reads as text in light and as a black block in dark. https://github.com/magma-design-system/magma/issues/1189#issuecomment-6521899446 |
| 2026-10-30 | The row of actions of a form, a dialog, a card or a banner stands at the end of its container, the main action last (`place`, `order`). | The main action is always in the same place, forward is to the right, and `mds-card-footer` and `mds-banner` already do it. Accepted: in a long form the eye crosses the column. Rejected: a page at the start with the main action first (GOV.UK), two orders. Chosen live. https://github.com/magma-design-system/magma/issues/1189#issuecomment-6523314326 |
| 2026-10-30 | A row that does not fit stacks at full width in the order of the row, the main action at the bottom (`stacked`). | One order read from top to bottom, the order of Tab (WCAG 2.4.3), and the main action near the thumb. Rejected: the main action on top; the row split in equal parts, where a long label is cut. Chosen live on a narrow screen. https://github.com/magma-design-system/magma/issues/1189#issuecomment-6523478732 |
| 2026-10-30 | A dialog closes from an X inside its window, at the end of the title row; with a row of actions it also has Annulla; a dialog is `mds-modal` with `mds-banner slot="window" dismissible` (`dismiss`). | The X stands next to what it closes, as in Carbon and Primer, and every dialog has one. Rejected: the X on the backdrop, far from the window on a wide screen; Annulla alone, two forms of dialog. Chosen live. https://github.com/magma-design-system/magma/issues/1189#issuecomment-6523964842 |
| 2026-10-30 | The row of an ordinary dialog, whose window is `light`, follows the dialog: the main action `primary strong`, Annulla `dark outline` (`primary`, `secondary`). | A `light` window announces no state for its actions to address. https://github.com/magma-design-system/magma/issues/1189#issuecomment-6524036553 |
| 2026-10-30 | A confirmation keeps the `light` window: Elimina `error strong`, Annulla `dark outline` (`confirm`). | The red stands on the action with the consequence. https://github.com/magma-design-system/magma/issues/1189#issuecomment-6524149839 |
| 2026-10-30 | When a confirmation opens, the focus goes to Annulla, with `autofocus` (`confirm`). | The WAI-ARIA Authoring Practices advise the least destructive action for a step that cannot be undone. Rejected: the focus on the X, where the banner window puts it. Chosen on the build. https://github.com/magma-design-system/magma/issues/1189#issuecomment-6524205353 |
| 2026-10-30 | The error of an action that fails inside a dialog stands right above its row, `mds-banner variant="error" tone="strong"`, not dismissible (`failed`). | The error talks about the action, and the focus stays on it; a message at the top of a long dialog can be out of view. Rejected: `tone="weak"`, a card inside the card. Chosen live; the layout shift measured (CLS 0.013, under the 0.1 of a good page). https://github.com/magma-design-system/magma/issues/1189#issuecomment-6524836581 |
| 2026-10-30 | The deadline dialog, the one dialog that announces a state, has a `warning` window and its row follows `banner` (`banner`). | It announces a problem the person did not ask for, and its actions address it. https://github.com/magma-design-system/magma/issues/1189#issuecomment-6525103424 |
| 2026-10-30 | The actions of an `ai` banner take its variant, as in every banner (`banner`). | `ai` is an accent like `primary`, and the colour tells that pressing brings generated text in. Rejected: the rules of a part, an exception for one accent. Chosen live. https://github.com/magma-design-system/magma/issues/1189#issuecomment-6525181504 |
| 2026-10-30 | The actions of a `dark` banner are `light strong` and `light outline` (`banner`). | The surface leaves no choice: on the build only `light` reads in both modes, as the X the component already draws. Shown as one option and confirmed. https://github.com/magma-design-system/magma/issues/1189#issuecomment-6525286729 |
| 2026-10-30 | The action of a toast is `size="sm" tone="outline"` in the variant of the toast, `dark` on the default `light` toast, and the toast stays until the person acts (`toast`). | The outline reads as a button in every toast and in both modes, and it does not compete with the main action of the view. Rejected: `strong`, a filled block over the page; `dark weak` in every toast. The `weak` of the guide of `mds-toast` reads as text. Chosen live on two toasts of the patterns. https://github.com/magma-design-system/magma/issues/1189#issuecomment-6525391988 |
| 2026-10-31 | The file of the domain: three variables (region, role, severity) whose combinations each have one answer; the rule one primary action per view moves here from the Color page of the docs site (`primary`), which keeps its reason. | The issue of the five domains (#1197). |
| 2026-11-01 | The toast with Ripristina after a removal is the default `light` toast, and Ripristina `dark outline` (`toast`); the rule of every removal goes to `message-placement` (`removal-toast-neutral`) and `confirm-action`. | Green would celebrate a loss the person wanted; on the neutral toast no colour judges the removal or Ripristina, and the action keeps the rule of every toast. Rejected: `success`, as `confirm-action` gave it; Ripristina `success weak` on the neutral toast, which puts the green back on the button that undoes the choice and makes it look suggested. Chosen live, in light and in dark. https://github.com/magma-design-system/magma/issues/1189#issuecomment-6556983924 |
| 2026-11-01 | The deadline dialog opens with the focus on Resta collegato, and closing it, with its X, Esc or the backdrop, means Resta collegato: the default `interaction`, the X of the window kept, the session extended on `mdsModalClose` (`deadline-close`). | No gesture loses the work; Esc closes it as every dialog (WAI-ARIA Authoring Practices, the timeout warning of HMRC), and the X keeps one meaning, the safe answer; the focus makes Invio the simple action of WCAG 2.2.1. Rejected: no X and `strict`, the forced action of USWDS, an exception to `dismiss` where Esc does nothing. Chosen live, the behaviour checked on the build. https://github.com/magma-design-system/magma/issues/1189#issuecomment-6558535505 |
| 2026-11-01 | A row stacks under 380 px of its container, 23.75rem, a container query with one threshold for every row (`stacked`); a row has at most three actions, whose labels fit in 380 px (`at-most-three`). | CSS only, no script or observer for a rule of layout; three actions at most make the threshold computable: the rows of the patterns need up to 270 px with two actions and 365 px with three. The value is the maintainer's. Rejected: measuring whether the buttons fit (Material), with a `ResizeObserver` or the Switcher of Every Layout; a threshold by number of actions; `--container-xs`, under which a row of three goes ragged; the media query at 480 px, blind to the container. https://github.com/magma-design-system/magma/issues/1189#issuecomment-6560982526 |
| 2026-11-01 | With more than three actions, the row keeps the main one, the secondary used most and the menu of the item at its start, which holds the others and Elimina last after a separator (`more-in-menu`). | One menu per item, the one that already holds Elimina; the secondary stays right before the main action (`order`), and the menu, far from it, reads as the rest. Rejected: the menu right before the main action, which parts the secondary from it; the arrow of the main action, `mds-button-dropdown`, which reads as another way of doing it and would put Elimina under it or make two menus. Chosen live on the header of a request. https://github.com/magma-design-system/magma/issues/1189#issuecomment-6561221595 |
| 2026-11-02 | The threshold of `stacked` is the role `--magma-container-actions`, which the Tailwind theme bridges as the container size `actions` with its literal (`@max-actions:`); `mds-banner`, `mds-card-footer` and `mds-status-bar` stack under it. | A container query reads no `var()`, so the bridge holds the literal and the sheets read it at build time with `--theme()`; the name follows the roles of Magma (`--magma-width-*`). Review round 1 of #1189. |
