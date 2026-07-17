# design-tokens SPEC.md

## Purpose

Generates and distributes design tokens for all Magma platforms. It is the single source of truth for color, typography, spacing, border and animation values across the design system.

## Token categories

| Category  | Prefix        | Description                                                          |
| --------- | ------------- | -------------------------------------------------------------------- |
| `tone`    | `--tone-*`    | Neutral grays (slate, grey, neutral, zinc, stone)                    |
| `status`  | `--status-*`  | Semantic feedback colors (info, success, warning, error)             |
| `label`   | `--label-*`   | Accent colors for tagging and categorisation (red, sky, green, etc.) |
| `variant` | `--variant-*` | Brand interaction colors (primary, secondary, ai)                    |
| `brand`   | `--brand-*`   | Product brand colors (maggioli, maggioli-editore, rnd)               |
| `surface` | `--surface-*` | Neutral backgrounds by elevation/prominence (lightness engine)       |
| `border`  | `--border-*`  | Neutral border levels by prominence (lightness engine)               |

## Token levels

Tokens are structured in three levels. Always use the highest applicable level - never reference a primitive token directly in application code.

```
primitive   →  raw generated value      (e.g. --tone-neutral-05: 120 120 120)
semantic    →  role-based alias         (not yet formalised as separate file - use component-level tokens)
component   →  component-scoped var     (e.g. --mds-button-background)
```

## Color format: always RGB

All color tokens are distributed in **RGB channel format** (not hex). This is intentional: it enables Tailwind and plain CSS to compose opacity modifiers without a separate variable.

```css
/* correct */
color: rgb(var(--tone-neutral-03));
background: rgb(var(--tone-neutral-03) / 0.5);

/* incorrect - hex vars cannot use opacity modifiers */
color: var(--tone-neutral-03-hex);
```

## Scale convention

Each color has a numeric scale from `01` (darker) to a maximum of `10` (lighter). Older palettes had 20 values but that is no longer the case.
For `tone` palettes, the midpoint is the base color; higher numbers are darker in light mode and lighter in dark mode. Dark mode inversion is automatic via the palette's CSS custom property definitions.

Only for `--tone-*` based colors, if you want a pure white color, use `--tone-neutral` instead of `--tone-neutral-10`. When in dark mode, `--tone-neutral` will be black instead of white.

```css
--tone-neutral       /* base surface color (white or dark depending on the theme) */
--tone-neutral-01    /* darker */
--tone-neutral-03    /* default text color on neutral surface */
--tone-neutral-05    /* strong text / focus ring */
```

## Surface and border tokens (lightness engine)

Owns the generative half of the semantic color system (see
`projects/styles/SEMANTIC_COLOR_SPEC.md`, sections 4.3 and 5, for the full
rationale). Unlike `tone`/`status`/`label` - which are contrast-solved by
Leonardo (APCA) - surfaces and borders are placed by a DIRECT perceptual
lightness in OKLCH, per mode and per role:

```
surface(family, mode, role) = oklch( L[mode][role], C_family * taper(L), H_family )
```

APCA is the right tool for foreground (high contrast, cross-mode parity) and the
wrong tool for near-background colors, where it clamps low contrast and collapses
the usable band - the mechanism behind the "too black" dark mode (dark had
nothing between `#000` and `#3c3c3c`). Lightness placement gives a controlled
elevation ladder with a fixed perceptual step between roles in both modes, and
the dark base is lifted off pure black (`default` ~= OKLCH 20% L = `#161616`).

The engine (`src/lib/surface.mts`) uses `chroma-js` directly, bypassing
Leonardo's `searchColors`. Chroma and hue come from the family key color
(neutral ~= 0 chroma = grayscale; porcelain/bisque carry a cool/warm tint);
`taper(L)` reduces chroma near the extremes so near-white/near-black surfaces do
not carry an unnatural cast (ininfluent for neutral). Output is deterministic.

### Opting in

A family opts in with the `surface` flag; the shared ramp lives in a global
`theme` block (surfaces and borders together, so they are tuned in relation):

```jsonc
// per color: opt in; the tint comes from the existing `color`
{ "color": "#a3a3a3", "name": "tone.neutral", "seed": { ... }, "surface": true }

// global ramp (OKLCH); levels accept "96%", "96", or 0.96
"theme": {
  "colorspace": "OKLCH",
  "surfaces": {
    "light": { "sunken": "92%", "muted": "94%", "default": "96%", "raised": "99%", "overlay": "99%" },
    "dark":  { "sunken": "15%", "muted": "22%", "default": "20%", "raised": "24%", "overlay": "28%" }
  },
  "borders": {
    "light": { "muted": "87%", "default": "82%", "strong": "72%" },
    "dark":  { "muted": "30%", "default": "36%", "strong": "44%" }
  }
}
```

`surface: true` uses the global ramp; `surface: { surfaces: {...}, borders: {...} }`
overrides levels for one family. One opted-in family yields `--surface-<family>-<role>`
(5 roles: sunken, muted, default, raised, overlay) and `--border-<family>-<role>`
(3 roles: muted, default, strong), each flipping per mode like the tones. They
ship in the `theme` export group (`colors-rgb-theme.css`) and in the aggregate
`colors-rgb.css`. The L values are a starting point, tuned in the playground.

## Typography tokens

Typography tokens define font families, sizes, and line heights. They are consumed by the `styles` sub-project to generate Tailwind 4 theme utilities.

Font families used in Magma:

- `Karla` - UI sans-serif (labels, actions, captions)
- `Merriweather` - reading serif (body text, editorial)
- `Roboto` - secondary sans-serif
- `Roboto Mono` - monospace (code, snippets)

## Generating a custom palette

Use the CLI to generate a custom palette for a new product brand:

```bash
npx magma-design-tokens --config .magma-design-tokensrc.json --generate css,tailwind --outDir ./src/css
```

Config file format (`.magma-design-tokensrc.json`):

```json
{
  "colors": [
    {
      "color": "#AC9C97",
      "export": ["tones", "default"],
      "name": "tone.bisque",
      "ratios": "tone",
      "formula": "wcag3",
      "seed": { "light": "#FFFFFF", "dark": "#000000" }
    },
    {
      "color": "#00379E",
      "export": ["default"],
      "name": "variant.primary",
      "ratios": "tint",
      "formula": "wcag3"
    }
  ]
}
```

Available ratio presets: `default` or `tint` (10 steps optimised for tint based colors), `tone` (10 steps, optimised for neutral grays).

Colors can also declare an optional `hueShift` field (`{ "dark": -18, "light": 10, "curve": "smooth" }`) that rotates the hue of the darkest and lightest steps while preserving every contrast ratio; see the README of this package for the full reference.

## Output files reference

| File                                     | Format              | Consumer                 |
| ---------------------------------------- | ------------------- | ------------------------ |
| `dist/css/colors-rgb-tones.css`          | CSS RGB vars        | Web components, Tailwind |
| `dist/css/colors-rgb-status.css`         | CSS RGB vars        | Web components, Tailwind |
| `dist/css/colors-rgb-label.css`          | CSS RGB vars        | Web components, Tailwind |
| `dist/css/colors-rgb-brand.css`          | CSS RGB vars        | Web components, Tailwind |
| `dist/css/colors-rgb-theme.css`          | CSS RGB vars        | Surfaces + borders (semantic layer source) |
| `dist/css/colors-hex-*.css`              | CSS HEX vars        | Plain CSS only           |
| `dist/css/tailwind-theme-color.css`      | Tailwind 4 `@theme` | `styles` sub-project     |
| `dist/css/tailwind-theme-typography.css` | Tailwind 4 `@theme` | `styles` sub-project     |
| `dist/dart/*.dart`                       | Flutter/Dart        | Mobile apps              |
| `dist/gimp/colors.gpl`                   | GIMP palette        | GIMP, Inkscape (light)   |

## Anti-patterns

- ❌ Never hardcode hex color values in component CSS - use token vars
- ❌ Never import hex color files when using Tailwind or web components - they require RGB format
- ❌ Never modify generated files in `dist/` - they are overwritten on every build
- ❌ Never add tokens directly to component CSS vars without a corresponding token in this package
