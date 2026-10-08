# Magma styles - theming, dark mode and preferences

> Scope: dark mode, the user preferences (contrast, motion, consumption), the global
> design decisions you may override, and the corner geometry axis. Requires the styles
> setup in [`assets.md`](assets.md). Colors: [`color.md`](color.md).

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
