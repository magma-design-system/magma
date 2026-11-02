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
<h1 class="text-title-page">Invoices</h1>
<p class="typography-read-paragraph">Plain CSS, no Tailwind.</p>
<mds-text typography="h3" tag="h1">Invoices</mds-text>
```

## Titles by role

A title takes the style of its role and its tag from the outline of the page, never one from
the other: the domain [`titles`](patterns/titles.md).

| Role | Style | Tag | Writes |
| --- | --- | --- | --- |
| the page | `h3` | `h1`, the only one (`titles/one-h1`) | `text-title-page` |
| a section of the page | `h5` | `h2` | `text-title-section` |
| a dialog | `h5` | the headline of its window | `text-title-dialog` |
| a part: a card, a panel, an item of an accordion | `h6` | the level of its place | `text-title-part` |
| a group of fields | `h6` | the `legend` of its `fieldset` (`field-group`) | `text-title-group` |

Without Tailwind the same roles are `typography-title-<role>`. `mds-text` takes the roles in
its `typography` with #1200; until then it takes the style of the level with the tag of the
place (`typography="h5" tag="h2"`), and a heading never skips a level
(`titles/tag-is-structure`).

## Reading measure

Text to read stops at `56ch`, 65 to 80 characters on a line: the reset caps `p`, `li` and
`figcaption`, and `mds-text` caps itself with those tags, so nothing has to be written for it
(`widths/reading`; the other widths, of a form, a page and a dialog, are the domain
[`widths`](patterns/widths.md)).
