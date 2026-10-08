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
- Events are camelCase with the component name as prefix: `mdsButtonClick`,
  `mdsInputChange`. Listen for the documented event name; do not synthesize your own.

## Boolean, disabled and await props

- Boolean props default to `false`/`undefined`. Prefer removing the attribute over
  setting it to `false`.
- Disabled: `<mds-button disabled>`. Never `disabled="false"` - remove it instead. Set
  `disabled` on the component, not on a wrapper: disabled components are removed from
  the tab order automatically.
- Async: `<mds-button await>` shows a spinner and blocks interaction; remove `await`
  (set `undefined`) when done.

## Sizing

Components that expose `size` accept `sm`, `md` (default), `lg`, `xl`. Do not override
size via inline `width`/`height` - use the prop.

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

Reference icons by **slug**, never inline `<svg>` and never import an icon package:

```html
<mds-icon name="action-email-send"></mds-icon>
<mds-button icon="action-email-send">Send</mds-button>
```

The icon path must be configured once at startup (see [`assets.md`](assets.md)):
`sessionStorage.setItem('mdsIconSvgPath', '/svg/')`.

## Accessibility

- `mds-button` derives `role`, `aria-label` and `title` from `label`/slot. Icon-only
  buttons must set `label` or `aria-label`. In general, components that accept `icon`
  without a label require `aria-label` (or `title`) on the host element: the component
  does not synthesize one.
- Form components (`mds-input`, `mds-input-select`, ...) are form-associated
  (`formAssociated`) and participate in native form submission: place them inside
  `<form>` and they submit / reset natively.
- Focus styles: apply `focus-bounce` (interactive elements) or `focus-zoom` (links /
  static elements). Do not write `:focus { outline: ... }`.
- Use the preference components / classes for high contrast and reduced motion - do not
  hard-code those styles (see [`theming.md`](theming.md)).

## Styling components from outside

The only supported customisation is the **CSS custom properties** each component
exposes (listed under "CSS custom properties" in its `AGENTS.md`), named
`--mds-<component>-<prop>`. Set them on the host element or on a parent selector. Never
pierce the shadow DOM.

```css
/* correct */
mds-button { --mds-button-radius: 999px; }

.featured-card mds-button {
  --mds-button-background: rgb(var(--variant-primary-03));
  --mds-button-radius: var(--radius-lg);
}

/* deep customisation, use sparingly */
mds-button::part(icon) { fill: rgb(var(--variant-primary-03)); }

/* incorrect - do not target internal nodes */
mds-button >>> .internal { color: red; }
```

For colour values inside CSS vars see [`color.md`](color.md).
