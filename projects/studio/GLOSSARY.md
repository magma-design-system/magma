# Glossary of the studio

The words of the studio (`projects/studio`) as decisions: the interface, its docs and its code
name each thing as this register does. Written with `v2:taxonomy` on 2026-11-20, from the object
model of the studio ([`studio.object-model.md`](studio.object-model.md)) and the words agreed on
2026-11-10. The format is the taxonomy register of the v2 plugin: the ID never changes, a rename
changes the names, a split keeps the old row pointing at the new ones. Marks: (person) decided
by the maintainer who balances Magma; (project: file) read from the repository; (proposed) an
inference or an edge with no source yet. `config` is
`projects/design-tokens/.magma-design-tokensrc.json`, `semantic` is
`projects/design-tokens/semantic.config.ts` (the Magma 3 branch for the transparent roles).

The studio speaks to the person with "tu", as the Italian of Magma does (README, "Languages").

## Decisions (person, 2026-11-20)

| # | Conflict | Move | What changes where |
| --- | --- | --- | --- |
| 1 | "eccezione" (IT): function background vs baseline pair | rename, Italian only: the baseline pair is **coppia accettata** | register; `projects/studio/src/i18n-it*.ts` ("eccezione nota"); README |
| 2 | "stato" (IT): component state vs status families | rename, Italian only: the families are **colori di feedback**; alias `status` (public `--status-*` tokens) | register; i18n-it ("Famiglie di stato", "Stato, mai un tema.") |
| 3 | "superficie" / "surface": role vs what lies under an element | rename: **fondo** / **ground**; "superficie" stays the role | register; model |
| 4 | "livello" / "level": Start stages vs L% vs wash levels | rename: **passo** / **stage** for the flow (EN "step" is the ramp step), **luminosità** / **lightness** for L%; **livello** / **level** stays for soft/base/strong only | register; i18n-it (Start text, "Livelli di luminosità"); model |
| 5 | "step" (EN): ramp step vs flow step | solved by 4: the flow step is a **stage** | register |
| 6-7 | "configurazione" and "preset" for one thing; "tema" / "theme" for three | rename: the whole is the **preset** (Magma's, a product's); **tema** / **theme** is the file only; alias `config` and the config key `theme` (public CLI format) | register; i18n (Config menu, "Download config"); model; README |
| 8 | "tone" / "tono": neutral group vs component prop | alias: the group is **neutri** / **neutrals** in the interface; `tone` stays in tokens (public) | register; Palette group label |
| 9a | "pesi" / "bilanciamenti" for one thing | rename: **pesi** / **weights**; "bilanciare" stays the verb | register; i18n ("balances"); model; README |
| 9b | "candidato" / "proposta" for one thing | rename: **candidato** / **candidate** for both | register; model |

## Taxonomy register

| ID | EN | IT | What it is | What it is not | Contained in | Is a | Refers to | In the code |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `preset` | preset | preset | everything a project's colour is compiled from: families, contrast scales, weights, themes; Magma ships one, a product exports its own and installs it (person) | a theme, which is one file inside it | (root) | | | `config` (alias: the file name and `--config` of the design-tokens CLI are public) |
| `family` | family | famiglia | one colour of the palette and its ramp | a group | preset (config `colors[]`) | | contrast-scale (config `colors[].ratios`); family (config `colors[].alias`) | `colors[]`, `name` = `<group>.<name>` |
| `family-group` | group | gruppo | the families of one kind | a family; an export group | preset (config `groups`, the prefix of `colors[].name`) | | | `groups` |
| `neutrals` | neutrals | neutri | the group of neutral families: porcelain, kaolin, neutral, fireclay, bisque (person) | the `tone` of a component | preset (config `colors[].name` `tone.*`) | family-group (config prefix) | | `tone` (alias: `--tone-*` tokens are public) |
| `feedback-colours` | status colours | colori di feedback | info, success, warning, danger: the families that carry the outcome of a message (person) | a component state | preset (config `colors[].name` `status.*`) | family-group (config prefix) | | `status` (alias: `--status-*` tokens are public) |
| `ramp` | ramp | rampa | the ten steps of a family in one mode, ordered by contrast | a contrast scale | family (`createColorTokens`, `color[group][name][mode]`) | | contrast-scale | `tokens.color` |
| `ramp-step` | step | gradino | one of the ten steps of a ramp (01..10), or its seed | a stage | ramp (`color[group][name][mode][step]`) | | | `01`..`10`, `seed` |
| `contrast-scale` | contrast scale | scala di contrasto | the ten contrast targets shared by the families that use it | a ramp | preset (config `ratios`, built-in ones in `src/lib`) | | | `ratios`; `default` and `tint` are one built-in scale |
| `weights` | weights | pesi | how much every neutral element and every transparent role weighs, per mode (person) | the old "balances", the same thing renamed | preset (config `theme`; semantic `transparent`) | | | `theme` (alias: public key of the config format) |
| `role` | role | ruolo | a named use of a colour that components paint with | a ramp step | (root of the contract: `semantic.config.ts`) | | ramp-step or surface it resolves to (semantic) | `--magma-*` |
| `surface` | surface | superficie | a neutral background role by elevation: sunken, muted, default, raised, overlay | a ground | weights (config `theme.surfaces`) | role | tint (`--magma-tint-*`) | `--magma-surface-*` |
| `border` | border | bordo | a border role: muted, default, strong, focus | | weights (config `theme.borders`) | role | tint | `--magma-border-*` |
| `text` | text | testo | a text role: default, muted, subtle, disabled, on-emphasis, generated by a target | | weights (config `theme.text`) | role | target | `--magma-text-*` |
| `lightness` | lightness | luminosità | the OKLCH L% a surface or a border sits at, in one mode (person) | a wash level | surface, border (config `theme.surfaces.<mode>.<role>`) | | | `theme.surfaces`, `theme.borders` |
| `target` | target | obiettivo | the APCA Lc a text role is generated for | a floor | text (config `theme.text`) | | | `theme.text` |
| `wash` | wash | velatura | a background named by how marked it is | a surface; a band | weights (semantic `washLevels`) | role | lightness, at a distance from the page (`WASH_LEVELS` in `src/lib/wash.ts`, generated by `src/lib/state-color.mts`, #1427) | `--magma-wash-*`, `--wash-<family>-*` |
| `wash-level` | level | livello | soft, base, strong and the selected levels soft-selected and selected: how marked a wash is (person) | lightness; a stage | wash (`WASH_LEVELS`) | | | `WASH_LEVELS` keys |
| `band` | band | banda | the transparent background that holds the options you pick from | a wash | weights (semantic `transparent.roles`) | role | ink | `--magma-band` |
| `track` | track | traccia | the transparent track of a quantity | a band | weights (semantic `transparent.roles`) | role | ink | `--magma-track` |
| `wash-intensity` | wash intensity | intensità delle velature | one factor on the alpha of every transparent role | a wash level | weights (semantic `transparent.intensity`) | | | `--magma-wash-intensity` |
| `ink` | ink | inchiostro | the colour a transparent role lays over its ground | | weights (semantic `transparent.ink`) | | text (`text-default`) | `transparent.ink` |
| `theme` | theme | tema | the file a page wears: tint, accents, modes (person) | a preset | preset (`themes/<name>.json`; semantic `themes`) | | family (tint, accents) | `themes/*.json`, `data-theme-name`, `ThemeDef` |
| `ready-theme` | ready theme | tema pronto | a theme Magma ships: business, editorial | a product's theme | preset (`projects/design-tokens/themes/`) | theme | | `business`, `editorial` |
| `tint` | tint | tinta | the family a theme's neutral scaffolding takes | the built-in `tint` contrast scale | theme (`color.tint`) | | family | `color.tint`, `--magma-tint-*` |
| `accent` | accent | accento | the brand role and the AI role, each pointed at a family | | theme (`color.accents`) | role | family | `accents`, `--magma-accent-*` |
| `mode` | mode | modalità | light or dark | | theme (`color.modes`) | condition (proposed) | | `color.modes`, `pref-mode-*` |
| `exception` | exception | eccezione | the colour or background of a function shared by several components that comes neither from the palette nor from a surface: the band of tabs and filters (person) | an accepted pair | preset (proposed: decided once, the same in every theme) | | role (band, track, field...); the components that adopt it | `transparent`, `fieldRoles` (semantic, today) |
| `component-state` | state | stato | rest, hover, active, current, disabled of a component | a status colour | exception (proposed: the grid of its components) | | | `:hover`, `active`, `current`, `disabled` |
| `candidate` | candidate | candidato | a generated, measured alternative, seen one at a time: of an exception, or of a theme from a brand colour (person) | a change | exception, or the start (proposed: one parent per instance) | | | (none yet) |
| `stage` | stage | passo | one step of the balancing flow: colours, weights, themes, exceptions (person) | a ramp step; a wash level | (root of the flow) | | | `src/routes.ts` (today: sections and views) |
| `scene` | scene | scena | the product page a stage is judged on; it changes with the stage (person) | the verification | stage (proposed) | | theme | `scene.html`, `states.html` |
| `condition` | condition | condizione | what the scene is judged under: mode, more contrast, breakpoint, ground (person) | | scene (`applyFrame`, `applyPrefs`) | | | `scene-prefs.tsx` |
| `ground` | ground | fondo | what lies under an element: page, card, well, coloured fill (person) | a surface role | condition (proposed) | | surface (page, card, well) | `TRANSPARENT_SURFACES` (gate, partial) |
| `verification` | contrast check | verifica del contrasto | the one check of the whole preset, every theme and mode, filtered on each stage (person) | the scene | preset (`gate.ts`) | | | `contrast-gate.ts`, `gatePairs` |
| `pair` | pair | coppia | a foreground and a background measured in one mode and theme | | verification (`gatePairs`) | | role (two), theme, mode | `PairResult` |
| `verdict` | verdict | verdetto | the outcome of the verification | | verification | | | `verdict.tsx` |
| `floor` | floor | soglia | the Lc or ratio the verification holds a pair to | a target | verification (`DEFAULT_TARGETS`) | | | `GateTargets` |
| `reported-pair` | reported pair | coppia segnalata | a pair under a target that does not block | an accepted pair | verification | pair (severity `warn`) | | `severity: 'warn'` |
| `accepted-pair` | known offender | coppia accettata | a pair under its floor that the baseline accepts: debt in view (person) | an exception | verification (`contrast-baseline.json`) | pair | | `baseline`, `baselinedFailures` |
| `change` | change | modifica | one edit, compared with the last exit | a candidate | preset (the draft, `draft.ts`) | | | `draft.ts` |
| `exit` | exit | uscita | saving the preset (command) or downloading it (Pages) | | preset | | | `config-menu.tsx`, `formats.ts` |
| `full-review` | full review | giro completo | judging each theme in each mode before the exit, each marked as reviewed (person) | the verification | (root of the flow) | stage (proposed) | verification | (none yet) |
| `hue` | hue | tonalità | the hue of a colour, in OKLCH degrees | a family | family | | | `hueShift` |
| `hue-shift` | hue shift | spostamento di tonalità | the turn of the hue at the dark and light ends of a ramp | the saturation curve | family (config `colors[].hueShift`, or the root) | | | `hueShift` |
| `saturation` | saturation | saturazione | the curve of the saturation across a ramp, global or per family | the hue shift | family (config `colors[].saturation`, or the root) | | | `saturation` |
| `draft` | draft | bozza | the preset being edited, kept in the browser over a reload | an exit | preset (`draft.ts`, localStorage) | | | `draft.ts` |
| `preview` | preview | anteprima | a page of the studio drawn with the preset in a frame: the scene, the groups, the states, the hero | the scene alone | (root of the previews) | | theme | `frame.ts`, `scene.html`, `groups.html`, `states.html`, `hero.html` |
| `rules` | rules | regole | the design language, the patterns and the blocks of Magma, read only; "Regole", not "Comportamento", which does not fit the bar beside the preset at its narrowest width (2026-11-10) | a stage of the balancing | (root; where it goes in the redesign is open) | | | `BehaviorPage` (`src/routes.ts`) |
| `variant` | variant | variante | the colour choice of a component; the `variant.*` families are what those values paint with: one concept, declared homonym | | | | family | `variant` prop, `variant.*` families |

## Hierarchy checked on instances

- `tone.neutral` exists only inside the config (`colors[]`) and vanishes with it: preset contains family.
- `variant.primary` points at `brand.maggioli` and outlives a change of it: family refers to family (alias).
- `editorial` names `bisque` without containing it: theme refers to family.
- `--magma-band` lies on any ground and outlives it: band refers to ink, ground is a condition, not a parent.
- A candidate has one parent per instance (an exception, or the start of a theme from a brand colour): two possible parents for the type, never two at once. Proposed until the studio holds candidates.
- Edges marked (proposed) have no source in the data yet: scene in stage, ground in condition, exception in preset, component-state in exception.

## Retired names and the interface today

balances / bilanciamenti; configuration / configurazione (as a name of the whole); known offender's
Italian "eccezione nota"; "Famiglie di stato"; "Livelli di luminosità"; "livello" for the
Start sections; "proposta"; the page "Semantic surface" / "Superficie semantica" (it becomes the
Weights stage).

Until the redesign of the studio (`studio.object-model.md`) the pages keep the names they have
today: the sections Colors / Colori, Theme / Tema, Behavior / Regole and the menu Config /
Configurazione; "known offender" / "eccezione nota"; "Status families" / "Famiglie di stato";
"Lightness levels" / "Livelli di luminosità"; "Semantic surface" / "Superficie semantica"; the
levels of the Start page. The redesign brings them to the names of this register, decided on
2026-11-20 (person).
