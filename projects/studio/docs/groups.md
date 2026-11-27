# Groups

What the families inherit, the settings of the preset and of each group, and the export groups: a
view outside the stages, the first link of the bar.

Address: `#/groups` (alias `#/colors/groups`).

**Groups** (`src/features/groups/`, `#/groups`; the Groups page, which stays, vittorio,
2026-11-27) stands outside the stages, the first link of the bar: what the families inherit,
written into the global settings and the `groups` section of the configuration. First the preset,
the settings every family inherits (question 13 of the model): the colorspace, Smooth, the global
hue shifting and the global saturation. Then each group, its families in chromatic order with
their light ramp, each a link to Colours, the ones that override the group flagged; its formula,
its contrast scale with its badge and a link to Scale, its export, and the switch **Generate
surfaces**, on and locked for the status colours, absent for the references.

Families ticked across groups, the theme's included, become an export group (`batch.tsx`): the
place of the cases outside Magma (decision 14 of [`GLOSSARY.md`](../GLOSSARY.md)). Tick colors, or
pick an existing export from *select by export*, and open **Batch export**: the dialog previews
the picked colors, lets you untick any, and either saves an export value onto the selection or
downloads a zip of just its tokens. *Group selected* lifts the ticked colors into a **Selected
colors** section at the top, their ramps side by side; the rest stay in their group cards.
