---
title: Token overrides
author: Magma Design System
theme: business
tokens:
  --mds-slide-accent: rgb(var(--magma-accent-ai-emphasis))
  --mds-slide-heading-fg: rgb(var(--magma-accent-ai-fg))
  --mds-slide-font-body: Roboto, system-ui, sans-serif
  --mds-slide-title-size: 6.5rem
---

# Tuned per deck

Level 3 of the theming cascade: override any `--mds-slide-*` token in the
deck frontmatter, no CSS file required.

---
layout: content
title: What changed here
---

- Accent and headings now use the AI accent (`--magma-accent-ai-*`)
- Body font switched to Roboto
- Title size bumped to `6.5rem`

Because overrides are expressed against semantic roles (`--magma-accent-ai-*`), they
stay correct if you also switch to `scheme: dark`.

---
layout: section
title: Still on-brand
---
