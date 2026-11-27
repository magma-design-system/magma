# Colours

Stage 1: a family at the centre, to adjust a colour and see what it paints.

Address: `#/colours` (alias `#/colors/palette`, the Palette it was). [Scale](scale.md) stands
beside it.

**Colours** (`src/features/colours/`, `#/colours`; the Palette until #1403) holds a family at the
centre, to adjust a colour and see what it paints; `neutral` is selected first when present. The
list beside holds the families by group, the variants first, in chromatic order inside each group,
as everywhere a family shows or goes out (`src/engine/colour-order.ts`, the criterion chosen on
its render, vittorio, 2026-11-27, option B). Under **Add color**, **New group** opens the same
dialog with a new group to name, and an icon beside each group opens Groups. The list stands
beside the page while the page keeps the room of the row of actions of its head (41.75rem of the
layout, `--container-list-beside`, as in Themes and the full review); narrower, on a phone, it goes
above the page, folded into a
bar with the family selected and an arrow, which opens the list in place of the page (#1311).

Under the name of the family, what it paints and the themes that use it, each a link to the stage
Themes on that theme (a
family that paints nothing of Magma says it is a case outside Magma, which goes out as tokens
alone), then the pairs it touches ([The contrast gate](../README.md#the-contrast-gate)), then its
fields
(`family-fields.tsx`). A value the family does not set says from whom it comes on a line under its
field, a link to where it is decided, its group or the preset, both in Groups (`inheritedFrom` of
`src/engine/families.ts`, vittorio, 2026-11-27, option A). The contrast scale carries its badge,
Magma-compatible or not, and a link to Scale: a family that paints Magma takes a Magma-compatible
scale alone (question 10 of the model). The switch **Generate surfaces** says whether the family
generates surfaces, and with them a theme: it inherits from its group until the family decides; a
status colour has it on and locked, saying why; a reference has none (`NO_SURFACE_GROUPS` of
`src/engine/groups.ts`). Beside the fields the ramps of the family stand upright, and Ramps /
Theme swaps them for the scene, small as a phone, light or dark, painted with the preset at every
change (`scene-side.tsx`, "What a colour paints" below).

A reference (a variant: `variant.primary` points at `brand.maggioli`) edits only its name, its
source, its export groups and Disabled. An info banner at the top of its fields says that its ramp
is the one of the source and what the source sets (base colour, colorspace, Smooth, hue shifting,
saturation, ratios, formula), and its action, **Edit** with the name of the source, opens the
source with its title focused: a variant has no Smooth nor hue shifting of its own to look for
(vittorio, 2026-11-18).

The **Colorspace** field of a family says in its message how its ramp holds the seed (#1454,
`src/engine/colorspace-verdict.ts`, measured by `ramp-grade.mts` of design-tokens): success,
warning or error, and why. The ramp is the one of the family in light and dark, with its
colorspace and its smooth, own or inherited, and its saturation curve, without its hue shift (a
turn set on purpose). It fails when its hue turns into another family (more than 25 degrees; up to
12 passes) or its steps go grey (under 30% of the saturation of the seed; from 60% it passes), and
then names the colorspace that holds this colour best. The right colorspace depends on the colour,
so there is no fixed ranking: OKLCH holds violet and turns yellow by 39 degrees. The verdict is
also seen before reading it (vittorio, 2026-11-18): the icon of the grade before the label (the
`icon` of `mds-input-field`, the tick, warning and cancel icons mds-usage pairs with do, warn and
dont, inlined at build time from `@material-icons/svg`, so no request delays it), and a mark before
each option of the select, the grade of the ramp of this colour in that colorspace, the inherited
one named (`inherit (HSL)`): a tick, a warning sign, a no-entry sign, emoji since an option holds
text only. The select mounts again when its marks change: mds-input-select reads its options once.
The colorspaces the engine never built (CAM02, CAM02p, HSLuv) are no longer offered.

Under the hue shifting, of the family in Colours and of the preset in Groups (the two editors of
`src/shared/ui/`), the **Saturation** group edits the saturation curve of the engine
(`saturation`, #1439, the README of `design-tokens`): the mode (inherit, custom, off), the curve,
and the two ends from -100 to 100, linked at first. A custom curve starts flat, both ends at 0, the
ramp as the engine makes it (vittorio, 2026-11-18); the Off of a family writes the two ends at 0
with no curve, which takes it out of a global curve, while a custom curve keeps its `curve`, so
each reads back. Under the ends, the change of each step (accent bars up toward the most vivid
colour, grey bars down toward grey, around the line of no change, from the darkest step to the
lightest), then the relative saturation of each light step of the family in view, a ring before
the curve and a dot in the colour of the step with it, as the reference of the issue draws it; the
global group draws the family in view too. The list badges a family with a curve `sat`, one of its
own over a global one `sat+`, beside `hs`/`hs+` (`badgeOf` of `src/engine/families.ts`).

New colors are created from a dialog: a colour of its own or a reference, pick the value and the
name auto-completes underneath from the "Name That Color" vocabulary (via
[color-namer](https://github.com/colorjs/color-namer), ~1500 names, kebab-cased: e.g.
`persian-green`); choose the group, or name a new one, confirm, and the studio lands on the new
color already selected. Names are made unique with a numeric suffix when needed. Auto-naming keeps
following the colour in the editor too, typed or picked in its colour field (`ColorInput`,
`mds-input` with `type="color"`), but only for names assigned by the studio itself: a name typed
by the user, or any name coming from a loaded configuration, is never touched. Picking a value
already used by another color raises a warning. A family is deleted from its menu, and undone from
a toast.

## What a colour paints

The previews of a colour, the scene beside Colours and the states beside Scale, show the
components a change of the family moves (#1308, `src/engine/paints.ts`), each link read where it
is decided:

| Link | Source |
| --- | --- |
| a component paints with a colour through its `variant`, the values it takes and its default | `documentation.json` of the installed magma (`build/magma-api.ts`) |
| which values of a `variant` are colours, and of which kind: accent, status, neutral, label, identity; a `variant` that takes anything else is no colour (`mds-text` has one of typography) | the tables of the section Variants of `docs/agents/variants.md` |
| a status and a label paint with their own family: `status.error` is the `error` variant, `label.red` the `red` one | "Paints with" of the same guide, the mapping of `docs/agents/color.md` |
| `primary` and `secondary` paint with the family the theme points the accent role at, `ai` with the one of the `ai` role; secondary renders exactly like primary | the same guide; `accents` of `semantic.config.ts`, repointed by a theme file or in Themes (`accentOfTheme`) |
| the family a theme is drawn from paints its neutral scaffolding, the surfaces of the whole page and the `dark` and `light` variants | `docs/agents/color.md`, `data-theme-name` retints the neutral scaffolding |
| an alias paints what its source paints: `variant.primary` is `brand.maggioli`, `variant.ai` is `label.violet` | the alias re-exports the resolved ramp of its source (`color.mts`) |

The theme a family is seen in is the one drawn from it, else the first whose accents point at it
(`variant.secondary` is seen in `editorial`), else the base. The scene puts first, at full
colour, the cards that hold an element of the family and, in each card, the row that holds it,
the element staying where it is in its row (`markPainted` of `src/shared/frames/frame.ts`, the rules
under `data-studio-paints` in `src/shared/frames/previews.css`); the surfaces of a theme are the
whole page, and nothing
moves. A line over the scene says what the family paints. A family that reaches none of these
(`brand.rnd`) says so where the scene or the states would be, instead of a page that would not
move. The scene carries every label colour, so each label family has an element to show.

What this does not see: a component that paints with the accent with no `variant` of its own
(the switch, the tab, the stepper) is not counted, its colour being no choice of the product.
