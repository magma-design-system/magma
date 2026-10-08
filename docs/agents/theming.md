# Magma styles - theming, dark mode and preferences

> Scope: dark mode, the user preferences (contrast, motion, consumption), the named
> themes, the surface levels and elevation, the global design decisions you may override,
> and the corner geometry axis. Requires the styles setup in [`assets.md`](assets.md).
> The color roles themselves: [`color.md`](color.md).

The component layer already handles these - **do not re-implement them in app code**.

## Dark mode and preferences

Handled at the palette level - no per-element classes. Components read tokens, not
literal colours, so they invert automatically. Activate on `<html>`:

```html
<html class="pref-mode-system"><!-- or pref-mode-light / pref-mode-dark --></html>
```

Same pattern for `pref-contrast-*`, `pref-animation-*` and `pref-consumption-*` (high
contrast, reduced motion, low consumption): the classes on `<html>` cascade through. For
programmatic control use the `mds-pref-mode` component. Never write `color-scheme` or
dark-mode media queries by hand.

## Named themes

A named theme retints the whole neutral scaffolding of the page at once - surfaces,
wash, borders, text, the inverse chip - and keeps it contrast-checked. It is one
attribute on `<html>`, and it needs `themes.css` ([`assets.md`](assets.md)):

```html
<html data-theme-name="cool"><!-- or "warm"; no attribute = the default theme --></html>
```

| Theme | Family | Cast |
| --- | --- | --- |
| (none) | `neutral` | grey |
| `cool` | `porcelain` | blue-grey |
| `warm` | `bisque` | warm grey |

The status colors (info, success, warning, danger) never change with the theme. To let
the user choose, use `mds-pref-theme`: it writes the attribute, remembers the choice and
also carries the corner shape (below). A theme works only on code that paints with the
semantic roles; a raw palette step stays as it is. Defining your own theme is not a
consumer feature yet.

## Surfaces and elevation

Every neutral background is one of five surface levels. They are not five greys to pick
from: each one says where the element sits relative to the page.

```text
surface-default          the page, the canvas everything else sits on
  surface-sunken         recessed into the page: wells, insets, code blocks, tracks
  surface-muted          on the page plane, grouped: zebra rows, a subtle section
  surface-raised         lifted off the page: cards, panels, sticky headers
    surface-overlay      floating above everything: modal, dropdown, popover, tooltip
```

The ladder in the default theme (`--magma-surface-*`, Tailwind `bg-surface-*`):

| Level | Light | Dark |
| --- | --- | --- |
| `sunken` | `#e8e8e8` | `#020202` |
| `muted` | `#ebebeb` | `#0d0d0d` |
| `default` | `#f2f2f2` | `#1d1d1d` |
| `raised` | `#f8f8f8` | `#303030` |
| `overlay` | `#ffffff` | `#4a4a4a` |

In both modes the ladder rises toward the light: `sunken` and `muted` sit below the page,
`raised` and `overlay` above it. Light keeps the page a soft grey so that a card can be
lighter than it; dark lifts the page off pure black so that there is room below it.

**In light, elevation needs a shadow.** The steps above the page are close in light
(`#f2f2f2` page, `#f8f8f8` card), so the fill alone barely separates a raised element; in
dark the fill does most of the work. Pair `raised` and `overlay` with a shadow, as the
components do (`mds-card` uses `--shadow-md-sharp`, `mds-modal` `--shadow-2xl`):

```css
.panel {
  background: rgb(var(--magma-surface-raised));
  box-shadow: var(--shadow-md-sharp);
}
```

```html
<div class="bg-surface-raised shadow-md-sharp">...</div>
```

An overlay separates from what is under it by its shadow, not by a border: in dark
`border-muted` is darker than `surface-overlay`.

**Text is safe on every level.** Each text role is computed against the least
contrasting surface of its family, so `text-default`, `text-muted` and the rest are
legible on all five levels in both modes (checked in CI). The tinted pills are a
different device with tighter rules: see the wash levels in [`color.md`](color.md).

**Themes and contrast move the levels, not your code.** Under a named theme the five
levels take the theme's cast. Under `pref-contrast-more` the page (`surface-default`)
becomes the paper of the mode (`#fff` light, `#000` dark) while `raised` and `overlay`
keep their step, so cards and floating layers still stand off the page. Code that paints
with the roles follows both with no rule of its own.

**Roles, not primitives.** `--surface-neutral-raised` and its siblings
(`--surface-<family>-*`) are the design-tokens primitives behind the roles, one set per
family: they follow the mode but not the named theme nor the contrast preference. Paint
with `--magma-surface-*`.

## Global design decisions

Override `--magma-*` vars only inside the `overrides` cascade layer:
`--magma-disabled-opacity` (`0.5`), `--magma-backdrop-opacity` (`0.1`),
`--magma-outline-focus`.

```css
@layer overrides { :root { --magma-disabled-opacity: 0.35; } }
```

## Corner geometry

Corner geometry is an axis of its own, because the shape and the radius scale tuned
for it have to move together: a squircle cuts a much smaller corner than a round one
at the same radius. Set `data-corner-shape` - on `<html>`, or on any element to
deviate for that subtree only - and both follow. Overriding `--magma-corner-shape`
by itself changes the shape WITHOUT the scale.

```html
<html data-corner-shape="round">
<section data-corner-shape="squircle">...</section>
```
