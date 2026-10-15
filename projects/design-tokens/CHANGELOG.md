# Changelog

Every release of `@maggioli-design-system/design-tokens`, newest first. Each section is the body of the GitHub
release with the same tag, written by git-cliff from the conventional commits of the
package.

## [design-tokens@15.1.0] - 2026-10-14

### Documentation

- *(magma,styles,design-tokens)* Rewrite the color docs on the semantic layer
- *(magma,styles,design-tokens)* Align the styles and design-tokens docs with the build

### Features

- *(design-tokens)* Export every global token as DTCG 2025.10 JSON

### Refactor

- *(design-tokens,styles)* Build the semantic layer as data in design-tokens
- *(design-tokens)* Export the DTCG helpers the styles globals reuse

## [design-tokens@15.0.1] - 2026-10-05

### Bug Fixes

- *(design-tokens)* Import the scale helpers in the playground themes section

## [design-tokens@15.0.0] - 2026-09-30

### Bug Fixes

- *(design-tokens)* Stop deepMerge from mutating module-level defaults
- *(design-tokens)* Make the published cli runnable
- *(design-tokens)* Keep the new-color dialog open on outside clicks
- *(design-tokens)* Make token export deterministic and writes reliable
- *(design-tokens)* Clear error when a color references an undefined ratios scale
- *(design-tokens)* Flag only real overrides in the groups view
- *(design-tokens)* Hide the playground picker in surfaces, groups and diff
- *(design-tokens)* Preview the neutral ink on colored surfaces, not #000
- *(design-tokens)* Playground surface preview - one family at a time, step charts on top
- *(design-tokens)* Retune the text targets so no two text roles collapse onto one step
- *(design-tokens)* Spell the leonardo background color name correctly

### Changes

- *(design-tokens)* Raise the hue shift angle limit to 180 degrees
- *(design-tokens)* Easing-based distribution modes for contrast scales
- *(design-tokens)* Name colors via color-namer in the playground
- *(design-tokens)* Restructure playground navigation around colors, scales and groups
- *(design-tokens)* Select the first involved color when switching scale
- *(design-tokens)* Tag built-in-only ratio scales in the playground selects
- *(design-tokens)* Retune the default surface, border and text ramp

### Documentation

- *(design-tokens)* Add configuration reference and generation model to readme
- *(design-tokens)* Document the nx playground target

### Features

- *(design-tokens)* Add GIMP palette format and update configuration for design tokens
- *(design-tokens)* Add hue shifting support to color token generation
- *(design-tokens)* Add config playground with live palette preview
- *(design-tokens)* Make hue shift inheritance explicit in the playground
- *(design-tokens)* Load and download configs from the playground
- *(design-tokens)* Manage contrast scales in the playground
- *(design-tokens)* Full easing set and free scale deletion in the playground
- *(design-tokens)* Auto-name colors from their value in the playground
- *(design-tokens)* Create colors from a picker dialog in the playground
- *(design-tokens)* Group-level ratios and formula
- *(design-tokens)* Download generated tokens as a zip from the playground
- *(design-tokens)* Download menu with per-format token exports
- *(design-tokens)* Group-level export targets
- *(design-tokens)* Diversify CSS and GIMP downloads per export group
- *(design-tokens)* Batch export editing across groups in the playground
- *(design-tokens)* Toggle to show only selected color scales in groups
- *(design-tokens)* Add `ui` command serving the playground with a config API
- *(design-tokens)* Save, persist and reset the playground config in the ui
- *(design-tokens)* Add a JSON Schema and validate configs against it
- *(design-tokens)* Add a diff view to the playground
- *(design-tokens)* Group selected colors on top in the groups view
- *(design-tokens)* Export Figma color tokens in the DTCG standard format
- *(design-tokens)* Download DTCG Figma tokens from the playground
- *(design-tokens)* Flag built-in contrast scales in the playground
- *(design-tokens)* Lightness-based surface + border token engine (#571)
- *(design-tokens)* Explicit contrast bounds + ratio validation (#578)
- *(design-tokens)* Usable-band visualization in the scales playground (#578)
- *(design-tokens)* Surface editor view in the playground (#571)
- *(design-tokens)* Explain each semantic role in the surfaces view (#571)
- *(design-tokens)* [**breaking**] Emit --tone-*-seed for the pure extreme (#572)
- *(design-tokens)* Add by-target text-role engine (#591)
- *(design-tokens)* Text roles in the playground surface view (#591)
- *(design-tokens)* Add APCA contrast gate for semantic pairs (#575)
- *(design-tokens)* Add surface preview aids to the playground
- *(design-tokens)* Pick text-role step by worst-case surface (A7)
- *(design-tokens)* Back a foreground from any surface-opted family, not just tone
- *(design-tokens)* Derive themes from the surfaces opt-in in the playground
- *(design-tokens)* Slider per i lightness levels nel playground
- *(design-tokens)* Add the themes map to the semantic config
- *(design-tokens)* Make variant reference its source via the alias field
- *(design-tokens)* Declare the accent roles and gate their contrast
- *(design-tokens)* Alias-aware colors editor in playground
- *(design-tokens)* Declare accent interaction-state steps and gate them
- *(design-tokens)* Add shared accent theme-override helper and playground accent section
- *(design-tokens,stencil,styles)* Collapse accent roles to {accent, ai}
- *(design-tokens)* Enforce variant alias-only model in playground
- *(design-tokens)* Two-column themes workbench with tabbed preview
- *(design-tokens)* Opt a whole group into surfaces, with status always on
- *(design-tokens)* Promote semantic roles under pref-contrast-more
- *(design-tokens,styles,stencil)* Publish the hue role scales and promote them under pref-contrast-more
- *(design-tokens)* Retune the border ramp and gate it in the playground
- *(design-tokens,styles,stencil)* Retint the raw ramp with the theme via --magma-scale-*
- *(design-tokens,styles,stencil)* Give the colored hues the emphasis band states
- *(design-tokens,styles)* Give the neutral pills a wash band
- *(design-tokens,styles,stencil)* A shadow ink role, the ring family back, and a guard
- *(design-tokens)* Add the radius scale tuned for the squircle
- *(design-tokens)* Take the page to the paper of the mode under contrast-more
- *(design-tokens)* Move the accent ink to step 03
- *(design-tokens)* Add the less marked level of the inverse surface

### Refactor

- *(design-tokens)* Retune built-in wcag3 ratios within the APCA band
- *(design-tokens)* Rifinisci il layout degli slider dei lightness levels
- *(design-tokens,styles,stencil)* Name the hue background levels wash-*, not surface-*

### Styling

- *(design-tokens)* Cap hue shift slider width in the playground
