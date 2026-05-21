# stencil SPEC.md

## Purpose

Defines general rules, conventions and composition patterns that apply to all Magma web components. Read this before working on any component. For a specific component, also read its own `SPEC.md`.

## Registering components

```javascript
import { defineCustomElements } from '@maggioli-design-system/magma/loader';
defineCustomElements();
```

For React:
```javascript
import { defineCustomElements } from '@maggioli-design-system/magma-react/loader';
```

For Angular, import `MagmaModule` in your `AppModule`:
```typescript
import { MagmaModule } from '@maggioli-design-system/magma-angular';
```

## Naming convention

All components are prefixed with `mds-`. Tag names are lowercase kebab-case. Compound child components share the parent name as a prefix:

```
mds-accordion
mds-accordion-item       ← child of mds-accordion
mds-accordion-timer
mds-accordion-timer-item ← child of mds-accordion-timer
```

## Props

- Props that accept a fixed set of values always have a TypeScript type and a corresponding dictionary exported from `@type/*`
- The `label` prop is the preferred way to pass text content; the default slot is supported for convenience but may be deprecated in future versions
- Props marked `reflect: true` are mirrored as HTML attributes and are safe to use in CSS attribute selectors

### Boolean values

- Boolean props default to `false` or `undefined`, not `true`
- When possible, prefer removing attribute or set it `undefined` instead of set it `false`.

## Events

All custom events are named in camelCase with the component name as prefix:

```
mdsButtonClick      ← from mds-button
mdsInputChange      ← from mds-input
mdsAccordionChange  ← from mds-accordion
```

Listen to events via `addEventListener` or framework-specific bindings:

```javascript
document.querySelector('mds-input').addEventListener('mdsInputChange', (e) => {
  console.log(e.detail.value);
});
```

## Slots

- The `default` slot accepts plain text strings only unless the component explicitly states otherwise
- Named slots (e.g. `slot="header"`, `slot="footer"`) accept HTML elements and components
- Add arbitrary HTML wrappers around slot content only when is not avoidable — it can break component layout and compound component communication

## Styling components from outside

The only supported customisation mechanism is **CSS custom properties** exposed by the component. Each component documents its available properties in `readme.md` under "CSS Custom Properties".

```css
/* correct */
mds-button {
  --mds-button-radius: 999px;
}

/* warning - use it when a deep customization is required */
mds-button::part(icon) {
  fill: rgb(var(--variant-primary-03));
}

/* incorrect — do not pierce shadow DOM */
mds-button >>> .internal-class {
  color: red;
}
```

## Tone and variant system

Many components accept both `variant` and `tone` props. These are independent axes:

- `variant` controls the **color role**: `primary`, `secondary`, `error`, `success`, `warning`, `info`, `ai`, `dark`, `light`
- `tone` controls the **visual intensity**: `strong` (filled), `weak` (tinted), `outline` (bordered), `text` (no background)


#### Variants

| Variant name  | Semantic meaning | Description                                            |
|---------------|------------------|--------------------------------------------------------|
| `primary`     | Theme            | Should be used for most important actions, or messages |
| `secondary`   | Theme            |  |
| `error`       | Status           |  |
| `success`     | Status           |  |
| `warning`     | Status           |  |
| `info`        | Status           |  |
| `ai`          | Service          |  |
| `dark`        | Neutral          |  |
| `light`       | Neutral          |  |
| `amaranth`    | Label            |  |
| `red`         | Label            |  |
| `aqua`        | Label            |  |
| `blue`        | Label            |  |
| `green`       | Label            |  |
| `lime`        | Label            |  |
| `orange`      | Label            |  |
| `orchid`      | Label            |  |
| `purple`      | Label            |  |
| `sky`         | Label            |  |
| `violet`      | Label            |  |
| `yellow`      | Label            |  |

#### Tones

| Tone name  | Description      | Additional note                                        |
|------------|------------------|--------------------------------------------------------|
| `strong`   | Theme            | Should be used for most important actions, or messages |
| `weak`     | Theme            |  |
| `outline`  | Theme            |  |
| `text`     | Theme               |  |

> ⚠️ Magma 2.0 breaking rename: `ghost` → `outline`, `quiet` → `text`

## Disabled state

Set `disabled` as a boolean attribute. Never use `disabled="false"` — remove the attribute instead, or set the prop to `undefined`.

```html
<!-- correct -->
<mds-button disabled>...</mds-button>
<mds-button>...</mds-button>

<!-- incorrect -->
<mds-button disabled="false">...</mds-button>
```

## Await / loading state

Components that trigger async operations expose an `await` prop. Setting `await` to `true` shows a loading spinner and prevents interaction.

```html
<mds-button await>Saving...</mds-button>
```

Remove `await` (set to `undefined`, not `false`) when the operation completes.

## Icons

Icons are referenced by their SVG filename slug (without `.svg` extension). The full icon list is in `projects/svg-icons/svg/`.

```html
<mds-button icon="action-email-send">Send</mds-button>
<mds-icon name="status-warning"></mds-icon>
```

The icon path must be configured before components mount:
```javascript
window.sessionStorage.setItem('mdsIconSvgPath', 'assets/img/svg/');
```

## Accessibility

- `mds-button` automatically sets `role="button"`, `aria-label`, and `title` from the `label` prop or slot content
- Icon-only buttons must have either `label` or an explicit `aria-label` attribute
- Form components (`mds-input`, `mds-input-select`, etc.) are form-associated and participate natively in form submission
- Use `mds-pref-contrast` to let users activate high-contrast mode; do not hard-code high-contrast styles

## Compound component rules

Parent/child component pairs communicate via internal Stencil mechanisms. Rules:

1. Child components must be **direct slot children** of the parent — no wrappers
2. Never use a child component outside its parent (e.g. `mds-accordion-item` without `mds-accordion`)
3. Never mix child types (e.g. do not put `mds-accordion-item` inside `mds-accordion-timer`)

## Scaffolding a new component

```bash
nx run stencil:generate mds-component-name
```

This creates the component folder with the standard file structure:
```
src/components/mds-component-name/
├── mds-component-name.tsx    ← component logic
├── mds-component-name.css    ← component styles
├── css/                      ← split CSS files (variants, sizes, etc.)
├── meta/                     ← TypeScript enums and dictionaries
└── test/
    ├── mds-component-name.e2e.ts
    ├── mds-component-name.stories.tsx
    └── mds-component-name.mdx
```

After scaffolding, add a `SPEC.md` to the component folder.

## Regression tests

Always run regression tests after visual changes:

```bash
# Before starting work — create fresh references
nx run stencil:test.regression.reference

# After your changes — review differences
nx run stencil:test.regression.review
```

Tests require Docker to ensure consistent Chrome rendering across machines.