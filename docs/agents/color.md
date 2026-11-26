# Magma styles - color

> Scope: coloring your own UI with Magma's semantic color roles, in Tailwind and in
> plain CSS. Requires the styles setup in [`assets.md`](assets.md), including
> `semantic.css`. Dark mode, contrast and named themes: [`theming.md`](theming.md).
> The `variant` prop of the components: [`variants.md`](variants.md).

## Name the role, not the colour

Paint your UI with the semantic roles (`--magma-*`), not with a raw palette step and never
with Tailwind's own palette:

```html
<!-- CORRECT: roles follow the mode, the named theme and high contrast -->
<section class="bg-surface-raised text-fg-default border border-border-muted">
  <p class="text-fg-muted">Secondary text</p>
</section>

<!-- INCORRECT: raw Magma steps only flip with the mode -->
<section class="bg-tone-neutral-seed text-tone-neutral-01 border-tone-neutral-09">...</section>

<!-- INCORRECT: Tailwind's palette ignores Magma entirely -->
<section class="bg-white text-gray-700">...</section>
```

A role resolves per mode (light / dark), per named theme (`data-theme-name` retints the
neutral scaffolding and the accent) and per contrast preference (`pref-contrast-more`
promotes text and borders, and the page). A raw step (`tone-neutral-03`,
`status-error-05`, `variant-primary-04`) only flips with the mode: it stays grey under a
tinted theme and gains no contrast when the user asks for more.

## One token, two faces

Every role is a CSS custom property holding an RGB channel triplet, and a Tailwind color
of the same role.

```css
/* plain CSS: always inside rgb(), alpha with the slash syntax */
.panel {
  background: rgb(var(--magma-surface-raised));
  color: rgb(var(--magma-text-default));
  border: 1px solid rgb(var(--magma-border-muted));
  box-shadow: 0 2px 8px rgb(var(--magma-shadow-ink) / 0.12);
}
```

Tailwind names the TEXT roles `fg-*`, so a utility never reads `text-text-*`:
`--magma-text-muted` is `text-fg-muted`, `--magma-danger-text-default` is
`text-danger-fg-default`. Every other role keeps its name: `bg-surface-raised`,
`border-border-default`, `bg-accent-emphasis`, `bg-danger-wash-base`.

Both faces need the setup in [`assets.md`](assets.md): the values come from
`styles/dist/css/semantic.css`, the Tailwind utilities from `styles/dist/tailwind/theme.css`.
Without `semantic.css` a `var(--magma-*)` paints nothing, and a Tailwind utility paints the
light default of its role, the fallback its bridge carries so editors can show a swatch: in
dark mode, with a named theme or with more contrast it stays wrong, so the file is still
required. A Tailwind modifier works as usual (`bg-surface-raised/80`).

## The roles

### Neutral scaffolding

Backgrounds, text and borders of everything that is neither an action nor a state. A
named theme retints all of it at once.

| Token (`--magma-*`) | Tailwind | Use |
| --- | --- | --- |
| `surface-default` | `bg-surface-default` | the page canvas (the `body` already has it) |
| `surface-raised` | `bg-surface-raised` | cards (an item of a set), panels; the bars that stay put draw it themselves (`surfaces/band`) |
| `surface-overlay` | `bg-surface-overlay` | modal, dropdown, popover, sheet, and anything lifted with a shadow |
| `surface-sunken` | `bg-surface-sunken` | wells, insets, code blocks, tracks |
| `surface-muted` | `bg-surface-muted` | same-plane grouping inside a component: zebra rows; never the background of a section (`surfaces/tints-in-components`) |
| `wash-soft` / `wash-base` / `wash-strong` | `bg-wash-*` | a flat neutral pill or chip (no shadow), by how marked it is |
| `wash-selected` / `wash-soft-selected` | `bg-wash-*-selected` | the area of the neutral control of the view you are in: between `wash-base` and its hover `wash-strong`, or between no area and its hover `wash-soft` (`mds-button current`) |
| `surface-inverse` / `surface-inverse-muted` | `bg-surface-inverse*` | the chip that flips with the mode (dark on a light UI) |
| `surface-inverse-selected` | `bg-surface-inverse-selected` | the inverse fill of the control of the view you are in, between its rest and its hover |
| `on-inverse` | `text-on-inverse` | text and icons on either inverse level |
| `text-default` | `text-fg-default` | body text, titles, primary data |
| `text-muted` | `text-fg-muted` | secondary text that is still essential (an address, a phone) |
| `text-subtle` | `text-fg-subtle` | non-essential text only: captions, units, hints |
| `text-disabled` | `text-fg-disabled` | disabled labels |
| `text-on-emphasis` | `text-fg-on-emphasis` | text on a solid fill |
| `border-muted` | `border-border-muted` | decorative: dividers, table grid |
| `border-default` | `border-border-default` | functional outlines: inputs, cards |
| `border-strong` | `border-border-strong` | a border that conveys state (selected) |
| `border-focus` | `border-border-focus` | focus indication; follows the accent |
| `neutral-fg` / `neutral-border` | `text-neutral-fg` / `border-neutral-border` | neutral ink and border on a colored context |
| `shadow-ink` | `shadow-shadow-ink` | the colour of a projected shadow; compose it with your own geometry and alpha |

`--magma-on-backdrop` (in `globals.css`) is the ink on the modal scrim, fixed in both modes.

How the five surfaces stack, their values in light and dark, why a raised element needs a
shadow in light, and how themes and high contrast move them: [`theming.md`](theming.md#surfaces-and-elevation).

### Accent: actions and selection

Two accents with the same roles: `accent` (the brand action colour) and `accent-ai`
(AI-driven features). A named theme can repoint them. The interface is neutral where the
person works, so the accent stays rare: a view has one primary action in it
(`actions/primary`), and which weight every other action takes is the domain
[`actions`](patterns/actions.md). Only the band that introduces a page takes colour:
`accent-emphasis`, everything on it in `accent-on-emphasis`
([`surfaces/intro-band`](patterns/surfaces.md)).

| Token | Tailwind | Use |
| --- | --- | --- |
| `--magma-accent-emphasis` | `bg-accent-emphasis` | solid fill: the primary action, the band that introduces a page |
| `--magma-accent-emphasis-hover` / `-emphasis-active` | `hover:bg-accent-emphasis-hover` | the fill hovered / pressed |
| `--magma-accent-emphasis-selected` | `bg-accent-emphasis-selected` | the fill of the action of the view you are in (`mds-button current`), between its rest and its hover |
| `--magma-accent-on-emphasis` | `text-accent-on-emphasis` | text and icons on the fill |
| `--magma-accent-surface` | `bg-accent-surface` | tinted background: a selected row or chip |
| `--magma-accent-surface-subtle` / `-surface-hover` | `bg-accent-surface-*` | the tinted background, lighter / hovered |
| `--magma-accent-surface-selected` | `bg-accent-surface-selected` | the tinted background of the action of the view you are in (`mds-button current`): between `surface` and its hover. A status hue says it with `-wash-selected` |
| `--magma-accent-surface-subtle-selected` | `bg-accent-surface-subtle-selected` | the same for a control with no background at rest (a text button), between none and its hover `surface-subtle` |
| `--magma-accent-text-default` / `-text-muted` / `-text-subtle` | `text-accent-fg-*` | accent text on a neutral surface or on the tinted background: the label of a weak button, of a text button on hover |
| `--magma-accent-fg` | `text-accent-fg` | accent text or icon on a neutral surface: a link, the label of a text or outline button at rest. In dark it takes a step with more hue than the text ladder can, so the accent still reads as one |
| `--magma-accent-border` | `border-accent-border` | tinted border |

`accent-ai` is the same set with the infix: `--magma-accent-ai-emphasis`,
`bg-accent-ai-surface`, `text-accent-ai-fg`.

### Status: info, success, warning, danger

Each status publishes the same vocabulary. The hue is named `danger` (the palette family
is `status-error`). A named theme never retints a status.

| Token (`<hue>` = `info`, `success`, `warning`, `danger`) | Tailwind | Use |
| --- | --- | --- |
| `--magma-<hue>-wash-soft` / `-wash-base` / `-wash-strong` | `bg-<hue>-wash-*` | colored background, by how marked it is |
| `--magma-<hue>-wash-selected` / `-wash-soft-selected` | `bg-<hue>-wash-*-selected` | the colored area of the control of the view you are in, between rest and hover |
| `--magma-<hue>-text-default` / `-muted` / `-subtle` / `-disabled` | `text-<hue>-fg-*` | colored text on that wash |
| `--magma-<hue>-border-muted` / `-default` / `-strong` | `border-<hue>-border-*` | colored border |
| `--magma-<hue>-emphasis` (+ `-hover`, `-active`, `-selected`) | `bg-<hue>-emphasis*` | solid fill: a destructive button, a solid badge |
| `--magma-<hue>-on-emphasis` | `text-<hue>-on-emphasis` | text and icons on the fill |

Shortcuts at the default prominence, kept for brevity: `--magma-<hue>-surface` =
`wash-base`, `--magma-<hue>-fg` = `text-default`, `--magma-<hue>-border` =
`border-default` (Tailwind `bg-<hue>-surface`, `text-<hue>-fg`, `border-<hue>-border`).

## Pairing rules

These are the pairs the contrast gate measures in CI; any other combination is not
measured.

- **`-fg` on a neutral surface, `-on-emphasis` on the fill.** `--magma-accent-fg` is ink
  for the page; on `--magma-accent-emphasis` use `--magma-accent-on-emphasis`. Swapping
  them is the quickest way to break contrast.
- **Text on a wash is bounded.** `wash-soft` and `wash-soft-selected` carry the whole text
  ladder, `wash-base` and `wash-selected` carry `text-default` only, `wash-strong` carries
  icons only (no essential text). Same rule for the neutral band, every status and the
  tinted backgrounds of the accents. One exception: the hover of a control whose rest is
  `wash-base` (`mds-button` weak) keeps its label on `wash-strong` in `text-default`, a
  passage rather than a background to read on, held at 4.5:1 or more. Never place text on
  `wash-strong` at rest.
- **Hierarchy without dropping contrast.** `text-muted` is for essential secondary text,
  `text-subtle` only for what the user can skip. For more hierarchy use weight, size and
  spacing, and soften the chrome (`border-muted`, zebra on `surface-muted`) instead of the
  text.
- **Elevation is a role.** Page `surface-default`, card
  `surface-raised`, floating layer `surface-overlay`, well `surface-sunken`: choose by
  what the element is, not by the shade you want, and give `raised` / `overlay` a shadow
  ([`theming.md`](theming.md#surfaces-and-elevation)). A grey that has to look marked in
  both modes (a pill, a chip, a hover) is a wash, not a surface.
- **The roles already flip: `dark:` never corrects them.** Keep `dark:` for a deliberate
  choice that differs per mode (a well that sits on the page in light and rises to
  `surface-raised` in dark). It follows the Magma mode, `system` included
  ([`theming.md`](theming.md#dark-mode-and-preferences)), in the light DOM only. Never
  write a dark-mode media query by hand.

## When a raw palette colour is right

Only when the colour encodes data rather than an interface role:

- `label-*` (`bg-label-sky-09`, `rgb(var(--label-orchid-04))`): a category, a tag, a
  colour the user picked;
- `brand-*`: Maggioli brand identity;
- `--tone-neutral-seed` (`#fff` in light, `#000` in dark): the rare pure extreme, a
  knockout; not a page or card background.

Never use `--magma-tint-*`: it is the internal pointer a named theme repoints, not a role.
`tone-bisque` backs the named theme `editorial` (and `tone-porcelain` the deprecated `cool`):
switch it on with `data-theme-name` ([`theming.md`](theming.md)), do not paint it by hand.
`variant-*` has no role of its own: the accents are `accent` and `accent-ai`.

Deprecated: `--magma-neutral-emphasis` / `--magma-neutral-on-emphasis` are aliases of
`--magma-surface-inverse` / `--magma-on-inverse`.

## Outside the web

The roles (`--magma-*`), the utilities and the components are web only. An Android, iOS or
Flutter app takes its colours from `@maggioli-design-system/design-tokens`, as files to copy
into the app: `dist/android/colors.xml`, one of `dist/ios-swift/*.swift`,
`dist/flutter/colors.dart`. They hold the palettes and the surface, border and text colours
of each family, both modes side by side (`color_surface_neutral_light_default`,
`..._dark_...`), and nothing else: no type, spacing or motion tokens, no theme or contrast
switch. Paint with the family of the default theme, `neutral` (`surface_neutral_*`,
`border_neutral_*`, `text_neutral_*`), switch the mode in the app, and take any other role
from the step it points at. The names per platform, the mode switch and the outputs that do
not compile (`dist/ios/`, `dist/flutter/fonts.dart`) are in
`node_modules/@maggioli-design-system/design-tokens/README.md`, "Native platforms".

## Migrating Magma 1 colour classes

Magma 1 code paints raw steps, often with a hand-tuned `dark:` override. Each of these steps
has the role that took its place; switch to the role and delete the `dark:` override. The role
has the light value of the step, but for the washes, placed at a distance from the page since
Magma 2 (close to the step in light, lighter and less saturated in dark):

| Magma 1 step | As | Role |
| --- | --- | --- |
| `tone-neutral-01` / `-03` / `-04` / `-05` | text | `fg-default` / `fg-muted` / `fg-subtle` / `fg-disabled` |
| `tone-neutral-10` / `-09` / `-08` | background | `wash-soft` / `wash-base` / `wash-strong` |
| `tone-neutral-02` / `-03` | background | `surface-inverse` / `surface-inverse-muted` |
| `tone-neutral-06` | border | `neutral-border` |
| `tone-neutral` (the bare seed) | background | by context: `surface-default`, `-raised` or `-overlay` |
| `status-<x>-01` / `-02` / `-03` / `-05` | text | `<hue>-fg-default` / `-muted` / `-subtle` / `-disabled` |
| `status-<x>-04` / `-03` / `-02` | background | `<hue>-emphasis` / `-emphasis-hover` / `-emphasis-active` |
| `status-<x>-10` / `-09` / `-08` | background | `<hue>-wash-soft` / `-wash-base` / `-wash-strong` |
| `variant-primary-04` / `-03` / `-02` | background | `accent-emphasis` / `-emphasis-hover` / `-emphasis-active` |
| `variant-primary-09` / `-08` / `-10` | background | `accent-surface` / `-surface-hover` / `-surface-subtle` |
| `variant-primary-03` / `-06` | text / border | `accent-fg` / `accent-border` |

`variant-ai-*` maps the same way onto `accent-ai-*`. The codemod
(`@maggioli-design-system/magma-codemods`, `--accept-semantic=exact`) applies this table
to markup, `clsx()`, Angular bindings and `@apply`, and reports what a value cannot
decide.
