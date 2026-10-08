# Magma components - variant and tone

> Scope: the two independent axes many components accept - `variant` (the color role)
> and `tone` (the visual intensity) - their values, and how to check what one component
> accepts. The other component rules: [`conventions.md`](conventions.md).

Many components accept both `variant` and `tone` props. These are independent axes:

- `variant` controls the **color role** - it answers _what kind of action/state this
  is_.
- `tone` controls the **visual intensity** - it answers _how much emphasis this should
  have_, independent of `variant`.

```html
<mds-button variant="primary" tone="strong">Save</mds-button>
<mds-button variant="error" tone="outline">Delete</mds-button>
```

The same `variant` + different `tone` is the right way to express importance - do not
invent custom CSS to dim or saturate. Pick the variant that matches the **meaning**, not
the colour you happen to want.

> Magma 2.0 breaking rename: `ghost` -> `outline`, `quiet` -> `text`.

## Variants

Allowed values depend on the component but draw from these families:

| Family    | Values                                       | Use for                                                    |
| --------- | -------------------------------------------- | ---------------------------------------------------------- |
| Brand     | `primary`, `secondary`, `ai`                 | Calls to action, supporting actions, AI-driven affordances |
| Luminance | `dark`, `light`                              | Neutral chrome buttons / chips                             |
| Status    | `info`, `success`, `warning`, `error`        | Communicating state                                        |
| Label     | `amaranth`, `red`, `aqua`, `blue`, ...       | Decorative tags, categories, visual grouping               |
| Identity  | `google`, `apple`, etc. (component-specific) | Login / SSO buttons                                        |

| Variant name | Semantic meaning | Description                                                        |
| ------------ | ---------------- | ------------------------------------------------------------------ |
| `primary`    | Theme            | Should be used for most important actions, or messages             |
| `secondary`  | Theme            | Supporting actions or messages that complement the primary variant |
| `error`      | Status           | Communicates failures, destructive actions, or validation issues   |
| `success`    | Status           | Communicates successful operations or positive confirmation        |
| `warning`    | Status           | Communicates caution or non-blocking issues that require attention |
| `info`       | Status           | Communicates neutral informational content or guidance             |
| `ai`         | Service          | Identifies AI-generated content or AI-powered features             |
| `dark`       | Neutral          | Dark neutral coloring, typically for use over light backgrounds    |
| `light`      | Neutral          | Light neutral coloring, typically for use over dark backgrounds    |
| `amaranth`   | Label            | Decorative amaranth label for tags, categories, or visual grouping |
| `red`        | Label            | Decorative red label for tags, categories, or visual grouping      |
| `aqua`       | Label            | Decorative aqua label for tags, categories, or visual grouping     |
| `blue`       | Label            | Decorative blue label for tags, categories, or visual grouping     |
| `green`      | Label            | Decorative green label for tags, categories, or visual grouping    |
| `lime`       | Label            | Decorative lime label for tags, categories, or visual grouping     |
| `orange`     | Label            | Decorative orange label for tags, categories, or visual grouping   |
| `orchid`     | Label            | Decorative orchid label for tags, categories, or visual grouping   |
| `purple`     | Label            | Decorative purple label for tags, categories, or visual grouping   |
| `sky`        | Label            | Decorative sky label for tags, categories, or visual grouping      |
| `violet`     | Label            | Decorative violet label for tags, categories, or visual grouping   |
| `yellow`     | Label            | Decorative yellow label for tags, categories, or visual grouping   |

## Tones

Standard ladder, supported by most interactive components:

| Tone      | Weight              | Visual                                                     |
| --------- | ------------------- | ---------------------------------------------------------- |
| `strong`  | Highest emphasis    | Solid filled background                                    |
| `weak`    | Medium emphasis     | Subtle tinted background, for supporting context           |
| `outline` | Medium-low emphasis | Border only, no fill                                       |
| `text`    | Lowest emphasis     | No border, no background - just the label, in-text actions |
| `box`     | Boxed container     | High-contrast container style (where supported)            |

## What one component accepts

The values a specific component accepts for `tone`, `variant`, `size`, etc. are
**narrower** than the universal ladders above. For example, `mds-button` accepts
`tone="outline"` but `mds-banner` does not.

To verify a prop value before using it, read the Props table in the component's
`AGENTS.md` (listed in [`components.md`](components.md)): the Type column lists the
allowed values. The typed signatures are also in
`@maggioli-design-system/magma/dist/types/components.d.ts`, where a prop is typed by
name (e.g. `tone?: ToneMinimalBoxVariantType`).

The five `tone` types:

| Type                        | Allowed `tone` values                      | Example component |
| --------------------------- | ------------------------------------------ | ----------------- |
| `ToneMinimalVariantType`    | `strong`, `weak`                           | `mds-chip`        |
| `ToneMinimalBoxVariantType` | `strong`, `weak`, `box`                    | `mds-banner`      |
| `ToneSmartVariantType`      | `strong`, `weak`, `outline`                | `mds-badge`       |
| `ToneVariantType`           | `outline`, `strong`, `text`, `weak`        | `mds-radial-menu` |
| `ToneBoxVariantType`        | `outline`, `strong`, `text`, `weak`, `box` | `mds-button`      |

`variant`, `size`, and other constrained props follow the same pattern (e.g.
`ThemeVariantType`, `ThemeFullVariantType`, `ChipVariantType`, `ProgressBarSizeType`).
