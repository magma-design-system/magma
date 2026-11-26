# Magma → Figma conventions

Every rule here comes from a real mismatch found in the library. The code wins every disagreement.

## Props

| Code prop                                                                          | Figma property                                                                                 | Notes                                                                                                                                        |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| enum that changes the look (`variant`, `tone`, `size`, `typography`, `placement`…) | VARIANT, **same name, same values**                                                            | Values are the code strings exactly (`arithmetic`, not `operator`). Default variant = code default.                                          |
| `boolean` that changes the look (`open`, `selected`, `disabled`…)                  | VARIANT `false`/`true` when it changes many layers; BOOLEAN when it only shows/hides one layer | Same name as the code (`open`, not `menu=closed/open`; `badge`, not `show badge`). **Same polarity**: never invert (`back`, not `hideBack`). |
| number with a fixed range (`progress` 0–1)                                         | VARIANT with the code's scale                                                                  | Use the code's unit: `progress` is 0–1 (`0, 0.1 … 1`), not 0–100.                                                                            |
| `string` shown as text (`label`, `name`, `filename`)                               | TEXT, same name                                                                                | Placeholder text is real Italian copy, not lorem or English.                                                                                 |
| icon name (`icon`, `iconChecked`)                                                  | INSTANCE_SWAP named after the prop                                                             | Never one variant per icon.                                                                                                                  |
| visual state with no prop (`hover`, `focus`, `current`)                            | VARIANT `state`                                                                                | Only states the CSS styles. Focus = the shared `Focus ring` component, not a redrawn outline.                                                |
| prop with no visual effect (`value`, `tag`, events, a11y)                          | —                                                                                              | Leave out. List it in the description only if a designer could expect it.                                                                    |

- **Prop name format**: code camelCase as written in `magma.api.txt` (`controlsIcon`, `togglePosition`). Figma's `#id` suffix is ignored by the checks.
- **Figma-only properties** (a design convenience with no code prop, e.g. `count` on a group, `content=placeholder|filled`) are allowed only when the code expresses the same thing by content/slots. Name them in lowercase and list them in the description after `Figma-only:` (the check reads them from there).
- **Sparse matrices**: build only combinations the CSS can produce. If a value exists only together with another (`state=invalid` only with `content=filled`), write it in the description: `Combinations: state=invalid only with content=filled.` The QA card shows these as "parziale".
- Cap a variant matrix at what the CSS really distinguishes; split into sub-components rather than multiplying.

## Tokens

Find the variable whose **WEB code syntax** is the CSS expression the component uses (`python3 scripts/figma-script.py tokens <tag>`). Never pick a variable by colour value.

| CSS in the component                                                             | Figma                                                                                                             |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `--spacing(n)` in gap/padding/size                                               | `Size` collection, `size/n` (WEB `--spacing(n)`) — scope GAP / WIDTH_HEIGHT                                       |
| `var(--magma-rhythm-*)`, `var(--spacing-*)`                                      | `Size` → `rhythm/*`, `spacing/*`                                                                                  |
| `var(--magma-radius-*)`, component radius vars                                   | `Radius` collection (`radius/*`); both modes Squircle/Round must work                                             |
| `rgb(var(--magma-<role>))`                                                       | `Theme` collection (`tint/*`, `surface/*`, `text/*`, `border/*`, `info/*` …)                                      |
| `rgb(var(--tone-*))`, `rgb(var(--variant-*))`                                    | `Primitives` (hidden): bind to Theme, not to primitives, unless the CSS uses the primitive directly               |
| component colour vars (`--private-button-*`, `--mds-input-*`, `--mds-banner-*`…) | the matching `Variant/*` collection (`action/*`, `field/*`, `feedback/*`, `file/*`) with the mode set per variant |
| `typography="x"` / `@apply text-*`                                               | text style (table below)                                                                                          |
| `box-shadow` / elevation                                                         | effect style `Shadow/*` or `Elevation/*`; elevation depends on the `Depth` collection mode                        |
| border width, outline                                                            | `Size` → `border-width/*`, `outline/*` bound to stroke weight                                                     |

Typography prop → text style:

| `typography` | Style             | `typography` | Style          |
| ------------ | ----------------- | ------------ | -------------- |
| h1…h6        | Title/H1…Title/H6 | paragraph    | Info/Paragraph |
| action       | Title/Action      | detail       | Info/Detail    |
| caption      | Info/Caption      | label        | Info/Label     |
| option       | Info/Option       | tip          | Info/Tip       |
| snippet      | Code/Snippet      | hack         | Code/Hack      |

- **A colour with no variable in the code** (hard-coded in the component CSS): create the variable in the right collection, with **no WEB code syntax** and a description that starts with `Figma only:` and says where the value comes from (`Figma only: mds-toast close button colour, hard-coded in mds-toast.css`). Older variables use the Italian `Solo Figma:`; both are accepted by the checks.
- New variables: explicit scopes (never ALL_SCOPES), WEB code syntax exactly as in the CSS (`var(--x)`, `rgb(var(--x))`, `--spacing(n)`).

- A component CSS variable that only aliases a theme token (`--mds-card-background: rgb(var(--magma-surface-raised))`) binds to the resolved theme variable (`surface/raised`); name the CSS variable in the description.
- Copied or new text layers always get a text style; bound font variables alone are a KO.

## Layout

| CSS                                                                                    | Auto-layout                                                                                                                                        |
| -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `display:flex` / `grid` (single column)                                                | horizontal / vertical auto-layout; `gap` → itemSpacing bound to Size                                                                               |
| `min-width: X` + `flex-grow: 1`                                                        | component width FIXED at X (the minimum); instances may be widened                                                                                 |
| `width: max-content` / `flex: none` / `:last-of-type { flex-basis:auto; flex-grow:0 }` | HUG                                                                                                                                                |
| text in a block that can wrap (default `white-space`)                                  | text FILL + `textAutoResize = HEIGHT`; its parent frames FILL. **Check the largest typography**: hugging text overflowed in Stepper Bar Item h1/h2 |
| `white-space: nowrap`, `text-overflow: ellipsis`                                       | text HUG, or FILL + truncation with the same max lines                                                                                             |
| `position:absolute` decorations (focus ring, badges on corners)                        | absolute children; component `clipsContent = false` so focus rings are not cut                                                                     |

## Description

English, plain text, no HTML entities, in this order (one short line each):

```
Magma <mds-tag>. <What it is, one sentence>.
Props: <figma prop> = code <prop> (<values>); ... Figma-only: <prop> (<why>).
Tokens: <collection/mode logic, e.g. "The mode of Variant/Action is the variant prop.">
Combinations: <value> only with <value>. (omit if the matrix is full)
Not in Figma: <code props or behaviours left out, and why>. (omit if none)
```

The `check` script reads the names right after `Figma-only:` and `Not in Figma:` (comma or "and" separated, reasons in brackets), so write property names exactly as they are in Figma.

## Naming

- Set name = the Magma name in Title Case without `mds-` (`Stepper Bar Item`); sub-families with `/` (`Input/Number`, `Badge/Strong`).
- Layer names = the CSS class or part name (`header`, `infos`, `Label`), so a dev can find them.
- Internal helpers not meant for designers: start with `.` or `_` (not published).
