---
theme: maggioli
---

# Edge cases

This deck has no `title:` in the deck frontmatter (it is optional), and the
first slide still defaults to the `title` layout.

---

A slide with no frontmatter at all: it just defaults to `content`.

---
layout: section
title: An empty section divider
---

---
layout: section
title: ...followed immediately by another
---

The two dividers above have no body - each renders as a standalone section
slide.

---
layout: content
title: Prose that looks like frontmatter
---

<!-- Keep a colon-first line out of the very top of a slide body: a leading
     "Word: value" line can be misread as frontmatter. Put a heading or
     sentence first, as done here. -->

Ratio: 16 to 9 is safe here because it is not the first line of the slide.

---
layout: content
title: Horizontal rules
---

Inside a slide, use `***` for a horizontal rule - a bare `---` line is the
slide separator, not an `<hr>`.

***

Text after the rule.
