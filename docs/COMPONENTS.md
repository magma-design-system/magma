# Components reference

This document is the **contributor-facing guide** to Magma's web components, in the repo. It exists alongside, not instead of, the per-component docs: each component owns a Stencil-generated `readme.md` (props/events/slots/CSS vars) and a hand-authored `usage/` folder (description, examples, mistakes). This guide tells you **which component to reach for**, **how to read the docs around it**, and **how to author them**. The rules shared by every component live in [`docs/agents/`](./agents/), see "Rules for using the components" below.

If you only need to look up the props of a known component, skip this and read its `readme.md`. If you need to _pick_ a component, _use it correctly_, or _author new usage docs_, start here.

## Where component documentation lives

Every component under [`projects/stencil/src/components/<name>/`](../projects/stencil/src/components/) has four documentation files in the repo, and the build writes four more into the package. Different files answer different questions - grep the right one:

| File                                     | Owner             | Versioned | Answers                                                                                  |
| ---------------------------------------- | ----------------- | --------- | ---------------------------------------------------------------------------------------- |
| `usage/1. Description.md`                | Authored          | yes       | What the component **is**, its semantic behavior, why it exists                          |
| `usage/2. Examples.md`                   | Authored          | yes       | How to use it **correctly** - recommended recipes with code                              |
| `usage/3. Mistakes.md`                   | Authored          | yes       | How **not** to use it - paired `INCORRECT` / `CORRECT` snippets                          |
| `readme.md`                              | Stencil (auto)    | yes       | What props, events, slots, methods, CSS vars exist (human-readable), plus the usage text |
| `dist/collection/components/<name>/AGENTS.md` | build (auto) | no        | The shipped API: props with their allowed values, events, methods, slots, parts, CSS vars |
| `dist/collection/components/<name>/examples.md`, `mistakes.md` | build (auto) | no | The shipped copies of `2. Examples.md` / `3. Mistakes.md`, links rewritten |
| `dist/collection/components/<name>/documentation.json` | build (auto) | no | Its entry of the docs JSON, with full type metadata                                |

**Build flow.** Only the three `usage/*.md` files are hand-authored. On build, Stencil bundles them into `dist/documentation.json` (all components, gitignored) and injects the content into `readme.md`; then `scripts/component-docs.ts` writes the per-component files of `dist/collection/components/<name>/`. As a consequence: never hand-edit `readme.md` or a generated file - they are regenerated and your edits will be lost. The one exception is worse: Stencil keeps whatever sits above `<!-- Auto Generated Below -->` in a readme and ships it in the `readme` field of `dist/documentation.json`, where nobody keeps it current. Only the title and the generic intro belong there, and `check.usage-docs` fails on anything else. To change what a component's docs say, edit the matching `usage/*.md` (and the JSDoc of the props, events, methods, slots, parts and CSS vars: `check.usage-docs` also fails on a member without a description). A prop whose value has a format or a syntax the name does not reveal (a date, a CSS selector, a `srcset`, a language code, a pattern) also carries an `@example`: one value, on one line, quoted, as `@example '2025-06-15'`; it reaches `documentation.json`, where the docs site shows it as the placeholder of the field. A prop whose value is plain text (`label`, `name`, `headline`) needs none. Everything under `dist/` exists only after `nx run stencil:build`.

**Storybook.** The same three files make up each component's Docs page in Storybook (sections Description, Examples and Mistakes around the primary story), read at runtime from `usage/*.md`: see the Storybook paragraph of [`projects/stencil/SPEC.md`](../projects/stencil/SPEC.md#per-component-usage-docs).

**Examples and mistakes, not patterns.** In Magma a pattern is the solution to a task people carry out again and again (confirm an action, search a list), across components and over time: the definition of the docs site (`agents/patterns.md` in `magma-design-system/docs`) that phase 5 of #1083 ships in the package. The two files of one component show how to write it and what not to write, so they take the words its shipped `AGENTS.md` always used for them, "correct usage, with examples" and "mistakes to avoid"; not "usage", already the folder, the `usage` field of `documentation.json` and the MCP `get_usage` (#1169).

### Which file should the agent read?

Pick by task, not by preference:

| You need...                                                       | Read                                                                                                                                        |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Semantic intent ("what is this for, when do I use it?")         | `usage/1. Description.md` (smallest, always present, hand-authored)                                                                         |
| Idiomatic examples / common mistakes                            | `usage/2. Examples.md` and `usage/3. Mistakes.md`                                                                                           |
| Props (with allowed values), events, slots, parts, CSS custom properties | the generated `AGENTS.md` after a build (compact); otherwise `readme.md` (always present)                                            |
| Typed prop value sets (what `tone` / `variant` / `size` accept) | [`components.d.ts`](../projects/stencil/src/components.d.ts) + [`type/*.ts`](../projects/stencil/src/type/) - the versioned source of truth |
| Full type metadata, cross-references (for codemods / tooling)   | the per-component `documentation.json` after a build; otherwise build first or fall back to `components.d.ts`                              |

Avoid loading `dist/documentation.json` as a default - it holds all 117 components (over 2 MB). Reach for the per-component one only when you specifically need the structured type metadata it carries.

## The `usage/` contract

Every component's `usage/` folder follows the same shape. Adhere to it when authoring new ones - agents and humans rely on the consistency.

### `1. Description.md`

Plain prose. Sections in this order:

1. **Opening paragraph** - one or two sentences identifying the component and its role in the system. Reference the tag literally (e.g. `<mds-button>`).
2. **`## Semantic Behavior`** - bulleted list of _intrinsic_ behavior the component encapsulates (e.g. "Form Association", "Active State", "Disabled State"). Each bullet has a bold lead and a short explanation. Cover only behaviors that survive across themes, sizes, and variants.
3. **`## Properties & Visual Configurations`** - bulleted reference for each prop that drives appearance or semantics. Group sub-options with nested bullets. This is _not_ a duplicate of `readme.md`'s prop table - it explains the _intent_ and _combinations_, not the type signature.

Avoid: code snippets, mistakes, "how to use" instructions. Those belong in the other two files.

### `2. Examples.md`

Numbered list (`## 1.`, `## 2.`, ...) of correct usage recipes. Each entry:

- A short title (`## 5. Navigation Link Style`).
- One or two sentences on when/why to use this form.
- One ` ```html ` (or ` ```css ` for styling examples) code block.

Order examples from most-common to most-specialized. Include at least one styling-customization example showing the public `--mds-*` CSS custom properties (or, for a component without any, its parts and props). Always reach for `label` props before slots when both are available.

### `3. Mistakes.md`

Numbered list (`## 1.`, `## 2.`, ...) of mistakes. Each entry:

- A short title naming the mistake (`## 3. Do Not Nest Button Inside an Anchor Link`).
- One or two sentences explaining _why_ it's wrong (accessibility, framework semantics, theme break, etc.).
- A paired code block with both the `<!-- INCORRECT -->` and `<!-- CORRECT -->` form.

Prioritize mistakes that an AI agent or new contributor is statistically likely to commit (boolean attrs as strings, slot misuse, shadow-DOM piercing, raw HTML elements replacing components).

## Categories

Every component that stands alone sits in one category, the shelf a reader browses when they do not know its name; every part of a compound component sits under that compound instead, and never in a list of its own. Both are docs tags in the JSDoc right above `@Component` (the comment Stencil reads `@slot` and `@part` from):

- `@category <id>` on a component that stands alone, one id from the table below;
- `@parent <tag>` on a part, naming the component it is a direct child of; several tags, space-separated, where it sits in several (`@parent mds-table-row mds-table-footer`). The first one leads to its compound, whose category the part takes.

| Category      | What it holds                                                                         |
| ------------- | ------------------------------------------------------------------------------------- |
| `actions`     | Controls that make something happen: buttons, links, action bars and menus            |
| `forms`       | Fields that take a value, and the calendar and the filters that help pick one         |
| `navigation`  | Where the user is and where they can go: breadcrumbs, tabs, steps, pages, trees       |
| `feedback`    | Messages, progress and empty states that tell the user what is happening              |
| `overlays`    | Surfaces that float over the page: dialogs, dropdowns, tooltips, help                 |
| `data`        | Sets of values and the people they belong to: tables, lists, figures, avatars         |
| `tags`        | Short markers attached to other content: badges, chips, labels, mentions, keys        |
| `structure`   | Containers and dividers that lay the page out: cards, accordions, headers, rules      |
| `content`     | Text, media and files: typography, images, icons, quotes, notes, previews             |
| `preferences` | The controls a user tunes the interface with: mode, theme, contrast, motion, language |

A component gets a category when it works on its own, even if it usually sits inside another: each `mds-pref-*` works without `mds-pref`. It is a part when it does nothing outside its parent: `mds-header-bar` only opens and closes inside `mds-header`. Pick the category by what the reader wants to do, not by how the component looks: `mds-link` is an action, written as a word of running text; `mds-file-preview` shows a file, wherever the file comes from, so it is content and not a form control.

Stencil passes both tags to `docsTags` in `dist/documentation.json`, where the docs site reads them to group its Components navigation and to show each part beside its compound. `scripts/sync-agent-docs.ts` groups the shipped `agents/components.md` catalogue by them and **fails the build** when a component has neither tag or both, a category outside the table, or a parent that is not a component or never leads to one with a category. The list lives in `COMPONENT_CATEGORIES` ([`projects/stencil/scripts/agent-docs-lib.ts`](../projects/stencil/scripts/agent-docs-lib.ts)): add or rename a category there and in the table above together.

Storybook groups its sidebar the same way: a component that stands alone sits at `UI / <Category title> / <Name>` (`UI / Forms / Input`), its parts and its other pages under it (`UI / Data / Table / Cell`). Each stories file and MDX page writes that title, and `scripts/story-titles-lib.spec.ts` fails `nx run stencil:test` when one is out of step with the tags: a component that changes category moves its pages with it, keeping their ids (the rule is in the Tests section of [`projects/stencil/SPEC.md`](../projects/stencil/SPEC.md#tests)).

## Component reference

One row per component, grouped by [category](#categories), each part of a compound right after its compound. Find a component by intent (skim the right category, read the Intent column) or by HTML analogue (grep the Native analogue column when you'd otherwise reach for a native element).

> **Native analogue.** The _Native analogue_ column names the native element the component replaces: reach for the component where you would write that element. It does **not** mean the API is the same. The form controls keep most native attributes (`<mds-input-select multiple required name="x">` works like the `<select>`), but many components name things their own way or leave attributes out: `mds-progress` takes `progress`, not `value` / `max`; `mds-details` and `mds-modal` open with `opened`, `mds-accordion-item` with `selected`; `mds-list` has no `start` / `reversed`; `mds-input-upload` has no `multiple` / `name`; table cells have no `colspan`. Check the props before carrying a native attribute over.

Parts (e.g. `mds-table-cell`, `mds-card-header`) always compose inside their parent - do not replace them with raw HTML.

### Actions

| Component              | Native analogue    | Intent                                                            |
| ---------------------- | ------------------ | ----------------------------------------------------------------- |
| `mds-button`           | `<button>` / `<a>` | Interactive action; becomes a hyperlink when `href` is set.       |
| `mds-button-dropdown`  | -                  | Button that reveals a dropdown menu on activation.                |
| `mds-button-group`     | -                  | Groups related buttons visually as a single control.              |
| `mds-link`             | `<a>`              | Link inside running text, or an inline action without `href`.     |
| `mds-radial-menu`      | -                  | Circular menu with items arranged radially around a centre point. |
| `mds-radial-menu-item` | -                  | Single item inside `mds-radial-menu`.                             |
| `mds-status-bar`       | -                  | Status row showing badges, buttons, or condensed action controls. |

### Forms

| Component                           | Native analogue               | Intent                                                                                             |
| ----------------------------------- | ----------------------------- | -------------------------------------------------------------------------------------------------- |
| `mds-input`                         | `<input>`, `<textarea>`       | Text input, single- or multi-line (`type="textarea"`), with validation, counter and typed formats. |
| `mds-input-tip`                     | -                             | Used internally, not meant for direct use. Hint / validation container shown alongside an input.   |
| `mds-input-tip-item`                | -                             | Used internally, not meant for direct use. Single tip message inside `mds-input-tip`.              |
| `mds-input-field`                   | -                             | Wrapper around an input that provides label, tip, and validation slots.                            |
| `mds-input-select`                  | `<select>` (incl. `multiple`) | Single or multi-select dropdown of fixed options.                                                  |
| `mds-input-switch`                  | `<input type="checkbox">`     | Boolean on/off toggle or used as radio button (type="radio").                                      |
| `mds-input-range`                   | `<input type="range">`        | Slider for picking a numeric value between `min` and `max`.                                        |
| `mds-input-otp`                     | -                             | One-time-password / numeric-code entry, one digit per cell.                                        |
| `mds-input-date`                    | `<input type="date">`         | Date picker with calendar overlay and ISO format handling.                                         |
| `mds-input-date-range`              | -                             | Date range picker for selecting a start and end date.                                              |
| `mds-input-date-range-preselection` | -                             | Preset chooser for common date ranges (last week, last month, etc.).                               |
| `mds-input-upload`                  | `<input type="file">`         | File upload with drag-drop, preview, and progress support.                                         |
| `mds-calendar`                      | -                             | Visual calendar for date selection (without an input field).                                       |
| `mds-calendar-cell`                 | -                             | Used internally, not meant for direct use. Single day cell inside `mds-calendar`.                  |
| `mds-filter`                        | -                             | Filter-control panel grouping `mds-filter-item`s.                                                  |
| `mds-filter-item`                   | -                             | Single filter option inside `mds-filter`.                                                          |

### Navigation

| Component              | Native analogue | Intent                                                                                         |
| ---------------------- | --------------- | ---------------------------------------------------------------------------------------------- |
| `mds-tree`             | -               | Hierarchical tree of nodes with expand/collapse.                                               |
| `mds-tree-item`        | -               | Single node inside `mds-tree`, can contain nested items.                                       |
| `mds-breadcrumb`       | -               | Trail showing the user's current location in a page hierarchy.                                 |
| `mds-breadcrumb-item`  | -               | Single step in `mds-breadcrumb`.                                                               |
| `mds-paginator`        | -               | Page-number navigation for paged collections.                                                  |
| `mds-paginator-item`   | -               | Used internally, not meant for direct use. Single page number / action inside `mds-paginator`. |
| `mds-stepper-bar`      | -               | Visual progress through a multi-step process.                                                  |
| `mds-stepper-bar-item` | -               | Single step inside `mds-stepper-bar`.                                                          |
| `mds-tab`              | -               | Tabbed panel group displaying the selected `mds-tab-item`, or a strip of links without panels. |
| `mds-tab-item`         | -               | Single tab inside `mds-tab`; a link when `href` is set.                                        |
| `mds-tab-bar`          | -               | Standalone tab bar used for mobile applications (without managed panels).                      |
| `mds-tab-bar-item`     | -               | Single tab button inside `mds-tab-bar`.                                                        |

### Feedback

| Component                    | Native analogue | Intent                                                                                   |
| ---------------------------- | --------------- | ---------------------------------------------------------------------------------------- |
| `mds-progress`               | `<progress>`    | Determinate progress indicator, as a bar or a ring.                                      |
| `mds-radial-progress`        | -               | Circular determinate progress indicator, with an optional icon.                          |
| `mds-spinner`                | -               | Indeterminate loading spinner.                                                           |
| `mds-banner`                 | -               | Inline state message (info / success / warning / error) with optional action.            |
| `mds-toast`                  | -               | Transient toast that appears and dismisses automatically.                                |
| `mds-toast-region`           | -               | Live region at a viewport edge that lines up the toasts shown at once.                   |
| `mds-notification`           | -               | Small notification badge / indicator.                                                    |
| `mds-push-notification`      | -               | Stack container for multiple push notifications.                                         |
| `mds-push-notification-item` | -               | Single push notification inside `mds-push-notification`.                                 |
| `mds-zero`                   | -               | Empty-state placeholder for empty collections; supports an optional add / create action. |

### Overlays

| Component      | Native analogue | Intent                                                             |
| -------------- | --------------- | ------------------------------------------------------------------ |
| `mds-help`     | -               | Contextual help icon with tooltip / popover explanation.           |
| `mds-tooltip`  | -               | Floating tip shown on hover / focus.                               |
| `mds-modal`    | `<dialog>`      | Modal dialog overlay that blocks page interaction until dismissed. |
| `mds-dropdown` | -               | Floating overlay menu triggered from a target element.             |

### Data

| Component                       | Native analogue | Intent                                                                            |
| ------------------------------- | --------------- | --------------------------------------------------------------------------------- |
| `mds-list`                      | `<ul>` / `<ol>` | Vertical list container.                                                          |
| `mds-list-item`                 | `<li>`          | Single row inside `mds-list`.                                                     |
| `mds-table`                     | `<table>`       | Tabular data container.                                                           |
| `mds-table-header`              | `<thead>`       | Header section of `mds-table`.                                                    |
| `mds-table-header-cell`         | `<th>`          | Header cell inside `mds-table-header`.                                            |
| `mds-table-body`                | `<tbody>`       | Body section of `mds-table`.                                                      |
| `mds-table-footer`              | `<tfoot>`       | Footer section of `mds-table` for totals / summaries.                             |
| `mds-table-row`                 | `<tr>`          | Row inside `mds-table-body`.                                                      |
| `mds-table-cell`                | `<td>`          | Data cell inside `mds-table-row`, or right inside `mds-table-footer`.             |
| `mds-price-table`               | -               | Pricing-plan comparison layout.                                                   |
| `mds-price-table-header`        | -               | Top row of `mds-price-table` (plan names, prices).                                |
| `mds-price-table-list`          | -               | One pricing-plan column inside `mds-price-table` or its `mds-price-table-header`. |
| `mds-price-table-list-item`     | -               | Single list row inside `mds-price-table-list`.                                    |
| `mds-price-table-features`      | -               | Feature-matrix section inside `mds-price-table`.                                  |
| `mds-price-table-features-row`  | -               | Single feature row inside `mds-price-table-features`.                             |
| `mds-price-table-features-cell` | -               | Cell inside `mds-price-table-features-row` (icon / text / label).                 |
| `mds-kpi`                       | -               | KPI panel container with one or more metric items.                                |
| `mds-kpi-item`                  | -               | Single KPI metric inside `mds-kpi`.                                               |
| `mds-benchmark-bar`             | -               | Horizontal bar visualising a benchmark value 0-100.                               |
| `mds-avatar`                    | -               | Profile image with initials fallback and colour variants.                         |
| `mds-avatar-stack`              | -               | Container displaying multiple avatars in an overlapping stack.                    |
| `mds-avatar-stack-item`         | -               | Single avatar inside `mds-avatar-stack`.                                          |
| `mds-author`                    | -               | Author byline card with avatar and biographical info.                             |
| `mds-entity`                    | -               | Generic entity card with image, initials, icon, and status.                       |

### Tags

| Component          | Native analogue | Intent                                                                                                                          |
| ------------------ | --------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `mds-chip`         | -               | Compact, selectable tag with optional icon and delete action.                                                                   |
| `mds-badge`        | -               | Small inline badge for counts, status dots, or tags.                                                                            |
| `mds-label`        | -               | Standalone text label for grouping or tagging - **not** the `<label>` for inputs (use `mds-input-field`'s label slot for that). |
| `mds-mention`      | -               | Inline @-mention tag with avatar and name.                                                                                      |
| `mds-policy-ai`    | -               | AI-policy disclosure badge for AI-assisted content.                                                                             |
| `mds-keyboard`     | -               | Keyboard-shortcut combo display showing pressed-key state.                                                                      |
| `mds-keyboard-key` | -               | Single key inside `mds-keyboard`.                                                                                               |

### Structure

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
| `mds-horizontal-scroll`    | -                         | Horizontal scrolling container with overflow arrows.                        |
| `mds-separator`            | -                         | Thin, rounded horizontal divider between groups of content.                 |
| `mds-hr`                   | `<hr>`                    | Horizontal divider between blocks.                                          |
| `mds-header`               | `<header>`                | Top-of-page header with navigation, hamburger, and responsive collapse.     |
| `mds-header-bar`           | -                         | Sticky bar inside `mds-header` with title and action controls.              |

### Content

| Component          | Native analogue | Intent                                                                                                      |
| ------------------ | --------------- | ----------------------------------------------------------------------------------------------------------- |
| `mds-note`         | -               | Callout block highlighting important information.                                                           |
| `mds-text`         | -               | Typography wrapper applying semantic styles (titles, body, captions, code).                                 |
| `mds-img`          | `<img>`         | Responsive image with lazy loading and consumption-mode awareness.                                          |
| `mds-book`         | -               | A book as a physical object in 3D, from its front cover alone: spine, pages, thickness, binding and format. |
| `mds-icon`         | -               | SVG icon rendered by name from the icon library.                                                            |
| `mds-emoji`        | -               | Animated mascot illustration (`mia`, `simi`) rendered as an interactive SVG.                                |
| `mds-quote`        | `<blockquote>`  | Quote / testimonial block with attribution styling.                                                         |
| `mds-bibliography` | -               | A single citation, formatted in a recognized academic style.                                                |
| `mds-url-view`     | `<iframe>`      | Embedded preview of an external page in a framed, browser-like window.                                      |
| `mds-video-wall`   | -               | Full-bleed, autoplaying, looping background video behind foreground content.                                |
| `mds-file`         | -               | File listing row with icon, name, type, and download action.                                                |
| `mds-file-preview` | -               | Card previewing a file: name, size, type, icon or thumbnail.                                                |
| `mds-usage`        | -               | Internal Storybook helper that renders a component-usage example.                                           |

### Preferences

| Component                | Native analogue | Intent                                                     |
| ------------------------ | --------------- | ---------------------------------------------------------- |
| `mds-pref`               | -               | Root preferences panel grouping all `mds-pref-*` controls. |
| `mds-pref-mode`          | -               | Light / dark / system mode selector.                       |
| `mds-pref-theme`         | -               | Named theme chooser (default, `cool`, `warm`).             |
| `mds-pref-theme-item`    | -               | Single named theme inside `mds-pref-theme`.                |
| `mds-pref-contrast`      | -               | High-contrast preference toggle.                           |
| `mds-pref-animation`     | -               | Reduced-motion / animation preference toggle.              |
| `mds-pref-consumption`   | -               | Image / data consumption preference (low / medium / high). |
| `mds-pref-language`      | -               | Language selector inside `mds-pref`.                       |
| `mds-pref-language-item` | -               | Single language option inside `mds-pref-language`.         |

## Rules for using the components

The rules that apply across every component are written once, for consumers and
contributors alike, in [`docs/agents/`](./agents/) - the same files ship inside the
packages as `agents/*.md`:

| Topic | File |
| ----- | ---- |
| Naming, boolean props, sizing, events, slots, compound components, icons, accessibility, styling from outside | [`agents/conventions.md`](./agents/conventions.md) |
| `variant` (color role) and `tone` (visual weight), and what one component accepts | [`agents/variants.md`](./agents/variants.md) |
| Mistakes to avoid with any component | [`agents/mistakes.md`](./agents/mistakes.md) |
| Dark mode, preferences, named themes, surface levels and elevation, global design decisions, corner geometry | [`agents/theming.md`](./agents/theming.md) |
| Color tokens and utilities | [`agents/color.md`](./agents/color.md) |
| Typography utilities | [`agents/typography.md`](./agents/typography.md) |

Contributor-only mistake, on top of those: never hand-edit a component's
`readme.md` or `components.d.ts` - both are regenerated on build. Text written above the
generated part of a readme survives the build instead, and goes stale: put it in `usage/`.

## Authoring new `usage/` docs

When creating `usage/` files for a component that doesn't yet have them:

1. **Read the component first.** Open `<component>/readme.md` (props, events, slots, CSS vars) and the component's `.tsx` source. Note the prop names, the default slot's content rules, and what events fire.
2. **Skim a sibling that already has `usage/`.** Mirror its file structure and headings exactly. [`mds-button`](../projects/stencil/src/components/mds-button/usage/) is the current reference.
3. **Write `1. Description.md` first.** It scopes the other two - once you know what the component _is_, the examples and the mistakes surface naturally.
4. **Cap each file's length.** `1. Description.md` about 20-40 lines, `2. Examples.md` at most 12 recipes, `3. Mistakes.md` at most 8 entries. Longer means you're describing implementation rather than usage.
5. **Use real, runnable code blocks.** No pseudo-code. Use prop names exactly as they appear in `readme.md`.
6. **Do not duplicate `readme.md`.** Don't restate the prop type table; explain _combinations_ and _intent_.
7. **Validate against the mistakes shared by every component** in [`agents/mistakes.md`](./agents/mistakes.md). If an example you wrote makes one, fix the example.

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
| Live demos                                              | [Storybook][storybook] of `main`, or `nx run stencil:storybook.start`             |
| Architecture across the monorepo                        | [`docs/ARCHITECTURE.md`](./ARCHITECTURE.md)                                       |
| Coding standards                                        | [`docs/CODING_STANDARDS.md`](./CODING_STANDARDS.md)                               |

[storybook]: https://magma-design-system.github.io/magma/storybook/
