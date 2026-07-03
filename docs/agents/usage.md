# agents usage.md

## Purpose

How to actually use Magma components and styles once installed. This is the
cross-cutting "how the system works" knowledge that does not come from the TypeScript
types: naming, the tone/variant axes, events, slots, compound rules, icons,
accessibility, and app-level styling (token color classes, typography utilities, dark
mode). For the per-component API (props, events, slots, CSS custom properties) read the
shipped reference - see "Per-component API" below - and for the catalogue of what
exists read [`components.md`](components.md).

This file is shipped inside each package as `agents/usage.md`, versioned with it.

## Per-component API (already shipped - read these first)

The published package already carries the full component reference. Do not guess prop
names; look them up:

| Source | Path (resolves from node_modules) | Use for |
| ------ | --------------------------------- | ------- |
| Types | `@maggioli-design-system/magma/dist/types/components.d.ts` | Prop names and their typed value sets, event types. Drives editor IntelliSense |
| Full docs | `@maggioli-design-system/magma/dist/documentation.json` | Per-component `readme`, `usage`, `props`, `events`, `slots`, `styles`, `parts` in one structured file |
| Catalogue | [`components.md`](components.md) | Which component to reach for (tag + summary) |

The `magma` core package is always installed (the React/Angular wrappers depend on it),
so these paths resolve regardless of target.

To inspect one component from `documentation.json` without reading 2 MB:

```bash
node -e "const d=require('@maggioli-design-system/magma/dist/documentation.json');const c=d.components.find(c=>c.tag==='mds-button');console.log(JSON.stringify({props:c.props,events:c.events,slots:c.slots,styles:c.styles},null,2))"
```

React and Angular consumers get the same metadata typed through the wrapper components /
directives - import a component and the editor surfaces its props.

## Naming

- Every tag is prefixed `mds-`, lowercase kebab-case.
- Compound children share the parent prefix: `mds-accordion` / `mds-accordion-item`.
- Events are camelCase with the component name as prefix: `mdsButtonClick`,
  `mdsInputChange`.

## Tone and variant

Many components accept two independent axes:

- `variant` = color role: `primary`, `secondary`, `error`, `success`, `warning`,
  `info`, `ai`, `dark`, `light`, plus decorative label colors (`red`, `aqua`, `blue`,
  `green`, `lime`, `orange`, `purple`, `sky`, `violet`, `yellow`, `amaranth`, `orchid`).
- `tone` = visual intensity: `strong` (filled), `weak` (tinted), `outline` (bordered),
  `text` (no background).

```html
<mds-button variant="primary" tone="strong">Save</mds-button>
<mds-button variant="error" tone="outline">Delete</mds-button>
```

> Magma 2.0 renamed `ghost` -> `outline` and `quiet` -> `text`. The old names are gone.

## Boolean, disabled and await props

- Boolean props default to `false`/`undefined`. Prefer removing the attribute over
  setting it to `false`.
- Disabled: `<mds-button disabled>`. Never `disabled="false"` - remove it instead.
- Async: `<mds-button await>` shows a spinner and blocks interaction; remove `await`
  (set `undefined`) when done.

## Events

Listen with `addEventListener` or framework bindings. The payload is on `event.detail`:

```javascript
document.querySelector('mds-input')
  .addEventListener('mdsInputChange', (e) => console.log(e.detail.value));
```

```tsx
// React
<MdsInput onMdsInputChange={(e) => console.log(e.detail.value)} />
```

```html
<!-- Angular -->
<mds-input (mdsInputChange)="onChange($event)"></mds-input>
```

## Slots

- The `default` slot accepts plain text only, unless the component's own docs say
  otherwise. Prefer the `label` prop for text content.
- Named slots (`slot="header"`, `slot="footer"`) accept HTML and components.
- Do not wrap slotted content in arbitrary elements - it can break layout and
  compound-component communication.

## Compound components

Parent/child pairs communicate internally. Rules:

1. The child must be a **direct slot child** of its parent - no wrappers.
2. Never use a child outside its parent (no `mds-accordion-item` without `mds-accordion`).
3. Never mix child types across parents.

```html
<mds-accordion>
  <mds-accordion-item>...</mds-accordion-item>
</mds-accordion>
```

## Icons

Reference icons by **slug**, never inline `<svg>` and never import an icon package:

```html
<mds-icon name="action-email-send"></mds-icon>
<mds-button icon="action-email-send">Send</mds-button>
```

The icon path must be configured once at startup (see `agents/assets.md`):
`sessionStorage.setItem('mdsIconSvgPath', '/svg/')`.

## Accessibility

- `mds-button` derives `role`, `aria-label` and `title` from `label`/slot. Icon-only
  buttons must set `label` or `aria-label`.
- Form components (`mds-input`, `mds-input-select`, ...) are form-associated and
  participate in native form submission.
- Use the preference components / classes for high contrast and reduced motion - do not
  hard-code those styles.

## Styling components from outside

The only supported customisation is the **CSS custom properties** each component
exposes (listed under "CSS Custom Properties" in its reference). Never pierce the
shadow DOM.

```css
/* correct */
mds-button { --mds-button-radius: 999px; }

/* deep customisation, use sparingly */
mds-button::part(icon) { fill: rgb(var(--variant-primary-03)); }

/* incorrect - do not target internal nodes */
mds-button >>> .internal { color: red; }
```

## App-level styling

Beyond components, build your own UI with Magma's tokens and utilities (these require
the styles setup in `agents/assets.md`).

### Color classes

Use semantic token classes, never raw Tailwind primitives - they break dark mode:

```html
<!-- correct -->
<div class="bg-tone-neutral text-tone-neutral-03">...</div>
<!-- incorrect -->
<div class="bg-white text-gray-700">...</div>
```

Prefixes: `tone-neutral`, `tone-porcelain`, `tone-kaolin`, `tone-fireclay`,
`tone-bisque`, `status-{info,success,warning,error}`, `label-*`,
`variant-{primary,secondary,ai}`, `brand-maggioli`. Outside Tailwind, always use the
RGB wrapper so opacity works:

```css
.sel { color: rgb(var(--tone-neutral-03)); background: rgb(var(--tone-neutral-03) / 0.15); }
```

### Typography utilities

Use the semantic `text-*` utilities instead of composing `font-*` + `text-*`:
`text-title-h1`..`h6`, `text-title-action`, `text-info-{paragraph,detail,caption,label,option,tip}`,
`text-read-{paragraph,detail,caption}`, `text-code-{snippet,hack}`.

### Dark mode and preferences

Handled at the palette level - no per-element classes. Activate on `<html>`:

```html
<html class="pref-theme-system"><!-- or pref-theme-light / pref-theme-dark --></html>
```

Same pattern for `pref-contrast-*` and `pref-animation-*`. For programmatic control use
the `mds-pref-theme` component. Never write `color-scheme` or dark-mode media queries by
hand.

### Global design decisions

Override `--magma-*` vars only inside the `overrides` cascade layer:
`--magma-corner-shape` (default `squircle`), `--magma-disabled-opacity` (`0.5`),
`--magma-backdrop-opacity` (`0.1`), `--magma-outline-focus`.

```css
@layer overrides { :root { --magma-corner-shape: round; } }
```

## See also

- [`components.md`](components.md) - the component catalogue
- [`assets.md`](assets.md) - styles / fonts / icons setup
- [`AGENTS.md`](../AGENTS.md) - the install entry point
