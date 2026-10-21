# Magma components - variant and tone

> Scope: the two independent axes many components accept - `variant` (the color role)
> and `tone` (the visual intensity) - their values, and how to check what one component
> accepts. The other component rules: [`conventions.md`](conventions.md). The color
> roles behind each variant: [`color.md`](color.md).

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

> Magma 2.0 breaking rename of `tone`: `ghost` -> `outline`; `quiet` -> `text` on
> `mds-button`, `mds-radial-menu` and `mds-radial-menu-item` (the only components with a
> `text` tone), `quiet` -> `weak` everywhere else. The codemod
> (`@maggioli-design-system/magma-codemods`) applies both.

## Variants

Allowed values depend on the component but draw from these families:

| Family   | Values                                | Use for                                     | Paints with ([`color.md`](color.md))    |
| -------- | ------------------------------------- | ------------------------------------------- | ---------------------------------------- |
| Accent   | `primary`, `secondary`, `ai`          | Actions and selection, AI-driven features   | `--magma-accent-*`, `--magma-accent-ai-*` |
| Status   | `info`, `success`, `warning`, `error` | Communicating state                         | `--magma-<hue>-*` (`error` is the `danger` hue) |
| Neutral  | `dark`, `light`                       | Neutral chrome buttons, chips, badges       | the neutral roles                        |
| Label    | `amaranth`, `red`, `aqua`, `blue`, ... | Categories, tags, visual grouping          | the `label-*` palette                    |
| Identity | `google`, `apple`                     | Sign-in buttons (`mds-button`, `mds-radial-menu`, `mds-radial-menu-item`) | fixed by the provider's guidelines; `tone` is ignored |

| Variant name | Family   | Description                                                                 |
| ------------ | -------- | --------------------------------------------------------------------------- |
| `primary`    | Accent   | The most important actions or messages                                      |
| `secondary`  | Accent   | Kept for compatibility: it renders exactly like `primary`. A second brand colour is a named theme, not a variant ([`theming.md`](theming.md)); for a supporting action lower the `tone` instead |
| `ai`         | Accent   | AI-generated content or AI-powered features                                 |
| `error`      | Status   | Failures, destructive actions, validation issues                            |
| `success`    | Status   | Successful operations, positive confirmation                                |
| `warning`    | Status   | Caution, non-blocking issues that require attention                         |
| `info`       | Status   | Neutral informational content or guidance                                   |
| `dark`       | Neutral  | Neutral chrome. Painted with roles that follow the mode, so it is not "for light backgrounds": check the component's `pattern.md` for how it renders |
| `light`      | Neutral  | The other half of the neutral pair, same caveat as `dark`                   |
| `amaranth`   | Label    | Decorative amaranth label for tags, categories, or visual grouping          |
| `red`        | Label    | Decorative red label for tags, categories, or visual grouping               |
| `aqua`       | Label    | Decorative aqua label for tags, categories, or visual grouping              |
| `blue`       | Label    | Decorative blue label for tags, categories, or visual grouping              |
| `green`      | Label    | Decorative green label for tags, categories, or visual grouping             |
| `lime`       | Label    | Decorative lime label for tags, categories, or visual grouping              |
| `orange`     | Label    | Decorative orange label for tags, categories, or visual grouping            |
| `orchid`     | Label    | Decorative orchid label for tags, categories, or visual grouping            |
| `purple`     | Label    | Decorative purple label for tags, categories, or visual grouping            |
| `sky`        | Label    | Decorative sky label for tags, categories, or visual grouping               |
| `violet`     | Label    | Decorative violet label for tags, categories, or visual grouping            |
| `yellow`     | Label    | Decorative yellow label for tags, categories, or visual grouping            |

A label colour never communicates state: for state use a status variant.

## Tones

The tone vocabulary, from the most to the least emphasis:

| Tone      | Weight              | Visual                                                     |
| --------- | ------------------- | ---------------------------------------------------------- |
| `strong`  | Highest emphasis    | Solid filled background                                    |
| `weak`    | Medium emphasis     | Subtle tinted background, for supporting context           |
| `outline` | Medium-low emphasis | Border only, no fill                                       |
| `text`    | Lowest emphasis     | No border, no background - just the label, in-text actions |
| `box`     | Boxed container     | High-contrast container style                              |

Only `strong` and `weak` are common. `outline` exists on `mds-button`, `mds-badge`,
`mds-radial-menu` and `mds-radial-menu-item`; `text` on `mds-button`, `mds-radial-menu`
and `mds-radial-menu-item`; `box` on `mds-button` and `mds-banner`.

## What one component accepts

The values a specific component accepts for `tone`, `variant`, `size`, etc. are
**narrower** than the vocabularies above. For example, `mds-button` accepts
`tone="outline"` but `mds-banner` does not.

To verify a prop value before using it, read the Props table in the component's
`AGENTS.md` (listed in [`components.md`](components.md)): the Type column lists the
allowed values. The typed signatures are also in
`@maggioli-design-system/magma/dist/types/components.d.ts`, where a prop is typed by
name (e.g. `tone?: ToneMinimalBoxVariantType`).

The `tone` types:

| Type                        | Allowed `tone` values                      | Components |
| --------------------------- | ------------------------------------------ | ---------- |
| `ToneMinimalVariantType`    | `strong`, `weak`                           | `mds-avatar`, `mds-avatar-stack-item`, `mds-button-dropdown`, `mds-chip`, `mds-entity`, `mds-label`, `mds-push-notification-item`, `mds-toast` |
| `ToneMinimalBoxVariantType` | `strong`, `weak`, `box`                    | `mds-banner` |
| `ToneSmartVariantType`      | `strong`, `weak`, `outline`                | `mds-badge` |
| `ToneVariantType`           | `outline`, `strong`, `text`, `weak`        | `mds-radial-menu`, `mds-radial-menu-item` |
| `ToneBoxVariantType`        | `outline`, `strong`, `text`, `weak`, `box` | `mds-button` |
| `ToneSimpleVariantType`     | `strong`, `weak`, `text`                   | none today |

`variant`, `size`, and other constrained props follow the same pattern (e.g.
`ThemeVariantType`, `ThemeFullVariantType`, `ChipVariantType`, `ProgressBarSizeType`).
