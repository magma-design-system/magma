# styles SPEC.md

## Purpose

Provides all CSS and Tailwind 4 styles for Magma components and consumer applications. Acts as the bridge between raw design tokens and usable utility classes.

## Required import order

Consumer applications must import styles in this exact cascade layer order to avoid specificity conflicts:

```css
@layer reset, vendor, theme, base, components, utilities, overrides;
/* or @import '@maggioli-design-system/styles/dist/css/layer.css'; */

@import 'normalize.css' layer(reset);

/* Fonts */
@import '@fontsource/karla/400.css' layer(vendor);
@import '@fontsource/karla/700.css' layer(vendor);
@import '@fontsource/merriweather/400.css' layer(vendor);
@import '@fontsource/merriweather/700.css' layer(vendor);
@import '@fontsource/roboto/500.css' layer(vendor);
@import '@fontsource/roboto/700.css' layer(vendor);
@import '@fontsource/roboto-mono/400.css' layer(vendor);

/* Magma styles */
@import '@maggioli-design-system/styles/dist/css/colors-rgb.css' layer(theme);
@import '@maggioli-design-system/styles/dist/css/reset.css' layer(reset);
@import '@maggioli-design-system/styles/dist/css/hydrated.css' layer(base);
@import '@maggioli-design-system/styles/dist/css/transitions.css' layer(base);
@import '@maggioli-design-system/styles/dist/css/animations.css' layer(base);
@import '@maggioli-design-system/styles/dist/css/globals.css' layer(theme);
@import '@maggioli-design-system/styles/dist/css/base.css' layer(base);

/* your Tailwind entry point */
@import './tailwind.css';
```

## Tailwind 4 configuration

Magma uses Tailwind 4 with a CSS-first config. To extend in a consumer project:

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{ts,tsx,html}'],
  presets: [require('@maggioli-design-system/styles')],
};
```

## Color classes

Tailwind color classes are generated from RGB token vars. Always use Magma color classes instead of raw Tailwind primitives.

```html
<!-- correct - semantic token, supports dark mode automatically -->
<div class="bg-tone-neutral text-tone-neutral-03">...</div>

<!-- incorrect - bypasses the token system and breaks dark mode -->
<div class="bg-white text-gray-700">...</div>
```

Color class prefixes available: `tone-neutral`, `tone-porcelain`, `tone-kaolin`, `tone-fireclay`, `tone-bisque`, `status-info`, `status-success`, `status-warning`, `status-error`, `label-*`, `variant-primary`, `variant-secondary`, `variant-ai`, `brand-maggioli`.

If you need a color outside Tailwind, always use the RGB wrapper:

```css
.selector {
  color: rgb(var(--tone-neutral-03));
  background: rgb(var(--tone-neutral-03) / 0.15);
}
```

## Typography utilities

Typography utilities are semantic and map directly to Magma's type scale. Use these instead of composing `font-*` and `text-*` primitives manually.

| Utility                           | Family        | Use case                              |
| --------------------------------- | ------------- | ------------------------------------- |
| `text-title-h1` … `text-title-h6` | Karla (title) | Page and section headings             |
| `text-title-action`               | Karla (title) | Buttons, labels, interactive elements |
| `text-info-paragraph`             | Karla         | Body copy, UI paragraphs              |
| `text-info-detail`                | Karla         | Default UI text, form fields          |
| `text-info-caption`               | Karla         | Secondary information, timestamps     |
| `text-info-label`                 | Karla         | Field labels                          |
| `text-info-option`                | Karla         | Dropdown options, select items        |
| `text-info-tip`                   | Karla         | Tooltips, helper text                 |
| `text-read-paragraph`             | Merriweather  | Long-form editorial body text         |
| `text-read-detail`                | Merriweather  | Editorial detail text                 |
| `text-read-caption`               | Merriweather  | Editorial captions                    |
| `text-code-snippet`               | Roboto Mono   | Code blocks                           |
| `text-code-hack`                  | Roboto Mono   | Inline code                           |

## Focus utilities

Use these utilities instead of writing focus styles manually:

```html
<!-- bounce animation on focus - preferred for interactive elements -->
<button class="focus-bounce">...</button>

<!-- zoom/outline focus - for elements that should not animate -->
<a class="focus-zoom">...</a>
```

## Dark mode

Dark mode is handled at the palette level. No class changes are needed on individual elements. Activate via `<html>`:

```html
<html class="pref-theme-system">
  <!-- follows OS -->
</html>
<html class="pref-theme-light">
  <!-- always light -->
</html>
<html class="pref-theme-dark">
  <!-- always dark -->
</html>
```

## Other accessibility preferences

```html
<html class="pref-contrast-system">
  <!-- follows OS -->
</html>
<html class="pref-contrast-more">
  <!-- always high contrast -->
</html>
<html class="pref-contrast-no-preference">
  <!-- always default contrast -->
</html>
<html class="pref-animation-system">
  <!-- follows OS -->
</html>
<html class="pref-animation-no-preference">
  <!-- always reduced animation -->
</html>
<html class="pref-animation-reduce">
  <!-- always no animation -->
</html>
<html class="pref-consumption-low">
  <!-- always low consumption -->
</html>
<html class="pref-consumption-medium">
  <!-- always medium consumption -->
</html>
<html class="pref-consumption-high">
  <!-- always high consumption -->
</html>
```

For programmatic control, use the `mds-pref-theme` component.

## Global design decisions (`--magma-*` vars)

These CSS custom properties on `:root` control system-wide visual behaviour. Override them in your `overrides` layer only.

| Property                   | Default                                      | Description                     |
| -------------------------- | -------------------------------------------- | ------------------------------- |
| `--magma-corner-shape`     | `squircle`                                   | Corner shape for all components |
| `--magma-disabled-opacity` | `0.5`                                        | Opacity of disabled components  |
| `--magma-backdrop-opacity` | `0.1`                                        | Opacity of modal backdrops      |
| `--magma-outline-focus`    | `2px solid var(--magma-outline-focus-color)` | Focus ring style                |

Example override:

```css
@layer overrides {
  :root {
    --magma-corner-shape: round;
  }
}
```

## Anti-patterns

- ❌ Never use raw Tailwind color primitives (`bg-white`, `bg-gray-500`) - use Magma token classes
- ❌ Never compose typography with raw `font-*` + `text-*` primitives - use semantic `text-*` utilities
- ❌ Never override `--magma-*` vars outside the `overrides` cascade layer
- ❌ Never import `colors-hex-*.css` files when using Tailwind or web components - they require RGB format
- ❌ Never write `color-scheme` or dark mode media queries manually - use Magma's activation classes
