# studio

The studio of Magma: whoever installs Magma defines a theme from a UI, honest about contrast and
aware of every axis Magma has (epic #693). It is an app of this repository, not a package: it is
not published on npm.

```bash
nx run studio:serve       # the dev server, on http://localhost:5177 (builds the components first)
nx run studio:build       # the static app, in dist/
nx run studio:build.site  # the site for a static host, in dist-site/: the app and the Magma it loads
nx run studio:test        # Vitest, jsdom; the static site in the Playwright Chromium
```

The port is pinned (`strictPort`): when 5177 is busy the studio is already running, so the server
stops instead of opening a second instance on another port.

## The shell

The bar of the studio follows the app-shell block of Magma (the logo, "Magma Studio" and under it
the version of the Magma it runs on, which `vendor.ts` writes into the page) and holds three
sections, in the order of the work (#693, decided 2026-11-05):

| Section | Pages | What it is |
| --- | --- | --- |
| **Colors** (a menu) | Palette, Contrast scales, Semantic surface, Themes, Groups, then Contrast check and Diffs | the tokens playground that used to live in `design-tokens` (#695), one page per view; the menu opens with the verdict of the contrast gate on the configuration being edited, and the button of the section counts the pairs that fail it (#698) |
| **Theme** | one page | the theme on a scene of a product in an iframe, the whole section, and a bar at the bottom: the theme to show, one button per axis (typography, shape, density, depth, the preferences of the person, dimension), then the ruler of the preview (the view and the width of the frame) |
| **Behavior** (a menu) | Design language, Patterns, Blocks | what Magma decided and the layer of a product, read-only; placeholders until their turn (#693, "The plan") |

Before them comes the **Start page** (`#/start`, below): a start with no address opens it, and
the name of the studio at the start of the bar links to it.

Every page is a link with an address in the hash (`#/colors/palette`, `#/theme`,
`#/behavior/patterns`, `src/routes.ts`), so the studio works from whatever folder serves it. The
Theme section may name the theme and the mode it opens on, `#/theme/editorial/dark`, and its
address follows the choices made there, replaced in place, so a reload or a link shows the same
theme in the same mode. The
Colors pages stay mounted under the other sections, so their work is not lost; each opens with the
head of the page-header block, the first thing of the region that scrolls (it scrolls with the
page, and beside the list of the Palette it heads the larger column): the title with the verdict
of the contrast gate beside it, one line, then the actions: Reset, in view since it is the only
one left, and Save, last, when a command serves the studio. Under 380 px of the head (on a phone)
the actions stack at the full width, as `actions/stacked` has them, Save at the bottom. What brings a configuration in and takes it out is not an action of a page but the
**Config** menu of the bar, after the sections (`src/config-menu.tsx`): the actions are the App's,
which holds the configuration, and the bar draws them, in its dropdown and in the menu of a narrow
window, each with the format it reads or hands over in a badge.

The Theme section shows the scene (`scene.html`) in an iframe, a document of its own: the theme is
set on its `<html>` (`data-theme-name`), and so are the preferences of the person, as the
`mds-pref-*` of Magma write them. Both move the scene and leave the studio alone (#695, "The
dogfooding constraint"). An axis of the bar opens its controls in an `mds-dropdown` from its
button, and the bar shows only the axes with controls: today the preferences, the others come back
with theirs (#696).
Their dropdown holds controls of the studio, not the `mds-pref-*` themselves, which would write on
the document of the studio: every choice is written on the `<html>` of every frame, the mode and
the contrast by `applyFrame`, the animations and the consumption by `applyPrefs`
(`src/scene-prefs.tsx`), as the components write them. The scene holds no `mds-pref-*` of its own:
it would keep its choice in the storage of the origin, which the frames share with the studio's own
preferences (#1336, "Languages" below). Their modes, words and defaults are those of the components
(`test/scene-prefs.test.mts` holds them to the sources).

The select offers the themes of the configuration being edited, the ones the Themes page lists
(each tint with a surface, the base first), and the frame paints them: the studio writes into it,
over the stylesheets of the installed Magma, the palette of the configuration and the block of
each theme, printed by the code that writes the files Magma ships (`colors-rgb.css` and
`themes.css`, `src/scene-css.ts`). So `porcelain` is a theme of the bundled configuration though
Magma ships none by that name. The choices made on the Themes page, the name of a theme, the
accents it repoints and the colour modes it is used in, are the studio's (`src/theme-choices.ts`):
the frame paints the themes as that page exports them, and a theme of one mode is seen in that
mode only, the other modes of the preferences off and `pref-theme-scheme-<mode>` on the frame, as
mds-pref-theme writes it. They are kept in the storage of the studio beside the draft, so a reload
keeps them, until the configuration keeps the themes itself (#694).

What the theme is checked under, not what is edited (#697), opens from the same bar, so the frame
takes the whole section (2026-11-06): the mode (light, dark, or both side by side, two frames that
scroll together) and the contrast head the dropdown of the preferences of the person; the ruler
opens the preview, the view (Scenes or Groups, below) and the width of the frame (the room of the
section, or a breakpoint of Magma, `--breakpoint-desktop`, `-tablet`, `-mobile`, where its layouts
change). The mode and the contrast are not exported: the studio writes them on the `<html>` of
each frame as the preferences of Magma do (`applyFrame`), and the panel of the scene has neither,
since a mode stored in the origin would bring the two frames to the same one.

The scene is a demo of the components, as the one of the daisyUI theme generator (#697, Scenes):
the desk of an office of a back office, one card per task side by side in columns, so a theme is
judged on most of Magma at once: a hue on a themed surface, text at every prominence, borders, a
disabled state, the solid fills of the main actions, the colours of the states. The steps of the
request in hand take the width of the page above the columns: `mds-stepper-bar` centres the
current step and would push the first out of a column. Its bar is the `inline` appearance of
`mds-header`, a box of the page under the bar of the studio, so the two never read as one; its
words are written in English and shown in the language of the studio ("Languages" below).

The Groups view (`groups.html`) shows the components by their role in the composition, the
vocabulary of the dimension axis, so the preview explains the controls beside it: `container`
(card, banner, accordion, table, dropdown, tooltip, the window of a dialog), `control` (button,
input, select, textarea, tab) and `marker` (checkbox, switch, badge, chip, label, avatar, dot).
The groups and their members are those of the draft of the axis (#691,
`projects/styles/draft/theme-dimension-design.md`, section 3, on `691-dimension-axis-draft`) until
the axis lands. Each component is shown at every variant, tone and state it publishes
(`magma.api.txt`), the brand buttons aside, with the surfaces, the text at every prominence and the
borders at every level. Two things it does not draw on load: the focus ring, since a frame that
took the focus would take it from the studio (Tab into the frame to see it), and an open modal,
which would cover the frame (its window stands for it). The avatars carry an icon: initials pick
the colour of the person and override the variant.

The **Themes** page shows each theme on the canvas of Semantic surface (`SurfaceCanvas`), the light
mode over the dark one, each with the accents of the theme, and names each theme apart from the
family it is drawn from: `editorial` is drawn
from `bisque`. A theme can be drawn from a family of any group, one created in the studio
included, except `status` (`RESERVED_GROUPS` of `src/surfaces.tsx`): its families always generate
surfaces, so that banners, toasts and badges get a text role legible on their own tint, but a theme
in a status colour would mix with the messages that colour carries; Semantic surface lists them in
a row of their own, under the others, and says so. The names of the themes Magma ships (`semantic.config.ts`, `themes`) are reserved,
the deprecated ones included, so a theme of a product never takes one, and a name is lowercase
words joined by hyphens (`THEME_NAME` of `semantic.model.ts`). Under its accents a theme says the
colour modes it can be used in, the `color.modes` of a theme file (#1274): light and dark, the
default, light only or dark only; the mode it does not offer stays in view, dimmed.

## Languages

The studio speaks English and Italian (#1336). The menu at the end of the bar, at every width,
holds the preferences of the person: the language first, the one people asked for, then the mode,
the contrast and the animations, the `mds-pref-*` of Magma in an `mds-pref` with `live-language`.
On a window narrower than the `tablet` breakpoint, where the bar hides its sections, the menu holds
them above the preferences (`src/style.css`, held to `screen.tablet.min` by `test/shell.test.mts`).
No theme (the studio edits themes, it does not wear one) and no consumption.

- **Where the language lives**: `<html lang>`, which `mds-pref-language` writes and every Magma
  component follows. The studio follows it at once (`useLang` of `src/i18n.ts`), so a change of
  language needs no reload, and `live-language` tells `mds-pref` so. The first language is the one
  the person chose, else Italian on a browser in Italian, else English (`startLanguage`): the page
  ships `lang="en"`, which `mds-pref-language` reads before the browser. A stored language the
  studio has no texts for is dropped: the Storybook, on the same origin, may have stored `es`.
- **How a text is written**: in English where it is used, in `t('...')`; the Italian catalogue
  (`src/i18n-it.ts`) maps the English. A text kept in data is marked `msg('...')` and translated
  where it is drawn, a count takes `plural()`, and a sentence with a link inside it takes `rich()`,
  translated whole so Italian orders its own words. `test/i18n.test.mts` reads the sources and
  fails on a text with no Italian, an Italian text no source uses, placeholders that differ and a
  text of the interface written outside `t()`. The tests of the pages run in English.
- **Components that read their text once**: `mds-button` and `mds-badge` copy the text of their
  slot into their `label` once, so the studio writes their text in `label`; `mds-input-switch` and
  `mds-input-range` read theirs once into the name of their control, so one that holds a translated
  text is keyed by the language and mounts again when it changes (the same test checks both).
- **The previews**: `hero.html`, `scene.html` and `groups.html` are sample pages written in English.
  `applyFrame` writes the language of the studio on their `<html>`, which their Magma components
  follow, puts the Italian of their texts in place of the English and follows a change of language
  at once (`src/i18n-previews.ts`, `src/i18n-it-previews.ts`, held to the pages by
  `test/i18n-previews.test.mts`). The names of the components and the values of their API (a
  variant, a tone, a role) stay as Magma writes them, and so do proper names.
- **The words**: the studio speaks to the person with "tu", as the Italian of Magma does. The words
  that come back on every page keep one form (agreed with vittorio, 2026-11-10):

| English | Italian |
| --- | --- |
| Colors, Theme, Behavior, Config | Colori, Tema, Regole, Configurazione |
| target, floor | obiettivo, soglia |
| contrast gate, pair | verifica del contrasto, coppia |
| ramp, step, family, group | rampa, gradino, famiglia, gruppo |
| role, surface, border, accent, tint | ruolo, superficie, bordo, accento, tinta |
| hue, hue shift, lightness | tonalità, spostamento di tonalità, luminosità |
| mode, light, dark | modalità, chiaro, scuro |
| draft, preview, scene | bozza, anteprima, scena |
| the configuration Magma builds with | la configurazione con cui si compila Magma |
| known offender | eccezione nota |

Behavior is Regole, not Comportamento: its pages are rules (of composition, patterns, blocks), and
Comportamento beside Configurazione does not fit the bar at its narrowest width with sections.

## The Start page

The first page of the studio (`src/start.tsx`) is an introduction, not a tool: it says what the
studio is for, the steps of the work and what each section changes, in three parts:

- **the hero**: what the studio is for and what it offers (`FEATURES`, each line with its source
  in the code, an `mds-list`), on a band of the accent, beside a short play. A banner of a product
  (`hero.html`, an `mds-banner` of a back office with its text, its icon and its actions) in an
  iframe its own size is painted with the configuration Magma builds with, drawn pale at two
  levels: its text targets (`theme.text`, the balances of Semantic surface) lowered under every
  floor of the contrast gate (`POOR_TARGETS`, 45, 30, 22 and 15 against the floors 75, 75, 45 and
  30), and the ramp of its accent family faded (`PALE_RAMP`, its contrast ratios at 0.6 of
  themselves, a scale of the configuration). Three trays on the default surface come out from
  behind the banner, one at a time, with a light elastic movement: over it, the problem; under it,
  the fix, while the targets and the ramp come back to those of Magma in eight steps; then a
  smaller tray that says the issues are fixed, with **Replay**. The fix shows three indicators,
  Texts, Icons and Actions, each the pair of the gate that holds what the banner paints (`CHECKS`,
  the source of each beside it), and an `mds-progress` of the pairs brought back over their floor
  (`solved`), red while every indicator is under its floor, yellow once one meets it, green when
  the gate passes (`tone`). Each step runs what an edit on the pages of Colors runs
  (`src/start-demo.ts`), so nothing the play shows is drawn by hand; the last step is the
  committed configuration, untouched. The play runs once, in under five seconds (`PLAY_MS`), so
  it needs no pause (WCAG 2.2.2); Replay plays it again and gets the focus back at the end. The
  banner stays where it is, the room of its trays kept, so the band never changes height. Its
  figures are hidden from assistive technologies, the trays back behind the banner are `inert`,
  and a caption hidden from the eye says what the play shows. With less motion asked
  (`prefers-reduced-motion`) the play does not run by itself and the trays do not move. The
  elastic is a `linear()` curve of `start.css`, a light bounce beside it to compare
  (`--start-ease-tray`); the banner is a document of its own (`applyFrame`), its height read by
  the hero, which CSS cannot give an iframe;
- **the steps of the work**: start from a configuration (the first step offers to continue on the
  page of Colors the draft was on, else it opens the palette), change it at its level, keep the
  gate green, judge it on a product and take it;
- **the levels**, from the finest to the broadest, each built on the one before: Colour (Palette,
  Contrast scales, Groups), Role (Semantic surface), Theme (Themes), Product (the Theme section),
  Composition (Behavior), each with what a change acts on, what it reaches and its pages; the
  checks (Contrast check, Diffs) in the line under them. `test/start.test.mts` holds every page of
  the bar to a link of the page, so a new page needs its level.

## The pages in Magma

Every page is written with the components of Magma (#695): the controls of a form go through the
bridges of `src/magma.tsx` (`Field`, `TextInput`, `Select`, `Check`, `Range`), which hand back
the next value as a native control of Preact does and never the echo of a value the page set (the
change events of `mds-input`, `mds-input-select` and `mds-input-range` leave on that too). A value
the page parses or sorts (a name, a stop of a scale, a list of export groups) takes
`commit="leave"`: it is handed back on Enter or on leaving the field, as the change of a native
input, not at every key. Dialogs are an `mds-modal` with an `mds-banner` window, the main action
last; destructive actions sit in the menu of their item.

Each page keeps its rules in the sheet beside its module (`palette.css`, `scales.css`, ...),
from the tokens only: spaces from the rhythm, widths from the widths, colours from the semantic
roles, a length with no relation a step of `--spacing`. `style.css` holds the frame: the shell,
the Theme section and the frame of the pages of Colors; the document is the one of Magma.

Four pieces Magma does not have yet stay native, painted with the tokens, each marked in the code
with its issue until the component lands:

| Piece | Where | Issue |
| --- | --- | --- |
| a colour field | the base colour of a family, New color | #1260 |
| a range of several values | the axis of a contrast scale | #1261 |
| a list and its detail | the families of the Palette (each an `mds-button`, its swatch the icon `mdi/circle` painted through `::part(icon)`) | #1262 |
| a chip with a colour swatch | the families of Semantic surface (the usage of a scale draws the swatch as the icon of an `mds-chip`, `swatchIcon`) | #1263 |

## Magma from the installed one

The studio never bundles the Magma components nor their stylesheets: its pages load them from the
Magma installed where the studio runs ([`ARCHITECTURE.md`](../../docs/ARCHITECTURE.md), "Magma as
an external vendor"), as a render of the MCP server does. `vendor.ts` uses the code of the render
(`projects/mcp/src/render.ts`; "The page a render loads" in
[`CONTRACTS.md`](../../docs/CONTRACTS.md)):

- each page imports the stylesheets of `agents/assets.md` in their layers (`stylesheetImports`),
  sets the folder of the icons for `mds-icon` and loads the lazy loader of the installed magma
  (`loaderOf`), with paths relative to the page: `node_modules/`, `svg/`, `components/`;
- the dev server and `vite preview` serve those three paths from the installed packages (`fileOf`);
- the tags are written after Vite has processed the page, so the build leaves them as they are:
  whoever hosts the built studio serves the same three paths beside it;
- for a host that serves files only, `build.site` writes them as files (`site.ts`, below).

In this repository the installed magma is the build of `stencil`, so `serve` and `build` build it
first (an implicit dependency). A test holds the bundle to the rule: no component and no runtime
of Stencil in `dist/assets`.

What the studio reads of the API of that magma, it reads at build time: `magma-api.ts` takes the
`variant` and the `tone` of each component from its `documentation.json` (as the lint and the MCP
server read it, `readData`) and hands the pages these two props alone, as the virtual module
`virtual:magma-api`, not the megabytes of the documentation. A magma with no documentation gives no
component, and the previews of a colour say that it paints none.

## On GitHub Pages

The studio of `main` is published at <https://magma-design-system.github.io/magma/studio/>,
beside the Storybook (`magma/storybook/`), by the `deploy site` workflow
(`.github/workflows/deploy-site.yml`): a repository has one Pages site, so both are built in the
same run. The docs site links to it; a page links to a page of the studio by its hash, such as
`studio/#/colors/palette` or `studio/#/theme`. Mounting the studio inside a page of the docs site
(#693 "On the site", #695 "Two hosts, one app") is a later step.

Magma says this address to whoever installs it: `studio` at the top of its `documentation.json`
(`STUDIO_URL` of `projects/stencil/scripts/story-titles-lib.ts`, #1294), for the docs site and the
agents of the products; the agent guide of theming links it too. Moving the studio moves the folder of `deploy-site.yml`, the
`og:url` of `index.html` and that constant together: `story-titles-lib.spec.ts` fails on the
first two out of step with the third.

GitHub Pages serves files only, so `nx run studio:build.site` (`site.ts`) writes into
`dist-site/` the build with, beside its pages, the files `fileOf` serves to the dev server:

- `node_modules/`: the stylesheets each page imports and what they load in turn, the fonts of
  `@fontsource` among them, followed from the pages of the build;
- `components/`: the folder of the lazy loader of the installed magma, whole, since the loader
  imports the chunk of each component as it first renders;
- `svg/`: every icon slug of the installed sets (`slugFiles` of `projects/mcp/src/icons.ts`):
  the files of `mdi` and `mgg` as they are, the Material folders under the slugs of their
  variants (`mi/outline/auto-awesome` is `auto_awesome/outline.svg`).

A path a page asks for that the installed packages do not hold stops the site instead of
publishing a 404, and so does an icon set that is not installed. `test/site.test.mts` serves the
site as Pages does, files only and under `magma/studio/`, and opens the studio, the Theme section,
the scene and the groups in Chromium: each loads its icons and fonts, and nothing it asks for is
missing.

There is no API beside the pages on Pages: the site writes `<meta name="magma-studio-api"
content="none">` into them and the studio does not ask `/api/config`. Editing stays in memory, the
draft in the localStorage of the browser, and the work leaves by its downloads (the zip of the
tokens, the config, the CSS of the themes), as when the studio runs without its command.

### Covers

How the studio shows in a tab and on other sites, as the docs site does for itself
(magma-design-system/docs, `agents/architecture.md`, "Covers"):

- **Favicons.** `favicons.ts`, a plugin of Vite, draws them with `sharp` from the Magma mark of
  `identity`, the one of the bar: the SVG for the tabs (white on a dark scheme), the ICO for the
  browsers without SVG favicons, the touch icon of iOS on white, the icons and the manifest of
  Android. It serves them under `favicons/` to the dev server, writes them there into the build
  and links them from the studio, relative to the page; the pages of the frames have none.
- **The preview of a link.** `index.html` holds the Open Graph tags LinkedIn, chats and Twitter
  read: the title, the description (the same as the `description` of the page), the address of
  the studio on Pages and its cover, both absolute, as those sites ask.
- **The cover.** `public/covers/og-1200x630.png`, the `og:image`, copied by the build as it is,
  so its address never changes: `<use>-<width>x<height>.png`, as the covers of the docs site.
  `nx run studio:cover` (`cover.ts`) takes it again from the built studio in the Playwright
  Chromium, at 1200 by 630 with the motion reduced: the Palette on the primary colour by default,
  or another recipe (`npx tsx cover.ts theme-light /tmp/cover.png` in `projects/studio`). Take it
  again when the studio changes the way it looks, before a link to it is shared.

A site caches the preview of an address the first time it reads it: after a new cover, ask it to
read the page again (LinkedIn: the Post Inspector) before sharing. `test/share.test.mts` holds the
favicons to the sizes each host asks for and the tags to the cover the build holds.

## The contrast gate

The studio runs the APCA contrast gate of design-tokens in the browser, on the configuration being
edited, at every edit (#698, `src/gate.ts`): the pairs `nx run design-tokens:contrast` measures,
with its targets and its baseline, through its own engine (`contrast-gate.ts`, driven by
`semantic.config.ts`), so the studio and the CI judge a pair the same way: every text role on every
surface (Lc 75 / 75 / 45 / 30), the on-emphasis text of each hue on its fill and the states of the
fill (Lc 75 in light, 70 in dark), the text of the hues and of the neutral band on their washes,
and the pairs the gate only reports (coloured text on the surfaces, the borders).

What differs is which themes. The CI judges the themes Magma ships (`semantic.themes`); the studio
judges the themes of the configuration it edits, as the Themes page defines and exports them
(`configThemes` of `src/scene-css.ts`, the list the select of the Theme section offers): the base
theme is the base layer of the gate, every other one a theme of the gate with its family, its ramp
and the accents it repoints, keyed `<theme>:<pair>` as the CLI keys it, so the baseline accepts
the same offenders. An accent the base theme repoints reaches the themes that leave it alone, as
`:root` does in the CSS the page exports. On the configuration Magma builds with the studio
measures the base and `editorial` exactly as the CLI does (`test/gate.test.mts` holds it).

Every pair is measured in both modes, and judged in the modes its theme is used in: a theme of one
mode (#1274) is never painted in the other, since `mds-pref-theme` locks it, so its pairs there say
"not offered" and fail nothing.

The verdict is in view while the configuration is edited: beside the title of every page of
Colors (the status of the page-header block), as a count on the Colors button of the bar, which
stays in view wherever the page scrolls (`mds-notification`), at the head of the Colors menu, and
per mode on each card of the Themes page. The **Contrast check** page lists every pair of every
theme, the two modes side by side with the sample of the two colours, the measure and its badge,
one table per category of the gate; a switch keeps only the pairs below their target. The badges
read as the previews of Semantic surface: `error` fails the build, `warning` is under a target the
gate only reports, `info` is accepted by the baseline, a decorative border has no floor.

A configuration that fails the gate is handed out only by choice, never by default: while it
fails, every way out of the studio (the downloads, Build tokens on disk, Save, Copy JSON, Copy
CSS of the Themes page, Export selection of a batch) opens a dialog first. Its question counts the
pairs below target, its text names the action and the consequence and lists the first pairs, with
a link to the Contrast check page; Cancel and Esc never export, and the action repeats its verb
("Download anyway"), as `confirm-action` (`ask-first-many`) asks. The draft the studio keeps in the
browser is no export: it is saved whatever the verdict.

## Architecture

The studio runs the engine of `design-tokens` in the browser: it imports its sources (Vite turns
the `.mjs` specifiers of the `.mts` files into the sources, and replaces `chalk` with a stub) and
generates the palette, the surfaces and the themes on every edit. Nothing it shows is computed by
a copy: the default balances are the `theme` block of `.magma-design-tokensrc.json`, the floors
of the text roles those of the contrast gate, its verdict the pairs of `gatePairs` on the themes of
the configuration judged against the baseline of design-tokens, and the export of a theme is
printed by the code that writes `themes.css`.

```mermaid
flowchart LR
  DT["design-tokens<br/>src/lib, semantic.model.ts, .magma-design-tokensrc.json"]
  MCP["mcp<br/>src/render.ts"]
  WC["stencil<br/>dist/magma-components"]
  ID["identity<br/>logo-magma.svg"]
  subgraph stu["studio<br/>an app, not on npm"]
    SHELL["src/shell.tsx, src/routes.ts, src/start.tsx<br/>the bar, Start, Colors, Theme, Behavior"]
    APP["src/app.tsx<br/>the pages of Colors"]
    SURF["src/surfaces.tsx, src/themes.tsx<br/>balances, themes, names"]
    GATE["src/gate.ts, src/contrast.tsx<br/>the contrast gate, Contrast check"]
    OUT["src/formats.ts, src/batch.tsx<br/>zip, DTCG, CSS, GIMP, config"]
    VEN["vendor.ts<br/>serves Magma to the pages"]
    API["magma-api.ts<br/>the variant and tone of each component"]
    SITE["site.ts<br/>the static site, dist-site/"]
    SCENE["scene.html, states.html, hero.html<br/>the pages the frames show"]
    SHELL --> APP
    SHELL --> SCENE
    SHELL --> GATE
    APP --> SURF
    APP --> GATE
    APP --> OUT
    SURF --> GATE
    API --> APP
  end
  DT -->|"createColorTokens, themeOf, namedThemeCss"| APP
  DT -->|"gatePairs, applyBaseline, contrast-baseline.json"| GATE
  MCP -->|"stylesheetImports, loaderOf, fileOf"| VEN
  MCP -->|"fileOf, loaderOf, slugFiles"| SITE
  WC -->|"the lazy loader"| VEN
  WC -->|"documentation.json"| API
  WC -->|"the lazy loader"| SITE
  ID -->|"the logo of the bar"| SHELL
  VEN -.->|"node_modules/, svg/, components/"| SHELL
  SITE -.->|"deploy-site.yml"| PAGES(["GitHub Pages<br/>magma/studio/"])
  OUT -.->|"download"| AUTHOR(["the author of a theme"])
  class DT,APP,SURF,GATE,OUT,SHELL,VEN,API,SITE,SCENE visual
  class MCP ai
  class WC components
  class ID assets
  class AUTHOR,PAGES outside
  class stu area
  classDef ai fill:#efe5ff,stroke:#8250df,color:#3e1f79
  classDef assets fill:#fff1d6,stroke:#bf8700,color:#5c3d00
  classDef visual fill:#dcf5ec,stroke:#1a7f64,color:#0b4a3a
  classDef components fill:#ddf0ff,stroke:#0969da,color:#0a3069
  classDef tooling fill:#eceff3,stroke:#57606a,color:#24292f
  classDef outside fill:#ffffff,stroke:#8c959f,color:#24292f
  classDef area fill:none,stroke:#8c959f
```

Rectangles: this repository; rounded boxes: outside it. Solid arrows: inside the repository;
dashed: where the package is installed. Labels: the file, export or command that crosses.
Colours: purple ai, amber assets, teal visual, blue components, grey tooling, white outside
([convention](../../docs/ARCHITECTURE.md#diagrams-of-the-projects)).

The engine, `semantic.config.ts` and the theme files stay in `design-tokens`: the builds of
`design-tokens` and `styles` read them, and moving them here would make `design-tokens` depend on
the studio.

## The pages of Colors

The studio loads `.magma-design-tokensrc.json` of `design-tokens` and runs the real token
generator in the browser, so every preview matches the build output exactly. Colors has seven
pages: **Palette** (the two-column editor: color list on the left, editing and live light/dark
scale previews with achieved contrast on the right; `neutral` is selected by default when
present; where the detail has the room, the ramps stand upright beside the family and the global
settings, held in view while they scroll, and Ramps / Theme swaps them for the scene, small as a
phone, light or dark, painted with the configuration at every change, in the theme of the family
and with the elements it paints first in the page, below; `src/palette-side.tsx`), **Contrast
scales**, **Semantic surface** (opt families into the surface engine, tune
the surface/border/text levels), **Themes** (each opted family, status aside, as a named theme, with its accent
assignment, its colour modes and the verdict of the contrast gate per mode), **Groups**, **Contrast check** (every pair of the contrast gate, above) and **Diffs**. Selecting a color from the sidebar while in contrast scales
keeps you there, since the scale samples follow the selected color. The list stands beside the
page while the page keeps the room of the row of actions of its head (41.75rem of the layout);
narrower, on a phone, it goes above the page, folded into a bar with the family selected and an
arrow: the bar opens the list in place of the page, and choosing a family folds it again
(`src/palette.css`, #1311). On Semantic surface the head of the page (`pageTop` of the App)
starts the first column of the page with its text, so the opt-in of the surfaces stands beside it
where the page is wide: from 64rem the lead beside the two cards, one over the other; from 90rem
three columns, the lead, Surface groups and Surface families, so the levels and the preview are in
view before the page scrolls (`src/surfaces.css`). Under 30.25rem of the page each role of the
levels stands over its two sliders instead of beside them.

The **diff** view compares the current palette against the one generated from the committed
configuration (the bundled `.magma-design-tokensrc.json`): it lists the colors whose steps
changed - outlining each changed step and badging the color with the largest perceptual distance
(deltaE) - plus any colors added or removed. The generated token files under
`design-tokens/tokens/color/generated/` are build artifacts and not committed, so the committed
config is the baseline.

The studio works with any configuration, not just the repo one. The **Config** menu of the bar,
open from any section, brings one in and takes it out; the badge of each action names the format:

- **Import config** (json) - opens a `.magma-design-tokensrc.json` from disk; an error shows on
  the pages of Colors, which the import opens;
- **Copy JSON** - copies the edited configuration to the clipboard (the menu stays open to say
  Copied!);
- **Download all tokens** (misc) - the configuration, the generated JSON tokens (whole palette +
  one file per export group) and the CSS and GIMP renders, mirroring the `dist` layout of
  `design-tokens`;
- **Download config** (json) - just the `.magma-design-tokensrc.json`;
- **Download Figma tokens** (DTCG) - the color palette in the W3C DTCG format, one file per theme
  mode, zipped together (the "Figma export" of the `design-tokens` README);
- **Download CSS tokens** (css) - `colors-hex.css` / `colors-rgb.css` for the whole palette plus
  one pair per export group;
- **Download GIMP palette** (gpl) - `colors.gpl` for the whole palette plus one `.gpl` per export
  group.

The dialog of the contrast gate opens over the whole studio (on `document.body`), so an export
from Start, Theme or Behavior asks as one from Colors does.

CSS and GIMP respect export diversification: they emit the whole palette and one file per export
group. When that yields more than one file the download is a zip (`magma-css.zip`,
`magma-gimp.zip`); a single file downloads directly. The outputs are produced in the browser from
the same Handlebars templates the build uses, so they match the CLI output. Editing is in-memory
only: nothing touches the repo files.

The **Themes** page exports the CSS of every theme it shows: the `data-theme-name` block of each
theme, under its name, drawn from its family, with its reassigned accents and its own contrast
blocks, printed by `namedThemeCss` of `design-tokens/semantic.model.ts`, the function that writes
`themes.css`: the block of `editorial` is the one `themes.css` ships. A theme of one mode
declares it first in its block (`--magma-color-modes`, read by `mds-pref-theme`); the base theme
declares it under its own name too, since a lock in `:root` would reach every theme. The page
lists the themes one under the other, each a row of three columns where the page has room (its
settings, its light mode, its dark mode), a single column on a phone. Under each mode, **Test in
light** and **Test in dark** open the Theme section on that theme in that mode; a mode the theme
does not offer, or a name the Theme section refuses, has none. The CSS of the export stays closed
under its header until it is opened, and **Copy CSS** takes it closed too.

A reload keeps the work: the studio mirrors it to the browser's localStorage as a draft, stamped
with the configuration it was made on (the bundled one, or the file a server serves). When that
configuration changed after the draft was saved (edited, removed, or another file), a draft with
no edits of its own gives way to it, and a draft with edits shows why and asks: **Use the file on
disk** (or **Use the bundled config**) or **Keep the draft**. Saving stays off until you pick, so
the draft cannot overwrite the newer file by mistake.

Served by a command that answers `GET` / `PUT /api/config` and `POST /api/build` (the `ui` command
of `design-tokens` did it until version 16; the command of the studio comes with #695), the
studio loads the configuration on disk, adds **Save** to the head of the pages of Colors and
**Build tokens on disk** to the Config menu. Run on its own, the API is absent and editing stays in memory.

New colors are created from a dialog: pick the value and the name auto-completes underneath from
the "Name That Color" vocabulary (via [color-namer](https://github.com/colorjs/color-namer), ~1500
names, kebab-cased: e.g. `persian-green`); choose the token group, confirm, and the studio lands
on the new color already selected. Names are made unique with a numeric suffix when needed.
Auto-naming keeps following the picker in the editor too, but only for names assigned by the
studio itself: a name typed by the user, or any name coming from a loaded configuration, is never
touched. Picking a value already used by another color raises a warning.

The **groups** view manages `ratios`, `formula` and `export` per token group (writing the
`groups` section of the configuration), with a compact preview of every member color; colors
overriding the group individually are flagged. The per-color fields in the editor default to
inheriting from the group.

A *group selected* toggle lifts the ticked colors into a dedicated **Selected** section at the
top, lining their scales up next to each other for quick comparison; the rest stay in their group
cards below. Nothing is hidden, only reorganized.

It also supports batch export editing across groups: tick colors (or pick an existing export from
*select by export* to load every color that uses it) and open **batch export**. The dialog
previews the picked colors, lets you untick any to drop them, and then either saves an export
value onto the selection or downloads a zip of just that selection's tokens.

The **contrast scales** view manages the ratio scales of the configuration: add, duplicate,
rename or delete custom scales (the built-in ones, `default` first of all, are always available)
and inspect the distribution of the stops on a horizontal axis. A usage panel at the top picks a
scale and lists every color resolving to it, ordered by group; clicking a color makes it the
sample for all the scale previews. Each scale has a distribution mode: pick an easing (`linear`,
or a family from `sine` to `circ` as `-in`, `-out` or `-in-out`: the named easings of the engine,
`easing.mts`, which the hue shift ramps with too) and the stops regenerate live from steps/min/max, or go
`manual` by dragging a marker or editing a stop directly; picked from `manual`, an easing starts
from the stops on screen. **Reset**, beside the distribution, takes a scale back to the steps of
the configuration last loaded, on `manual`: the one the studio opened with (the bundled one, or
the file a command serves), the one imported from the Config menu, or the one the Reset of the
page brings back; a save loads nothing. It is off when the scale holds those steps already, and on
a scale that configuration did not have; the draft keeps what was loaded over a reload (#1330).
Scale values are contrast against the theme background (0 = on the background, max = strongest contrast), so the same scale yields
dark-on-light in light mode and light-on-dark in dark mode. Every color picks its scale with the
`ratios` field in the editor.

Beside each card, where the page has the room (60rem, as the side of the Palette), the sample
colour solved on the scale paints the components it paints in a page of their own (`states.html`,
`src/states.ts`): the action and the message of its variant, `mds-button` at every tone and in
every state (at rest, hovered, pressed with `active`, selected with `current`, disabled) and
`mds-banner` at every tone; a variant neither takes, a label, shows `mds-badge` and `mds-label`.
The tones are those the documentation gives each component, in the order of
`docs/agents/variants.md`. No prop gives the hover: the page copies the `:hover` rules of the
component's own shadow sheet under an attribute (`forceHover`), so the hover is the component's.
One mode at a time, chosen once over the cards; narrower, the states go under the card. An alias
takes the ramp of its source whatever its scale, so it shows none and names its source.

### What a colour paints

The previews of a colour, the scene beside the Palette and the states beside a contrast scale,
show the components a change of the family moves (#1308, `src/paints.ts`), each link read where
it is decided:

| Link | Source |
| --- | --- |
| a component paints with a colour through its `variant`, the values it takes and its default | `documentation.json` of the installed magma (`magma-api.ts`) |
| which values of a `variant` are colours, and of which kind: accent, status, neutral, label, identity; a `variant` that takes anything else is no colour (`mds-text` has one of typography) | the tables of the section Variants of `docs/agents/variants.md` |
| a status and a label paint with their own family: `status.error` is the `error` variant, `label.red` the `red` one | "Paints with" of the same guide, the mapping of `docs/agents/color.md` |
| `primary` and `secondary` paint with the family the theme points the accent role at, `ai` with the one of the `ai` role; secondary renders exactly like primary | the same guide; `accents` of `semantic.config.ts`, repointed by a theme file or on the Themes page (`accentOfTheme`) |
| the family a theme is drawn from paints its neutral scaffolding, the surfaces of the whole page and the `dark` and `light` variants | `docs/agents/color.md`, `data-theme-name` retints the neutral scaffolding |
| an alias paints what its source paints: `variant.primary` is `brand.maggioli`, `variant.ai` is `label.violet` | the alias re-exports the resolved ramp of its source (`color.mts`) |

The theme a family is seen in is the one drawn from it, else the first whose accents point at it
(`variant.secondary` is seen in `editorial`), else the base. The scene puts first, at full
colour, the cards that hold an element of the family and, in each card, the row that holds it,
the element staying where it is in its row (`markPainted` of `src/frame.ts`, the rules under
`data-studio-paints` in `scene.html`); the surfaces of a theme are the whole page, and nothing
moves. A line over the scene says what the family paints. A family that reaches none of these
(`brand.rnd`) says so where the scene or the states would be, instead of a page that would not
move. The scene carries every label colour, so each label family has an element to show.

What this does not see: a component that paints with the accent with no `variant` of its own
(the switch, the tab, the stepper) is not counted, its colour being no choice of the product.
