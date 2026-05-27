# Design tokens reference

This document is the **consumer- and agent-facing reference** for using Magma's design tokens: which family to pick, how to consume them, and how they behave across themes. For how tokens are **structured, built, and named at the source**, see [`projects/design-tokens/SPEC.md`](../projects/design-tokens/SPEC.md).

## What tokens are

Magma's design tokens are built with **Style Dictionary** (multi-format output) and color values are derived through **Adobe Leonardo** to guarantee WCAG-compliant contrast across the scales. The token source lives in [`projects/design-tokens/tokens/`](../projects/design-tokens/tokens) and is organised into six categories:

| Category     | Owns                                                                    |
| ------------ | ----------------------------------------------------------------------- |
| `color`      | Tones, statuses, labels, variants, brand palettes                       |
| `typography` | Font families, weights, sizes, line heights for the semantic type scale |
| `sizing`     | Spacing scale, radii, component sizes                                   |
| `screen`     | Breakpoints                                                             |
| `cosmetic`   | Effects, opacities, transitions, shadows                                |
| `css`        | CSS-specific helpers built on top of the primitive token values         |

Tokens are exposed to consumers in multiple formats (CSS custom properties, Tailwind utility classes, JS/TS modules, SCSS variables, hex CSS files). The exposure surface is owned by [`projects/styles/SPEC.md`](../projects/styles/SPEC.md).

## Color families - when to pick each

The most common authoring question is "which colour family do I use for X?". Use this table as the primary decision aid:

| Family                | Use for                                                          | Example variants                                                                                                                                                                    |
| --------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tone-neutral-*`      | Neutral chrome, default text, surfaces with no semantic meaning  | backgrounds, body text, borders                                                                                                                                                     |
| `tone-porcelain-*`    | Cool-leaning chrome where `tone-neutral` feels too warm          | secondary surfaces, code blocks                                                                                                                                                     |
| `tone-kaolin-*`       | Alternative neutral ladder (cool but quieter than porcelain)     | low-emphasis surfaces                                                                                                                                                               |
| `tone-fireclay-*`     | Warm chrome, less saturated than bisque                          | supporting warm surfaces                                                                                                                                                            |
| `tone-bisque-*`       | Warm chrome where `tone-neutral` feels too cool                  | editorial / comfortable surfaces                                                                                                                                                    |
| `status-info-*`       | Communicating informational state                                | info banners, helper messages                                                                                                                                                       |
| `status-success-*`    | Communicating positive state                                     | success toasts, validated fields                                                                                                                                                    |
| `status-warning-*`    | Communicating caution                                            | warning banners, unsaved changes                                                                                                                                                    |
| `status-error-*`      | Communicating failure or destructive action                      | error toasts, destructive buttons, validation errors                                                                                                                                |
| `variant-primary-*`   | Primary brand action emphasis                                    | CTAs, primary buttons, links                                                                                                                                                        |
| `variant-secondary-*` | Secondary brand action emphasis                                  | secondary buttons, supporting actions                                                                                                                                               |
| `variant-ai-*`        | AI/agentic features                                              | AI-driven affordances, generative content surfaces                                                                                                                                  |
| `label-*`             | Categorical labels with **no semantic role** (purely decorative) | `label-red`, `label-amaranth`, `label-aqua`, `label-blue`, `label-green`, `label-lime`, `label-orange`, `label-orchid`, `label-purple`, `label-sky`, `label-violet`, `label-yellow` |
| `brand-maggioli-*`    | Brand identity surfaces                                          | logo containers, brand panels, marketing surfaces                                                                                                                                   |

### Decision tree

When unsure which family to use:

1. Is this communicating a **state** (info / success / warning / error)? → `status-*`
2. Is this a **primary brand action** or call to action? → `variant-primary`
3. Is this an **AI-driven** feature? → `variant-ai`
4. Is this a **secondary action** or supporting affordance? → `variant-secondary`
5. Is this a **purely categorical label** with no meaning attached? → `label-*`
6. Is this a **brand identity** surface (logo background, brand panel)? → `brand-maggioli`
7. Otherwise it's neutral chrome → `tone-neutral` (default), `tone-porcelain` / `tone-kaolin` (cooler), or `tone-fireclay` / `tone-bisque` (warmer)

## Levels - the numeric suffix

Every colour family has a numeric ladder (`-01`, `-02`, `-03`, …). This is a **contrast ladder**, not a fixed lightness - Leonardo generates each step to maintain a defined contrast ratio against the background. The same `-03` token will land at different absolute lightness in light vs dark mode.

```css
/* tone-porcelain ladder in light theme */
--tone-porcelain-01: 0 0 0; /* highest contrast - darkest text */
--tone-porcelain-03: 53 65 81; /* default body text */
--tone-porcelain-08: 201 208 219; /* low-contrast - disabled, borders */
```

**Rule of thumb**: low numbers are high contrast (text on light surfaces), high numbers are low contrast (surfaces, borders, disabled). The exact range per family is documented in [`projects/design-tokens/SPEC.md`](../projects/design-tokens/SPEC.md).

## How to consume tokens

The same token is reachable through several surfaces. Pick the surface that matches your context:

| Surface              | Syntax                                                             | When to use                                                                                                      |
| -------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| **Tailwind utility** | `bg-tone-neutral-03`, `text-status-error-04`                       | **Default** - components, app code, the right answer 90% of the time                                             |
| **RGB var wrapper**  | `rgb(var(--tone-neutral-03))`, `rgb(var(--tone-neutral-03) / 0.5)` | When you need alpha, gradients, or properties Tailwind doesn't expose                                            |
| **JS/TS import**     | `import { tokens } from '@maggioli-design-system/design-tokens'`   | Storybook, scripts, dynamic theming                                                                              |
| **SCSS variables**   | `$tone-neutral-03`                                                 | Legacy SCSS consumers only                                                                                       |
| **Hex CSS files**    | `colors-hex-*.css` imports                                         | Only when the consumer cannot evaluate the `rgb(var(--…))` wrapper - never in Tailwind or web component contexts |

### Why RGB and not hex by default

The CSS custom properties hold **space-separated RGB components**, not full colour values:

```css
:root {
  --tone-neutral-03: 64 64 64; /* not #404040, not rgb(64,64,64) */
}
```

This lets you compose alpha at the call site:

```css
.foo {
  background: rgb(var(--tone-neutral-03) / 0.15); /* tint */
  color: rgb(var(--tone-neutral-03)); /* solid */
}
```

The hex variants (`colors-hex-*.css`) are pre-rendered for consumers that can't do the `rgb(var(--…))` evaluation. Don't import them in Tailwind- or web-component-based apps.

## Dark mode

Token values flip at the **palette level** - you don't write conditional colour code. Activate via an `<html>` class:

```html
<html class="pref-theme-system">
  <!-- follows OS preference -->
  <html class="pref-theme-light">
    <!-- always light -->
    <html class="pref-theme-dark">
      <!-- always dark -->
    </html>
  </html>
</html>
```

Because the same token name resolves to different values in each palette, code authored against tokens works in every theme automatically. **Do not write `@media (prefers-color-scheme: dark)` queries or per-theme overrides.** Theme activation is documented in [`projects/styles/SPEC.md`](../projects/styles/SPEC.md).

The same activation pattern applies to other accessibility preferences: `pref-contrast-*`, `pref-animation-*`, `pref-consumption-*`.

## Non-colour tokens

The other five categories follow the same naming pattern (`<category>-<role>-<level>` or `<category>-<role>`) and the same "use the semantic class first" principle. Highlights:

- **Typography** - consume via semantic utilities (`text-title-h1`, `text-info-paragraph`, `text-code-snippet`). See the typography table in [`projects/styles/SPEC.md`](../projects/styles/SPEC.md). **Never** compose `font-*` and `text-*` primitives by hand.
- **Sizing** - use Tailwind spacing utilities (`p-4`, `gap-2`, …) which map to the sizing tokens.
- **Screen** - use Tailwind breakpoint prefixes (`md:`, `lg:`, …) which map to the screen tokens.
- **Cosmetic** - opacities, transitions, shadows. The most important is `--magma-disabled-opacity` (default `0.5`); see global decisions in [`projects/styles/SPEC.md`](../projects/styles/SPEC.md).

## Token gallery

Visual reference is in Storybook - the colour scales are rendered live in [`projects/stencil/src/storybook/color-scale.stories.tsx`](../projects/stencil/src/storybook/color-scale.stories.tsx). Run `nx run stencil:storybook.start` to browse them, or look in the deployed Storybook site.

## Anti-patterns

- ❌ Raw Tailwind colour primitives (`bg-white`, `bg-gray-500`, `text-red-700`) - use Magma token classes
- ❌ Literal `rgba(...)` values - use the `rgb(var(--…) / alpha)` wrapper
- ❌ Hard-coded hex codes in component styles - token-only
- ❌ Importing `colors-hex-*.css` in Tailwind / web-component projects - only the RGB format works with the system
- ❌ Manual dark-mode media queries - palette flips for you
- ❌ Picking a `label-*` colour for status communication - use `status-*`
- ❌ Picking `variant-primary` for everything - its weight should be reserved for CTAs and the most important affordances

## Where to look next

| When you need                                                        | Read                                                                       |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Internal token structure, levels, naming rules, build                | [`projects/design-tokens/SPEC.md`](../projects/design-tokens/SPEC.md)      |
| Tailwind classes, CSS custom property exposure, dark mode activation | [`projects/styles/SPEC.md`](../projects/styles/SPEC.md)                    |
| The live colour ladder gallery                                       | Storybook → "Color scale"                                                  |
| Specific token values (RGB triplets)                                 | [`projects/styles/dist/css/colors-rgb-*.css`](../projects/styles/dist/css) |
| Hex equivalents (legacy consumers)                                   | [`projects/styles/dist/css/colors-hex-*.css`](../projects/styles/dist/css) |
