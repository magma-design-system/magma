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
theme: business
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
| `theme`  | enum            | Slide theme, named as its Magma theme. Default `business`. |
| `scheme` | enum            | `light` (default) or `dark`. Independent of `theme`.    |
| `layout` | enum            | Default layout for slides that do not set one.          |
| `tokens` | map<string>     | Per-deck `--mds-slide-*` overrides (cascade level 3).   |
| `header` | boolean         | Show the header zone (default false). See Chrome below. |
| `footer` | boolean         | Show the footer zone (default false). See Chrome below. |
| chrome content | string    | `logo`, `group`, `groupDetail`, `subject`, `section`, `pageNumbers` (see Chrome). |

Slide-level (`SlideConfig`):

| Field     | Type            | Description                                             |
| --------- | --------------- | ------------------------------------------------------- |
| `layout`  | enum            | One of the built-in layouts (below).                    |
| `title`   | string          | Heading/title region for the layout.                    |
| `image`   | string          | Image URL/path for `image-full` and `two-column`.       |
| `lang`    | string          | Language hint for the `code` layout.                    |
| `header`  | boolean         | Force the header on/off here, over the layout default.  |
| `footer`  | boolean         | Force the footer on/off here, over the layout default.  |
| chrome content | string     | Any chrome content field overrides the deck's here; `section` is sticky. |

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

1. **Magma tokens (base)** - the `styles` CSS layers, consumed through the semantic
   layer (`--magma-surface-*`, `--magma-text-*`, `--magma-accent-*`, ...).
2. **Theme** - `--mds-slide-*` component tokens mapped to Magma roles
   (`src/theme/tokens.css` + `themes/<name>/theme.css`). Selected via `theme:`.
3. **Per-deck overrides** - the frontmatter `tokens:` map, injected as an inline
   `:root { ... }` block.

### Theme axes

A slide theme reuses Magma's theme axes instead of inventing its own; each is an
independent frontmatter field set on the root element by the renderer:

| Field    | Magma axis            | Root element                          |
| -------- | --------------------- | ------------------------------------- |
| `theme`  | named theme (colors)  | `data-theme-name="<theme>"`           |
| `scheme` | light / dark          | `pref-theme-scheme-light` / `-dark`   |

The slide theme folder (`src/theme/themes/<name>/`) carries the same name as the
Magma theme and holds only what Magma does not own: brand refinements
(`theme.css`), an optional default `logo`, and the chrome placement
(`theme.json`). A theme the package does not ship falls back to `business`.

Light/dark is **not** re-implemented here: it is Magma's semantic-layer flip,
deterministic per deck (`data-magma-pref` opts out of the OS preference).
Overriding a `--mds-slide-*`
token in terms of a `--magma-*` role keeps it correct in both schemes. Do not
override with raw ramp steps (`--tone-*-NN`): their index is mode-relative, so
a step that reads well in light can invert in dark.

## Chrome (header and footer)

Two optional zones frame the slide content: `header` and `footer`. The rule is
**the deck supplies content, the theme decides placement**: a deck never says
where an element goes, so it cannot come out off-brand (and an LLM only fills
data from a closed list of fields).

Content fields (deck-level defaults; a slide may override any of them):

| Field         | Element       | Description                                    |
| ------------- | ------------- | ---------------------------------------------- |
| `logo`        | `logo`        | Company logo (URL/path; embedded when local). Falls back to the theme logo. |
| `group`       | `group`       | Group/department presenting (strong).          |
| `groupDetail` | `groupDetail` | Longer description of the group (muted).       |
| `subject`     | `subject`     | Deck subject (strong).                         |
| `section`     | `section`     | Current section/chapter (muted). Sticky.       |
| `pageNumbers` | `page`        | Show the automatic page number (default true). |

`section` is **sticky**: a slide that sets it changes the current section, which
carries forward to later slides until the next change. The deck's `section` is
the starting value. The page number is the slide's position.

Visibility, highest precedence first:

1. the slide's own `header:` / `footer:` (`true` or `false`);
2. the theme's per-layout default (`theme.json` `layouts`; it can only hide);
3. the deck's `header:` / `footer:` (default `false`).

A zone the theme does not place never renders, and neither does a zone whose
elements are all empty.

### Placement (`theme.json`)

Each zone has a `start` and an `end` slot, an ordered list of elements; a nested
list stacks elements vertically. The `business` theme:

```json
{
  "header": { "start": ["logo"], "end": [["subject", "section"]] },
  "footer": { "start": [["group", "groupDetail"]], "end": ["page"] },
  "layouts": {
    "title": { "header": false },
    "section": { "header": false, "footer": false },
    "image-full": { "header": false }
  }
}
```

## Local images

Structural images (`image:`) and the chrome `logo` may be local paths. On export
they are resolved relative to the deck file's directory and inlined as `data:`
URIs, so HTML and PDF stay self-contained. Remote (`http(s)://`) and `data:`
sources pass through untouched. Set the resolution root with the `baseDir`
option (the CLI uses the deck file's folder automatically).

## Tailwind

Built on the Magma Tailwind v4 theme (`@maggioli-design-system/styles`), so
utilities carry Magma semantic roles through the `styles/dist/tailwind/semantic.css`
bridge (`bg-accent-emphasis`, `text-fg-muted`, `bg-surface-muted`, ...).

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

CLI: `magma-slides build <deck.md> [--out f.html] [--pdf f.pdf] [--theme t] [--scheme light|dark] [--validate]`.

## Anti-patterns

- Do not hardcode colors/fonts in layout CSS - read `--mds-slide-*` tokens.
- Do not re-implement dark mode - rely on the semantic-layer flip.
- Do not read `--tone-*` / `--variant-*` primitives in layout or theme CSS - use
  `--magma-*` roles (`src/theme/tokens.css` maps them to `--mds-slide-*`).
- Do not edit `dist/` - it is generated by `npm run build`.

## Out of scope (follow-up)

- PPTX export; arbitrary per-slide CSS and custom layouts (`registerLayout`);
  a `scheme: system` that follows the OS scheme; font embedding for offline HTML;
  the `editorial` theme (needs its Magma colors, #692) and the shape axis
  (`data-corner-shape`).
