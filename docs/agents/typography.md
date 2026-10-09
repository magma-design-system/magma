# Magma styles - typography

> Scope: setting text in your own UI with Magma's typography utilities. Requires the
> styles and fonts setup in [`assets.md`](assets.md).

## Typography utilities

Use the semantic `text-*` utilities instead of composing `font-*` + `text-*`:
`text-title-h1`..`h6`, `text-title-action`, `text-info-{paragraph,detail,caption,label,option,tip}`,
`text-read-{paragraph,detail,caption}`, `text-code-{snippet,hack}`.

They come from `styles/dist/tailwind/typography.css` (see the Tailwind section of
[`assets.md`](assets.md)). Without Tailwind, the same scale is a plain CSS class per style,
named `typography-*` (`typography-title-h1`, `typography-info-detail`, ...), in
`@maggioli-design-system/styles/dist/css/utility-typography.css`: import it in the
`utilities` layer.

Inside component markup, `mds-text` sets a style through its `typography` prop (`h1` ..
`h6`, `action`, `paragraph`, `detail`, `caption`, `label`, `option`, `tip`, `snippet`,
`hack`); `variant="read"` switches `paragraph`, `detail` and `caption` from the `info`
family to the `read` one.

```html
<h2 class="text-title-h3">Invoices</h2>
<p class="typography-read-paragraph">Plain CSS, no Tailwind.</p>
<mds-text typography="h3">Invoices</mds-text>
```
