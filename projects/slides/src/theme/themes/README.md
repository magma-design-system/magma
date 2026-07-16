# Themes

One folder per theme, holding everything that theme owns. The default theme is
**`maggioli`**.

```
themes/
  <name>/
    theme.css        # brand refinements over the shared --mds-slide-* tokens
    logo.svg         # optional: default footer logo for this theme
  maggioli/
    theme.css
```

Shared, theme-agnostic CSS lives one level up (`../tokens.css`,
`../slides.src.css`, `../deck-view.css`).

## How it resolves

- A deck picks a theme with frontmatter `theme: <name>` (default `maggioli`).
- Append `-dark` to force the dark scheme, e.g. `maggioli-dark`. The base name
  (`maggioli`) selects the folder; the suffix only flips light/dark. Any
  `<name>-dark` works - the scheme handling is generic (`isDarkTheme`).
- `theme.css` is inlined on export; `logo.*` is resolved from the package and
  embedded as a `data:` URI, so decks stay self-contained. A per-deck
  `footer.logo` overrides the theme default. Logo lookup order: `svg`, `png`,
  `webp`, `jpg`.
- `copy-assets` ships this whole folder to `dist/theme/themes`.

## Add a theme

1. Create `themes/<name>/theme.css` (start from `maggioli/theme.css`). Override
   `--mds-slide-*` tokens and add brand refinements; do not restyle layouts.
2. Optional: drop `themes/<name>/logo.svg` for the default footer logo.
3. Add `"<name>"` and `"<name>-dark"` to the `theme` enum in
   `../../schema/deck.schema.json` so decks validate.
4. Keep images small: they are base64-inlined into every exported deck.
