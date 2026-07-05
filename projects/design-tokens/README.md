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
