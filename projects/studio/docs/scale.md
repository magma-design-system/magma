# Scale

A page beside Colours with one contrast scale at the centre: its steps, its distribution, the
families that use it and what its sample paints.

Addresses: `#/colours/scale/<formula>/<name>`, then `/from/<group>` when reached from a group
(alias `#/colors/contrast-scales`, the scale `default` of `wcag3`).

**Scale** (`src/features/scale/`, `#/colours/scale/<formula>/<name>`, then `/from/<group>` when
reached from a group; the Contrast scales page until #1403) is a page beside Colours with one
contrast scale at the centre (chosen on its renders, vittorio, 2026-11-27). Its head holds the way
back, named after where the person came from, the name with its badges (built-in, Magma-compatible
or not) and its menu (Duplicate, Rename, Delete, undone from a toast), the line that says why it
holds the roles of Magma or serves only the families outside Magma, and the formula and the scale
as two selects that open any scale, one no family uses included. Then the pairs it touches,
**Used by**, its families by group, the one chosen the sample, and its distribution. A built-in
scale (`default` first of all) keeps its number of steps, and a line says to duplicate it; one a
preset redefined with another number, used by families that paint Magma, is an error with the
action **Back to the N built-in steps** (question 10 of the model).

The distribution is drawn on a horizontal axis (native until Magma has a range of several values,
#1261): pick an easing (`linear`, or a family from `sine` to `circ` as `-in`, `-out` or `-in-out`:
the named easings of the engine, `easing.mts`, which the hue shift ramps with too) and the stops
regenerate live from steps/min/max, or go `manual` by dragging a marker or editing a stop
directly; picked from `manual`, an easing starts from the stops on screen. **Reset**, beside the
distribution, takes a scale back to the steps of the configuration last loaded, on `manual`: the
one the studio opened with (the bundled one, or the file a command serves) or the one the opening
opened; a save loads nothing. It is off when the scale holds those steps already, and on a scale
that configuration did not have; the draft keeps what was loaded over a reload (#1330). Scale
values are contrast against the theme background (0 = on the background, max = strongest
contrast), so the same scale yields dark-on-light in light mode and light-on-dark in dark mode.

Beside, the sample colour solved on the scale paints the components it paints in a page of their
own (`states.html`, `src/shared/frames/states.ts`): the action and the message of its variant,
`mds-button` at every tone and in every state (at rest, hovered, pressed with `active`, selected
with `current`, disabled) and `mds-banner` at every tone; a variant neither takes, a label, shows
`mds-badge` and `mds-label`. The tones are those the documentation gives each component, in the
order of `docs/agents/variants.md`. No prop gives the hover: the page copies the `:hover` rules of
the component's own shadow sheet under an attribute (`forceHover`), so the hover is the
component's. One mode at a time, chosen over the states. A reference takes the ramp of its source
whatever its scale, so it shows none and names its source. What the states show is chosen as in
Colours: [What a colour paints](colours.md#what-a-colour-paints).
