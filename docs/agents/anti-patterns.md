# Magma components - system-level anti-patterns

> Scope: mistakes that apply to **every** component. Each component's own
> `antipattern.md` (next to its `AGENTS.md`) covers the component-specific ones; the
> ones below are universal. The rules they break: [`conventions.md`](conventions.md),
> [`variants.md`](variants.md), [`color.md`](color.md), [`theming.md`](theming.md).

- Replacing a Magma component with a raw HTML element (`<button>`, `<input>`, `<a>` for
  an action) when an `mds-*` equivalent exists.
- Wrapping an interactive `mds-*` component in another interactive element
  (`<a><mds-button></mds-button></a>` - use the `href` prop instead).
- Reaching into shadow DOM past the documented API: undocumented `::part()` names,
  internal class names, `>>>`, `/deep/`, or attribute-selector hacks. Use the CSS custom
  properties and, for a deep customisation, the parts listed in the component's
  `AGENTS.md` (see [`conventions.md`](conventions.md)).
- Setting boolean attributes to the string `"false"` (e.g. `disabled="false"`,
  `await="false"`). In HTML/Stencil any non-empty string is truthy - **remove the
  attribute** to turn it off.
- Embedding nested HTML in a default slot when the component documents a `label` prop.
- Using raw Tailwind colour utilities (`bg-white`, `text-gray-700`) on or inside Magma
  components - use the semantic role classes (`bg-surface-default`, `text-fg-muted`),
  see [`color.md`](color.md).
- Writing `@media (prefers-color-scheme: dark)` overrides - dark mode is handled by the
  palette layer.
- Hand-rolling focus styles instead of `focus-bounce` / `focus-zoom`.
- Listening for native DOM events (`change`, `input`) when the component emits a
  documented `mds*` event - they may not bubble out of shadow DOM the way you expect.
- Applying a `tone`, `variant`, or `size` value to a component without checking its
  typed signature (the Props table of its `AGENTS.md`, or
  `dist/types/components.d.ts`). The same prop name accepts different value sets per
  component - e.g. `<mds-banner tone="outline">` is invalid because `mds-banner.tone` is
  `ToneMinimalBoxVariantType` (`strong | weak | box` only).
