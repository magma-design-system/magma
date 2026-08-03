# @maggioli-design-system/design-tokens

Generates design tokens for colors and other type of agnostic tokens targeted on specific plaforms, like web, Dart, Android or iOS formats.

This library is based on [Adobe Leonardo][adobe-leonardo] and [Amazon Style Dictionary][style-dictionary].

# Compatibility

Use the version of this package matching the major version of [`@maggioli-design-system/magma`](https://www.npmjs.com/package/@maggioli-design-system/magma) you are using:

| magma | design-tokens | styles |
| :--- | :--- | :--- |
| `1.x` (before Magma 2) | `13.x` (latest `13.7.2`) | `15.x` (latest `15.11.1`) |
| `2.x` and later | `>= 14` | `>= 16` |

# Installation

Install the component via `npm` by running the following command:

```bash
npm i @maggioli-design-system/design-tokens
```

This package works also with yarn:

```bash
yarn add @maggioli-design-system/design-tokens
```

# Generate Custom Palette

you can generate custom palettes via cli command, it takes a configuration file to create palettes

## Usage

```bash
npx magma-design-tokens
```

## Options

| Option                       | Alias | Description                                                                     |
| :--------------------------- | :---- | :------------------------------------------------------------------------------ |
| `--config [configFile]`      | `-c`  | Path to configuration file if not respect default naming                        |
| `--outDir [dirPath]`         | `-d`  | Path destination for generated palettes                                         |
| `--generate [platform]`      | `-g`  | Output format for palette, choose one or more between `css`, `tailwind`, `dart` |
| `--export-tokens`            | `-t`  | export palette as JSON design tokens format                                     |
| `--outTokensDir [tokensDir]` |       | Directory path for JSON tokens, required if `--export-tokens` is presents       |
| `--port [port]`              | `-p`  | Port for the `ui` command playground server (default `5178`)                    |

## Configuration file

You can include configuration in a configuration file or a field in `package.json` named `magma-design-tokens`

### Naming convention

Naming standard for configuration file:

- `.magma-design-tokensrc.json`
- `.magma-design-tokensrc.js`
- `.magma-design-tokensrc.cjs`
- `.magma-design-tokensrc.mjs`
- `.config/magma-design-tokensrc`
- `.config/magma-design-tokensrc.json`
- `.config/magma-design-tokensrc.js`
- `.config/magma-design-tokensrc.cjs`
- `.config/magma-design-tokensrc.mjs`
- `magma-design-tokens.config.js`
- `magma-design-tokens.config.cjs`
- .`magma-design-tokens.config.mjs`

If you change configuration file name you need to set with `--config` option

### Editor autocomplete and validation

The package ships a JSON Schema for the configuration at `dist/config/magma-design-tokensrc.schema.json`. Point your config at it with a `$schema` key to get autocomplete and inline validation in editors like VS Code:

```json
{
  "$schema": "./node_modules/@maggioli-design-system/design-tokens/dist/config/magma-design-tokensrc.schema.json",
  "colors": [{ "color": "#94a3b8", "name": "tone.porcelain" }]
}
```

The same schema is the single source of truth for runtime validation: the `ui` command rejects an invalid `PUT /api/config`, and the playground refuses to load a config that does not match it.

### Configuration

Basic config

```json
{
  "colors": [
    { "color": "#94a3b8", "name": "tone.porcelain" },
    { "color": "#EA3464", "name": "label.amaranth" }
  ]
}
```

You can export different color in different output file defining export field

```json
{
  "colors": [
    { "color": "#94a3b8", "name": "tone.porcelain", "export": ["tones"] },
    { "color": "#EA3464", "name": "label.amaranth", "export": ["label"] }
  ]
}
```

You can choose the ratio with which to generate the color scale with `ratios` field

```json
{
  "colors": [
    { "color": "#94a3b8", "name": "tone.porcelain", "ratios": "tone" },
    { "color": "#EA3464", "name": "label.amaranth", "ratios": "v1" }
  ]
}
```

NOTE: there are four different ratios as follow value contrast

```json
{
  "v1": [
      1.05, 1.1, 1.17, 1.24, 1.32, 1.41, 1.51, 1.65, 1.9, 2.25, 2.7, 3.3,
      4, 4.8, 5.75, 7, 8.5, 10.3, 12.45, 15
    ],
  "v2": [1.09, 1.22, 1.42, 1.82, 2.57, 3.71, 5.13, 6.71, 8.75, 10.29],
  "default": [1.09, 1.22, 1.42, 1.82, 3.29, 5.13, 6.71, 8.45, 10.29, 17.22],
  "tone": [1.05, 1.1, 1.24, 1.47, 2.54, 4.83, 7.56, 10.31, 14.68, 16]
}
```

### How generation works

For every entry in `colors`, [Adobe Leonardo](https://leonardocolor.io/) builds a full lightness scale from the base `color` (interpolating from black to white through it in the chosen `colorspace`) and then picks one swatch per target contrast ratio, measured against the theme background: white for the light theme, black for the dark theme. The steps of a palette are therefore defined by their contrast, not by fixed lightness values: step `1` is always the highest-contrast step (the darkest in light mode, the lightest in dark mode) and the last step is the closest to the background.

Each color produces this token structure (here with the 10-step `default` scale):

```
color.<group>.<name>.light.1 .. 10   contrast-picked values against white
color.<group>.<name>.dark.1  .. 10   contrast-picked values against black
color.<group>.<name>.light.color     the base color itself (or seed.light)
color.<group>.<name>.dark.color      the base color itself (or seed.dark)
```

### Configuration reference

Root fields:

| Field        | Type                     | Default  | Description                                                                                              |
| :----------- | :----------------------- | :------- | :-------------------------------------------------------------------------------------------------------- |
| `colors`     | `ColorConfig[]`          | required | The palette definitions, one per generated color scale                                                    |
| `colorspace` | `string`                 | `"HSL"`  | Interpolation colorspace used by Leonardo to build the scales (`HSL`, `OKLCH`, `LCH`, `CAM02`, ...)        |
| `smooth`     | `boolean`                | `false`  | Applies bezier smoothing to the scale interpolation                                                       |
| `formula`    | `"wcag2"` \| `"wcag3"`   | `"wcag3"` | Contrast formula used to pick the steps: WCAG 2.x contrast ratios or WCAG 3 (APCA) Lc values             |
| `ratios`     | `object`                 | built-in | Named ratio scales per formula; merged over the built-in ones shown above                                 |
| `groups`     | `object`                 | none     | Per-group defaults for `ratios` and `formula`, keyed by token group (see below)                            |
| `hueShift`   | `object`                 | none     | Default hue shifting applied to all colors (see the Hue shifting section)                                 |

Fields of each entry in `colors` (per-color values override the root defaults):

| Field        | Type              | Default        | Description                                                                                                    |
| :----------- | :---------------- | :------------- | :--------------------------------------------------------------------------------------------------------------- |
| `color`      | `#RRGGBB`         | required       | Base (key) color the scale is generated from                                                                     |
| `name`       | `string`          | required       | Dot-separated token path in the form `<group>.<name>`, e.g. `tone.neutral` or `brand.maggioli`                   |
| `export`     | `string[]`        | none           | Output groups this color belongs to; each group becomes a separate file (e.g. `tones`, `status`, `default`)      |
| `ratios`     | `string`          | `"default"`    | Name of the ratio scale to use, resolved against the `ratios` of the active `formula`                            |
| `formula`    | `string`          | root `formula` | Contrast formula for this color only                                                                             |
| `colorspace` | `string`          | root value     | Interpolation colorspace for this color only                                                                     |
| `smooth`     | `boolean`         | root value     | Bezier smoothing for this color only                                                                             |
| `seed`       | `object`          | none           | `{ "light": "#RRGGBB", "dark": "#RRGGBB" }`: overrides the value of the extra `color` token per theme mode. Used by tones to expose the pure surface color (white in light mode, black in dark mode) |
| `hueShift`   | `object`          | root value     | Hue shifting for this color only; set angles to `0` to opt a color out of a root-level default                   |
| `disabled`   | `boolean`         | `false`        | Skips the color entirely: no tokens are generated for it                                                          |
| `title`      | `string`          | none           | Reserved for exporters; not used by the generator                                                                 |
| `alias`      | `string`          | none           | Reserved for exporters; not used by the generator                                                                 |

Ratios, formula and export targets can also be set once per token group instead of repeating them on every color:

```json
{
  "groups": {
    "tone": { "ratios": "tone", "export": ["tones", "default"] },
    "brand": { "formula": "wcag3" }
  },
  "colors": [
    { "color": "#94a3b8", "name": "tone.porcelain" },
    { "color": "#9ca3af", "name": "tone.kaolin" }
  ]
}
```

The resolution order is: the color's own field, then its group entry, then the root default. A per-color `export` (like `ratios` and `formula`) replaces the group's value entirely, it is not merged. This makes master-palette / sub-palette setups easy: give a whole group a default export and override only the colors that differ.

Notes:

- Root options and each color are merged with the built-in defaults, so you only declare what differs.
- The `formula` decides how the numbers in the ratio scales are interpreted: as WCAG 2.x contrast ratios (`1.05`-`21`) or as WCAG 3 APCA Lc values (`0`-`106`). Do not mix scales across formulas: a `wcag3` color must reference a ratio scale defined under `wcag3`.
- Every step keeps its target contrast against the theme background by construction, whatever `colorspace`, `smooth` or `hueShift` you set.

### Hue shifting

You can rotate the hue of the darkest and lightest steps of a scale with the `hueShift` field, producing richer palettes in the classic hue shifting style (shadows toward one hue, highlights toward another). The shift is applied to the seed color before scale generation, one Leonardo scale per distinct angle, so every step is still contrast-solved on its own scale and the target ratios are preserved by construction.

```json
{
  "colors": [
    {
      "color": "#0da2e7",
      "name": "brand.blue",
      "hueShift": { "dark": -18, "light": 10, "curve": "smooth" }
    }
  ]
}
```

- `dark` and `light` are rotations in OKLCH degrees (range -180 to 180) applied at full intensity to the physically darkest and lightest steps of the scale, in both light and dark theme mode. Small angles (10-45) refine the shades in the classic hue shifting style; large ones deliberately bend the ends of the scale toward another color family.
- `curve` controls the intensity of the shift across the scale. Each step gets a weight from 0 (no shift) to 100 (full angle). It accepts:
  - a preset: `"smooth"` (default, the shift fades in linearly outside the central third of the scale) or `"hard"` (full shift outside the central third);
  - parameters: `{ "deadZone": 0.5, "easing": "linear" }` where `deadZone` is the fraction of the center-to-edge distance left untouched and `easing` is `"linear"` or `"step"`;
  - an explicit array of weights, resampled to the scale length when needed, for example `[100, 66, 33, 0, 0, 0, 0, 33, 66, 100]`.

With 10 steps the presets resolve to:

```
smooth: [100, 67, 33, 0, 0, 0, 0, 33, 67, 100]
hard:   [100, 100, 100, 0, 0, 0, 0, 100, 100, 100]
```

`hueShift` can also be set at the root of the configuration as a default for all colors; a per-color `hueShift` overrides it. Colors without `hueShift` are generated exactly as before.

### Figma export (DTCG)

The build emits the color palette in the [W3C DTCG](https://tr.designtokens.org/format/) standard format (`$type` / `$value` / `$description`), ready to import as Figma Variables. Since DTCG has no concept of modes, light and dark are written as separate files under `dist/json/`:

```
figma-magma-colors-light.tokens.json
figma-magma-colors-dark.tokens.json
```

In Figma, create a variable collection and import each file into its own mode (Light / Dark). Steps keep their numeric keys (`1`..`10`) and the base color is exposed as `seed`. The playground offers the same pair as a zip via **download > Figma tokens (DTCG)**, generated in the browser from the same mapping so it matches the build output.

The non-color sizing/number tokens are still exported in the legacy Figma "Import/Export Variables" plugin format (`dist/json/figma-magma-tokens.json`); moving them to DTCG is tracked separately.

### Playground

A local UI to explore and tune the configuration with live palette previews:

```bash
nx run design-tokens:playground
# or, without nx:
yarn --cwd projects/design-tokens playground
```

It opens a Vite dev server (port 5177) that loads `.magma-design-tokensrc.json` and runs the real token generator in the browser, so every preview matches the build output exactly. The UI has four views: **colors** (the two-column editor: color list on the left, editing and live light/dark scale previews with achieved contrast on the right; `neutral` is selected by default when present), **contrast scales**, **groups** and **diff**. Selecting a color from the sidebar while in contrast scales keeps you there, since the scale samples follow the selected color.

The **diff** view compares the current palette against the one generated from the committed configuration (the bundled `.magma-design-tokensrc.json`): it lists the colors whose steps changed - outlining each changed step and badging the color with the largest perceptual distance (deltaE) - plus any colors added or removed. The generated token files under `tokens/color/generated/` are build artifacts and not committed, so the committed config is the baseline.

The playground works with any configuration, not just the repo one: **load config** opens a `.magma-design-tokensrc.json` from disk and **copy JSON** copies the edited configuration to the clipboard. The **download** menu offers:

- **All tokens (zip)** — the configuration, the generated JSON tokens (whole palette + one file per export group) and the CSS and GIMP renders, mirroring the `dist` layout;
- **Figma tokens (DTCG)** — the color palette in the W3C DTCG format, one file per theme mode, zipped together (see [Figma export](#figma-export-dtcg));
- **Config (json)** — just the `.magma-design-tokensrc.json`;
- **CSS tokens** — `colors-hex.css` / `colors-rgb.css` for the whole palette plus one pair per export group;
- **GIMP palette** — `colors.gpl` for the whole palette plus one `.gpl` per export group.

CSS and GIMP respect export diversification: they emit the whole palette and one file per export group. When that yields more than one file the download is a zip (`magma-css.zip`, `magma-gimp.zip`); a single file downloads directly. The outputs are produced in the browser from the same Handlebars templates the build uses, so they match the CLI output. Editing is in-memory only: nothing touches the repo files.

New colors are created from a dialog: pick the value and the name auto-completes underneath from the "Name That Color" vocabulary (via [color-namer](https://github.com/colorjs/color-namer), ~1500 names, kebab-cased: e.g. `persian-green`); choose the token group, confirm, and the playground lands on the new color already selected. Names are made unique with a numeric suffix when needed. Auto-naming keeps following the picker in the editor too, but only for names assigned by the playground itself: a name typed by the user, or any name coming from a loaded configuration, is never touched. Picking a value already used by another color raises a warning.

The **groups** view manages `ratios`, `formula` and `export` per token group (writing the `groups` section of the configuration), with a compact preview of every member color; colors overriding the group individually are flagged. The per-color fields in the editor default to inheriting from the group.

A *group selected* toggle lifts the ticked colors into a dedicated **Selected** section at the top, lining their scales up next to each other for quick comparison; the rest stay in their group cards below. Nothing is hidden, only reorganized.

It also supports batch export editing across groups: tick colors (or pick an existing export from *select by export* to load every color that uses it) and open **batch export**. The dialog previews the picked colors, lets you untick any to drop them, and then either saves an export value onto the selection or downloads a zip of just that selection's tokens.

The **contrast scales** view manages the ratio scales of the configuration: add, duplicate, rename or delete custom scales (the built-in ones, `default` first of all, are always available) and inspect the distribution of the stops on a horizontal axis. A usage panel at the top picks a scale and lists every color resolving to it, ordered by group; clicking a color makes it the sample for all the scale previews. Each scale has a distribution mode: pick an easing (`linear`, `ease-in`, `ease-out`, `ease-in-out`) and the stops regenerate live from steps/min/max, or go `manual` by dragging a marker or editing a stop directly. Scale values are contrast against the theme background (0 = on the background, max = strongest contrast), so the same scale yields dark-on-light in light mode and light-on-dark in dark mode. Every color picks its scale with the `ratios` field in the editor.

### UI command

The `ui` command serves the built playground from the published package and wires it to the local configuration on disk, so editing and persisting no longer needs a checkout of this repo:

```sh
npx magma-design-tokens ui
# custom port and configuration path
npx magma-design-tokens ui --port 4000 --config ./tokens/color.json
```

It starts a small server (default port `5178`) that both serves the playground and exposes a local API:

- `GET /api/config` reads the configuration via the same lookup as the CLI (respecting `--config`);
- `PUT /api/config` writes it back with a stable key order, ASCII-only output and a trailing newline, so saves produce clean git diffs;
- `POST /api/build` runs the full token generation on disk, honouring the `--outDir` / `--generate` / `--export-tokens` flags passed to `ui`.

In this mode the playground loads the on-disk configuration on start and swaps **copy JSON** for a **save** button that persists to the resolved file; a `*` marks unsaved changes. The **download** menu gains **Build tokens on disk** to trigger the build endpoint. Run standalone (`nx run design-tokens:playground` or `yarn --cwd projects/design-tokens playground`) the API is absent and the playground keeps its in-memory, copy/download-only behaviour.

### Cli example

- takes `./color.js` as configuration file
```bash
npx design-tokens --config ./color.js
```

- export palette only on css format
```bash
npx design-tokens --generate css
```

- export palette on css and tailwind format
```bash
npx design-tokens --generate 'css, tailwind'
```



[adobe-leonardo]: https://leonardocolor.io/
[style-dictionary]: https://amzn.github.io/style-dictionary/
