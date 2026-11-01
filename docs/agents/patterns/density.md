---
# A domain of Foundation, the design language (#1189): the format and the commands are in
# docs/PATTERNS.md, "A domain of Foundation". The check says what is still missing:
# nx run stencil:check.patterns (after nx run stencil:build).
id: density
kind: foundation
title: Density
layer: magma
status: decided
need: >-
  Fit more or less on a screen without changing how its parts relate: more for a product that
  shows a lot at once, less for a person who needs more room to point.
principle: >-
  A density is one factor on every unit: the spaces, the controls and the markers shrink or grow
  together, and the type stays as it is.
keywords: [density, compact, standard, comfortable, dense, roomy, unit, target size, data grid density]
assumptions:
  - "The spaces, the controls and the markers are measured in the three units of the dimension axis of the themes (#691): container, control, marker."
  - "The type is not part of a density: a person who needs larger text enlarges the text."
components: []
related: [rhythm]
validated-on: []

variables:
  level:
    values: [compact, standard, comfortable]
    means: "The density in force where the element stands, as the theme of the product, a region of the page or the person chose it (scope, region)."

cases:
  - id: compact
    level: compact
    where: "every unit at 3px, the factor 3/4: between fields 450, a button (size md) 675 high, an input (size lg) 1050, a checkbox 450; until the units ship (#691) no product has it, and nothing writes it by hand"
    serves: flexible
    carried-by-planned: [--magma-unit-container, --magma-unit-control, --magma-unit-marker, mds-pref-density]
  - id: standard
    level: standard
    where: "every unit at 4px, the default: between fields 600, a button (size md) 900 high, an input (size lg) 1200, a checkbox 600; the values of today"
    serves: flexible
    carried-by-planned: [--magma-unit-container, --magma-unit-control, --magma-unit-marker]
  - id: comfortable
    level: comfortable
    where: "every unit at 5px, the factor 5/4: between fields 750, a button (size md) 1125 high, an input (size lg) 1350, a checkbox 750; the level where the default button reaches 1100, the target of WCAG 2.5.5 (AAA); until the units ship (#691) no product has it"
    serves: [inclusive, flexible]
    carried-by-planned: [--magma-unit-container, --magma-unit-control, --magma-unit-marker, mds-pref-density]

gaps: []
not-applicable: []

always-true:
  - id: scale
    rule: "A density shrinks or grows every relation of the rhythm by one factor, so the proportions stay those of the standard density and rhythm/step-ratio holds at every level: never one step down per relation, never a table of its own."
    serves: [intuitive, flexible]
    checked-by: review
  - id: controls
    rule: "The controls (buttons, fields) follow the factor of the rhythm. A field is one line of text plus its padding, and only the padding follows: the text keeps its size."
    serves: [intuitive, flexible]
    checked-by: review
  - id: markers
    rule: "The markers (a checkbox, a switch, a badge, the space between a marker and its label) follow the same factor, with no exception; a marker stays centred on the first line of its label at every level."
    serves: [inclusive, intuitive]
    checked-by: review
  - id: unit
    rule: "The rhythm is measured in the container unit: each --magma-rhythm-<id> is that unit times its step (300 = 3 units). The unit is a literal, so a product that changes --spacing does not move the rhythm. Wherever a density applies, the rhythm tokens are declared again next to the units: a custom property resolves where it is declared."
    serves: flexible
    checked-by: review
  - id: levels
    rule: "Three levels, with symmetric units: compact (3px), standard (4px, the default), comfortable (5px). No other level; the names are not sm, md and lg, which belong to the size of a component."
    serves: [inclusive, flexible]
    checked-by: review
  - id: scope
    rule: "Three layers choose the density, in the order system < theme < person: the theme of the product for all of it, a region for a part of the page (data-density on any element), the person with mds-pref-density (pref-density-<level> on html)."
    serves: [inclusive, flexible]
    checked-by: review
  - id: region
    rule: "An explicit choice of the person wins over the regions: mds-pref-density takes auto (the default, the density of the product with its regions), compact, standard or comfortable, and a level the person chose applies everywhere, a compact region included."
    serves: inclusive
    checked-by: review
  - id: dense-targets
    rule: "At compact a checkbox is 450, under the 600 of WCAG 2.5.8: it passes by the spacing exception while the centres of two neighbouring checkboxes stand at least 600 apart. A list or a table that selects its rows with bare checkboxes keeps its rows at least 600 high."
    serves: inclusive
    checked-by: review

open-choices:
  - { id: product-density, default: "standard", may: "set compact or comfortable for the whole product in its theme" }
  - { id: region-density, default: "the density of the product", may: "mark a part of the page (a dense table, a side bar) with data-density" }

situations:
  - { situation: "A management application whose people work through long tables all day", case: compact, note: "the theme of the product, or data-density on the table only" }
  - { situation: "A form of a public service a citizen fills in once", case: standard }
  - { situation: "A person who points with difficulty chooses more room in the preferences", case: comfortable, note: "it applies everywhere, the compact regions included (region)" }
---

# Density

**A density is one factor on every unit: the spaces, the controls and the markers shrink or grow together, and the type stays as it is.**

## When to use it

When a product, a part of a page or a person needs more or less on the screen: a management
application whose people scan long tables all day, a dense table inside an ordinary page, a
person who points with difficulty and needs larger targets. Density settles what changes and
who chooses it; the relations themselves are the domain of the rhythm, which a density scales
and never redefines.

Not here: the size of one component (`size`, a choice of the composition, not of the
density), and the size of the text, which a density never touches.

## What decides it

One question: which level is in force where the element stands. The product sets it in its
theme, a region of the page may set its own, and the person may override both from the
preferences. The level gives the unit; everything measured in the units follows by itself.

## Cases

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

| Variable | Values | Means |
| --- | --- | --- |
| `level` | `compact`, `standard`, `comfortable` | The density in force where the element stands, as the theme of the product, a region of the page or the person chose it (scope, region). |

A case that leaves a variable out holds for any of its values.

| Case | When | Where | Use | Serves | Carried by |
| --- | --- | --- | --- | --- | --- |
| `compact` | level: compact | every unit at 3px, the factor 3/4: between fields 450, a button (size md) 675 high, an input (size lg) 1050, a checkbox 450; until the units ship (#691) no product has it, and nothing writes it by hand |  | flexible | planned: --magma-unit-container, --magma-unit-control, --magma-unit-marker, mds-pref-density |
| `standard` | level: standard | every unit at 4px, the default: between fields 600, a button (size md) 900 high, an input (size lg) 1200, a checkbox 600; the values of today |  | flexible | planned: --magma-unit-container, --magma-unit-control, --magma-unit-marker |
| `comfortable` | level: comfortable | every unit at 5px, the factor 5/4: between fields 750, a button (size md) 1125 high, an input (size lg) 1350, a checkbox 750; the level where the default button reaches 1100, the target of WCAG 2.5.5 (AAA); until the units ship (#691) no product has it |  | inclusive, flexible | planned: --magma-unit-container, --magma-unit-control, --magma-unit-marker, mds-pref-density |

No gaps: every combination has a case or is not applicable.

## Parts

The three levels, as measured on the built components (`standard`) and in the live
comparisons (the other two):

| | `compact` | `standard` | `comfortable` |
| --- | --- | --- | --- |
| Unit | 3px | 4px | 5px |
| Factor | 3/4 | 1 | 5/4 |
| `rhythm/inline`, `title-content`, `label-control` | 225 | 300 | 375 |
| `rhythm/between-containers` | 300 | 400 | 500 |
| `rhythm/between-fields`, `rhythm/inset` | 450 | 600 | 750 |
| `rhythm/between-groups` | 750 | 1000 | 1250 |
| `rhythm/between-sections` | 1200 | 1600 | 2000 |
| `mds-button` (size `md`), height | 675 | 900 | 1125 |
| `mds-input` (size `lg`), height | 1050 | 1200 | 1350 |
| Checkbox icon | 450 | 600 | 750 |
| Switch (size `md`), height x width | 600 x 1050 | 800 x 1400 | 1000 x 1750 |
| Badge padding, block / inline | 75 / 150 | 100 / 200 | 125 / 250 |
| Between a marker and its label | 150 | 200 | 250 |

The steps of `compact` and `comfortable` are not steps of the sizing scale (225, 450, 750):
that is expected, a space is measured in the unit of its density (`rhythm/ladder-only`).

Who chooses, and how:

| Layer | Who | How |
| --- | --- | --- |
| Theme | the product, for all of it | a named theme sets the three units in its block |
| Region | the product, for a part of the page | `data-density="compact"`, `"standard"` or `"comfortable"` on any element |
| Preference | the person, for themself | mds-pref-density, next to the other `mds-pref-*`, publishes `pref-density-<level>` on `html`; `auto` keeps the product's density |

## Always true

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

These hold in every product: a product layer cannot change them.

| Id | Rule | Serves | Carried by | Checked by |
| --- | --- | --- | --- | --- |
| `scale` | A density shrinks or grows every relation of the rhythm by one factor, so the proportions stay those of the standard density and rhythm/step-ratio holds at every level: never one step down per relation, never a table of its own. | intuitive, flexible | the guide | review |
| `controls` | The controls (buttons, fields) follow the factor of the rhythm. A field is one line of text plus its padding, and only the padding follows: the text keeps its size. | intuitive, flexible | the guide | review |
| `markers` | The markers (a checkbox, a switch, a badge, the space between a marker and its label) follow the same factor, with no exception; a marker stays centred on the first line of its label at every level. | inclusive, intuitive | the guide | review |
| `unit` | The rhythm is measured in the container unit: each --magma-rhythm-<id> is that unit times its step (300 = 3 units). The unit is a literal, so a product that changes --spacing does not move the rhythm. Wherever a density applies, the rhythm tokens are declared again next to the units: a custom property resolves where it is declared. | flexible | the guide | review |
| `levels` | Three levels, with symmetric units: compact (3px), standard (4px, the default), comfortable (5px). No other level; the names are not sm, md and lg, which belong to the size of a component. | inclusive, flexible | the guide | review |
| `scope` | Three layers choose the density, in the order system < theme < person: the theme of the product for all of it, a region for a part of the page (data-density on any element), the person with mds-pref-density (pref-density-<level> on html). | inclusive, flexible | the guide | review |
| `region` | An explicit choice of the person wins over the regions: mds-pref-density takes auto (the default, the density of the product with its regions), compact, standard or comfortable, and a level the person chose applies everywhere, a compact region included. | inclusive | the guide | review |
| `dense-targets` | At compact a checkbox is 450, under the 600 of WCAG 2.5.8: it passes by the spacing exception while the centres of two neighbouring checkboxes stand at least 600 apart. A list or a table that selects its rows with bare checkboxes keeps its rows at least 600 high. | inclusive | the guide | review |

## Open choices

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

The default decides these; a product layer may narrow them.

| Id | Default | A product may |
| --- | --- | --- |
| `product-density` | standard | set compact or comfortable for the whole product in its theme |
| `region-density` | the density of the product | mark a part of the page (a dense table, a side bar) with data-density |

## Situations

<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->

Situations every application has, each with its case: they give the examples, the texts and the keywords. The situations of a product's own domain go in its layer.

| Situation | Case |
| --- | --- |
| A management application whose people work through long tables all day | `compact`: the theme of the product, or data-density on the table only |
| A form of a public service a citizen fills in once | `standard` |
| A person who points with difficulty chooses more room in the preferences | `comfortable`: it applies everywhere, the compact regions included (region) |

## Accessibility

- `comfortable` exists for the people who point with difficulty: the default button reaches
  1100, the target of WCAG 2.5.5 (AAA), and the smallest targets of the screen grow with it.
- The choice of the person wins over the product (`region`): a compact table becomes
  comfortable for whoever asked for room.
- At `compact` the checkbox is under the 600 of WCAG 2.5.8 and passes by its spacing
  exception (`dense-targets`): in a compact form two checkboxes stand 1050 apart (a line of
  label plus 450).

## Magma gaps

- The units are not in Magma yet: --magma-unit-container, --magma-unit-control and
  --magma-unit-marker, the rhythm tokens written as multiples of the container unit, the
  levels on `:root`, `[data-density]` and `:root.pref-density-<level> [data-density]`, and
  mds-pref-density (#691). Until they ship every product is `standard`, and a denser screen
  is not written by hand: no private variable of a component, no other step of the rhythm.
- The components measure their own sizes in pixels or in steps of `--spacing`: the icon of the
  checkbox, the knob and the padding of the switch, the padding of the badge, the padding of
  the controls become multiples of their unit (#691).

## Decisions

| Date | Decision | Why |
| --- | --- | --- |
| 2026-10-30 | A denser screen shrinks every relation of the rhythm by one factor, 3/4 for the compact density (`scale`). | The proportions stay identical, so the relations read the same at every density and `rhythm/step-ratio` holds with nothing to maintain; a further density is one more factor, not one more table, the mechanism #691 drafts for the components. Rejected: one step down for each relation (200, 300, 400, 600, 1000), whose proportions change from one relation to the next. Chosen live. https://github.com/magma-design-system/magma/issues/1189#issuecomment-6518870918 |
| 2026-10-30 | The controls shrink by the same factor as the rhythm (`controls`). | The dense screen is the same screen in proportion, one number for the rhythm and the controls; the compact button (675) lands next to `size="sm"` (700) and stays above 600, the minimum target of WCAG 2.5.8. Rejected: 7/8 for the controls (two numbers for one density); the controls left as they are (the fields dominate and the density gains little). Chosen live. https://github.com/magma-design-system/magma/issues/1189#issuecomment-6518991256 |
| 2026-10-30 | The rhythm is measured in the container unit of #691; a density is one factor on every unit (`unit`). | The container unit is already the room a container leaves around its content, which is `rhythm/inset`; the groups of #691 are roles of the components, and the rhythm is not one. Rejected: a unit of its own for the rhythm, which would let a theme widen the cards without widening the spaces between the fields, a case nobody has. https://github.com/magma-design-system/magma/issues/1189#issuecomment-6519103714 |
| 2026-10-30 | Three layers choose the density: the theme, the preference of the person (mds-pref-density), a region (`data-density`), in the order system < theme < person (`scope`). | Each layer reuses a mechanism Magma has (the named themes, `mds-pref-contrast`, `data-corner-shape`), and the units are inherited custom properties, so the components follow without being wired one by one. Rejected: the theme alone; theme and region with no preference; theme and preference with no region. https://github.com/magma-design-system/magma/issues/1189#issuecomment-6519166303 |
| 2026-10-30 | Three levels with symmetric units: `compact` 3px, `standard` 4px, `comfortable` 5px (`levels`). | `comfortable` has a reason of its own, the default button at 1100, the target of WCAG 2.5.5; the names are those of the `density` of MUI DataGrid, not the `sm`/`md`/`lg` of the size of a component. Rejected: `comfortable` at 4.5px, whose button stays under the AAA target; two levels, where a preference could only tighten. https://github.com/magma-design-system/magma/issues/1189#issuecomment-6519246975 |
| 2026-10-30 | An explicit choice of the person wins over the regions: mds-pref-density is `auto` by default, and a level the person chose applies to the regions too (`region`). | The precedence system < theme < person carried through: a region is a decision of the product, as the theme is. Who chose `comfortable` because pointing is hard gets it where the targets are densest. Rejected: the region wins inside itself, the choice of the person included. https://github.com/magma-design-system/magma/issues/1189#issuecomment-6519287396 |
| 2026-10-30 | The markers follow the density like the rhythm and the controls (`markers`); at `compact` the checkbox passes WCAG 2.5.8 by its spacing exception, and a list that selects its rows with bare checkboxes keeps its rows at least 600 high (`dense-targets`). | One factor on every unit, with no exception: the switch stays lower than the button at every level, and at `comfortable` the smallest targets grow too, the reason that level exists. Rejected: the markers unchanged at every density, where the compact switch stands taller than the button and the density has two rules. Chosen live. https://github.com/magma-design-system/magma/issues/1189#issuecomment-6519554134 |
| 2026-10-31 | The file of the domain, with the levels as its cases, each carried by the units of #691 once they ship, and the rest as always-true rules; `product-density` and `region-density` are the open choices of a product layer. | The format of #1196 and the issue of the five domains (#1197); #1189 names density as the first open choice of a product layer. |
