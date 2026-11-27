# The introduction

The first page of the studio: what the studio is for and how the work goes, with no control of the
work.

Addresses: `#/introduction`, which a start with no address opens; `#/start`, the address of the
Start page it was, opens it too, the router writing `#/introduction` in its place.

The first page of the studio (`src/features/introduction/`, the Start page until #1402) is an
introduction, not a tool: it says what the studio is for, with no control of the work, in two
parts, chosen on their renders (2026-11-27):

- **the hero**: what the studio is for and what it offers (`FEATURES`, each line with its source
  in the code, an `mds-list`), on a band of the accent, beside a short play. A banner of a product
  (`hero.html`, an `mds-banner` of a back office with its text, its icon and its actions) in an
  iframe its own size is painted with the configuration Magma builds with, drawn pale at two
  levels: its text (`theme.text`, the text targets of Weights) pinned to pale steps of its
  ramp under every floor of the contrast gate (`POOR_STEPS`, steps 6, 7, 8 and 9: Lc 48.5, 36.2,
  25.0 and 15.2 on the banner against the floors 75, 75, 45 and 30; a pin and not a lowered target,
  since the engine holds a target to its floor on the washes of its family, #1414), and the ramp of
  its accent family faded (`PALE_RAMP`, its contrast ratios at 0.6 of
  themselves, a scale of the configuration). Three trays on the default surface come out from
  behind the banner, one at a time, with a light elastic movement: over it, the problem; under it,
  the fix, while the pins move a step at a time to the steps the engine picks for Magma
  (`magmaSteps`) and the ramp comes back to its own, the targets of Magma at the eighth step; then a
  smaller tray that says the issues are fixed, with **Replay**. The fix shows three indicators,
  Texts, Icons and Actions, each the pair of the gate that holds what the banner paints (`CHECKS`,
  the source of each beside it), and an `mds-progress` of the pairs brought back over their floor
  (`solved`), red while every indicator is under its floor, yellow once one meets it, green when
  the gate passes (`tone`). Each step runs what an edit in the stages runs
  (`demo.ts`), so nothing the play shows is drawn by hand; the last step is the
  committed configuration, untouched. The play runs once, in under five seconds (`PLAY_MS`), so
  it needs no pause (WCAG 2.2.2); Replay plays it again and gets the focus back at the end. The
  banner stays where it is, the room of its trays kept, so the band never changes height. Its
  figures are hidden from assistive technologies, the trays back behind the banner are `inert`,
  and a caption hidden from the eye says what the play shows. With less motion asked
  (`prefers-reduced-motion`) the play does not run by itself and the trays do not move. The
  elastic is a `linear()` curve of `introduction.css`, a light bounce beside it to compare
  (`--intro-ease-tray`); the banner is a document of its own (`applyFrame`), its height read by
  the hero, which CSS cannot give an iframe. Under the text, **Get started**, the one way out of
  the introduction, leads to the [opening](opening.md);
- **how the work goes**: the views in order, from the opening to the full review (`FLOW`), a row
  each with its icon, its place, what it does and the link that opens it, in the primary weak
  tone, so it reads as an action without competing with Get started; then the line of what is
  outside the stages, the Theme section and the rules. The list is written in the classes of
  Magma; the sheet keeps the frame of the page and the hero.
