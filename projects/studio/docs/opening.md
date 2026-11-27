# The opening

The view that opens the preset to work on, before the stages.

Address: `#/opening`.

The **opening** (`src/features/opening/`) opens the preset to work on, its starts as cards, all in
line: the draft first when the work has changes, resumed on the stage it was on as the main
action of the page; Magma's preset, or the preset of a project from its file (Import a preset);
a ready theme, with its look and its modes; a brand colour. A ready theme makes a theme of the
product, a copy of the family of its tint in the `tone` group with its accents and its modes
(`my-editorial`, renamed in [Themes](themes.md)); a brand colour becomes a family of `brand`, a
`variant` that points at it and a theme of the product with its accent on it (`my-brand`,
`src/engine/opening.ts`). Every start leads on to Colours. The short name of the copy is its own,
with no hyphen: the themes and their surfaces are keyed by the short name of a family. Opening
over work with changes keeps it: a toast in the region of the toasts says what opened, with
**Undo** (confirm-action, `act-then-undo`, `src/state/opening.ts`). The candidates of a brand
colour, alternatives generated and measured, are new work of the engine, not built here.

The opening is where a new theme is born: **New theme** in the list of Themes leads here. What a
preset brings in and how it goes out: [The preset in and out](preset.md).
