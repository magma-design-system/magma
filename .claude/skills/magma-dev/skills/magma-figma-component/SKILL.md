---
name: magma-figma-component
description: Add, realign or check a Magma (mds-*) component in the Figma library Magma Design System 2 against the code - props, values, tokens, layout - proved on the library's QA page. Use when asked to add, port, fix or check a Magma component in Figma.
---

# Magma component → Figma library

Builds or realigns one Magma component (`mds-*`) in the Figma library so that a designer or an agent using it gets **the same API as the code**: same prop names, same values, same tokens, same layout behaviour. The work is done only when the component's card on the 🧪 QA page reports **0 KO**.

Load the Figma skills `figma-use` and `figma-generate-library` before any `use_figma` call, and pass both in `skillNames`. This skill adds the Magma-specific rules on top of them.

All commands below run from this skill's folder (`cd` into it first). Settings live in `config.json` (Figma file key, QA page name, optional Magma path); nothing else needs editing.

## Fixed facts

| What                   | Value                                                                                                                                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Library file           | `figmaFileName` / `figmaFileKey` in `config.json` (work on `main` unless the user asks for a Figma branch)                                                                                                   |
| Library pages          | Actions, Forms, Navigation, Feedback, Overlays, Data, Tags, Structure, Content, Preferences, Internal (inner parts)                                                                                          |
| QA page                | `🧪 QA` at the end of the file: `QA / Riepilogo` + root `QA / Componenti` with one section `QA / <Library page>` per page and `QA / Token`                                                                   |
| Code source of truth   | Magma checkout, `projects/stencil/` (found automatically, see step 0): `magma.api.txt` (props/values/defaults), `src/components/<tag>/<tag>.tsx` (structure, parts) and `<tag>.css` (layout, tokens, states) |
| Not a source of values | guidelines, the old Magma Figma libraries, prototypes: use them for structure ideas only                                                                                                                     |

**Never edit the components' code from this skill**: it only reads it; a mismatch the code should fix is an issue for the maintainers. **Never publish the library**: the user publishes.

## Workflow

### 0. Check the setup (once per session)

1. `python3 scripts/doctor.py`. It finds the Magma checkout (env `MAGMA_STENCIL` → `magmaStencil` in config.json → the repo the skill or the current folder is in → `~/magma`) and warns if it is old. On `FIX`, tell the user exactly what it says and stop; on `WARN` about age, tell the user before relying on the code.
2. Make sure the Figma plugin tools are there (`use_figma`, `get_screenshot`, `whoami`). If not, tell the user to install the Figma plugin for Claude Code and log in; stop.
3. `create_session` on `figmaFileKey`, then reuse that session id.

### 1. Read the code

1. Props: `python3 scripts/extract-api.py <tag>`. It prints every prop with type, enum values and default, the slots and the CSS custom properties.
2. Structure: read `render()` in the `.tsx` — which parts exist, which are conditional on a prop, which child components are used (`mds-badge`, `mds-icon`, `mds-progress`…).
3. Layout and tokens: `python3 scripts/component-css.py <tag>` prints the `.css` and every file it `@import`s (`css/<tag>-variant-*.css`, pref sheets…) state by state, with nesting resolved (`:host([variant='red']) + :host([tone='weak'])`), then the library tokens it uses and the borders written as plain numbers. `--vars` keeps only the custom properties: that is the colour table per variant. Read from it `display`, `gap`/`padding` (`--spacing(n)`), `min-width`/`flex`, wrapping, `:host([prop])` states, `:last-of-type`-style cases.

### 2. Write the mapping and get it approved

Before building, show the user one table, and wait for an explicit go (skip the wait only if the user has already said to build without approval — still show the table in the report):

- **Props**: Figma property ↔ code prop, Figma type (VARIANT / BOOLEAN / TEXT / INSTANCE_SWAP), values, default. Rules in [references/conventions.md](references/conventions.md#props).
- **Tokens**: for every CSS value, the Figma variable or style it binds to. Run `python3 scripts/figma-script.py tokens <tag>` and pass its output to `use_figma` as is: it lists every library token the component's CSS uses (imported sheets included; the component's own `--mds-*` variables are replaced by their values), with the matching variables, the Size variables for borders written as numbers (`1px` → `border-width/xs`), and the text styles for its `typography` values. Rules in [conventions.md → Tokens](references/conventions.md#tokens).
- **Layout**: how each CSS layout rule becomes auto-layout. Rules in [conventions.md → Layout](references/conventions.md#layout).
- **Reuse**: library components it nests (Focus ring, Icon, Badge, Progress…) instead of redrawing them.
- **Gaps**: anything that cannot be matched, with the reason (it goes into the description).

### 3. Build

Follow `figma-generate-library` (single component path). On top of it:

- Put the set on the library page of its family; inner parts go to Internal.
- Bind every fill, stroke, gap, padding, radius, stroke weight, text style and effect style. No raw values except fixed icon geometry.
- Colour variants: one `variant` property whose values set the explicit mode of the matching `Variant/*` collection on each variant; fills bind to that collection's variables.
- Write the description with the template in [conventions.md → Description](references/conventions.md#description).
- Read [references/figma-gotchas.md](references/figma-gotchas.md) before the first script: it lists the API traps already hit in this file.

### 4. Prove it on the QA page

Every Figma script is generated: run the command, pass its whole output as `code` to `use_figma` with `fileKey` = `figmaFileKey`. Never hand-edit or hand-retype a generated script.

1. Cards: `python3 scripts/figma-script.py card <set-id> [<set-id> …]` (re)builds each card in its `QA / <page>` section: default + one instance per non-default value of each variant property + one per inverted boolean, and re-counts the summary. Include the parent when you changed a nested part.
2. Check: `python3 scripts/figma-script.py check <set-id>=<mds-tag> [… more pairs]` — read-only. It reports KO and warnings: prop names/values vs code, values not bound to tokens (the linter), text overflowing the component, description problems, undocumented missing combinations. Figma-only properties and code props left out are read from the description (`Figma-only: …`, `Not in Figma: …`), so a property that is not documented there is a KO by design.
3. Fix and repeat until **0 KO**. A warning needs either a fix or a sentence in the description.
4. Screenshot the card once (`get_screenshot` on the card) and look at it: clipped focus rings, overlaps, empty instances.

### 5. Report

Tell the user, briefly: what was built or changed, the mapping gaps, the QA result (cases / partial / KO), and that the library is ready for them to publish.

## When the component is an inner part already drawn inside its parent

Many Magma tags are parts of another one (`mds-card-media` in `mds-card`, `mds-pref-theme-item` in `mds-pref-theme`). If the parent already draws the part as plain layers, promote it instead of redrawing:

1. Clone the part's frame from the parent's default variant, `figma.createComponentFromNode(clone)`, move it to the parent's library page, add variants/properties as for any component. Tags with `display: none` or no visual (`mds-input-range-value`, `mds-usage`) are skipped.
2. In every parent variant, replace the old layers with an instance of the new component (or `swapComponent` an existing nested instance, then `resetOverrides()` and re-apply only the content you need, then resize to the main component's size — see gotchas).
3. Set `isExposedInstance = true` on the nested instance so its props show on the parent; `deleteComponentProperty` the parent props that now live on the child, and update the parent's description.
4. Compare the parent before/after on its QA card: same size, same look. Rebuild the parent's card with the `card` script too.
5. If an old helper set becomes unused, **ask the user before deleting it** — never delete library components on your own.

## When realigning an existing component

Same steps, but first run the `check` script on the current set to get the list of differences, rename in place (`editComponentProperty` keeps instance values; see gotchas) and never delete and rebuild a published set: instances in consumer files would detach.
