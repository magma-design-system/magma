# Themes

One folder per theme, holding everything that theme owns. The default theme is
**`business`**, paired with Magma's default theme.

```
themes/
  <name>/
    theme.json       # chrome placement: header/footer slots, per-layout defaults
    theme.css        # brand refinements over the shared --mds-slide-* tokens
    logo.svg         # optional: default chrome logo (declared in theme.json)
  business/
    theme.json
    theme.css
```

Shared, theme-agnostic CSS lives one level up (`../tokens.css`,
`../slides.src.css`, `../deck-view.css`).

## What a theme owns (and what it does not)

A slide theme is named after the Magma theme it pairs with: the renderer sets
`data-theme-name="<name>"` on the root, so the colors come from Magma
(`styles/dist/css/themes.css`), not from this folder. The scheme is a separate
deck field (`scheme: light | dark`), so every theme renders in both.

What stays here is what Magma does not own:

- **Placement** (`theme.json`) - which element sits in which slot of the
  `header` and `footer` zones, and which layouts hide a zone by default. Decks
  only supply content, so placement is the theme's alone.
- **Brand refinements** (`theme.css`) - override `--mds-slide-*` tokens; do not
  restyle layouts and do not read `--tone-*` / `--variant-*` primitives (a test
  enforces it).
- **Default logo** - `"logo": "logo.svg"` in `theme.json`, relative to the
  folder; a deck `logo` wins.

## theme.json

```json
{
  "logo": "logo.svg",
  "header": { "start": ["logo"], "end": [["subject", "section"]] },
  "footer": { "start": [["group", "groupDetail"]], "end": ["page"] },
  "layouts": { "section": { "header": false, "footer": false } }
}
```

Elements: `logo`, `group`, `groupDetail`, `subject`, `section`, `page`. A nested
list stacks elements vertically. A zone the theme leaves out never renders.

## Add a theme

1. Make sure Magma ships a theme with the same name (or the deck falls back to
   Magma's default colors).
2. Create `themes/<name>/theme.json` and `theme.css` (start from `business/`).
3. Add `"<name>"` to the `theme` enum in `../../schema/deck.schema.json`; a test
   fails when the enum and the folders disagree.
4. Keep images small: they are base64-inlined into every exported deck.

`copy-assets` ships this whole folder to `dist/theme/themes`.
