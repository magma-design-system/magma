# @maggioli-design-system/slides

Generate on-brand presentation decks from **Markdown + frontmatter**, built on
[Magma](https://github.com/magma-design-system/magma) design tokens and styles.

Write content, not boxes: author a deck as plain text and get Maggioli branding,
colors and typography applied automatically. Because the source is Markdown with
a documented schema, decks are Git-diff-able and straightforward to generate with
AI.

> First increment (issue #562): 7 built-in layouts, the `business` theme with
> light/dark and an optional header/footer, and HTML + PDF export. PPTX and deeper customization are planned.

## Install

```bash
npm install @maggioli-design-system/slides
```

`@maggioli-design-system/styles` is a peer dependency (it provides the design
tokens the themes read).

## Quick start

Write a deck (`deck.md`):

```markdown
---
title: My deck
author: Jane Doe
theme: business
---

# Hello

---
layout: content
title: Agenda
---

- One
- Two
```

### CLI

```bash
npx magma-slides build deck.md --out deck.html --pdf deck.pdf
```

### Programmatic API

```ts
import { parseDeck, validateDeck, exportHtml, exportPdf } from '@maggioli-design-system/slides';
import { readFileSync, writeFileSync } from 'node:fs';

const deck = parseDeck(readFileSync('deck.md', 'utf8'));

const { valid, errors } = validateDeck(deck);
if (!valid) console.warn(errors);

writeFileSync('deck.html', exportHtml(deck));
writeFileSync('deck.pdf', await exportPdf(deck));
```

| Export                    | Description                                       |
| ------------------------- | ------------------------------------------------- |
| `parseDeck(md)`           | Markdown + frontmatter -> `Deck`.                 |
| `validateDeck(deck)`      | Validate the deck against the JSON Schema.        |
| `renderDeck(deck)`        | `Deck` -> HTML fragment (pure, no CSS/`<html>`).  |
| `exportHtml(deck, opts?)` | `Deck` -> self-contained HTML document.           |
| `exportPdf(deck, opts?)`  | `Deck` -> PDF (`Uint8Array`), one slide per page. |

## Layouts

`title`, `section`, `content`, `two-column`, `quote`, `image-full`, `code`.
Select per slide via `layout:`. See [SPEC.md](./SPEC.md) for each layout's fields.

## Theming

Three-level cascade: Magma tokens -> theme (`--mds-slide-*`) -> per-deck
overrides. Pick a theme with `theme:` (default `business`, named as the Magma
theme it pairs with) and the scheme with `scheme: light | dark`, then tweak any
token per deck without touching CSS:

```markdown
---
theme: business
scheme: dark
tokens:
  --mds-slide-accent: rgb(var(--magma-accent-ai-emphasis))
  --mds-slide-font-heading: Karla
---
```

Overrides expressed against the Magma semantic layer (`--magma-*`) stay correct
in both light and dark. Full details in [SPEC.md](./SPEC.md).

## Header and footer

Both are optional. The deck supplies the content and turns the zones on; the
theme decides where each element goes:

```markdown
---
header: true
footer: true
logo: images/logo.svg
group: Consorzio Maggioli
subject: Magma Design System
section: Introduzione
---
```

A slide overrides any field, changes the sticky `section`, or forces a zone with
`header: false` / `footer: true`. Placement lives in the theme's `theme.json`
(see [SPEC.md](./SPEC.md#chrome-header-and-footer)).

## Tailwind

The built-in layouts are authored with Tailwind `@apply` (compiled to a static
stylesheet at build), and authors can use **Tailwind utility classes** directly
in a deck - with Magma tokens baked in:

```markdown
<div class="grid grid-cols-3 gap-6">
  <div class="p-6 rounded-lg bg-accent-emphasis text-accent-on-emphasis">One</div>
  <div class="p-6 rounded-lg bg-surface-muted text-fg-default">Two</div>
</div>
```

Utilities are generated only if you use them and inlined into the deck. The pass
is opt-in: the CLI and `build-examples` run it by default (`--no-tailwind` to
skip); programmatically, call `applyUtilities(exportHtml(deck))` or pass
`{ tailwind: true }` to `exportPdf`. It needs `tailwindcss`, `@tailwindcss/postcss`
and `postcss` (optional peer deps).

## Develop

Internal operations go through Nx (run from the repo root):

```bash
nx run slides:dev              # live dev server: render a deck, reload on every change
nx run slides:build            # tsc + build CSS + copy CSS/schema assets to dist/
nx run slides:build-css        # compile src/theme/slides.src.css -> dist/theme/slides.css
nx run slides:build-examples   # export every examples/*.md to dist/examples/
nx run slides:test             # vitest
nx run slides:lint             # eslint (add lint:fix to autofix)
```

### Live dev server

```bash
nx run slides:dev                    # http://localhost:5178
nx run slides:dev -- --port 4000     # custom port
```

Open the printed URL and pick a deck with `?deck=<path-relative-to-examples>`
(e.g. `http://localhost:5178/?deck=magma/deck.md`); it defaults to the first
deck. It reloads on any change to Markdown, render/parser logic (`src/**/*.ts`),
theme CSS, or `slides.src.css` - no manual rebuild. Use it to iterate; the final
artifacts still come from `build-examples`.

### Building examples

`build-examples` writes HTML; append `-- --pdf` to also emit PDFs:
`nx run slides:build-examples -- --pdf`. Output lands in `dist/examples/`,
preserving the folder structure of [`examples/`](./examples), which has decks for
every layout, both schemes, header and footer, token overrides, Markdown features and edge cases.

## License

ISC
