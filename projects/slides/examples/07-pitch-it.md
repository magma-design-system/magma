---
title: Magma Slides
author: Maggioli Design System
theme: maggioli
---

# Magma Slides

Presentazioni on-brand a partire dal testo.

---
layout: section
title: Il problema
---

---
layout: content
title: Oggi le slide si fanno cosi
---

- Si parte da un file PowerPoint vuoto
- Si riapplicano a mano colori, font e loghi
- Ogni deck diverge un po' dal design system
- Il contenuto passa in secondo piano rispetto all'impaginazione

---
layout: quote
---

> Il tempo speso a spostare caselle di testo e tempo tolto al contenuto.

---
layout: section
title: La proposta
---

---
layout: two-column
title: Scrivi il contenuto, non le caselle
image: https://placehold.co/800x900/00379e/ffffff.png?text=Markdown
---

Un deck e un file Markdown con un po' di frontmatter.

I token Magma vengono applicati in automatico: colori, tipografia e spaziature
sono quelli del design system, senza lavoro manuale.

---
layout: content
title: Perche testo
---

- **Versionabile**: sta in Git come qualsiasi sorgente
- **Rivedibile**: le differenze si leggono in una pull request
- **Generabile con l'AI**: uno schema documentato fa da contratto
- **Coerente per costruzione**: e Magma, sempre

---
layout: content
title: Come si usa
---

1. Scrivi `deck.md`
2. Scegli un tema e, se serve, ritocca qualche token
3. Esporta in HTML o PDF

```bash
npx magma-slides build deck.md --out deck.html --pdf deck.pdf
```

---
layout: section
title: Grazie
---
