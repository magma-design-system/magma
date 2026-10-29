# mds-book



<!-- Auto Generated Below -->


## Usage

### 1. Description

The `<mds-book>` web component shows a book as a physical object, from the image of its front cover alone: front cover, spine and page block drawn in CSS 3D, turned a little so the spine shows. It is the catalogue and product-page counterpart of `<mds-img>`, for publications rather than pictures.

#### Semantic Behavior

- **One image of the book**: The host is a single `role="img"` named by `alt`, or by `name` and `author` ("Title by Author", localised in el/en/es/it), or by a generic "Book" when there is neither. An empty `alt` marks the book as decorative (`role="presentation"`). The text printed on the spine and on a drawn cover is hidden from assistive technologies, since it repeats that name.
- **The sides come from the cover**: The spine continues the left edge of the cover image and the board edges its top and right edges, as a wraparound cover prints its design on, so no spine or back cover image is needed. Without an image they take `--mds-book-color`.
- **A drawn cover instead of a broken image**: Without `src`, or when the image fails to load, the front shows the author, the title and the publisher, or its mark, on `--mds-book-color`. A new `src` tries again.
- **A neutral shape while loading**: Until its image arrives, a book with `src` is drawn in a neutral surface colour, so a lazy catalogue does not flash in the colour of drawn covers.
- **Light and shadow**: The book is seen a little from above. Each face takes the light by how it turns toward it, in a light touch that shows the volume without drawing the eye. Its shadow falls on the surface it rests on, under its tail when it stands and under its back cover when it lies, darkest where it touches and soon gone; around its outline only a halo faint enough to part a light cover from a light page.
- **Movement**: The book rests in its `pose`. On hover it rises off the surface, its shadow fading there, and leans a little toward the pointer, with a faint sheen on the cover. A drag (mouse, pen or finger) turns it further, within limits, to show the spine or the pages, never the back, or spins a lying book on its surface; it settles back when released, or when the pointer leaves the window or the frame of the page, where its release could not reach the book. A vertical swipe still scrolls the page.
- **Not a control**: The book has no action of its own. To make it a link, wrap it: the click that ends a drag does not follow the link, a plain click does.
- **Reduced motion**: With the animation preference set to reduce (or the system asking for it, when there is no controller), the book keeps its resting pose: no lean, no lift, no drag.
- **Consumption**: The consumption preference sets how much the book costs to draw. At `high` (the default, and on a page without the controller) it does everything; at `medium` it moves without the sheen and without the halo, a filter computed again on every frame; at `low` it is drawn once, in its pose, and never animated. While it moves, only opacities and transforms change, which the compositor applies without painting the faces again.

#### Properties & Visual Configurations

- **`pose`**: how the book is shown, after the usual shots of product photography. A drag turns it from there, and it goes back to it when released.
  - `'spine'`: standing, turned to show its spine; the default, and the one for a catalogue.
  - `'fore-edge'`: standing, turned the other way to show its pages.
  - `'front'`: facing the reader, flat, the cover as it is; the light still shows the binding when it moves.
  - `'lying'`: lying on its back, seen from above, its tail toward the reader: a book on a desk.
  - `'lying-turned'`: lying, spun on the surface to show its spine and its tail.

- **`format`**: the proportions of the book, in one field that also carries the orientation.
  - `'auto'`: the proportions of the image, read once it has loaded (a square cover gives a square book); before that, and without an image, 17x24. Pick it when the image already has the true proportions.
  - `'a4'`, `'a5'`, `'b5'`: the ISO formats, portrait. Any other format is `WxH` in centimetres, the order of the two numbers being the orientation: `'17x24'` portrait, `'24x17'` landscape, `'21x21'` square. A fixed format keeps its shape before the image loads and crops small differences of the image.
- **`pages`**: the number of pages, from the catalogue record, which sets how deep the book is against the width of its format (17 cm for `'auto'`). A short book is printed on bulky paper and a long volume on thin paper, so a page goes from 0.1 mm at 1 page to 0.05 mm at 1000 pages and beyond, in proportion: 64 pages make 6 mm, 300 pages 2.5 cm, 1000 pages 5 cm, and an A4 of the same pages looks thinner than a 17x24. A spine under 5 mm carries no text.
- **`binding`**: how the book is built, which shows on its head, its fore edge and its spine.
  - `'paperback'`: cut flush, the cover a hairline on the same edge as the pages, a flat spine.
  - `'hardcover'`: rigid boards about 2.5 mm thick, overhanging a page block set in from them by about 3 mm, the endpapers showing in the gap, a headband, a rounded spine and a hinge groove on the front.
- **`name`**, **`author`**, **`publisher`**: the same names as on `<mds-bibliography>`, so one catalogue record feeds both.
- **The spine**: the title, then the author, at the head, and the publisher at the foot. Where the spine has room for two lines, at least 13.5% as deep as the book is wide (about 23 mm on a 17x24, some 270 pages in paperback), the author goes under the title, smaller, as on a thick volume.
- **`publisher-logo`**: the mark of the publisher, printed instead of its name at the foot of the spine and of a drawn cover (a cover image carries its own). Only its shape is printed, as a mask, in `--mds-book-publisher-color`, which is the colour of the text unless set, so a mark of any colour prints in the ink of the book. Give an svg, or a png on a transparent ground; an image from another origin needs CORS headers, as any mask does. The place stays empty while the mark loads, and the name of the publisher is printed if it fails.
- **Size**: the book is sized as an image is, in the proportions of its format: give it a width, and its height follows; give it a height, and its width follows. With neither, it fills the width of its container, as a block does; where nothing gives it a width (a row of a flex layout) it is 200 px wide. Its box is the front cover at rest: the turned book reaches a little beyond it, by a few percent of its width on each side standing, by up to a third lying spun round, so leave it some room inside a container that clips.


### 2. Examples

Correct and idiomatic ways to use the `<mds-book>` component, ordered from most common to most specialized. The examples assume a working knowledge of the shared component rules in [`docs/agents/conventions.md`](../../../../../../docs/agents/conventions.md).

#### A Book from Its Cover

The canonical form: the cover image and the catalogue data. The title and the author name the book for assistive technologies and are printed on the spine.

```html
<mds-book
  src="/covers/operazioni-straordinarie.webp"
  name="Operazioni straordinarie"
  author="Antonio D'Amico e Sara Orlando"
  publisher="Maggioli Editore"
></mds-book>
```

#### Pages and Binding from the Catalogue Record

Pass the page count and the binding of the record as they are: the book takes its true depth, so a booklet and a large manual do not look alike.

```html
<mds-book src="/covers/guida-rapida.webp" name="Guida rapida al GDPR" pages="64"></mds-book>

<mds-book
  src="/covers/codice-appalti.webp"
  name="Codice dei contratti pubblici"
  pages="1000"
  binding="hardcover"
></mds-book>
```

#### A Catalogue Grid

The book takes the width of its cell. Give the grid some gap: the turned books reach a little beyond their boxes.

```html
<div class="grid grid-cols-4 gap-1200">
  <mds-book src="/covers/1.webp" name="Creare la holding" author="Ennio Vial"></mds-book>
  <mds-book src="/covers/2.webp" name="Chief AI Officer" pages="480"></mds-book>
  <mds-book src="/covers/3.webp" name="Aste immobiliari e vendita forzata"></mds-book>
  <mds-book src="/covers/4.webp" name="Agenda dei servizi demografici 2027"></mds-book>
</div>
```

#### A Pose for the Layout

Pick the pose that suits where the book sits: `spine` in a catalogue, `front` beside a description, `lying` or `lying-turned` for a book on a desk in a hero or a banner.

```html
<mds-book src="/covers/manuale.webp" name="Manuale" pose="front"></mds-book>

<mds-book
  src="/covers/codice-appalti.webp"
  name="Codice dei contratti pubblici"
  binding="hardcover"
  pages="640"
  pose="lying-turned"
></mds-book>
```

#### A Fixed Format

With `format="auto"` (the default) the book takes the proportions of its image once it loads. Set the format when the catalogue knows it, so the book has its shape before the image arrives; write any format as `WxH` in centimetres, the width first.

```html
<mds-book src="/covers/modulistica.webp" name="Modulistica" format="a4"></mds-book>

<mds-book src="/covers/atlante.webp" name="Atlante dei comuni" format="29.7x21"></mds-book>
```

#### A Book Without a Cover Image

Without `src`, the component draws a cover with the title, the author and the publisher. Give it the colour of the series.

```html
<mds-book
  name="Agenda dei servizi demografici 2027"
  publisher="Maggioli Editore"
  style="--mds-book-color: #f2a93b; --mds-book-text-color: #ffffff"
></mds-book>
```

#### The Mark of the Publisher

Give the mark of the publisher instead of printing its name: it goes at the foot of the spine, and of the cover when the component draws it. Its shape is printed in the colour of the text, or in `--mds-book-publisher-color`; keep `publisher`, printed if the mark does not load.

```html
<mds-book
  name="Agenda dei servizi demografici 2027"
  author="Redazione Maggioli"
  publisher="Maggioli Editore"
  publisher-logo="/logos/maggioli-editore.svg"
  style="--mds-book-color: #f2a93b; --mds-book-text-color: #ffffff"
></mds-book>
```

#### A Solid Spine

When the left edge of the cover does not continue well onto the spine (a photo, a thin white border), give the spine and the board edges a colour of their own.

```html
<mds-book
  src="/covers/manuale.webp"
  name="Manuale"
  style="--mds-book-spine-color: #123a6b"
></mds-book>
```

#### A Book That Opens Its Product Page

The book is an image, not a control: wrap it in a link, with the link named by the book. Turning the book with a drag does not open the link; a click does.

```html
<a href="/catalogo/creare-la-holding">
  <mds-book src="/covers/creare-la-holding.webp" name="Creare la holding" author="Ennio Vial"></mds-book>
</a>
```


### 3. Mistakes

Common incorrect uses of `<mds-book>`. Each entry pairs the wrong form with the right one and a one-line reason. System-wide rules (boolean-as-string, shadow piercing, Tailwind color utilities, raw native event listening) live in [`docs/agents/mistakes.md`](../../../../../../docs/agents/mistakes.md) - they apply here too but are not repeated.

#### Do Not Use the `title` Attribute for the Title

`title` is the native tooltip of every element: it shows a tooltip and prints nothing on the book. The title of the book is `name`.

```html
<!-- INCORRECT -->
<mds-book src="/covers/manuale.webp" title="Manuale"></mds-book>

<!-- CORRECT -->
<mds-book src="/covers/manuale.webp" name="Manuale"></mds-book>
```

#### Do Not Draw the 3D With `<mds-img>` and CSS Transforms

A transformed `<mds-img>` is a tilted flat picture: no spine, no pages, no drawn cover when the image fails, no reduced-motion handling.

```html
<!-- INCORRECT -->
<mds-img src="/covers/manuale.webp" alt="Manuale" style="transform: perspective(600px) rotateY(25deg)"></mds-img>

<!-- CORRECT -->
<mds-book src="/covers/manuale.webp" name="Manuale"></mds-book>
```

#### Do Not Turn the Book With a Transform

A transform on the host turns the flat box the book is drawn in: the light on the faces, the shadow and the drag still work from the pose, which no longer matches. Pick a `pose`.

```html
<!-- INCORRECT -->
<mds-book src="/covers/manuale.webp" name="Manuale" style="transform: rotateX(60deg)"></mds-book>

<!-- CORRECT -->
<mds-book src="/covers/manuale.webp" name="Manuale" pose="lying"></mds-book>
```

#### Do Not Set Both a Width and a Height

The book keeps the proportions of its format, as an image does: one dimension sets the other. Two that disagree leave the book as wide as its box and the box with a gap or an overflow.

```html
<!-- INCORRECT -->
<mds-book src="/covers/manuale.webp" name="Manuale" style="width: 220px; height: 220px"></mds-book>

<!-- CORRECT -->
<mds-book src="/covers/manuale.webp" name="Manuale" style="height: 320px"></mds-book>
```

#### Do Not Write a Landscape Format as a Separate Orientation

There is no orientation prop: the order of the two numbers of `format` is the orientation.

```html
<!-- INCORRECT -->
<mds-book name="Atlante" format="a4" orientation="landscape"></mds-book>

<!-- CORRECT -->
<mds-book name="Atlante" format="29.7x21"></mds-book>
```

#### Do Not Repeat the Name Next to the Book for Assistive Technologies

The book is already named after `name` and `author`. A visible caption that repeats them makes screen readers read the title twice: mark the book decorative with `alt=""` when a caption names it.

```html
<!-- INCORRECT -->
<figure>
  <mds-book src="/covers/manuale.webp" name="Manuale"></mds-book>
  <figcaption>Manuale</figcaption>
</figure>

<!-- CORRECT -->
<figure>
  <mds-book src="/covers/manuale.webp" name="Manuale" alt=""></mds-book>
  <figcaption>Manuale</figcaption>
</figure>
```



## Properties

| Property        | Attribute        | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                | Type                                                             | Default       |
| --------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ------------- |
| `alt`           | `alt`            | The accessible name of the book. Without it the name is built from `name` and `author`; an empty `alt` marks the book as decorative, left out by assistive technologies                                                                                                                                                                                                                                                                                    | `string \| undefined`                                            | `undefined`   |
| `author`        | `author`         | The author, printed on the cover drawn when there is no image, above the title, and on the spine after the title, or under it where the spine has room for two lines                                                                                                                                                                                                                                                                                       | `string \| undefined`                                            | `undefined`   |
| `binding`       | `binding`        | How the book is bound: a thin flexible cover flush with the pages, or rigid boards a little larger than the page block, with a rounded spine                                                                                                                                                                                                                                                                                                               | `"hardcover" \| "paperback"`                                     | `'paperback'` |
| `format`        | `format`         | The proportions of the book. `auto` takes them from the image; a named format (`a4`, `a5`, `b5`) is portrait; any other one is `WxH` in centimetres, the order of the two numbers being the orientation (`17x24` portrait, `24x17` landscape, `21x21` square)                                                                                                                                                                                              | `` "a4" \| "a5" \| "auto" \| "b5" \| `${number}x${number}` ``    | `'auto'`      |
| `loading`       | `loading`        | Specifies whether a browser should load the cover immediately or defer it until it is near the viewport                                                                                                                                                                                                                                                                                                                                                    | `"eager" \| "lazy" \| undefined`                                 | `'lazy'`      |
| `name`          | `name`           | The title of the book, printed on the spine and on the cover drawn when there is no image                                                                                                                                                                                                                                                                                                                                                                  | `string \| undefined`                                            | `undefined`   |
| `pages`         | `pages`          | The number of pages, which sets how deep the book is, against the width of its format (17 cm for `auto`). A page is as thick as `--mds-book-page-weight-min` at 1 page, going to `--mds-book-page-weight-max` at 1000 pages and more, in proportion: by default from 0.1 mm, the bulky paper of a short book, to 0.05 mm, the thin paper of a volume, so 64 pages make 6 mm, 300 pages 2.5 cm and 1000 pages 5 cm. A spine under 5 mm deep carries no text | `number`                                                         | `300`         |
| `pose`          | `pose`           | How the book is shown: standing, turned to show its spine (`spine`) or its pages (`fore-edge`), or facing the reader (`front`); lying on its back, seen from above, its tail toward the reader (`lying`) or spun on the surface (`lying-turned`). A drag turns it from there, and it goes back when released                                                                                                                                               | `"fore-edge" \| "front" \| "lying" \| "lying-turned" \| "spine"` | `'spine'`     |
| `publisher`     | `publisher`      | The publisher, printed at the foot of the spine and of the cover drawn when there is no image, unless its `publisher-logo` is printed there instead                                                                                                                                                                                                                                                                                                        | `string \| undefined`                                            | `undefined`   |
| `publisherLogo` | `publisher-logo` | The mark of the publisher, printed instead of its name at the foot of the spine and of the cover drawn when there is no image: the path to an svg, or a png on a transparent ground. Its shape is printed, not its colours, in `--mds-book-publisher-color`. An image from another origin needs CORS headers, as any mask does; one that does not load leaves the name                                                                                     | `string \| undefined`                                            | `undefined`   |
| `src`           | `src`            | Specifies the path to the image of the front cover                                                                                                                                                                                                                                                                                                                                                                                                         | `string \| undefined`                                            | `undefined`   |


## Shadow Parts

| Part      | Description                                   |
| --------- | --------------------------------------------- |
| `"cover"` | The native `<img>` that shows the front cover |


## CSS Custom Properties

| Name                         | Description                                                                                                                                                                  |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--mds-book-color`           | Public, static. The colour of the binding where the cover image cannot continue: the spine and the board edges without an image, and the cover drawn when there is no image. |
| `--mds-book-page-weight-max` | The thickness of a page, in millimetres (a number), on a book of 1000 pages and more: the thin paper of a volume.                                                            |
| `--mds-book-page-weight-min` | The thickness of a page, in millimetres (a number), on a book of 1 page; between 1 and 1000 pages it goes to --mds-book-page-weight-max in proportion.                       |
| `--mds-book-paper-color`     | The colour of the page block.                                                                                                                                                |
| `--mds-book-publisher-color` | Public, static. The colour of the publisher at the foot of the spine and of the cover drawn when there is no image, its mark or its name. Unset, the colour of the text.     |
| `--mds-book-spine-color`     | Public, static. A solid colour for the spine and the board edges. Unset, they continue the edges of the cover image.                                                         |
| `--mds-book-text-color`      | Public, static. The colour of the text on the spine and on the cover drawn when there is no image.                                                                           |


----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
