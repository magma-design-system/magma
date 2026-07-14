# slides SPEC.md

## Purpose

Generates on-brand presentation decks from a constrained, text-based source
(Markdown + frontmatter), built on Magma design tokens and styles. The source is
plain text so it is Git-diff-able and AI-generatable; the output is a
self-contained HTML deck (and PDF) that inherits the Maggioli identity by
construction.

## Source format

One deck = one Markdown file.

- The leading `---...---` block is the **deck frontmatter** (deck-wide config).
- Slides are separated by a line containing exactly `---`.
- A slide may open with its own `---...---` **slide frontmatter** block.

```markdown
---
title: My deck
author: Jane Doe
theme: maggioli
---

# First slide (title layout by default)

---
layout: content
title: Agenda
---

- Point one
- Point two
```

### Parsing rule

The body (after the deck frontmatter) is split on separator lines (`^---$`). Each
resulting block is classified: a block that parses as a non-empty YAML mapping is
the frontmatter of the slide that follows it; every other non-empty block starts
a slide. Edge case: a content block whose first lines look like `key: value`
YAML can be misread as frontmatter - keep prose slides free of a leading
`word: value` line, or give the slide an explicit frontmatter block.

## Frontmatter fields

Deck-level (`DeckConfig`):

| Field    | Type            | Description                                             |
| -------- | --------------- | ------------------------------------------------------- |
| `title`  | string          | Deck title (HTML `<title>` + default title slide).      |
| `author` | string          | Author, shown on the title layout.                      |
| `theme`  | enum            | `maggioli` (light) or `maggioli-dark` (dark).           |
| `layout` | enum            | Default layout for slides that do not set one.          |
| `tokens` | map<string>     | Per-deck `--mds-slide-*` overrides (cascade level 3).   |
| `footer` | object          | Persistent footer defaults (see Footer below).          |

Slide-level (`SlideConfig`):

| Field     | Type            | Description                                             |
| --------- | --------------- | ------------------------------------------------------- |
| `layout`  | enum            | One of the built-in layouts (below).                    |
| `title`   | string          | Heading/title region for the layout.                    |
| `image`   | string          | Image URL/path for `image-full` and `two-column`.       |
| `lang`    | string          | Language hint for the `code` layout.                    |
| `section` | string          | Footer section for this slide onward (sticky).          |
| `footer`  | `false`\|object | `false` hides the footer; an object overrides fields.   |

The full contract lives in `src/schema/deck.schema.json` and is enforced by
`validateDeck()`. It doubles as the contract an LLM writes against.

## Layouts

`title`, `section`, `content`, `two-column`, `quote`, `image-full`, `code`.

- Default when unset: the first slide is `title`, the rest are `content`.
- `two-column`: with `image`, renders text left + image right; without, renders
  the body as two text columns.
- `image-full`: full-bleed `image`, optional `title` as a caption.
- `code`: the body is normally a single fenced code block.

## Theming cascade

Three levels, lowest to highest precedence:

1. **Magma tokens (base)** - the `styles` CSS layers (`--tone-*`, `--variant-*`, ...).
2. **Theme** - `--mds-slide-*` component tokens mapped to Magma tokens
   (`src/theme/tokens.css` + `theme-<name>.css`). Selected via `theme:`.
3. **Per-deck overrides** - the frontmatter `tokens:` map, injected as an inline
   `:root { ... }` block.

Light/dark is **not** re-implemented here: it is Magma's global `--tone-*` flip.
The renderer sets `pref-theme-scheme-light` or `pref-theme-scheme-dark` (plus
`data-magma-pref`) on the root element, so `maggioli` renders light and
`maggioli-dark` renders dark deterministically. Overriding a `--mds-slide-*`
token in terms of a `--tone-*`/`--variant-*` value keeps it correct in both
schemes.

## Footer

A persistent footer can be shown on every slide. Deck-level `footer:` sets the
defaults; a slide overrides any field via its own `footer:` object, or hides the
footer with `footer: false`.

| Field         | Description                                  |
| ------------- | -------------------------------------------- |
| `logo`        | Company logo (URL/path; embedded when local).|
| `group`       | Group/department presenting (bold, left).    |
| `groupDetail` | Longer description under the group (left).   |
| `subject`     | Deck subject (bold, right).                  |
| `section`     | Current section/chapter (right).             |
| `pageNumbers` | Show the automatic page number (default on). |

`section` is **sticky**: a slide that sets it (via `section:` shorthand or
`footer.section`) changes the current section, which carries forward to later
slides until the next change. The page number is the slide's position.

## Local images

Structural images (`image:`) and the footer `logo` may be local paths. On export
they are resolved relative to the deck file's directory and inlined as `data:`
URIs, so HTML and PDF stay self-contained. Remote (`http(s)://`) and `data:`
sources pass through untouched. Set the resolution root with the `baseDir`
option (the CLI uses the deck file's folder automatically).

## Tailwind

Built on the Magma Tailwind v4 theme (`@maggioli-design-system/styles`), so
utilities carry Magma tokens (`bg-variant-primary`, `text-tone-neutral-05`, ...).

- **Layouts (build-time)** - `src/theme/slides.src.css` is authored with `@apply`
  and compiled to `dist/theme/slides.css` via PostCSS. `@reference "tailwindcss"`
  makes utilities available to `@apply` without emitting utilities or preflight,
  so the output is self-contained. Themable values stay as `var(--mds-slide-*)`,
  never Tailwind scale utilities, so the token override cascade keeps working.
- **Author utilities (export-time, opt-in)** - authors may use utility classes in
  a deck. `applyUtilities(html)` runs Tailwind over the rendered HTML and inlines
  only the utilities used. It is opt-in to keep the core dependency-light: the CLI
  and `build-examples` run it by default (`--no-tailwind` to skip); programmatic
  callers invoke `applyUtilities` or pass `{ tailwind: true }` to `exportPdf`.
  Requires `tailwindcss`, `@tailwindcss/postcss`, `postcss` (optional peers).

## Public API

| Export                     | Description                                        |
| -------------------------- | -------------------------------------------------- |
| `parseDeck(md)`            | Markdown+frontmatter -> `Deck`.                    |
| `validateDeck(deck)`       | Validate against the JSON Schema.                  |
| `renderDeck(deck)`         | `Deck` -> HTML fragment (pure, no CSS).            |
| `exportHtml(deck, opts?)`  | `Deck` -> self-contained HTML document.            |
| `exportPdf(deck, opts?)`   | `Deck` -> PDF (`Uint8Array`), one slide per page.  |
| `applyUtilities(html)`     | Inline the author's Tailwind utilities (opt-in).   |

CLI: `magma-slides build <deck.md> [--out f.html] [--pdf f.pdf] [--theme t] [--validate]`.

## Anti-patterns

- Do not hardcode colors/fonts in layout CSS - read `--mds-slide-*` tokens.
- Do not re-implement dark mode - rely on the global `--tone-*` flip.
- Do not edit `dist/` - it is generated by `npm run build`.

## Out of scope (follow-up)

- PPTX export; arbitrary per-slide CSS and custom layouts (`registerLayout`);
  a `-system` theme that follows the OS scheme; font embedding for offline HTML.
