# Components reference

This document is the **contributor-facing guide** to Magma's web components, in the repo. It exists alongside, not instead of, the per-component docs: each component owns a Stencil-generated `readme.md` (props/events/slots/CSS vars) and a hand-authored `usage/` folder (description, patterns, anti-patterns). This guide tells you **which component to reach for**, **how to read the docs around it**, and **how to author them**. The rules shared by every component live in [`docs/agents/`](./agents/), see "Rules for using the components" below.

If you only need to look up the props of a known component, skip this and read its `readme.md`. If you need to _pick_ a component, _use it correctly_, or _author new usage docs_, start here.

## Where component documentation lives

Every component under [`projects/stencil/src/components/<name>/`](../projects/stencil/src/components/) has four documentation files in the repo, and the build writes four more into the package. Different files answer different questions - grep the right one:

| File                                     | Owner             | Versioned | Answers                                                                                  |
| ---------------------------------------- | ----------------- | --------- | ---------------------------------------------------------------------------------------- |
| `usage/1. Description.md`                | Authored          | yes       | What the component **is**, its semantic behavior, why it exists                          |
| `usage/2. Pattern.md`                    | Authored          | yes       | How to use it **correctly** - recommended recipes with code                              |
| `usage/3. Antipattern.md`                | Authored          | yes       | How **not** to use it - paired `INCORRECT` / `CORRECT` snippets                          |
| `readme.md`                              | Stencil (auto)    | yes       | What props, events, slots, methods, CSS vars exist (human-readable), plus the usage text |
| `dist/collection/components/<name>/AGENTS.md` | build (auto) | no        | The shipped API: props with their allowed values, events, methods, slots, parts, CSS vars |
| `dist/collection/components/<name>/pattern.md`, `antipattern.md` | build (auto) | no | The shipped copies of `2. Pattern.md` / `3. Antipattern.md`, links rewritten |
| `dist/collection/components/<name>/documentation.json` | build (auto) | no | Its entry of the docs JSON, with full type metadata                                |

**Build flow.** Only the three `usage/*.md` files are hand-authored. On build, Stencil bundles them into `dist/documentation.json` (all components, gitignored) and injects the content into `readme.md`; then `scripts/component-docs.ts` writes the per-component files of `dist/collection/components/<name>/`. As a consequence: never hand-edit `readme.md` or a generated file - they are regenerated and your edits will be lost. To change what a component's docs say, edit the matching `usage/*.md` (and the JSDoc of the props, events and CSS vars). Everything under `dist/` exists only after `nx run stencil:build`.

### Which file should the agent read?

Pick by task, not by preference:

| You need...                                                       | Read                                                                                                                                        |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Semantic intent ("what is this for, when do I use it?")         | `usage/1. Description.md` (smallest, always present, hand-authored)                                                                         |
| Idiomatic examples / common mistakes                            | `usage/2. Pattern.md` and `usage/3. Antipattern.md`                                                                                         |
| Props (with allowed values), events, slots, parts, CSS custom properties | the generated `AGENTS.md` after a build (compact); otherwise `readme.md` (always present)                                            |
| Typed prop value sets (what `tone` / `variant` / `size` accept) | [`components.d.ts`](../projects/stencil/src/components.d.ts) + [`type/*.ts`](../projects/stencil/src/type/) - the versioned source of truth |
| Full type metadata, cross-references (for codemods / tooling)   | the per-component `documentation.json` after a build; otherwise build first or fall back to `components.d.ts`                              |

Avoid loading `dist/documentation.json` as a default - it holds all 114 components (over 2 MB). Reach for the per-component one only when you specifically need the structured type metadata it carries.

## The `usage/` contract

Every component's `usage/` folder follows the same shape. Adhere to it when authoring new ones - agents and humans rely on the consistency.

### `1. Description.md`

Plain prose. Sections in this order:

1. **Opening paragraph** - one or two sentences identifying the component and its role in the system. Reference the tag literally (e.g. `<mds-button>`).
2. **`## Semantic Behavior`** - bulleted list of _intrinsic_ behavior the component encapsulates (e.g. "Form Association", "Active State", "Disabled State"). Each bullet has a bold lead and a short explanation. Cover only behaviors that survive across themes, sizes, and variants.
3. **`## Properties & Visual Configurations`** - bulleted reference for each prop that drives appearance or semantics. Group sub-options with nested bullets. This is _not_ a duplicate of `readme.md`'s prop table - it explains the _intent_ and _combinations_, not the type signature.

Avoid: code snippets, anti-patterns, "how to use" instructions. Those belong in the other two files.

### `2. Pattern.md`

Numbered list (`## 1.`, `## 2.`, ...) of correct usage recipes. Each entry:

- A short title (`## 5. Navigation Link Style`).
- One or two sentences on when/why to use this pattern.
- One ` ```html ` (or ` ```css ` for styling patterns) code block.

Order patterns from most-common to most-specialized. Include at least one styling-customization pattern showing the `--mds-*` CSS custom properties. Always reach for `label` props before slots when both are available.

### `3. Antipattern.md`

Numbered list (`## 1.`, `## 2.`, ...) of mistakes. Each entry:

- A short title naming the mistake (`## 3. Do Not Nest Button Inside an Anchor Link`).
- One or two sentences explaining _why_ it's wrong (accessibility, framework semantics, theme break, etc.).
- A paired code block with both the `<!-- INCORRECT -->` and `<!-- CORRECT -->` form.

Prioritize anti-patterns that an AI agent or new contributor is statistically likely to commit (boolean attrs as strings, slot misuse, shadow-DOM piercing, raw HTML elements replacing components).

## Component reference

One row per component. Group headings exist for scanability only - do **not** infer constraints from them. Find a component by intent (skim the right group, read the Intent column) or by HTML analogue (grep the Native analogue column when you'd otherwise reach for a native element).

> **Native analogue.** The _Native analogue_ column names the native element the component replaces: reach for the component where you would write that element. It does **not** mean the API is the same. The form controls keep most native attributes (`<mds-input-select multiple required name="x">` works like the `<select>`), but many components name things their own way or leave attributes out: `mds-progress` takes `progress`, not `value` / `max`; `mds-details` and `mds-modal` open with `opened`, `mds-accordion-item` with `selected`; `mds-list` has no `start` / `reversed`; `mds-input-upload` has no `multiple` / `name`; table cells have no `colspan`. Check the props before carrying a native attribute over.

Subparts (e.g. `mds-table-cell`, `mds-card-header`) always compose inside their parent - do not replace them with raw HTML.

### Forms & inputs

| Component                           | Native analogue                 | Intent                                                                                           |
| ----------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------ |
| `mds-input`                         | `<input>`, `<textarea>`         | Text input, single- or multi-line (`type="textarea"`), with validation, counter and typed formats. |
| `mds-input-field`                   | -                               | Wrapper around an input that provides label, tip, and validation slots.                          |
| `mds-input-select`                  | `<select>` (incl. `multiple`)   | Single or multi-select dropdown of fixed options.                                                |
| `mds-input-switch`                  | `<input type="checkbox">`       | Boolean on/off toggle or used as radio button (type="radio").                                    |
| `mds-input-range`                   | `<input type="range">`          | Slider for picking a numeric value between `min` and `max`.                                      |
| `mds-input-otp`                     | -                               | One-time-password / numeric-code entry, one digit per cell.                                      |
| `mds-input-date`                    | `<input type="date">`           | Date picker with calendar overlay and ISO format handling.                                       |
| `mds-input-date-range`              | -                               | Date range picker for selecting a start and end date.                                            |
| `mds-input-date-range-preselection` | -                               | Preset chooser for common date ranges (last week, last month, etc.).                             |
| `mds-input-upload`                  | `<input type="file">`           | File upload with drag-drop, preview, and progress support.                                       |
| `mds-input-tip`                     | -                               | Used internally, not meant for direct use. Hint / validation container shown alongside an input. |
| `mds-input-tip-item`                | -                               | Used internally, not meant for direct use. Single tip message inside `mds-input-tip`.            |
| `mds-calendar`                      | -                               | Visual calendar for date selection (without an input field).                                     |
| `mds-calendar-cell`                 | -                               | Used internally, not meant for direct use. Single day cell inside `mds-calendar`.                |

### Actions

| Component              | Native analogue    | Intent                                                            |
| ---------------------- | ------------------ | ----------------------------------------------------------------- |
| `mds-button`           | `<button>` / `<a>` | Interactive action; becomes a hyperlink when `href` is set.       |
| `mds-button-dropdown`  | -                  | Button that reveals a dropdown menu on activation.                |
| `mds-button-group`     | -                  | Groups related buttons visually as a single control.              |
| `mds-chip`             | -                  | Compact, selectable tag with optional icon and delete action.     |
| `mds-radial-menu`      | -                  | Circular menu with items arranged radially around a centre point. |
| `mds-radial-menu-item` | -                  | Single item inside `mds-radial-menu`.                             |

### Layout & structure

| Component                  | Native analogue           | Intent                                                                      |
| -------------------------- | ------------------------- | --------------------------------------------------------------------------- |
| `mds-accordion`            | -                         | Container for stacked expandable sections.                                  |
| `mds-accordion-item`       | `<details>` + `<summary>` | Single collapsible row inside `mds-accordion`.                              |
| `mds-accordion-timer`      | -                         | Accordion that auto-advances through items on a timer.                      |
| `mds-accordion-timer-item` | -                         | Timed item inside `mds-accordion-timer` with progress tracking.             |
| `mds-card`                 | -                         | Generic container with optional header, media, content, and footer regions. |
| `mds-card-header`          | -                         | Header region of `mds-card`.                                                |
| `mds-card-content`         | -                         | Main content region of `mds-card`.                                          |
| `mds-card-footer`          | -                         | Footer / actions region of `mds-card`.                                      |
| `mds-card-media`           | -                         | Image / video region at the top of `mds-card`.                              |
| `mds-details`              | `<details>`               | Standalone disclosure widget for collapsing arbitrary content.              |
| `mds-list`                 | `<ul>` / `<ol>`           | Vertical list container.                                                    |
| `mds-list-item`            | `<li>`                    | Single row inside `mds-list`.                                               |
| `mds-tree`                 | -                         | Hierarchical tree of nodes with expand/collapse.                            |
| `mds-tree-item`            | -                         | Single node inside `mds-tree`, can contain nested items.                    |
| `mds-horizontal-scroll`    | -                         | Horizontal scrolling container with overflow arrows.                        |
| `mds-separator`            | -                         | Thin, rounded horizontal divider between groups of content.                 |
| `mds-hr`                   | `<hr>`                    | Horizontal divider between blocks.                                          |

### Navigation

| Component              | Native analogue | Intent                                                                                         |
| ---------------------- | --------------- | ---------------------------------------------------------------------------------------------- |
| `mds-breadcrumb`       | -               | Trail showing the user's current location in a page hierarchy.                                 |
| `mds-breadcrumb-item`  | -               | Single step in `mds-breadcrumb`.                                                               |
| `mds-paginator`        | -               | Page-number navigation for paged collections.                                                  |
| `mds-paginator-item`   | -               | Used internally, not meant for direct use. Single page number / action inside `mds-paginator`. |
| `mds-stepper-bar`      | -               | Visual progress through a multi-step process.                                                  |
| `mds-stepper-bar-item` | -               | Single step inside `mds-stepper-bar`.                                                          |
| `mds-tab`              | -               | Tabbed panel group displaying the selected `mds-tab-item`.                                     |
| `mds-tab-item`         | -               | Single panel inside `mds-tab`.                                                                 |
| `mds-tab-bar`          | -               | Standalone tab bar used for mobile applications (without managed panels).                      |
| `mds-tab-bar-item`     | -               | Single tab button inside `mds-tab-bar`.                                                        |
| `mds-header`           | `<header>`      | Top-of-page header with navigation, hamburger, and responsive collapse.                        |
| `mds-header-bar`       | -               | Sticky bar inside `mds-header` with title and action controls.                                 |

### Data display

| Component                       | Native analogue | Intent                                                          |
| ------------------------------- | --------------- | --------------------------------------------------------------- |
| `mds-table`                     | `<table>`       | Tabular data container.                                         |
| `mds-table-header`              | `<thead>`       | Header section of `mds-table`.                                  |
| `mds-table-header-cell`         | `<th>`          | Header cell inside `mds-table-header`.                          |
| `mds-table-body`                | `<tbody>`       | Body section of `mds-table`.                                    |
| `mds-table-footer`              | `<tfoot>`       | Footer section of `mds-table` for totals / summaries.           |
| `mds-table-row`                 | `<tr>`          | Row inside `mds-table-body`.                                    |
| `mds-table-cell`                | `<td>`          | Data cell inside `mds-table-row`.                               |
| `mds-price-table`               | -               | Pricing-plan comparison layout.                                 |
| `mds-price-table-header`        | -               | Top row of `mds-price-table` (plan names, prices).              |
| `mds-price-table-list`          | -               | One pricing-plan column inside `mds-price-table`.               |
| `mds-price-table-list-item`     | -               | Single list row inside `mds-price-table-list`.                  |
| `mds-price-table-features`      | -               | Feature-matrix section inside `mds-price-table`.                |
| `mds-price-table-features-row`  | -               | Single feature row inside `mds-price-table-features`.           |
| `mds-price-table-features-cell` | -               | Cell inside `mds-price-table-features-row` (icon / text / label). |
| `mds-kpi`                       | -               | KPI panel container with one or more metric items.              |
| `mds-kpi-item`                  | -               | Single KPI metric inside `mds-kpi`.                             |
| `mds-benchmark-bar`             | -               | Horizontal bar visualising a benchmark value 0-100.             |
| `mds-progress`                  | `<progress>`    | Determinate progress indicator, as a bar or a ring.             |
| `mds-radial-progress`           | -               | Circular determinate progress indicator, with an optional icon. |
| `mds-spinner`                   | -               | Indeterminate loading spinner.                                  |

### Feedback & status

| Component                    | Native analogue | Intent                                                                                   |
| ---------------------------- | --------------- | ---------------------------------------------------------------------------------------- |
| `mds-banner`                 | -               | Inline state message (info / success / warning / error) with optional action.            |
| `mds-toast`                  | -               | Transient toast that appears and dismisses automatically.                                |
| `mds-notification`           | -               | Small notification badge / indicator.                                                    |
| `mds-push-notification`      | -               | Stack container for multiple push notifications.                                         |
| `mds-push-notification-item` | -               | Single push notification inside `mds-push-notification`.                                 |
| `mds-status-bar`             | -               | Status row showing badges, buttons, or condensed action controls.                        |
| `mds-badge`                  | -               | Small inline badge for counts, status dots, or tags.                                     |
| `mds-note`                   | -               | Callout block highlighting important information.                                        |
| `mds-help`                   | -               | Contextual help icon with tooltip / popover explanation.                                 |
| `mds-tooltip`                | -               | Floating tip shown on hover / focus.                                                     |
| `mds-zero`                   | -               | Empty-state placeholder for empty collections; supports an optional add / create action. |

### Overlays

| Component      | Native analogue | Intent                                                             |
| -------------- | --------------- | ------------------------------------------------------------------ |
| `mds-modal`    | `<dialog>`      | Modal dialog overlay that blocks page interaction until dismissed. |
| `mds-dropdown` | -               | Floating overlay menu triggered from a target element.             |

### Media & content

| Component          | Native analogue | Intent                                                                                                                          |
| ------------------ | --------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `mds-text`         | -               | Typography wrapper applying semantic styles (titles, body, captions, code).                                                     |
| `mds-img`          | `<img>`         | Responsive image with lazy loading and consumption-mode awareness.                                                              |
| `mds-icon`         | -               | SVG icon rendered by name from the icon library.                                                                                |
| `mds-emoji`        | -               | Animated mascot illustration (`mia`, `simi`) rendered as an interactive SVG.                                                    |
| `mds-quote`        | `<blockquote>`  | Quote / testimonial block with attribution styling.                                                                             |
| `mds-bibliography` | -               | A single citation, formatted in a recognized academic style.                                                                    |
| `mds-url-view`     | `<iframe>`      | Embedded preview of an external page in a framed, browser-like window.                                                          |
| `mds-video-wall`   | -               | Full-bleed, autoplaying, looping background video behind foreground content.                                                    |
| `mds-label`        | -               | Standalone text label for grouping or tagging - **not** the `<label>` for inputs (use `mds-input-field`'s label slot for that). |

### People & entities

| Component               | Native analogue | Intent                                                         |
| ----------------------- | --------------- | -------------------------------------------------------------- |
| `mds-avatar`            | -               | Profile image with initials fallback and colour variants.      |
| `mds-avatar-stack`      | -               | Container displaying multiple avatars in an overlapping stack. |
| `mds-avatar-stack-item` | -               | Single avatar inside `mds-avatar-stack`.                       |
| `mds-author`            | -               | Author byline card with avatar and biographical info.          |
| `mds-entity`            | -               | Generic entity card with image, initials, icon, and status.    |
| `mds-mention`           | -               | Inline @-mention tag with avatar and name.                     |
| `mds-policy-ai`         | -               | AI-policy disclosure badge for AI-assisted content.            |

### Files & filtering

| Component          | Native analogue | Intent                                                       |
| ------------------ | --------------- | ------------------------------------------------------------ |
| `mds-file`         | -               | File listing row with icon, name, type, and download action. |
| `mds-file-preview` | -               | Card previewing a file: name, size, type, icon or thumbnail. |
| `mds-filter`       | -               | Filter-control panel grouping `mds-filter-item`s.            |
| `mds-filter-item`  | -               | Single filter option inside `mds-filter`.                    |

### Keyboard

| Component          | Native analogue | Intent                                                     |
| ------------------ | --------------- | ---------------------------------------------------------- |
| `mds-keyboard`     | -               | Keyboard-shortcut combo display showing pressed-key state. |
| `mds-keyboard-key` | -               | Single key inside `mds-keyboard`.                          |

### User preferences

| Component                     | Native analogue | Intent                                                     |
| ----------------------------- | --------------- | ---------------------------------------------------------- |
| `mds-pref`                    | -               | Root preferences panel grouping all `mds-pref-*` controls. |
| `mds-pref-mode`               | -               | Light / dark / system mode selector.                       |
| `mds-pref-theme`              | -               | Named theme chooser (default, `cool`, `warm`).             |
| `mds-pref-theme-item`         | -               | Single named theme inside `mds-pref-theme`.                |
| `mds-pref-contrast`           | -               | High-contrast preference toggle.                           |
| `mds-pref-animation`          | -               | Reduced-motion / animation preference toggle.              |
| `mds-pref-consumption`        | -               | Image / data consumption preference (low / medium / high). |
| `mds-pref-language`           | -               | Language selector inside `mds-pref`.                       |
| `mds-pref-language-item`      | -               | Single language option inside `mds-pref-language`.         |

### Dev tooling

| Component   | Native analogue | Intent                                                            |
| ----------- | --------------- | ----------------------------------------------------------------- |
| `mds-usage` | -               | Internal Storybook helper that renders a component-usage example. |

## Rules for using the components

The rules that apply across every component are written once, for consumers and
contributors alike, in [`docs/agents/`](./agents/) - the same files ship inside the
packages as `agents/*.md`:

| Topic | File |
| ----- | ---- |
| Naming, boolean props, sizing, events, slots, compound components, icons, accessibility, styling from outside | [`agents/conventions.md`](./agents/conventions.md) |
| `variant` (color role) and `tone` (visual weight), and what one component accepts | [`agents/variants.md`](./agents/variants.md) |
| System-level anti-patterns | [`agents/anti-patterns.md`](./agents/anti-patterns.md) |
| Dark mode, preferences, named themes, surface levels and elevation, global design decisions, corner geometry | [`agents/theming.md`](./agents/theming.md) |
| Color tokens and utilities | [`agents/color.md`](./agents/color.md) |
| Typography utilities | [`agents/typography.md`](./agents/typography.md) |

Contributor-only anti-pattern, on top of those: never hand-edit a component's
`readme.md` or `components.d.ts` - both are regenerated on build.

## Authoring new `usage/` docs

When creating `usage/` files for a component that doesn't yet have them:

1. **Read the component first.** Open `<component>/readme.md` (props, events, slots, CSS vars) and the component's `.tsx` source. Note the prop names, the default slot's content rules, and what events fire.
2. **Skim a sibling that already has `usage/`.** Mirror its file structure and headings exactly. [`mds-button`](../projects/stencil/src/components/mds-button/usage/) is the current reference.
3. **Write `1. Description.md` first.** It scopes the other two - once you know what the component _is_, the patterns and anti-patterns surface naturally.
4. **Cap each file's length.** `1. Description.md` about 20-40 lines, `2. Pattern.md` at most 12 recipes, `3. Antipattern.md` at most 8 entries. Longer means you're describing implementation rather than usage.
5. **Use real, runnable code blocks.** No pseudo-code. Use prop names exactly as they appear in `readme.md`.
6. **Do not duplicate `readme.md`.** Don't restate the prop type table; explain _combinations_ and _intent_.
7. **Validate against the system-level anti-patterns** in [`agents/anti-patterns.md`](./agents/anti-patterns.md). If a pattern you wrote violates one, fix the pattern.

## Where to look next

| When you need                                           | Read                                                                              |
| ------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Props / events / slots / CSS vars for a known component | `projects/stencil/src/components/<name>/readme.md`, or the generated `AGENTS.md` |
| Exact TS-typed prop signatures for every component      | [`projects/stencil/src/components.d.ts`](../projects/stencil/src/components.d.ts) |
| Tone / variant / size dictionary definitions            | [`projects/stencil/src/type/`](../projects/stencil/src/type/), explained in [`agents/variants.md`](./agents/variants.md) |
| Rules shared by every component                         | [`docs/agents/`](./agents/) - see "Rules for using the components" above        |
| Intent and idioms for a known component                 | `projects/stencil/src/components/<name>/usage/*.md`                               |
| Colour roles, theming, dark mode                        | [`agents/color.md`](./agents/color.md), [`agents/theming.md`](./agents/theming.md); token families in [`docs/TOKENS.md`](./TOKENS.md) |
| Tailwind utilities, focus utilities, layer order        | [`projects/styles/SPEC.md`](../projects/styles/SPEC.md)                           |
| Stencil build, packaging, publication                   | [`projects/stencil/SPEC.md`](../projects/stencil/SPEC.md)                         |
| Live demos                                              | [Storybook][storybook] of `dev`, or `nx run stencil:storybook.start`              |
| Architecture across the monorepo                        | [`docs/ARCHITECTURE.md`](./ARCHITECTURE.md)                                       |
| Coding standards                                        | [`docs/CODING_STANDARDS.md`](./CODING_STANDARDS.md)                               |

[storybook]: https://magma-design-system.github.io/magma/storybook/
