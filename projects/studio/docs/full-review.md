# The full review

The last stage: every theme judged in every mode it is used in before the exit, each marked as
looked at until a change touches it.

Addresses: `#/full-review`, and `#/full-review/<theme>/<light|dark>`, the item at the centre
(alias `#/colors/contrast-check`, the Contrast check page it was).

The **full review** (`src/features/full-review/`; the Contrast check page of #698 and #1401 until
#1404) is the verification of the object model (sections 4 and 5, "Giro completo"): each stage
shows the contrast gate on what it edits, the full review the whole of it
([The contrast gate](../README.md#the-contrast-gate)). Every theme in every mode it is used in is
an item of the list beside, grouped by theme, light before dark (`reviewItems` of
`src/engine/review.ts`): a link that says how the item stands for the person in its icon and its
name, never in the colour alone (not looked at, looked at, changed after the look), with a badge
of the pairs that block it. The list stands beside the page as in Colours and Themes
(`--container-list-beside`); narrower, it goes above the page, folded into a bar with the item at
the centre (#1311). The head of the view says how the review stands: how many items are looked at,
how many changed after the look, how many block the exit.

A look is kept as the print of what the person looked at, the colours of every pair of the theme in
that mode (`printOf` of `src/engine/review.ts`): a change that touches the item changes its print,
and the item says it changed after the look until it is looked at again. The looks are a signal of
the state (`src/state/review.ts`), kept in the storage of the studio beside the draft
(`magma-studio:looks`), so a reload keeps them; a preset opened starts with none, since nothing of
it was looked at.

The item at the centre is the one the address names, else the first left to look at: its theme and
its mode, how it stands, and its action, **Mark as looked at**, then **Take the mark back** and
**Next to look at** with the next item left; a line links the theme in [Themes](themes.md). Its
pairs come in three groups, in the order of the model, each a table of the pairs in that mode
(`PairsTable` of `pairs.tsx`: the two roles and their category, the target, the sample of the two
colours with the measure and the badge):

- **Blocking**: under their floor, which the build of Magma refuses while one is there;
- **Reported**: under their target, reported by the gate, which does not fail on them;
- **Debt**: under their floor and accepted by the baseline of design-tokens, the debt in view with
  how much is missing.

Under them, how many pairs were measured in that mode, with the targets of
`nx run design-tokens:contrast`. The badge of a pair says `error` for what fails the build,
`warning` for what the gate only reports, `info` for what the baseline accepts, `success` when it
holds; a decorative border has no floor. Beside, the scene of the product in the theme and the mode of the item (`ThemeScene` of
`src/shared/ui/theme-scene.tsx`), with the switch **More contrast**, where the view has the room
of a column for it (`--container-side`); narrower, it is not drawn, as in Weights. While the gate cannot measure the preset, the view says why
instead.

The exit is the one of the bar, as on every page: the full review has no foot (#1595, vittorio,
2026-11-27). While the check is red it asks first, as every way out of the studio does
(`gate-dialog.tsx`, confirm-action `ask-first-many`), and its **See every pair** leads back here. A
link from a pair to the stage that changes it is not built: it is left to the pattern of the
review checklist (#1490, vittorio, 2026-11-27). Built as Magma says today, record-detail with the
list beside, as Colours and Themes, until that pattern lands; its renders are its proposal.
