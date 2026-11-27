# Languages

The languages the studio speaks, where the person chooses one, and how a text of the studio is
written.

Addresses: none of their own. The language is a preference of the person, in the menu at the end
of the bar, on every page.

The studio speaks English and Italian (#1336). The menu at the end of the bar, at every width,
holds the preferences of the person: the language first, the one people asked for, then the mode,
the contrast and the animations, the `mds-pref-*` of Magma in an `mds-pref` with `live-language`.
On a window narrower than the `tablet` breakpoint, where the bar hides the rest, the menu holds
it above the preferences (`src/style.css`, held to `screen.tablet.min` by `test/shell.test.mts`).
No theme (the studio edits themes, it does not wear one) and no consumption.

- **Where the language lives**: `<html lang>`, which `mds-pref-language` writes and every Magma
  component follows. The studio follows it at once (`useLang` of `src/shared/i18n/i18n.ts`), so a
  change of language needs no reload, and `live-language` tells `mds-pref` so. The first language is
  the one the person chose, else Italian on a browser in Italian, else English (`startLanguage`):
  the page ships `lang="en"`, which `mds-pref-language` reads before the browser. A stored language
  the studio has no texts for is dropped: the Storybook, on the same origin, may have stored `es`.
- **How a text is written**: in English where it is used, in `t('...')`; the Italian catalogue
  (`src/shared/i18n/i18n-it.ts`) maps the English, and a page of `src/features/` keeps the Italian
  of its own texts beside it (`i18n-it.ts`), handed to `useT` and looked up first. A text kept in data is marked `msg('...')` and
  translated where it is drawn, a count takes `plural()`, and a sentence with a link inside it takes
  `rich()`, translated whole so Italian orders its own words. `test/i18n.test.mts` reads the sources
  and fails on a text with no Italian, an Italian text no source uses, placeholders that differ and
  a text of the interface written outside `t()`, and on a text of a page of `features/` found in
  another page's catalogue. The tests of the pages run in English, and each page of `features/`
  in Italian once. The test reads every source as TSX, so a generic arrow, `const f = <T>(x: T) =>`,
  reads as markup there: write it as a `function`.
- **Components that read their text once**: `mds-button` and `mds-badge` copy the text of their
  slot into their `label` once, so the studio writes their text in `label`; `mds-input-switch` and
  `mds-input-range` read theirs once into the name of their control, so one that holds a translated
  text is keyed by the language and mounts again when it changes (the same test checks both).
- **The previews**: `hero.html`, `scene.html` and `groups.html` are sample pages written in English.
  `applyFrame` writes the language of the studio on their `<html>`, which their Magma components
  follow, puts the Italian of their texts in place of the English and follows a change of language
  at once (`src/shared/frames/i18n-previews.ts`, `src/shared/frames/i18n-it-previews.ts`, held to
  the pages by `test/i18n-previews.test.mts`). The names of the components and the values of their
  API (a variant, a tone, a role) stay as Magma writes them, and so do proper names.
- **The words**: the studio speaks to the person with "tu", as the Italian of Magma does. The words
  that come back on every page keep one form, in English and in Italian: the taxonomy register
  of [`GLOSSARY.md`](../GLOSSARY.md) (agreed with vittorio on 2026-11-10, renamed on 2026-11-20 for
  the redesign of [`studio.object-model.md`](../studio.object-model.md); until it lands the pages
  keep the names the register lists as the interface of today).
