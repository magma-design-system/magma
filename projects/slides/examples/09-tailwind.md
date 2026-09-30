---
title: Tailwind utilities
author: Magma Design System
theme: maggioli
---

# Utility per gli autori

Classi Tailwind (con i token Magma) direttamente nel Markdown - generate solo
se le usi, incorporate nell'HTML.

---
layout: content
title: Una griglia al volo
---

<div class="grid grid-cols-3 gap-6">
  <div class="p-6 rounded-lg bg-accent-emphasis text-accent-on-emphasis">Primo</div>
  <div class="p-6 rounded-lg bg-surface-muted text-fg-default">Secondo</div>
  <div class="p-6 rounded-lg bg-accent-ai-emphasis text-accent-ai-on-emphasis">Terzo</div>
</div>

---
layout: content
title: Enfasi tipografica
---

<p class="text-center italic opacity-70">
  Testo centrato, corsivo e tenue - senza CSS custom, solo utility.
</p>

Le utility valgono i token Magma: <code>bg-accent-emphasis</code> usa lo stesso
ruolo accent del resto del design system.
