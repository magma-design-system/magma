# Themes

Stage 3: the tint, the accents and the modes of a theme, judged on the scene of a product.

Addresses: `#/themes`, the base theme at the centre, and `#/themes/<name>`, the theme of that name
(alias `#/colors/themes`, the Themes page of the Colors section it was).

**Themes** (`src/features/themes/`; the Themes page of the Colors section until #1404) holds a
theme at the centre, the one the address names, else the base (object model, section 5, "3.
Temi"). The list beside holds the themes of the preset (`themeRows` of
`src/engine/theme-list.ts`) in two groups: **Ready themes**, the base theme, `business`, and the
ready themes Magma ships, `editorial`; then **Themes of the product**. Each is a link with its
swatch, the colour of its tint, and the verdict of the contrast gate per mode, the one at the
centre marked; a theme whose name cannot be used says it is not painted until it has one.
**New theme**, the main action of the list, leads to the [opening](opening.md): a new theme is
born there, from a ready theme or a brand colour. The list stands beside the page as in Colours
(`--container-list-beside`); narrower, it goes above the page, folded into a bar with the theme at
the centre (#1311).

The theme at the centre: its name, a badge of what it is (base or ready), and the menu of its
actions, **Delete theme**, for every theme but the base, which is `:root`: its family stops
generating surfaces and stays in the palette, undone from a toast (`deleteTheme` of
`src/state/themes.ts`). Under the name a line of what the theme is, the base on `:root`, a ready
theme or a theme of the product, with the `data-theme-name` a page wears it with; its verdict per
mode; and its pairs in a closed detail, as in Colours, the pairs of the whole theme
(`TouchedPairs` with `whole`, `cellsOfTheme` of `src/engine/touched.ts`).

Then its fields, each family named with its swatch and a link to Colours, which selects it there:

- **Name**, for a theme of the product. Each theme is named apart from the family it is drawn
  from: `editorial` is drawn from `bisque`. The names of the themes Magma ships
  (`semantic.config.ts`, `themes`) are reserved, the deprecated ones included, so a theme of a
  product never takes one, and a name is lowercase words joined by hyphens (`THEME_NAME` of
  `semantic.model.ts`). A theme whose name cannot be used is listed with why, and is neither
  painted nor judged until it is renamed.
- **Tint**, for a theme of the product: a select of the families it may be drawn from, in the
  chromatic order of Colours (`tintChoices` of `src/engine/theme-list.ts`). Choosing one moves the
  theme to that family (`moveTheme` of `src/state/themes.ts`): the family it was drawn from stops
  generating surfaces, the new one starts, and its name, accents and modes go with it, undone from
  a toast (chosen on its renders, vittorio, 2026-11-27). The base and the ready themes say why
  theirs is fixed: the tint of the base is the neutral family of Magma, the tint of a ready theme
  comes with its file, to open in the opening to make a theme of one's own.
- **Accent** and **AI accent**: a select of the variants the role may point at, the one of the
  base marked, and the sample of the accent on the theme in light and in dark (`accentSample`):
  its solid fill with its ink and their APCA Lc, its soft wash with its ink.
- **Modes**: the colour modes the theme can be used in, the `color.modes` of a theme file (#1274):
  light and dark, the default, light only or dark only.

A theme can be drawn from a family of any group, one created in the studio included, except
`status` (`RESERVED_GROUPS` of `src/engine/groups.ts`): its families always generate surfaces, so
that banners, toasts and badges get a text role legible on their own tint, but a theme in a status
colour would mix with the messages that colour carries; the switch Generate surfaces of a status
colour (Colours) and of its group (Groups) is on and locked, and says so. A reference follows the
ramp of another family and the variants are references (`NO_SURFACE_GROUPS`), so neither is a
tint; nor is a family that backs another theme already.

Beside, the scene of the product in the theme (`ThemeScene` of `src/shared/ui/theme-scene.tsx`,
the scene of the [Theme section](theme-section.md) in a frame), with the tabs **Light** and
**Dark**, a mode the theme does not offer off and saying why, and the switch **More contrast**:
the conditions it is judged under (object model, section 4, "Prove"). From 60rem of the view it
stands beside the fields (`--container-side`); narrower, it is not drawn, as in Weights. The links
Test in light and
Test in dark to the Theme section went with the Themes page: the scene is beside (vittorio,
2026-11-27).

The other themes speak only when one breaks: the toast of the shell ([The shell](shell.md)), none
for the theme at the centre, whose verdict is in view. The canvas of the surfaces the Themes page
drew each theme on went with it (vittorio, 2026-11-27, on the renders): Weights keeps the purposes
of the roles (`src/shared/ui/role-purposes.ts`). The CSS of the themes is no block of the view but
a download of the menu of the exit, **Download the CSS of the themes**
([The preset in and out](preset.md)). Built as Magma says today, record-detail with the list
beside, as Colours, until list and detail (#1262) lands.
