# Magma styles - color

> Scope: coloring your own UI with Magma's color tokens and utilities, in Tailwind and
> in plain CSS. Requires the styles setup in [`assets.md`](assets.md). Dark mode and
> themes: [`theming.md`](theming.md). The `variant` prop of the components:
> [`variants.md`](variants.md).

## Color classes

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

For colour values inside a component's CSS vars, use the same wrapper
`rgb(var(--<token>))`.
