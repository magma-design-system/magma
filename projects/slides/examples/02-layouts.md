---
title: The seven layouts
author: Magma Design System
theme: maggioli
---

# The seven layouts

One slide per built-in layout, each labelled with the `layout:` it uses.

---
layout: section
title: 1. section
---

---
layout: content
title: 2. content
---

The default layout for body slides.

- Heading from `title:`
- Body from the Markdown below it
- Great for bullet points and prose

---
layout: two-column
title: 3. two-column (with image)
image: https://placehold.co/800x900/00379e/ffffff.png?text=Left+text%0ARight+image
---

With an `image:`, the text sits on the left and the image on the right.

Without an `image:`, the body flows into two text columns instead.

---
layout: quote
---

> Design is not just what it looks like and feels like.
> Design is how it works.

---
layout: image-full
title: 5. image-full
image: https://placehold.co/1280x720/00379e/ffffff.png?text=Full+bleed
---

---
layout: code
title: 6. code
lang: ts
---

```ts
import { parseDeck, exportHtml } from '@maggioli-design-system/slides';

const deck = parseDeck(source);
const html = exportHtml(deck);
```

---
layout: section
title: 7. section (closing)
---
