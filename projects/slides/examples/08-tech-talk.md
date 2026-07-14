---
title: A text-first slide pipeline
author: Magma Design System
theme: maggioli-dark
tokens:
  --mds-slide-accent: rgb(var(--variant-secondary))
---

# A text-first slide pipeline

How Markdown becomes an on-brand deck.

---
layout: content
title: The pipeline in four steps
---

1. **Parse** - Markdown + frontmatter to a `Deck` model
2. **Validate** - check the frontmatter against a JSON Schema
3. **Render** - a `<section>` per slide, using the chosen layout
4. **Export** - self-contained HTML, and PDF via headless Chromium

---
layout: two-column
title: The theming cascade
---

Three levels, lowest to highest precedence:

1. Magma design tokens
2. The theme's `--mds-slide-*` tokens
3. Per-deck `tokens:` overrides

Light/dark is the global `--tone-*` flip, not per-slide CSS.

---
layout: code
title: Parsing
lang: ts
---

```ts
import matter from 'gray-matter';
import { marked } from 'marked';

const { data, content } = matter(source);
const blocks = content.split(/^\s*---\s*$/m);
```

---
layout: code
title: Rendering a slide
lang: ts
---

```ts
export function renderSlide(slide, deck) {
  const inner = getLayout(slide.layout)(slide, deck);
  return `<section class="mds-slide" data-layout="${slide.layout}">${inner}</section>`;
}
```

---
layout: content
title: Export targets
---

- **HTML** - one file, all CSS inlined, arrow-key navigation
- **PDF** - one slide per page at 1280x720
- PPTX is planned for a later increment

---
layout: quote
---

> Generate Markdown, not a binary format - reviewable, diffable, and easy for
> a model to produce.

---
layout: section
title: Questions?
---
