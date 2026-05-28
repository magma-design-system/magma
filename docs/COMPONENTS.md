# Components reference

This document is the **agent-and consumer-facing guide** for Magma's web components. It exists alongside, not instead of, the per-component docs: each component owns a Stencil-generated `readme.md` (props/events/slots/CSS vars) and a hand-authored `usage/` folder (description, patterns, anti-patterns). This guide tells you **which component to reach for**, **how to read the docs around it**, and **conventions that apply across the whole library**.

If you only need to look up the props of a known component, skip this and read its `readme.md`. If you need to _pick_ a component, _use it correctly_, or _author new usage docs_, start here.

## Where component documentation lives

Every component under [`projects/stencil/src/components/<name>/`](../projects/stencil/src/components/) exposes documentation in five files. Different files answer different questions - grep the right one:

| File                   | Owner          | Versioned       | Answers                                                                                           |
| ---------------------- | -------------- | --------------- | ------------------------------------------------------------------------------------------------- |
| `usage/1. Description.md` | Authored       | ✅              | What the component **is**, its semantic behavior, why it exists                                |
| `usage/2. Pattern.md`     | Authored       | ✅              | How to use it **correctly** - recommended recipes with code                                    |
| `usage/3. Antipattern.md` | Authored       | ✅              | How **not** to use it - paired `INCORRECT` / `CORRECT` snippets                                |
| `readme.md`            | Stencil (auto) | ✅              | What props, events, slots, methods, CSS vars exist (human-readable)                               |
| `documentation.json`   | Stencil (auto) | ❌ (local-only) | Structured JSON with full type metadata and cross-references; absent until `nx run stencil:build` |

**Build flow.** Only the three `usage/*.md` files are hand-authored. On build, Stencil bundles them into `documentation.json` and injects the content into `readme.md`. As a consequence: never hand-edit `readme.md` or `documentation.json` - both are regenerated and your edits will be lost. To change what a component's docs say, edit the matching `usage/*.md`. Note that `documentation.json` is gitignored (`projects/stencil/.gitignore`) and only exists after a local build - do not rely on it being present in a fresh clone or when browsing the repo on GitHub.

### Which file should the agent read?

Pick by task, not by preference:

| You need…                                                       | Read                                                                                                                                        |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Semantic intent ("what is this for, when do I use it?")         | `usage/1. Description.md` (smallest, always present, hand-authored)                                                                         |
| Idiomatic examples / common mistakes                            | `usage/2. Pattern.md` and `usage/3. Antipattern.md`                                                                                         |
| Props, events, slots, CSS custom properties                     | `readme.md` (always present, ~3-4× smaller than `documentation.json`)                                                                       |
| Typed prop value sets (what `tone` / `variant` / `size` accept) | [`components.d.ts`](../projects/stencil/src/components.d.ts) + [`type/*.ts`](../projects/stencil/src/type/) - the versioned source of truth |
| Full type metadata, cross-references (for codemods / tooling)   | `documentation.json` **if present**; otherwise build first or fall back to `components.d.ts`                                                |

Avoid loading `documentation.json` as a default - it's ~3-4× larger than `readme.md` and frequently absent. Reach for it only when you specifically need the structured type metadata it carries.

## The `usage/` contract

Every component's `usage/` folder follows the same shape. Adhere to it when authoring new ones - agents and humans rely on the consistency.

### `1. Description.md`

Plain prose. Sections in this order:

1. **Opening paragraph** - one or two sentences identifying the component and its role in the system. Reference the tag literally (e.g. `<mds-button>`).
2. **`## Semantic Behavior`** - bulleted list of _intrinsic_ behavior the component encapsulates (e.g. "Form Association", "Active State", "Disabled State"). Each bullet has a bold lead and a short explanation. Cover only behaviors that survive across themes, sizes, and variants.
3. **`## Properties & Visual Configurations`** - bulleted reference for each prop that drives appearance or semantics. Group sub-options with nested bullets. This is _not_ a duplicate of `readme.md`'s prop table - it explains the _intent_ and _combinations_, not the type signature.

Avoid: code snippets, anti-patterns, "how to use" instructions. Those belong in the other two files.

### `2. Pattern.md`

Numbered list (`## 1.`, `## 2.`, …) of correct usage recipes. Each entry:

- A short title (`## 5. Navigation Link Style`).
- One or two sentences on when/why to use this pattern.
- One ` ```html ` (or ` ```css ` for styling patterns) code block.

Order patterns from most-common to most-specialized. Include at least one styling-customization pattern showing the `--mds-*` CSS custom properties. Always reach for `label` props before slots when both are available.

### `3. Antipattern.md`

Numbered list (`## 1.`, `## 2.`, …) of mistakes. Each entry:

- A short title naming the mistake (`## 3. Do Not Nest Button Inside an Anchor Link`).
- One or two sentences explaining _why_ it's wrong (accessibility, framework semantics, theme break, etc.).
- A paired code block with both the `<!-- INCORRECT -->` and `<!-- CORRECT -->` form.

Prioritize anti-patterns that an AI agent or new contributor is statistically likely to commit (boolean attrs as strings, slot misuse, shadow-DOM piercing, raw HTML elements replacing components).

## Component reference

One row per component. Group headings exist for scanability only - do **not** infer constraints from them. Find a component by intent (skim the right group, read the Intent column) or by HTML analogue (grep the Native analogue column when you'd otherwise reach for a native element).

> **Native-analogue contract.** When the _Native analogue_ column is filled, the Magma component **preserves every native attribute with the same behavior** (`multiple`, `disabled`, `required`, `type`, `min`/`max`, `placeholder`, `name`, `autocomplete`, etc.). Magma adds UX affordances on top - theming, accessibility defaults, keyboard handling, slots for icons or badges, animations - but never alters or removes native semantics. If you'd write `<select multiple required name="x">`, write `<mds-input-select multiple required name="x">`.

Subparts (e.g. `mds-table-cell`, `mds-card-header`) always compose inside their parent - do not replace them with raw HTML.

### Forms & inputs

| Component                           | Native analogue                 | Intent                                                                                           |
| ----------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------ |
| `mds-input`                         | `<input>` (text / email / etc.) | Single-line text input with validation, counter, and multiple input types.                       |
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
| `mds-separator`            | -                         | Vertical visual divider between sections.                                   |
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
| `mds-price-table-list`          | -               | Feature-list section inside `mds-price-table`.                  |
| `mds-price-table-list-item`     | -               | Single list row inside `mds-price-table-list`.                  |
| `mds-price-table-features`      | -               | Feature-matrix section inside `mds-price-table`.                |
| `mds-price-table-features-row`  | -               | Single feature row inside `mds-price-table-features`.           |
| `mds-price-table-features-cell` | -               | Cell inside `mds-price-table-features-row` (✓/✗/text).          |
| `mds-kpi`                       | -               | KPI panel container with one or more metric items.              |
| `mds-kpi-item`                  | -               | Single KPI metric inside `mds-kpi`.                             |
| `mds-benchmark-bar`             | -               | Horizontal bar visualising a benchmark value 0-100.             |
| `mds-progress`                  | `<progress>`    | Linear determinate progress indicator.                          |
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
| `mds-emoji`        | -               | Decorative emoji / illustration glyph.                                                                                          |
| `mds-quote`        | `<blockquote>`  | Quote / testimonial block with attribution styling.                                                                             |
| `mds-bibliography` | -               | Formatted bibliography / citation list.                                                                                         |
| `mds-url-view`     | -               | Display of a URL with formatted domain / path emphasis.                                                                         |
| `mds-video-wall`   | -               | Gallery grid of video thumbnails.                                                                                               |
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
| `mds-file-preview` | -               | Fullscreen file preview viewer.                              |
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
| `mds-pref-theme`              | -               | Light / dark / system theme selector.                      |
| `mds-pref-theme-variant`      | -               | Theme colour-variant chooser inside `mds-pref-theme`.      |
| `mds-pref-theme-variant-item` | -               | Single theme variant inside `mds-pref-theme-variant`.      |
| `mds-pref-contrast`           | -               | High-contrast preference toggle.                           |
| `mds-pref-animation`          | -               | Reduced-motion / animation preference toggle.              |
| `mds-pref-consumption`        | -               | Image / data consumption preference (low / medium / high). |
| `mds-pref-language`           | -               | Language selector inside `mds-pref`.                       |
| `mds-pref-language-item`      | -               | Single language option inside `mds-pref-language`.         |

### Dev tooling

| Component   | Native analogue | Intent                                                            |
| ----------- | --------------- | ----------------------------------------------------------------- |
| `mds-usage` | -               | Internal Storybook helper that renders a component-usage example. |

## Cross-cutting conventions

These apply across every component. Apply them once; do not re-derive them per component.

### `variant` - semantic role

`variant` answers _what kind of action/state this is_. Allowed values depend on the component but draw from these families:

| Family    | Values                                       | Use for                                                    |
| --------- | -------------------------------------------- | ---------------------------------------------------------- |
| Brand     | `primary`, `secondary`, `ai`                 | Calls to action, supporting actions, AI-driven affordances |
| Luminance | `dark`, `light`                              | Neutral chrome buttons / chips                             |
| Status    | `info`, `success`, `warning`, `error`        | Communicating state                                        |
| Identity  | `google`, `apple`, etc. (component-specific) | Login / SSO buttons                                        |

Pick the variant that matches the **meaning**, not the colour you happen to want.

### `tone` - visual weight

`tone` answers _how much emphasis this should have_, independent of `variant`. Standard ladder, supported by most interactive components:

| Tone      | Weight              | Visual                                          |
| --------- | ------------------- | ----------------------------------------------- |
| `strong`  | Highest emphasis    | Solid filled background                         |
| `weak`    | Medium emphasis     | Subtle tinted background                        |
| `outline` | Medium-low emphasis | Border only, no fill                            |
| `text`    | Lowest emphasis     | No border, no background - just the label       |
| `box`     | Boxed container     | High-contrast container style (where supported) |

The same `variant` + different `tone` is the right way to express importance - do not invent custom CSS to dim or saturate.

### Per-component prop availability

The values a specific component accepts for `tone`, `variant`, `size`, etc. are **narrower** than the universal ladders above. For example, `mds-button` accepts `tone="outline"` but `mds-banner` does not. The single source of truth is [`projects/stencil/src/components.d.ts`](../projects/stencil/src/components.d.ts), which Stencil regenerates on build from each component's `@Prop()` JSDoc - **never hand-edit it**.

To verify a prop value before using it:

1. Grep `interface Mds<Name>` in [`projects/stencil/src/components.d.ts`](../projects/stencil/src/components.d.ts).
2. Note the prop's typed name (e.g. `tone?: ToneMinimalBoxVariantType`).
3. Resolve the typed name against the dictionaries below (defined in [`projects/stencil/src/type/`](../projects/stencil/src/type/)).

The five `tone` dictionaries (from [`projects/stencil/src/type/tone.ts`](../projects/stencil/src/type/tone.ts)):

| Type                        | Allowed `tone` values                      | Example component |
| --------------------------- | ------------------------------------------ | ----------------- |
| `ToneMinimalVariantType`    | `strong`, `weak`                           | `mds-chip`       |
| `ToneMinimalBoxVariantType` | `strong`, `weak`, `box`                    | `mds-banner`      |
| `ToneSmartVariantType`      | `strong`, `weak`, `outline`                | `mds-badge` |
| `ToneVariantType`           | `outline`, `strong`, `text`, `weak`        | `mds-radial-menu` |
| `ToneBoxVariantType`        | `outline`, `strong`, `text`, `weak`, `box` | `mds-button`      |

`variant`, `size`, and other constrained props follow the same pattern - look for the matching dictionary in [`projects/stencil/src/type/`](../projects/stencil/src/type/) (e.g. `ThemeVariantType`, `ThemeFullVariantType`, `ChipVariantType`, `ProgressBarSizeType`).

### `label` prop vs. default slot

When a component accepts both a `label` prop and a default slot, **prefer the prop**. Slots are for cases where the prop is insufficient and the component explicitly documents accepted slotted content. Never put nested HTML in a default slot expecting it to render - most Magma components strip non-text nodes.

### Named slots

When a component documents a named slot (`<mds-notification slot="notification">`), use that exact slot name on the child element. Do not invent slot names.

### CSS customization

Style components only through their documented `--mds-<component>-<prop>` CSS custom properties. Set those vars on the host element or on a parent selector:

```css
.featured-card mds-button {
  --mds-button-background: rgb(var(--variant-primary-03));
  --mds-button-radius: var(--radius-lg);
}
```

For colour values inside CSS vars, use the Magma token wrapper `rgb(var(--<token>))` - see [`docs/TOKENS.md`](./TOKENS.md).

### Event naming

Magma events are prefixed with `mds` and use camelCase (e.g. `mdsInputSelectChange`). Listen for the documented event name; do not synthesize your own.

### Sizing

Components that expose `size` accept `sm`, `md` (default), `lg`, `xl`. Do not override size via inline `width`/`height` - use the prop.

## Accessibility, theming, and preferences

The component layer already handles these - **do not re-implement them in app code**:

- **Dark mode** - flips at the palette level via `<html class="pref-theme-*">`. Components read tokens, not literal colours, so they invert automatically. See [`docs/TOKENS.md`](./TOKENS.md#dark-mode).
- **High contrast / reduced motion / low consumption** - `pref-contrast-*`, `pref-animation-*`, `pref-consumption-*` classes on `<html>` cascade through.
- **Focus styles** - apply `focus-bounce` (interactive elements) or `focus-zoom` (links / static elements). Do not write `:focus { outline: … }`.
- **ARIA on icon-only controls** - components that accept `icon` without a label require `aria-label` (or `title`) on the host element. The component does not synthesize one.
- **Form association** - interactive components that own a value are `formAssociated`. Place them inside `<form>` and they submit / reset natively.
- **Disabled state** - set the `disabled` prop on the component, not on a wrapper. Disabled components are removed from the tab order automatically.

## System-level anti-patterns

These apply to **every** component. Per-component `3. Antipattern.md` files address component-specific mistakes; the ones below are universal.

- ❌ Replacing a Magma component with a raw HTML element (`<button>`, `<input>`, `<a>` for an action) when an `mds-*` equivalent exists.
- ❌ Wrapping an interactive `mds-*` component in another interactive element (`<a><mds-button></mds-button></a>` - use the `href` prop instead).
- ❌ Reaching into shadow DOM via `::part()`, `>>>`, `/deep/`, or attribute-selector hacks. Use documented CSS custom properties.
- ❌ Setting boolean attributes to the string `"false"` (e.g. `disabled="false"`, `await="false"`). In HTML/Stencil any non-empty string is truthy - **remove the attribute** to turn it off.
- ❌ Embedding nested HTML in a default slot when the component documents a `label` prop.
- ❌ Using raw Tailwind colour utilities (`bg-white`, `text-gray-700`) on or inside Magma components - use Magma token classes (`bg-tone-neutral`, `text-tone-neutral-03`).
- ❌ Writing `@media (prefers-color-scheme: dark)` overrides - dark mode is handled by the palette layer.
- ❌ Hand-rolling focus styles instead of `focus-bounce` / `focus-zoom`.
- ❌ Listening for native DOM events (`change`, `input`) when the component emits a documented `mds*` event - they may not bubble out of shadow DOM the way you expect.
- ❌ Applying a `tone`, `variant`, or `size` value to a component without checking its typed signature in [`projects/stencil/src/components.d.ts`](../projects/stencil/src/components.d.ts). The same prop name accepts different value sets per component - e.g. `<mds-banner tone="outline">` is invalid because `mds-banner.tone` is `ToneMinimalBoxVariantType` (`strong | weak | box` only).
- ❌ Hand-editing a component's `readme.md` or `components.d.ts` - both are regenerated on build.

## Authoring new `usage/` docs

When creating `usage/` files for a component that doesn't yet have them:

1. **Read the component first.** Open `<component>/readme.md` (props, events, slots, CSS vars) and the component's `.tsx` source. Note the prop names, the default slot's content rules, and what events fire.
2. **Skim a sibling that already has `usage/`.** Mirror its file structure and headings exactly. [`mds-button`](../projects/stencil/src/components/mds-button/usage/) is the current reference.
3. **Write `1. Description.md` first.** It scopes the other two - once you know what the component _is_, the patterns and anti-patterns surface naturally.
4. **Cap each file's length.** `1. Description.md` ≈ 20-40 lines, `2. Pattern.md` ≤ 12 recipes, `3. Antipattern.md` ≤ 8 entries. Longer means you're describing implementation rather than usage.
5. **Use real, runnable code blocks.** No pseudo-code. Use prop names exactly as they appear in `readme.md`.
6. **Do not duplicate `readme.md`.** Don't restate the prop type table; explain _combinations_ and _intent_.
7. **Validate against this guide's anti-patterns.** If a pattern you wrote violates a system-level anti-pattern, fix the pattern.

## Where to look next

| When you need                                           | Read                                                                              |
| ------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Props / events / slots / CSS vars for a known component | `projects/stencil/src/components/<name>/readme.md`                                |
| Exact TS-typed prop signatures for every component      | [`projects/stencil/src/components.d.ts`](../projects/stencil/src/components.d.ts) |
| Tone / variant / size dictionary definitions            | [`projects/stencil/src/type/`](../projects/stencil/src/type/)                     |
| Intent and idioms for a known component                 | `projects/stencil/src/components/<name>/usage/*.md`                               |
| Colour tokens, theming, dark mode                       | [`docs/TOKENS.md`](./TOKENS.md)                                                   |
| Tailwind utilities, focus utilities, layer order        | [`projects/styles/SPEC.md`](../projects/styles/SPEC.md)                           |
| Stencil build, packaging, publication                   | [`projects/stencil/SPEC.md`](../projects/stencil/SPEC.md)                         |
| Live demos                                              | Storybook - `nx run stencil:storybook.start`                                      |
| Architecture across the monorepo                        | [`docs/ARCHITECTURE.md`](./ARCHITECTURE.md)                                       |
| Coding standards                                        | [`docs/CODING_STANDARDS.md`](./CODING_STANDARDS.md)                               |
