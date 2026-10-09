# Magma components - conventions

> Scope: the rules every `mds-*` component follows - naming, boolean props, events,
> slots, compound components, icons, accessibility, styling from outside. Apply them
> once; do not re-derive them per component. The `variant` / `tone` axes have their own
> file: [`variants.md`](variants.md). Mistakes that apply to every component:
> [`anti-patterns.md`](anti-patterns.md).
>
> For one component's API (props with their allowed values, events, methods, slots,
> parts, CSS custom properties) read its own `AGENTS.md`, listed in
> [`components.md`](components.md). Do not guess prop names.

## Naming

- Every tag is prefixed `mds-`, lowercase kebab-case.
- Compound children share the parent prefix: `mds-accordion` / `mds-accordion-item`.
- Events are camelCase with the component name as prefix: `mdsInputChange`,
  `mdsAccordionChange`. Listen for the documented event name (the Events table of the
  component's `AGENTS.md`); do not synthesize your own. A component with no custom event
  (`mds-button`) is listened to with the native `click`.

## Boolean, disabled and await props

- Boolean props default to `false`/`undefined`. Prefer removing the attribute over
  setting it to `false`.
- Disabled: `<mds-button disabled>`. Never `disabled="false"` - remove it instead. Set
  `disabled` on the component, not on a wrapper: disabled components are removed from
  the tab order automatically.
- Async: `<mds-button await>` shows a spinner and blocks interaction; remove `await`
  (set `undefined`) when done.

## Sizing

Many components expose `size`, with different value sets: `sm` / `md` / `lg` / `xl` on
`mds-button`, `sm` / `md` / `lg` on `mds-input-switch`, `sm` / `md` on the `mds-pref-*`
controls, and on `mds-input-select` it is the number of visible rows, as on a native
`<select>`. Check the component's `AGENTS.md`. Do not override size via inline
`width`/`height` - use the prop.

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
  otherwise.
- When a component accepts both a `label` prop and a default slot, **prefer the prop**.
  Slots are for cases where the prop is insufficient and the component explicitly
  documents accepted slotted content. Never put nested HTML in a default slot expecting
  it to render - most Magma components strip non-text nodes.
- Named slots (`slot="header"`, `slot="footer"`) accept HTML and components. When a
  component documents a named slot (`<mds-notification slot="notification">`), use that
  exact slot name on the child element. Do not invent slot names.
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

Reference icons by **slug**, never inline `<svg>` and never import an icon package. A
slug starts with its icon set (`mi/` Material Icons, `mdi/` Material Design Icons, `mgg/`
Maggioli):

```html
<mds-icon name="mi/baseline/email"></mds-icon>
<mds-button icon="mi/baseline/send">Send</mds-button>
```

`mds-icon` fetches `<mdsIconSvgPath><slug>.svg`; the path is configured once at startup
(see [`assets.md`](assets.md)): `sessionStorage.setItem('mdsIconSvgPath', '/svg/')`.

## Accessibility

- `mds-button` sets `role="button"` on the host. Icon-only buttons must set `label` or
  `aria-label`: without them `mds-button` falls back to the last segment of the icon slug
  (`mi/baseline/send` -> "send"), which names the icon, not the action. Other components
  that accept `icon` without a label require `aria-label` (or `title`) on the host
  element: they do not synthesize one.
- Form components (`mds-input`, `mds-input-select`, ...) are form-associated
  (`formAssociated`) and participate in native form submission: place them inside
  `<form>` and they submit / reset natively.
- Focus styles: apply `focus-bounce` (interactive elements) or `focus-zoom` (links /
  static elements). Do not write `:focus { outline: ... }`. Both are Tailwind utilities
  (`styles/dist/tailwind/utilities.css`); without Tailwind only `focus-zoom` has a plain
  CSS class, in `styles/dist/css/utility-typography.css`.
- Use the preference components / classes for high contrast and reduced motion - do not
  hard-code those styles (see [`theming.md`](theming.md)).

## Styling components from outside

A component's styling API is what its `AGENTS.md` documents:

1. **CSS custom properties** ("CSS custom properties" table), named
   `--mds-<component>-<prop>`. The first choice: set them on the host element or on a
   parent selector.
2. **Shadow parts** ("Parts" table), for a deep customisation the custom properties do
   not cover. Only the documented part names: they are public API, the rest of the
   shadow tree is not.

Never reach past that: undocumented parts, internal class names, `>>>` or `/deep/`
break on any release.

```css
/* correct */
mds-button { --mds-button-radius: var(--magma-radius-full); }

.featured-card mds-button {
  --mds-button-background: rgb(var(--magma-accent-emphasis));
  --mds-button-radius: var(--magma-radius-lg);
}

/* correct, deep customisation: `icon` is a documented part of mds-button */
mds-button::part(icon) { fill: rgb(var(--magma-accent-fg)); }

/* incorrect - internal nodes are not API */
mds-button >>> .internal { color: red; }
```

For colour values inside CSS vars name a semantic role, never a palette step: see
[`color.md`](color.md). For radii use the `--magma-radius-*` scale, which follows the
corner geometry ([`theming.md`](theming.md)); a raw `--radius-*` or a pixel value does
not.
