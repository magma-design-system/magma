# mds-author


# Installation

Install the component via `npm` by running the following command:

```bash
npm i @maggioli-design-system/mds-author
```

This package works also with yarn:

```bash
yarn add @maggioli-design-system/mds-author
```

#### Import

Import the component in your project via `TypeScript` as follows:

```typescript
import { defineCustomElements as dceMdsAuthor } from '@maggioli-design-system/mds-author/loader'

dceMdsAuthor()
```

If you need to support older browsers (i.e. IE or early version of Edge), you can wrap the `defineCustomElements` in another utility available in the same package:

```typescript
import { applyPolyfills as apMdsAuthor, defineCustomElements as dceMdsAuthor } from '@maggioli-design-system/mds-author/loader'

apMdsAuthor().then(dceMdsAuthor())
```

Use alias for `defineCustomElements` method to initialize multiple web components in the same place:

```typescript
import { defineCustomElements as dceMdsComponentOne } from '@maggioli-design-system/mds-component-one/loader'
import { defineCustomElements as dceMdsComponentTwo } from '@maggioli-design-system/mds-component-two/loader'

dceMdsComponentOne()
dceMdsComponentTwo()
```

You can check how browser support works at [this page][stencil-browser-support].

---

# Integration

#### How to use it in HTML

`MdsAuthor` accepts a specific slot named `avatar` which is used to display an element on the left side (usually an image, or the initials of the author if no `src` is provided), while accepts multiple slots to be displayed on the right side for author's name and description. An example follow:

```html
<mds-author>
  <mds-avatar slot="avatar" initials="jd" src="<some-url>"></mds-avatar>
  <mds-text typography="h6">John Doe</mds-text>
  <mds-text typography="caption">Associated professor</mds-text>
</mds-author>
```

You can try it out on the component's [Storybook website][storybook]!

[storybook]: https://magma.maggiolicloud.it/storybook/?path=/story/ui-author--default
[stencil-browser-support]: https://stenciljs.com/docs/browser-support

This is a web-component from Maggioli Design System [Magma](https://magma.maggiolicloud.it), built with StencilJS, TypeScript, Storybook. It's based on the web-component standard and it's designed to be agnostic from the JavaScirpt framework you are using.

<!-- Auto Generated Below -->


## Slots

| Slot        | Description                                                                                                                          |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `"avatar"`  | Insert an avatar image, it is **recommended** to add `mds-avatar` element.                                                           |
| `"default"` | Add `text string`, `HTML elements` or `components` to this slot. Insert author information, name, role or other useful author infos. |


----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
