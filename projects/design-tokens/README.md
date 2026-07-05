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

- `dark` and `light` are rotations in OKLCH degrees (range -60 to 60) applied at full intensity to the physically darkest and lightest steps of the scale, in both light and dark theme mode.
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
