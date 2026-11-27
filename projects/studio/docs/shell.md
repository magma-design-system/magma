# The shell

The frame every view of the studio stands in: the bar, the stages in order, the changes, the exit
and its menu, the toasts and the notices.

Addresses: none of its own. The bar stands over every page, the stages over a stage and a page
beside one; the addresses of the views are in the index of the [README](../README.md#the-views).

The bar of the studio follows the app-shell block of Magma (the logo, "Magma Studio" and under it
the version of the Magma it runs on, which `build/vendor.ts` writes into the page). The logo is the
Magma mark of `identity`, blue, and its white version in the dark mode, as the favicon and the docs
site show it: the sheets of the studio have no `dark:`, so `src/dark-mode.ts` matches the `<html>`
of the studio against `darkScheme` of design-tokens, the list the dark palette of Magma is printed
from, and the mark flips with the roles (the mode in the menu, light, dark or system, and the scheme
a theme is locked to).

The studio is one flow, the views of [`studio.object-model.md`](../studio.object-model.md) (section
5), in order (#1402): the **introduction** (`#/introduction`), the **opening** (`#/opening`), then
the stages, **Colours**, **Weights**, **Themes**, **Exceptions**, and the **full review**, then the
exit. A start with no address opens the introduction, and so does `#/start`, the address of the
Start page it was (the router writes `#/introduction` in its place); the name of the studio at the
start of the bar links to it.

| Where | What it holds (`src/app/`) |
| --- | --- |
| **The bar** (`shell.tsx`, option A of its renders, 2026-11-27) | the product; what stands outside the stages, **Groups** (#1403), the **Theme** section and the **rules** (Behavior, a menu); then the work, always in view: the **changes** since the last exit, a button with their count that opens them by stage (`changes.tsx`), and the **exit**, a split button that saves the preset where a command takes saves and downloads it otherwise, through the contrast gate, the other formats in its menu (`config-menu.tsx`); the menu of the person at the end |
| **The stages** (`stages.tsx`) | under the bar, on a stage and on a page beside one, the stages in order in an `mds-stepper-bar`, the current one marked, the ones before it done and opened from it; at the end of a stage, the way back and the way forward named after where they lead, the last stage ending with the exit |

The bar and the page follow the window, the gutter at their sides, and start on one edge: the
studio is the case `workspace` of the widths (`docs/agents/patterns/widths.md`), so `.studio` sets
`--magma-width-page: none` (`src/style.css`). The introduction, a page read once, is the case
`page`: its column and the bar over it keep `--magma-width-page` (`data-box` of `.studio`).

The stages are the pattern of the studio in its layer,
[`magma/patterns/stages-in-order.md`](../magma/patterns/stages-in-order.md): Magma has no pattern
for stages in order (object model, section 8), so the studio writes its own, which the MCP server of
Magma reads (`get_pattern`) and checks (`layerErrors`). Each stage opens its view (`STAGES` of
`src/shared/routes/routes.ts`): Colours `#/colours` and Weights `#/weights`, the views #1403
built, with Scale beside Colours at the address of any scale (`placeOf`); Themes `#/themes` and
the full review `#/full-review`, the views #1404 built, each at the address of any of its items;
Exceptions has a page that says it comes after Magma 3 (`src/features/exceptions/`). Groups
(`#/groups`) stands outside the stages, as the Theme section and the rules (object model, section
5). Diffs went: the changes of the bar take its place.

The changes count every value of the preset that differs from the preset at the last exit
(`src/engine/changes.ts`, chosen 2026-11-27): a save or a download brings the count back to none,
and opening a preset starts it from that preset. The state keeps that preset in the draft
(`baseline`, `src/state/studio.ts`), so a reload keeps the count.

Every page is a link with an address in the hash (`#/colours`, `#/theme`, `#/behavior/patterns`,
`src/shared/routes/routes.ts`), so the studio works from whatever folder serves it. The addresses
of the pages #1403 and #1404 replaced open the view that took their place, the router writing its
address over them (`ALIASES`): `#/colors/palette` Colours, `#/colors/contrast-scales` the scale
`default` of `wcag3`, `#/colors/groups` Groups, `#/colors/semantic-surface` Weights,
`#/colors/themes` Themes, `#/colors/contrast-check` the full review. The Theme section may
name the theme and the mode it opens on, `#/theme/editorial/dark`, and its address follows the
choices made there, replaced in place, so a reload or a link shows the same theme in the same
mode. A hash that does not start with `#/` is left alone: the anchor of a heading of a page that
hosts the studio. The work is the state's, not a page's (`src/state/`, #1400): a view is mounted
only while it is shown, and the bar, the Theme section, the introduction and the opening read the
same state, which keeps where the work was too (`workPlace`, the last stage or page beside one, in
the draft), so the opening resumes it there. Each view opens with the head of the page-header
block, the first thing of the region that scrolls: the title with the verdict of the contrast gate
beside it, then one line of what it holds. No view has a Save or a Reset of its own (they went
with the Palette, vittorio, 2026-11-27): what takes a preset out is the exit of the bar, what
brings one in the opening, and the actions are the state's (`src/state/work.ts`,
`src/state/exports.ts`, `src/state/opening.ts`), so they work from any page. What keeps the preset
from loading or saving shows over every page (`WorkNotices` of `src/app/shell.tsx`), and what
takes work away asks nothing and is undone from a toast (`Toasts`, confirm-action
`act-then-undo`): a preset opened over work with changes, a family or a scale deleted, a scale
taken back to its built-in steps, a theme deleted or moved to another tint (`src/state/undo.ts`);
an edit after it closes the toast.

A theme a change broke says so (#1404): the themes say nothing while they hold, and a theme that
fails the contrast gate in a mode where it passed in the preset at the last exit, the baseline the
changes of the bar count from (`brokenSince` of `src/engine/gate.ts`, `broken` of the state), gets
a toast that stays, `error`, with **Review it**, the way to its item of the
[full review](full-review.md) (message-placement, `action-failed-elsewhere`). None on the full
review, which shows every theme, nor for the theme at the centre of [Themes](themes.md), whose
verdict is in view; a toast closed stays closed while the theme stays broken, and a theme mended
that breaks again says so again.
