---
title: Markdown features
author: Magma Design System
theme: maggioli
---

# Markdown features

What the renderer understands (GitHub-flavored Markdown via `marked`).

---
layout: content
title: Text and inline
---

Paragraphs with **bold**, *italic*, `inline code`, and
[links](https://sli.dev).

You can mix them: a **bold [link](https://example.com)** works fine.

---
layout: content
title: Lists, including nested
---

1. First
2. Second
   - nested bullet
   - another one
3. Third

- [x] Task done
- [ ] Task pending

---
layout: content
title: Tables
---

| Layout      | Best for            |
| ----------- | ------------------- |
| title       | Cover slide         |
| content     | Bullets and prose   |
| two-column  | Text plus an image  |
| code        | A single snippet    |

> Note: tables render but are unstyled in this first increment - a good
> candidate for a future theme refinement.

---
layout: code
title: Fenced code block
lang: bash
---

```bash
npx magma-slides build deck.md --out deck.html --pdf deck.pdf
```
