# Magma components - mistakes to avoid with any component

> Scope: mistakes that apply to **every** component, and to every interface built with
> them. Each component's own `mistakes.md` (next to its `AGENTS.md`) covers the
> component-specific ones; the ones below are universal. Each item opens with the rule it
> keeps, in bold, and names the rule of the lint that catches it, when one does
> ([`lint.md`](lint.md)); the skill `ui` of the Magma Claude Code plugin lists the rules in
> bold as they are written here. The rules in full: [`conventions.md`](conventions.md),
> [`variants.md`](variants.md), [`color.md`](color.md), [`theming.md`](theming.md),
> [`typography.md`](typography.md).

## The rules

- **Use the `mds-*` component, never the raw element it replaces** (a `<button>`, an
  `<input>`, an `<a>` for an action), where an `mds-*` equivalent exists.
- **Never put an interactive component inside another interactive element**:
  `<a><mds-button></mds-button></a>` is one; use the `href` prop instead.
- **Write only the values a prop accepts: `tone`, `variant` and `size` take different
  values on each component.** Check a value against the component's typed signature (the
  Props table of its `AGENTS.md`, or `dist/types/components.d.ts`) - e.g.
  `<mds-banner tone="outline">` is invalid because `mds-banner.tone` is
  `ToneMinimalBoxVariantType` (`strong | weak | box` only). `magma/valid-attribute-values`
  catches it.
- **Turn a boolean prop off by removing its attribute, never with `"false"`**
  (`disabled="false"`, `await="false"`). On a form-associated component (`mds-button`,
  `mds-button-dropdown` and the form inputs, listed in [`conventions.md`](conventions.md))
  `"false"` turns the prop **on**, as on a native control. On the others Stencil reads
  `"false"` as `false`, but the attribute stays in the DOM on a prop that is not reflected
  (and until the first render on one that is), so `[disabled]` selectors and scripts
  reading the attribute still see it set. From React or Angular, pass `false` to the
  property, as [`conventions.md`](conventions.md) shows. `magma/no-false-boolean` catches
  it.
- **Never write a deprecated prop**: it still works, and the next major removes it; its
  `@deprecated` text, in the component's `AGENTS.md`, says what to use instead.
  `magma/no-deprecated` catches it.
- **Give every control a name: `label` or `aria-label` on a component shown with its icon
  alone, `alt` on an image** (`alt=""` when it is decorative). Without it `mds-button` is
  announced by the slug of its icon, which names the icon and not the action.
  `magma/accessible-name` catches it.
- **Pass text through the `label` prop when the component documents one**, not as nested
  HTML in its default slot.
- **Listen to the documented `mds*` events, not to the native `change` or `input`**: they
  may not bubble out of shadow DOM the way you expect.
- **Style a component only through its public custom properties and its documented
  parts**: never an internal custom property, an undocumented `::part()` name, an internal
  class name, `>>>`, `/deep/` or an attribute-selector hack (see
  [`conventions.md`](conventions.md), "Styling components from outside").
  `magma/no-internal-tokens` catches the internal custom properties.
- **Paint with the semantic roles (`bg-surface-default`, `text-fg-muted`), never with
  Tailwind's palette or a literal colour** (`bg-white`, `text-gray-700`, `#fff`), on or
  inside Magma components; see [`color.md`](color.md). `magma/no-raw-palette-classes`
  catches a palette class, `magma/no-raw-color` a literal colour.
- **Never write dark mode by hand with a `prefers-color-scheme` query**: the palette layer
  handles dark mode ([`theming.md`](theming.md)). `magma/no-color-scheme-override` catches
  it.
- **Set text with the semantic typography utilities (`text-title-h3`,
  `text-info-detail`), never composed from `font-*` and `text-*` primitives**; see
  [`typography.md`](typography.md).
- **Write the Magma spacing steps in full: `p-400` is 1rem, while Tailwind's `p-4` is
  0.01rem.** A step is its number times `--spacing` (0.0025rem): write `p-600`,
  `gap-400` ([`assets.md`](assets.md)).
- **Space two elements by the step of their relation, never by a value picked by eye**:
  the domain [`rhythm`](patterns/rhythm.md) of the design language gives the step of each
  relation.
- **Reference an icon by a slug of the sets the project serves, never an inline `<svg>`
  or an imported icon package** ([`conventions.md`](conventions.md), "Icons").
- **Keep Magma's focus styles (`focus-bounce`, `focus-zoom`), never hand-rolled ones.**
