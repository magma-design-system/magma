# Dimension axis - design note (epic #328, theme system)

Status: DRAFT / design agreement to review. Not yet implemented.
Scope: the SIZE / RADIUS / BORDER half of a named theme - the axis that makes two
themes differ SPATIALLY and not only chromatically.

Ancestor: `projects/styles/draft/theme.css`, deleted by `ee53901b0` (#574). It carried
the first sketch of this axis:

```css
/*
radius:              0rem | 0.25rem | 0.5rem |   1rem  | 2rem
size multiplier:     3px  |  3.5px  |   4px  | 4.5px   | 5px
border multiplier: 0.5px  |    1px  | 1.5px  |   2px
*/
--magma-theme-depth: false;
--magma-theme-border-size: var(--border-lg);
--magma-theme-element-lg-radius: var(--radius-lg);
--magma-theme-element-lg-size: var(--size-lg);
--magma-theme-element-md-radius: var(--radius-md);
--magma-theme-element-md-size: var(--size-lg);
--magma-theme-element-sm-radius: var(--radius-lg);
--magma-theme-element-sm-size: var(--size-md);
```

Three groups, each with its own radius + size, plus one global border width. The
structure below keeps that shape and renames it against the conventions the color
layer settled in the meantime (SEMANTIC_COLOR_SPEC.md sections 8 and 11).

## 1. Why a Magma multiplier, and NOT `--spacing`

Component sheets size themselves through the Tailwind helper: `--spacing(900)`
compiles to `calc(var(--spacing,.0025rem) * 900)`. Two consequences, one of which
is a latent bug:

- retargeting `--spacing` per theme is OFF THE TABLE. It is Tailwind's own token,
  so moving it would rescale every `p-4` and `gap-2` the CONSUMER writes in their
  app, not just Magma components. A design system that does this makes Tailwind
  non-portable between projects, and a developer can no longer reason about
  spacing at all.
- the reverse is already true today and nobody asked for it: a project that tunes
  `--spacing` in its own `@theme` silently deforms every Magma component. We
  depend on a variable we do not own.

A Magma-owned multiplier per component GROUP fixes both. It is the daisyUI model
(`--size-field`, `--size-selector`), used the way daisyUI uses it: inside the
component, on the few measures that carry its optical size - not as a global
spacing scale.

## 2. The census (why three groups, and why the migration is free)

`--spacing` is `0.0025rem`, so `--spacing(100)` is 4px. EVERY height declared by a
component is a multiple of 100:

| declared | px | who |
| --- | --- | --- |
| `--spacing(300/400)` | 12 / 16 | icons, dots, inner details |
| `--spacing(600/700)` | 24 / 28 | badge, chip, tab sm, checkbox |
| `--spacing(900)` | 36 | button md, input |
| `--spacing(1200)` | 48 | button lg, rows |

Magma already writes its sizes as multiples of 4px. The substitution is mechanical
and VALUE-INVARIANT:

```css
/* today  */ min-height: --spacing(900);
/* target */ min-height: calc(var(--magma-unit-control) * 9);   /* 4px default -> 36px */
```

The radius census agrees with the same three clusters: `--magma-radius-2xl` 15 uses
(containers), `lg` 5 (controls), `md` / `full` on the small ones.

## 3. The three groups

| group | members | radius today | heights today |
| --- | --- | --- | --- |
| `container` | card, modal, banner, accordion, dropdown, tooltip, table | `2xl` | none fixed |
| `control` | button, input, select, textarea, tab | `lg` | 700 / 900 / 1200 |
| `marker` | checkbox, switch, badge, chip, avatar, dot | `md`, `full` | 300 / 400 / 600 |

Named by ROLE IN THE COMPOSITION, not by size. daisyUI's `selector` is rejected
because it lies: a badge selects nothing, it lands in that group only for being
small and round. `marker` says the true thing - what is read at a glance.

`container` DOES take a `unit`, and it governs the inner padding rather than a
height: a container is sized by its content, but the room it leaves around that
content is a theme decision (a dense theme wants a tighter card). The census
confirms the values are already on the same 4px module: banner 8/24/32, dropdown
24, accordion-item 16, tooltip 4/8.

Toolbars belong to `control`, not `container`: they carry an optical height of
their own.

## 4. The tokens

```css
:root {
  /* the unit a group measures itself in; sizes are multiples of it */
  --magma-unit-container: 4px;
  --magma-unit-control: 4px;
  --magma-unit-marker: 4px;

  /* per-group radius: SELECTS a step of the existing scale, never redefines it */
  --magma-radius-container: var(--magma-radius-2xl);
  --magma-radius-control: var(--magma-radius-lg);
  --magma-radius-marker: var(--magma-radius-md);

  /* axis-wide */
  --magma-border-width: 1px;
}
```

A named theme overrides this block under `[data-theme-name='x']`, exactly as it
overrides `--magma-tint-*` for color (spec 8). Same anchor, second dimension.

## 5. Naming rationale

- `unit`, not `step`. In Magma a STEP is a rung of a color ramp (`--magma-scale-01..10`,
  `hueSteps`, `washSteps`, `shadowStep`). Reusing the word for the dimensional
  module would put one term on two unrelated things. `unit` is unused and exact:
  4px is the unit the group measures itself in.
- Property first, role second (`--magma-radius-control`), per section 11. Never
  `--magma-control-radius`.
- NO `theme-` infix. The color layer is themed without announcing it in the name:
  `--magma-surface-raised` is retinted by a theme and says nothing about it. The
  theme is the MECHANISM that repoints a token, not a segment of its name. Adding
  the infix here would split the grammar in two and force every future dimension
  to re-decide.
- No connector for the axis at all: the group IS the role. `control` is to `radius`
  what `raised` is to `surface`.
- `--magma-border-width` stays ungrouped. Listing it next to the groups would read
  as if `border` were a fourth group.

Disambiguation rule between the two radius levels, which share one namespace on
purpose (a group radius IS a radius): STEPS are t-shirt sizes (`xs`..`5xl`, `full`,
`none`), ROLES are group names (`container`, `control`, `marker`). Disjoint sets. A
component names a role, never a step - the same discipline that keeps it off
`--tone-neutral-09`.

## 6. What stays OUT of the axis

- The per-instance `size` prop. `mds-button` has `size="sm|md|lg|xl"`, `mds-tab`
  has `sm|md`, and so do avatar, switch, progress, mention. The axis moves the
  STEP of the scale, not the choice: `size="lg"` keeps meaning "large IN THIS
  THEME". This is also why the groups are not named `sm/md/lg` - a token
  `--magma-size-md` sitting next to a prop `size="md"` is two different things
  wearing one name, and no developer would keep them apart.
- Values not aligned to the unit (`--spacing(150)`, `--spacing(25)`: hairlines,
  the inner illumination of `mds-keyboard`). Multiplying them with the rest breaks
  the optical proportion instead of scaling it. They stay literal px.
- Typography. It is a dimension of its own and is not part of this axis.

## 7. Open questions

1. RESOLVED: `container` takes a `unit` (inner padding, section 3) and toolbars
   belong to `control`. Still open: the TABLE ROW. Evidence for `control`:
   `mds-table-header-cell` declares `height: --spacing(700)` = 28px, the very
   height of a small button - and a header cell is clickable for sorting.
2. RESOLVED, see section 8: global. What is still open there is the base VALUE
   (1px or 2px), which is an editorial call because it is not value-invariant.
3. `--depth` already exists as a numeric elevation axis and belongs to this same
   cosmetic family. Fold it under the group vocabulary, or leave it standalone?
   A `noise` effect (daisyUI has one) is NOT proposed.
4. Migration order: the substitution is value-invariant, so it can ship as one
   mechanical pass per group, verified by a rendered-value diff rather than by review.

## 8. Border width census (answers question 2)

Values, normalised (`--spacing(25)` = 1px, `(50)` = 2px, `(100)` = 4px):

| px | where |
| --- | --- |
| 1 | button at rest, badge, policy-ai, price-table-features (row separators) |
| 2 | chip, input controls, accordion, table, tree branch, usage, avatar-stack sm, button on HOVER, button in high contrast |
| 3 | button outline hover, input-upload (drag area, dashed) |
| 4 | avatar-stack md/lg |

**Per-group would explain nothing.** The same group holds both values: badge 1px
next to chip 2px in `marker`, button-at-rest 1px next to input 2px in `control`.
So the token is GLOBAL, as in daisyUI.

**The token is the REST state.** Button going 1px -> 2px on hover (and 3px on
outline hover) is NOT a general rule to derive from: it is a deliberate one-off,
a scaling effect that makes the hover of a button read more sharply than on other
components. Generalising it would spread an effect that was authored for exactly
one component. So:

```css
border-width: var(--magma-border-width);   /* the axis: the rest state */
```

and `mds-button` keeps its hover thickening as its own effect. The 2px under high
contrast is a separate matter - accessibility, not cosmetics - and stays a local
override.

Out of the axis, because they are not borders: the ring of `avatar-stack` (4px,
it detaches an avatar from the one beneath), the branch of `mds-tree`, the dashed
affordance of the `input-upload` drop zone.

**Not value-invariant, unlike the heights.** At 1px, chip / input / accordion /
table get thinner; at 2px, badge / policy-ai / price-table separators get thicker.
There is no neutral choice. DECIDED: `1px`, the rest state. A 2px base would also
push the button hover to 4px, which is why the most used component settles it.
