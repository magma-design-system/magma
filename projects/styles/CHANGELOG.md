# Changelog

Every release of `@maggioli-design-system/styles`, newest first. Each section is the body of the GitHub
release with the same tag, written by git-cliff from the conventional commits of the
package.

## [styles@17.3.0] - 2026-10-21

### Bug Fixes

- *(design-tokens,styles)* Size utilities with a t-shirt name read the container, not spacing

### Features

- *(styles)* List the aliases and the keyword variables of the theme in consumption.json

## [styles@17.2.1] - 2026-10-20

### Bug Fixes

- *(design-tokens,styles,magma)* The shadow ink stays dark in dark mode, no more light halo
- *(design-tokens,styles)* Transition-cosmetic animates translate, scale and rotate

### Documentation

- *(styles,magma)* A pill that casts a shadow takes surface-overlay, not a wash

## [styles@17.2.0] - 2026-10-15

### Bug Fixes

- *(styles)* Keep the box of the hydrated components against tailwind's preflight
- *(styles)* Give every role of the semantic tailwind bridge its light default as fallback

### Build

- *(design-tokens,identity,styles,svg-icons,icons,magma)* Ship CHANGELOG.md in every package

### Documentation

- *(styles)* Add the tailwind half of editor autocomplete to the readme

### Features

- *(styles)* Carry the role descriptions into consumption.json and the editor sheet
- *(styles)* Fall back to the round scale where corner-shape cannot be drawn

### Refactor

- *(styles)* Move the token resolver of properties.ts into css-resolve.ts

## [styles@17.1.0] - 2026-10-14

### Bug Fixes

- *(styles)* List the corner radius steps in tokens.editor.css

### Documentation

- *(styles)* Say that the semantic layer is expanded by semantic.model.ts
- *(styles)* Document the globals DTCG and the consumption map

### Features

- *(styles)* Publish the globals as DTCG 2025.10 JSON
- *(styles)* Export the Tailwind consumption map as JSON

### Refactor

- *(design-tokens,styles)* Build the semantic layer as data in design-tokens

## [styles@17.0.1] - 2026-10-10

### Bug Fixes

- *(styles,magma)* Require internal dependencies as caret ranges

### Documentation

- *(styles)* Point the semantic migration at codemod category L
- *(magma,styles,design-tokens)* Rewrite the color docs on the semantic layer
- *(magma,styles,design-tokens)* Align the styles and design-tokens docs with the build

## [styles@17.0.0] - 2026-09-30

### Bug Fixes

- *(stencil,styles)* Close the escape hatch of #624, and repair the registration snapshots
- *(styles)* Let the corner shape token inherit, and admit functional shapes
- *(styles)* Put the page on the semantic surface, and give a link a colour that exists
- *(styles)* Let the global tokens inherit
- *(styles)* Let color-scheme follow the palette in every mode
- *(styles)* Retint the inverse surface with the named theme

### Build

- *(styles)* Fix dead Nx targetDefaults block

### Changes

- *(styles)* Space the comments the way stylelint wants them

### Documentation

- *(styles)* Add semantic color system SPEC (S0)
- *(styles)* Themes derive from any surface-opted family (spec 8)
- *(styles,magma)* Document the corner axis, and stop recommending the hatch
- *(styles)* The contrast layer promotes the page surface (spec 9.3)
- *(styles,magma)* Update the compatibility table for magma 2 stable

### Features

- *(styles)* Semantic color layer (--mds-*) + Tailwind 4 bridge (#573)
- *(styles)* Theming axes - data-theme-name, tint indirection, --depth (#574)
- *(styles)* Generate the --magma-* semantic layer from a config (#328)
- *(styles)* Retint the foreground with the theme via --magma-tint-text-*
- *(styles)* Ruolo inverse-surface (rename da neutral-emphasis)
- *(styles)* Generate named-theme overrides, retire the stale tint rules
- *(styles)* Emit theme-aware accent roles from the accents map
- *(styles)* Emit accent interaction-state roles from the state-step map
- *(design-tokens,stencil,styles)* Collapse accent roles to {accent, ai}
- *(design-tokens,styles,stencil)* Publish the hue role scales and promote them under pref-contrast-more
- *(styles,stencil)* Register the component custom properties from globals.css
- *(design-tokens,styles,stencil)* Retint the raw ramp with the theme via --magma-scale-*
- *(design-tokens,styles,stencil)* Give the colored hues the emphasis band states
- *(design-tokens,styles)* Give the neutral pills a wash band
- *(design-tokens,styles,stencil)* A shadow ink role, the ring family back, and a guard
- *(styles)* Generate a token sheet editors can autocomplete from
- *(styles,stencil)* Emit the corner axis, shape and scale in one block
- *(styles)* Publish --magma-surface-inverse-muted
- *(styles)* Add --magma-on-backdrop, the ink on the modal scrim
- *(styles)* Dark on-emphasis ink follows the canvas instead of pure black

### Refactor

- *(stencil,styles)* [**breaking**] Migrate --tone-*(bare) usages to --tone-*-seed (#572)
- *(styles)* Rename semantic layer prefix to --magma-* (#573)
- *(styles)* Stage generated CSS in a dedicated build dir
- *(styles)* Emit accent tint overrides via the shared helper
- *(design-tokens,styles,stencil)* Name the hue background levels wash-*, not surface-*
- *(styles)* Paint the light focus-zoom outline with text-on-emphasis
- *(styles)* Retire the --magma-scale-NN bridge from the semantic layer
