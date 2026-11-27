# The preset in and out

How a preset comes into the studio and goes out of it: the opening brings one in, the exit of the
bar takes it out, from any page; the draft keeps the work over a reload.

Addresses: none of their own. The opening is `#/opening`; the exit and its menu stand in the bar of
every page ([The shell](shell.md)), the [full review](full-review.md) included.

The studio works with any configuration, not just the repo one. The opening brings one in
(**Import a preset**, a `.magma-design-tokensrc.json` from disk; an error shows on the opening),
and the exit of the bar takes it out, from any page, with its families in their order: the split
button saves or downloads the preset, and its menu holds the other formats, the badge of each
naming it:

- **Copy JSON** - copies the edited configuration to the clipboard (the menu stays open to say
  Copied!);
- **Download all tokens** (misc) - the configuration, the generated JSON tokens (whole palette +
  one file per export group) and the CSS and GIMP renders, mirroring the `dist` layout of
  `design-tokens`;
- **Download the preset** (json) - just the `.magma-design-tokensrc.json`, in the menu when the
  split button saves;
- **Download Figma tokens** (DTCG) - the color palette in the W3C DTCG format, one file per theme
  mode, zipped together (the "Figma export" of the `design-tokens` README);
- **Download CSS tokens** (css) - `colors-hex.css` / `colors-rgb.css` for the whole palette plus
  one pair per export group;
- **Download GIMP palette** (gpl) - `colors.gpl` for the whole palette plus one `.gpl` per export
  group;
- **Download the CSS of the themes** (css) - `themes.css`, the themes as a theme file of styles
  takes them (#1404, `themesCssOf` of `src/engine/theme-list.ts`; Copy CSS of the Themes page
  until then).

CSS and GIMP respect export diversification: they emit the whole palette and one file per export
group. When that yields more than one file the download is a zip (`magma-css.zip`,
`magma-gimp.zip`); a single file downloads directly. The outputs are produced in the browser from
the same Handlebars templates the build uses, so they match the CLI output. Editing is in-memory
only: nothing touches the repo files.

The CSS of the themes holds the accents the base theme repoints, in `:root`, then the
`data-theme-name` block of every other theme, under its name, drawn from its family, with its
reassigned accents and its own contrast blocks, printed by `namedThemeCss` of
`design-tokens/semantic.model.ts`, the function that writes `themes.css`: the block of
`editorial` is the one `themes.css` ships. A theme of one mode
declares it first in its block (`--magma-color-modes`, read by `mds-pref-theme`); the base theme
declares it under its own name too, since a lock in `:root` would reach every theme
(`themesExportCss` of `src/engine/themes.ts`, which the frames of the studio paint too).

A reload keeps the work: the studio mirrors it to the browser's localStorage as a draft, stamped
with the configuration it was made on (the bundled one, or the file a server serves). When that
configuration changed after the draft was saved (edited, removed, or another file), a draft with
no edits of its own gives way to it, and a draft with edits shows why over every page and asks:
**Use the file on disk** (or **Use the bundled config**) or **Keep the draft**. The exit stays
off until you pick, so the draft cannot overwrite the newer file by mistake.

Served by a command that answers `GET` / `PUT /api/config` and `POST /api/build` (the `ui` command
of `design-tokens` did it until version 16; the command of the studio comes with #695), the
studio loads the configuration on disk, the exit of the bar saves it there and its menu adds
**Build tokens on disk**. Run on its own, the API is absent and editing stays in memory.

While the contrast gate fails, every way out asks first: [The contrast gate](../README.md#the-contrast-gate).
