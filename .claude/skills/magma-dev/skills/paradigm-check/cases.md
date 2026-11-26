# The paradigm check: cases

The requests where the maintainer's answer was not the agent's vote: a disagreement, or a
decision on a request the agent left to decide. Each case keeps the answer that is right now, so
a later judge, a new model or a changed criterion can be checked against it; the evals of the
plugin read them. Step 7 of [SKILL.md](SKILL.md) adds the cases of each round, newest round
first. A case whose answer the maintainer later changes is updated, not left behind.

Each case: what was asked, what the agent voted, what the maintainer decided and why, and where
[criterion.md](criterion.md) now holds the answer.

## Round of 2026-11-25

### #1485 The shadow of `mds-header-bar` (2026-11-25)

- Asked: a product wants a line under the bar instead of its shadow.
- Agent: Contro una regola (the band of `surfaces`/`band` is decided for every product).
- Maintainer: Altra forma. A public `--mds-header-bar-shadow`, defaulting to the token, the
  high-contrast ring outside it: customization of components is approved in general, and a shared
  look is a default, not a ban.
- In the criterion: issue point 8; the decisions.

### #1482.1 The colour of an avatar with initials (2026-11-25)

- Asked: `variant` and `tone` have no effect on an `mds-avatar` with initials.
- Agent: Già possibile (`--mds-avatar-background-color` and `--mds-avatar-color`).
- Maintainer: Altra forma. The initials override even an explicit `variant`, so the prop does not
  do what it says: an opt-in `disable-auto-variant`, the custom properties a workaround until
  then.
- In the criterion: issue point 9; the decisions.

### #1380.4 One Figma file per major (2026-11-25)

- Asked: change the decision of 2026-10-22 to keep six Figma files apart.
- Agent: Contro una regola (that decision).
- Maintainer: Accoglibile. One self-contained file per major, written in the Decisions of #1083:
  the rule was reopened by the maintainer, for every product, as the scale allows.
- In the criterion: the decisions.

### #1516.1 Long suggestions on a chip (2026-11-25)

- Asked: a clickable `mds-chip` that shows a long suggested question in full.
- Agent: Da decidere (is a suggestion a chip or a button?).
- Maintainer: first Contro una regola; step 4 found it contradicted by the chip's own Description
  and by #1272, so: Già possibile, `mds-button` with `truncate="none"`. A chip stands for a piece
  of metadata of a record and its interactions act on it; a suggestion is a command of the
  application (#1544 fixes the docs).
- In the criterion: the decisions; History v3.

### #1483 A search in the application bar (2026-11-25)

- Asked: the start of `mds-header-bar` does not grow, so a centred search needs the product's
  own layout.
- Agent: Da decidere (does the bar host a search?).
- Maintainer: first Già possibile (the `nav` slot); the second opinion showed `nav` is hidden
  below 768 px, so: Altra forma, a dedicated `search` slot; the `logo` area stays the product's.
- In the criterion: the decisions.

### #1519 Dictation that keeps the text (2026-11-25)

- Asked: starting a dictation in `mds-input` erases what was typed.
- Agent: Da decidere (may a documented default change for every product?).
- Maintainer: Altra forma. Replacing stays the default; an opt-in `mic-insert` inserts at the
  caret.
- In the criterion: issue point 9; the decisions.

### #1537.3 A value that arrives before its options (2026-11-25)

- Asked: `mds-input-select` with a `value` that matches no option yet.
- Agent: Da decidere (what `value`, the form and the validity hold meanwhile).
- Maintainer: Altra forma. First assumed the select shows the raw value; step 4 found it shows
  option text only. The field keeps the value, selects the option once it appears, and does not
  submit it meanwhile (`valueMissing` while required); the right label from the start is already
  possible by slotting the current option first.
- In the criterion: the decisions.
